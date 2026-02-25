---
description: Jules Agent Integration Workflow (Supervisor-Delegate Pattern)
---

# Jules Sync Workflow

This workflow defines how Antigravity (Supervisor) and Jules (Executor) work together to maintain the repository.

## Step 1: Strategy & Planning (Antigravity)

- Receive user objective.
- Perform initial research using `grep_search` and `view_file`.
- Identify if the task is suitable for Jules (Complex refactors, dependency updates).
- Create a detailed `implementation_plan.md`.

## Step 2: Delegation (Antigravity -> Jules)

- Use the `@jules` invocation in the chat or task summary.
- **Mandatory**: Reference the `implementation_plan.md` path.
- Example: `@jules execute --plan ./brain/id/implementation_plan.md --verify`
- Antigravity enters a "Wait for PR" state.

## Step 3: Implementation (Jules)

- Jules executes the changes asynchronously based on the provided plan.
- Jules runs local tests and linting.
- Jules creates a Pull Request on GitHub.

## Step 4: Verification (Antigravity)

- Antigravity detects the new PR (using `browser_subagent` to poll GitHub or checking local status).
- Antigravity performs a terminal-based verification: `npm run build` and `npm test`.
- Antigravity uses `browser_subagent` to review Jules' PR comments for any issues found during implementation.

## Step 5: Handover

- Antigravity uses `notify_user` to present the PR link and final walkthrough.
