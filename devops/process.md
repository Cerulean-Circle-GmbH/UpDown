# DevOps Process Documentation

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
