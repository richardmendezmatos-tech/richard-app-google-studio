# Tareas: Frontend Clean Architecture Refactor (Session Log)

- [x] Fase de Auditoría e Identificación
  - [x] Establecer Protocolo Nivel 5
  - [x] Escanear fugas de infraestructura en `src/`
  - [x] Mapear servicios acoplados

- [x] Fase 1: Núcleo de Dominio y Aplicación
  - [x] Crear `src/domain/entities` y `src/domain/repositories`
  - [x] Implementar Casos de Uso en `src/application/use-cases`
  - [x] Verificar independencia del framework

- [x] Fase 2: Capa de Infraestructura (Adapters)
  - [x] Implementar `FirestoreLeadRepository` (Client-side)
  - [x] Implementar `FirestoreInventoryRepository` (Client-side)
  - [x] Configurar Inyección de Dependencias (hooks/contexts)

- [x] Fase 3: Refactorización de UI
  - [x] Migrar Vistas de Leads a Use Cases (`AdminPanel`, `KanbanBoard`)
  - [x] Migrar Buscador de Inventario a Use Cases (Capa `InventoryRepository`)
  - [x] Eliminar importaciones prohibidas de componentes

- [x] Fase 4: Verificación y QA
  - [x] Ejecutar Smoke Tests visuales
  - [x] Verificar paridad de funcionalidad
  - [x] Build final de producción

- [x] Misión: NotebookLM (Cerebro Operativo)
  - [x] Instalar servidor `notebooklm-mcp`
  - [x] Crear script `sync-to-notebook.ts`
  - [x] Sincronizar Inventario a Markdown
  - [x] Configurar comando `npm run sync:notebook`
  - [x] Carga inicial exitosa vía subagente

- [x] Optimización del Subagente
  - [x] Diseñar estrategia de selectores robustos
  - [x] Crear "DNA Map" de NotebookLM (Selectores)
  - [x] Implementar Script de Rotación (Eliminar -> Cargar)
  - [x] Probar inyección directa de Datos

- [x] Sprint Cero: Purificación de Triggers & Scheduler
  - [x] Crear nuevos Casos de Uso (Lead Apps, Stale Leads, Price Drops)
  - [x] Implementar `FirestoreLogRepository`
  - [x] Refactorizar `index.ts` y Triggers de Cloud Functions
  - [x] Refactorizar `emailScheduler.ts`
  - [x] Validar despliegue agnóstico total

- [x] Fase: Estética Premium (Ultra-Premium)
  - [x] Implementar Hook de Luz Dinámica (`useMouseGlow`)
  - [x] Refinar `AdminPanel` con estilos `glass-sentinel`
  - [x] Premiumizar `KanbanBoard` y `LeadCard`
  - [x] Verificar fidelidad visual y rendimiento

- [x] Fase Houston Dash: Telemetría & Infra (Nivel 13)
  - [x] Definir `HoustonRepository` (Dominio)
  - [x] Implementar `GetHoustonTelemetry` (Application)
  - [x] Implementar `FirestoreHoustonRepository` (Infrastructure)
  - [x] Inyectar dependencias en `DIContainer`
  - [x] Crear Layout y Widgets iniciales del Dashboard
  - [x] Registrar rutas y navegación Houston
  - [x] Blindar `firestore.rules` (Fix Passkey Permissions)
  - [x] Eliminar Estilos Inline (Lint Zero Tolerance)
