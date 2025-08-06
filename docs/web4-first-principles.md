# Web4 First Principles

## Overview
Web4 principles fundamentally change how we develop code by introducing scenario-based configuration and instance recovery. This document captures the learning journey and principles as we iterate the TaskStateMachine to Web4 compliance.

## Core Web4 Concepts

### Scenarios
- **Definition**: Configuration files that represent exactly one instance of a system
- **Format**: `[name].uuid.scenario.json`
- **Purpose**: Enable multiple instances with different configurations
- **Recovery**: Each instance can always recover by reading its scenario file

### Instance Independence
- Each instance operates independently with its own configuration
- Multiple instances can run simultaneously with different configurations
- No shared state between instances - each has its own scenario

### Recovery Mechanism
- Every instance can recover its complete state from its scenario file
- Scenario files contain all necessary configuration and state information
- No external dependencies for recovery - self-contained scenarios

## Learning Journey

### 2025-08-06: Initial Web4 Introduction
- **Discovery**: Naming conventions can be scenarios instead of shared configurations
- **Principle**: Each naming convention (old/new) should be a separate scenario file
- **Impact**: Enables running multiple TaskStateMachine instances with different naming conventions
- **Recovery**: Each instance can recover using its specific scenario file

### 2025-08-06: Scenario Implementation
- **Discovery**: Merged daily.json and naming-conventions.json into unified scenario files
- **Structure**: Each scenario contains naming convention + instance state + recovery config
- **Implementation**: Created ScenarioManager class for Web4 scenario-based architecture
- **Files Created**:
  - `sprints/sprint-3/new-naming.a1b2c3d4-e5f6-7890-abcd-ef1234567890.scenario.json`
  - `sprints/iteration-3/old-naming.f9e8d7c6-b5a4-3210-fedc-ba9876543210.scenario.json`
- **Key Learning**: Scenarios eliminate shared state and enable true instance independence

## Current TaskStateMachine Analysis

### Current State
- `naming-conventions.json`: Contains both old and new configurations
- `daily.json`: Contains instance-specific state
- Mixed approach: shared configuration + instance state

### Web4 Refactoring Completed
1. **✅ Split Configurations**: Separated old and new into individual scenario files
2. **✅ Merge State**: Moved relevant daily.json data into scenario files
3. **✅ Instance Recovery**: Each scenario file enables complete instance recovery
4. **✅ Directory Structure**: Scenarios live in their respective sprint directories

## Scenario Structure

### Scenario File Components
```json
{
  "scenario": {
    "name": "new-naming",
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "description": "New naming convention scenario for sprint-3 directory",
    "created": "2025-08-06T10:58:00.000Z",
    "version": "1.0.0"
  },
  "naming": {
    // Naming convention configuration
  },
  "instance": {
    // Instance-specific state (previously in daily.json)
  },
  "recovery": {
    "enabled": true,
    "autoSave": true,
    "lastRecovery": "2025-08-06T10:58:00.000Z"
  }
}
```

### Key Benefits
1. **Instance Independence**: Each scenario is completely self-contained
2. **Recovery**: Complete state recovery from single scenario file
3. **No Shared State**: Eliminates conflicts between multiple instances
4. **Directory Alignment**: Scenarios live with their respective content
5. **Versioning**: Each scenario has version and creation tracking

## Next Steps
- Update TaskStateMachine to use ScenarioManager
- Implement scenario-based recovery in TaskStateMachine
- Add CLI commands for scenario management
- Create comprehensive tests for scenario functionality
- Maintain backward compatibility during transition

## Principles to Follow
1. **Instance Independence**: Each instance is self-contained
2. **Scenario Recovery**: Complete recovery from scenario file
3. **No Shared State**: Avoid shared configurations between instances
4. **Directory Alignment**: Scenarios live with their respective content
5. **Backward Compatibility**: Maintain existing functionality during transition
6. **UUID-based Identification**: Each scenario has unique identifier
7. **Recovery Tracking**: Track when scenarios were last recovered 