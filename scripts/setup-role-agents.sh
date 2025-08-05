#!/bin/bash

# UpDown Project - Role Agent System Setup Script
# This script initializes the role agent system and project structure

set -e

echo "🚀 Setting up UpDown Project Role Agent System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Creating role agent system structure..."

# Create role directories if they don't exist
ROLE_DIRS=("scrum-master" "po" "devops" "architect" "developer" "qa")
for dir in "${ROLE_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_success "Created $dir directory"
    else
        print_warning "$dir directory already exists"
    fi
done

# Create docs directory
if [ ! -d "docs" ]; then
    mkdir -p "docs"
    print_success "Created docs directory"
fi

# Create sprints directory structure
if [ ! -d "sprints/iteration-3" ]; then
    mkdir -p "sprints/iteration-3"
    print_success "Created sprints/iteration-3 directory"
fi

# Create user.specs directory
if [ ! -d "user.specs" ]; then
    mkdir -p "user.specs"
    print_success "Created user.specs directory"
fi

print_status "Setting up role agent configuration..."

# Create .cursorrules if it doesn't exist
if [ ! -f ".cursorrules" ]; then
    print_status "Creating .cursorrules file..."
    cat > .cursorrules << 'EOF'
# UpDown Project - Role Agent System Configuration

## Project Overview
This is the UpDown project - a multiplayer card game with P2P architecture, web-first approach, using Bun/TypeScript stack. The project uses a dedicated role agent system where the LLM switches between different project roles based on task requirements.

## Role Agent System

### Core Roles
1. **Scrum Master Agent** - Orchestrates all roles, manages process, ensures team coordination
2. **PO Agent** - Manages product vision, planning, task creation, and backlog management
3. **DevOps Agent** - Handles infrastructure, containerization, CI/CD, and environment setup
4. **Architect Agent** - Manages technical design, architecture decisions, and patterns
5. **Developer Agent** - Handles implementation, coding, testing, and technical delivery
6. **QA Agent** - Manages quality assurance, testing, feedback collection, and validation

### Role Agent Activation Prompts

To switch between roles, use these activation prompts:

**Scrum Master Agent:**
```
ACTIVATE SCRUM MASTER AGENT
```

**PO Agent:**
```
ACTIVATE PO AGENT
```

**DevOps Agent:**
```
ACTIVATE DEVOPS AGENT
```

**Architect Agent:**
```
ACTIVATE ARCHITECT AGENT
```

**Developer Agent:**
```
ACTIVATE DEVELOPER AGENT
```

**QA Agent:**
```
ACTIVATE QA AGENT
```

## Project Structure

### Key Directories
- `sprints/iteration-3/` - Current sprint planning and tasks
- `scrum-master/` - Scrum Master process and orchestration
- `po/` - Product Owner process and planning
- `devops/` - DevOps process and infrastructure
- `architect/` - Architect process and design
- `developer/` - Developer process and implementation
- `qa/` - QA process and quality assurance
- `docs/` - Project documentation and guides
- `src/` - Source code (client, server, shared)
- `user.specs/` - User requirements and feedback

### Key Files
- `restart.md` - Project restart and recovery procedures
- `sprints/iteration-3/planning.md` - Current sprint planning
- `sprints/iteration-3/daily.md` - Daily status and next steps
- `docs/role-agents-overview.md` - Role agent system overview
- `docs/role-agent-usage-guide.md` - Practical usage guide

## Process Compliance

### Task State Machine
All status updates must use the Task State Machine:
- Planned
- In Progress (with subtasks)
- QA Review
- Done

### DRY Compliance
- No duplication of files, text, or documentation
- Reference canonical sources and use consistent links
- Cross-reference rather than duplicate content

### QA Audit
- Document all QA feedback with timestamps
- Preserve previous QA feedback entries
- Cross-reference in planning.md and process documentation

## Recovery Procedures

### Project Restart
1. Read `restart.md` for recovery procedures
2. Read `scrum-master/process.md` for orchestration guidance
3. Read current sprint `planning.md` for task status
4. Read current sprint `daily.md` for role status
5. Identify last successful role and task
6. Resume from next planned task
7. Update all status files with current state

## Technical Stack

### Core Technologies
- **Runtime:** Bun (JavaScript/TypeScript runtime)
- **Language:** TypeScript
- **Architecture:** P2P (Peer-to-Peer)
- **Platform:** Web-first
- **Containerization:** Docker
- **Version Control:** Git with GitHub

## References
- [Role Agents Overview](docs/role-agents-overview.md)
- [Role Agent Usage Guide](docs/role-agent-usage-guide.md)
- [Sprint 3 Planning](sprints/iteration-3/planning.md)
- [Scrum Master Process](scrum-master/process.md)
- [Project Restart Guide](restart.md)
EOF
    print_success "Created .cursorrules file"
else
    print_warning ".cursorrules file already exists"
fi

print_status "Creating role agent documentation..."

# Create role agents overview
if [ ! -f "docs/role-agents-overview.md" ]; then
    print_status "Creating role agents overview..."
    cat > docs/role-agents-overview.md << 'EOF'
# Dedicated Role Agents Overview

## Introduction
The UpDown project uses a **dedicated role agents** approach to improve clarity, efficiency, and collaboration in the development process. Instead of a single LLM switching between roles, each role has a clearly defined agent specification with specific responsibilities, interaction patterns, and context management.

## Role Agent Concept

### What are Role Agents?
Role agents are **specialized LLM personas** that represent specific project roles (PO, Scrum Master, DevOps, Architect, Developer, QA). Each agent has:
- **Clear role definition** and responsibilities
- **Specific context requirements** and inputs
- **Defined outputs** and deliverables
- **Interaction patterns** with other roles
- **Context preservation** mechanisms
- **Error handling** and recovery procedures

### Benefits of Role Agents
1. **Improved Clarity:** Each role has clear boundaries and responsibilities
2. **Better Context Management:** Role-specific context is preserved during transitions
3. **Enhanced Collaboration:** Structured interaction patterns between roles
4. **Reduced Confusion:** Clear role transitions and handoff procedures
5. **Process Compliance:** Role-specific best practices and standards

## Role Agent Architecture

### Core Roles
1. **Scrum Master Agent:** Orchestrates all roles, manages process, ensures team coordination
2. **PO Agent:** Manages product vision, planning, task creation, and backlog management
3. **DevOps Agent:** Handles infrastructure, containerization, CI/CD, and environment setup
4. **Architect Agent:** Manages technical design, architecture decisions, and patterns
5. **Developer Agent:** Handles implementation, coding, testing, and technical delivery
6. **QA Agent:** Manages quality assurance, testing, feedback collection, and validation

### Role Interactions
```
QA User
    ↓
Scrum Master Agent (Orchestrator)
    ↓
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│   PO Agent  │ DevOps Agent│Architect    │Developer    │   QA Agent  │
│             │             │Agent        │Agent        │             │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

## Implementation Approach

### Role Agent Specifications
Each role agent has a comprehensive specification including:
- **Role Definition:** Purpose, scope, and core responsibilities
- **Context Requirements:** Required inputs and context preservation needs
- **Outputs & Deliverables:** Specific artifacts and outcomes
- **Interaction Patterns:** How the role interacts with other roles
- **Prompt Templates:** Standardized prompts for role activation
- **Error Handling:** Procedures for handling errors and recovery

### Role Transitions
Role transitions follow a structured protocol:
1. **Context Preservation:** Current state is saved and documented
2. **Role Activation:** New role agent is activated with appropriate context
3. **Task Execution:** Role-specific task is executed according to best practices
4. **Status Update:** Task state machine is updated with results
5. **Handoff:** Results are handed off to next role or Scrum Master

## Usage Guidelines

### For Scrum Master
- Use role assignment prompts to activate specific role agents
- Coordinate role transitions and context handoffs
- Ensure process compliance and documentation standards
- Manage QA coordination and user feedback

### For QA User
- Provide feedback to any role agent through Scrum Master
- Review role agent deliverables and specifications
- Approve role transitions and task assignments
- Ensure quality standards are maintained

## Integration with Current Process

### Existing Process Files
Role agents build upon existing process files:
- `scrum-master/process.md` - Scrum Master orchestration
- `po/process.md` - Product Owner responsibilities
- `devops/process.md` - DevOps practices and procedures
- `architect/process.md` - Architecture and design patterns
- `developer/process.md` - Development workflow and standards
- `qa/process.md` - Quality assurance procedures

### Task Management
Role agents integrate with the existing task management system:
- Task State Machine for status management
- Template-based task creation and documentation
- Dependency management and ordering
- QA audit and feedback integration

## References
- [Role Agent Usage Guide](./role-agent-usage-guide.md)
- [scrum-master/process.md](../scrum-master/process.md)
- [po/process.md](../po/process.md)
- [devops/process.md](../devops/process.md)
- [architect/process.md](../architect/process.md)
- [developer/process.md](../developer/process.md)
- [qa/process.md](../qa/process.md)
EOF
    print_success "Created role agents overview"
else
    print_warning "Role agents overview already exists"
fi

# Create role agent usage guide
if [ ! -f "docs/role-agent-usage-guide.md" ]; then
    print_status "Creating role agent usage guide..."
    cat > docs/role-agent-usage-guide.md << 'EOF'
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

## References
- [Role Agents Overview](./role-agents-overview.md)
- [scrum-master/process.md](../scrum-master/process.md)
- [restart.md](../restart.md)
EOF
    print_success "Created role agent usage guide"
else
    print_warning "Role agent usage guide already exists"
fi

print_status "Creating restart.md if it doesn't exist..."

# Create restart.md if it doesn't exist
if [ ! -f "restart.md" ]; then
    cat > restart.md << 'EOF'
# Project Restart Summary

**Date:** 2025-07-21

## Project Context
- Project: UpDown (multiplayer card game, P2P, web-first, Bun/TypeScript stack)
- All roles (PO, Scrum Master, DevOps, Backend, Frontend, QA, etc.) are played by the LLM, orchestrated by the Scrum Master.
- User acts as QA and provides feedback that must be incorporated before proceeding.
- All requirements, tasks, and user feedback are tracked in markdown files in the workspace.

## How to Recover and Find the Next Task
1. Read the README.md
2. Always start as Scrum Master. The Scrum Master orchestrates all roles and assigns tasks.
3. To recover the last state, read:
   - `scrum-master/process.md` as the authoritative process definition for recovery and overall project process. This file must be read first to understand the recovery and orchestration steps.
   - The current sprint's `planning.md` file (e.g., `sprints/iteration-3/planning.md`) for overall project status and last completed/planned tasks.
   - The current sprint's `daily.md` file (e.g., `sprints/iteration-3/daily.md`) for daily status and last successful role/task.
   - The relevant role/task files in `po/`, `devops/`, `qa/`, etc., to find the last successful role and task.
   - Read QA prompts and user feedback from the latest task file (e.g., the current sprint's active task markdown file) instead of `user specs/user.captured.prompts.md`.
   - When switching to a different role during a sprint, always read the corresponding role's process.md file (e.g., `devops/process.md`, `qa/process.md`, etc.) to refresh on role-specific practices and requirements before executing any tasks.
4. The Scrum Master should update the current sprint's planning.md and daily.md files with the last successful role and task, so the next task is always clear after a failure or restart.
5. The Scrum Master should prompt the user for feedback before executing new tasks, especially after planning with the PO.
6. The PO must update the task files (e.g., add new tasks to `po/iteration-2-task-7.md` if needed) to reflect new plans and requirements.
7. The DevOps and other roles should only execute tasks after user feedback is incorporated and the PO's plan is up to date.

## General Next Steps After Recovery
- Identify the last successful role and task from the current sprint's `daily.md` and the role task files.
- Resume from the next planned task, updating the planning.md, daily.md, and task files as needed.
- Always prompt the user for feedback before executing new or changed tasks.
- Document all new QA feedback and process changes in the current active task file under the section `## QA Audit & User Feedback`. Do not read or update `user specs/user.captured.prompts.md` for this purpose.

## Iteration and Sprint Management
- To keep context manageable, split all planning, daily, user feedback, and process files by iteration/sprint into dedicated folders (e.g., sprints/iteration-2/, sprints/iteration-3/).
- For each new iteration, only read and update the files for the current sprint unless a cross-iteration reference is needed.

---

This file is for Scrum Master context recovery. If context is lost, read this file and the referenced files to resume work correctly. Always update the outline and task files to reflect the current state and next steps.
Additionally, the Scrum Master must ensure that all roles refresh their context by reading their respective role process.md files when switching roles during a sprint. This guarantees process integrity and that all best practices are followed for each role.
EOF
    print_success "Created restart.md"
else
    print_warning "restart.md already exists"
fi

print_status "Setting up npm scripts for role agent system..."

# Add role agent scripts to package.json if they don't exist
if [ -f "package.json" ]; then
    # Check if role agent scripts already exist
    if ! grep -q '"setup-role-agents"' package.json; then
        print_status "Adding role agent scripts to package.json..."
        # This is a simplified approach - in practice, you'd want to use a JSON manipulation tool
        print_warning "Please manually add the following scripts to your package.json:"
        echo "  \"setup-role-agents\": \"bash scripts/setup-role-agents.sh\","
        echo "  \"activate-scrum-master\": \"echo 'ACTIVATE SCRUM MASTER AGENT'\","
        echo "  \"activate-po\": \"echo 'ACTIVATE PO AGENT'\","
        echo "  \"activate-devops\": \"echo 'ACTIVATE DEVOPS AGENT'\","
        echo "  \"activate-architect\": \"echo 'ACTIVATE ARCHITECT AGENT'\","
        echo "  \"activate-developer\": \"echo 'ACTIVATE DEVELOPER AGENT'\","
        echo "  \"activate-qa\": \"echo 'ACTIVATE QA AGENT'\""
    else
        print_success "Role agent scripts already exist in package.json"
    fi
fi

print_status "Creating scripts directory..."
mkdir -p scripts

print_status "Setting up role agent quick reference..."

# Create a quick reference file
cat > docs/role-agent-quick-reference.md << 'EOF'
# Role Agent Quick Reference

## Activation Commands

| Role | Activation Command |
|------|-------------------|
| Scrum Master | `ACTIVATE SCRUM MASTER AGENT` |
| Product Owner | `ACTIVATE PO AGENT` |
| DevOps | `ACTIVATE DEVOPS AGENT` |
| Architect | `ACTIVATE ARCHITECT AGENT` |
| Developer | `ACTIVATE DEVELOPER AGENT` |
| QA | `ACTIVATE QA AGENT` |

## Quick Start Workflow

1. **Start as Scrum Master:**
   ```
   ACTIVATE SCRUM MASTER AGENT
   ```

2. **Switch to specific role for task:**
   ```
   ACTIVATE [ROLE] AGENT
   ```

3. **Return to Scrum Master:**
   ```
   ACTIVATE SCRUM MASTER AGENT
   ```

## Role Responsibilities

- **Scrum Master:** Orchestration, process management, team coordination
- **PO:** Planning, task creation, backlog management
- **DevOps:** Infrastructure, containerization, CI/CD
- **Architect:** Technical design, architecture decisions
- **Developer:** Implementation, coding, testing
- **QA:** Quality assurance, testing, feedback

## Recovery Commands

- **Context Loss:** `ACTIVATE SCRUM MASTER AGENT` (then follow recovery procedure)
- **Role Confusion:** `ACTIVATE SCRUM MASTER AGENT` (for re-orchestration)
- **Process Violation:** Check role-specific process.md files

## Key Files

- `.cursorrules` - Role agent configuration
- `restart.md` - Recovery procedures
- `docs/role-agents-overview.md` - Complete overview
- `docs/role-agent-usage-guide.md` - Detailed usage guide
- `sprints/iteration-3/planning.md` - Current sprint planning
- `sprints/iteration-3/daily.md` - Daily status
EOF

print_success "Created role agent quick reference"

print_status "Setting up initial sprint structure..."

# Create initial sprint structure if it doesn't exist
if [ ! -f "sprints/iteration-3/planning.md" ]; then
    cat > sprints/iteration-3/planning.md << 'EOF'
# Sprint 3 Planning

## Sprint Goal
The goal for Sprint 3 is to optimize the project's process documentation for DRY compliance, clarity, and traceability, starting with scrum-master/process.md. All roles must ensure that process improvements, QA feedback, and audit learnings are fully reflected in their respective process files. The sprint will deliver a robust, maintainable workflow and onboarding documentation, with all tasks and priorities executed in strict compliance with the updated process standards.

## Task List (Sprint 3)

- [ ] [Task 21: Setup Dedicated Role Agents](./iteration-3-task-21-setup-dedicated-role-agents.md)  
  **Priority:** 1
- [ ] [Task 20: Update Developer Process with First Principles for Development](./iteration-3-task-20-update-developer-process-first-principles.md)  
  **Priority:** 2
- [ ] [Task 19: PO Create TypeScript CLI (once.ts) for Subproject/Submodule Management (Web4Scrum foundation)](./iteration-3-task-19-once-ts-cli-submodule-management.md)  
  **Priority:** 3

## Planning Phase
- Sprint 2 retro and process improvements have been reviewed by all roles.
- All process, outline, and user feedback files are now organized by sprint.
- The planning phase is complete and QA user has approved the start of Sprint 3.
- The PO is responsible for creating and assigning tasks for all roles in Sprint 3, reflecting retro learnings and process changes.

---

For daily status updates and next planned steps for all roles in Sprint 3, see [daily.md](./daily.md).
EOF
    print_success "Created initial sprint planning"
else
    print_warning "Sprint planning already exists"
fi

if [ ! -f "sprints/iteration-3/daily.md" ]; then
    cat > sprints/iteration-3/daily.md << 'EOF'
# Daily Log - Iteration 3

2025-08-02 UTC

## Last State for Recovery
- Last successful role: Scrum Master
- Last successful task: Task 21 (Setup Dedicated Role Agents) - Role agent system implemented
- Status: Task 21 in Progress (implementation phase)
- Next step: Test role agent activation system and continue with remaining specifications.
- All process learnings, requirements, and QA audit documentation are present and traceable in planning.md and task 21.

## Next Planned Step
- Test role agent activation prompts and chat templates
- Create remaining role agent specifications (DevOps, Architect, Developer, QA)
- Finalize role agent usage guidelines and best practices
- Update process documentation to reflect new role agent structure

## Traceability
- See planning.md and task 21 for all details, learnings, and process updates.
- Scrum Master must augment each step with updates in daily.md and task files, per process best practices.
EOF
    print_success "Created initial daily log"
else
    print_warning "Daily log already exists"
fi

print_status "Setting up role process files..."

# Create basic role process files if they don't exist
for role in "${ROLE_DIRS[@]}"; do
    if [ ! -f "$role/process.md" ]; then
        cat > "$role/process.md" << EOF
# ${role^^} Process Documentation

This file contains process guidelines, best practices, and lessons learned for the ${role^^} role. Always read and update this file before performing ${role^^} actions.

## ${role^^} Role Responsibilities
- [To be defined based on role-specific requirements]

## Process Guidelines
- Follow role-specific best practices and standards
- Coordinate with other roles as needed
- Document all learnings and improvements
- Maintain process compliance and quality standards

## Integration
- This role integrates with the overall project process managed by the Scrum Master
- All role transitions and context handoffs are coordinated through the Scrum Master
- QA feedback is provided through the Scrum Master orchestration

## References
- [Scrum Master Process](../scrum-master/process.md)
- [Project Restart Guide](../restart.md)
- [Role Agents Overview](../docs/role-agents-overview.md)
EOF
        print_success "Created $role/process.md"
    else
        print_warning "$role/process.md already exists"
    fi
done

print_status "Finalizing setup..."

# Make the setup script executable
chmod +x scripts/setup-role-agents.sh

print_success "🎉 Role Agent System Setup Complete!"

echo ""
echo "📋 Next Steps:"
echo "1. Review the created documentation:"
echo "   - docs/role-agents-overview.md"
echo "   - docs/role-agent-usage-guide.md"
echo "   - docs/role-agent-quick-reference.md"
echo ""
echo "2. Test the role agent system:"
echo "   - Use 'ACTIVATE SCRUM MASTER AGENT' to start"
echo "   - Switch between roles using activation prompts"
echo "   - Follow the usage guide for best practices"
echo ""
echo "3. Customize role process files:"
echo "   - Update role-specific process.md files"
echo "   - Add role-specific responsibilities and guidelines"
echo "   - Integrate with your existing workflow"
echo ""
echo "4. Set up your development environment:"
echo "   - Configure your IDE with the .cursorrules file"
echo "   - Set up Docker dev container if needed"
echo "   - Configure Git and GitHub access"
echo ""

print_success "Role Agent System is ready for use! 🚀" 