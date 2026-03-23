---
description: Tácticas de prevención y mitigación de riesgos para refactorizaciones masivas a FSD
---
# Protocolo de Refactorización Masiva a FSD (Feature-Sliced Design)

Este documento forma parte del sistema de **Prevención de Incidentes** de Richard Automotive. Su objetivo es proteger la eficiencia de las herramientas de IA, evitar saturación de RAM en el IDE, y garantizar un retorno de inversión (ROI) positivo del tiempo de ingeniería.

## Reglas Operativas

### 1. Construir el "Esqueleto" (Empty Shells)
Establece la infraestructura antes de migrar lógica, reduciendo la carga cognitiva del agente.

*   Crea la estructura de carpetas destino (ej. `src/features/car-filter`).
*   Genera los archivos `index.ts` (APIs públicas) en blanco.
*   **Mitigación de riesgo:** Al existir la ruta, la IA procesa el comando de traslado de forma precisa, evitando errores de rutas inexistentes o módulos mal colocados, otorgando total **autonomía** a cada porción.

### 2. Blindaje de Contexto (Pestañas Inactivas)
El exceso de contexto satura la memoria y rompe el índice del entorno operativo.

*   Antes de solicitar un movimiento de componente al agente, cierra todas las pestañas de tu editor.
*   Mantén abierto *única y exclusivamente* el archivo origen y la carpeta/archivo destino.
*   **Mitigación de riesgo:** Maximiza el $E_w$ (eficiencia de trabajo) asegurando que los recursos (tokens y RAM) se dirijan 100% a la refactorización actual. 

### 3. Automatización de Dependencias (La Directiva de Oro)
La actualización manual de rutas FSD (o pedirle al chat que lo haga archivo por archivo) causa bucles de dependencias rotas. 

*   Usa siempre un script de Node.js (ej. `fix-imports.js`) diseñado para buscar recursivamente en el directorio raíz (`src/`) y reemplazar patrones de rutas antiguas (`../../components/`) por aliases absolutos seguros (`@/shared/ui/`).
*   **Mitigación de riesgo:** Sustituye el error humano por precisión algorítmica. Un solo script repara decenas de dependencias en milisegundos, brindando total **tranquilidad** y **conexión** entre módulos.

### 4. Filtrado del Sistema Central (`.agentignore`)
Aísla la visión del agente para que solo interactúe con el código fuente útil.

*   Excluye permanentemente de la indexación automatizada:
    *   `node_modules/`
    *   `.next/`, `dist/`, o `build/`
    *   Archivos estáticos masivos (como `package-lock.json` o `.git/`)
*   **Mitigación de riesgo:** Previene que el entorno colapse (un "freeze") cuando la inteligencia artificial intenta rastrear dependencias cruzadas dentro de módulos externos. El área de trabajo se mantiene rápida y en **plenitud** operativa.

---
*Protocolo alineado con el Workspace Manager de Antigravity.*
