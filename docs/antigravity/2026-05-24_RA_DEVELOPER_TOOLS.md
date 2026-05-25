# Richard Automotive: Catálogo de Nuevas Herramientas MCP y Agentes

Este documento describe las **nuevas herramientas de integración de sistemas (MCP - Model Context Protocol)** que han sido añadidas al Command Center, ampliando drásticamente el alcance y la automatización del dealer.

---

## 🔧 Las Nuevas Herramientas MCP Disponibles

Con la eliminación de intermediarios, Antigravity puede utilizar proactivamente los siguientes servidores y herramientas MCP para interactuar con tu ecosistema real en Vega Alta:

### 1. Chrome DevTools MCP (Automatización de Navegador)
* **Qué hace:** Permite a los agentes interactuar con un navegador real (Chrome/Chromium), navegar a páginas, rellenar formularios, hacer clic en botones y auditar el código visualmente.
* **Herramientas Clave:**
  * 📸 `take_screenshot`: Captura fotos de la UI en tiempo real para verificar que el diseño premium (glassmorphism/modo oscuro) se vea espectacular.
  * ⚡ `lighthouse_audit`: Realiza auditorías automatizadas de velocidad de carga, SEO y accesibilidad móvil.
  * 🏎️ `performance_start_trace`: Rastrea tiempos de CPU y renderizado para asegurar que la web corra a 60 FPS estables.

### 2. GitKraken & GitHub MCP (Control del Repositorio)
* **Qué hace:** Herramientas para la sincronización y control visual del flujo de trabajo en Git, facilitando la creación de ramas, composición de commits y despliegue rápido.
* **Herramientas Clave:**
  * 🗂️ `gitkraken_workspace_list`: Mapea y monitorea los repositorios y ramas del equipo.
  * 🚀 `gitlens_launchpad`: Facilita la integración continua de cambios directamente en producción.

### 3. Supabase MCP (Control de Datos & SQL Directo)
* **Qué hace:** Permite que los agentes interactúen con la base de datos de Supabase de forma segura para optimizar el esquema de la base de datos, ejecutar consultas complejas, diagnosticar logs y generar tipos TypeScript automáticamente.
* **Herramientas Clave:**
  * 📊 `execute_sql`: Permite realizar auditorías rápidas del esquema de datos y optimizar consultas PostgreSQL.
  * 🔑 `generate_typescript_types`: Genera de forma automática los tipos estrictos de TypeScript basados en el estado de las tablas de Supabase en producción, garantizando que el compilador no falle.

### 4. HubSpot & Twilio (MCP Integrado)
* **Qué hace:** Conecta las inteligencias de IA con tus flujos reales de CRM (HubSpot) y telefonía (Twilio/WhatsApp) usando llamadas puras del Edge Layer.
* **Herramientas Clave:**
  * 💼 `HUBSPOT_CREATE_DEAL` & `HUBSPOT_CREATE_CONTACT`: Automatizan la creación de clientes y estructuración de negocios en tu pipeline de ventas.

---

## 💡 Innovación Propuesta: La Nueva Herramienta del Dealer

Podemos crear una **herramienta interna dedicada** en tu servidor (`/api/command-center/tools`) para uso exclusivo del **AI Sentinel Advisor**:

* **`autoDeskDeal(leadId, vehicleId)`**: Un endpoint autónomo que recibe el ID de un lead y el vehículo de interés, ejecuta el motor matemático de F&I de Puerto Rico, cotiza la mensualidad más baja en leasing o convencional cruzando las tasas de Popular, FirstBank y Oriental, y guarda la oferta estructurada directamente en Supabase.
  * *Estatus:* Esta lógica ya fue creada en el caso de uso de ingesta, por lo que podemos exponerla como una herramienta nativa para que **Houston AI** pueda "despachar" ofertas conversacionalmente cuando Richard se lo pida en el chat.
