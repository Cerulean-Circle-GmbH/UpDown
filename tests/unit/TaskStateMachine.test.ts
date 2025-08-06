import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { TaskStateMachine } from '../../temp/TaskStateMachine';
import * as fs from 'fs';
import * as path from 'path';

// Mock the CLI execution to avoid process.exit during tests
const originalProcessExit = process.exit;
beforeAll(() => {
  process.exit = (() => {}) as any;
});

afterAll(() => {
  process.exit = originalProcessExit;
});

describe('TaskStateMachine', () => {
  const tempDir = path.join(__dirname, '../../temp');
  const dailyJsonPath = path.join(tempDir, 'daily.json');

  beforeEach(() => {
    // Clean up daily.json before each test
    if (fs.existsSync(dailyJsonPath)) {
      fs.unlinkSync(dailyJsonPath);
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(dailyJsonPath)) {
      fs.unlinkSync(dailyJsonPath);
    }
  });

  it('should generate correct task ID using new naming convention', () => {
    // Mock task file path for testing
    const mockTaskPath = path.join(__dirname, '../../sprints/sprint-3/task-18-state-machine.md');
    
    // Create a mock task file content
    const mockContent = `# Task 18: Implement Task State Machine for Sprint Management

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
- [ ] Step 1
- [ ] Step 2
`;

    // Temporarily create the mock file
    const originalContent = fs.existsSync(mockTaskPath) ? fs.readFileSync(mockTaskPath, 'utf-8') : null;
    fs.writeFileSync(mockTaskPath, mockContent);

    try {
      const task = TaskStateMachine.parseTaskFile(mockTaskPath);
      
      // Test that task ID uses new naming convention
      expect(task.id).toBe('task-18');
      expect(task.title).toBe('Task 18: Implement Task State Machine for Sprint Management');
      
      // Test that files use correct paths
      expect(task.files.taskMd).toBe(mockTaskPath);
      expect(task.files.planningMd).toContain('sprints/sprint-3/planning.md');
      
    } finally {
      // Restore original content if it existed
      if (originalContent) {
        fs.writeFileSync(mockTaskPath, originalContent);
      } else if (fs.existsSync(mockTaskPath)) {
        fs.unlinkSync(mockTaskPath);
      }
    }
  });

  it('should update daily.json with correct naming conventions', () => {
    // Mock task file path for testing
    const mockTaskPath = path.join(__dirname, '../../sprints/sprint-3/task-18-state-machine.md');
    
    // Create a mock task file content
    const mockContent = `# Task 18: Implement Task State Machine for Sprint Management

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
- [ ] Step 1
- [ ] Step 2
`;

    // Temporarily create the mock file
    const originalContent = fs.existsSync(mockTaskPath) ? fs.readFileSync(mockTaskPath, 'utf-8') : null;
    fs.writeFileSync(mockTaskPath, mockContent);

    try {
      const task = TaskStateMachine.parseTaskFile(mockTaskPath);
      const stateMachine = new TaskStateMachine(task);
      
      // Test that daily.json is created with correct task ID
      expect(fs.existsSync(dailyJsonPath)).toBe(true);
      
      const dailyJson = JSON.parse(fs.readFileSync(dailyJsonPath, 'utf-8'));
      expect(dailyJson.currentTask).toBe('task-18');
      expect(dailyJson.currentSprint).toBe('Sprint 3');
      expect(dailyJson.files.taskMd).toBe(mockTaskPath);
      expect(dailyJson.files.planningMd).toContain('sprints/sprint-3/planning.md');
      
    } finally {
      // Restore original content if it existed
      if (originalContent) {
        fs.writeFileSync(mockTaskPath, originalContent);
      } else if (fs.existsSync(mockTaskPath)) {
        fs.unlinkSync(mockTaskPath);
      }
    }
  });

  it('should handle old daily.json format and update to new naming convention', () => {
    // Create old format daily.json
    const oldDailyJson = {
      currentSprint: 'Sprint 3',
      currentTask: 'iteration-3-task-18-implement-task-state-machine',
      status: 'done',
      files: {
        taskMd: '/old/path/iteration-3-task-18-implement-task-state-machine.md',
        dailyMd: '/old/path/daily.md',
        planningMd: '/old/path/planning.md',
      },
      history: []
    };
    
    fs.writeFileSync(dailyJsonPath, JSON.stringify(oldDailyJson, null, 2));
    
    // Mock task file path for testing
    const mockTaskPath = path.join(__dirname, '../../sprints/sprint-3/task-18-state-machine.md');
    
    // Create a mock task file content
    const mockContent = `# Task 18: Implement Task State Machine for Sprint Management

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
- [ ] Step 1
- [ ] Step 2
`;

    // Temporarily create the mock file
    const originalContent = fs.existsSync(mockTaskPath) ? fs.readFileSync(mockTaskPath, 'utf-8') : null;
    fs.writeFileSync(mockTaskPath, mockContent);

    try {
      const task = TaskStateMachine.parseTaskFile(mockTaskPath);
      const stateMachine = new TaskStateMachine(task);
      
      // Test that daily.json is updated to new format
      const updatedDailyJson = JSON.parse(fs.readFileSync(dailyJsonPath, 'utf-8'));
      expect(updatedDailyJson.currentTask).toBe('task-18');
      expect(updatedDailyJson.files.taskMd).toBe(mockTaskPath);
      expect(updatedDailyJson.files.planningMd).toContain('sprints/sprint-3/planning.md');
      
    } finally {
      // Restore original content if it existed
      if (originalContent) {
        fs.writeFileSync(mockTaskPath, originalContent);
      } else if (fs.existsSync(mockTaskPath)) {
        fs.unlinkSync(mockTaskPath);
      }
    }
  });
});