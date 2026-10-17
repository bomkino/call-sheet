# Repository instructions

## Before editing

- Read this file, the README, and [docs/CLOUD_CODEX.md](docs/CLOUD_CODEX.md).
- Inspect the existing files and the nearest available check before choosing an implementation seam.
- The runtime and release path are chosen: static pages built by `tools/build_site.py` (Python standard library), released into pitch.dog through `bomkino/pitchdog-cloudflare-sites`. Add no framework or dependency without a reason the README can state.
- `data/calls.json` and `dist-pitchdog/` are generated. Change `data/overlay.json`, `data/rechecks.json`, `site/` or the tools instead.
- Keep the private foundation out of this public repository.

## Working agreements

- Make the smallest complete change for the requested behavior.
- Preserve source materials and keep generated output separate.
- Do not commit secrets, credentials, private data, or machine-specific paths.
- Avoid speculative dependencies, provider-specific deployment files, and adjacent cleanup.
- Keep copy and naming consistent with the existing repository.

## Cloud Codex delivery loop

1. State the target behavior and the proof that will demonstrate it.
2. Inspect the real code path and make the smallest change.
3. Run the narrowest meaningful check, then exercise the real path when practical.
4. Report changed files, proof and result, remaining risk, and any blocker.

## Completion gate

A task is complete only when the changed behavior is verified at the artifact or runtime surface that matters. A green build alone is not user-facing proof.
