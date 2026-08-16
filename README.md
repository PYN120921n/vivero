# México Primero — Vivero Chaka

Sistema de inventario y cotizaciones para Vivero Chaka (México Primero S de S.S),
reescrito desde cero a partir del sistema original en HTML/CSS/JS puro con
`localStorage` como "base de datos" y autenticación falsa en el cliente.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions) + TypeScript
- **Supabase** — Postgres + Auth + Row Level Security (reemplaza `localStorage`)
- **Tailwind CSS v4** — sistema de diseño propio (verde bosque + ámbar)
- **@react-pdf/renderer** — cotizaciones como PDF real generado en el servidor
  (ya no `window.print()`)
- Pensado para desplegarse en **Vercel**

## Por qué este stack

Sigue el mismo patrón que ya usaste en tu SaaS POS (Flask+MySQL → Next.js+Supabase):
Postgres real con RLS en vez de datos en el navegador, autenticación server-side
en vez de una contraseña visible en el código fuente, y Server Actions en vez de
un backend aparte. Todo el catálogo, cotizaciones e historial ahora viven en la
nube y son accesibles desde cualquier dispositivo.

## Qué cambió respecto al original

- **Autenticación real** con Supabase Auth (antes: `admin@chaka.com` /
  `adminluis1` visibles en el JS del cliente).
- **Base de datos en la nube** (antes: `localStorage`, se perdía al limpiar caché
  y no se compartía entre dispositivos).
- **Cotizaciones en PDF real** con pie de página profesional y paginación (antes:
  HTML enviado a `window.print()`).
- **Catálogo real de 32 especies** de reforestación de Yucatán, con su
  clasificación botánica correcta (antes: ese catálogo existía en el código
  pero nunca se conectó a la app — arrancaba con semillas de prueba).
- **Roles `usuario` / `superadmin`** con Row Level Security, y un **killswitch**
  que el superadmin puede activar para suspender el acceso de todo el equipo con
  rol `usuario` de inmediato (Base de datos → Killswitch).
- **Respaldo y restauración** de semillas, plantas y cotizaciones en JSON
  (Base de datos → Respaldo), solo para superadmin.
- **Descuento de stock atómico** al aprobar una cotización de semillas (antes:
  lectura-modificación-escritura en el cliente, con condiciones de carrera).

### Qué se dejó fuera a propósito

Fertilizantes, Estadísticas y el módulo "Base de Datos" del sistema original
nunca tuvieron funcionalidad real (eran cascarones que solo imprimían "en
desarrollo" en consola). Se priorizó reconstruir a fondo lo que sí funcionaba
(semillas, plantas, cotizaciones, historial) en vez de heredar módulos vacíos.
El esquema queda listo para agregar Fertilizantes después con el mismo patrón
que Semillas.

Tampoco se incluyó "editar una cotización pendiente": usa **Duplicar** desde el
historial para partir de una copia editable con folio y fecha nuevos.

## Configuración

### 1. Crear el proyecto en Supabase

1. Crea un proyecto nuevo en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor**, pega el contenido de `supabase/migrations/0001_init.sql`
   y ejecútalo.
3. Pega el contenido de `supabase/seed.sql` y ejecútalo (carga el catálogo real
   de 32 semillas).
4. Ve a **Project Settings → API** y copia `Project URL`, `anon public key` y
   `service_role key`.

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y llena los tres valores del paso anterior.
La `service_role key` es secreta — solo se usa en el servidor (respaldo/
restauración y alta de usuarios) y nunca debe llevar el prefijo `NEXT_PUBLIC_`.

### 3. Crear tu primer superadmin

No hay registro público (por diseño). Crea el primer usuario a mano:

1. Panel de Supabase → **Authentication → Users → Add user**, crea tu cuenta
   con correo y contraseña (marca "Auto Confirm User").
2. Vuelve al **SQL Editor** y ejecuta, cambiando el correo:

   ```sql
   update public.profiles set role = 'superadmin'
   where email = 'tucorreo@ejemplo.com';
   ```

Desde ahí, ese superadmin puede crear el resto de las cuentas del equipo desde
**Usuarios** dentro de la app.

### 4. Correr en local

```bash
npm install
npm run dev
```

### 5. Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. Impórtalo en [vercel.com/new](https://vercel.com/new).
3. Agrega las mismas tres variables de entorno de `.env.local` en
   **Project Settings → Environment Variables**.
4. Deploy. Vercel detecta Next.js automáticamente, no requiere configuración
   adicional.

## Estructura

```
src/app/(app)/        páginas autenticadas (sidebar): dashboard, semillas,
                       plantas, cotizaciones, usuarios, base-de-datos
src/app/api/           generación de PDF y respaldo/restauración
src/app/login/         login
src/app/suspendido/    pantalla mostrada al rol "usuario" con el killswitch activo
src/lib/supabase/      clientes de Supabase (browser, server, admin)
src/lib/pdf/           plantilla del PDF de cotización
src/proxy.ts           protección de rutas + killswitch (antes middleware.ts)
supabase/migrations/   esquema completo (tablas, RLS, funciones RPC)
supabase/seed.sql      catálogo real de semillas
```

## Regenerar los tipos de la base de datos

Los tipos en `src/lib/types.ts` están escritos a mano a partir de la migración.
Una vez el proyecto esté enlazado con la CLI de Supabase, puedes regenerarlos
para detectar cualquier diferencia:

```bash
npx supabase gen types typescript --project-id TU_PROJECT_ID > src/lib/types.ts
```
