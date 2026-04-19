# 🚗 Richard Automotive: Command Center & AI Finance Advisor

> [!CAUTION]
> **PROYECTO EXCLUSIVAMENTE AUTOMOTRIZ**
> Este repositorio es para un portal web de servicios automotrices, F&I y seguros de vida vinculados a la industria. **NO tiene relación alguna con servicios de asistencia a envejecientes o adultos mayores.**

**Transformando la experiencia de financiamiento de autos en Puerto Rico a través de la Autonomía Sentinel y el Houston Command Center.**

Este proyecto es el motor de inteligencia artificial para la marca personal de **Richard Méndez**, Gerente de Financiamiento en **Central Ford, Vega Alta**. Utilice este centro de mando para monitorear leads, telemetría de usuarios y automatizar el abasto de inventario para unidades de **Ford, Hyundai y Trucks Freightliner**.

---

## 🚀 Sentinel 4.5: Houston Command Center (Neural Edition)

La versión **4.5** consolida la arquitectura de **Siguiente Generación**, eliminando deuda técnica y centralizando la inteligencia en un ecosistema unificado.

### ⚡️ Sentinel Performance Engine (Powered by Bun)
Para maximizar la eficiencia ($E_w$) y reducir la fricción en el desarrollo y despliegue, el proyecto utiliza **Bun** como runtime principal:
- **Builds Instantáneos**: Reducción drástica en tiempos de compilación.
- **Gestión de Paquetes**: Instalación de dependencias 20x más rápida que npm.
- **Script Execution**: Ejecución de telemetría y scripts de optimización con latencia mínima.

### 🛠️ Tecnologías Core (Stack Actualizado)

- **Framework:** **Next.js (App Router)** - SSR/ISR para máximo performance y SEO.
- **Base de Datos Unificada:** **Supabase (PostgreSQL)** como única fuente de verdad para Inventario, Sourcing y Telemetría.
- **Inteligencia Vectorial:** **pgvector** para "Neural Matching" (búsqueda semántica de unidades).
- **Motor IA:** Google Gemini API 1.5 (Pro/Flash) para generación de Purchase Orders y scoring de leads.
- **Infraestructura:** Desplegado en **Vercel** con CI/CD optimizado vía Bun.

### 🧠 Capacidades de Vanguardia

- **Neural Sourcing Intelligence (Nivel 19):** Transformación de "Search Gaps" en Órdenes de Compra (POs) sugeridas. Richard puede confirmar o archivar oportunidades de ROI directamente desde Houston.
- **Houston Dashboard (V5.0):** Monitor de salud del negocio en tiempo real.
    - **Sourcing Tab:** Gestión proactiva de inventario estratégico.
    - **Pipeline de Leads:** Visualización del flujo de ventas impulsado por SQL.
    - **Telemetría Neural:** Rastreo de la intención de compra del usuario mediante eventos dinámicos.
- **Approval Simulator (Fase 2):** Widget de alta conversión que permite al cliente pre-cualificarse financieramente con perfiles de crédito dinámicos.
- **Asset Optimization:** Pipeline de procesamiento de imágenes con `sharp` para entregas en AVIF de próxima generación.

## 🏗️ Arquitectura del Proyecto (FSD Strict)

El proyecto sigue la metodología **Feature-Sliced Design (FSD)** para garantizar escalabilidad:

- `src/app`: Rutas de Next.js, layouts globales y providers.
- `src/widgets`: Componentes complejos de negocio (ej. `HoustonDashboard`, `ApprovalSimulator`).
- `src/features`: Lógica de comportamiento (ej. `houston`, `automation`, `inventory`).
- `src/entities`: Modelos de negocio y repositorios (ej. `InventoryRepository` unificado en Supabase).
- `src/shared`: Componentes UI atómicos, hooks y configuración de clientes (Supabase Core).

## 🚀 Despliegue en Producción

El Command Center está operando en vivo en la infraestructura de Richard Automotive:

- **Portal Público:** [www.richard-automotive.com](https://www.richard-automotive.com)
- **Houston Access:** Terminal de inteligencia restringida para Richard y el equipo Sentinel.

---

© 2026 Richard Automotive | Richard O. Méndez Matos | Central Ford, Vega Alta
*Gerente de F&I, Seguros y Financiamiento Automotriz.*
