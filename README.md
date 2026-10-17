# call-sheet

A framework-neutral workspace for call sheet tooling and experiments.

## Current shape

- The repository is an intentionally small starting point.
- No primary runtime or deployment target has been selected yet.
- Provider-specific configuration stays deferred until the runtime, data boundary, and release path are clear.

## Work with Cloud Codex

Read [AGENTS.md](AGENTS.md) before changing the repository. The handoff loop is documented in [docs/CLOUD_CODEX.md](docs/CLOUD_CODEX.md).

## First implementation decision

Choose the primary runtime and the smallest useful end-to-end slice before adding framework or hosting configuration. Keep source materials, generated outputs, and deployment credentials clearly separated.
