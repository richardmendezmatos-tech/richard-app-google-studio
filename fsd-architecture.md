# Richard Automotive: FSD Architecture & Import Rules

## Overview

This project follows a Modular Feature-Sliced Design (FSD) architecture. The goal is to maximize maintainability, scalability, and code discovery while maintaining a clear, non-cyclic dependency graph.

## Architectural Layers (Dependency Graph)

From top to bottom. A layer can only import from layers **below** it.

1. **App (`src/app/`)**: Global application setup, routing, and global providers.
2. **Pages (`src/pages/`)**: Route-level components mapping URLs to views.
3. **Widgets (`src/widgets/`)**: Self-contained UI blocks combining features or entities (e.g., `ai-chat`, `inventory-viewer`).
4. **Features (`src/features/`)**: Scoped business logic and UI (e.g., `auth`, `appraisal`, `sales`).
5. **Entities (`src/entities/`)**: Domain-specific logic, data transformation, and types (e.g., `car`, `appraisal`, `lead`).
6. **Shared (`src/shared/`)**: Reusable UI components, global types, utilities, and infrastructure (Firebase, API).

## ⚠️ Hard Constraints & Import Rules

### 1. Downward Imports Only

- `features` CAN import from `entities` or `shared`.
- `pages` CAN import from `widgets`, `features`, `entities`, or `shared`.
- `entities` CANNOT import from `features` or `pages`.
- `shared` CANNOT import from any layer above it.

### 2. Feature & Entity Isolation (No Cross-Imports)

- A feature slice (e.g., `features/auth`) **CANNOT** import directly from another feature slice (e.g., `features/appraisal`).
- An entity slice (e.g., `entities/car`) **CANNOT** import from another entity slice (e.g., `entities/lead`).
- If two features need to share logic, that logic must be extracted to the `entities` layer or a `shared` utility.

### 3. Public API (Public Index)

- All interaction with a slice MUST go through its root `index.ts`.
- **❌ Incorrect**: `import { MyComponent } from '@/features/auth/ui/MyComponent';`
- **✅ Correct**: `import { MyComponent } from '@/features/auth';`

### 4. Domain Types (Single Source of Truth)

- Primary business entities must be defined in their respective `entities/<slice>/model/types.ts`.
- `shared/types/types.ts` is reserved for global primitives and shared DTOs only.

### 5. Relative vs Absolute Imports

- Use **relative imports** (`./` or `../`) ONLY when importing files within the SAME slice.
- Use **absolute imports** (`@/`) for EVERYTHING else (cross-layer or cross-slice imports).
