# Cloud Codex handoff

## Baseline

- Repository: `bomkino/call-sheet`
- Default branch: `main`
- Visibility: public
- Runtime: not selected
- Deployment target: not selected

This baseline is deliberately neutral. Choose the runtime, data boundary, and release path together in the first implementation task before adding provider-specific configuration.

## Suggested task loop

1. Read [AGENTS.md](../AGENTS.md), the README, and the relevant source files.
2. State the requested behavior and the smallest proof that can expose a failure.
3. Implement the smallest complete slice on a task branch.
4. Run the nearest useful check and exercise the real path when practical.
5. Report the changed files, proof and result, remaining risk, and blocker.

## Boundaries

Keep source materials, generated artifacts, credentials, and deployment configuration separate. Do not infer a framework, hosting provider, schema, or production workflow from this scaffold alone.
