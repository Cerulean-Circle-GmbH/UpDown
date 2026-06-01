[Back to Sprint 17 Planning](./planning.md)

# Task 160: Trace Browser — Stale Requirement Items + Forward-Ref Repopulation
[task:uuid:d4e5f6a7-b8c9-0123-def4-160000000001]

**Folds:** Tron bug "browser doesn't change with scenarios" + T159 tester TS-2 over-strip finding
**HARD BLOCKER for:** T158 (traceability browser implementation)
**Phase:** 24

## Status
- [ ] Planned
- [x] In Progress
  - [x] refinement (this design)
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

---

## Problem Statement

### Bug: Browser shows stale data
After T159 stripped back-references, the chain builder lost its data sources:
- **BEFORE T159:** `requirement.forwardTo.tasks[]` could be populated by scanning task files' `links.up → requirement` (reverse scan)
- **AFTER T159:** Task files have NO `links.up` field. The reverse scan returns empty. Requirements show zero tasks.

### T159 Tester TS-2 Finding
> TS-2: "Walk R2 → T1 (fan-in same Task) — verify T1 has no knowledge of R1 or R2"
> Result: T1 correctly has no back-ref. BUT: R2 also shows no forward link to T1 because the chain builder was populating `requirement.tasks[]` by reverse-scanning task files, which T159 correctly stripped.

### Root Cause
Chain builder used **reverse scan** (read tasks, find their parent requirements) instead of **forward parse** (read requirements, follow their task links). T159 correctly removed the reverse data. Now the forward parse must be implemented.

---

## Design: Forward-Ref Repopulation

### Principle (T159/B18 compliant)
> Parse FORWARD sources only. Never parse task→requirement back-refs. The requirement file IS the forward source.

### Source 1: `requirements.md` → `requirement.forwardTo.tasks[]`

**Parse pattern:** Each requirement line in `requirements.md` has the format:
```markdown
- [ ] **R1** Description text [requirement:uuid:...]
  ([task-1](./task-1-boundary-file-extraction.md))
```

**Algorithm:**
```typescript
function parseRequirementTasks(requirementsMd: string): RequirementNode[] {
  const lines = requirementsMd.split('\n');
  const requirements: RequirementNode[] = [];
  let current: RequirementNode | null = null;

  for (const line of lines) {
    // Match requirement line: - [ ] **R1** description [requirement:uuid:...]
    const reqMatch = line.match(/^- \[.\] \*\*(\w+)\*\* (.+) \[requirement:uuid:([^\]]+)\]/);
    if (reqMatch) {
      current = {
        type: 'requirement',
        name: reqMatch[1],
        description: reqMatch[2],
        uuid: reqMatch[3],
        forwardTo: { tasks: [] }
      };
      requirements.push(current);
      continue;
    }

    // Match task link on next line: ([task-N](./task-N-name.md))
    const taskMatch = line.match(/\(\[task-(\d+)\]\(\.\/([^)]+)\)\)/);
    if (taskMatch && current) {
      current.forwardTo.tasks.push({
        taskNumber: parseInt(taskMatch[1]),
        filePath: taskMatch[2]
      });
    }
  }
  return requirements;
}
```

**Key:** This parses the REQUIREMENT file (forward source). It does NOT read task files to find parent requirements. T159/B18 compliant.

### Source 2: `traceability-matrix.md` → `task.forwardTo.useCases[]`

**Parse pattern:** The traceability matrix `Task` column links UCs to sprint tasks:
```markdown
| fbfed148 | UC-R2 | room.create | Sprint3/T2 | WebSocketClient.ts:60 ... | vitest/uc-r2-... | ✅ |
```

**Algorithm:**
```typescript
function parseTaskUseCases(matrixMd: string): Map<string, UseCaseNode[]> {
  // Parse table rows → group UCs by Task reference
  // Sprint3/T2 → [UC-R2, UC-R2b, UC-R3, ...]
  const taskToUCs = new Map<string, UseCaseNode[]>();
  
  for (const row of parseTableRows(matrixMd)) {
    const taskRef = row.task;  // "Sprint3/T2"
    const uc: UseCaseNode = {
      uuid: row.uuid,
      name: row.ucName,
      object: row.objectVerb.split('.')[0],
      verb: row.objectVerb.split('.')[1],
      // ...
    };
    if (!taskToUCs.has(taskRef)) taskToUCs.set(taskRef, []);
    taskToUCs.get(taskRef)!.push(uc);
  }
  return taskToUCs;
}
```

**Key:** This parses the MATRIX (forward source — it lists which task implements which UC). It does NOT read UC files to find parent tasks. T159/B18 compliant.

### Source 3: `traceability-matrix.md` → `useCase.forwardTo.classes[]` + `class.forwardTo.methods[]`

**Parse pattern:** The `Impl File:Method` column:
```markdown
| ... | WebSocketClient.ts:60 createRoom() / RoomManager.ts:643 createRoom() / GameRoom.ts:103 addPlayer() | ...
```

**Algorithm:** Split on ` / `, parse `FileName.ts:line methodName()` → ClassNode + MethodNode.

### Source 4: Task files → `task.forwardTo.subtasks[]`

**Parse pattern:** Task files contain a `## Subtasks` or `- down` section with links:
```markdown
  - down
    - [Task 1.1: Expert — HTTPSServer extraction](./task-1.1-expert-httpsserver-extraction.md)
```

**Algorithm:** Parse `- down` section, extract `[name](path)` links. This is forward (task→subtask), NOT back-ref.

---

## Design: Cache Strategy for `/api/trace/chain`

### Problem
Tron bug: "browser doesn't change with scenarios." The chain JSON must reflect current file state.

### Solution: File-Watching Invalidation

```typescript
class TraceChainCache {
  private chain: TraceChain | null = null;
  private watchPaths: string[];
  
  constructor(projectRoot: string) {
    this.watchPaths = [
      `${projectRoot}/scrum.pmo/sprints/*/requirements.md`,
      `${projectRoot}/scrum.pmo/sprints/*/task-*.md`,
      `${projectRoot}/qnd/spec/traceability-matrix.md`,
      `${projectRoot}/qnd/spec/usecase-tree.md`
    ];
    this.startWatching();
  }
  
  get(): TraceChain {
    if (!this.chain) {
      this.chain = buildForwardChain();  // full rebuild
    }
    return this.chain;
  }
  
  private startWatching(): void {
    // fs.watch on each watchPath directory
    // On any change: this.chain = null (invalidate)
    // Next get() triggers rebuild
  }
}
```

### Why not poll?
File watching is event-driven — no CPU cost when files don't change. Rebuild only on actual edits. Browser always gets fresh data.

### API Response Headers
```
Cache-Control: no-cache
ETag: <sha256 of chain JSON>
```
Browser can use `If-None-Match` for 304 responses.

---

## Design: Data Source Summary (all forward, no back-refs)

| Chain Link | Forward Source | Parse Target | Back-Ref? |
|------------|--------------|-------------|-----------|
| Req → Tasks | `requirements.md` task links | `requirement.forwardTo.tasks[]` | NO |
| Task → Subtasks | `task-*.md` `- down` section | `task.forwardTo.subtasks[]` | NO |
| Task → UCs | `traceability-matrix.md` Task column | `task.forwardTo.useCases[]` | NO |
| UC → Classes | `traceability-matrix.md` Impl column | `useCase.forwardTo.classes[]` | NO |
| Class → Methods | `traceability-matrix.md` Impl column | `class.forwardTo.methods[]` | NO |
| UC → Tests | `traceability-matrix.md` Test column | `useCase.tests[]` (evidence) | NO |

**Zero back-ref parsing.** Every link populated from the entity that OWNS the forward pointer.

---

## Acceptance Criteria
- [ ] AC-1: `requirement.forwardTo.tasks[]` populated by parsing `requirements.md` task links (NOT task→req reverse scan)
- [ ] AC-2: `task.forwardTo.useCases[]` populated by parsing `traceability-matrix.md` Task column
- [ ] AC-3: `task.forwardTo.subtasks[]` populated by parsing task file `- down` section
- [ ] AC-4: `useCase.forwardTo.classes[]` populated by parsing `traceability-matrix.md` Impl column
- [ ] AC-5: No parser reads `links.up`, `requirement`, or any back-ref field from task/UC/class files
- [ ] AC-6: `/api/trace/chain` returns fresh data after `requirements.md` edit (cache invalidated)
- [ ] AC-7: `/api/trace/chain` returns fresh data after `traceability-matrix.md` edit
- [ ] AC-8: Browser updates when navigating to `/trace` after scenario file changes
- [ ] AC-9: ETag header enables 304 responses for unchanged data
- [ ] AC-10: Fan-in: R1 and R2 both show T1 in their `forwardTo.tasks[]` (parsed from separate lines in requirements.md)

## Test Scenarios
- [ ] TS-1: Add new requirement to requirements.md with task link → `/api/trace/chain` includes it within 5s
- [ ] TS-2: Edit traceability-matrix.md to add new UC row → chain includes new UC under correct task
- [ ] TS-3: Parse requirements.md with 2 requirements pointing to same task → both RequirementNodes contain that TaskNode
- [ ] TS-4: Verify zero occurrences of `links.up` or `requirement:` in parser source code (grep check)
- [ ] TS-5: Browser shows updated tree after editing requirements.md (no refresh needed if WebSocket push; manual refresh otherwise)

---

**Architect:** web4-architect @ web4team:0.0
**Sprint:** Sprint 17 — Scenario Units
**Blocks:** T158 (traceability browser implementation)
