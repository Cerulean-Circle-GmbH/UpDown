[Back to Planning](./planning.md)

# Task 19: [PO] Create TypeScript CLI (once.ts) for Subproject/Submodule Management

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
- PO: Define and implement a TypeScript CLI tool named `once.ts` to manage subprojects as git submodules. The CLI will use the same tech stack and OOP principles as this project. It will create new submodule projects from the current project as a template, including structure and process files, but only with iteration one planned. The CLI must support shell completion and be callable via a bash wrapper script named `oosh`, which simply invokes the TypeScript CLI and passes all shell parameters to the main OOSH class. All processing and logic must be implemented in TypeScript, strictly OOP.

## Context
- The CLI will help automate the creation and management of subprojects/submodules, ensuring consistency in structure, process, and onboarding. The submodule will be initialized from this project as a template, with only the first iteration planned. The bash wrapper (`oosh`) is for convenience and does not contain logic.

## Intention
- The PO ensures the role understands the need for a robust, OOP TypeScript CLI for submodule management, supporting rapid onboarding, consistency, and automation.

## Steps
- [x] Review project goals and requirements for submodule management.
- [x] Confirm tech stack and OOP requirements.
- [ ] Define CLI requirements, commands, and expected behavior.
- [ ] Implement the `once.ts` CLI with a main OOSH class handling all logic.
- [ ] Create the `oosh` bash wrapper script to call the TypeScript CLI.
- [ ] Implement submodule creation from the project template (with only iteration one planned).
- [ ] Add shell completion support to the CLI.
- [ ] Document the workflow and update onboarding documentation.
- [ ] Validate the CLI by creating a test submodule and recording results.
- [ ] Update the QA audit and planning files with findings and actions taken.

## Requirements
- The CLI must:
  - Be implemented in TypeScript, strictly OOP (main class: OOSH).
  - Manage subprojects as git submodules, using this project as a template.
  - Create submodules with the same structure and process files, but only with iteration one planned.
  - Support shell completion for commands.
  - Be callable via a bash script (`oosh`) that passes all parameters to the TypeScript CLI.
  - Output clear results for onboarding and QA verification.
- All steps and results must be documented for traceability.

## Acceptance Criteria
- The CLI (`once.ts`) manages submodules as described, using OOP TypeScript.
- The bash wrapper (`oosh`) calls the CLI and passes all parameters.
- Submodules are created from the project template with only iteration one planned.
- Shell completion is supported.
- Documentation is updated to reflect the workflow and test results.
- QA audit and planning files are updated with all actions and findings.

## QA Audit & User Feedback
- All feedback and audit entries must be timestamped (UTC) and documented in this section.
- Consolidate all user feedback and QA audit traceability into a single section for clarity and process compliance.
- Example entry: '- 2025-08-02 UTC: [Feedback or audit note]'

---
## Subtasks
- [Iteration-n-Task-19.1: Implement once.ts CLI and OOSH class](./iteration-n-task-19.1.md)
- [Iteration-n-Task-19.2: Document CLI Workflow and Results](./iteration-n-task-19.2.md)

---
