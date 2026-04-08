# 🚗 Richard Automotive: AI Finance Advisor

> [!CAUTION]
> **PROYECTO EXCLUSIVAMENTE AUTOMOTRIZ**
> Este repositorio es para un portal web de servicios automotrices, F&I y seguros de vida vinculados a la industria. **NO tiene relación alguna con servicios de asistencia a envejecientes o adultos mayores.**

**Transformando la experiencia de financiamiento de autos en Puerto Rico a través de la Autonomía Sentinel.**

Este proyecto es el motor de inteligencia artificial para la marca personal de **Richard Méndez**, Gerente de Financiamiento en **Central Ford, Vega Alta**. Utiliza modelos de lenguaje avanzados para asesorar a clientes sobre F&I (Finance & Insurance), seguros de vida y cierres de préstamos vehiculares para marcas como **Ford, Hyundai y Trucks Freightliner**.

---

## 🚀 Sentinel 3.3: Autonomous Ecosystem (Nivel 13)

La versión **3.3 (Sentinel)** marca la transición del Nivel 12 al **Nivel 13**, transformando el repositorio de una herramienta de gestión a un **Cerebro de Negocio Autónomo**.

### 🛠️ Tecnologías Core

- **Motor IA:** Google Gemini API (v1.5 Flash/Pro) vía Firebase Genkit (Houston Layer).
- **Orquestación:** **Houston Event Bus** basado en RxJS para reacciones asíncronas y desacopladas.
- **Resiliencia:** Capa de **Autocuración Digital** (Circuit Breakers + Live Rehydration).
- **Frontend App:** Vite + React 19 (Strict Mode) + Tailwind CSS (Glassmorphism).
- **Mobile UX:** Navegación Háptica Predictiva y transiciones de 300ms.

### 🧠 Capacidades Avanzadas

- **Neuro-Trajectory Tracking:** Análisis en tiempo real de la intención de compra mediante patrones de navegación.
- **Autonomous Nudges:** Disparo automático de estrategias de cierre (WhatsApp/Email) en el momento cognitivo óptimo.
- **Digital Self-Healing:** Mitigación proactiva de fallos de infraestructura con resguardo en local-first.
- **Hyper-Inventory List:** Renderizado virtualizado para >10,000 unidades con performance de 60fps.

## 🏗️ Arquitectura del Proyecto (FSD Strict)

El proyecto sigue la metodología **Feature-Sliced Design (FSD)** para garantizar escalabilidad y modularidad total:

- `src/app`: Configuración global, proveedores (Context, Providers) y estilos base.
- `src/pages`: Vistas completas de la aplicación guiadas por rutas.
- `src/widgets`: Componentes complejos compuestos por múltiples features (ej. `CommandCenterWidget`).
- `src/features`: Funcionalidad de negocio específica que aporta valor al usuario (ej. `appraisal`, `leads`).
- `.../model`: Lógica de estado y validación.
- `.../ui`: Componentes visuales de la feature.
- `.../api`: Llamadas a servicios de datos.
- `src/entities`: Lógica de negocio core y modelos de datos fundamentales (ej. `inventory`, `user`).
- `src/shared`: Componentes UI reutilizables (shadcn/ui), utilidades y configuración de APIs.

## 🧠 Características del Asistente

El chatbot está entrenado para manejar la lógica compleja de un **F&I Manager**:

- **Cálculo Consultivo:** Explicación del impacto del pronto (down payment) en el pago mensual.
- **Asesoría de Seguros:** Integración de pólizas de vida y protección de activos (GAP).
- **Manejo de Objeciones:** Estrategias para clientes con crédito afectado o puntuaciones bajas.
- **Captura de Leads:** Flujo optimizado para convertir dudas en citas presenciales.

## Guía de Inicio Rápido (Local)

1. Abre la terminal y ejecuta preferiblemente con **Bun**:

   ```bash
   bun install
   bun dev
   ```

   O con **NPM**:

   ```bash
   npm install
   npm run dev
   ```

2. Haz clic en el enlace `http://localhost:5173`.

## 🛰️ Antigravity Workspace (Nivel 13)

Este repositorio opera bajo el **Protocolo Antigravity**. La inteligencia estratégica y técnica está centralizada en estos puntos:

- **Reglas de IA:** [.cursorrules](file:///Users/richardmendez/richard-automotive-_-command-center/.cursorrules) — *Single Source of Truth* para el comportamiento del asistente.
- **Visión Nivel 13:** [Houston](file:///Users/richardmendez/richard-automotive-_-command-center/docs/antigravity/NIVEL_13_VISION.md)
- **Protocolo de Ejecución:** [Protocolo Antigravity 5](file:///Users/richardmendez/richard-automotive-_-command-center/docs/antigravity/PROTOCOL_ANTIGRAVITY_5.md)

---
© 2026 Richard Automotive | Richard O. Méndez Matos | Central Ford, Vega Alta
*Gerente de F&I, Seguros y Financiamiento Automotriz.*
