# Richard Automotive: FSD Architecture & Import Rules

## Overview
This project follows a Pragmatic Feature-Sliced Design (FSD) architecture. The goal is to maximize maintainability, scalability, and code discovery while avoiding over-engineering in early stages.

## Architectural Layers (Dependency Graph)
From top to bottom. A layer can only import from layers **below** it.

1. **App (`src/App.tsx`, `src/store/`)**: Global application setup, routing, and global providers.
2. **Pages (`src/command-center/`)**: Route-level components mapping URLs to views.
3. **Features (`src/features/`)**: Scoped business logic and UI (e.g., `auth`, `inventory`, `sales`).
4. **Shared / Types (`src/types/types.ts`, `src/shared/`, `src/infra/`)**: Reusable UI components, global types, utilities, and infrastructure (Firebase, API).

## ⚠️ Hard Constraints & Import Rules

### 1. Downward Imports Only
- `features` CAN import from `shared`, `infra`, or `types`.
- `shared` CANNOT import from `features`.
- `infra` CANNOT import from `features`.

### 2. Feature Isolation (No Cross-Imports)
- A feature slice (e.g., `features/auth`) **CANNOT** import directly from another feature slice (e.g., `features/inventory`).
- If two features need to share logic or state, that logic must be extracted to the `shared/` layer or managed via global state (Zustand).

### 3. Single Source of Truth for Domain Entities
- ALL primary business entities (`Car`, `AppUser`, `Lead`, `Venta`) must be defined in and exported from: **`@/types/types`**
- Do NOT create `domain/entities/` folders inside feature slices.
- Do NOT use old paths like `@/domain/entities` or `../../domain/Venta`.
- **✅ Correct**: `import { Car, AppUser } from '@/types/types';`

### 4. Relative vs Absolute Imports
- Use **relative imports** (`./` or `../`) ONLY when importing files within the SAME feature slice or module.
- Use **absolute imports** (`@/`) for EVERYTHING else (cross-layer imports).
- **✅ Correct**: `import { Button } from '@/shared/brand-ui/Button';` (Absolute cross-layer)
- **✅ Correct**: `import { useAuth } from './useAuth';` (Relative inside the same slice)
- **❌ Incorrect**: `import { Car } from '../../../../types/types';` (Should be absolute)

## Specific Core Paths
- **`@/types/types`**: Unified domain models.
- **`@/shared/brand-ui`**: Centralized, business-agnostic UI components (Design System).
- **`@/infra`**: External adapters (Firebase repositories, DI container abstracting the specific backend).
- **`@/services`**: Shared application services (like `aiService`, `firebaseService`).

By strictly adhering to these rules, we ensure the codebase remains decoupled, avoiding circular dependencies and keeping the dependency graph flowing in a single downward direction.
