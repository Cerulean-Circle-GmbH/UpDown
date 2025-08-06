[Back to Planning](./planning.md)

# Task 23: Web4 Learning and Implementation

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
Learn and implement Web4 principles to fundamentally change how we develop code. Web4 introduces scenario-based configuration and instance recovery, enabling multiple independent instances with different configurations. This task focuses on understanding and applying Web4 principles to the TaskStateMachine and project architecture.

## Context
This task is part of Sprint 3 and follows the process and compliance requirements established in previous sprints. The solution must be DRY, maintainable, and auditable, with all changes traceable in daily.json and the QA audit.

## Intention
The intention is to learn Web4 principles and apply them to create a more robust, instance-independent architecture that eliminates shared state and enables complete recovery from scenario files.

## Steps
- [ ] Learn Web4 core concepts: scenarios, instance independence, recovery mechanisms
- [ ] Analyze current architecture for Web4 refactoring opportunities
- [ ] Implement scenario-based configuration system
- [ ] Create ScenarioManager class for Web4 scenario-based architecture
- [ ] Split shared configurations into individual scenario files
- [ ] Merge instance state into scenario files for complete recovery
- [ ] Update TaskStateMachine to use scenario-based recovery
- [ ] Add CLI commands for scenario management
- [ ] Create comprehensive tests for scenario functionality
- [ ] Document Web4 learning journey and principles
- [ ] Maintain backward compatibility during transition
- [ ] Submit for QA review and finalize documentation

## Requirements

### Web4 Core Concepts
- **Scenarios**: Configuration files that represent exactly one instance of a system
- **Format**: `[name].uuid.scenario.json`
- **Instance Independence**: Each instance operates independently with its own configuration
- **Recovery Mechanism**: Every instance can recover its complete state from its scenario file
- **No Shared State**: Avoid shared configurations between instances

### Implementation Requirements
- Create separate scenario files for different naming conventions
- Merge daily.json data into scenario files
- Implement scenario-based recovery in TaskStateMachine
- Add scenario management CLI commands
- Create comprehensive test coverage
- Document learning journey and principles

## Acceptance Criteria
- Web4 principles are understood and documented
- Scenario-based architecture is implemented
- TaskStateMachine can use scenario-based recovery
- Multiple independent instances can run simultaneously
- Complete recovery from single scenario file is possible
- Backward compatibility is maintained
- Comprehensive test coverage exists
- Learning journey is documented

## Dependencies
- Task 18: TaskStateMachine implementation
- Task 22: Logger implementation
- Existing naming convention system

## QA Audit & User Feedback
All feedback and audit entries must be timestamped (UTC) and documented in this section.

### 2025-08-06T10:58:00Z QA Feedback - Initial Web4 Learning
**Discovery**: Naming conventions can be scenarios instead of shared configurations
**Principle**: Each naming convention (old/new) should be a separate scenario file
**Impact**: Enables running multiple TaskStateMachine instances with different naming conventions
**Recovery**: Each instance can recover using its specific scenario file

### 2025-08-06T10:58:30Z QA Feedback - Scenario Implementation
**Discovery**: Merged daily.json and naming-conventions.json into unified scenario files
**Structure**: Each scenario contains naming convention + instance state + recovery config
**Implementation**: Created ScenarioManager class for Web4 scenario-based architecture
**Files Created**:
- `sprints/sprint-3/new-naming.a1b2c3d4-e5f6-7890-abcd-ef1234567890.scenario.json`
- `sprints/iteration-3/old-naming.f9e8d7c6-b5a4-3210-fedc-ba9876543210.scenario.json`
**Key Learning**: Scenarios eliminate shared state and enable true instance independence

## Tech Stack
- TypeScript with ESM modules
- Node.js file system operations
- JSON configuration management
- UUID generation for scenario identification
- Glob pattern matching for scenario discovery

## Role-Specific Requirements

### PO Requirements
- Ensure Web4 principles align with project goals
- Validate scenario-based architecture supports future requirements
- Confirm backward compatibility during transition

### QA Requirements
- Test scenario-based recovery mechanisms
- Validate instance independence
- Verify no shared state between instances
- Test multiple simultaneous instances

### Developer Requirements
- Implement ScenarioManager class
- Update TaskStateMachine for scenario-based recovery
- Add comprehensive test coverage
- Maintain code quality and documentation

### DevOps Requirements
- Ensure scenario files are properly versioned
- Validate scenario file structure and validation
- Test scenario discovery and loading mechanisms 