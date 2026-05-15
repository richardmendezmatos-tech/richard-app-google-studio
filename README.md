# 🚗 Richard Automotive: Command Center & AI Finance Advisor

> [!CAUTION]
> **PROYECTO EXCLUSIVAMENTE AUTOMOTRIZ**
> Este repositorio es para un portal web de servicios automotrices, F&I y seguros de vida vinculados a la industria. **NO tiene relación alguna con servicios de asistencia a envejecientes o adultos mayores.**

**Transformando la experiencia de financiamiento de autos en Puerto Rico a través de la Autonomía Sentinel y el Houston Command Center.**

Este proyecto es el motor de inteligencia artificial para la marca personal de **Richard Méndez**, Gerente de Financiamiento en **Central Ford, Vega Alta**. Utilice este centro de mando para monitorear leads, telemetría de usuarios y automatizar el abasto de inventario para unidades de **Ford, Hyundai y Trucks Freightliner**.

---

## 🚀 Sentinel N24: Hardened Infrastructure

La versión **N24** representa la madurez técnica absoluta del ecosistema, eliminando dependencias fragmentadas (Firebase/GCP) y consolidando todo en un núcleo resiliente basado en **npm** y **Supabase**.

### ⚡️ Estabilidad Industrial (Powered by npm)
Para asegurar despliegues predecibles y una gestión de dependencias robusta en entornos de alta producción (Vercel), el proyecto utiliza **npm** como gestor principal:
- **Lockfile Determinístico**: Eliminación de inconsistencias entre entornos de desarrollo y producción.
- **Producción Vercel-Ready**: Optimización del pipeline de build para despliegues rápidos y seguros.

### 🛠️ Tecnologías Core (Unified Stack)

- **Framework:** **Next.js (App Router)** - Arquitectura de componentes de servidor para máximo SEO y velocidad.
- **Base de Datos Unificada:** **Supabase (PostgreSQL)** - Única fuente de verdad. Manejo de inventario, leads y telemetría bajo un mismo esquema SQL.
- **Inteligencia Vectorial:** **pgvector** en Supabase para "Neural Matching" (búsqueda semántica avanzada).
- **Motor IA:** **Google Gemini API 1.5** - Visión de inventario y análisis predictivo de sourcing.
- **Infraestructura:** Desplegado en **Vercel** con integración profunda de Supabase CLI.

### 🧠 Capacidades de Vanguardia
- **Neural Sourcing Intelligence (Nivel 24):** El sistema analiza automáticamente los "Search Gaps" de los usuarios para generar borradores de órdenes de compra (POs).
- **Sistema de Resiliencia de Imágenes (N24-R):** Motor inteligente en `OptimizedImage` que maneja fallos de carga mediante re-intentos automáticos y fallbacks a placeholders optimizados, garantizando una UI impecable incluso ante inconsistencias de red o datos.
- **Protocolo de Normalización de Inventario:** Auditoría automatizada que consolida campos legados (`img`) al nuevo estándar `image` y sincroniza galerías multimedia.
- **Houston Command Center:** Panel de control táctico con telemetría en tiempo real:
    - **Sourcing Management:** Aprobación inmediata de inventario estratégico.
    - **Performance Sentinel:** Optimización dinámica de LCP y TBT para garantizar una experiencia fluida de 60 FPS en dispositivos móviles.
- **Approval Simulator:** Widget premium para la pre-cualificación financiera dinámica.

## 🏗️ Arquitectura del Proyecto (FSD Strict)

El proyecto sigue rigurosamente la metodología **Feature-Sliced Design (FSD)**:

- `src/app`: Rutas de Next.js, configuraciones de API y layouts.
- `src/widgets`: Bloques funcionales complejos (ej. `HoustonDashboard`, `CommandCenter`).
- `src/features`: Capacidades de negocio (ej. `houston`, `inventory`, `predictive`).
- `src/entities`: Modelos de datos y estados de negocio.
- `src/shared`: Utilidades, diseño atómico y clientes de API (Supabase Singleton).

## 🚀 Despliegue y Acceso

- **Portal Público:** [www.richard-automotive.com](https://www.richard-automotive.com)
- **Houston Access:** Terminal de inteligencia restringida para gestión táctica.

---

© 2026 Richard Automotive | Richard O. Méndez Matos | Central Ford, Vega Alta
*Gerente de F&I, Seguros y Financiamiento Automotriz.*
