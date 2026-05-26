# Open Source Checklist

Use this checklist before publishing a GitHub release or asking external users to try Flutter Forge.

## Required Before Public Sharing

- [x] Add an open-source license.
- [x] Keep `VERSION`, `.skillhub.json`, and README version text consistent.
- [x] Document installation through `npx skills add`.
- [x] Document git clone fallback installation.
- [x] Add contribution guidelines.
- [x] Add issue templates.
- [x] Add release validation scripts for version metadata, rule-card schema, and route golden cases.
- [x] Add a short demo transcript.
- [x] Add Flutter stack detection checks for rule-card evidence.
- [ ] Add at least one real validation log from a Flutter project.
- [ ] Add screenshots or a recording showing the workflow in action.

## Release Check

Run:

```bash
scripts/validate_release.sh
```

Confirm:

- `VERSION` matches `.skillhub.json`.
- README version text matches the release.
- `CHANGELOG.md` has an entry for the release or an `Unreleased` section.
- No local-only files are tracked, such as `.flutter-forge/`, `.claude/`, `.DS_Store`, or runtime mapping files.
- Rule-card template and example schema still match.
- Route golden cases still match the documented mode expectations.
- Flutter stack detection still recognizes the fixture project.
- README, load map, demo transcript, and validation log links still resolve.

## Evidence To Add Later

- A before/after case where direct AI coding produced inconsistent structure and Flutter Forge avoided it.
- A real rule-card initialization log from an existing Flutter project.
- A page-development transcript showing requirement analysis, UI parsing, architecture decisions, and implementation.
- A failure case where the workflow was too heavy or routed incorrectly, with the fix recorded.
