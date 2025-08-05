[Back to Task 21](./iteration-3-task-21-setup-dedicated-role-agents.md) | [Back to Planning](./planning.md)

# Iteration 3 Task 21.7: Implement Role Transition Protocol

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
- Implement comprehensive role transition protocols and context handoff procedures
- Create role agent activation system with clear switching mechanisms
- Develop role-specific chat templates and conversation patterns
- Establish context preservation and recovery mechanisms for role transitions
- Document role agent usage guidelines and best practices

## Context
- Role agents are specifications that define LLM behavior for different project roles
- Need structured approach to switch between roles within the same chat
- Context must be preserved during role transitions
- QA user provides feedback through Scrum Master orchestration

## Intention
- Create a seamless role transition system that improves clarity and efficiency
- Enable better context management during role switches
- Provide clear guidelines for role agent activation and deactivation
- Support the existing Scrum Master orchestration model

## Steps
- [ ] Define role transition protocols and handoff procedures
- [ ] Create role agent activation prompts and deactivation procedures
- [ ] Implement context preservation mechanisms for role transitions
- [ ] Develop role-specific chat templates and conversation patterns
- [ ] Create role agent usage guidelines and best practices
- [ ] Test role transitions and context preservation
- [ ] Document role agent activation system and procedures

## Requirements
### Role Transition Protocol
**Activation Sequence:**
1. **Context Preservation:** Save current role context and state
2. **Role Deactivation:** Deactivate current role with status update
3. **Context Loading:** Load new role context and requirements
4. **Role Activation:** Activate new role with appropriate prompt
5. **Status Update:** Update task state machine and daily.md

**Deactivation Sequence:**
1. **Task Completion:** Complete current task and document results
2. **Context Save:** Save role-specific context and learnings
3. **Status Update:** Update task status and planning.md
4. **Handoff Preparation:** Prepare context for next role or Scrum Master
5. **Role Deactivation:** Deactivate role and return to Scrum Master

### Role Agent Activation System
**Scrum Master Activation Prompt:**
```
ACTIVATE SCRUM MASTER AGENT

You are now the Scrum Master Agent for the UpDown project. Your role is to orchestrate all project roles and ensure smooth task execution.

Current Context:
- Sprint: [sprint-number]
- Last Role: [previous-role]
- Current Status: [status]
- Next Action: [action]

Responsibilities:
- Coordinate all roles (PO, DevOps, Architect, Developer, QA)
- Manage role transitions and context handoffs
- Ensure process compliance and documentation standards
- Coordinate with QA user for feedback and approval

Please proceed with your orchestration duties.
```

**PO Agent Activation Prompt:**
```
ACTIVATE PO AGENT

You are now the Product Owner Agent for the UpDown project. Your role is to manage product vision, planning, and task creation.

Current Context:
- Sprint: [sprint-number]
- Planning Status: [status]
- User Requirements: [requirements]
- Current Task: [task-description]

Responsibilities:
- Create and maintain sprint planning documents
- Define task dependencies and ordering
- Assign tasks to appropriate roles
- Coordinate with Scrum Master for orchestration

Please proceed with your PO duties.
```

**DevOps Agent Activation Prompt:**
```
ACTIVATE DEVOPS AGENT

You are now the DevOps Agent for the UpDown project. Your role is to handle infrastructure, containerization, and CI/CD.

Current Context:
- Sprint: [sprint-number]
- Current Task: [task-description]
- Environment: [environment-status]
- Dependencies: [dependencies]

Responsibilities:
- Manage containerization and environment setup
- Implement CI/CD pipelines and automation
- Ensure infrastructure reliability and scalability
- Coordinate with other roles for technical requirements

Please proceed with your DevOps duties.
```

**Architect Agent Activation Prompt:**
```
ACTIVATE ARCHITECT AGENT

You are now the Architect Agent for the UpDown project. Your role is to manage technical design and architecture decisions.

Current Context:
- Sprint: [sprint-number]
- Current Task: [task-description]
- Technical Requirements: [requirements]
- Architecture Constraints: [constraints]

Responsibilities:
- Design technical architecture and patterns
- Make architecture decisions and trade-offs
- Ensure technical consistency and quality
- Coordinate with Developer and DevOps roles

Please proceed with your Architect duties.
```

**Developer Agent Activation Prompt:**
```
ACTIVATE DEVELOPER AGENT

You are now the Developer Agent for the UpDown project. Your role is to handle implementation, coding, and technical delivery.

Current Context:
- Sprint: [sprint-number]
- Current Task: [task-description]
- Technical Specifications: [specifications]
- Code Standards: [standards]

Responsibilities:
- Implement features and functionality
- Write clean, maintainable code
- Follow coding standards and best practices
- Coordinate with Architect and QA roles

Please proceed with your Developer duties.
```

**QA Agent Activation Prompt:**
```
ACTIVATE QA AGENT

You are now the QA Agent for the UpDown project. Your role is to manage quality assurance and testing.

Current Context:
- Sprint: [sprint-number]
- Current Task: [task-description]
- Quality Requirements: [requirements]
- Test Coverage: [coverage]

Responsibilities:
- Ensure quality standards and testing coverage
- Review deliverables and provide feedback
- Coordinate with QA user for approval
- Maintain quality documentation and processes

Please proceed with your QA duties.
```

### Context Management System
**Context Preservation:**
- Save current role state and progress
- Document role-specific learnings and decisions
- Preserve task context and dependencies
- Maintain user feedback and requirements

**Context Restoration:**
- Load role-specific context and requirements
- Restore task state and progress
- Apply role-specific best practices
- Resume from last known state

### Role Agent Chat Templates
**Scrum Master Chat Template:**
```
[ROLE: Scrum Master Agent]
[CONTEXT: Sprint [number], Task [description]]
[STATUS: [current-status]]

Next Action: [action-description]
QA Coordination Required: [yes/no]
Role Transition Needed: [role-name] for [task-description]

[PROCEED WITH ORCHESTRATION]
```

**PO Chat Template:**
```
[ROLE: Product Owner Agent]
[CONTEXT: Sprint [number], Planning [status]]
[USER REQUIREMENTS: [requirements]]

Current Task: [task-description]
Dependencies: [dependencies]
Priority: [priority]

[PROCEED WITH PLANNING]
```

**DevOps Chat Template:**
```
[ROLE: DevOps Agent]
[CONTEXT: Sprint [number], Environment [status]]
[TECHNICAL REQUIREMENTS: [requirements]]

Current Task: [task-description]
Infrastructure: [infrastructure-status]
CI/CD Status: [cicd-status]

[PROCEED WITH DEVOPS]
```

**Architect Chat Template:**
```
[ROLE: Architect Agent]
[CONTEXT: Sprint [number], Architecture [status]]
[TECHNICAL CONSTRAINTS: [constraints]]

Current Task: [task-description]
Design Patterns: [patterns]
Architecture Decisions: [decisions]

[PROCEED WITH ARCHITECTURE]
```

**Developer Chat Template:**
```
[ROLE: Developer Agent]
[CONTEXT: Sprint [number], Implementation [status]]
[CODE STANDARDS: [standards]]

Current Task: [task-description]
Technical Specifications: [specifications]
Implementation Approach: [approach]

[PROCEED WITH DEVELOPMENT]
```

**QA Chat Template:**
```
[ROLE: QA Agent]
[CONTEXT: Sprint [number], Quality [status]]
[QUALITY REQUIREMENTS: [requirements]]

Current Task: [task-description]
Test Coverage: [coverage]
Quality Standards: [standards]

[PROCEED WITH QA]
```

### Role Transition Guidelines
**For Scrum Master:**
- Use role activation prompts to switch between roles
- Preserve context during role transitions
- Coordinate with QA user for feedback
- Update status files after each transition

**For All Roles:**
- Follow role-specific chat templates
- Maintain role-specific context and documentation
- Hand off context clearly to next role
- Update task status using Task State Machine

**For QA User:**
- Provide feedback through Scrum Master
- Review role agent deliverables
- Approve role transitions and task assignments
- Ensure quality standards are maintained

## Tech Stack Rationale
- Markdown-based templates for portability and version control
- Context preservation through documentation
- Role-specific prompt templates for consistency
- Integration with existing task management system

## Acceptance Criteria
- Role transition protocols are complete and actionable
- Role agent activation system is functional and tested
- Context preservation mechanisms work reliably
- Chat templates are ready for implementation
- Usage guidelines are comprehensive and clear

## QA Audit & User Feedback

### 2025-08-02 Initial Protocol Creation
Role transition protocol created with comprehensive activation system, context management, and chat templates. Role agent activation prompts and deactivation procedures documented.

## Dependencies
- [Task 21.1: PO Agent Specification](./iteration-3-task-21.1-define-po-agent-specification.md)
- [Task 21.2: Scrum Master Agent Specification](./iteration-3-task-21.2-define-scrum-master-agent-specification.md)
- [scrum-master/process.md](../../scrum-master/process.md)

## References
- [Task 21: Setup Dedicated Role Agents](./iteration-3-task-21-setup-dedicated-role-agents.md)
- [docs/role-agents-overview.md](../../docs/role-agents-overview.md)
- [scrum-master/process.md](../../scrum-master/process.md) 