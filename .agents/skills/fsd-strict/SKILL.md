---
name: Feature-Sliced Design (FSD) Strict Architecture Rules
description: Enforces strict adherence to the FSD methodology for the Richard Automotive project. Rules for layered dependencies, upward import prohibition, and zero cross-slice imports.
---

# Agent Skill: Feature-Sliced Design (FSD) Strict Architecture Rules

You are assisting with a codebase that strictly follows the Feature-Sliced Design (FSD) architectural methodology. Whenever you create, move, refactor, or analyze files, you MUST adhere to the following rules without exception.

## 1. The Layer Hierarchy (Top to Bottom)
The `src/` directory is divided into these specific layers. A layer can ONLY import from layers strictly BELOW it.
1. `app/`: Global settings, routing, and global providers. (Can import from all below).
2. `pages/` (or `command-center/`): Compositional layer constructing the application pages. (Can import from widgets, features, entities, shared).
3. `widgets/`: Complex standalone components combining multiple features and entities. (Can import from features, entities, shared).
4. `features/`: User interactions and business value actions (e.g., SendMessage, AddToCart, sales, inventory). (Can import from entities, shared).
5. `entities/` (Unified into `@/types/types.ts`): Business entities and domain logic (e.g., User, Article). (Can import ONLY from shared).
6. `shared/` & `infra/`: Reusable infrastructure, UI kits, API configuration, Firebase clients, and utilities. (Can ONLY import from other shared segments).

## 2. Absolute Prohibitions (Zero Exceptions)
* **No Upward Imports:** A layer MUST NEVER import from a layer above it. (e.g., `entities/` or `types/` cannot import from `features/`).
* **No Cross-Slice Imports:** Slices within the same layer MUST NEVER import from each other. (e.g., `features/auth` CANNOT import from `features/inventory`).
* **No Deep Imports:** Outside of a specific slice, you MUST ONLY import from its Public API (`index.ts`). You are strictly forbidden from bypassing the `index.ts` file to import internal components of another slice.

## 3. Execution Directives for the Agent
* Before modifying or moving any file, map out the dependencies to ensure no FSD rules are broken.
* If a user requests a change that violates these rules (e.g., importing a feature into another feature), STOP, explain the architectural violation, and propose a solution (like moving the shared logic to global state via Zustand or shifting shared code to `shared/`).
