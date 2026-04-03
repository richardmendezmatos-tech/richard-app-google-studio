---
name: command-center-ops
description: "Protocolo de ingeniería de precisión para el Richard Automotive Command Center. Gestiona el ciclo de vida de la Autonomía Sentinel (Nivel 13) con estándares de alta competición: validaciones neuro-analíticas y despliegues resilientes."
---

# 🛰️ Houston: Automotive Precision Engineering

## Objetivo: "Zero-Fault Tolerance"

Garantizar la **integridad táctica** y la **plenitud operativa** del ecosistema Sentinel. Este skill actúa como el protocolo de seguridad de Houston para asegurar que el "Chasis" lógico del sistema esté libre de fugas (Tech Debt) y que el "Motor" (Lógica de Negocio) rinda a su máxima capacidad, manteniendo la paz mental de Richard y la eficiencia de todo el equipo.

## Protocolo de Diagnóstico ADAS (Advanced Developer Assistance System)

Para que un componente sea aprobado para producción (Nivel 13), debe superar tres capas de inspección técnica:

1. **Escaneo de Integridad de Componentes (Linting)**:
   * Limpieza de "carbón" técnico en las bujías (eliminar variables y exports no utilizados).
   * Verificación de que el código no tenga "ruido" que comprometa la legibilidad futura.

2. **Prueba de Estanqueidad de Tipos (Type Safety)**:
   * Garantizar que no existan fugas de datos mediante tipado estricto (TypeScript).
   * Uso obligatorio de `next-route-adapter` para la comunicación segura entre la UI y el Motor de Datos.

3. **Crash Test de Resiliencia (Unit Testing)**:
   * Validar la respuesta de la lógica ante impactos de datos inesperados o fallos de red.
   * Implementación de **Circuit Breakers** para aislar módulos con fallos y proteger el núcleo del sistema.

## Reglas de Ingeniería de Competición (Best Practices)

* **SOLID Chassis**: La estabilidad del chasis depende del desacoplamiento. Respetar la metodología **Feature-Sliced Design (FSD)** para que cada "pieza" del auto sea intercambiable sin afectar el resto.
* **Clean Code Injection**: Inyectar solo lógica pura y legible. Si una función es demasiado compleja, es momento de un **Engine Overhaul** (Refactorización).
* **High-Performance Drivetrain**: Optimizar el rendimiento para lograr transiciones de **300ms** y una respuesta táctil inmediata. "Dato que no rinde, es peso muerto".
* **Workspace Checkpointing**: "Dato que no está en el Workspace, es dato que no existe". Cada diagnóstico debe registrarse en `workspace_checkpoints/`.

## Línea de Ensamblaje Técnica (Pipeline)

El flujo de lanzamiento sigue una secuencia de precisión absoluta:

```bash
# 1. Inspección en Foso (Dry Run)
.agents/skills/command-center-ops/scripts/release_ops.sh --dry-run --target none

# 2. Prueba de Dinamómetro (Validación Completa)
.agents/skills/command-center-ops/scripts/release_ops.sh --target none

# 3. Lanzamiento a Circuito (Vercel/Firebase)
.agents/skills/command-center-ops/scripts/release_ops.sh --target vercel
```

## Recursos de Misión

* **Motor de Lanzamiento**: `scripts/release_ops.sh`
* **Especificaciones Técnicas**: `references/ops-playbook.md`
* **Métrica de Victoria**: Estabilidad Sentinel (Latencia < 300ms, Error Rate < 0.1%).

---
*© 2026 Richard Automotive | Ingeniería Nivel 13*
