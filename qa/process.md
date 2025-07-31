# QA Process Documentation

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
