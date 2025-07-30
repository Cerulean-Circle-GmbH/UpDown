# Project Restart Summary

**Date:** 2025-07-21

## Project Context
- Project: UpDown (multiplayer card game, P2P, web-first, Bun/TypeScript stack)
- All roles (PO, Scrum Master, DevOps, Backend, Frontend, QA, etc.) are played by the LLM, orchestrated by the Scrum Master.
- User acts as QA and provides feedback that must be incorporated before proceeding.
- All requirements, tasks, and user feedback are tracked in markdown files in the workspace.

## How to Recover and Find the Next Task
1. Read the README.md
2. Always start as Scrum Master. The Scrum Master orchestrates all roles and assigns tasks.
3.  To recover the last state, read:
   - `scrum-master/process.md` as the authoritative process definition for recovery and overall project process. This file must be read first to understand the recovery and orchestration steps.
   - `project.outline.md` for the overall project status and last completed/planned tasks.
   - The relevant role/task files in `po/`, `devops/`, `qa/`, etc., to find the last successful role and task.
   - `user specs/user.captured.prompts.md` for the latest user feedback and requirements.
   - When switching to a different role during a sprint, always read the corresponding role's process.md file (e.g., `devops/process.md`, `qa/process.md`, etc.) to refresh on role-specific practices and requirements before executing any tasks.
4.  The Scrum Master should update the project outline with the last successful role and task, so the next task is always clear after a failure or restart.
5.  The Scrum Master should prompt the user for feedback before executing new tasks, especially after planning with the PO.
6.  The PO must update the task files (e.g., add new tasks to `po/iteration-2-task-7.md` if needed) to reflect new plans and requirements.
7.  The DevOps and other roles should only execute tasks after user feedback is incorporated and the PO's plan is up to date.


## General Next Steps After Recovery
- Identify the last successful role and task from `project.outline.md` and the role task files.
- Resume from the next planned task, updating the outline and task files as needed.
- Always prompt the user for feedback before executing new or changed tasks.
- Document all new user feedback and process changes in `user specs/user.captured.prompts.md`.

## Iteration and Sprint Management
- To keep context manageable, split all outline, user feedback, and process files by iteration/sprint into dedicated folders (e.g., sprints/iteration-2/, sprints/iteration-3/).
- For each new iteration, only read and update the files for the current sprint unless a cross-iteration reference is needed.

---

This file is for Scrum Master context recovery. If context is lost, read this file and the referenced files to resume work correctly. Always update the outline and task files to reflect the current state and next steps.
Additionally, the Scrum Master must ensure that all roles refresh their context by reading their respective role process.md files when switching roles during a sprint. This guarantees process integrity and that all best practices are followed for each role.
