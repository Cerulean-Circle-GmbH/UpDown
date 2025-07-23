**Date:** 2025-07-22

## Role of the Scrum Master

## Daily Role Step Documentation Process
- The Scrum Master must maintain a daily record of the next planned step for each role in `scrum-master/daily.md`.
- After user confirmation, each role proceeds with its documented step until QA, guidance, or confirmation is requested.
- Always update `daily.md` with the next step for each role, even if a role currently has no planned step (leave description empty).
- This process ensures traceability and clarity for all team members and supports QA/user feedback cycles.

Reference: See `scrum-master/daily.md` for the current daily steps for all roles.
- Organize all process, outline, and user feedback files by iteration/sprint to keep context manageable and improve performance.
- For each new iteration, create a dedicated folder (e.g., sprints/iteration-2/, sprints/iteration-3/) containing:
  - user-prompts.md (user feedback for the iteration)
  - process.md (scrum master/process notes for the iteration)
- Only read and update the files for the current iteration unless a cross-iteration reference is needed.
- Add this structure and best practice to restart.md and process.md.
- At the end of each sprint, conduct a retrospective (retro) to review what went well, what could be improved, and to identify process changes or improvement actions for the next sprint.
- Each sprint/iteration will have its own retro.md file (e.g., sprints/iteration-2/retro.md) to capture sprint-specific retrospective notes, feedback, and improvement actions.
- The global scrum-master/process.md is updated with cross-sprint best practices and lessons learned based on retro outcomes.

## Daily History Log Process
- For each sprint/iteration, create a `daily-history.md` file in the corresponding folder (e.g., `sprints/iteration-3/daily-history.md`).
- Whenever lines or sections are removed from `scrum-master/daily.md`, append them to the appropriate role and date in the sprint's `daily-history.md`.
- This log must preserve the chronological order of updates for each role, providing a complete history of actions and decisions during the sprint.
- The Scrum Master is responsible for maintaining this log as part of the daily update process.
- The existence and completeness of the `daily-history.md` is now a quality gate in the definition of done for each sprint.

## Summarizing and Reflecting in Daily History
- At the end of each major orchestration cycle or when a significant milestone is reached, the Scrum Master must summarize the achievements, process improvements, and team alignment in the current sprint's `daily-history.md`.
- This summary should capture the essence of what was achieved, how the process evolved, and the current state of the team, providing a high-level view for later review and retrospectives.
- The structure of `daily-history.md` may be adapted as needed to ensure clarity and usefulness for future reference.
- This step is a key part of the learning loop and supports both traceability and organizational learning.

## Permanent Lesson: Status Documentation and Learning Loop
- After completing any role's task, the Scrum Master must verify that status and completion are documented according to the persistent definition of done in this process.md file.
- The Scrum Master will prompt and verify status documentation for all roles after each task, ensuring process awareness and continuous improvement.
- This learning loop is now a permanent part of the process: after each task, check and update status documentation, and reinforce this practice in retrospectives and onboarding materials.
- If daily.md is reset or lost, this lesson remains in process.md and must be re-applied immediately.

## Definition of Done (Persistent)
- Each role must document status and completion of their tasks in `scrum-master/daily.md` immediately after execution.
- Status documentation must include:
  - What was completed
  - Any blockers, questions, or feedback
  - Reference to updated files or documentation
- The Scrum Master is responsible for verifying that each role has updated their status per the definition of done after every task.
- The Scrum Master must also ensure that all removed lines from `daily.md` are appended to the correct sprint's `daily-history.md` for traceability.
- This process is mandatory and must be reinforced in retrospectives and onboarding.
- If `daily.md` is reset or lost, this definition remains in `process.md` and must be re-applied immediately.

## Information for the Team
- The Scrum Master is responsible for process integrity, traceability, and quality assurance.
- All roles must follow the radical OOP, protocol-less approach and respect QA/user annotations.
- The process is iterative and user feedback is always prioritized.
- All documentation, onboarding, and process files must be kept up to date as the project evolves.
- The general scrum-master/process.md file is the authoritative source for Scrum Master and LLM process documentation and is not duplicated per sprint. Remove any process.md files from sprint folders to avoid confusion. All process improvements and lessons learned should be added to the global process.md.

---

This file is a living document for Scrum Master best practices and team guidance.
