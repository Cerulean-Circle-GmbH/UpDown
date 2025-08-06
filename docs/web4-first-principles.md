# Web4 First Principles

## Overview
Web4 principles fundamentally change how we develop code by introducing scenario-based configuration and instance recovery. This document defines the core Web4 principles and concepts.

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

## Web4 Principles

### 1. Instance Independence
- **Principle**: Each instance is completely self-contained
- **Impact**: Eliminates shared state conflicts
- **Benefit**: Multiple instances can run simultaneously with different configurations

### 2. Scenario-Based Configuration
- **Principle**: Configuration is instance-specific, not shared
- **Impact**: Each instance has its own scenario file
- **Benefit**: Complete isolation between instances

### 3. Complete Recovery
- **Principle**: Single scenario file enables full instance recovery
- **Impact**: No need for multiple configuration files
- **Benefit**: Simplified recovery and deployment

### 4. No Shared State
- **Principle**: Avoid shared configurations between instances
- **Impact**: Eliminates configuration conflicts
- **Benefit**: Predictable instance behavior

### 5. Directory Alignment
- **Principle**: Scenarios live with their respective content
- **Impact**: Logical organization of scenarios
- **Benefit**: Easy discovery and management

### 6. UUID-based Identification
- **Principle**: Each scenario has unique identifier
- **Impact**: Guaranteed uniqueness across instances
- **Benefit**: No naming conflicts

### 7. Recovery Tracking
- **Principle**: Track when scenarios were last recovered
- **Impact**: Audit trail for recovery operations
- **Benefit**: Debugging and monitoring capabilities

## Scenario Structure

### Standard Scenario File Components
```json
{
  "scenario": {
    "name": "scenario-name",
    "uuid": "unique-identifier",
    "description": "Scenario description",
    "created": "ISO-timestamp",
    "version": "semantic-version"
  },
  "naming": {
    // Naming convention configuration
  },
  "instance": {
    // Instance-specific state
  },
  "recovery": {
    "enabled": true,
    "autoSave": true,
    "lastRecovery": "ISO-timestamp"
  }
}
```

## Web4 vs Traditional Architecture

### Traditional Approach
- Shared configuration files
- Multiple state files per instance
- Complex recovery mechanisms
- Potential conflicts between instances

### Web4 Approach
- Instance-specific scenario files
- Single file contains all instance data
- Simple recovery from scenario file
- Complete instance isolation

## Implementation Guidelines

### 1. Scenario File Naming
- Use descriptive names: `new-naming`, `old-naming`
- Include UUID for uniqueness
- Use `.scenario.json` extension

### 2. Scenario Location
- Place scenarios in relevant directories
- Align with content they manage
- Enable easy discovery

### 3. Recovery Implementation
- Load complete state from scenario file
- Update recovery timestamp on save
- Validate scenario file structure

### 4. Instance Management
- Each instance loads its own scenario
- No cross-instance communication
- Independent state management

## Benefits of Web4 Architecture

1. **Simplicity**: Single file per instance
2. **Reliability**: Complete recovery from scenario
3. **Scalability**: Multiple independent instances
4. **Maintainability**: Clear instance boundaries
5. **Debugging**: Self-contained scenarios
6. **Deployment**: Easy instance replication
7. **Versioning**: Scenario-level version control 