# Mesa Digital

Menú digital y pedidos por QR para restaurantes. Sin app para descargar, sin hardware
especial, sin comisión por pedido.

La documentación de producto (brief, decisiones, roadmap) vive fuera de este repo, en
`projects/menu-restaurantes/CONTEXTO.md` del workspace de Claude.

## Correr en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (base de datos, auth, storage, tiempo real) — etapa 2
- `<model-viewer>` para el visor 3D / AR de platos
- Vercel para el deploy

## Estructura

```
src/
├── app/        Rutas y páginas
└── data/       Datos de demo hasta conectar Supabase
```
