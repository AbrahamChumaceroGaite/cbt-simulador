# Plan de Estandarización — cbt-simulador-plantas

> **Referente**: `cbt-control-aula` — arquitectura, diseño y patrones a replicar.  
> **Objetivo**: Elevar `cbt-simulador-plantas` al mismo nivel de calidad, consistencia y completitud.  
> **Fecha de auditoría**: 2026-04-04

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Comparativa de arquitectura](#2-comparativa-de-arquitectura)
3. [Backend — brechas y plan](#3-backend--brechas-y-plan)
4. [Frontend — brechas y plan](#4-frontend--brechas-y-plan)
5. [Base de datos y seed](#5-base-de-datos-y-seed)
6. [WebSocket y tiempo real](#6-websocket-y-tiempo-real)
7. [Seguridad y guards](#7-seguridad-y-guards)
8. [Archivos afectados (mapa completo)](#8-archivos-afectados-mapa-completo)
9. [Orden de ejecución](#9-orden-de-ejecución)

---

## 1. Resumen ejecutivo

| Dimensión | Control-aula | Simulador (actual) | Criticidad |
|-----------|-------------|-------------------|-----------|
| Gestión de usuarios (CRUD) | ✅ | ❌ Solo login/logout/me | Alta |
| Backup con restauración | ✅ Import + Export selectivo | ❌ Solo export total | Alta |
| Toast / feedback visual | ✅ Componente global | ❌ Ausente | Alta |
| SectionHeader unificado | ✅ En todas las secciones | ❌ Ausente | Alta |
| FloatingNav pill | ✅ | ❌ Tabs inline estáticas | Alta |
| Búsqueda en secciones admin | ✅ | ❌ Ninguna | Alta |
| Filtros en secciones admin | ✅ | ❌ Solo selector de grupo | Alta |
| CardActions con hover | ✅ | ❌ Botones siempre visibles | Media |
| `apiFetchFull` (con mensaje) | ✅ | ❌ Solo `apiFetch` | Media |
| Modal `lg` + scroll interno | ✅ | ❌ Max-w fijo, sin scroll | Media |
| Protección por rol en endpoints | ⚠️ Solo JwtAuthGuard | ✅ JwtAuthGuard + AdminGuard | OK |
| AdminGuard | ❌ No existe | ✅ Existe y funciona | Simulador adelante |
| WebSocket | ✅ Completo | ✅ Completo (recién agregado) | OK |
| Datos maestros / seed | ✅ Completo | ⚠️ Solo demo group | Baja |
| `globals.css` clases compartidas | ✅ `.page-wrapper`, `.card-base` | ❌ Faltan clases utilitarias | Baja |
| Animación `animate-in fade-in` | ✅ En todas las secciones | ❌ Ausente | Baja |

---

## 2. Comparativa de arquitectura

### 2.1 Capas y responsabilidades

Ambos proyectos siguen el mismo patrón. El simulador está correctamente estructurado.

```
Request → Controller → CommandBus/QueryBus → Handler → Repository (interfaz)
                                                             ↓
                                                    RepositoryImpl (Prisma)
```

**Diferencias detectadas:**

| Aspecto | Control-aula | Simulador |
|---------|-------------|-----------|
| Módulo Auth | `AuthController` + `UserController` (dos) | Solo `AuthController` (uno) |
| Guards en backup | Solo `JwtAuthGuard` | `JwtAuthGuard + AdminGuard` ← mejor |
| JWT en guard | Cookie O header `Authorization: Bearer` | Solo cookie (regex parse) |
| Interceptor respuesta | `TransformInterceptor` → `IApiResponse<T>` | Idéntico ✅ |
| Filtros de excepción | `GlobalExceptionFilter` con mapeo Prisma | Idéntico ✅ |
| Decoradores | `@CurrentUser()`, `@ResponseMessage()` | Idéntico ✅ |
| CQRS | `CqrsModule.forRoot()` implícito | Explícito ✅ |

### 2.2 Formato de respuesta (compartido, correcto en ambos)

```typescript
// shared/src/types/api-response.ts — igual en ambos proyectos
{ code: number; status: 'success' | 'error'; data: T; message: string }
```

### 2.3 `apiFetch` — diferencia crítica de frontend

**Control-aula** tiene dos funciones:
```typescript
// GET/read — devuelve solo T
apiFetch<T>(url, init?): Promise<T>

// POST/PUT/DELETE — devuelve T + mensaje del backend (para el Toast)
apiFetchFull<T>(url, init?): Promise<{ data: T; message: string }>
```

**Simulador** tiene solo `apiFetch<T>`. Esto significa que al crear/editar/eliminar no se puede mostrar el mensaje exacto del backend en el Toast. Todas las secciones del simulador usan mensajes hardcodeados como `'Guardado ✓'`.

---

## 3. Backend — brechas y plan

### 3.1 ❌ Gestión de usuarios (CRUD completo)

**Estado actual**: El simulador solo tiene `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.  
**Referente**: Control-aula tiene `UserController` con gestión completa.

**Qué agregar** en `api/src/modules/auth/`:

```
application/
  commands/
    create-user.command.ts     ← CreateUserCommand + CreateUserDto + CreateUserHandler
    update-user.command.ts     ← UpdateUserCommand + UpdateUserDto + UpdateUserHandler
    delete-user.command.ts     ← DeleteUserCommand + DeleteUserHandler
  queries/
    get-users.query.ts         ← GetUsersQuery + GetUsersHandler
  dtos/
    user-response.dto.ts       ← UserResponse (sin passwordHash)
```

**Nuevo controlador** `user.controller.ts` (dentro del mismo `AuthModule`):

```typescript
@Controller('usuarios')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UserController {
  @Get()    getAll(): Promise<UserResponse[]>
  @Post()   create(@Body() dto: CreateUserDto): Promise<UserResponse>
  @Patch(':id') update(@Param('id') id, @Body() dto: UpdateUserDto): Promise<UserResponse>
  @Delete(':id') remove(@Param('id') id): Promise<void>
}
```

**Shared types** — agregar a `shared/src/types/`:

```typescript
// user.types.ts
export type UserResponse = {
  id: string; code: string; role: PlantasRole
  fullName: string; isActive: boolean; createdAt: string
}
export type CreateUserDto = { code: string; password: string; fullName: string; role: PlantasRole }
export type UpdateUserDto = { fullName?: string; password?: string; isActive?: boolean }
```

**Nuevo servicio frontend** `web/src/services/users.service.ts`:

```typescript
export const usersService = {
  getAll: ()           => apiFetch<UserResponse[]>('/api/usuarios'),
  create: (dto)        => apiFetchFull<UserResponse>('/api/usuarios', { method: 'POST', ... }),
  update: (id, dto)    => apiFetchFull<UserResponse>(`/api/usuarios/${id}`, { method: 'PATCH', ... }),
  remove: (id)         => apiFetch<null>(`/api/usuarios/${id}`, { method: 'DELETE' }),
}
```

---

### 3.2 ❌ Backup con restauración (POST /backup/restore)

**Estado actual**: `BackupController` solo tiene `GET /backup` que exporta `{ version, exportedAt, groups }` con members, simulations y entries anidados.  
**Referente**: Control-aula tiene `POST /backup/restore` con upsert inteligente (preserva progreso, crea lo que no existe).

**Qué agregar** al `BackupController` del simulador:

```typescript
@Post('restore')
@HttpCode(200)
@ResponseMessage('Restauración completada')
async restore(@Body() body: Record<string, any>): Promise<RestoreResult> {
  // 1. Detectar secciones presentes en el JSON
  // 2. Para cada group → upsert (preservar code único)
  // 3. Para cada member → upsert por id
  // 4. Para cada simulation → upsert por id (preservar isLocked, officialPrediction)
  // 5. Para cada entry → upsert por id (crear si no existe, update solo note)
  // Retornar: { detected: string[], details: { groups, members, simulations, entries } }
}
```

**Lógica clave de restauración**:
- `group.code` es `@unique` → en `update` solo cambiar `name`, `course`, `plant`, nunca el `code`
- `simulation.isLocked` y `officialPrediction` → **no sobreescribir** en update (preserva el estado de la simulación activa)
- `entry` → upsert por `id`, en update solo `note` (no alterar mediciones reales)

**Shared types** — agregar a `shared/src/types/`:

```typescript
export type RestoreResult = {
  detected: string[]
  details: {
    groups?:      { created: number; updated: number }
    members?:     { created: number; updated: number }
    simulations?: { created: number; updated: number }
    entries?:     { created: number }
  }
}
```

---

### 3.3 ⚠️ JwtAuthGuard — soporte para header Authorization

**Estado actual**: El guard del simulador parsea la cookie con regex y no busca en el header `Authorization: Bearer`.  
**Referente**: Control-aula soporta ambos (útil para testing con herramientas como Postman/curl).

**Cambio mínimo** en `api/src/common/guards/jwt-auth.guard.ts`:

```typescript
// Buscar token en cookie primero, luego en header
const cookie = req.headers.cookie ?? ''
const match  = cookie.match(/(?:^|;\s*)cbt_plants_session=([^;]+)/)
let token    = match?.[1]

if (!token) {
  const authHeader = req.headers.authorization ?? ''
  if (authHeader.startsWith('Bearer ')) token = authHeader.slice(7)
}
if (!token) throw new UnauthorizedException('No autenticado')
```

---

### 3.4 ⚠️ Backup — export más granular

**Estado actual**: Exporta todo (`groups` con members, simulations y entries) sin posibilidad de elegir secciones.  
**Referente**: Control-aula acepta `?sections=courses,actions,rewards` para exportar selectivamente.

**Cambio** en `BackupController.download()`:

```typescript
@Get()
async download(@Res() res, @Query('sections') sectionsParam?: string) {
  const ALL = ['groups', 'simulations', 'entries'] as const
  const sections = sectionsParam
    ? sectionsParam.split(',').map(s => s.trim()).filter(s => ALL.includes(s as any))
    : [...ALL]
  // Construir payload según secciones seleccionadas
}
```

---

## 4. Frontend — brechas y plan

### 4.1 ❌ `apiFetchFull` — función para mutaciones

**Archivo**: `web/src/lib/api.ts`

Agregar exactamente como en control-aula:

```typescript
export async function apiFetchFull<T>(
  url: string,
  init?: RequestInit,
): Promise<{ data: T; message: string }> {
  const res  = await fetch(url, init)
  const body = await res.json() as IApiResponse<T>
  if (!res.ok || body.status !== 'success') throw new Error(body.message ?? `Error ${res.status}`)
  return { data: body.data as T, message: body.message ?? 'OK' }
}
```

**Impacto**: Permite que todos los `showToast(message)` muestren el mensaje exacto del backend en lugar de strings hardcodeados.

---

### 4.2 ❌ `Toast` component

**Archivo nuevo**: `web/src/components/ui/toast.tsx`  
**Copiar de**: control-aula — idéntico.

```typescript
export function Toast({ msg, ok }: { msg: string; ok: boolean }) { ... }
```

**Actualizar**: `web/src/components/ui/index.ts` — agregar `export { Toast } from './toast'`

**Patrón de uso en páginas**:
```typescript
const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

function showToast(msg: string, ok = true) {
  setToast({ msg, ok })
  setTimeout(() => setToast(null), 3000)
}

// En el render:
{toast && <Toast msg={toast.msg} ok={toast.ok} />}
```

---

### 4.3 ❌ `SectionHeader` component

**Archivo nuevo**: `web/src/components/shared/SectionHeader.tsx`  
**Copiar de**: control-aula — idéntico.  
Props: `icon?`, `iconClass?`, `title`, `subtitle?`, `search?`, `onSearch?`, `filters?`, `actions?`

**Dónde usar** (reemplazar headers ad-hoc):

| Componente | `icon` | `iconClass` | `actions` |
|-----------|--------|-------------|-----------|
| `AdminGroupsSection` | `Users` | `text-emerald-400` | `+ Nuevo grupo` |
| `AdminSimulationsSection` | `FlaskConical` | `text-zinc-400` | — |
| `AdminMembersSection` | `Users` | `text-zinc-400` | `+ Nuevo integrante` |
| `AdminEntriesSection` | `BookOpen` | `text-zinc-400` | — |
| `AdminAnalyticsSection` | `BarChart3` | `text-zinc-400` | — |
| `BackupSection` (nuevo) | `Database` | `text-zinc-400` | — |
| `UsuariosSection` (nuevo) | `UserCog` | `text-purple-400` | `+ Nuevo usuario` |
| `MembersSection` (grupo) | `Users` | `text-zinc-400` | `+ Agregar` |
| Sección de sims en grupo | `FlaskConical` | `text-zinc-400` | `+ Nueva simulación` |

---

### 4.4 ❌ `CardActions` component

**Archivo nuevo**: `web/src/components/shared/CardActions.tsx`  
**Copiar de**: control-aula — idéntico.  
Props: `onEdit()`, `onDelete()`  

**Requiere**: que el elemento padre tenga `className="group relative"`.

**Dónde usar** (reemplazar buttons inline):

| Componente | Cards que lo necesitan |
|-----------|----------------------|
| `AdminGroupsSection` | cada card de grupo |
| `AdminSimulationsSection` | cada card de simulación |
| `AdminMembersSection` | cada fila/card de integrante |
| `MembersSection` (grupo/[id]) | cada fila de integrante |

---

### 4.5 ❌ `FloatingNav` component

**Archivo nuevo**: `web/src/components/shared/FloatingNav.tsx`  
**Copiar de**: control-aula — idéntico.  
Los estilos `.floating-nav`, `.nav-item`, `.nav-icon`, `.nav-label` **ya existen** en `globals.css` del simulador.

**Cambio en `app/admin/page.tsx`**:
- Quitar el bloque `<div className="flex items-center gap-1 bg-zinc-900/60 ...">` de tabs inline
- Reemplazar por `<FloatingNav tabs={TABS} active={tab} onTabChange={setTab} />`
- Agregar `page-wrapper` class al `<main>` (o `pb-32`) para que el FloatingNav no tape contenido

**Tabs del admin** redefinidas con el tipo correcto:
```typescript
const TABS: NavTab<Tab>[] = [
  { id: 'grupos',       label: 'Grupos',       icon: Users },
  { id: 'simulaciones', label: 'Simulaciones',  icon: FlaskConical },
  { id: 'integrantes',  label: 'Integrantes',   icon: Users },
  { id: 'sesiones',     label: 'Sesiones',      icon: BookOpen },
  { id: 'analytics',    label: 'Analytics',     icon: BarChart3 },
  { id: 'usuarios',     label: 'Usuarios',      icon: UserCog },
  { id: 'backup',       label: 'Backup',        icon: Database },
]
```

---

### 4.6 ❌ `components/shared/index.ts`

**Archivo nuevo** que centraliza los exports:

```typescript
export { SectionHeader } from './SectionHeader'
export { CardActions }   from './CardActions'
export { FloatingNav }   from './FloatingNav'
export type { NavTab }   from './FloatingNav'
```

---

### 4.7 ⚠️ Modal — agregar `lg` prop y scroll interno

**Archivo**: `web/src/components/ui/modal.tsx`

Cambios vs versión actual:
1. Agregar prop `lg?: boolean` → cambia `max-w-md` por `max-w-2xl`
2. Agregar `max-h-[90vh]` al contenedor
3. Agregar `overflow-y-auto` al body (para formularios largos)
4. Cambiar `z-50` → `z-[200]` (el FloatingNav usa `z-50`, debe quedar debajo del modal)

```typescript
export function Modal({ open, onClose, title, lg, children }: {
  open: boolean; onClose: () => void; title: string; lg?: boolean; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative w-full rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl flex flex-col max-h-[90vh]',
        lg ? 'max-w-2xl' : 'max-w-md'
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} ...> × </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
```

---

### 4.8 ⚠️ Pagination — reemplazar con versión de control-aula

**Archivo**: `web/src/components/ui/pagination.tsx`

La versión actual usa HTML `<button>` crudos. La de control-aula usa el `Button` component del sistema de diseño y muestra botones de página numerados con elipsis.

**Reemplazar completamente** con la versión de control-aula (copia exacta).  
La firma de props es **idéntica** — no hay cambios de uso en componentes que ya la usan.

---

### 4.9 ❌ Búsqueda y filtros en secciones admin

Ninguna sección admin del simulador tiene búsqueda. Esto es crítico a medida que crecen los datos.

**Patrón a seguir** (igual que control-aula):

```typescript
// En cada sección:
const [search, setSearch] = useState('')

// Aplicar antes de paginar:
const filtered = items.filter(item =>
  item.name.toLowerCase().includes(search.toLowerCase())
)
const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

// En el header:
<SectionHeader
  ...
  search={search}
  onSearch={v => { setSearch(v); setPage(0) }}
/>
```

**Por sección**:

| Sección | Búsqueda por | Filtros adicionales |
|---------|-------------|---------------------|
| `AdminGroupsSection` | `name` | Select curso (`S2A/S2B/S2C`), select planta |
| `AdminSimulationsSection` | `name` | Select grupo, badge estado (bloqueada/demo) |
| `AdminMembersSection` | `name` | Select rol |
| `AdminEntriesSection` | `note` | (ya tiene select simulación) |
| `AdminAnalyticsSection` | `name` | — (tabla de solo lectura) |

---

### 4.10 ❌ `AdminSection` — gestión interna con sub-tabs

**Archivo nuevo**: `web/src/features/admin/AdminSection.tsx`  
**Patrón de**: control-aula `features/admin/AdminSection.tsx`

Unifica **Usuarios** y **Backup** en una sola sección con sub-navegación interna:

```typescript
type AdminTab = 'usuarios' | 'backup'

export function AdminSection({ showToast, onReload }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('usuarios')
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader icon={Shield} iconClass="text-purple-400"
        title="Administración" subtitle="Usuarios y datos del sistema" />
      {/* Sub-nav pill */}
      {activeTab === 'usuarios' && <UsuariosSection showToast={showToast} />}
      {activeTab === 'backup'   && <BackupSection showToast={showToast} onReload={onReload} />}
    </div>
  )
}
```

---

### 4.11 ❌ `UsuariosSection` — gestión de cuentas

**Archivo nuevo**: `web/src/features/admin/UsuariosSection.tsx`  
**Patrón de**: control-aula `features/usuarios/UsuariosSection.tsx`

CRUD completo de usuarios del sistema:
- Listar todos los usuarios (tabla con: código, nombre, rol, estado)
- Crear usuario: code, fullName, password, role (admin/group)
- Editar: fullName, password, isActive
- Eliminar con confirmación

Usa `usersService` (nuevo, ver §3.1).

---

### 4.12 ❌ `BackupSection` — export + import completo

**Archivo nuevo**: `web/src/features/admin/BackupSection.tsx`  
**Patrón de**: control-aula `features/backup/BackupSection.tsx`

Reemplaza el botón `<Download>` huérfano en el header del admin.

**Secciones exportables**:
```typescript
const EXPORT_SECTIONS = [
  { key: 'groups',      label: 'Grupos y miembros',  desc: 'Nombre, código, planta y curso' },
  { key: 'simulations', label: 'Simulaciones',        desc: 'Config de planta y parámetros' },
  { key: 'entries',     label: 'Mediciones',          desc: 'Todas las sesiones registradas' },
]
```

**UI**:
- Checkboxes para seleccionar secciones (igual que control-aula)
- Botón "Exportar (N secc.)" con loading state
- File input para importar JSON
- Panel de resultado con badges: `Grupos: 3 actualizados, 1 nuevo`
- Info card explicativa

**Cambio en `app/admin/page.tsx`**:
- Quitar `backupService.download()` del header
- Quitar el botón `<Download>` del header
- El backup vive exclusivamente en el tab "Admin → Backup"

---

### 4.13 ❌ `globals.css` — clases utilitarias faltantes

**Archivo**: `web/src/app/globals.css`

Agregar al bloque `@layer components`:

```css
/* Ya existen en simulador: .floating-nav, .nav-item, .nav-icon, .nav-label */

/* Agregar los que faltan: */
.page-wrapper { @apply pb-32; }   /* padding para FloatingNav */

.card-base {
  @apply border rounded-xl overflow-hidden shadow-sm;
  background-color: #0c0c0e;
  border-color: #27272a;
}

.panel-title   { @apply text-lg font-bold tracking-tight mb-1; color: #fff; }
.panel-subtitle { @apply text-sm mb-6; color: #a1a1aa; }
```

---

### 4.14 ❌ Animaciones de entrada en secciones

**Control-aula**: cada sección usa `className="animate-in fade-in duration-500"` en el wrapper.  
**Simulador**: ninguna sección admin tiene animación de entrada.

**Cambio**: agregar `animate-in fade-in duration-300` al `<div>` raíz de:
- `AdminGroupsSection`
- `AdminSimulationsSection`
- `AdminMembersSection`
- `AdminEntriesSection`
- `AdminAnalyticsSection`
- `AdminSection`
- `BackupSection`
- `UsuariosSection`

Requiere que `tailwindcss-animate` esté instalado — **ya está** en `devDependencies`.

---

### 4.15 ⚠️ `app/admin/page.tsx` — refactor completo

**Cambios acumulados**:

1. **Quitar** botón `<Download>` del header
2. **Quitar** summary stats 4-card del layout principal → moverlas a `AdminAnalyticsSection` como intro
3. **Quitar** el bloque de tabs inline (`div.flex.items-center.gap-1.bg-zinc-900/60`)
4. **Agregar** `<FloatingNav tabs={TABS} active={tab} onTabChange={setTab} />`
5. **Agregar** `[toast, setToast]` + `showToast` + `<Toast>` al final del render
6. **Agregar** tab `'usuarios'` → `<AdminSection showToast={showToast} onReload={load} />`
7. **Cambiar** tab `'backup'` para que sea parte de `<AdminSection>`
8. **Pasar** `showToast` a todas las secciones
9. **Agregar** `.page-wrapper` al `<main>`

**Nueva definición de tabs**:
```typescript
type Tab = 'grupos' | 'simulaciones' | 'integrantes' | 'sesiones' | 'analytics' | 'admin'

const TABS: NavTab<Tab>[] = [
  { id: 'grupos',       label: 'Grupos',       icon: Users },
  { id: 'simulaciones', label: 'Simulaciones',  icon: FlaskConical },
  { id: 'integrantes',  label: 'Integrantes',   icon: Users },
  { id: 'sesiones',     label: 'Sesiones',      icon: BookOpen },
  { id: 'analytics',    label: 'Analytics',     icon: BarChart3 },
  { id: 'admin',        label: 'Admin',         icon: Shield },
]
```

---

### 4.16 ⚠️ `app/grupo/[id]/page.tsx` — mejoras menores

- Agregar `SectionHeader` para la sección de simulaciones y la de miembros
- Agregar `[toast, setToast]` + `showToast` para feedback al crear/editar/eliminar
- `MembersSection` debe recibir `showToast` y usarlo en try/catch
- `SimCard` está bien — no necesita cambios

---

### 4.17 ⚠️ `app/grupo/[id]/simulacion/[simId]/page.tsx` — usar `Toast` component

**Estado actual**: El toast es inline ad-hoc:
```typescript
// Actual — ad-hoc, no es el componente estándar
const [toast, setToast] = useState('')
// Render:
{toast && <div className="fixed top-5 right-5 ...">...</div>}
```

**Cambio**: reemplazar por el componente `Toast` importado de `@/components/ui`:
```typescript
const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
function showToast(msg: string, ok = true) { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000) }

// Render:
{toast && <Toast msg={toast.msg} ok={toast.ok} />}
```

---

## 5. Base de datos y seed

### 5.1 Schema — completo, no requiere cambios

El `schema.prisma` del simulador cubre todos los modelos necesarios:
`User`, `Group`, `Member`, `Simulation`, `Entry`.

No se necesita migración ni nuevo modelo para ninguna de las funcionalidades del plan.

### 5.2 ⚠️ Seed — agregar grupos reales por curso

**Estado actual**: Solo existe un `DEMO_GROUP` de tutorial.  
**Problema**: Al desplegar en producción, los grupos reales los crea el admin manualmente. Esto está bien. Pero falta al menos un segundo usuario admin de respaldo.

**Agregar** en `api/src/data/`:
```typescript
// api/src/data/users.ts
export const INITIAL_USERS = [
  { code: 'admin',  fullName: 'Administrador',      role: 'admin', password: 'admin123' },
  // Agregar más si se necesitan
]
```

**Actualizar** `prisma/seed.ts` para iterar sobre `INITIAL_USERS`.

---

## 6. WebSocket y tiempo real

### 6.1 Estado actual — completo

El simulador ya tiene la infraestructura WebSocket completa implementada:

| Componente | Archivo | Estado |
|-----------|---------|--------|
| `WsGateway` | `api/src/infrastructure/socket/ws.gateway.ts` | ✅ |
| `SocketService` | `api/src/infrastructure/socket/socket.service.ts` | ✅ |
| `SocketModule` | `api/src/infrastructure/socket/socket.module.ts` | ✅ |
| `socket.events.ts` | `api/src/infrastructure/socket/socket.events.ts` | ✅ |
| `server.js` | `web/server.js` | ✅ |
| `SocketProvider` | `web/src/contexts/SocketContext.tsx` | ✅ |
| `useWsEvent` | `web/src/hooks/useWsEvent.ts` | ✅ |
| `ws/events.ts` | `web/src/ws/events.ts` | ✅ |

### 6.2 Eventos disponibles

| Evento | Disparado desde | Reciben |
|--------|----------------|---------|
| `entry:saved` | `UpsertEntryHandler` | Todos los admins + grupo afectado |
| `simulation:updated` | `UpdateSimulationHandler` | Todos los admins + grupo afectado |

### 6.3 Eventos potenciales a agregar (futuro)

| Evento sugerido | Cuándo | Para quién |
|----------------|--------|-----------|
| `group:created` | Admin crea grupo | Todos los admins |
| `member:added` | Admin o grupo agrega integrante | Todos los admins |

---

## 7. Seguridad y guards

### 7.1 Protección actual — simulador está adelante

El simulador usa `AdminGuard` correctamente. Control-aula no lo tiene.

```
Simulador: @UseGuards(JwtAuthGuard, AdminGuard)  ← correcto
Control-aula: @UseGuards(JwtAuthGuard)            ← confía en el rol del JWT sin verificarlo
```

### 7.2 ⚠️ Protección pendiente por endpoint

Algunos endpoints del simulador solo tienen `JwtAuthGuard` pero deberían tener también `AdminGuard`:

| Endpoint | Guard actual | Guard correcto |
|---------|-------------|----------------|
| `DELETE /members/:id` | JwtAuthGuard | JwtAuthGuard + AdminGuard |
| `PUT /members/:id` | JwtAuthGuard | JwtAuthGuard + AdminGuard |
| `DELETE /simulations/:id` | JwtAuthGuard | JwtAuthGuard + AdminGuard |
| `PUT /simulations/:id` | JwtAuthGuard | JwtAuthGuard + AdminGuard |
| `GET /simulations` (sin groupId) | JwtAuthGuard | JwtAuthGuard + AdminGuard |
| `DELETE /groups/:id` | AdminGuard ✅ | — |
| `GET /analytics` | AdminGuard ✅ | — |
| `GET /backup` | AdminGuard ✅ | — |

**Riesgo**: Un usuario con rol `group` podría eliminar simulaciones o miembros de otros grupos si conoce sus IDs.

### 7.3 Middleware frontend — ya actualizado

El matcher de `middleware.ts` excluye `/ws` correctamente:
```typescript
matcher: ['/((?!_next/static|_next/image|favicon.ico|ws|.*\\.png$).*)']
```

Las rutas permitidas para rol `group` son correctas.

---

## 8. Archivos afectados (mapa completo)

### API — nuevos

```
api/src/modules/auth/application/commands/create-user.command.ts
api/src/modules/auth/application/commands/update-user.command.ts
api/src/modules/auth/application/commands/delete-user.command.ts
api/src/modules/auth/application/queries/get-users.query.ts
api/src/modules/auth/user.controller.ts
api/src/data/users.ts
shared/src/types/user.types.ts
```

### API — modificados

```
api/src/modules/auth/auth.module.ts          ← registrar UserController + handlers
api/src/modules/backup/backup.controller.ts  ← agregar POST /restore + query sections
api/src/modules/backup/backup.service.ts     ← agregar método restore()
api/src/modules/member/member.controller.ts  ← agregar AdminGuard a PUT/DELETE
api/src/modules/simulation/simulation.controller.ts ← AdminGuard a PUT/DELETE/GET-all
api/src/common/guards/jwt-auth.guard.ts      ← soporte Authorization header
api/prisma/seed.ts                           ← agregar INITIAL_USERS
shared/src/index.ts                          ← exportar user.types
```

### Web — nuevos

```
web/src/components/ui/toast.tsx
web/src/components/shared/SectionHeader.tsx
web/src/components/shared/CardActions.tsx
web/src/components/shared/FloatingNav.tsx
web/src/components/shared/index.ts
web/src/features/admin/AdminSection.tsx
web/src/features/admin/UsuariosSection.tsx
web/src/features/admin/BackupSection.tsx
web/src/services/users.service.ts
```

### Web — modificados

```
web/src/lib/api.ts                                          ← agregar apiFetchFull
web/src/components/ui/index.ts                              ← export Toast
web/src/components/ui/modal.tsx                             ← lg prop, z-[200], scroll
web/src/components/ui/pagination.tsx                        ← reemplazar con versión control-aula
web/src/app/globals.css                                     ← .page-wrapper, .card-base, .panel-*
web/src/app/admin/page.tsx                                  ← FloatingNav, Toast, showToast, tabs
web/src/features/admin/AdminGroupsSection.tsx               ← SectionHeader, CardActions, búsqueda, try/catch
web/src/features/admin/AdminSimulationsSection.tsx          ← SectionHeader, CardActions, búsqueda, try/catch
web/src/features/admin/AdminMembersSection.tsx              ← SectionHeader, CardActions, búsqueda, try/catch
web/src/features/admin/AdminEntriesSection.tsx              ← SectionHeader, búsqueda
web/src/features/admin/AdminAnalyticsSection.tsx            ← SectionHeader
web/src/features/grupo/MembersSection.tsx                   ← SectionHeader, CardActions, showToast
web/src/app/grupo/[id]/page.tsx                             ← SectionHeader, Toast, showToast
web/src/app/grupo/[id]/simulacion/[simId]/page.tsx          ← usar Toast component
web/src/services/backup.service.ts                          ← agregar restore()
```

---

## 9. Orden de ejecución

Las fases están ordenadas por dependencias: no se puede implementar la Fase 3 sin la Fase 1.

### Fase 1 — Base del sistema de diseño
> Sin esto nada de lo demás funciona correctamente.

1. `components/ui/toast.tsx` — nuevo
2. `components/ui/modal.tsx` — actualizar (`lg`, `z-[200]`, scroll)
3. `components/ui/pagination.tsx` — reemplazar
4. `components/ui/index.ts` — agregar export Toast
5. `components/shared/SectionHeader.tsx` — nuevo
6. `components/shared/CardActions.tsx` — nuevo
7. `components/shared/FloatingNav.tsx` — nuevo
8. `components/shared/index.ts` — nuevo
9. `app/globals.css` — agregar `.page-wrapper`, `.card-base`, `.panel-*`
10. `lib/api.ts` — agregar `apiFetchFull`

### Fase 2 — API: usuarios + backup restore + guards

11. `shared/src/types/user.types.ts` + `shared/src/index.ts`
12. `api/src/modules/auth/application/commands/create-user.command.ts`
13. `api/src/modules/auth/application/commands/update-user.command.ts`
14. `api/src/modules/auth/application/commands/delete-user.command.ts`
15. `api/src/modules/auth/application/queries/get-users.query.ts`
16. `api/src/modules/auth/user.controller.ts`
17. `api/src/modules/auth/auth.module.ts` — registrar lo nuevo
18. `api/src/modules/backup/backup.controller.ts` — POST /restore + query sections
19. `api/src/modules/backup/backup.service.ts` — método restore()
20. `api/src/modules/member/member.controller.ts` — AdminGuard en PUT/DELETE
21. `api/src/modules/simulation/simulation.controller.ts` — AdminGuard en PUT/DELETE/GET-all
22. `api/src/common/guards/jwt-auth.guard.ts` — soporte Authorization header

### Fase 3 — Frontend: servicios + features nuevas

23. `services/users.service.ts` — nuevo (usa apiFetchFull)
24. `services/backup.service.ts` — agregar `restore()`
25. `features/admin/UsuariosSection.tsx` — nuevo
26. `features/admin/BackupSection.tsx` — nuevo
27. `features/admin/AdminSection.tsx` — nuevo (sub-tabs Usuarios + Backup)

### Fase 4 — Admin page + secciones existentes

28. `app/admin/page.tsx` — FloatingNav, Toast, quitar Download del header
29. `features/admin/AdminGroupsSection.tsx` — SectionHeader, CardActions, búsqueda, showToast
30. `features/admin/AdminSimulationsSection.tsx` — SectionHeader, CardActions, búsqueda, showToast
31. `features/admin/AdminMembersSection.tsx` — SectionHeader, CardActions, búsqueda, showToast
32. `features/admin/AdminEntriesSection.tsx` — SectionHeader, búsqueda
33. `features/admin/AdminAnalyticsSection.tsx` — SectionHeader

### Fase 5 — Páginas de grupo y simulación

34. `features/grupo/MembersSection.tsx` — SectionHeader, CardActions, showToast
35. `app/grupo/[id]/page.tsx` — SectionHeader, Toast, showToast
36. `app/grupo/[id]/simulacion/[simId]/page.tsx` — usar Toast component

### Fase 6 — Seed y verificación final

37. `api/src/data/users.ts` — usuarios iniciales
38. `api/prisma/seed.ts` — integrar INITIAL_USERS
39. Build completo (`npm run build -w shared && npm run build -w api && npm run build -w web`)
40. Commit + push a main

---

## Notas de implementación

- **No inventar**: cada componente nuevo debe ser copia exacta del referente (control-aula), ajustando solo nombres de dominio (`cbt_session` → `cbt_plants_session`, `@control-aula/shared` → `@simulador/shared`).
- **No romper**: los componentes que hoy usan `Pagination`, `Modal` y `Button` no cambian su API de props — los cambios son internos.
- **No duplicar**: `MembersSection` en `features/grupo/` y `AdminMembersSection` en `features/admin/` sirven a roles diferentes — mantenerlos separados con `showToast` como interfaz común.
- **Try/catch en todas las mutaciones**: todo `create`, `update`, `delete` debe estar en try/catch y llamar `showToast(message)` en éxito y `showToast(err.message, false)` en error.
- **`apiFetchFull` para mutaciones**: todas las llamadas POST/PUT/PATCH/DELETE deben usar `apiFetchFull` para capturar el mensaje del backend y mostrarlo en el Toast.
