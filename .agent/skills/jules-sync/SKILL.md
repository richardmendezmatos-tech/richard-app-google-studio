---
name: jules-sync
description: Integrates with Jules agent for asynchronous task delegation and PR execution.
---

# Jules Sync Skill

This skill enables Antigravity to collaborate with the Jules agent (jules.google.com) for advanced repository management.

## Role Definition

- **Antigravity (Supervisor)**:
  - Requirement analysis and high-level architecture.
  - Creation of technical mandates (`implementation_plan.md`).
  - Regression testing and PR verification.
- **Jules (Executor)**:
  - Repository-wide refactoring.
  - Dependency audits and security patching.
  - Automated PR creation and initial unit testing.

## Protocol Nivel 11: Invocación de Delegado

Para delegar eficientemente, usa el comando estructurado:
`@jules [accion] --plan [ruta_al_plan] --verify`

### Banderas Obligatorias

- `--plan`: Ruta absoluta o relativa al `implementation_plan.md`.
- `--verify`: Indica que Antigravity verificará el PR automáticamente tras la creación.

## Trigger Scenarios

- `@jules update dependencies --plan ./ag.env`: Run a full audit and update project dependencies.
- `@jules refactor [feature] --plan ./brain/task/implementation_plan.md --verify`: Complex structural changes.
- `@jules fix-lint --plan ./brain/task/lint_report.md`: Resolution of multi-file linting issues.
