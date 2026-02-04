# Protocolo de Despliegue Seguro

Para evitar la mezcla de datos entre `richard-automotive` (Producción/Dev activo) y `happy-seniors` (Proyecto legado/otro), **SIEMPRE** se deben usar los scripts de NPM definidos en `package.json`.

Estos scripts ejecutan explícitamente `firebase use richard-automotive` antes de cualquier comando de despliegue.

## Comandos Permitidos

* **Desplegar Reglas de Seguridad:**
    `npm run deploy:firebase:rules`

* **Desplegar Índices:**
    `npm run deploy:firebase:indexes`

* **Desplegar Funciones (Backend):**
    `npm run deploy:firebase:functions`

* **Desplegar TODO (Cuidado):**
    `npm run deploy:firebase:full`

## Regla de Oro

**NUNCA** ejecutes `firebase deploy` directamente desde la terminal sin antes verificar `firebase use`. Utiliza los scripts de `npm` para garantizar la seguridad.
