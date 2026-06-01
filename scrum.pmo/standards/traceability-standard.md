# Traceability Standard — Forward-Only Chain

**Authority:** TRON directive (Phase 23, T159)
**Status:** PERMANENT — overrides all prior bidirectional designs
**Created:** 2026-06-01

## Core Rule

> "Traceability traces requirements to tasks to use cases to classes and methods. Tasks do not trace back to requirements... never back to requirements."

## The Forward-Only Chain

```
Requirement ──→ Task ──→ UseCase ──→ Class ──→ Method
                 │                                (LEAF)
                 └──→ Subtask
```

Direction is **always left-to-right, root-to-leaf.** No entity points backward.

## Entity Rules

### 1. Requirement (ROOT)
- **Allowed forward:** `forwardTo.tasks[]`
- **Is the ONLY entity that initiates the chain**
- Multiple Requirements may point to the same Task (fan-in)

### 2. Task
- **Allowed forward:** `forwardTo.subtasks[]`, `forwardTo.useCases[]`, `forwardTo.follows[]`, `forwardTo.changes[]`
- **PROHIBITED:** Any field referencing Requirement (`links.up`, `requirement`, `requirements[]`)
- `follows` is a sequencing dependency between Tasks, not a back-reference

### 3. Subtask
- **Allowed forward:** `forwardTo.useCases[]` (if applicable)
- **PROHIBITED:** Any field referencing parent Task or Requirement

### 4. UseCase
- **Allowed forward:** `forwardTo.classes[]`
- **PROHIBITED:** `requirements[]`, `tasks[]`, or any backward pointer

### 5. Class
- **Allowed forward:** `forwardTo.methods[]`
- **PROHIBITED:** `useCases[]` or any backward pointer

### 6. Method (LEAF)
- **No forward links.** End of chain.
- **PROHIBITED:** `useCases[]`, `tests[]`, or any pointer at all

### 7. Test (EVIDENCE — attached at UseCase level)
- Tests are evidence that a UseCase works
- Rendered inline under UseCase in the browser, not as a separate chain level
- Tests do NOT have back-references to anything

## Fan-In Rule

Many Requirements can point forward to the same Task. This is forward-only fan-in:

```
R1.forwardTo.tasks = [T1, T3]
R2.forwardTo.tasks = [T1]
```

T1 appears under both R1 and R2 in a tree view. But T1 has NO knowledge of R1 or R2.

To answer "which Requirements led to T1?" — traverse ALL Requirements and check their `forwardTo.tasks`. This is a search, not a link.

## Migration Protocol

When stripping back-references from existing files:

1. `grep -r 'links\.up\|requirements\[\|useCases\[' scrum.pmo/` → list all violations
2. Edit each file: remove back-reference fields
3. Rename `links.down` → `forwardTo.subtasks` (or appropriate forward field)
4. Verify: repeat grep → zero matches
5. Commit with message: "T159: strip back-references, enforce forward-only chain"

## Enforcement

- **New task files:** PO must not include `links.up` or `requirement` fields on Tasks
- **New UC files:** Must not include `requirements[]` or `tasks[]`
- **Code review:** Architect verifies forward-only compliance before merging
- **Automated:** Tester grep check as regression gate
