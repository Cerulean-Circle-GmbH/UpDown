# Task Refinement Guidelines Documentation

## Overview
This document uniquely defines the task refinement process for all roles, following CMM Level 3+ principles with no ambiguities.

## Task Refinement Process

### General Guidelines
During the 'refinement' phase of any assigned task, the responsible role must:
- Review the task's requirements, context, and dependencies
- Ensure all steps are documented as markdown checkboxes in the 'Steps' section of the task file
- Collaborate with other roles to clarify requirements and dependencies
- Document any risks, decisions, or blockers in the task file
- Confirm that the refinement phase is complete in the Status section before QA Review can begin

### Role-Specific Requirements

#### Product Owner (PO)
- Review task's intention, requirements, and dependencies
- Ensure all steps and dependencies are documented as markdown checkboxes
- Collaborate with Developer, QA, Architect, and other roles to clarify requirements
- Define collaboration subtasks as needed
- Update planning.md and task files with any new or changed dependencies

#### QA
- Review task's requirements, acceptance criteria, and context
- Ensure all steps and test cases are documented as markdown checkboxes
- Collaborate with Developer, PO, and Architect to clarify requirements and test coverage
- Identify any gaps in requirements or acceptance criteria
- Document gaps in the QA audit section of the task file

#### Architect
- Review task's technical requirements, context, and dependencies
- Ensure all technical steps and architectural decisions are documented as markdown checkboxes
- Collaborate with PO, Developer, and QA to clarify requirements and technical feasibility
- Document any architectural risks or decisions in the task file

#### DevOps
- Review task's technical requirements, dependencies, and environment setup
- Ensure all DevOps steps and scripts are documented as markdown checkboxes
- Collaborate with PO, Developer, and Architect to clarify requirements and environment needs
- Document any infrastructure risks or decisions in the task file

#### Developer
- Review task's intention, requirements, and context
- Break down the task into actionable steps and document them as markdown checkboxes
- Identify any technical dependencies, blockers, or required research
- Collaborate with PO, Architect, and QA as needed to clarify requirements and acceptance criteria
- Ensure all steps are clear, actionable, and sequenced logically

## Cross-References
Reference: See 'QA Guidelines' and 'Subtask Context & Status Management' in scrum-master/process.md for cross-role best practices.

## References
- [Scrum Master Process](../scrum-master/process.md)
- [Process Standards Documentation](./process-standards.md) 