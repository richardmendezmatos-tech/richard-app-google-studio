---
description: Jules Agent Integration Workflow (Supervisor-Delegate Pattern)
---

# Jules Sync Workflow

This workflow defines how Antigravity (Supervisor) and Jules (Executor) work together to maintain the repository.

## Step 1: Strategy & Planning (Antigravity)
- Receive user objective.
- Perform initial research using `grep_search` and `view_file`.
- Identify if the task is suitable for Jules (Complex refactors, dependency updates).
- Create an `implementation_plan.md`.

## Step 2: Delegation (Antigravity -> Jules)
- Invoke Jules via the mapped MCP tool (e.g., `jules_mcp.execute_task`).
- Provide the context from the implementation plan.
- // turbo
- run_command: `@jules start_task --plan implementation_plan.md` (Note: This is a placeholder for the actual delegation trigger).

## Step 3: Implementation (Jules)
- Jules executes the changes asynchronously.
- Jules runs local tests.
- Jules creates a Pull Request on GitHub.

## Step 4: Verification (Antigravity)
- Antigravity detects the new PR.
- Uses `browser_subagent` to review the PR in the GitHub UI.
- Runs local `npm run build` or `npm test` to verify no regressions.

## Step 5: Handover
- Antigravity uses `notify_user` to present the PR link and final walkthrough.
