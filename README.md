# CBT Simulador Plantas — Plant Diary

Simulador STEAM de crecimiento de plantas para grupos de estudiantes. Combina un modelo matemático basado en variables termodinámicas (temperatura, humedad, horas de luz) con datos climáticos reales de Tarija vía Open-Meteo, permitiendo comparar predicciones teóricas contra mediciones reales.

---

## Estructura del proyecto (npm workspaces)

```
cbt-simulador-plantas/
├── shared/       @simulador/shared — tipos compartidos frontend ↔ backend + modelo de crecimiento
├── api/          @simulador/api    — NestJS, puerto 4002, Clean Arch + CQRS
└── web/          @simulador/web    — Next.js App Router, puerto 3002
```

Cada workspace tiene su propio `package.json`. La raíz solo administra la instalación conjunta vía npm workspaces.

---

## Arquitectura

### Flujo de datos

```
Browser → GET /api/groups
  → Next.js rewrite → NestJS :4002/api/groups
    → GroupController
      → QueryBus → GetGroupsHandler
        → GroupRepository (interface)
          → GroupRepositoryImpl (Prisma)
            → SQLite
          ← GroupEntity[]
        ← GroupMapper.toResponse(entity)[]
      ← GroupResponse[] (tipo de @simulador/shared)
    ← IApiResponse<GroupResponse[]>
  ← JSON { code, status, data, message }
← apiFetch<GroupResponse[]>('/api/groups') → data
```

### Capas del API (`api/src/`)

| Capa | Directorio | Responsabilidad |
|------|-----------|----------------|
| **Presentación** | `modules/[x]/[x].controller.ts` | HTTP: recibe request, llama CommandBus/QueryBus, devuelve datos crudos |
| **Aplicación** | `modules/[x]/application/` | Commands + Handlers, Queries + Handlers, Mappers |
| **Dominio** | `modules/[x]/domain/` | Entidades (interfaces), repositorios abstractos |
| **Infraestructura** | `modules/[x]/infrastructure/` | Implementaciones Prisma de los repositorios |
| **Común** | `common/` | `TransformInterceptor`, `GlobalExceptionFilter`, `JwtAuthGuard`, `AdminGuard`, `@CurrentUser`, `@ResponseMessage` |

### CQRS (pragmático)

- **Commands** (escritura): DTO + Command class + `@CommandHandler` en un solo archivo.
- **Queries** (lectura): Query class + `@QueryHandler` en un solo archivo.
- Sin event bus, sin event sourcing — solo `CommandBus` y `QueryBus` de `@nestjs/cqrs`.

```ts
// Ejemplo: crear simulación
export class CreateSimulationDto { @IsString() name!: string; ... }
export class CreateSimulationCommand { constructor(public readonly dto: CreateSimulationDto) {} }

@CommandHandler(CreateSimulationCommand)
export class CreateSimulationHandler implements ICommandHandler<CreateSimulationCommand, SimulationResponse> {
  async execute({ dto }) {
    const sim = await this.repo.create(dto)
    return SimulationMapper.toResponse(sim)   // solo el mapper transforma
  }
}
```

### Interceptor y formato estándar de respuesta

Los controllers devuelven datos crudos. El `TransformInterceptor` (registrado como `APP_INTERCEPTOR` en `AppModule`) envuelve automáticamente cada respuesta en `IApiResponse<T>` (definido en `shared/`):

```ts
{ code: number, status: 'success' | 'error', data: T | null, message: string }
```

El `GlobalExceptionFilter` convierte automáticamente cualquier excepción al mismo formato con `status: 'error'`. En el frontend, `apiFetch<T>()` desenvuelve `.data` y lanza en caso de error.

### Paquete shared (`shared/src/`)

Tipos TypeScript + lógica de crecimiento sin dependencias de runtime. Se compila a `dist/` antes que los otros workspaces.

```
shared/src/
  types/
    api-response.ts       IApiResponse<T>
    session.types.ts      PlantasRole, SessionPayload
    group.types.ts        GroupResponse, GroupInput
    member.types.ts       MemberResponse, MemberInput
    simulation.types.ts   SimulationResponse, SimulationInput, SimulationUpdateInput
    entry.types.ts        EntryResponse, EntryInput
    climate.types.ts      ClimateDay, ClimateSummary, ClimateResponse, WeatherDay
    analytics.types.ts    GroupStatResponse
  lib/
    growth.ts             GrowthParams, DayConditions, ProjPoint,
                          calcEffects(), calcDailyGrowth(), calcHeightAtDay(),
                          generateProjectionFromClimate()
```

`SessionPayload` vive en `shared/` — es el único tipo que tanto el API (guards) como el frontend (middleware, edge runtime) necesitan simultáneamente.

**Modelo de crecimiento:** `generateProjectionFromClimate()` recibe los datos reales de Open-Meteo para calcular proyecciones diarias. Si no hay datos de clima para un día, ese punto se marca con `hasData: false` y `height: null`.

### Módulos del API

| Módulo | Controller(s) | Descripción |
|--------|--------------|-------------|
| `auth` | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | JWT cookie `cbt_plants_session` 8h; grupos por código, admins por contraseña bcrypt |
| `group` | `GET/POST/PUT/DELETE /api/groups` | CRUD grupos académicos con código único |
| `member` | `GET/POST/PUT/DELETE /api/members` | Integrantes por grupo |
| `simulation` | `GET/POST/PUT/DELETE /api/simulations` | Escenarios experimentales con parámetros del modelo |
| `entry` | `POST /api/entries` | Mediciones por sesión |
| `climate` | `GET /api/climate?month=&year=` | Proxy Open-Meteo para Tarija: temperatura, humedad, horas de luz |
| `analytics` | `GET /api/analytics` | Estadísticas agregadas por grupo (admin) |
| `backup` | `GET /api/backup` | Descarga JSON completo de la BD (admin) |

Auth: grupos se autentican con código de 6 chars; admins con `code=admin` + password. `AdminGuard` protege analytics y backup. Se usa `jose` (edge-compatible, no `@nestjs/jwt`).

### Frontend (`web/src/`) — Feature-Sliced Design (FSD)

```
lib/           (utilidades sin estado — apiFetch, verifyToken, utils)
    ↓
services/      (llamadas HTTP por dominio — groupsService, simulationsService…)
    ↓
components/    (primitivos UI reutilizables)
    ↓
features/      (secciones de UI por dominio — admin/, grupo/, simulation/)
    ↓
app/           (páginas Next.js — orquestadores delgados de estado y layout)
```

| Capa | Directorio | Responsabilidad |
|------|-----------|----------------|
| **lib** | `src/lib/` | `apiFetch<T>()` (desenvuelve `IApiResponse`), `verifyToken` (JWT edge-safe con `jose`), helpers de fecha y formato |
| **services** | `src/services/` | Un objeto por dominio: `groupsService`, `membersService`, `simulationsService`, `entriesService`, `climateService`, `analyticsService`, `authService`, `backupService` |
| **components** | `src/components/ui/` | Primitivos (Button, Card, Modal, Badge, etc.) sin lógica de negocio |
| **features** | `src/features/[domain]/` | Componentes con lógica de UI: `admin/` (grupos + analytics), `grupo/` (miembros + tarjetas de sim), `simulation/` (tabs del simulador) |
| **app** | `src/app/` | Pages como orquestadores: estado global, composición de features, rutas |

- `src/middleware.ts` — protección de rutas: redirige a `/login` si no hay sesión; grupos solo acceden a `/grupo/[id]`.
- `next.config.js` — rewrite de `/api/*` → `API_URL/api/*` + `transpilePackages: ['@simulador/shared']`.

---

## Configuración local

### Requisitos

- Node.js >= 18.17
- SQLite (desarrollo)

### Variables de entorno

**`api/.env`** (copia de `api/.env.example`):
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="cbt-plants-dev-secret-change-in-prod"
PORT=4002
WEB_ORIGIN=http://localhost:3002
```

**`web/.env`** (copia de `web/.env.example`):
```env
API_URL=http://localhost:4002
```

### Instalación y desarrollo

```bash
# Instalar todas las dependencias (una sola vez desde raíz)
npm install

# Compilar el paquete shared (requerido antes de api y web)
npm run build:shared

# Aplicar schema y poblar BD (solo primera vez)
cd api && npx prisma db push && npm run db:seed && cd ..

# Iniciar api y web en terminales separadas
npm run dev:api    # NestJS en :4002
npm run dev:web    # Next.js en :3002
```

### Build de producción

```bash
npm run build   # shared → api → web (en orden)
```

### Credenciales por defecto (seed)

- Admin: `code=admin` / `password=admin123`
- Demo group: código `DEMO`

---

## Modelos de base de datos

```
User (admin)

Group ─── Member
  │
  └── Simulation ─── Entry
```

- **User** — admin con `passwordHash` (bcrypt).
- **Group** — grupo académico con código único de 6 chars y planta asignada (ej. Lechuga).
- **Member** — integrante del grupo (nombre + rol).
- **Simulation** — escenario experimental: parámetros del modelo (`initialHeight`, `baseGrowth`, `optimalTemp`, `optimalHumidity`, `optimalLight`), predicción oficial bloqueeable, fecha de inicio.
- **Entry** — medición por sesión: `myPrediction`, `realHeight`, `temperature`, `humidity`, `lightHours`, `note`.

---

## Docker

El proyecto incluye Dockerfiles multi-stage por workspace (`api/Dockerfile`, `web/Dockerfile`) y un `docker-compose.yml` en raíz con Nginx como reverse proxy.

```
docker-compose.yml
├── api   → :4002 (NestJS, healthcheck en /api/health)
├── web   → :3002 (Next.js standalone, depende de api healthy)
└── nginx → :80  (/api/* → api, /* → web)
```

**Base de datos:** SQLite con volumen Docker (`sqlite_data`) montado en `/app/data`. El archivo `prod.db` persiste entre reinicios. Para escalado horizontal, cambiar `DATABASE_URL` a PostgreSQL.

El entrypoint del API (`api/docker-entrypoint.sh`) ejecuta automáticamente `prisma db push` y `npm run db:seed` antes de arrancar.

```bash
# JWT_SECRET es obligatorio — el compose falla si no se define
JWT_SECRET=tu-secreto-seguro docker compose up --build
```

---

## Rutas API

| Método | Ruta | Auth |
|--------|------|------|
| POST | `/api/auth/login` | — |
| POST | `/api/auth/logout` | — |
| GET | `/api/auth/me` | JWT |
| GET/POST | `/api/groups` | JWT/Admin |
| GET/PUT/DELETE | `/api/groups/:id` | JWT/Admin |
| GET | `/api/members/by-group/:groupId` | JWT |
| POST | `/api/members` | JWT |
| PUT/DELETE | `/api/members/:id` | JWT |
| GET/POST | `/api/simulations` | JWT |
| GET/PUT/DELETE | `/api/simulations/:id` | JWT |
| POST | `/api/entries` | JWT |
| GET | `/api/climate?month=&year=` | JWT |
| GET | `/api/analytics` | JWT + Admin |
| GET | `/api/backup` | JWT + Admin |
