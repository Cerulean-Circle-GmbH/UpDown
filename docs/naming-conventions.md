# Naming Conventions Documentation

**Reference**: This document consolidates all naming convention requirements across the project to ensure DRY compliance and consistency.

## Overview
This document defines the standardized naming conventions for all project files, directories, and components to ensure consistency, maintainability, and process compliance.

## Directory Structure Naming

### Sprint Directories
**Current Format**: `sprints/iteration-3/`
**New Format**: `sprints/sprint-3/`

**Rationale**: 
- Shorter, more readable directory names
- Consistent with modern sprint terminology
- Easier to navigate and reference

### Task Files
**Current Format**: `iteration-3-task-1-analyze-devcontainer-requirements-and-tech-stack.md`
**New Format**: `task-1-[max 3 words].md`

**Examples**:
- `iteration-3-task-1-analyze-devcontainer-requirements-and-tech-stack.md` → `task-1-devcontainer-analysis.md`
- `iteration-3-task-18-implement-task-state-machine.md` → `task-18-state-machine.md`
- `iteration-3-task-22-implement-comprehensive-logger.md` → `task-22-logger.md`

**Rules**:
- Maximum 3 words in filename
- Use descriptive but concise terms
- Maintain task number for ordering
- Use kebab-case for multi-word descriptions

## File Naming Standards

### Task Files
- **Format**: `task-{number}-{description}.md`
- **Description**: Maximum 3 words, kebab-case
- **Examples**:
  - `task-1-devcontainer-analysis.md`
  - `task-18-state-machine.md`
  - `task-22-logger.md`

### Process Files
- **Format**: `{role}/process.md`
- **Examples**:
  - `scrum-master/process.md`
  - `po/process.md`
  - `qa/process.md`

### Documentation Files
- **Format**: `docs/{category}-{description}.md`
- **Examples**:
  - `docs/naming-conventions.md`
  - `docs/test-configuration.md`
  - `docs/process-standards.md`

### Template Files
- **Format**: `sprints/sprint-n[Template]/tasks/task-{number}-{description}.md`
- **Examples**:
  - `sprints/sprint-n[Template]/tasks/task-1-analyze-requirements.md`

## Link and Reference Standards

### Internal Links
- **Format**: `[Description](./filename.md)`
- **Examples**:
  - `[Task 18: State Machine](./task-18-state-machine.md)`
  - `[Planning](./planning.md)`

### Backlinks
- **Format**: `[Back to Planning](./planning.md)`
- **Location**: Top of every task file, immediately after title

### Cross-References
- **Format**: `[Reference Description](../path/to/file.md)`
- **Examples**:
  - `[Scrum Master Process](../scrum-master/process.md)`
  - `[Naming Conventions](../docs/naming-conventions.md)`

## Migration Requirements

### Task State Machine Impact
The TaskStateMachine.ts script must be updated to handle:
1. **New directory structure**: `sprints/sprint-3/` instead of `sprints/iteration-3/`
2. **New file naming**: `task-{number}-{description}.md` instead of `iteration-3-task-{number}-{description}.md`
3. **Path resolution**: Update all path calculations and file discovery logic
4. **Link generation**: Update link generation for new naming format

### Planning File Updates
- Update all task links in `planning.md`
- Update all cross-references between tasks
- Update all backlinks in task files

### Process File Updates
- Update all role process files to reference new naming conventions
- Update all documentation references
- Update all template references

## Compliance Requirements

### CMM Level 3+ Compliance
- **Unique Definition**: All naming conventions must be uniquely defined in this document
- **DRY Principle**: No duplicate naming convention information across files
- **Process Compliance**: All files must reference this document for naming standards
- **Documentation**: All changes must be documented in QA audit

### QA Audit Requirements
- All naming convention changes must be documented in task QA audit sections
- All file renames must be tracked and cross-referenced
- All broken links must be identified and fixed
- All process files must be updated to reference new conventions

## Implementation Steps

### Phase 1: Documentation
1. Create this naming conventions document
2. Update all process files to reference this document
3. Update all task files to reference this document

### Phase 2: Directory Structure
1. Create new `sprints/sprint-3/` directory
2. Move all files from `sprints/iteration-3/` to `sprints/sprint-3/`
3. Update all internal links and references

### Phase 3: File Renaming
1. Rename all task files to new format
2. Update all cross-references between files
3. Update all backlinks and planning references

### Phase 4: Tool Updates
1. Update TaskStateMachine.ts for new naming conventions
2. Update all scripts and tools for new paths
3. Test all functionality with new naming

### Phase 5: Validation
1. Verify all links work correctly
2. Verify all tools function with new naming
3. Update all documentation and process files
4. Complete QA audit and user feedback

## References
- [Process Standards Documentation](./process-standards.md)
- [CMM Level 3+ Requirements Documentation](./cmm-level3-requirements.md)
- [Task Refinement Guidelines Documentation](./task-refinement-guidelines.md)
- [Test Configuration Documentation](./test-configuration.md)

## Backlinks
- [Sprint 3 Planning](../sprints/sprint-3/planning.md)
- [Task 17: Naming Convention Optimization](../sprints/sprint-3/task-17-naming-optimization.md) 