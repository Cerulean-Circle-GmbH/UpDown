
[Back to Planning](./planning.md)

# Iteration 3 Task 15: PO Role and Planning Process Onboarding

## Status
- [x] Planned
- [ ] In Progress
  - [ ] refinement
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

## Task Description
- Document the PO role and planning process in onboarding documentation.
- Explain how to create, number, and link sprint tasks, including dependency management.
- Describe how to use planning.md as the central reference for task order and dependencies.
- Include examples of markdown links for dependencies and backlinks to planning.md.
- Reference the updated scrum-master/process.md for process compliance.

## Context
- Recent process improvements require the PO to document task dependencies and ordering for every sprint.
- This ensures all tasks are actionable and sequenced logically, minimizing blockers and improving traceability.

## Intention
- Guarantee that onboarding documentation clearly explains the PO role and planning process for new team members.
- Ensure process compliance and traceability for onboarding and QA.

## Steps
- [x] Document the PO role and planning process in onboarding documentation.
- [x] Explain how to create, number, and link sprint tasks, including dependency management.
- [x] Describe how to use planning.md as the central reference for task order and dependencies.
- [x] Include examples of markdown links for dependencies and backlinks to planning.md.
- [x] Reference the updated scrum-master/process.md for process compliance.
- [ ] Assign to QA for verification and feedback.

## Requirements
- Onboarding documentation must clearly explain the PO role and planning process.
- All new PO team members must be able to follow the onboarding guide to create and link tasks correctly.
- Examples and references must be included for dependency management and planning.md usage.

## Tech Stack Rationale
- Use markdown documentation for onboarding and process compliance.
- Reference updated process documentation for traceability.

## Acceptance Criteria
- Onboarding documentation clearly explains the PO role and planning process.
- All new PO team members can follow the onboarding guide to create and link tasks correctly.
- Examples and references are included for dependency management and planning.md usage.


## QA Audit & User Feedback
- 2025-08-01 UTC: Task refactored to strictly match template headlines/order and process compliance.
- 2025-08-01 UTC: QA user comment: "As of task 15 this is exactly what we are supposed to do now. The PO will always create new tasks in the template format as we just refactored. When we are working on a task, the corresponding role will refine the tasks into subtasks that are assigned to the role responsible to solve it. The refinement can also define collaboration subtasks with other roles. Document all these learnings and add my comment as QA user to task 15. Goal is to be able to recover at any time into this process."

## PO Process Learnings (2025-08-01)
- The PO must always create new tasks in the strict template format established in Sprint 3.
- Each new task must include all required template headlines in the correct order: Status, Task Description, Context, Intention, Steps, Requirements, Tech Stack Rationale, Acceptance Criteria, QA Audit & User Feedback, Dependencies, Subtasks, References, Backlinks.
- When a task is assigned, the corresponding role (Developer, DevOps, Architect, QA, etc.) is responsible for refining the task into actionable subtasks, which are documented in the 'Subtasks' section and assigned to the appropriate role.
- Subtasks may include collaboration items with other roles as needed.
- All dependencies must be documented as markdown links in the 'Dependencies' section and referenced in planning.md.
- The planning.md file is the central reference for task order, dependencies, and status. All task files must link back to it.
- Recovery: If process or planning files are lost or corrupted, restore from git history and reapply the template process as documented here and in po/process.md.

## Dependencies
- [scrum-master/process.md](../../scrum-master/process.md)
- [sprints/iteration-3/planning.md](./planning.md)

## Subtasks

**References:**
- [scrum-master/process.md](../../scrum-master/process.md)
- [sprints/iteration-3/planning.md](./planning.md)

[Back to Planning](./planning.md)
