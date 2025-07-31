# Scrum Master Process & Lessons Learned
## First Principle: DO NOT REPEAT YOURSELF (DRY)
- The Scrum Master and all roles must actively prevent duplication of files, text, and documentation throughout the project.
- When a duplicate or repeated section is found, replace it in batch mode with a single, authoritative source and use consistent links and backlink structures.
- Always prefer referencing and backlinking to canonical files (e.g., process.md, planning.md, task files) rather than copying content.
- When refactoring, check for and remove duplicates, and update all references to point to the correct, unique file or section.
- This principle applies to all documentation, code, and process artifacts. It ensures clarity, maintainability, and traceability across the project.
- Document all batch deduplication actions in the QA audit and process documentation for traceability.

## Latest Learnings from QA Audit (2025-07-30)
- Always verify file existence and naming before batch operations; use `ls` to confirm targets.
- Remove duplicates before renaming to prevent content loss and confusion.
- After any batch file operation, immediately update all references in planning.md and task files.
- Document every file operation, error, and mitigation step in the QA audit file for the current iteration.
- Cross-reference all batch changes in planning.md, QA audit, and process documentation for traceability.
- When refactoring, always check for missed tasks/subtasks and document manual corrections in the QA audit.
- Ensure all headlines and links match the planning and file naming conventions after any batch operation.
- Role-specific process files must backlink to this master process document for overall guidance.
- If process.md becomes too long, split out role-specific and technical sections into dedicated files and reference them here.
- The Scrum Master is responsible for enforcing these QA audit learnings and updating process documentation after every major change.

**Date:** 2025-07-22
**Process Reminder (2025-07-24):**

## Definition of Done (Scrum Master)
- Before interacting with the user, always verify:
    - The latest user prompt is logged in user.captured.prompts.md with a timestamp.
    - All referenced artifacts (specs, code, docs) exist and are up to date.
    - All process and onboarding docs reference the correct locations for key files (e.g., process.md).

## Subtask Context & Status Management (Pattern)
- When working on a subtask (e.g., 1.1 or 1.2), always check and document the current status and context of the parent task (e.g., 1) and all related subtasks.
- Move (not copy) context and findings to the correct task files to ensure traceability and clarity.
- Always verify that status sections are complete and correct in all related files.
- This pattern is essential for process diligence and should be followed for all future sprint/task work.
- Example: If Task 1.1 is in progress, document the status and findings in both Task 1 and Task 1.1 files, and update Task 1.2 as needed.

## QA Guidelines
- All team members must avoid spaces in folder names. Use '.' or '-' instead of spaces when creating directories (e.g., 'user.specs' instead of 'user specs').
- All QA feedback must be documented with a timestamp in the QA audit section of each relevant task file (e.g., Task 16) and cross-referenced in planning.md and process documentation.
- When performing batch updates or manual corrections, always restore and preserve previous QA feedback entries. Use git history to recover any lost feedback.
- - Add new feedback in the list without removing previous entries.
- The Scrum Master and QA must enforce this guideline for all new folders and refactor any existing folders that do not comply.
- For role-specific refinement process requirements, see the relevant section in each role's process.md file (e.g., developer/process.md, qa/process.md, po/process.md).

## Planning Phase (Precedes Sprint Start)

## Task Dependencies and Ordering in PO Planning (2025-07-30)
- The PO must explicitly document task dependencies in each sprint task file, using markdown links to prerequisite tasks.
- Task ordering is crucial: every task should be actionable only when its dependencies are complete, ensuring logical workflow and minimizing blockers.
- The planning.md file must serve as the central reference for task order and dependencies, and all task files must link back to it.
- The Scrum Master must review dependency links and ordering before sprint start and after any major planning changes.
- This process improvement is now required for all future sprints and onboarding documentation.

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
- Always update planning.md after each role shift or major task completion, so the project status and next steps are always clear for the team.
- Guarantee onboarding and process docs clarify that all Bun-related commands must be run inside the dev container, and document how to start/enter the dev container using the provided npm/docker scripts.
- Always update user.captured.prompts.md and planning.md after every major process, role shift, or user feedback.
- After starting a new iteration or major process change, document the rationale and next steps in process.md.
- When fixing or refactoring an iteration, clearly mark the transition and ensure all lessons learned are captured for future reference.
- Organize all process, planning, and user feedback files by iteration/sprint to keep context manageable and improve performance.
- For each new iteration, create a dedicated folder (e.g., sprints/iteration-2/, sprints/iteration-3/) containing:
  - planning.md (project planning and outline for the iteration)
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
- The Scrum Master must update `scrum-master/daily.md` after every step, including after any change to task files, planning, or user-prompts, to reflect the current next step for each role. This is mandatory for every process or planning action.

## Branch Management and Release Process (Added July 2025)
- PO collects all feature branches and completed work, decides what gets merged into main.
- PO guides and executes the merge, checks quality with Tester before merging.
- Developers notify PO when a feature branch is ready.
- This is a daily business called the release process, outside of sprints QA audits may be more relaxed.
- Sprint methodology resumes after restart or new sprint.

## Intention
Iterated understanding: Documentation and user feedback must be added into the context of the corresponding task or subtask. Only one status can be active at a time (radio box, not checkbox). This ensures clarity after recovery.
User queries are to be added to user.captured.prompts.md with UTC timestamp. 
User feedback in tasks is always concatenated, never removed. 
User Feedback in tasks are added to the corresponding task.
Scrum Master and team prompts are documented in Next Steps with timestamp. Logic applied to all relevant files.
### Summary
Only user prompts (with UTC timestamp) are logged in user.captured.prompts.md. No Scrum Master or team prompts.
User feedback in tasks is always concatenated, never removed, and must be added to the corresponding task.
Scrum Master and team prompts are documented in the "Next Steps" section of each task/subtask, with timestamp.
The process.md now clearly states these rules and the fail-safe mechanism for recovery.
The intention and lessons learned from user prompts are regularly extrapolated and summarized in process.md.

## Role-Based Process Recovery (2025-07-30)
- The scrum-master/process.md file is the authoritative source for overall process recovery and orchestration. Always read this file first after a restart or context loss.
- When switching to a different role during a sprint, always read the corresponding role's process.md file (e.g., devops/process.md, qa/process.md, etc.) to refresh on role-specific practices and requirements before executing any tasks.
- Remove any process.md files from sprint folders to avoid confusion. All process improvements and lessons learned should be added to the global process.md.
- The Scrum Master must ensure that all roles refresh their context by reading their respective role process.md files when switching roles during a sprint. This guarantees process integrity and that all best practices are followed for each role.

## Fail-Safe Mechanism: User Prompts & Recovery
- The file `contracts/user.specs/user.captured.prompts.md` is the authoritative log for all user comments, feedback, and critical actions. It acts as a fail-safe and recovery anchor for the project.
- After every major process step, role change, or user feedback, the Scrum Master must update this log to ensure reproducibility and traceability.
- In case of context loss, restart, or unexpected interruption, the team can reconstruct the latest project state by replaying the entries in `user.captured.prompts.md`.
- The Scrum Master must regularly extrapolate the most important information from user prompts and integrate it into this process.md file, ensuring the process is always aligned with user intent and project evolution.
- This fail-safe mechanism guarantees that the project can always recover to its latest valid state, regardless of interruptions or errors.

## User Prompts Logging & Process Intention
- Every user prompt received in the chat must be logged in `contracts/user.specs/user.captured.prompts.md` as an exact copy, with a timestamp (date and time in UTC) for each entry.
- This log serves as a complete history of user instructions, feedback, and decisions, supporting reproducibility, recovery, and auditability.
- The Scrum Master is responsible for maintaining this log and verifying its completeness after each prompt.
- The process ensures that, in case of context loss or recovery, the project can be restored to its latest state by replaying the user prompts log.
- The intention is to make the development process fully transparent, test-driven, and resilient, with every user interaction traceable and actionable.
- The process.md file should always extrapolate and summarize the underlying intention and lessons learned from the user prompts log, guiding future process improvements and team practices.

## Process Update: User Prompt Logging (2025-07-29)
- The Scrum Master must always log every user prompt with UTC timestamp in `user.specs/user.captured.prompts.md`, regardless of sprint status or QA audit phase.
- This requirement applies outside of sprints, during audits, and in all project phases.
- Manual additions by the user should be verified and not duplicated.
- This guarantees reproducibility, traceability, and recovery for all user feedback and requirements.

## Information for the Team
- The Scrum Master is responsible for process integrity, traceability, and quality assurance.
- All roles must follow the radical OOP, protocol-less approach and respect QA/user annotations.
- The process is iterative and user feedback is always prioritized.
- All documentation, onboarding, and process files must be kept up to date as the project evolves.
- The general scrum-master/process.md file is the authoritative source for Scrum Master and LLM process documentation and is not duplicated per sprint. Remove any process.md files from sprint folders to avoid confusion. All process improvements and lessons learned should be added to the global process.md.

## Lesson: Diligent Context and Status Management for Subtasks
- Always verify and document the current status of parent and sibling tasks when working on a subtask.
- Place context, findings, and decisions in the correct task files for traceability.
- This ensures process integrity and helps all roles understand the current state of work.
- Example: When updating Task 1.1, also review and update Task 1 and Task 1.2 as needed.
- This pattern is now part of the scrum master process best practices.

## Reflection & Lesson: Status Verification Must Be Contextual
- When updating status (e.g., for tasks 1, 1.1, 1.2), do not blindly reset to 'Planned' after 'Done'.
- Always verify the actual content, context, and completion of the task before changing status.
- The process is a loop: status changes must be based on real results, not protocol or habit.
- Learn to check for completion and only update status if the task is truly incomplete.
- This lesson is now part of the Scrum Master best practices: status management is contextual, not procedural.

---

# Project Process Documentation

## Cross-Role Best Practices
- See role-specific process files for detailed guidelines and lessons learned.
- This file contains only cross-role practices, onboarding, iteration management, and references to role files.

## Role-Specific Processes
- Each project role (Scrum Master, QA, PO, Architect, DevOps, Developer) has a dedicated process file:
  - [Scrum Master Process](../scrum-master/process.md)
  - [QA Process](../qa/process.md)
  - [PO Process](../po/process.md)
  - [Architect Process](../architect/process.md)
  - [DevOps Process](../devops/process.md)
  - [Developer Process](../developer/process.md)
- When performing any project action, always read the process documentation for your role.
- If this file becomes too long, split out additional process elements into subfiles and reference them here as with tasks.

---

This file is a living document for Scrum Master best practices and team guidance.


