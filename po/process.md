
# PO Process Documentation

This file contains process guidelines, best practices, and lessons learned for the Product Owner role. Always read and update this file before performing PO actions.

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
