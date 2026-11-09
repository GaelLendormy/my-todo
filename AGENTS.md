# Repository Guidelines

## Project Structure & Module Organization

This repository currently contains Markdown documentation for an AI-assisted development workflow. No application source code, tests, or assets are present.

- `README.md`: repository title and entry point.
- `ai-workflow/GUIDE_NOUVEAU_PROJET.md`: setup instructions, workflow stages, and example prompts.
- `ai-workflow/templates/AGENTS.project.md`: reusable instructions to integrate into another project's `AGENTS.md`.
- `ai-workflow/TODO WORKFLOW.md`: notes about potential workflow improvements.

Keep reusable templates in `ai-workflow/templates/` and explanatory documentation in `ai-workflow/`. The guide references `skills/` and `agents/` directories that are absent from this checkout; do not assume those installation examples are executable here.

## Build, Test, and Development Commands

There is no package manifest, build process, development server, or automated test suite. Review documentation changes from the repository root:

```bash
git status --short       # Inspect changed and untracked files
git diff --check         # Detect whitespace errors in tracked changes
git diff -- ai-workflow/ # Review workflow documentation changes
```

## Coding Style & Naming Conventions

Use Markdown headings, short paragraphs, fenced code blocks with language labels, and relative links between repository documents. Keep list indentation consistent with surrounding content and avoid trailing whitespace. Workflow documentation is primarily French; preserve its language when editing existing files.

Follow existing naming patterns, such as uppercase descriptive guide names and `AGENTS.project.md` for the reusable template. No formatter or linter is configured.

## Testing Guidelines

For documentation changes, inspect rendered Markdown, verify local link targets, and check that command examples match the actual directory structure. Report unresolved references explicitly. No test framework or coverage threshold currently applies.

## Commit & Pull Request Guidelines

Existing commits use short English summaries, such as `Add ai-dev-workflow`. Use concise, action-oriented subjects and keep each commit focused.

Pull requests should explain the change, its purpose, affected documents, and validation performed. Link an issue when applicable. Include screenshots only when a rendering change benefits from visual evidence. Review copied instructions for machine-specific paths or secrets before committing.

## Consignes de développement

Avant toute modification, lis et applique les consignes de [AGENTS.project.md](ai-workflow/templates/AGENTS.project.md). Adapte les validations à l’outillage présent ; les règles OpenSpec et milestones s’appliquent uniquement lorsque ces workflows sont utilisés. Une modification documentaire courante ne nécessite pas de créer les documents des phases absentes.

Consulte aussi le [guide du workflow](ai-workflow/GUIDE_NOUVEAU_PROJET.md) pour les changements qui le concernent. La publication vers l’installation personnelle ou d’autres projets exige une demande explicite.
