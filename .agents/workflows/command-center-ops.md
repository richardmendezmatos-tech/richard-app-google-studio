---
description: Richard Automotive Command Center Operations (CI/CD Local)
---

Este workflow automatiza la validación de cambios en el Richard Automotive Command Center para asegurar que cada commit mantenga el estándar "Premium" y los 60 FPS.

## 🛡️ Ejecución de Checks de Pre-Commit

1. **Linting & Code Quality**:
   ```bash
   npm run lint
   ```
   *Propósito*: Asegurar que no haya errores de sintaxis ni de estilos en la arquitectura FSD.

2. **Build Validation**:
   ```bash
   npm run build
   ```
   *Propósito*: Validar que el bundle de Vite se genere correctamente y que las dependencias de React 19 no causen conflictos.

3. **Smoke Tests (E2E)**:
   ```bash
   npm run test:e2e:smoke
   ```
   *Propósito*: Verificar que el flow de autenticación y carga inicial funcione en Chromium.

// turbo
4. **Resumen de Salud (Sentinel)**:
   ```bash
   npm run optimize
   ```
   *Propósito*: Optimizar assets y reportar la "Salud del Negocio" al Sentinel.

---
> [!IMPORTANT]
> **Regla de Oro**: Si el build falla o el lint tiene más de 0 warnings, el commit se considera "Riesgo Operativo" y debe ser corregido inmediatamente.

© 2026 Richard Automotive | Richard O. Méndez Matos
