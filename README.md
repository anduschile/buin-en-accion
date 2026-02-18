
# Puerto Natales Visible - MVP

Plataforma ciudadana para reportar y visualizar problemas urbanos en Puerto Natales.

## Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS v4
- **Maps**: Leaflet (React Leaflet)

## Setup Local

1. **Clonar repositorio**:
   ```bash
   git clone <repo>
   cd natales-mvp
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**:
   Renombrar `.env.local.example` a `.env.local` y agregar tus credenciales de Supabase.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=hp...supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

4. **Base de Datos (Supabase)**:
   - Ir al SQL Editor en Supabase.
   - Ejecutar el contenido de `supabase/migrations/001_init.sql`.
   - **Importante**: Crear el bucket `evidence_private` en Storage y hacerlo privado (Policy RLS se encarga del acceso, pero el bucket debe existir).
   - Configurar Auth: Habilitar Email provider (Magic Link) y configurar `Site URL` a `http://localhost:3000`.

5. **Crear Primer Admin**:
   - Registrarse en la app (`/login`).
   - En la tabla `profiles` de Supabase, buscar tu usuario y cambiar `role` de `citizen` a `admin`.

6. **Correr Local**:
   ```bash
   npm run dev
   ```

## Funcionalidades
- **Reportar**: Usuarios autenticados pueden subir reportes con foto y ubicación.
- **Mapa**: Visualización pública de reportes "published".
- **Semáforo**: Ranking de prioridades basado en votos.
- **Admin**: Panel para aprobar/rechazar reportes y publicar actualizaciones oficiales.

## Deploy en Vercel
- Importar proyecto.
- Agregar Variables de Entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Deploy!
