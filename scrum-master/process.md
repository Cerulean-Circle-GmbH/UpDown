# Scrum Master Process & Lessons Learned

**Date:** 2025-07-22

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
- Always update project.outline.md after each role shift or major task completion, so the project status and next steps are always clear for the team.
- Guarantee onboarding and process docs clarify that all Bun-related commands must be run inside the dev container, and document how to start/enter the dev container using the provided npm/docker scripts.
- Always update user.captured.prompts.md and project.outline.md after every major process, role shift, or user feedback.
- After starting a new iteration or major process change, document the rationale and next steps in process.md.
- When fixing or refactoring an iteration, clearly mark the transition and ensure all lessons learned are captured for future reference.

## Information for the Team
- The Scrum Master is responsible for process integrity, traceability, and quality assurance.
- All roles must follow the radical OOP, protocol-less approach and respect QA/user annotations.
- The process is iterative and user feedback is always prioritized.
- All documentation, onboarding, and process files must be kept up to date as the project evolves.

---

This file is a living document for Scrum Master best practices and team guidance.
