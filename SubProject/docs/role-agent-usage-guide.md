# Role Agent Usage Guide

## Quick Start

### How to Use Role Agents

The role agent system allows you to switch between different project roles within the same chat. Here's how to use it:

#### 1. Activate a Role Agent
To switch to a specific role, use one of these activation prompts:

**For Scrum Master:**
```
ACTIVATE SCRUM MASTER AGENT
```

**For Product Owner:**
```
ACTIVATE PO AGENT
```

**For DevOps:**
```
ACTIVATE DEVOPS AGENT
```

**For Architect:**
```
ACTIVATE ARCHITECT AGENT
```

**For Developer:**
```
ACTIVATE DEVELOPER AGENT
```

**For QA:**
```
ACTIVATE QA AGENT
```

#### 2. Role Agent Chat Templates
Each role has a specific chat template format. When activated, the role agent will use this format:

**Scrum Master Template:**
```
[ROLE: Scrum Master Agent]
[CONTEXT: Sprint 3, Task 21]
[STATUS: In Progress]

Next Action: Continue with role agent specifications
QA Coordination Required: Yes
Role Transition Needed: PO Agent for task planning

[PROCEED WITH ORCHESTRATION]
```

#### 3. Context Preservation
When switching roles, the system automatically:
- Saves current role context and progress
- Loads new role context and requirements
- Preserves task state and dependencies
- Maintains user feedback and requirements

## Practical Examples

### Example 1: Task Planning Workflow
```
User: "I need to plan the next sprint"

[Scrum Master activates PO Agent]
ACTIVATE PO AGENT

[PO Agent responds with planning template]
[ROLE: Product Owner Agent]
[CONTEXT: Sprint 3, Planning Phase]
[USER REQUIREMENTS: Plan next sprint]

Current Task: Sprint planning
Dependencies: Previous sprint retro
Priority: High

[PROCEED WITH PLANNING]
```

### Example 2: Technical Implementation Workflow
```
User: "We need to implement the containerized workflow"

[Scrum Master activates DevOps Agent]
ACTIVATE DEVOPS AGENT

[DevOps Agent responds with technical template]
[ROLE: DevOps Agent]
[CONTEXT: Sprint 3, Container Implementation]
[TECHNICAL REQUIREMENTS: Docker, Bun, TypeScript]

Current Task: Containerized workflow implementation
Infrastructure: Docker dev container
CI/CD Status: Planning phase

[PROCEED WITH DEVOPS]
```

### Example 3: Architecture Decision Workflow
```
User: "What's the best architecture for the P2P communication?"

[Scrum Master activates Architect Agent]
ACTIVATE ARCHITECT AGENT

[Architect Agent responds with design template]
[ROLE: Architect Agent]
[CONTEXT: Sprint 3, P2P Architecture]
[TECHNICAL CONSTRAINTS: Web-first, Bun/TypeScript]

Current Task: P2P communication architecture
Design Patterns: WebRTC, WebSocket
Architecture Decisions: Peer-to-peer mesh network

[PROCEED WITH ARCHITECTURE]
```

## Role-Specific Responsibilities

### Scrum Master Agent
- **Orchestrates** all other role agents
- **Manages** role transitions and context handoffs
- **Coordinates** with QA user for feedback
- **Updates** status files and task state machine

### PO Agent
- **Creates** tasks in template format
- **Manages** sprint planning and dependencies
- **Coordinates** with Scrum Master for orchestration
- **Collects** feature branches for release

### DevOps Agent
- **Manages** containerization and environment setup
- **Implements** CI/CD pipelines and automation
- **Ensures** infrastructure reliability
- **Coordinates** with other roles for technical requirements

### Architect Agent
- **Designs** technical architecture and patterns
- **Makes** architecture decisions and trade-offs
- **Ensures** technical consistency and quality
- **Coordinates** with Developer and DevOps roles

### Developer Agent
- **Implements** features and functionality
- **Writes** clean, maintainable code
- **Follows** coding standards and best practices
- **Coordinates** with Architect and QA roles

### QA Agent
- **Ensures** quality standards and testing coverage
- **Reviews** deliverables and provides feedback
- **Coordinates** with QA user for approval
- **Maintains** quality documentation and processes

## Best Practices

### For QA User (You)
1. **Provide feedback** through Scrum Master
2. **Review** role agent deliverables
3. **Approve** role transitions and task assignments
4. **Ensure** quality standards are maintained

### For Role Transitions
1. **Complete** current task before switching
2. **Save** context and progress
3. **Use** activation prompts for clean transitions
4. **Update** status files after transitions

### For Context Management
1. **Preserve** role-specific context during transitions
2. **Document** learnings and decisions
3. **Maintain** task state and dependencies
4. **Restore** context when resuming roles

## Troubleshooting

### Common Issues

**Role Confusion:**
- Use clear activation prompts
- Check current role context
- Return to Scrum Master for re-orchestration

**Context Loss:**
- Check daily.md for current status
- Restore from task files and documentation
- Use recovery procedures from restart.md

**Process Violation:**
- Review role-specific process files
- Update process documentation
- Coordinate with Scrum Master for guidance

### Recovery Procedures

**If Role Agent Gets Confused:**
```
ACTIVATE SCRUM MASTER AGENT
[Scrum Master will re-orchestrate and clarify roles]
```

**If Context is Lost:**
```
[Scrum Master will execute recovery procedure]
1. Read restart.md for recovery steps
2. Check current sprint planning.md
3. Review daily.md for status
4. Resume from last known state
```

**If Process is Violated:**
```
[Scrum Master will coordinate process correction]
1. Review role-specific process files
2. Update process documentation
3. Retrain role agent on correct procedures
```

## Integration with Current Process

### Task State Machine
- Role agents use Task State Machine for status updates
- All status changes follow defined state transitions
- Process compliance is maintained through state machine

### Process Files
- Role agents follow role-specific process files
- All learnings are documented in process files
- Process improvements are captured and shared

### QA Audit
- All role agent actions are documented in QA audit sections
- User feedback is preserved and traceable
- Process compliance is verified through QA audit

## References
- [Role Agents Overview](./role-agents-overview.md)
- [Task 21: Setup Dedicated Role Agents](../sprints/iteration-3/iteration-3-task-21-setup-dedicated-role-agents.md)
- [Role Transition Protocol](../sprints/iteration-3/iteration-3-task-21.7-implement-role-transition-protocol.md)
- [scrum-master/process.md](../scrum-master/process.md)
- [restart.md](../restart.md) 