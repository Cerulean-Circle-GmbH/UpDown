# Scrum Master Process & Team Guidance
## Restart & Recovery Process (2025-08-01)
All restart and recovery steps must:
- Reference the latest QA feedback and user prompts from the current active task file (not user.captured.prompts.md).
- Ensure the Scrum Master always starts recovery by reading README.md, scrum-master/process.md, the current sprint's planning.md, daily.md, and relevant role/task files.
- When switching roles, always read the corresponding role's process.md file to refresh on role-specific practices and requirements before executing any tasks.
- Update planning.md and daily.md with the last successful role and task after a failure or restart.
- Prompt the user for feedback before executing new tasks, especially after planning with the PO.
- Document all new QA feedback and process changes in the current active task file under the section `## QA Audit & User Feedback`.
- Only execute tasks after user feedback is incorporated and the PO's plan is up to date.
These steps must be cross-referenced in restart.md and all relevant process files for traceability and compliance.

## 1. First Principles & DRY Compliance
- DO NOT REPEAT YOURSELF (DRY): Prevent duplication of files, text, and documentation. Always reference canonical sources (process.md, planning.md, task files) and use consistent links/backlinks.
- Status state machine: Never modify fixed defined status states in templates. Status must use only defined state names for process integrity. Status must always be: Planned, In Progress (with subtasks), QA Review, Done. Never add, remove, or rename these states in any task file.
- QA feedback: Document all QA/user feedback with timestamps in QA audit sections and cross-reference in planning.md and process docs.
- Recovery: Restore lost/corrupted files from git history and reapply template process as documented here and in role process files.
- Role-specific process files must backlink to this master process document for overall guidance.
- All batch deduplication actions must be documented for traceability.
- Always verify file existence and naming before batch operations; use `ls` to confirm targets.
- Remove duplicates before renaming to prevent content loss and confusion.
- After any batch file operation, immediately update all references in planning.md and task files.
- Document every file operation, error, and mitigation step in the QA audit file for the current iteration.
- Cross-reference all batch changes in planning.md, QA audit, and process documentation for traceability.
- When refactoring, always check for missed tasks/subtasks and document manual corrections in the QA audit.
- Ensure all headlines and links match the planning and file naming conventions after any batch operation.
- If process.md becomes too long, split out role-specific and technical sections into dedicated files and reference them here.
- The Scrum Master is responsible for enforcing these QA audit learnings and updating process documentation after every major change.
- Guarantee that no information is lost when refactoring or restructuring process documentation. Always review line-by-line with git diff and restore any lost content to the best place in the new structure.
- Never remove information unless it is truly redundant. If in doubt, cross-reference rather than delete.
- This is now a first principle for all process and documentation work.

## 2. Status & Context Management
- Always verify and document the current status and context of parent and sibling tasks when working on a subtask. See First Principles.
- Status management is contextual, not procedural: Only update status if the task is truly incomplete. Never blindly reset status.
- Place context, findings, and decisions in the correct task files for traceability.
- Example: When updating Task 1.1, also review and update Task 1 and Task 1.2 as needed.
- When working on a subtask (e.g., 1.1 or 1.2), always check and document the current status and context of the parent task (e.g., 1) and all related subtasks.
- Move (not copy) context and findings to the correct task files to ensure traceability and clarity.
- Always verify that status sections are complete and correct in all related files.
- This pattern is essential for process diligence and should be followed for all future sprint/task work.
- When updating status (e.g., for tasks 1, 1.1, 1.2), do not blindly reset to 'Planned' after 'Done'.
- Always verify the actual content, context, and completion of the task before changing status.
- The process is a loop: status changes must be based on real results, not protocol or habit.
- Learn to check for completion and only update status if the task is truly incomplete.
- This lesson is now part of the Scrum Master best practices: status management is contextual, not procedural.

## 3. QA Audit & Feedback
- All QA feedback must be documented with a timestamp in the QA audit section of each relevant task file and cross-referenced in planning.md and process documentation. See First Principles.
- Restore and preserve previous QA feedback entries using git history if needed. Add new feedback without removing previous entries.
- Notify QA user before deleting or replacing major sections of content in any markdown file. Only make minimal changes unless explicitly approved by QA.
- When performing batch updates or manual corrections, always restore and preserve previous QA feedback entries. Use git history to recover any lost feedback.
- Always document current status and next steps in daily and planning files for full traceability.
- All QA feedback must be documented with a timestamp in the QA audit section of each relevant task file (e.g., Task 16) and cross-referenced in planning.md and process documentation.
- When performing batch updates or manual corrections, always restore and preserve previous QA feedback entries. Use git history to recover any lost feedback.
- Add new feedback in the list without removing previous entries.

## 4. Role Orchestration & Artifacts
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

## 5. Process Recovery & Fail-Safe
- scrum-master/process.md is the authoritative source for overall process recovery and orchestration. Always read this file first after a restart or context loss.
- When switching roles, read the corresponding role's process.md file to refresh on practices and requirements.
- Remove process.md files from sprint folders to avoid confusion. All improvements and lessons learned go in the global process.md.
- contracts/user.specs/user.captured.prompts.md is the authoritative log for all user comments, feedback, and critical actions. Use it for recovery.
- If a process or context recovery is needed, follow the steps in restart.md and update it as the process evolves.
- The Scrum Master must ensure that all roles refresh their context by reading their respective role process.md files when switching roles during a sprint. This guarantees process integrity and that all best practices are followed for each role.

## 6. User Prompt Logging
- Log every user prompt in contracts/user.specs/user.captured.prompts.md with UTC timestamp. This supports reproducibility, recovery, and auditability.
- Extrapolate and summarize intention and lessons learned from user prompts in process.md to guide future improvements.
- The process.md file should always extrapolate and summarize the underlying intention and lessons learned from the user prompts log, guiding future process improvements and team practices.
- Every user prompt received in the chat must be logged in `contracts/user.specs/user.captured.prompts.md` as an exact copy, with a timestamp (date and time in UTC) for each entry.
- This log serves as a complete history of user instructions, feedback, and decisions, supporting reproducibility, recovery, and auditability.
- The Scrum Master is responsible for maintaining this log and verifying its completeness after each prompt.
- The process ensures that, in case of context loss or recovery, the project can be restored to its latest state by replaying the user prompts log.
- The intention is to make the development process fully transparent, test-driven, and resilient, with every user interaction traceable and actionable.
- The process.md file should always extrapolate and summarize the underlying intention and lessons learned from the user prompts log, guiding future process improvements and team practices.
- The Scrum Master must always log every user prompt with UTC timestamp in `user.specs/user.captured.prompts.md`, regardless of sprint status or QA audit phase.
- This requirement applies outside of sprints, during audits, and in all project phases.
- Manual additions by the user should be verified and not duplicated.
- This guarantees reproducibility, traceability, and recovery for all user feedback and requirements.

## 7. Iteration/Sprint Structure
- Organize all process, planning, and user feedback files by iteration/sprint. Each new iteration gets a dedicated folder with planning.md, user-prompts.md, and process.md.
- Only read/update files for the current iteration unless cross-iteration reference is needed.
- At the end of each sprint, conduct a retrospective (retro.md) to review and improve process.
- Each sprint/iteration will have its own retro.md file (e.g., sprints/iteration-2/retro.md) to capture sprint-specific retrospective notes, feedback, and improvement actions.
- The global scrum-master/process.md is updated with cross-sprint best practices and lessons learned based on retro outcomes.
- Maintain a daily.md file in the scrum-master folder to document the next planned step for each role. This file is updated daily or after each major process step, and always documents the next planned step for each role. After user confirmation, the Scrum Master executes the next step for each role until QA, guidance, or confirmation is required.
- The daily.md file in scrum-master/ must always reference task files using markdown links and reflect the current, unique state for each role after every role change or major process step. Do not concatenate entries; always keep the file short and up to date.
- The daily.md file is updated after every role change or major process step, and is the authoritative source for the next planned step for each role.
- The Scrum Master must update `scrum-master/daily.md` after every step, including after any change to task files, planning, or user-prompts, to reflect the current next step for each role. This is mandatory for every process or planning action.

## 8. Branch & Release Management
- PO collects feature branches, decides what gets merged, and guides the merge with QA checks. Sprint methodology resumes after restart or new sprint.
- PO guides and executes the merge, checks quality with Tester before merging.
- Developers notify PO when a feature branch is ready.
- This is a daily business called the release process, outside of sprints QA audits may be more relaxed.

## 9. Cross-Role Best Practices
- See role-specific process files for detailed guidelines and lessons learned. This file contains only cross-role practices, onboarding, iteration management, and references to role files.
- All roles must follow the radical OOP, protocol-less approach and respect QA/user annotations.
- The process is iterative and user feedback is always prioritized.
- All documentation, onboarding, and process files must be kept up to date as the project evolves.
- The general scrum-master/process.md file is the authoritative source for Scrum Master and LLM process documentation and is not duplicated per sprint. Remove any process.md files from sprint folders to avoid confusion. All process improvements and lessons learned should be added to the global process.md.

## 10. References
- [QA Process](../qa/process.md)
- [PO Process](../po/process.md)
- [Architect Process](../architect/process.md)
- [DevOps Process](../devops/process.md)
- [Developer Process](../developer/process.md)
- [sprints/iteration-3/planning.md](../sprints/iteration-3/planning.md)
- [contracts/user.specs/user.captured.prompts.md](../contracts/user.specs/user.captured.prompts.md)

## Planning & QA Audit Update (2025-08-01)
- scrum-master/process.md restructured for DRY, clarity, and digestibility per task 17.
- All unique content preserved, redundant statements removed, and principles cross-referenced.
- Headline structure now matches project requirements and onboarding standards.
- Learnings and actions documented in QA Audit & User Feedback in task 17 and planning.md.

---

This file is a living document for Scrum Master best practices and team guidance. All cross-role principles, QA feedback, and process learnings are consolidated here for clarity and traceability.


