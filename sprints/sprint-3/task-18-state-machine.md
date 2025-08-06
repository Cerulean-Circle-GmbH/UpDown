[Back to Planning](./planning.md)

# Task 18: Implement Task State Machine for Sprint Management

## Status
- [x] Planned
- [x] In Progress
  - [ ] refinement
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [x] QA Review
- [x] Done

## Task Description
Implement a robust TypeScript-based task state machine that manages task status transitions and updates all relevant project files (task markdown, daily.md, daily.json, planning.md) in Sprint 3. The state machine must:
- Read and write status to daily.json.
- Update daily.md as a view of daily.json.
- Update the status in the task markdown file according to the template.
- Update planning.md to reflect the current status.
- Support all standard status transitions (open, in-progress, qa-review, done, blocked).
- Be extensible for future sprint and task management automation.

## Context
This task is part of Sprint 3 and follows the process and compliance requirements established in previous sprints. The solution must be DRY, maintainable, and auditable, with all changes traceable in daily.json and the QA audit.

## Intention
The intention is to automate and standardize task status management, ensuring all documentation and planning files are always up-to-date and compliant with the sprint process.

## Steps
- [x] Review all QA feedback in this file and related tasks (17, 19, 20) and consolidate requirements.
- [x] Refactor the state machine to:
  - Support and enforce strict OOP, stepwise transitions, and auditable logs.
  - Distinguish between main status, in-progress substates, and intention steps.
  - Update all relevant files (task md, daily.json, daily.md, planning.md) in a DRY, robust, and extensible way.
  - Handle new requirements for multi-task and subproject support (see Task 19/Web4Scrum foundation).
  - Integrate first principles and process requirements from Task 20.
- [x] Test the state machine with Task 18 and at least one other task (e.g., Task 17 or 20) to verify correct updates and extensibility.
- [x] Update documentation and onboarding to reflect new usage, requirements, and QA feedback.
- [x] Submit for QA review and finalize documentation.
- [x] Implement configurable naming convention system:
  - Create JSON configuration files for old and new naming conventions
  - Implement NamingConventionManager class for switching between conventions
  - Add CLI commands for convention management (show, switch, fallback)
  - Integrate with TaskStateMachine for dynamic naming support
  - Add comprehensive test cases for naming convention functionality
  - Update task documentation with new naming convention features
- [ ] Refactor to Web4 scenario-based architecture:
  - Split naming-conventions.json into separate scenario files
  - Create new-naming.${uuid}.scenario.json for sprint-3 directory
  - Create old-naming.${uuid}.scenario.json for iteration-3 directory
  - Merge relevant daily.json data into scenario files
  - Implement scenario-based instance recovery
  - Update TaskStateMachine to use scenario files instead of shared config
  - Maintain backward compatibility during transition
  - Add Web4 first principles documentation

## Requirements



Requirements (updated for persistent state and autonomous progression):
- The state machine must use daily.json as the source of truth for persistent state.
- On reset, daily.json is cleared and reset to planned. Reset must be called as: `ts-node .../taskStateMachine.ts task <num> reset` (e.g., `task 18 reset`).
- On each run, the state machine loads daily.json to restore the current status and steps.
- At the end of each run, the state machine writes the updated state back to daily.json.
- All status changes must be reflected in daily.md, planning.md, and the task markdown file.
- The solution must be extensible for future sprints and task types.
- All changes must be auditable and documented in the QA audit.
- The state machine must support resetting the task to 'Planned' state.
- The script must only progress one state or step per run, not all at once.
- When progressing a step, the script must return the next step to be worked off (from the Intention section) and tick it off in the task file.
- For autonomous progression, no parameter is needed: `ts-node .../taskStateMachine.ts` will use the task and state from daily.json. If daily.json does not exist, the script must require a task number parameter and show an error. This behavior is documented here.

## Acceptance Criteria
- The state machine updates all relevant files according to the current status in daily.json.
- The task markdown file reflects the current status and follows the template.
- daily.md is regenerated from daily.json.
- planning.md is updated to show the current status of the task.
- QA audit and user feedback are documented.

## QA Audit & User Feedback
All feedback and audit entries must be timestamped (UTC) and documented in this section.

### 2025-08-06T08:30Z QA Audit Entry
- The TaskStateMachine script was successfully tested on Task 18 using `npx tsx TaskStateMachine.ts testing task 18` for full modern ESM module compliance.
- All steps, substates, and status transitions were correctly executed and ticked off in the task markdown, daily.json, daily.md, and planning.md.
- The script is fully compatible with the tech stack and ESM modules, and `tsx` is recommended for all future TypeScript/ESM script execution.
- The state machine correctly progresses through: substates (refinement, creating test cases, implementing) → steps (from Steps section) → testing substate → qa-review → done.

### 2025-08-06T09:15Z QA Feedback - Reset Functionality Fix
**Issue**: The reset functionality was not working properly. When testing Task 21, the script showed "Task is already done. No further progression" instead of properly resetting the task.

**Root Cause**: The TaskStateMachine script was missing proper reset functionality that could:
1. Reset task status back to "Planned"
2. Uncheck all substates (refinement, creating test cases, implementing, testing)
3. Uncheck all steps in the Steps section
4. Clear daily history for the task
5. Update the markdown file with unchecked checkboxes

**Solution Implemented**:
1. **Added reset() method** to TaskStateMachine class that:
   - Resets status to 'planned'
   - Resets all substates to 'open'
   - Uses regex to find and uncheck all step checkboxes in the markdown file
   - Clears daily.json history for the task
   - Updates the task markdown file with unchecked status

2. **Added CLI support** for reset command:
   - `npx tsx TaskStateMachine.ts reset task 21` now works properly
   - Finds the task file, parses it, and calls the reset method
   - Provides proper error handling for missing task files

3. **Fixed TypeScript type issues**:
   - Added explicit type casting for status comparisons: `('done' as TaskStatus)`
   - Fixed constructor usage to properly parse task files before creating TaskStateMachine instance

**Testing Results**:
- ✅ Reset command now works: `npx tsx TaskStateMachine.ts reset task 21`
- ✅ Task 21 properly resets to Planned state with all checkboxes unchecked
- ✅ Daily history is cleared for the reset task
- ✅ No infinite loops or type errors
- ✅ Script maintains full ESM compliance with `tsx`

**Impact**: The TaskStateMachine script now has complete functionality for both progression and reset, making it a robust tool for task lifecycle management in the project.

### 2025-08-06T09:20Z QA Feedback - Color Coding Fix
**Issue**: The reset functionality was working but the color coding was broken compared to the previous version. Error messages and result messages were not showing in their proper colors (red for errors, cyan for results).

**Root Cause**: When implementing the reset functionality, the ANSI color codes were removed from the error messages in the CLI class.

**Solution Implemented**:
1. **Restored ANSI color codes** in the reset functionality:
   - `\x1b[31m` (red) for error messages
   - `\x1b[36m` (cyan) for result messages
   - `\x1b[0m` (reset) to end color formatting

2. **Fixed error message color coding**:
   - `Error: Task file for task ${taskNumber} not found.` now shows in red
   - `Error: TaskStateMachine not initialized.` now shows in red
   - `Result: ${result}` now shows in cyan

**Testing Results**:
- ✅ Reset command works with proper color coding
- ✅ Error messages display in red when task files are not found
- ✅ Result messages display in cyan for successful operations
- ✅ LogAction method maintains its existing color coding (green for steps, red for errors, cyan for reset)
- ✅ All functionality preserved while restoring visual consistency

**Impact**: The TaskStateMachine script now maintains consistent color coding across all functionality, providing better visual feedback and maintaining the professional appearance of the tool.

### 2025-08-06T09:26Z QA Feedback - Blue Color for Step Messages
**Issue**: User requested to change the "Ticking off step:" messages to blue color for better visual distinction.

**Solution Implemented**:
1. **Added blue color option** to the `logAction` method:
   - `\x1b[34m` (blue) for step tick messages
   - Added 'blue' type parameter to the method signature

2. **Updated step tick messages**:
   - Changed `this.logAction(\`Ticking off step: ${nextStep.name}\`, 'step')` to `this.logAction(\`Ticking off step: ${nextStep.name}\`, 'blue')`
   - This makes step progression messages appear in blue instead of green

3. **Enhanced color detection**:
   - Added proper color support detection using `process.stdout.isTTY && process.env.TERM !== 'dumb'`
   - Ensures colors only display when terminal supports them

**Testing Results**:
- ✅ "Ticking off step:" messages now display in blue color
- ✅ Color detection works properly for different terminal environments
- ✅ All other color coding (green for substates, yellow for status, red for errors, cyan for reset) remains intact
- ✅ Visual distinction between step progression and other operations is improved

**Impact**: The TaskStateMachine script now provides better visual feedback with blue-colored step progression messages, making it easier to distinguish between different types of operations during task progression.

### 2025-08-06T09:34Z QA Feedback - Corrected Color Mapping
**Issue**: The color mapping was incorrect. The 'step' type should map to blue, and testing mode messages should be gray.

**Solution Implemented**:
1. **Fixed color mapping**:
   - `'step'` now maps to `\x1b[34m` (blue) instead of green
   - Added `'gray'` type mapping to `\x1b[90m` for testing mode messages
   - Removed redundant `'blue'` type since `'step'` now serves this purpose

2. **Updated testing mode messages**:
   - All "Testing mode:" messages now use `'gray'` type
   - This includes: "Testing mode: Reset task X to Planned", "Testing mode: Substate ticked off: X", "Testing mode: Step ticked off: X", "Testing mode: Status progressed to X", "Testing mode: Full progression complete."

3. **Corrected step tick messages**:
   - "Ticking off step:" messages now use `'step'` type (which maps to blue)
   - This provides proper visual distinction for step progression

**Testing Results**:
- ✅ "Ticking off step:" messages display in blue (using 'step' type)
- ✅ All "Testing mode:" messages display in gray
- ✅ Color mapping is now logically correct
- ✅ Visual distinction between actual operations and testing feedback is clear
- ✅ Testing mode messages are appropriately subdued with gray color

**Impact**: The TaskStateMachine script now has correct color mapping where step progression is blue and testing feedback is gray, providing clear visual distinction between actual operations and testing mode output.

### 2025-08-06T09:40Z QA Feedback - Logger Integration Requirements
**Issue**: Task 18 needs to be updated for consistency with the new comprehensive logger requirements from Task 22.

**Requirements Added**:
1. **Logger Integration**: TaskStateMachine must integrate with the new Logger class from Task 22
2. **DRY Compliance**: Remove all inline color coding and replace with logger calls
3. **Log Level Support**: Support different log levels (ERROR, WARN, LOG, DEBUG, TESTING)
4. **Color Mapping**: Ensure proper color mapping:
   - Status progression - yellow
   - Status logging - green  
   - Step logging - blue
   - Testing mode - gray (level 4)
5. **Backward Compatibility**: Maintain existing logAction method functionality
6. **OOP Principles**: Follow radical OOP programming with proper encapsulation

**Integration Points**:
- Replace all `console.log` calls with appropriate logger methods
- Replace inline color coding with logger color mapping
- Add log level filtering support
- Ensure singleton logger instance is used throughout
- Maintain existing API for backward compatibility

**Testing Requirements**:
- Test logger integration with TaskStateMachine
- Verify all color coding works correctly
- Test log level filtering
- Ensure no functionality is lost during migration
- Validate DRY principle compliance

**Impact**: Task 18 will be updated to use the comprehensive logger from Task 22, ensuring consistent logging across the project and eliminating DRY violations.

### 2025-08-06T10:20Z QA Feedback - TaskStateMachine Naming Convention Updates Required
**Issue**: TaskStateMachine.ts must be updated to handle new naming conventions and directory structure changes.

**Required Updates**:
1. **Directory Structure**: Update path resolution from `sprints/iteration-3/` to `sprints/sprint-3/`
2. **File Naming**: Update file discovery from `iteration-3-task-{number}-{description}.md` to `task-{number}-{description}.md`
3. **Path Calculations**: Update all path calculations and file discovery logic
4. **Link Generation**: Update link generation for new naming format
5. **Backlink Updates**: Update backlink generation to use new directory structure

**Implementation Steps**:
- **Update File Discovery**: Modify `findTaskFile()` method to use new directory structure and naming
- **Update Path Resolution**: Modify all path calculations to use `sprints/sprint-3/`
- **Update Link Generation**: Modify link generation to use new file naming format
- **Test Functionality**: Verify TaskStateMachine works with new naming conventions
- **Update Documentation**: Update all references to use new naming format

**Impact**: This ensures TaskStateMachine continues to function correctly after the naming convention optimization.

### 2025-08-06T10:25Z QA Feedback - Directory Structure Safety
**Issue**: Need to maintain old directory structure until QA confirms new naming conventions are working perfectly.

**Solution**: 
- **Keep Old Directory**: Maintain `sprints/iteration-3/` until QA confirms `sprints/sprint-3/` is working perfectly
- **Complete New Directory**: Rename all tasks in `sprints/sprint-3/` to new naming conventions
- **Update Planning**: Ensure `sprints/sprint-3/planning.md` matches the structure of `sprints/iteration-3/planning.md`
- **Test Thoroughly**: Verify TaskStateMachine works with both old and new naming conventions
- **QA Approval**: Only remove old directory after QA confirms everything is working correctly

**Implementation**:
- ✅ All task files in `sprints/sprint-3/` renamed to new format: `task-{number}-{max 3 words}.md`
- ✅ Planning.md updated with all new task links and proper structure
- ✅ TaskStateMachine updated with fallback support for both naming conventions
- ✅ Old directory `sprints/iteration-3/` maintained for safety
- ⏳ Awaiting QA confirmation before removing old directory

**Impact**: This ensures safe transition and allows rollback if any issues are discovered during QA testing.

### 2025-08-02T10:03Z QA Audit Entry
- When running the Task State Machine script, it must be executed from within the `temp/` directory for correct path resolution. Running from the project root or other directories may cause module resolution errors (e.g., `Cannot find module './TaskStateMachine.ts'`).
- Recommendation: Update the script to resolve all file and module paths robustly, regardless of the working directory, or document this requirement clearly in process and onboarding documentation.

- 2025-08-01 UTC: QA feedback: Strict OOP implementation required. State machine must not skip substates. Implementation must work for any task file, but currently uses Task 18 for demonstration. Non-OOP scripts (e.g., task18StateMachine.ts) must be removed. All transitions must be stepwise and auditable.
- 2025-08-01 UTC: QA feedback: Do not mix status states, in-progress substates, and free-text steps. Script must log all actions, update status, and progress all steps correctly. Adapt script to distinguish between main status, in-progress substates, and intention steps. Test and document this feedback.

### User Prompts Regarding daily.json
- The state machine must create a valid daily.json on the first run and continue to progress it on subsequent runs.
- The state machine must read daily.json at the beginning and update it at the end of each execution.
- The daily.json must include: current sprint, current task, status, fully qualified task filename, daily file name, planning file name.
- All status changes must be reflected in daily.md, planning.md, and the task markdown file.
- The solution must be extensible for future sprints and task types.
- All changes must be auditable and documented in the QA audit.
- Example entry: '- 2025-08-01 UTC: Task state machine implemented and tested.'


- 2025-08-01T14:05:06.724Z UTC: Progressed to status 'In Progress'.

- 2025-08-01T14:05:49.894Z UTC: Progressed to status 'QA Review'.
---
## Subtasks
- [Task 18.1: Extend State Machine for Multi-Task Support](./iteration-3-task-18.1.md)
- [Task 18.2: Document Integration with Sprint Planning](./iteration-3-task-18.2.md)

---
