# 🏁 Richard Automotive: Operations Playbook (Sentinel Precision)

Este documento define la **secuencia de ensamblaje** para garantizar que cada actualización del ecosistema Sentinel cumpla con los estándares de ingeniería Nivel 13.

## 🩺 Inspección Técnica Pre-Vuelo (Prerequisites)

Antes de iniciar la línea de ensamblaje, asegúrese de que el entorno esté afinado:

- **Raíz del Circuito**: Ejecutar comandos siempre desde `/Users/richardmendez/richard-automotive-_-command-center`.
- **Octanaje de Dependencias**: `bun install` (recomendado) o `npm install`.
- **Inyección de Entorno**: Configuración activa vía `dotenvx` o archivos `.env` locales.

## 🚜 Línea de Ensamblaje de Precisión (Standard Pipeline)

Cada commit o despliegue debe superar la inspección automatizada:

1. **Escaneo de Integridad (`npm run lint`)**: Verificación de sensores (código) para detectar anomalías o variables sin uso.
2. **Prueba de Seguridad ADAS (`npm run test`)**: Validación de componentes en entornos de estrés controlado.
3. **Puesta a Punto del Motor (`npm run build`)**: Compilación optimizada para alto rendimiento.
4. **Entrega de Llaves (Deployment)**: Lanzamiento al target especificado.

> [!WARNING]
> **Parad el Motor**: Si se detecta un fallo en cualquier paso del pipeline, la línea de ensamblaje se detiene automáticamente para proteger la integridad del sistema.

## 📍 Puntos de Lanzamiento (Deploy Targets)

- **Vercel (Visual Layer)**:
  - Comando: `npm run deploy:vercel`
  - *Propósito*: Publicación de la interfaz de usuario con Glassmorphism y latencia optimizada.

- **Firebase (Core Engine)**:
  - **Functions**: `npm run deploy:firebase:functions` (Cerebro IA).
  - **Rules**: `npm run deploy:firebase:rules` (Seguridad del Chasis).
  - **Indexes**: `npm run deploy:firebase:indexes` (Eficiencia de Tracción).
  - **Full Overhaul**: `npm run deploy:firebase:full` (Sincronización total).

## ⚙️ Estrategia de Mantenimiento de Competición

- **Diagnóstico Rápido**: Si el pedido es ambiguo, ejecute un escaneo sin impacto:
  `.agents/skills/command-center-ops/scripts/release_ops.sh --dry-run --target none`
- **Tensión de Cadena**: Realice una validación real antes de cualquier lanzamiento crítico:
  `.agents/skills/command-center-ops/scripts/release_ops.sh --target none`
- **Lanzamiento Confirmado**: Solo proceda al despliegue con tracción final verificada.

---
*Manual de Ingeniería © 2024 Richard Automotive*
