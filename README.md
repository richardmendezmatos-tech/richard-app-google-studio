# 🚗 Richard Automotive: AI Finance Advisor

**Transformando la experiencia de financiamiento de autos en Puerto Rico.**

Este proyecto es el motor de inteligencia artificial para la marca personal de **Richard Méndez**. Utiliza modelos de lenguaje avanzados para asesorar a clientes sobre F&I (Finance & Insurance), seguros de vida y cierres de préstamos vehiculares.

---

## 🛠️ Tecnologías

- **Motor IA:** Google Gemini API (v1.5 Flash/Pro)
- **Backend:** Firebase (Functions & Firestore)
- **Frontend:** HTML5 / Tailwind CSS (Diseño Minimalista)
- **Seguridad:** Capas de protección anti-prompt injection

## 🧠 Características del Asistente

El chatbot está entrenado para manejar la lógica compleja de un **F&I Manager**:

- **Cálculo Consultivo:** Explicación del impacto del pronto (down payment) en el pago mensual.
- **Asesoría de Seguros:** Integración de pólizas de vida y protección de activos (GAP).
- **Manejo de Objeciones:** Estrategias para clientes con crédito afectado o puntuaciones bajas.
- **Captura de Leads:** Flujo optimizado para convertir dudas en citas presenciales.

## 🔒 Seguridad y Privacidad

Este repositorio incluye una arquitectura de seguridad diseñada para:

1. Prevenir la revelación de instrucciones internas (System Prompts).
2. Proteger la identidad y los datos comerciales de la marca.
3. Garantizar un tono profesional y ético en todas las interacciones.

## 📂 Estructura del Proyecto

- `/public`: Interfaz web del chat.
- `/functions`: Lógica de conexión con la API de Gemini.
- `/prompts`: Manuales de identidad y escenarios de entrenamiento (Few-shot prompting).

## Guía de Inicio Rápido (Local)

1. Abre la terminal y ejecuta:

   ```bash
   npm install
   npm run dev
   ```

2. Haz clic en el enlace `http://localhost:5173`.

## Despliegue en Vercel (Producción)

1. **Sube tu código a GitHub.**
2. **Conecta con Vercel:** Ve a [vercel.com](https://vercel.com) e importa tu repositorio.
3. **Configura la API Key:**
   - En **Environment Variables**, agrega:
     - **Key:** `API_KEY`
     - **Value:** (Tu API Key de Google Gemini)
4. **Deploy:** Vercel detectará automáticamente la configuración.

---

## 🛰️ Antigravity Workspace (Nivel 13)

Este repositorio opera bajo el **Protocolo Antigravity**. Toda la inteligencia estratégica y técnica está documentada en:

- [Visión Nivel 13: Houston](file:///Users/richardmendez/richard-automotive-_-command-center/docs/antigravity/NIVEL_13_VISION.md)
- [Visión Nivel 14: Anticipación](file:///Users/richardmendez/richard-automotive-_-command-center/docs/antigravity/NIVEL_14_VISION.md)
- [SOP: Clean Architecture](file:///Users/richardmendez/richard-automotive-_-command-center/docs/antigravity/CLEAN_ARCHITECTURE_SOP.md)
- [Protocolo de Ejecución](file:///Users/richardmendez/richard-automotive-_-command-center/docs/antigravity/PROTOCOL_ANTIGRAVITY_5.md)
- [Log de Tareas (Sesión)](file:///Users/richardmendez/richard-automotive-_-command-center/docs/antigravity/SESSION_TASK_LOG.md)
- [Walkthrough (Sesión)](file:///Users/richardmendez/richard-automotive-_-command-center/docs/antigravity/SESSION_WALKTHROUGH.md)

© 2026 Richard Automotive | Richard O. Méndez Matos
_Expertise en F&I, Seguros y Financiamiento Automotriz._
