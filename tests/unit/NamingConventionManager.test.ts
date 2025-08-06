import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { NamingConventionManager, NamingConvention } from '../../temp/NamingConventionManager';
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

describe('NamingConventionManager', () => {
  const testConfigPath = path.join(__dirname, '../../temp/test-naming-conventions.json');
  let manager: NamingConventionManager;

  beforeEach(() => {
    // Clean up test config file
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
    manager = new NamingConventionManager(testConfigPath);
  });

  afterEach(() => {
    // Clean up test config file
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  it('should load default config when no config file exists', () => {
    const config = manager.getConfig();
    expect(config.current).toBe('new');
    expect(config.fallbackEnabled).toBe(true);
    expect(config.conventions.new).toBeDefined();
    expect(config.conventions.old).toBeDefined();
  });

  it('should save and load config correctly', () => {
    const testConfig = {
      conventions: {
        new: {
          name: "Test New Convention",
          description: "Test description",
          sprintDirectory: "test/sprint-3",
          taskFilePattern: "test-task-{number}-*.md",
          taskIdFormat: "test-task-{number}",
          planningFile: "test/sprint-3/planning.md",
          active: true
        },
        old: {
          name: "Test Old Convention",
          description: "Test old description",
          sprintDirectory: "test/iteration-3",
          taskFilePattern: "test-iteration-3-task-{number}-*.md",
          taskIdFormat: "test-iteration-3-task-{number}",
          planningFile: "test/iteration-3/planning.md",
          active: false
        }
      },
      current: "old",
      fallbackEnabled: false,
      autoMigrate: false
    };

    // Save test config
    fs.writeFileSync(testConfigPath, JSON.stringify(testConfig, null, 2));
    
    // Create new manager with test config
    const testManager = new NamingConventionManager(testConfigPath);
    const loadedConfig = testManager.getConfig();
    
    expect(loadedConfig.current).toBe('old');
    expect(loadedConfig.fallbackEnabled).toBe(false);
    expect(loadedConfig.conventions.new.name).toBe("Test New Convention");
  });

  it('should get current convention correctly', () => {
    const current = manager.getCurrentConvention();
    expect(current.name).toBe("New Naming Convention");
    expect(current.sprintDirectory).toBe("sprints/sprint-3");
    expect(current.taskFilePattern).toBe("task-{number}-*.md");
  });

  it('should get specific convention correctly', () => {
    const oldConvention = manager.getConvention('old');
    expect(oldConvention).toBeDefined();
    expect(oldConvention!.name).toBe("Legacy Naming Convention");
    expect(oldConvention!.sprintDirectory).toBe("sprints/iteration-3");
  });

  it('should return null for non-existent convention', () => {
    const nonExistent = manager.getConvention('nonexistent');
    expect(nonExistent).toBeNull();
  });

  it('should switch conventions correctly', () => {
    // Start with new convention
    expect(manager.getCurrentConvention().name).toBe("New Naming Convention");
    
    // Switch to old
    const success = manager.switchConvention('old');
    expect(success).toBe(true);
    expect(manager.getCurrentConvention().name).toBe("Legacy Naming Convention");
    
    // Switch back to new
    const success2 = manager.switchConvention('new');
    expect(success2).toBe(true);
    expect(manager.getCurrentConvention().name).toBe("New Naming Convention");
  });

  it('should return false for invalid convention switch', () => {
    const success = manager.switchConvention('invalid');
    expect(success).toBe(false);
  });

  it('should generate task IDs correctly', () => {
    // Test with new convention
    expect(manager.getTaskId('18')).toBe('task-18');
    
    // Switch to old convention
    manager.switchConvention('old');
    expect(manager.getTaskId('18')).toBe('iteration-3-task-18');
  });

  it('should get sprint directory correctly', () => {
    // Test with new convention
    expect(manager.getSprintDirectory()).toContain('sprints/sprint-3');
    
    // Switch to old convention
    manager.switchConvention('old');
    expect(manager.getSprintDirectory()).toContain('sprints/iteration-3');
  });

  it('should get planning file correctly', () => {
    // Test with new convention
    expect(manager.getPlanningFile()).toContain('sprints/sprint-3/planning.md');
    
    // Switch to old convention
    manager.switchConvention('old');
    expect(manager.getPlanningFile()).toContain('sprints/iteration-3/planning.md');
  });

  it('should get task file pattern correctly', () => {
    // Test with new convention
    expect(manager.getTaskFilePattern('18')).toBe('task-18-*.md');
    
    // Switch to old convention
    manager.switchConvention('old');
    expect(manager.getTaskFilePattern('18')).toBe('iteration-3-task-18-*.md');
  });

  it('should manage fallback settings correctly', () => {
    // Default should be enabled
    expect(manager.isFallbackEnabled()).toBe(true);
    
    // Disable fallback
    manager.setFallbackEnabled(false);
    expect(manager.isFallbackEnabled()).toBe(false);
    
    // Enable fallback
    manager.setFallbackEnabled(true);
    expect(manager.isFallbackEnabled()).toBe(true);
  });

  it('should get all conventions correctly', () => {
    const allConventions = manager.getAllConventions();
    expect(allConventions.new).toBeDefined();
    expect(allConventions.old).toBeDefined();
    expect(allConventions.new.name).toBe("New Naming Convention");
    expect(allConventions.old.name).toBe("Legacy Naming Convention");
  });

  it('should find task files with fallback', () => {
    // Create a mock task file for testing
    const mockTaskPath = path.join(__dirname, '../../sprints/sprint-3/task-18-state-machine.md');
    const originalContent = fs.existsSync(mockTaskPath) ? fs.readFileSync(mockTaskPath, 'utf-8') : null;
    
    if (!fs.existsSync(mockTaskPath)) {
      fs.writeFileSync(mockTaskPath, '# Task 18: Test Task\n\n## Status\n- [ ] Planned\n');
    }

    try {
      // Test finding with new convention
      const foundFile = manager.findTaskFile('18');
      expect(foundFile).toBeDefined();
      expect(foundFile).toContain('task-18-state-machine.md');
      
      // Test with old convention (should still work due to fallback)
      manager.switchConvention('old');
      const foundFileOld = manager.findTaskFile('18');
      // Should still find the file due to fallback
      expect(foundFileOld).toBeDefined();
      
    } finally {
      // Restore original content
      if (originalContent) {
        fs.writeFileSync(mockTaskPath, originalContent);
      } else if (fs.existsSync(mockTaskPath)) {
        fs.unlinkSync(mockTaskPath);
      }
    }
  });

  it('should handle missing task files gracefully', () => {
    const foundFile = manager.findTaskFile('999');
    expect(foundFile).toBeUndefined();
  });
}); 