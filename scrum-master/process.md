# Scrum Master Process & Lessons Learned

**Date:** 2025-07-22

## Role of the Scrum Master
- Always start as Scrum Master after a restart or context loss.
- Orchestrate all roles (PO, DevOps, Architect, Developer, QA, etc.) and assign tasks based on the project outline and user feedback.
- Update the project outline with the last successful role and task, so the next step is always clear.
- Ensure the PO updates task files before implementation and that every task produces a concrete artifact (spec, code, doc).
- Guarantee that every role produces a concrete artifact (specification, code, or documentation) for each completed task. As Scrum Master, check for the existence of these artifacts and reference them in the relevant task files.
- Prompt the user for feedback before executing new or changed tasks, and incorporate feedback into planning and execution.
- Document all user feedback and process changes in user.captured.prompts.md and ensure all roles are aware of QA/user annotations.
- Enforce that the API and modeling approach follows radical OOP, protocol-less design, as formalized by the PO and Architect.
- Ensure the presence and importance of the "# backup and QA user annotations" section in docs/api-and-model-spec.md is communicated to all roles and referenced in onboarding and process docs.
- After each task, check that the required artifact exists and is referenced in the relevant task file.
- If a process or context recovery is needed, follow the steps in restart.md and update it as the process evolves.
- Always update project.outline.md after each role shift or major task completion, so the project status and next steps are always clear for the team.
- Guarantee onboarding and process docs clarify that all Bun-related commands must be run inside the dev container, and document how to start/enter the dev container using the provided npm/docker scripts.
- Always update user.captured.prompts.md and project.outline.md after every major process, role shift, or user feedback.
- After starting a new iteration or major process change, document the rationale and next steps in process.md.
- When fixing or refactoring an iteration, clearly mark the transition and ensure all lessons learned are captured for future reference.
- Organize all process, outline, and user feedback files by iteration/sprint to keep context manageable and improve performance.
- For each new iteration, create a dedicated folder (e.g., sprints/iteration-2/, sprints/iteration-3/) containing:
  - outline.md (project outline for the iteration)
  - user-prompts.md (user feedback for the iteration)
  - process.md (scrum master/process notes for the iteration)
- Only read and update the files for the current iteration unless a cross-iteration reference is needed.
- Add this structure and best practice to restart.md and process.md.
- At the end of each sprint, conduct a retrospective (retro) to review what went well, what could be improved, and to identify process changes or improvement actions for the next sprint.
- Each sprint/iteration will have its own retro.md file (e.g., sprints/iteration-2/retro.md) to capture sprint-specific retrospective notes, feedback, and improvement actions.
- The global scrum-master/process.md is updated with cross-sprint best practices and lessons learned based on retro outcomes.
- Maintain a daily.md file in the scrum-master folder to document the next planned step for each role. This file is updated daily or after each major process step, and always documents the next planned step for each role. After user confirmation, the Scrum Master executes the next step for each role until QA, guidance, or confirmation is required.
- The daily.md file in scrum-master/ must always reference task files using markdown links and reflect the current, unique state for each role after every role change or major process step. Do not concatenate entries; always keep the file short and up to date.
- The daily.md file is updated after every role change or major process step, and is the authoritative source for the next planned step for each role.

## Information for the Team
- The Scrum Master is responsible for process integrity, traceability, and quality assurance.
- All roles must follow the radical OOP, protocol-less approach and respect QA/user annotations.
- The process is iterative and user feedback is always prioritized.
- All documentation, onboarding, and process files must be kept up to date as the project evolves.
- The general scrum-master/process.md file is the authoritative source for Scrum Master and LLM process documentation and is not duplicated per sprint. Remove any process.md files from sprint folders to avoid confusion. All process improvements and lessons learned should be added to the global process.md.

---

This file is a living document for Scrum Master best practices and team guidance.
