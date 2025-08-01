[Back to Planning](../planning.md)

# Task 18: Implement Task State Machine for Sprint Management

## Status
- [ ] Planned
- [ ] In Progress
  - [ ] refinement
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

## Task Description
Implement a robust TypeScript-based task state machine that manages task status transitions and updates all relevant project files (task markdown, daily.md, daily.json, planning.md) in Sprint 3. The state machine must:
- Read and write status to daily.json.
- Update daily.md as a view of daily.json.
- Update the status in the task markdown file according to the template.
- Update planning.md to reflect the current status.
- Support all standard status transitions (open, in-progress, qa-review, done, blocked).
- Be extensible for future sprint and task management automation.

## Context
This task is part of Sprint 3 and follows the process and compliance requirements established in previous sprints. The solution must be DRY, maintainable, and auditable, with all changes traceable in daily.json and the QA audit.

## Intention
The intention is to automate and standardize task status management, ensuring all documentation and planning files are always up-to-date and compliant with the sprint process.

- [ ] Analyze requirements and review task template.
- [ ] Design the state machine and file update logic.
- [ ] Implement the TypeScript class and methods for state transitions and file updates.
- [ ] Move usage example to the end of the file for correct execution order.
- [ ] Test the state machine with Task 18 and verify all file updates (task md, daily.json, daily.md, planning.md).
- [ ] Document the solution and update the task file status.
- [ ] Refactor usage code for ES module compatibility and execute to update daily.json.
- [ ] Submit for QA review and finalize documentation.
- [ ] Analyze requirements and review task template.
- [ ] Design the state machine and file update logic.
- [ ] Implement the TypeScript class and methods for state transitions and file updates.
- [ ] Move usage example to the end of the file for correct execution order.
- [ ] Test the state machine with Task 18 and verify all file updates (task md, daily.json, daily.md, planning.md).
- [ ] Document the solution and update the task file status.
- [ ] Submit for QA review and finalize documentation.

## Requirements

Requirements (updated for persistent state):
- The state machine must use daily.json as the source of truth for persistent state.
- On 'task 18 reset', daily.json is cleared and reset to planned.
- On each run, the state machine loads daily.json to restore the current status and steps.
- At the end of each run, the state machine writes the updated state back to daily.json.
- All status changes must be reflected in daily.md, planning.md, and the task markdown file.
- The solution must be extensible for future sprints and task types.
- All changes must be auditable and documented in the QA audit.
- The state machine must support resetting the task to 'Planned' state.
- The script must only progress one state or step per run, not all at once.
- When progressing a step, the script must return the next step to be worked off (from the Intention section) and tick it off in the task file.

## Acceptance Criteria
- The state machine updates all relevant files according to the current status in daily.json.
- The task markdown file reflects the current status and follows the template.
- daily.md is regenerated from daily.json.
- planning.md is updated to show the current status of the task.
- QA audit and user feedback are documented.

## QA Audit & User Feedback
All feedback and audit entries must be timestamped (UTC) and documented in this section.

- 2025-08-01 UTC: QA feedback: Strict OOP implementation required. State machine must not skip substates. Implementation must work for any task file, but currently uses Task 18 for demonstration. Non-OOP scripts (e.g., task18StateMachine.ts) must be removed. All transitions must be stepwise and auditable.
- 2025-08-01 UTC: QA feedback: Do not mix status states, in-progress substates, and free-text steps. Script must log all actions, update status, and progress all steps correctly. Adapt script to distinguish between main status, in-progress substates, and intention steps. Test and document this feedback.

### User Prompts Regarding daily.json
- The state machine must create a valid daily.json on the first run and continue to progress it on subsequent runs.
- The state machine must read daily.json at the beginning and update it at the end of each execution.
- The daily.json must include: current sprint, current task, status, fully qualified task filename, daily file name, planning file name.
- All status changes must be reflected in daily.md, planning.md, and the task markdown file.
- The solution must be extensible for future sprints and task types.
- All changes must be auditable and documented in the QA audit.
- Example entry: '- 2025-08-01 UTC: Task state machine implemented and tested.'


- 2025-08-01T14:05:06.724Z UTC: Progressed to status 'In Progress'.

- 2025-08-01T14:05:49.894Z UTC: Progressed to status 'QA Review'.
---
## Subtasks
- [Task 18.1: Extend State Machine for Multi-Task Support](./iteration-3-task-18.1.md)
- [Task 18.2: Document Integration with Sprint Planning](./iteration-3-task-18.2.md)

---
