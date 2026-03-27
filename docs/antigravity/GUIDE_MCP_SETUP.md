# 🛰️ Guía de Configuración MCP: Richard Automotive

Esta guía te ayudará a activar la "Inteligencia Total" de tu asistente configurando las claves necesarias en `.cursor/mcp.json`.

## 1. Context7 (Documentación Técnica Live)
Para que yo pueda leer la documentación de **React 19** y **Firebase** en tiempo real.
- **Obtén la Key**: Regístrate en [Upstash Context7](https://upstash.com/context7).
- **Configura**: Reemplaza `"UPSTASH_CONTEXT7_API_KEY"` en `.cursor/mcp.json` con tu clave.

## 2. Notion (Cerebro de Negocio)
Para conectar tus leads e inventario directamente con el código.
- **Obtén el Token**: Crea una integración en [Notion Developers](https://developers.notion.com/my-integrations).
- **Configura**: Reemplaza `"NOTION_API_TOKEN"` en `.cursor/mcp.json`.

## 3. GitHub (Gestión de Código)
Para que yo pueda gestionar issues y PRs de forma autónoma.
- **Obtén el Token**: Crea un Personal Access Token (classic) con permisos de `repo` en [GitHub Settings](https://github.com/settings/tokens).
- **Configura**: Reemplaza `"GITHUB_PERSONAL_ACCESS_TOKEN"` en `.cursor/mcp.json`.

---

### 🔄 Cómo Reiniciar
Una vez que pegues las claves:
1. Abre **Cursor Settings** (`Cmd + Shift + J` o el icono de engranaje).
2. Ve a la pestaña **General** -> **MCP**.
3. Verás una lista de servidores. Haz clic en el botón de **Refrescar** (flechas circulares) en cada uno.
4. Si el círculo se pone **Verde**, ¡estamos conectados!

> [!TIP]
> **Seguridad**: Nunca subas el archivo `mcp.json` con claves reales a un repositorio público. Cursor lo mantiene local por defecto, pero ten precaución.

---
**Richard Automotive Command Center** - *Excelencia Operativa mediante IA.* 🏁
