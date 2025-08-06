# Role Agent Quick Reference

## Activation Commands

| Role | Activation Command |
|------|-------------------|
| Scrum Master | `ACTIVATE SCRUM MASTER AGENT` |
| Product Owner | `ACTIVATE PO AGENT` |
| DevOps | `ACTIVATE DEVOPS AGENT` |
| Architect | `ACTIVATE ARCHITECT AGENT` |
| Developer | `ACTIVATE DEVELOPER AGENT` |
| QA | `ACTIVATE QA AGENT` |

## Quick Start Workflow

1. **Start as Scrum Master:**
   ```
   ACTIVATE SCRUM MASTER AGENT
   ```

2. **Switch to specific role for task:**
   ```
   ACTIVATE [ROLE] AGENT
   ```

3. **Return to Scrum Master:**
   ```
   ACTIVATE SCRUM MASTER AGENT
   ```

## Role Responsibilities

- **Scrum Master:** Orchestration, process management, team coordination
- **PO:** Planning, task creation, backlog management
- **DevOps:** Infrastructure, containerization, CI/CD
- **Architect:** Technical design, architecture decisions
- **Developer:** Implementation, coding, testing
- **QA:** Quality assurance, testing, feedback

## Recovery Commands

- **Context Loss:** `ACTIVATE SCRUM MASTER AGENT` (then follow recovery procedure)
- **Role Confusion:** `ACTIVATE SCRUM MASTER AGENT` (for re-orchestration)
- **Process Violation:** Check role-specific process.md files

## Key Files

- `.cursorrules` - Role agent configuration
- `restart.md` - Recovery procedures
- `docs/role-agents-overview.md` - Complete overview
- `docs/role-agent-usage-guide.md` - Detailed usage guide
- `sprints/iteration-3/planning.md` - Current sprint planning
- `sprints/iteration-3/daily.md` - Daily status
