## Restart & Recovery Process (2025-08-01)
All process and status updates (task files, daily.md, daily.json, planning.md) for DevOps must be performed using the Task State Machine implemented in [Task 18](../sprints/iteration-3/iteration-3-task-18-implement-task-state-machine.md). Reference Task 19 for future improvements (Web4Scrum foundation).

All restart and recovery steps for DevOps must:
- Reference the latest QA feedback and user prompts from the current active task file (not user.captured.prompts.md).
- Always start recovery by reading README.md, scrum-master/process.md, the current sprint's planning.md, sprints/iteration-3/daily.md, and relevant role/task files.
- When switching to DevOps, read devops/process.md to refresh on role-specific practices and requirements before executing any tasks.
- Update planning.md and sprints/iteration-3/daily.md with the last successful role and task after a failure or restart.
- Prompt the user for feedback before executing new tasks, especially after planning with the PO.
- Document all new QA feedback and process changes in the current active task file under the section `## QA Audit & User Feedback`.
- Only execute tasks after user feedback is incorporated and the PO's plan is up to date.
These steps must be cross-referenced in restart.md and all relevant process files for traceability and compliance.
# DevOps Process Documentation

## Integration of Task State Machine
All DevOps status and file updates must use the Task State Machine for traceability and compliance. Manual updates are deprecated except for emergency recovery. See [Task 18](../sprints/iteration-3/iteration-3-task-18-implement-task-state-machine.md) and [Task 19](../sprints/iteration-3/iteration-3-task-19-once-ts-cli-submodule-management.md).

This file contains process guidelines, best practices, and lessons learned for the DevOps role. Always read and update this file before performing DevOps actions.

## File Refactoring & Automation Process
- All file renaming, batch operations, and navigation changes must be documented in the QA audit file for each iteration.
- Before batch renaming, always list files with `ls` and verify targets.
- Remove duplicates before renaming to prevent content loss.
- Update all references in planning.md and task files after renaming.
- Log errors and mitigation steps in the QA audit.
- Lessons learned should be added to this section for future improvement.

## DevOps-Specific Best Practices
- All Bun-related commands must be run inside the dev container.
- Document how to start/enter the dev container using the provided npm/docker scripts.
- Ensure onboarding and process docs clarify container usage for all roles.

# DevOps Process: Task Refinement

## Task Refinement Guidelines
- During the 'refinement' phase of any assigned task, DevOps must:
  - Review the task's technical requirements, dependencies, and environment setup.
  - Ensure all DevOps steps and scripts are documented as markdown checkboxes in the 'Steps' section of the task file.
  - Collaborate with PO, Developer, and Architect to clarify requirements and environment needs.
  - Document any infrastructure risks or decisions in the task file.
  - Confirm that the refinement phase is complete in the Status section before QA Review can begin.
- Reference: See 'QA Guidelines' and 'Subtask Context & Status Management' in scrum-master/process.md for cross-role best practices.

## Backlink
- [Scrum Master Process & Lessons Learned](../scrum-master/process.md)
