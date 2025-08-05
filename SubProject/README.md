# UpDown Project - Role Agent System

## 🚀 Quick Start

### 1. Setup the Role Agent System
```bash
# Run the setup script to initialize the role agent system
bash scripts/setup-role-agents.sh
```

### 2. Activate Role Agents
Use these activation prompts to switch between roles:

| Role | Activation Command |
|------|-------------------|
| **Scrum Master** | `ACTIVATE SCRUM MASTER AGENT` |
| **Product Owner** | `ACTIVATE PO AGENT` |
| **DevOps** | `ACTIVATE DEVOPS AGENT` |
| **Architect** | `ACTIVATE ARCHITECT AGENT` |
| **Developer** | `ACTIVATE DEVELOPER AGENT` |
| **QA** | `ACTIVATE QA AGENT` |

### 3. Start Using the System
```
ACTIVATE SCRUM MASTER AGENT
```

## 📋 What is the Role Agent System?

The **Role Agent System** is a structured approach to managing different project roles within a single LLM chat. Instead of a single AI switching between roles, each role has:

- **Clear role definition** and responsibilities
- **Role-specific chat templates** for consistent communication
- **Context preservation** during role transitions
- **Structured interaction patterns** with other roles
- **Error handling** and recovery procedures

## 🏗️ Architecture

```
QA User (You)
    ↓
Scrum Master Agent (Orchestrator)
    ↓
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│   PO Agent  │ DevOps Agent│Architect    │Developer    │   QA Agent  │
│             │             │Agent        │Agent        │             │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

## 🎯 Role Responsibilities

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

## 📁 Project Structure

```
UpDown/
├── .cursorrules                    # Role agent configuration
├── restart.md                      # Recovery procedures
├── scripts/
│   └── setup-role-agents.sh        # Setup script
├── docs/
│   ├── role-agents-overview.md     # Complete overview
│   ├── role-agent-usage-guide.md   # Detailed usage guide
│   └── role-agent-quick-reference.md # Quick reference
├── sprints/iteration-3/
│   ├── planning.md                 # Current sprint planning
│   └── daily.md                    # Daily status
├── scrum-master/                   # Scrum Master process
├── po/                            # Product Owner process
├── devops/                        # DevOps process
├── architect/                     # Architect process
├── developer/                     # Developer process
├── qa/                           # QA process
└── user.specs/                   # User requirements
```

## 🔄 Usage Workflow

### Example 1: Task Planning
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

### Example 2: Technical Implementation
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

## 🛠️ Setup Instructions

### 1. Automatic Setup
```bash
# Run the setup script
bash scripts/setup-role-agents.sh
```

### 2. Manual Setup
If you prefer manual setup:

1. **Create role directories:**
   ```bash
   mkdir -p scrum-master po devops architect developer qa docs user.specs
   ```

2. **Copy configuration files:**
   - Copy `.cursorrules` to your project root
   - Copy documentation files to `docs/`
   - Copy process files to respective role directories

3. **Configure your IDE:**
   - Ensure `.cursorrules` is recognized by your IDE
   - Set up any additional configuration as needed

### 3. Verify Setup
```bash
# Check that all files are in place
ls -la .cursorrules docs/role-agents-overview.md scripts/setup-role-agents.sh
```

## 📚 Documentation

### Essential Reading
1. **[Role Agents Overview](docs/role-agents-overview.md)** - Complete concept explanation
2. **[Role Agent Usage Guide](docs/role-agent-usage-guide.md)** - Practical implementation guide
3. **[Role Agent Quick Reference](docs/role-agent-quick-reference.md)** - Quick commands and tips

### Process Files
- **[Scrum Master Process](scrum-master/process.md)** - Orchestration and coordination
- **[PO Process](po/process.md)** - Planning and task management
- **[DevOps Process](devops/process.md)** - Infrastructure and automation
- **[Architect Process](architect/process.md)** - Technical design and patterns
- **[Developer Process](developer/process.md)** - Implementation and coding
- **[QA Process](qa/process.md)** - Quality assurance and testing

## 🔧 Configuration

### .cursorrules File
The `.cursorrules` file contains the complete role agent configuration and should be placed in your project root. It includes:

- Role agent specifications
- Activation prompts
- Project structure
- Process compliance rules
- Recovery procedures

### Customization
You can customize the role agent system by:

1. **Modifying role specifications** in the respective process files
2. **Adding new roles** by creating new directories and process files
3. **Customizing chat templates** for your specific needs
4. **Extending activation prompts** for additional functionality

## 🚨 Troubleshooting

### Common Issues

**Role Confusion:**
```
ACTIVATE SCRUM MASTER AGENT
[Scrum Master will re-orchestrate and clarify roles]
```

**Context Loss:**
```
[Scrum Master will execute recovery procedure]
1. Read restart.md for recovery steps
2. Check current sprint planning.md
3. Review daily.md for status
4. Resume from last known state
```

**Process Violation:**
- Review role-specific process.md files
- Update process documentation
- Coordinate with Scrum Master for guidance

### Recovery Procedures

**If Role Agent Gets Confused:**
```
ACTIVATE SCRUM MASTER AGENT
```

**If Context is Lost:**
```
[Follow recovery procedure in restart.md]
```

**If Process is Violated:**
```
[Review and update process files]
```

## 🎯 Best Practices

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

## 🔗 Integration

### With Existing Process
The role agent system integrates with:
- **Task State Machine** for status management
- **Process files** for role-specific guidance
- **QA audit** for feedback and compliance
- **Sprint planning** for task management

### With Development Tools
- **VS Code** with `.cursorrules` configuration
- **Docker** for containerized development
- **Git** for version control
- **GitHub** for collaboration

## 📈 Future Enhancements

### Planned Improvements
1. **Automated Role Transitions** - Streamlined handoff procedures
2. **Enhanced Context Management** - Improved context preservation
3. **Role-Specific Tools** - Specialized utilities for each role
4. **Performance Metrics** - Tracking and optimization
5. **Advanced Orchestration** - More sophisticated coordination

### Scalability
- Role agents can be extended for additional roles
- Context management can be enhanced for complex workflows
- Integration with external tools and systems
- Support for distributed team collaboration

## 🤝 Contributing

To contribute to the role agent system:

1. **Follow the process** - Use role agents for all development work
2. **Document changes** - Update relevant process files
3. **Test thoroughly** - Ensure role transitions work correctly
4. **Get QA approval** - Coordinate with QA user for feedback

## 📞 Support

For support with the role agent system:

1. **Check documentation** - Review the guides and references
2. **Use recovery procedures** - Follow restart.md for context recovery
3. **Contact Scrum Master** - Use `ACTIVATE SCRUM MASTER AGENT` for orchestration
4. **Review process files** - Check role-specific process documentation

---

**Ready to get started?** Run `bash scripts/setup-role-agents.sh` and then use `ACTIVATE SCRUM MASTER AGENT` to begin! 🚀 