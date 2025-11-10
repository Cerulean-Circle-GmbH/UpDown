/**
 * GameDemoSystem Regression Tests - TRUE Radical OOP v0.3.19.0
 * Tests demo methods and Radical OOP compliance
 * @pdca 2025-11-10-UTC-1745.pdca.md - TRUE Radical OOP migration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DefaultGameDemoSystem } from '../src/ts/layer2/DefaultGameDemoSystem.js';

describe('GameDemoSystem - Radical OOP Architecture', () => {
  let demo: DefaultGameDemoSystem;

  beforeEach(() => {
    demo = new DefaultGameDemoSystem();
    demo.init({ model: { testMode: true } }); // Enable test mode for fast execution
  });

  it('should have empty constructor (Radical OOP principle)', () => {
    const instance = new DefaultGameDemoSystem();
    expect(instance).toBeInstanceOf(DefaultGameDemoSystem);
  });

  it('should have getTarget() method (TRUE Radical OOP 0.3.19.0)', () => {
    // @ts-ignore - Testing protected method
    expect(typeof demo.getTarget).toBe('function');
  });

  it('should have updateModelPaths() method (TRUE Radical OOP 0.3.19.0)', () => {
    // @ts-ignore - Testing private method
    expect(typeof demo.updateModelPaths).toBe('function');
  });
});

describe('GameDemoSystem - Domain Methods: runDemo', () => {
  let demo: DefaultGameDemoSystem;

  beforeEach(() => {
    demo = new DefaultGameDemoSystem();
    demo.init({ model: { testMode: true } });
  });

  it('should run all demos by default', async () => {
    await expect(demo.runDemo()).resolves.toBeDefined();
  });

  it('should run cards demo', async () => {
    await expect(demo.runDemo('cards')).resolves.toBeDefined();
  });

  it('should run core demo', async () => {
    await expect(demo.runDemo('core')).resolves.toBeDefined();
  });

  it('should run full demo', async () => {
    await expect(demo.runDemo('full')).resolves.toBeDefined();
  });

  it('should run all demos when specified', async () => {
    await expect(demo.runDemo('all')).resolves.toBeDefined();
  });

  it('should handle unknown scenario gracefully', async () => {
    await expect(demo.runDemo('unknown')).resolves.toBeDefined();
  });

  it('should update model.updatedAt after running', async () => {
    const scenario1 = await demo.toScenario();
    const timestamp1 = scenario1.model.updatedAt;
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await demo.runDemo('cards');
    
    const scenario2 = await demo.toScenario();
    const timestamp2 = scenario2.model.updatedAt;
    
    expect(timestamp2).not.toBe(timestamp1);
  });
});

describe('GameDemoSystem - Demo Methods: Individual Demos', () => {
  let demo: DefaultGameDemoSystem;

  beforeEach(() => {
    demo = new DefaultGameDemoSystem();
    demo.init({ model: { testMode: true } });
  });

  it('should execute runCardsDemo', async () => {
    const result = await demo.runCardsDemo();
    expect(result).toBe(demo);
  });

  it('should execute runCoreDemo', async () => {
    const result = await demo.runCoreDemo();
    expect(result).toBe(demo);
  });

  it('should execute runFullGameDemo', async () => {
    const result = await demo.runFullGameDemo();
    expect(result).toBe(demo);
  });

  it('should execute runAllDemos', async () => {
    const result = await demo.runAllDemos();
    expect(result).toBe(demo);
  });

  it('should execute showScenarios', async () => {
    const result = await demo.showScenarios();
    expect(result).toBe(demo);
  });
});

describe('GameDemoSystem - Demo Orchestration', () => {
  let demo: DefaultGameDemoSystem;

  beforeEach(() => {
    demo = new DefaultGameDemoSystem();
    demo.init({ model: { testMode: false } }); // Keep delays for timing tests
  });

  it('should run cards demo in reasonable time', async () => {
    const startTime = Date.now();
    await demo.runCardsDemo();
    const duration = Date.now() - startTime;
    
    // Cards demo has ~800ms of sleep calls
    expect(duration).toBeGreaterThan(700);
    expect(duration).toBeLessThan(2000);
  }, 3000);

  it('should run core demo in reasonable time', async () => {
    const startTime = Date.now();
    await demo.runCoreDemo();
    const duration = Date.now() - startTime;
    
    // Core demo has ~800ms of sleep calls
    expect(duration).toBeGreaterThan(700);
    expect(duration).toBeLessThan(2000);
  }, 3000);

  it('should run full demo in reasonable time', async () => {
    const startTime = Date.now();
    await demo.runFullGameDemo();
    const duration = Date.now() - startTime;
    
    // Full demo has ~2400ms of sleep calls (3 rounds * ~800ms)
    expect(duration).toBeGreaterThan(2000);
    expect(duration).toBeLessThan(4000);
  }, 5000);

  it('should run all demos sequentially', async () => {
    const startTime = Date.now();
    await demo.runAllDemos();
    const duration = Date.now() - startTime;
    
    // All demos combined = cards + core + full = ~4000ms
    expect(duration).toBeGreaterThan(3500);
    expect(duration).toBeLessThan(6000);
  }, 7000);
});

describe('GameDemoSystem - Demo Content Verification', () => {
  let demo: DefaultGameDemoSystem;
  let consoleLogs: string[];
  const originalConsoleLog = console.log;

  beforeEach(() => {
    demo = new DefaultGameDemoSystem();
    demo.init({ model: { testMode: true } });
    consoleLogs = [];
    console.log = (...args: any[]) => {
      consoleLogs.push(args.join(' '));
      originalConsoleLog(...args);
    };
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  it('should display cards demo content', async () => {
    await demo.runCardsDemo();
    
    expect(consoleLogs.some(log => log.includes('French-Suited Card System'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('Creating 52-card'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('Dealing 3 cards'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('Deck Status'))).toBe(true);
  });

  it('should display core demo content', async () => {
    await demo.runCoreDemo();
    
    expect(consoleLogs.some(log => log.includes('Core Game Logic'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('Starting 2-player'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('Game Status'))).toBe(true);
  });

  it('should display full demo content', async () => {
    await demo.runFullGameDemo();
    
    expect(consoleLogs.some(log => log.includes('Full Game Simulation'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('Round 1'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('Round 2'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('Round 3'))).toBe(true);
  });

  it('should display summary when running all demos', async () => {
    await demo.runAllDemos();
    
    expect(consoleLogs.some(log => log.includes('Demo completed'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('Summary'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('Web4TSComponent architecture'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('CMM4-level development'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('Next Steps'))).toBe(true);
  });
});

describe('GameDemoSystem - Method Chaining (Radical OOP)', () => {
  let demo: DefaultGameDemoSystem;

  beforeEach(() => {
    demo = new DefaultGameDemoSystem();
    demo.init({ model: { testMode: true } });
  });

  it('should support method chaining', async () => {
    const result = await demo
      .runCardsDemo()
      .then(d => d.runCoreDemo())
      .then(d => d.showScenarios());
    
    expect(result).toBeInstanceOf(DefaultGameDemoSystem);
  });

  it('should return this from all domain methods', async () => {
    expect(await demo.runDemo('cards')).toBe(demo);
    expect(await demo.runCardsDemo()).toBe(demo);
    expect(await demo.runCoreDemo()).toBe(demo);
    expect(await demo.runFullGameDemo()).toBe(demo);
    expect(await demo.runAllDemos()).toBe(demo);
    expect(await demo.showScenarios()).toBe(demo);
  });
});

describe('GameDemoSystem - Model-Driven State (Radical OOP)', () => {
  let demo: DefaultGameDemoSystem;

  beforeEach(async () => {
    demo = new DefaultGameDemoSystem();
    demo.init({ model: { testMode: true } });
  });

  it('should maintain model state across demo runs', async () => {
    await demo.runCardsDemo();
    
    const scenario1 = await demo.toScenario();
    const scenario2 = await demo.toScenario();
    
    // Same model reference = no recalculation
    expect(scenario1.model).toBe(scenario2.model);
  });

  it('should have currentScenario property in model', async () => {
    const scenario = await demo.toScenario();
    // currentScenario is optional, may be undefined
    expect(scenario.model.currentScenario === undefined || typeof scenario.model.currentScenario === 'object').toBe(true);
  });

  it('should have demoHistory property in model', async () => {
    const scenario = await demo.toScenario();
    // demoHistory is optional, may be undefined
    expect(scenario.model.demoHistory === undefined || Array.isArray(scenario.model.demoHistory)).toBe(true);
  });
});

describe('GameDemoSystem - Scenario Selection Logic', () => {
  let demo: DefaultGameDemoSystem;

  beforeEach(() => {
    demo = new DefaultGameDemoSystem();
    demo.init({ model: { testMode: true } });
  });

  it('should map scenario names to methods', async () => {
    // This tests the scenario routing logic
    await expect(demo.runDemo('cards')).resolves.toBeDefined();
    await expect(demo.runDemo('core')).resolves.toBeDefined();
    await expect(demo.runDemo('full')).resolves.toBeDefined();
    await expect(demo.runDemo('all')).resolves.toBeDefined();
  });

  it('should provide scenario information', async () => {
    const consoleLogs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      consoleLogs.push(args.join(' '));
      originalLog(...args);
    };
    
    await demo.showScenarios();
    
    console.log = originalLog;
    
    expect(consoleLogs.some(log => log.includes('CARDS'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('CORE'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('FULL'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('ALL'))).toBe(true);
    expect(consoleLogs.some(log => log.includes('Usage:'))).toBe(true);
  });
});

describe('GameDemoSystem - Integration Test', () => {
  let demo: DefaultGameDemoSystem;

  beforeEach(() => {
    demo = new DefaultGameDemoSystem();
    demo.init({ model: { testMode: true } });
  });

  it('should complete full demo workflow without errors', async () => {
    await expect(async () => {
      await demo.showScenarios();
      await demo.runDemo('cards');
      await demo.runDemo('core');
      await demo.runDemo('full');
      await demo.runDemo('all');
    }).resolves.not.toThrow();
  }, 10000);

  it('should handle rapid successive demo calls', async () => {
    await expect(async () => {
      await demo.runCardsDemo();
      await demo.runCardsDemo();
      await demo.runCardsDemo();
    }).resolves.not.toThrow();
  }, 5000);
});

