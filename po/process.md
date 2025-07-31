# PO Process Documentation

This file contains process guidelines, best practices, and lessons learned for the Product Owner role. Always read and update this file before performing PO actions.

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
  - Collaborate with Developer, QA, and Architect to clarify requirements and dependencies.
  - Update planning.md and task files with any new or changed dependencies.
  - Confirm that the refinement phase is complete in the Status section before QA Review can begin.
- Reference: See 'QA Guidelines' and 'Subtask Context & Status Management' in scrum-master/process.md for cross-role best practices.

## Backlink
- [Scrum Master Process & Lessons Learned](../scrum-master/process.md)
