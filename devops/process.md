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

## Backlink
- [Back to Scrum Master Process](../scrum-master/process.md)
