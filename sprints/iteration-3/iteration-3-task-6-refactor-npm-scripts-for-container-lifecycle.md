[Back to Planning](./planning.md)

# to be refactored with the task template

    Your QA prompt has now been directly quoted 1:1 in the PO QA audit task file for full traceability.
    This guarantees your feedback is explicitly captured in the sprint documentation.
    If you need further adjustments or want to proceed with task assignments, let me know.

    well done. now lets look at some of the devops decontainer artifacts. major changes have been made, some age good some are bad. in this qa audit we will fix them immediatly and update the process to prevent such issues.

    first we look at the updated packaje.json. are you as a qa engenieer see a quality issue, that we aready tried to tackle with the documentation. communicat with the scrum master what you identified and help the PO to capture this in a task for itteration 3.

    As QA engineer, I have reviewed the updated package.json and identified several quality issues related to DevOps and container workflow:

    Issues:

    The start script is overly complex, chaining multiple shell commands and relying on fragile parsing of docker ps output.
    It mixes container management, SSH key copying, and test execution in a single npm script, which is hard to maintain and debug.
    The script does not clearly separate concerns (startup, health check, SSH key management, test execution).
    This complexity was already flagged in documentation and process discussions as a risk for maintainability and onboarding.
    Recommendation to Scrum Master:

    The process should require that npm scripts are modular, maintainable, and documented.
    Each major operation (container lifecycle, SSH key management, test execution) should have its own script and documentation.
    The onboarding docs and process should enforce this separation and clarity.
    PO Task for Iteration 3:

    Refactor the start script in package.json to split responsibilities into dedicated scripts.
    Update documentation to reflect the new modular approach.
    Acceptance: Each operation is handled by a clear, maintainable script, and onboarding docs are updated.
    Would you like me to draft this PO task in the sprint tasks directory and update the process documentation accordingly?


    A new PO task has been created:
    iteration-3-task-Refactor-Modularize-DevOps-npm-scripts.md

    This task requires refactoring the start script in package.json to modularize container lifecycle, SSH key management, and test execution, with clear documentation and onboarding updates.

# Iteration 3 Task 6: Refactor and Modularize DevOps npm Scripts

## Background
QA audit identified that the current npm start script is overly complex, chaining multiple shell commands and mixing container management, SSH key copying, and test execution. This approach is hard to maintain, debug, and onboard new contributors.

## Requirements
- Refactor the start script in `package.json` to split responsibilities into dedicated scripts:
  - Container lifecycle management
  - SSH key management
  - Test execution
- Ensure each script is modular, maintainable, and documented.
- Update onboarding documentation to reflect the new modular approach and reference each script.

## Acceptance Criteria
- Each major operation (container lifecycle, SSH key management, test execution) is handled by a clear, maintainable script.
- Documentation and onboarding guides are updated to reference the new scripts and process.
- QA feedback and process improvements are traceable in the audit and task documentation.

## Dependencies
- [Iteration 3 Task 2: Refactor NPM Scripts for Container Lifecycle](./iteration-3-task-2.md)
- [Iteration 3 Task 4: Robust Container and Local Workflow](./iteration-3-task-4.md)
- [Iteration 3 Task 5: Enable GitHub SSH Access from Dev Container](./iteration-3-task-5.md)

---

**References:**
- QA Audit findings (2025-07-30)
- [devops/devops-scripts-journey.md](../../devops/devops-scripts-journey.md)
- [devops/copy-ssh-key-to-container.sh](../../devops/copy-ssh-key-to-container.sh)
    It directly addresses the QA audit findings and follows the upgraded process template.

    Let me know if you want to assign this to a specific role or need further breakdowns.
