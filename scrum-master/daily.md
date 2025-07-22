# Daily Role Planning

**Date:** 2025-07-22

This file documents the next planned step for each role. After user confirmation, the Scrum Master will execute the next step for each role until quality assurance, guidance, or confirmation is required. Always update this file with the next step for each role. Each entry should reference the relevant task file using markdown links and reflect the current unique state (not concatenated).

---

## Planned Restart Note
- The user will perform a planned shutdown after this prompt. Upon restart, the Scrum Master will:
  - Read restart.md, the latest sprint’s outline.md, user-prompts.md, and daily.md.
  - Resume orchestration as Scrum Master, starting with the first planned step for Sprint 3.
  - Ensure all roles, tasks, and feedback are aligned with the current sprint context.
  - After Sprint 3, proceed to Sprint 4 to repeat unfinished Sprint 2 tasks.

## Scrum Master
- Orchestrate the start of Sprint 3 by confirming the Architect's completion of the containerized developer workflow documentation ([docs/container-workflow.md](../../docs/container-workflow.md)). After user confirmation, prompt DevOps to refactor npm scripts and provide attach/exec instructions as described in [sprints/iteration-3/iteration-3-task-2.md](../sprints/iteration-3/iteration-3-task-2.md).

## Product Owner (PO)
- Await completion of DevOps and Architect tasks in Sprint 3. Next, update onboarding and developer documentation as described in [sprints/iteration-3/iteration-3-task-3.md](../sprints/iteration-3/iteration-3-task-3.md) after DevOps completes their step.

## Architect
- Completed: Documented the containerized developer workflow in [docs/container-workflow.md](../../docs/container-workflow.md). Await user confirmation to proceed to the next role.

## DevOps
- Next: Refactor npm scripts for container lifecycle and provide attach/exec instructions as described in [sprints/iteration-3/iteration-3-task-2.md](../sprints/iteration-3/iteration-3-task-2.md). Await user confirmation to proceed.

## Developer
- No planned next step (awaiting DevOps and PO).

## QA
- No planned next step (awaiting PO and DevOps).

---

This file is updated daily or after each major process step. Always document the next planned step for each role, referencing the relevant task file(s) using markdown links.

## Workspace Context (2025-07-22)
- OS: macOS
- Workspace root: /Users/Shared/Workspaces/2cuGitHub/UpDown
- Key folders: bunfig.toml, LICENSE, package.json, project.outline.md, README.md, restart.md, tsconfig.json, developer/, devops/, docs/, po/, qa/, scrum-master/, sprints/, src/, user specs/
- See restart.md for recovery steps and process.md for best practices.

## Planning Phase (Pre-Sprint 3)
- The Scrum Master will summarize Sprint 2 retro and process changes for all roles.
- The Scrum Master will ask the QA user for approval before the PO starts planning.
- The PO will then create or update tasks for all roles in Sprint 3, reflecting retro learnings and process changes.
- All roles must review the planning summary and update their own documentation and task files accordingly.
- After QA approval, the PO will proceed with planning and assign tasks for Sprint 3.
