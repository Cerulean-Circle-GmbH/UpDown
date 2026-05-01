/**
 * T-P1: @web4x/persistence — Export Verification
 * Verifies UcpStorage and BrowserScenarioStorage compile and export correctly
 */
import { describe, it, expect } from 'vitest';

describe('Persistence: UcpStorage exports', () => {

  it('UcpStorage can be imported from dist', async () => {
    const mod = await import('../dist/ts/layer2/UcpStorage.js');
    expect(mod.UcpStorage).toBeDefined();
    expect(typeof mod.UcpStorage).toBe('function');
  });

  it('UcpStorage extends Storage (is a class)', async () => {
    const mod = await import('../dist/ts/layer2/UcpStorage.js');
    const instance = new mod.UcpStorage();
    expect(instance).toBeDefined();
    expect(typeof instance.init).toBe('function');
  });

  it('UcpStorage has scenarioSave method (PersistenceManager)', async () => {
    const mod = await import('../dist/ts/layer2/UcpStorage.js');
    const instance = new mod.UcpStorage();
    expect(typeof instance.scenarioSave).toBe('function');
  });

  it('UcpStorage has scenarioLoad method (PersistenceManager)', async () => {
    const mod = await import('../dist/ts/layer2/UcpStorage.js');
    const instance = new mod.UcpStorage();
    expect(typeof instance.scenarioLoad).toBe('function');
  });
});

describe('Persistence: BrowserScenarioStorage exports', () => {

  it('BrowserScenarioStorage can be imported from dist', async () => {
    const mod = await import('../dist/ts/layer2/BrowserScenarioStorage.js');
    expect(mod.BrowserScenarioStorage).toBeDefined();
    expect(typeof mod.BrowserScenarioStorage).toBe('function');
  });
});

describe('Persistence: Layer 3 interfaces re-export', () => {

  it('PersistenceManager interface exports', async () => {
    const mod = await import('../dist/ts/layer3/PersistenceManager.interface.js');
    expect(mod.PersistenceManager).toBeDefined();
  });

  it('Storage interface exports', async () => {
    const mod = await import('../dist/ts/layer3/Storage.interface.js');
    expect(mod.Storage).toBeDefined();
  });

  it('StorageScenario interface exports', async () => {
    const mod = await import('../dist/ts/layer3/StorageScenario.interface.js');
    expect(mod).toBeDefined();
  });
});
