import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { TaskStateMachine } from '../../temp/TaskStateMachine.js';

const tempDir = path.resolve('./');
const mockTaskFile = path.join(tempDir, 'mock-task-18.md');
const mockDailyJson = path.join(tempDir, 'mock-daily.json');
const mockDailyMd = path.join(tempDir, 'mock-daily.md');
const mockPlanningMd = path.join(tempDir, 'mock-planning.md');

const mockTaskMdContent = `# Task 18: Implement Task State Machine for Sprint Management

## Status
- [ ] Planned
- [ ] In Progress
  - [ ] refinement
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

## Steps 
- [ ] Analyze requirements and review task template.
- [ ] Design the state machine and file update logic.
- [ ] Implement the TypeScript class and methods for state transitions and file updates.
- [ ] Move usage example to the end of the file for correct execution order.
- [ ] Test the state machine with Task 18 and verify all file updates (task md, daily.json, daily.md, planning.md).
- [ ] Document the solution and update the task file status.
- [ ] Refactor usage code for ES module compatibility and execute to update daily.json.
- [ ] Submit for QA review and finalize documentation.
`;

describe('TaskStateMachine', () => {
  beforeEach(() => {
    // Write a fresh mock task file and clear any previous state
    fs.writeFileSync(mockTaskFile, mockTaskMdContent);
    if (fs.existsSync(mockDailyJson)) fs.unlinkSync(mockDailyJson);
    if (fs.existsSync(mockDailyMd)) fs.unlinkSync(mockDailyMd);
    if (fs.existsSync(mockPlanningMd)) fs.unlinkSync(mockPlanningMd);
  });
  afterEach(() => {
    // Clean up
    if (fs.existsSync(mockTaskFile)) fs.unlinkSync(mockTaskFile);
    if (fs.existsSync(mockDailyJson)) fs.unlinkSync(mockDailyJson);
    if (fs.existsSync(mockDailyMd)) fs.unlinkSync(mockDailyMd);
    if (fs.existsSync(mockPlanningMd)) fs.unlinkSync(mockPlanningMd);
  });

  it('progresses through substates, steps, and status transitions correctly', () => {
    // Patch the TaskStateMachine to use mock file paths
    const task = TaskStateMachine.parseTaskFile(mockTaskFile);
    task.files.dailyJson = mockDailyJson;
    task.files.dailyMd = mockDailyMd;
    task.files.planningMd = mockPlanningMd;
    const sm = new TaskStateMachine(task);

    // Planned -> In Progress
    expect(sm.status).toBe('planned');
    sm.progressOne();
    expect(sm.status).toBe('in-progress');
    // refinement
    sm.progressOne();
    expect(sm.steps.find(s => s.name === 'refinement')?.status).toBe('done');
    // creating test cases
    sm.progressOne();
    expect(sm.steps.find(s => s.name === 'creating test cases')?.status).toBe('done');
    // implementing
    sm.progressOne();
    expect(sm.steps.find(s => s.name === 'implementing')?.status).toBe('done');
    // Now steps (from Steps section)
    for (const step of task.steps.filter(s => !['refinement','creating test cases','implementing','testing'].includes(s.name))) {
      sm.progressOne();
      expect(sm.steps.find(s => s.name === step.name)?.status).toBe('done');
    }
    // After all steps, 'testing' substate
    sm.progressOne();
    expect(sm.steps.find(s => s.name === 'testing')?.status).toBe('done');
    // in-progress -> qa-review
    sm.progressOne();
    expect(sm.status).toBe('qa-review');
    // qa-review -> done
    sm.progressOne();
    expect(sm.status).toBe('done');
  });
});