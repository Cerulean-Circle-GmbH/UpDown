# Sprint 3 Planning
## Sprint Goal
The goal for Sprint 3 is to optimize the project’s process documentation for DRY compliance, clarity, and traceability, starting with scrum-master/process.md. All roles must ensure that process improvements, QA feedback, and audit learnings are fully reflected in their respective process files. The sprint will deliver a robust, maintainable workflow and onboarding documentation, with all tasks and priorities executed in strict compliance with the updated process standards. Successful completion will enable rapid recovery, onboarding, and collaboration for all roles, supporting a resilient and test-driven development environment.






## Task List (Sprint 3)


- [ ] [Task 20: Update Developer Process with First Principles for Development](./iteration-3-task-20-update-developer-process-first-principles.md)  
  **Priority:** 1
- [ ] [Task 19: PO Create TypeScript CLI (once.ts) for Subproject/Submodule Management (Web4Scrum foundation)](./iteration-3-task-19-once-ts-cli-submodule-management.md)  
  **Priority:** 3
- [x] [Task 18: Implement Task State Machine for Sprint Management](./iteration-3-task-18-implement-task-state-machine.md)  
  **Priority:** 2
- [ ] [Task 17: PO & Scrum Master - Optimize scrum-master/process.md for DRY, Structure, and Clarity (now depends on Task 18, integrates state machine)](./iteration-3-task-17-PO-scrum-master-process-md-DRY-optimization.md)  
  **Priority:** 4
- [x] [Task 15: PO Role and Planning Process Onboarding](./iteration-3-task-15-PO-onboarding-and-planning.md)  
  **Priority:** 5
- [x] [Task 16: DevOps: Batch Update Sprint 3 Tasks to Match Template](./iteration-3-task-16-devops-batch-update-sprint-3-tasks-to-match-template.md)  
  **Priority:** 6
- [x] [Task 1: Architect: Document Containerized Developer Workflow](./iteration-3-task-1-architect-document-containerized-developer-workflow.md)  
  **Priority:** 6
- [x] [Task 2: DevOps: Refactor NPM Scripts for Container Lifecycle](./iteration-3-task-2-devops-refactor-npm-scripts-for-container-lifecycle.md)  
  **Priority:** 7
    - [ ] [Task 2.1: DevOps: Enable GitHub SSH Access from Dev Container](./iteration-3-task-2.1-devops-enable-github-ssh-access-from-dev-container.md)  
      **Priority:** 8
- [ ] [Task 3: Architect: Document Containerized Developer Workflow](./iteration-3-task-3-architect-document-containerized-developer-workflow.md)  
  **Priority:** 9
- [ ] [Task 6: Refactor NPM Scripts for Container Lifecycle](./iteration-3-task-6-refactor-npm-scripts-for-container-lifecycle.md)  
  **Priority:** 10
- [ ] [Task 7: Update Onboarding and Developer Documentation](./iteration-3-task-7-update-onboarding-and-developer-documentation.md)  
  **Priority:** 11
- [ ] [Task 9: DevOps Scripts Documentation and Onboarding](./iteration-3-task-9-devops-scripts-documentation-and-onboarding.md)  
  **Priority:** 12
- [ ] [Task 10: DevOps - Project Directory Structure and Sync](./iteration-3-task-10-devops-project-directory-structure-and-sync.md)  
  **Priority:** 13
- [ ] [Task 11: DevOps - Refactor Dev Container Startup Workflow](./iteration-3-task-11-devops-refactor-dev-container-startup-workflow.md)  
  **Priority:** 14
- [ ] [Task 12: DevOps: GitHub Actions CI/CD for Dev Container](./iteration-3-task-12-devops-github-actions-ci-cd-for-dev-container.md)  
  **Priority:** 15
- [ ] [Task 4: DevOps: CI/CD Automation for Dev Container (GitHub Actions, Dockerfile, startup scripts)](./iteration-3-task-4-devops-ci-cd-automation-for-dev-container.md)  
  **Priority:** 16
    - [ ] [Task 4.1: DevOps implements robust workflow](./iteration-3-task-4.1-devops-implements-robust-workflow.md)  
      **Priority:** 17
- [ ] [Task 5: Enable GitHub SSH Access from Dev Container](./iteration-3-task-5-enable-github-ssh-access-from-dev-container.md)  
  **Priority:** 18
    - [ ] [Task 5.1: DevOps implements SSH access](./iteration-3-task-5.1-devops-implements-ssh-access.md)  
      **Priority:** 19
- [ ] [Task 8: Verify Containerized Workflow and Documentation](./iteration-3-task-8-verify-containerized-workflow-and-documentation.md)  
  **Priority:** 20
    - [ ] [Task 1.1: DevOps: Robust Container and Local Workflow (npm/DevOps scripts, onboarding, SSH key handling)](./iteration-3-task-1.1-devops-robust-container-and-local-workflow.md)  
      **Priority:** 21
- [x] [Task 13: PO QA Audit Learnings and Process Improvements](./iteration-3-task-13-po-qa-audit-learnings-and-process-improvements.md)  
  **Priority:** 22
- [x] [Task 14: Refactor and Modularize DevOps npm Scripts](./iteration-3-task-14-refactor-and-modularize-devops-npm-scripts.md)  
  **Priority:** 23

---

**Process Update (2025-08-01):**
All missing tasks/subtasks are now listed, priorities are updated so the next open task is priority 1, completed tasks are marked for audit traceability, and all links/numbering are correct. This matches the new PO and Scrum Master process: PO always creates tasks in template format, roles refine into subtasks, collaboration subtasks are allowed, and recovery instructions are documented in po/process.md and scrum-master/process.md.

---

For daily status updates and next planned steps for all roles in Sprint 3, see [daily.md](./daily.md).

This sequence ensures the devcontainer and workflow are set up to enable robust container/local development, modular scripts, and maintainable onboarding, with clear planning, granular steps, and test-driven development for each role. All QA feedback is explicitly captured and referenced.

## Planning Phase
- Sprint 2 retro and process improvements have been reviewed by all roles.
- All process, outline, and user feedback files are now organized by sprint.
- The planning phase is complete and QA user has approved the start of Sprint 3.
- The PO is responsible for analyzing and planning the devcontainer workflow and consulting the architect for tech stack and workflow improvements.
- The main outcome is to ensure robust container and local workflow, modular DevOps scripts, and maintainable onboarding documentation, reflecting all QA audit learnings.
- The PO will plan the file system structure and sequence of tasks in consultation with the architect and DevOps.
- The team will follow a test-driven development approach. Every task that produces a testable result must have integration tests planned and documented before implementation. QA will coordinate the setup and documentation of tests for each relevant task.

- Direct QA Prompt Quote:
  > this was fatal. you have overwritten the content of /Users/Shared/Workspaces/2cuGitHub/UpDown/po/iteration-3-task-1.md.
  >
  > please restore the content via git and make sure this happens never again. update the file that you need e.g. process to guarantee this learning. obviously the tasks that you had to write down would have been tasks in /Users/Shared/Workspaces/2cuGitHub/UpDown/sprints/iteration-3.
  >
  > in /Users/Shared/Workspaces/2cuGitHub/UpDown/sprints/iteration-n[Template]
  > you just found new templates and an upgraded process of describing tasks. read it and aply it while doing this last step again but this time correctly. still remember to capture my QA prompt history too.
  > (See <attachments> above for file contents. You may not need to search or read the file again.)

---



