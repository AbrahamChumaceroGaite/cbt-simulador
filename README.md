# CBT Simulador Plantas

Aplicación web especializada en pronósticos de simulación de crecimiento de siembras agrarias (ej. semillas de Lechuga, Tomate, etc). Utiliza un modelo reactivo basado en variables termodinámicas capturadas in situ (humedad, temperatura, horas luz) para contrastar el crecimiento con proyecciones teóricas.

## Arquitectura

El sistema implementa una arquitectura modular de tres capas, desacoplando los componentes del cliente, la lógica de controladores y las sentencias transaccionales.

- **Frontend**: Desarrollado en Next.js (App Router), con Tailwind CSS y componentes compatibles con los estándares de diseño `abe-s-ui`. Renderizado de UI para gráficas usando `recharts` procesando series temporales in-memory.
- **Rutas de API**: Lógica proxy minimalista donde se exponen URIs estandarizadas (/api/simulations, /api/entries, etc.) delegando el encapsulamiento DTO y el procesamiento a la capa de servicios.
- **Servicios**: Clases modulares ubicadas en `/src/server/services/` cuya responsabilidad incluye la sanitización de inputs y validación pre-persistente.
- **Integración de Base de Datos**: Interacción contra PostgreSQL mediada por PrismaORM.

## Modelos y Entidades

- `Group`: Agrupación académica asociada a un cultivo (`plant`) o curso institucional.
- `Simulation`: Representa un escenario experimental aislado con la configuración basal (Tasa basal, temperatura, humedad y luz óptimas). Soporta simulaciones oficiales o proyecciones de demostración puramente teóricas integradas en la interfaz de exploración `isDemo`.
- `Entry`: Mediciones secuenciadas que comparan variables empíricas vs simuladas (`realHeight`, `temperature`, `humidity`, `lightHours` y `note`).

Todas las estructuras de persistencia incluyen soporte para trazabilidad temporal estándar (`createdAt`, `updatedAt`).

## Secuenciado Inicial (Seeding)

Desarrollo poblado dinámicamente. La capa Prisma soporta seeding automatizado estructurado en módulos para cursos modelo y simulaciones de tutorial a nivel componente en `/prisma/seed.ts`. Las funciones pobladoras utilizan \`tsx\` de manera asíncrona.

Comandos para regenerar el entorno local:
\`\`\`bash
npx prisma db push --force-reset
npx prisma db seed
\`\`\`

## Ejecución y Preparación

### Pre-requisitos
- Node 18.17+
- Instancia activa PostgreSQL >= 14

### Variables de Entorno (`.env`)
\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/cbt_simulador_plantas?schema=public"
\`\`\`

### Herramientas de Desarrollo y Compilación
- \`npm install\` (Inicialización)
- \`npm run dev\` (Servidor en el puerto 3002)
- \`npm run build\` (Construcción del bundle para Next.js)
- \`npm start\` (Server de producción)

### Orquestación de Despliegue
Diseñado out-of-the-box para su contenedorización con \`Docker\`. Consulte \`Dockerfile\` en la raíz para habilitar una construcción multi-etapa recomendada. Opciones de escalabilidad a elección mediante proveedores serverless (ej. Vercel) o despliegue IaaS.