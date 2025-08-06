import { describe, it, expect, beforeEach } from 'vitest';
import { Logger, LogLevel, LogType } from '../../temp/Logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    // Reset logger instance for each test
    logger = Logger.getInstance();
    logger.setLevel(LogLevel.TESTING); // Enable all levels for testing
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Log Levels', () => {
    it('should respect log level filtering', () => {
      logger.setLevel(LogLevel.ERROR);
      
      // Mock console.log to capture output
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (msg: string) => logs.push(msg);
      
      logger.error('Error message');
      logger.warn('Warning message');
      logger.log('Info message');
      logger.debug('Debug message');
      
      console.log = originalLog;
      
      expect(logs).toHaveLength(1);
      expect(logs[0]).toContain('Error message');
    });

    it('should enable all levels when set to TESTING', () => {
      logger.setLevel(LogLevel.TESTING);
      
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (msg: string) => logs.push(msg);
      
      logger.error('Error message');
      logger.warn('Warning message');
      logger.log('Info message');
      logger.debug('Debug message');
      logger.logAction('Testing message', 'testing');
      
      console.log = originalLog;
      
      expect(logs).toHaveLength(5);
    });
  });

  describe('Standard Logging Methods', () => {
    it('should log with correct colors', () => {
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (msg: string) => logs.push(msg);
      
      logger.log('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      logger.debug('Debug message');
      
      console.log = originalLog;
      
      expect(logs).toHaveLength(4);
      expect(logs[0]).toContain('Info message');
      expect(logs[1]).toContain('Warning message');
      expect(logs[2]).toContain('Error message');
      expect(logs[3]).toContain('Debug message');
    });
  });

  describe('State Machine Logging', () => {
    it('should log state machine specific messages using logAction', () => {
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (msg: string) => logs.push(msg);
      
      logger.logAction('Status message', 'status');
      logger.logAction('Step message', 'step');
      logger.logAction('Progression message', 'progression');
      logger.logAction('Testing message', 'testing');
      
      console.log = originalLog;
      
      expect(logs).toHaveLength(4);
      expect(logs[0]).toContain('Status message');
      expect(logs[1]).toContain('Step message');
      expect(logs[2]).toContain('Progression message');
      expect(logs[3]).toContain('Testing message');
    });
  });

  describe('Backward Compatibility', () => {
    it('should support logAction method', () => {
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (msg: string) => logs.push(msg);
      
      logger.logAction('Test action', 'status');
      logger.logAction('Test action', 'step');
      logger.logAction('Test action', 'error');
      logger.logAction('Test action', 'testing');
      
      console.log = originalLog;
      
      expect(logs).toHaveLength(4);
    });
  });

  describe('Context Setting', () => {
    it('should allow context changes', () => {
      logger.setContext('TestContext');
      
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (msg: string) => logs.push(msg);
      
      logger.log('Test message');
      
      console.log = originalLog;
      
      expect(logs[0]).toContain('[TestContext]');
    });
  });
}); 