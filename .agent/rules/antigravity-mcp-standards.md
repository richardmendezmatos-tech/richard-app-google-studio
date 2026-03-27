---
trigger: always_on
---

# Antigravity MCP Standards

Este documento define el marco de operación para el uso de servidores MCP en Richard Automotive. Tras la eliminación de Kluster.ai, estas herramientas proporcionan la inteligencia contextual necesaria para mantener la autoridad clínica y el rigor técnico de **Vitalos** y **Happy Senior**.

## 1. Registro de Servidores

Los siguientes servidores están configurados en `.cursor/mcp.json` y deben ser utilizados proactivamente por el asistente:

| MCP Server | Propósito Principal | Cuándo usarlo |
| :--- | :--- | :--- |
| **Notion** | Gestión de Conocimiento | Para leer/actualizar estados de leads, documentación de procesos y hojas de ruta. |
| **GitHub** | Gestión de Repositorio | Para buscar archivos, gestionar issues/PRs y entender el historial de cambios. |
| **Context7** | Inteligencia de Librerías | Para consultar documentación técnica actualizada de librerías externas (Firebase, React 19, etc.). |
| **Chrome DevTools** | Depuración Frontend | Para auditorías de rendimiento, accesibilidad (Lighthouse) y depuración de UI en tiempo real. |
| **GitKraken** | Flujo de Git | Para operaciones visuales de rama y sincronización de equipo. |

## 2. Protocolos de Operación

### 🔍 Investigación (Context7 & GitHub)

- Antes de implementar una nueva API (ej. Firebase Data Connect), usa **Context7** para obtener la documentación más reciente.
- Siempre busca patrones existentes en el repositorio usando **GitHub MCP** antes de proponer una nueva abstracción.

### 📝 Documentación (Notion)

- Al completar una tarea significativa (ej. nuevo feature de Happy Senior), verifica si existe una página en Notion para actualizar el progreso.

### ⚡️ Rendimiento (Chrome DevTools)

- Todo cambio en el Layout o Componentes críticos debe ser validado con `performance_start_trace` o `lighthouse_audit` para asegurar que cumple con los estándares de **Premium Design**.

## 3. Seguridad y Privacidad

- **Tokens:** Nunca expongas tokens de API en logs o archivos públicos.
- **X-Antigravity-Token:** Utiliza este header cuando interactúes con servicios internos que requieran validación de el "Edge Layer".

> [!IMPORTANT]
> **Dato que no está en el Workspace (o Notion), es dato que no existe.**
> Utiliza estos MCPs para asegurar que cada decisión técnica esté respaldada por datos y documentada para Richard y el equipo.
