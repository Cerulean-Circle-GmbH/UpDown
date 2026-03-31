/**
 * T1: UcpComponent Lifecycle Tests
 * Verifies: empty constructor, init(), model access, toScenario(), requireInitialized()
 */
import { describe, it, expect } from 'vitest';
import { UcpComponent } from '../src/ts/layer2/UcpComponent.js';
import type { Model } from '../src/ts/layer3/Model.interface.js';
import type { Scenario } from '../src/ts/layer3/Scenario.interface.js';
import { LifecycleState } from '../src/ts/layer3/LifecycleState.enum.js';

// Concrete subclass for testing (UcpComponent is abstract)
interface TestModel extends Model {
  uuid: string;
  name: string;
  count: number;
}

class TestComponent extends UcpComponent<TestModel> {
  scenarioDefault(): Scenario<TestModel> {
    const base = super.scenarioDefault();
    base.model = { uuid: base.ior.uuid, name: 'test', count: 0 };
    return base;
  }
}

describe('T1: UcpComponent Lifecycle', () => {

  it('can be created with empty constructor', () => {
    const comp = new TestComponent();
    expect(comp).toBeDefined();
    expect(comp).toBeInstanceOf(UcpComponent);
  });

  it('model getter returns null before init()', () => {
    const comp = new TestComponent();
    expect(comp.model).toBeNull();
  });

  it('hasModel returns false before init, true after', () => {
    const comp = new TestComponent();
    expect(comp.hasModel).toBe(false);
    comp.init();
    expect(comp.hasModel).toBe(true);
  });

  it('init() with no scenario uses scenarioDefault()', () => {
    const comp = new TestComponent();
    comp.init();
    expect(comp.model).toBeDefined();
    expect(comp.model.name).toBe('test');
    expect(comp.model.count).toBe(0);
  });

  it('init() with scenario stores ior, owner, model', () => {
    const comp = new TestComponent();
    const scenario: Scenario<TestModel> = {
      ior: { uuid: 'test-uuid-123', component: 'TestComponent', version: '1.0.0.0' },
      owner: 'test-owner',
      model: { uuid: 'test-uuid-123', name: 'custom', count: 42 }
    };
    comp.init(scenario);
    expect(comp.model.name).toBe('custom');
    expect(comp.model.count).toBe(42);
    expect(comp.ior.uuid).toBe('test-uuid-123');
    expect(comp.owner).toBe('test-owner');
  });

  it('init() sets instanceState to INITIALIZED', () => {
    const comp = new TestComponent();
    comp.init();
    expect(comp.instanceState).toBe(LifecycleState.INITIALIZED);
  });

  it('init() called twice merges scenario.model (idempotent)', () => {
    const comp = new TestComponent();
    comp.init();
    expect(comp.model.count).toBe(0);
    comp.init({ ior: comp.ior, owner: comp.owner, model: { uuid: comp.ior.uuid, name: 'merged', count: 99 } });
    expect(comp.model.name).toBe('merged');
    expect(comp.model.count).toBe(99);
  });

  it('model getter returns proxied model after init()', () => {
    const comp = new TestComponent();
    comp.init();
    // Setting a value should work (proxy allows it)
    comp.model.count = 10;
    expect(comp.model.count).toBe(10);
  });

  it('toScenario() returns { ior, owner, model }', () => {
    const comp = new TestComponent();
    comp.init();
    const scenario = comp.toScenario();
    expect(scenario).toHaveProperty('ior');
    expect(scenario).toHaveProperty('owner');
    expect(scenario).toHaveProperty('model');
    expect(scenario.ior.uuid).toBeDefined();
    expect(scenario.ior.component).toBe('TestComponent');
    expect(scenario.model.name).toBe('test');
  });

  it('requireInitialized() throws before init(), passes after', () => {
    const comp = new TestComponent();
    // Access protected method via cast
    expect(() => (comp as any).requireInitialized()).toThrow('not initialized');
    comp.init();
    expect(() => (comp as any).requireInitialized()).not.toThrow();
  });
});
