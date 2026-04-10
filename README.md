# 🚗 Richard Automotive: Command Center & AI Finance Advisor

> [!CAUTION]
> **PROYECTO EXCLUSIVAMENTE AUTOMOTRIZ**
> Este repositorio es para un portal web de servicios automotrices, F&I y seguros de vida vinculados a la industria. **NO tiene relación alguna con servicios de asistencia a envejecientes o adultos mayores.**

**Transformando la experiencia de financiamiento de autos en Puerto Rico a través de la Autonomía Sentinel y el Houston Command Center.**

Este proyecto es el motor de inteligencia artificial para la marca personal de **Richard Méndez**, Gerente de Financiamiento en **Central Ford, Vega Alta**. Utilice este centro de mando para monitorear leads, telemetría de usuarios y automatizar el marketing para unidades de **Ford, Hyundai y Trucks Freightliner**.

---

## 🚀 Sentinel 3.5: Houston Command Center (Fase de Producción)

La versión **3.5** consolida la arquitectura de **Siguiente Generación**, transformando el portal en una plataforma de alto rendimiento para cierres de ventas.

### 🛠️ Tecnologías Core (Stack Actualizado)

- **Framework:** **Next.js 15 (App Router)** - SSR/ISR para máximo performance y SEO.
- **Base de Datos Principal:** **Firebase Data Connect (PostgreSQL)** para gestión de Leads e Inventario con esquemas estrictos.
- **Inteligencia Vectorial:** **Supabase + pgvector** para "Neural Matching" (búsqueda semántica de unidades).
- **Motor IA:** Google Gemini API 1.5 (Pro/Flash) para generación de contenido y scoring de leads.
- **Infraestructura:** Desplegado en **Vercel** con sincronización automática de GitHub.

### 🧠 Capacidades de Vanguardia

- **Houston Dashboard:** Monitor de salud del negocio en tiempo real.
    - **Pipeline de Leads:** Visualización del flujo de ventas impulsado por SQL.
    - **Telemetría Neural:** Rastreo de la intención de compra del usuario mediante eventos dinámicos.
    - **AI Marketing Engine:** Generación automática de copys para Instagram/Facebook/TikTok basados en psicología de ventas.
- **Approval Simulator:** Widget de alta conversión que permite al cliente pre-cualificarse financieramente antes de llegar al dealer.
- **Business Health Widget:** Métricas en vivo (Lead Velocity, AI Score, Conversion Rate) directamente desde Data Connect.

## 🏗️ Arquitectura del Proyecto (FSD Strict)

El proyecto sigue la metodología **Feature-Sliced Design (FSD)** para garantizar escalabilidad:

- `src/app`: Rutas de Next.js, layouts globales y providers.
- `src/widgets`: Componentes complejos de negocio (ej. `HoustonDashboard`, `ApprovalSimulator`).
- `src/features`: Lógica de comportamiento (ej. `leads`, `inventory-matching`).
- `src/entities`: Modelos de negocio y repositorios (ej. `LeadRepository` con adaptador SQL).
- `src/shared`: Componentes UI atómicos, hooks y configuración de clientes (Firebase, Supabase).

## 🚀 Despliegue en Producción

El Command Center está operando en vivo en la infraestructura de Richard Automotive:

- **Producción:** [www.richard-automotive.com](https://www.richard-automotive.com)
- **Houston Access:** Requiere token de acceso interno para visualización de telemetría y datos de leads.

---

© 2026 Richard Automotive | Richard O. Méndez Matos | Central Ford, Vega Alta
*Gerente de F&I, Seguros y Financiamiento Automotriz.*
