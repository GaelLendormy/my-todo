# Repository Guidelines

## Project Structure & Module Organization

This repository contains the My To Do Nuxt application and Markdown documentation for an AI-assisted development workflow.

- `README.md`: repository title and entry point.
- `app/`: Vue interface; `server/api/`: HTTP endpoints; `server/domain/`: business rules; `server/db/`: SQLite access and Drizzle schema.
- `migrations/`: versioned SQLite migrations; `scripts/`: migration and isolated server checks; `tests/`: Vitest and Playwright checks.
- `documentation/`: product brief, technical foundation, UI direction and development notes; `openspec/`: change artifacts; `runs/current.md`: current milestone checkpoint.
- `ai-workflow/GUIDE_NOUVEAU_PROJET.md`: setup instructions, workflow stages, and example prompts.
- `ai-workflow/templates/AGENTS.project.md`: reusable instructions to integrate into another project's `AGENTS.md`.
- `ai-workflow/TODO WORKFLOW.md`: notes about potential workflow improvements.

Keep reusable templates in `ai-workflow/templates/` and explanatory documentation in `ai-workflow/`. The guide references `skills/` and `agents/` directories that are absent from this checkout; do not assume those installation examples are executable here.

## Build, Test, and Development Commands

Use Node 24.14 and pnpm 10.33 from the repository root. See the README for data paths and origin configuration. Never use personal data for checks.

```bash
pnpm db:migrate          # Explicit migration of the configured database
pnpm dev                 # Local development server
pnpm typecheck           # Application, scripts and tests
pnpm lint
pnpm test                # Vitest with temporary SQLite databases
pnpm build
pnpm test:e2e            # Compiled server and isolated Playwright data; port 3100
pnpm check:persistence   # Compiled server restart; isolated data; port 3101
```

Review documentation changes from the repository root:

```bash
git status --short       # Inspect changed and untracked files
git diff --check         # Detect whitespace errors in tracked changes
git diff -- ai-workflow/ # Review workflow documentation changes
```

## Coding Style & Naming Conventions

Use Markdown headings, short paragraphs, fenced code blocks with language labels, and relative links between repository documents. Keep list indentation consistent with surrounding content and avoid trailing whitespace. Workflow documentation is primarily French; preserve its language when editing existing files.

Follow existing naming patterns, such as uppercase descriptive guide names and `AGENTS.project.md` for the reusable template. No formatter or linter is configured.

## Testing Guidelines

For application changes, follow the validation strategy in `documentation/PROJECT_FOUNDATION.md` and the authorized OpenSpec milestone. Run relevant tests, typecheck, lint and build. Inspect changed interactions manually; a mobile viewport does not replace tactile testing on a real phone. No coverage threshold applies.

For documentation changes, inspect rendered Markdown, verify local link targets, and check that command examples match the actual directory structure. Report unresolved references explicitly.

## Commit & Pull Request Guidelines

Existing commits use short English summaries, such as `Add ai-dev-workflow`. Use concise, action-oriented subjects and keep each commit focused.

Pull requests should explain the change, its purpose, affected documents, and validation performed. Link an issue when applicable. Include screenshots only when a rendering change benefits from visual evidence. Review copied instructions for machine-specific paths or secrets before committing.

## Consignes de développement

Avant toute modification, lis et applique les consignes de [AGENTS.project.md](ai-workflow/templates/AGENTS.project.md). Adapte les validations à l’outillage présent ; les règles OpenSpec et milestones s’appliquent uniquement lorsque ces workflows sont utilisés. Une modification documentaire courante ne nécessite pas de créer les documents des phases absentes.

Consulte aussi le [guide du workflow](ai-workflow/GUIDE_NOUVEAU_PROJET.md) pour les changements qui le concernent. La publication vers l’installation personnelle ou d’autres projets exige une demande explicite.
