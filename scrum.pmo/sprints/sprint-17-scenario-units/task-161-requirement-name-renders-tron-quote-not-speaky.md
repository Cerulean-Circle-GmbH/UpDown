[Back to Sprint 17 Planning](./planning.md)

# Task 161: Requirement Name Renders Tron Quote — Not Speaky Name
[task:uuid:d4e5f6a7-b8c9-0123-def4-161000000001]

**Tron bug:** "the names do not fit the json"
**Sibling to:** T160 (different root cause — T160 is stale data, T161 is wrong data)
**Phase:** 25

## Status
- [ ] Planned
- [x] In Progress
  - [x] refinement (this diagnosis + fix spec)
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

---

## Bug Description

/trace Requirement items render verbatim blockquote text as titles instead of the speaky `model.name`. Browser shows:

```
❌ WRONG (current):
📋 > "traceability traces requirements to tasks to use cases to classes and methods..."

✅ EXPECTED (speaky):
📋 R2: HTTPSServer in @web4x/http
```

---

## Diagnosis

### (A) model.name Data Corruption — T154 Parser

The T160 parser (`parseRequirementTasks()`) extracts requirement data from `requirements.md`. The line format is:

```markdown
- [ ] **R1** All extracted @web4x/* components must produce identical runtime behavior to ONCE 0.3.22.2 [requirement:uuid:a1b2c3d4-...]
  ([task-1](./task-1-boundary-file-extraction.md))
```

**T160 regex (current design):**
```typescript
const reqMatch = line.match(/^- \[.\] \*\*(\w+)\*\* (.+) \[requirement:uuid:([^\]]+)\]/);
// Group 1: "R1" (name)
// Group 2: "All extracted @web4x/*..." (description)
// Group 3: UUID
```

This regex works for clean `**R1**` formatted lines. BUT it fails for:

#### Case 1: Tron quote requirements (no `**name**` prefix)
```markdown
- [ ] > "traceability traces requirements to tasks..." [requirement:uuid:...]
```
Regex fails → `reqMatch` is null → requirement skipped or name falls through to raw line.

#### Case 2: Description contains markdown formatting
```markdown
- [ ] **R3** `once-v0.3.23.0 start` must launch full HTTP+HTTPS server [requirement:uuid:...]
```
The backtick-wrapped command in description is fine — regex captures it. But if `model.name` is populated with the full description instead of just "R3", the renderer shows too much text.

### (B) Renderer Field Selection — rb-tree-item / rb-requirement-detail

The T158 design specifies `RequirementNode.name` for the tree label and `RequirementNode.description` for the detail panel. If the parser puts the full line into `name` instead of separating `name` from `description`, the renderer shows the whole thing.

### Root Cause: BOTH (A) and (B)

**(A)** Parser must handle 3 line formats and ALWAYS separate `name` (short speaky) from `description` (long text).
**(B)** Renderer must use `name` for tree label and `altId` for badge — never fall back to description in the tree.

---

## Sample Requirements Analysis

### Sample 1 (clean — works):
```markdown
- [ ] **R1** All extracted @web4x/* components must produce identical runtime behavior to ONCE 0.3.22.2 [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000001]
```
- `name` = "R1" ✅
- `description` = "All extracted @web4x/* components must produce identical runtime behavior to ONCE 0.3.22.2" ✅

### Sample 2 (clean — works):
```markdown
- [ ] **R2** HTTPSServer must be available in @web4x/http with TLS dependency [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000002]
```
- `name` = "R2" ✅
- `description` = "HTTPSServer must be available in @web4x/http with TLS dependency" ✅

### Sample 3 (BROKEN — Tron quote format):
```markdown
- [ ] > "traceability traces requirements to tasks to use cases..." [requirement:uuid:...]
```
- `name` = ??? → regex fails, full line used as name ❌
- Expected: `name` = auto-generated "REQ-<uuid-short>" or parsed from context

### Sample 4 (potential issue — inline code):
```markdown
- [ ] **R3** `once-v0.3.23.0 start` must launch full HTTP+HTTPS server identical to `once-v0.3.22.1 start` [requirement:uuid:...]
```
- `name` = "R3" ✅ (regex handles this)
- `description` includes backticks — renderer must handle markdown inline code ✅

---

## Fix Specification

### Fix (A): Parser — Handle 3 Requirement Line Formats

```typescript
function parseRequirementLine(line: string): RequirementNode | null {
  const uuidMatch = line.match(/\[requirement:uuid:([^\]]+)\]/);
  if (!uuidMatch) return null;
  
  const uuid = uuidMatch[1];
  const uuidShort = uuid.substring(0, 8);
  
  // Format 1: **R1** description [requirement:uuid:...]
  const boldNameMatch = line.match(/\*\*(\w+)\*\*\s+(.+?)\s*\[requirement:uuid:/);
  if (boldNameMatch) {
    return {
      name: boldNameMatch[1],           // "R1"
      description: boldNameMatch[2],     // clean description
      uuid, altId: boldNameMatch[1],
      // ...
    };
  }
  
  // Format 2: > "Tron quote text" [requirement:uuid:...]
  const quoteMatch = line.match(/>\s*"?(.+?)"?\s*\[requirement:uuid:/);
  if (quoteMatch) {
    // Extract first meaningful phrase as speaky name (max 60 chars)
    const fullText = quoteMatch[1].trim();
    const speakyName = fullText.length > 60 
      ? fullText.substring(0, 57) + '...'
      : fullText;
    return {
      name: `REQ-${uuidShort}`,          // auto-generated speaky name
      description: fullText,              // full Tron quote as description
      uuid, altId: `REQ-${uuidShort}`,
      // ...
    };
  }
  
  // Format 3: plain text [requirement:uuid:...]
  const plainMatch = line.match(/^-\s*\[.\]\s*(.+?)\s*\[requirement:uuid:/);
  if (plainMatch) {
    return {
      name: `REQ-${uuidShort}`,
      description: plainMatch[1].trim(),
      uuid, altId: `REQ-${uuidShort}`,
      // ...
    };
  }
  
  return null;
}
```

**Key rule:** `model.name` is ALWAYS a short speaky identifier. Never a full sentence. Never a blockquote.

### Fix (B): Renderer — Use Correct Fields

#### rb-tree-item (tree label):
```typescript
// ALWAYS use name for tree label, NOT description
renderRequirementLabel(req: RequirementNode): string {
  return `${req.name}: ${req.description.substring(0, 50)}`;
  // e.g., "R1: All extracted @web4x/* components must..."
  // e.g., "REQ-a1b2c3d4: traceability traces requirements..."
}
```

#### rb-requirement-detail (detail panel):
```
┌─────────────────────────────────────────┐
│ R2: HTTPSServer in @web4x/http          │  ← name: short speaky
│ [requirement:uuid:...002]               │  ← uuid
│ Status: ● covered                       │  ← status
│                                         │
│ HTTPSServer must be available in        │  ← description: full text
│ @web4x/http with TLS dependency         │
│                                         │
│ ── Forward: Tasks (2) ──               │
│ → Task 1: Boundary File Extraction      │
│ → Task 3: ONCE Server Start Parity      │
└─────────────────────────────────────────┘
```

**Rule:** Tree shows `name` (short). Detail panel shows `name` as heading + `description` as body. NEVER show raw blockquote `>` markers or double-quotes in rendered output.

---

## Migration: Existing Requirement Scenarios

If T154 parser already created scenarios with corrupted `model.name`:
1. Re-run parser with fixed regex → overwrites scenario files
2. Verify: `grep '"name":' scenarios/index/*.scenario.json` — no entry longer than 60 chars

---

## Acceptance Criteria
- [ ] AC-1: Parser handles `**R1** description` format → `name: "R1"`, `description: "..."` 
- [ ] AC-2: Parser handles `> "Tron quote"` format → `name: "REQ-<uuid8>"`, `description: "Tron quote text"`
- [ ] AC-3: Parser handles plain text format → `name: "REQ-<uuid8>"`, `description: "plain text"`
- [ ] AC-4: `model.name` is NEVER longer than 60 characters
- [ ] AC-5: `model.name` NEVER contains `>` or leading/trailing `"`
- [ ] AC-6: rb-tree-item renders `name` (short) — not description or raw line
- [ ] AC-7: rb-requirement-detail shows `name` as heading, `description` as body
- [ ] AC-8: Re-parse existing requirements produces clean names for all entries

## Test Scenarios
- [ ] TS-1: Parse `**R1** desc [req:uuid:...]` → name="R1", description="desc"
- [ ] TS-2: Parse `> "Tron quote" [req:uuid:a1b2...]` → name="REQ-a1b2c3d4", description="Tron quote"
- [ ] TS-3: Parse plain text `[req:uuid:...]` → name="REQ-<uuid8>", description="plain text"
- [ ] TS-4: Tree renders "R1: All extracted..." (short) NOT full blockquote
- [ ] TS-5: Detail panel shows heading "R2: HTTPSServer..." + body paragraph

---

**Architect:** web4-architect @ web4team:0.0
**Sprint:** Sprint 17 — Scenario Units
**Sibling:** T160 (stale data) | This: T161 (wrong data)
