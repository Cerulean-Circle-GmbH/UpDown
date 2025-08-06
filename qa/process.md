## Restart & Recovery Process (2025-08-01)
All process and status updates (task files, daily.md, daily.json, planning.md) for QA must be performed using the Task State Machine implemented in [Task 18](../sprints/iteration-3/iteration-3-task-18-implement-task-state-machine.md). Reference Task 19 for future improvements (Web4Scrum foundation).

All restart and recovery steps for QA must:
- Reference the latest QA feedback and user prompts from the current active task file (not user.captured.prompts.md).
- Always start recovery by reading README.md, scrum-master/process.md, the current sprint's planning.md, sprints/iteration-3/daily.md, and relevant role/task files.
- When switching to QA, read qa/process.md to refresh on role-specific practices and requirements before executing any tasks.
- Update planning.md and sprints/iteration-3/daily.md with the last successful role and task after a failure or restart.
- Prompt the user for feedback before executing new tasks, especially after planning with the PO.
- Document all new QA feedback and process changes in the current active task file under the section `## QA Audit & User Feedback`.
- Only execute tasks after user feedback is incorporated and the PO's plan is up to date.
These steps must be cross-referenced in restart.md and all relevant process files for traceability and compliance.
# QA Process

## Overview
QA ensures quality, testing, and validation of all deliverables.

## CMM Level 3+ Requirements
**Reference**: See [CMM Level 3+ Requirements Documentation](../docs/cmm-level3-requirements.md) for process compliance requirements.

## Test Configuration
**Reference**: See [Test Configuration Documentation](../docs/test-configuration.md) for current test setup and exclusions.

## Test-Driven Development (TDD) Requirements
**Reference**: See [Process Standards Documentation](../docs/process-standards.md) for TDD integration requirements.

## Process Improvement
**Reference**: See [Process Standards Documentation](../docs/process-standards.md) for process improvement requirements.

## Restart & Recovery Process
**Reference**: See [Restart & Recovery Process Documentation](../docs/restart-recovery-process.md) for recovery steps and procedures.

# QA Process Documentation

## Integration of Task State Machine
All QA status and file updates must use the Task State Machine for traceability and compliance. Manual updates are deprecated except for emergency recovery. See [Task 18](../sprints/iteration-3/iteration-3-task-18-implement-task-state-machine.md) and [Task 19](../sprints/iteration-3/iteration-3-task-19-once-ts-cli-submodule-management.md).

This file contains process guidelines, best practices, and lessons learned for the QA role. Always read and update this file before performing QA actions.

## QA Guidelines
- All team members must avoid spaces in folder names. Use '.' or '-' instead of spaces when creating directories (e.g., 'user.specs' instead of 'user specs').
- The Scrum Master and QA must enforce this guideline for all new folders and refactor any existing folders that do not comply.

## File Refactoring & Automation Process
- All file renaming, batch operations, and navigation changes must be documented in the QA audit file for each iteration.
- Before batch renaming, always list files with `ls` and verify targets.
- Remove duplicates before renaming to prevent content loss.
- Update all references in planning.md and task files after renaming.
- Log errors and mitigation steps in the QA audit.
- Lessons learned should be added to this section for future improvement.

# QA Process: Task Refinement

## Task Refinement Guidelines
- During the 'refinement' phase of any assigned task, QA must:
  - Review the task's requirements, acceptance criteria, and context.
  - Ensure all steps and test cases are documented as markdown checkboxes in the 'Steps' section of the task file.
  - Collaborate with Developer, PO, and Architect to clarify requirements and test coverage.
  - Identify any gaps in requirements or acceptance criteria and document them in the QA audit section of the task file.
  - Confirm that the refinement phase is complete in the Status section before QA Review can begin.
- Reference: See 'QA Guidelines' and 'Subtask Context & Status Management' in scrum-master/process.md for cross-role best practices.

## Backlink
- [Scrum Master Process & Lessons Learned](../scrum-master/process.md)
