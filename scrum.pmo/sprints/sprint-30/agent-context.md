# Agent Context: UpDown Project
**Session:** 2026-01-18 | **Branch:** dev/claudeFlow.v1

---

## **What**
Claude Opus 4.5 agent with claude-flow swarm orchestration, working on UpDown project - a Web4TSComponent-based multiplayer card game implementing CMM4 Radical OOP patterns.

## **Project Identity**
- **Repository:** `Cerulean-Circle-GmbH/UpDown`
- **Working Directory:** `/var/dev/Workspaces/2cuGitHub/UpDown`
- **Framework:** Web4TSComponent (TypeScript, 5-layer architecture)
- **Methodology:** Fractal PDCA with WODA semantic refinement

---

## **Claude-Flow Swarm System**

### **What**
Multi-agent orchestration via claude-flow CLI and MCP tools for parallel task execution.

### **Overview**
- **CLI:** `npx @claude-flow/cli@latest <command>`
- **MCP Tools:** `mcp__claude-flow__*` functions available
- **Topology:** hierarchical (anti-drift, max 8 agents)
- **Memory:** Persistent key-value with vector search

### **Details**

#### Swarm Initialization
```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

#### Agent Spawning (use Task tool with run_in_background: true)
```javascript
Task({
  prompt: "Task description",
  subagent_type: "coder",  // or: researcher, tester, reviewer, planner
  description: "Short description",
  run_in_background: true
})
```

#### Memory Operations
```bash
# Store pattern
npx @claude-flow/cli@latest memory store --key "pattern-name" --value "pattern content" --namespace patterns

# Search (vector)
npx @claude-flow/cli@latest memory search --query "search terms" --namespace patterns

# Retrieve
npx @claude-flow/cli@latest memory retrieve --key "pattern-name" --namespace patterns
```

#### Hooks (learning system)
```bash
npx @claude-flow/cli@latest hooks pre-task --description "[task]"
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true
npx @claude-flow/cli@latest hooks route --task "[task description]"
```

### **Actions**
When spawning swarm agents:
1. Initialize swarm with `swarm init`
2. Spawn ALL agents in ONE message with `run_in_background: true`
3. Tell user what agents are doing
4. STOP and WAIT - don't poll status
5. Synthesize results when agents return

---

## **How We Work Here**

### Radical OOP Pattern
```typescript
class MyComponent implements Component {
  model!: MyModel;
  constructor() {}  // Always empty
  init(scenario?: Scenario<MyModel>): this {
    this.model = { uuid, name, ... };
    return this;
  }
}
```

### Task Format (WODA)
All tasks use What/Overview/Details/Actions with:
- Web4Requirement integration for acceptance criteria
- Traceability (Up→PDCAs, Down→Subtasks)
- Web4 Principles verification (P1, P6, P25, P34)

### Agent Configurations
Located in `.claude-flow/agents/`:
- `task-formatter.yaml` - WODA format enforcement
- `sprint-planner.yaml` - CMM3/Web4 compliance
- `web4-researcher.yaml` - Pattern discovery

---

## **Current Sprint**
**Sprint 30** - Read `./planning.md` for details
- 12 tasks, ~37-42 hours
- Focus: File/Folder Architecture, IOR Infrastructure, HTTPS.PWA

## **Key References**
| What | Where |
|------|-------|
| Sprint Tasks | `./task-*.md` |
| Iteration Tracking | `components/ONCE/0.3.22.1/session/2025-12-12-UTC-2100.iteration-tracking.pdca.md` |
| Web4 Principles | `components/ONCE/0.3.22.1/session/web4-principles-checklist.md` |
| PDCA Howto | `Web4Articles/scrum.pmo/roles/_shared/howto.fractal.pdca.md` |

## **Memory Keys** (claude-flow)
- `web4-task-template-woda` - Task template structure
- `agent-prompt-pattern-task-updater` - Agent prompting pattern

---
*Start: read `./planning.md` then use claude-flow for parallel work*
