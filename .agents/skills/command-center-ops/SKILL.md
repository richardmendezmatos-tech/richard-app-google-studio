---
name: command-center-ops
description: "Ejecutar operaciones técnicas de Richard Automotive Command Center de forma segura y repetible: validaciones locales (lint, tests, build), verificación de prerequisitos y despliegues a Vercel o Firebase. Usar cuando pidan 'haz deploy', 'prepáralo para producción', 'corre checks', 'verifica antes de publicar', 'despliega functions/rules/indexes' o cualquier flujo release/ops del repositorio."
---

# Command Center Ops

## Objetivo

Estandarizar el flujo de validación y despliegue del repositorio. Priorizar seguridad operativa: primero checks, luego release.

## Flujo Operativo

1. Identificar objetivo del usuario:
- `checks-only`: validar sin desplegar.
- `release-vercel`: validar y desplegar frontend/API a Vercel.
- `release-firebase-*`: validar y desplegar componentes Firebase (`functions`, `rules`, `indexes` o `full`).

2. Verificar prerequisitos:
- Leer `references/ops-playbook.md`.
- Confirmar que el repo está en `/Users/richardmendez/richard-automotive-_-command-center`.
- Confirmar comandos disponibles: `npm`, `dotenvx`, `firebase` y/o `vercel` según target.

3. Ejecutar pipeline con script:

```bash
.agents/skills/command-center-ops/scripts/release_ops.sh --dry-run --target none
.agents/skills/command-center-ops/scripts/release_ops.sh --target none
.agents/skills/command-center-ops/scripts/release_ops.sh --target vercel
.agents/skills/command-center-ops/scripts/release_ops.sh --target firebase-functions
```

4. Reportar resultado:
- Incluir qué comandos se ejecutaron.
- Incluir punto de falla exacto si aplica.
- No ocultar errores de validación; detener despliegue si fallan checks.

## Reglas de Ejecucion

- Ejecutar por defecto `lint`, `test`, `build` antes de cualquier deploy.
- Permitir `--skip-tests` solo cuando el usuario lo pida explícitamente o exista bloqueo conocido.
- Usar `--dry-run` primero cuando el usuario pida "hazlo todo" sin más detalle.
- No inventar entornos ni credenciales faltantes; reportar requisito faltante claramente.

## Recursos

- Script principal: `scripts/release_ops.sh`
- Referencia operativa: `references/ops-playbook.md`
