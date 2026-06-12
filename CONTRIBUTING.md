# Contributing

Forge CLI is a workflow skill for AI-assisted 项目开发. Contributions should improve how the skill routes tasks, reads project context, handles incomplete input, or keeps generated work aligned with an existing 项目代码库.

## Good Contribution Areas

- Clearer task-routing rules in `SKILL.md`.
- Better reference material under `references/`.
- Real validation logs from actual 项目.
- Installation, diagnosis, and compatibility fixes.
- More precise guardrails fields or examples.
- Bug reports where the skill chose the wrong workflow.

## Before Opening a PR

1. Keep `SKILL.md` focused on orchestration. Put detailed rules in `references/`.
2. Keep version metadata consistent when publishing a release: `VERSION`, `.skillhub.json`, `README.md`, and `CHANGELOG.md`.
3. Add a `CHANGELOG.md` entry for user-visible behavior changes.
4. If a change affects task routing, include at least one before/after example.
5. If a change is based on a real project run, record the facts in `references/validation_log.md` or link to a reproducible case.

## Validation

There is no compile step for the skill itself. Use the release gate before submitting:

```bash
scripts/validate_release.sh
```

For focused checks:

```bash
python3 scripts/route_golden_tests.py
python3 scripts/validate_project_stack_scan.py
python3 scripts/validate_docs_sync.py
python3 scripts/validate_project_guardrails.py --allow-placeholders references/project_guardrails_template.yaml memory/projects/example_project.project_guardrails.yaml
```

For workflow changes, test at least one prompt from each affected mode:

- Light task: a small UI copy/style edit.
- Page development: a new page or module request.
- Code review: review an existing 项目页面.
- Migration: state-management or directory-structure migration.

## Writing Style

- Be explicit about what the agent should do and when it should stop.
- Do not turn uncertain guesses into project rules.
- Prefer short decision rules over broad slogans.
- Use Chinese for existing Chinese docs unless a file is intentionally bilingual.
