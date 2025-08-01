

# PO Process Documentation

This file contains process guidelines, best practices, and lessons learned for the Product Owner role. Always read and update this file before performing PO actions.

## Planning Phase (Precedes Sprint Start)
- The planning.md file must always list all tasks and subtasks for the sprint, with correct links and numbering.
- Priorities are updated so the next open task is priority 1, completed tasks are marked for audit traceability.
- All missing tasks/subtasks must be added to planning.md as soon as discovered.
- This matches the new PO and Scrum Master process: PO always creates tasks in template format, roles refine into subtasks, collaboration subtasks are allowed, and recovery instructions are documented in po/process.md and scrum-master/process.md.

## Process Update (2025-08-01)
- The planning.md file must always list all tasks and subtasks for the sprint, with correct links and numbering.
- Priorities are updated so the next open task is priority 1, completed tasks are marked for audit traceability.
- All missing tasks/subtasks must be added to planning.md as soon as discovered.
- This matches the new PO and Scrum Master process: PO always creates tasks in template format, roles refine into subtasks, collaboration subtasks are allowed, and recovery instructions are documented in po/process.md and scrum-master/process.md.

## Task Dependencies and Ordering in PO Planning (2025-07-30)
- The PO must explicitly document task dependencies in each sprint task file, using markdown links to prerequisite tasks.
- Task ordering is crucial: every task should be actionable only when its dependencies are complete, ensuring logical workflow and minimizing blockers.
- The planning.md file must serve as the central reference for task order and dependencies, and all task files must link back to it.
- The Scrum Master must review dependency links and ordering before sprint start and after any major planning changes.
- This process improvement is now required for all future sprints and onboarding documentation.

## Branch Management and Release Process (PO responsibilities)
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
- The po/process.md file is the authoritative source for PO process recovery and orchestration. Always read this file first after a restart or context loss.
- When switching to a different role during a sprint, always read the corresponding role's process.md file (e.g., devops/process.md, qa/process.md, etc.) to refresh on role-specific practices and requirements before executing any tasks.
- Remove any process.md files from sprint folders to avoid confusion. All process improvements and lessons learned should be added to the global process.md.
- The PO must ensure that all roles refresh their context by reading their respective role process.md files when switching roles during a sprint. This guarantees process integrity and that all best practices are followed for each role.

## Fail-Safe Mechanism: User Prompts & Recovery
- The file `contracts/user.specs/user.captured.prompts.md` is the authoritative log for all user comments, feedback, and critical actions. It acts as a fail-safe and recovery anchor for the project.
- After every major process step, role change, or user feedback, the PO must update this log to ensure reproducibility and traceability.
- In case of context loss, restart, or unexpected interruption, the team can reconstruct the latest project state by replaying the entries in `user.captured.prompts.md`.
- The PO must regularly extrapolate the most important information from user prompts and integrate it into this process.md file, ensuring the process is always aligned with user intent and project evolution.
- This fail-safe mechanism guarantees that the project can always recover to its latest valid state, regardless of interruptions or errors.

## User Prompts Logging & Process Intention
- Every user prompt received in the chat must be logged in `contracts/user.specs/user.captured.prompts.md` as an exact copy, with a timestamp (date and time in UTC) for each entry.
- This log serves as a complete history of user instructions, feedback, and decisions, supporting reproducibility, recovery, and auditability.
- The PO is responsible for maintaining this log and verifying its completeness after each prompt.
- The process ensures that, in case of context loss or recovery, the project can be restored to its latest state by replaying the user prompts log.
- The intention is to make the development process fully transparent, test-driven, and resilient, with every user interaction traceable and actionable.
- The process.md file should always extrapolate and summarize the underlying intention and lessons learned from the user prompts log, guiding future process improvements and team practices.

## Process Update: User Prompt Logging (2025-07-29)
- The PO must always log every user prompt with UTC timestamp in `user.specs/user.captured.prompts.md`, regardless of sprint status or QA audit phase.
- This requirement applies outside of sprints, during audits, and in all project phases.
- Manual additions by the user should be verified and not duplicated.
- This guarantees reproducibility, traceability, and recovery for all user feedback and requirements.

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


## PO Task Creation and Refinement Process (2025-08-01)
- The PO must always create new tasks in the strict template format established in Sprint 3 (see iteration-n-task-1 template).
- Each new task must include all required template headlines in the correct order: Status, Task Description, Context, Intention, Steps, Requirements, Tech Stack Rationale, Acceptance Criteria, QA Audit & User Feedback, Dependencies, Subtasks, References, Backlinks.
- When a task is assigned, the corresponding role (Developer, DevOps, Architect, QA, etc.) is responsible for refining the task into actionable subtasks, which are documented in the 'Subtasks' section and assigned to the appropriate role.
- Subtasks may include collaboration items with other roles as needed.
- All dependencies must be documented as markdown links in the 'Dependencies' section and referenced in planning.md.
- The planning.md file is the central reference for task order, dependencies, and status. All task files must link back to it.
- Recovery: If process or planning files are lost or corrupted, restore from git history and reapply the template process as documented here and in task 15.
- The PO and Scrum Master must review dependency links, ordering, and template compliance before sprint start and after any major planning changes.
- All process improvements and learnings must be documented in this file and cross-referenced in planning.md and QA audit files.

## Task Dependencies and Ordering in PO Planning
- The PO must explicitly document task dependencies in each sprint task file, using markdown links to prerequisite tasks.
- Task ordering is crucial: every task should be actionable only when its dependencies are complete, ensuring logical workflow and minimizing blockers.
- The planning.md file must serve as the central reference for task order and dependencies, and all task files must link back to it.
- The Scrum Master must review dependency links and ordering before sprint start and after any major planning changes.
- This process improvement is now required for all future sprints and onboarding documentation.

## Branch Management and Release Process (PO responsibilities)
- PO collects all feature branches and completed work, decides what gets merged into main.
- PO guides and executes the merge, checks quality with Tester before merging.
- Developers notify PO when a feature branch is ready.
- This is a daily business called the release process, outside of sprints QA audits may be more relaxed.
- Sprint methodology resumes after restart or new sprint.

# PO Process: Task Refinement


## Task Refinement Guidelines
- During the 'refinement' phase of any assigned task, the PO must:
  - Review the task's intention, requirements, and dependencies.
  - Ensure all steps and dependencies are documented as markdown checkboxes in the 'Steps' section of the task file.
  - Collaborate with Developer, QA, Architect, and other roles to clarify requirements, dependencies, and define collaboration subtasks as needed.
  - Update planning.md and task files with any new or changed dependencies and subtasks.
  - Confirm that the refinement phase is complete in the Status section before QA Review can begin.
- All learnings and process changes must be documented in this file and referenced in planning.md and QA audit files.
- Reference: See 'QA Guidelines' and 'Subtask Context & Status Management' in scrum-master/process.md for cross-role best practices.


## Backlink
- [Scrum Master Process & Lessons Learned](../scrum-master/process.md)
