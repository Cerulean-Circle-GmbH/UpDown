# Project Restart Summary

**Date:** 2025-07-21

## Project Context
- Project: UpDown (multiplayer card game, P2P, web-first, Bun/TypeScript stack)
- All roles (PO, Scrum Master, DevOps, Backend, Frontend, QA, etc.) are played by the LLM, orchestrated by the Scrum Master.
- User acts as QA and provides feedback that must be incorporated before proceeding.
- All requirements, tasks, and user feedback are tracked in markdown files in the workspace.

## How to Recover and Find the Next Task
1. Always start as Scrum Master. The Scrum Master orchestrates all roles and assigns tasks.
2. To recover the last state, read:
   - `project.outline.md` for the overall project status and last completed/planned tasks.
   - The relevant role/task files in `po/`, `devops/`, `qa/`, etc., to find the last successful role and task.
   - `user specs/user.captured.prompts.md` for the latest user feedback and requirements.
3. Always document the exact interruption or restart point in the relevant task file (e.g., add a note to the current task in po/, devops/, etc.). This ensures recovery can resume at the correct step.
3. The Scrum Master should update the project outline with the last successful role and task, so the next task is always clear after a failure or restart.
4. The Scrum Master should prompt the user for feedback before executing new tasks, especially after planning with the PO.
5. The PO must update the task files (e.g., add new tasks to `po/iteration-2-task-7.md` if needed) to reflect new plans and requirements.
6. The DevOps and other roles should only execute tasks after user feedback is incorporated and the PO's plan is up to date.

## General Next Steps After Recovery
- Identify the last successful role and task from `project.outline.md` and the role task files.
- Resume from the next planned task, updating the outline and task files as needed.
- Always prompt the user for feedback before executing new or changed tasks.
- Document all new user feedback and process changes in `user specs/user.captured.prompts.md`.

**General Instruction:**
Always document every process step in the corresponding files (e.g., task files, workflow documentation, user feedback logs) to ensure accurate recovery and traceability after any interruption or restart.

---

This file is for Scrum Master context recovery. If context is lost, read this file and the referenced files to resume work correctly. Always update the outline and task files to reflect the current state and next steps.

---
### General Abstract Process Note
To enable recovery due to interruption or restart it is the Scrum-Masters Job to document the following points in this document: scrum-master/daily.md continuously:
- Document the exact point of interruption and last successful action in the outline and relevant task file.
- Record the current state, next planned step, and location of documentation.
- Log any user feedback in the user feedback file.
- Ensure traceability by updating all relevant files.
This guarantees reliable recovery and continuity for all roles.
- Update the outline with the latest interruption/restart status and a pointer to the current authoritative task file.
- Remove any duplicate or outdated interruption/restart information from other files.
- Ensure all team members know to consult the outline for the latest status and next steps.

---

### After Recovery
To confirm that the alignment between your understanding and the users knowing of the status is correct if needed the user can comment and correct.
Once the recovery process is done, state to the user your understanding of your role and what is the next task

