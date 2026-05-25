# Richard Automotive: Catálogo de Nuevas Skills y Capacidades de Desarrollo

Este documento detalla las **nuevas Skills y Plugins de Ingeniería** que han sido inyectados en la cabina de **Antigravity** y cómo podemos utilizarlos proactivamente para acelerar y optimizar el desarrollo de **Richard Automotive**.

---

## 🛠️ Catálogo de Nuevas Skills en la Cabina

### 1. Google Antigravity SDK (`google-antigravity-sdk`)
* **Qué hace:** Proporciona un conjunto de herramientas y guías para diseñar, orquestar y depurar sistemas multi-agente, tareas en segundo plano programadas (*Periodic Triggers*) y persistencia de memoria conversacional.
* **Aplicación en tu Proyecto:** Permite crear flujos de trabajo donde los bots conversacionales de WhatsApp no solo respondan a leads, sino que realicen seguimiento proactivo en segundo plano, sincronicen con HubSpot y auto-gestionen el inventario.

### 2. Guía Web Moderna (`modern-web-guidance`)
* **Qué hace:** Una base de conocimiento especializada y actualizada en estándares web de última generación (React 19, Tailwind CSS 4, transiciones de vista, posicionamiento de anclas de CSS, consultas de contenedor, selectores `:has()` y `:user-valid`).
* **Aplicación en tu Proyecto:** Asegura que cualquier componente de interfaz que agreguemos en el cockpit de administración (`/admin`) o en el Deal-Matcher use código premium, moderno y optimizado para el navegador, evitando dependencias obsoletas.

### 3. Suite de Depuración de Chrome DevTools
* **Qué hace:** Permite que Antigravity se conecte e interactúe directamente con un navegador real para realizar auditorías técnicas avanzadas:
  * ⚡ `debug-optimize-lcp`: Optimiza los tiempos de carga y el LCP (Largest Contentful Paint) de la web.
  * 🧠 `memory-leak-debugging`: Diagnostica y resuelve fugas de memoria en JavaScript para mantener la web a 60 FPS.
  * ♿ `a11y-debugging`: Garantiza accesibilidad de primer nivel, asegurando que la web sea fácil de navegar en cualquier dispositivo móvil o tablet (Capacitor).
* **Aplicación en tu Proyecto:** Antes de lanzar nuevas vistas en producción, podemos correr auditorías autónomas de Lighthouse y rendimiento en la UI del cockpit para garantizar que la experiencia de Richard sea ultra-premium y fluida.

### 4. Automatización CRM & WhatsApp Avanzada (`hubspot-automation` / `whatsapp-automation`)
* **Qué hace:** Estructuras dedicadas para la integración robusta con el CRM de HubSpot y la API oficial de WhatsApp Business a través de acciones seguras de Composio.
* **Aplicación en tu Proyecto:** Permite robustecer el canal de ventas y automatizar de forma masiva la asignación de leads, creación de negocios en HubSpot y disparos de mensajes enriquecidos con botones de WhatsApp interactivos sin sobrecargar tu servidor.

---

## 📈 ¿Cómo supercargará esto a Richard Automotive?

1. **Rendimiento de Carga Ultra-Rápido:** Utilizaremos `debug-optimize-lcp` para auditar la landing page y el inventario, logrando que el catálogo cargue en menos de 1 segundo en redes celulares en Puerto Rico.
2. **Interfaz PWA Resiliente:** Con la skill `modern-web-guidance`, aseguraremos que la PWA móvil corra a la perfección en Capacitor (Android/iOS) con animaciones nativas usando Tailwind CSS 4 y Framer Motion v12.
3. **Cierre Comercial Inteligente:** Las automatizaciones de `hubspot-automation` garantizarán que cada vez que un lead sea pre-despachado con Leasing, se cree un Deal en HubSpot con la cuota mensual exacta y el banco preferido para que puedas ver el pipeline de ventas al instante.
