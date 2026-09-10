# Tasks

Atomic, near-term implementation tasks for `danisolation-recall`.

Status values: `TODO`, `READY`, `IN_PROGRESS`, `BLOCKED`, `DONE`, `DEFERRED`.

Future MVP work is listed at a coarse level at the bottom until its implementation context is sufficiently known. Only near-term foundation work is decomposed into detailed tasks.

---

## FOUNDATION-001

### Title
Persist the project constitution

### Goal
Create `AGENT_RULES.md` as the permanent operational constitution for the agent.

### Dependencies
None

### Status
DONE

### Files
AGENT_RULES.md

### Acceptance Criteria
- `AGENT_RULES.md` exists at the repository root
- contains the full master prompt / project constitution

### Tests
None (documentation only)

---

## FOUNDATION-002

### Title
Initialize git repository

### Goal
Make the directory version-controlled so subsequent work is reviewable.

### Dependencies
FOUNDATION-001

### Status
DONE

### Files
.git/

### Acceptance Criteria
- `git init` succeeded
- `git status` reports a valid repository

### Tests
- verified with `git status`

---

## FOUNDATION-003

### Title
Create the task ledger

### Goal
Create `docs/TASKS.md` with the near-term foundation task breakdown.

### Dependencies
FOUNDATION-002

### Status
DONE

### Files
docs/TASKS.md

### Acceptance Criteria
- `docs/TASKS.md` exists
- foundation tasks are listed with status, dependencies, and acceptance criteria
- MVP phases are listed at a coarse level only

### Tests
None (documentation only)

---

## FOUNDATION-004

### Title
Create the roadmap

### Goal
Create `docs/ROADMAP.md` with high-level product and engineering phases.

### Dependencies
FOUNDATION-003

### Status
DONE

### Files
docs/ROADMAP.md

### Acceptance Criteria
- `docs/ROADMAP.md` exists
- phases use `Now` / `Next` / `Later` / `Maybe`
- MVP and post-MVP work are separated

### Tests
None (documentation only)

---

## FOUNDATION-005

### Title
Create README

### Goal
Add a top-level project overview that matches the current repository state.

### Dependencies
FOUNDATION-004

### Status
DONE

### Files
README.md

### Acceptance Criteria
- `README.md` exists
- describes the project, local setup, and repository layout accurately

### Tests
None (documentation only)

---

## FOUNDATION-006

### Title
Create .gitignore

### Goal
Prevent build artifacts, dependencies, and secrets from being tracked.

### Dependencies
FOUNDATION-002

### Status
DONE

### Files
.gitignore

### Acceptance Criteria
- `node_modules`, build output, and `.env` files are ignored
- `.commandcode` handling is intentional and documented

### Tests
- `git status` no longer lists ignored artifacts

---

## Remaining foundation docs (coarse)

- `CONTRIBUTING.md`
- `ARCHITECTURE.md`
- `ENVIRONMENT.md`
- `docs/TECH-DEBT.md`

These will be created when their content is meaningful rather than empty placeholders.

---

## MVP phases (coarse — not yet decomposed)

```text
Authentication
  ↓
Study sets
  ↓
Cards
  ↓
Study sessions
  ↓
Progress
  ↓
Search
```

Each phase will be decomposed into detailed atomic tasks when its implementation context is known.
