---
name: jules-sync
description: Integrates with Jules agent for asynchronous task delegation and PR execution.
---

# Jules Sync Skill

This skill enables Antigravity to collaborate with the Jules agent (jules.google.com) for advanced repository management.

## Role Definition
- **Antigravity (Supervisor)**: 
  - Requirement analysis.
  - High-level planning.
  - Verification of implemented changes via browser tools.
  - Final approval.
- **Jules (Executor)**:
  - Deep repository scans.
  - Complex refactoring across multiple files.
  - Dependency management and security patching.
  - Creating and managing Pull Requests on GitHub.

## How to Delegate to Jules
When a task is identified as "High Complexity" or "Asynchronous", Antigravity should:
1. Document the objective in an `implementation_plan.md`.
2. Use the `@jules` invocation in the task summary to trigger delegaton.
3. Transition to VERIFICATION mode once Jules reports completion of the PR.

## Trigger Scenarios
- `@jules update dependencies`: Run a full audit and update project dependencies.
- `@jules generate docs`: Create or update documentation based on the current codebase state.
- `@jules refactor [context]`: Perform a complex structural change described in the context.
