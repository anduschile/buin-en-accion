# Buin en Acción - MVP

Plataforma ciudadana de Buin para reportar y visualizar problemas urbanos.

## Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS v4
- **Maps**: Leaflet (React Leaflet)

## Setup Local

1. **Clonar repositorio**:
   ```bash
   git clone <repo>
   cd buin-en-accion
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**:
   Renombrar `.env.local.example` a `.env.local` y agregar tus credenciales de Supabase.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

4. **Base de Datos (Supabase)**:
   - Ir al SQL Editor en Supabase.
   - Ejecutar el contenido de `supabase/buin_init.sql` (Creará las tablas `buin_*`).
   - **Storage**: Crear un bucket público llamado `buin_evidence`.
   - **Auth**: Configurar URL del sitio a `http://localhost:3000`.

5. **Crear Primer Admin**:
   - Registrarse en la app (`/login`).
   - En la tabla `buin_profiles`, cambiar tu `role` a `admin`.

6. **Correr Local**:
   ```bash
   npm run dev
   ```

## Funcionalidades
- **Reportar**: Reportes con foto y ubicación (Georeferenciados o Generales).
- **Mapa**: Visualización de problemas y aciertos.
- **Admin**: Gestión de reportes, categorías y actualizaciones.

