# Command Center Ops Playbook

## Prerequisitos

- Ejecutar desde la raiz del repo:
  `/Users/richardmendez/richard-automotive-_-command-center`
- Tener dependencias instaladas: `npm install`
- Tener configuracion de entorno para `dotenvx` (`.env`, `.env.local` o equivalente)

## Pipeline estandar

1. `npm run lint`
2. `npm run test`
3. `npm run build`
4. Deploy segun target

Detener el flujo si falla cualquier paso.

## Targets de deploy

- `vercel`:
  - Comando: `npm run deploy:vercel`
  - Requiere acceso autenticado a Vercel.

- `firebase-functions`:
  - Comando: `npm run deploy:firebase:functions`
  - Requiere `firebase` autenticado y proyecto `richard-automotive` accesible.

- `firebase-rules`:
  - Comando: `npm run deploy:firebase:rules`

- `firebase-indexes`:
  - Comando: `npm run deploy:firebase:indexes`

- `firebase-full`:
  - Comando: `npm run deploy:firebase:full`
  - Impacto mayor; usar solo cuando el usuario lo pida de forma explicita.

## Estrategia recomendada

- Si el pedido es ambiguo ("hazlo todo"), ejecutar primero:
  - `.agents/skills/command-center-ops/scripts/release_ops.sh --dry-run --target none`
- Luego ejecutar checks reales sin deploy:
  - `.agents/skills/command-center-ops/scripts/release_ops.sh --target none`
- Desplegar solo con target confirmado.
