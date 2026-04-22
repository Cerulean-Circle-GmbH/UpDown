/**
 * Test01_PersistenceExports - Verify @web4x/persistence exports
 *
 * ✅ P25: Tootsie test class (not vitest/jest)
 * ✅ P18: Black-box testing — imports from dist only
 * ✅ P27: Imports REAL code, no fake types
 * ✅ Radical OOP: Web4Requirement for acceptance criteria
 *
 * Validates:
 * - UcpStorage class exports from dist
 * - BrowserScenarioStorage class exports from dist
 * - PersistenceManager interface exports
 * - Storage interface exports
 * - UcpStorage has scenarioSave/scenarioLoad methods
 */

import { DefaultWeb4TestCase } from '../../../../Web4Test/0.3.20.6/dist/ts/layer2/DefaultWeb4TestCase.js';
import { DefaultWeb4Requirement } from '../../../../Web4Requirement/0.3.20.6/dist/ts/layer2/DefaultWeb4Requirement.js';

export class Test01_PersistenceExports extends DefaultWeb4TestCase {

  constructor() {
    super();
  }

  async executeTestLogic(): Promise<any> {
    console.log('🧪 Test01: @web4x/persistence Export Verification');
    console.log('═'.repeat(50));

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 1: UcpStorage exports and is a class
    // ═══════════════════════════════════════════════════════════════

    const req1 = new DefaultWeb4Requirement();
    await req1.init({ model: { name: 'UcpStorage Exports', description: 'UcpStorage class is importable and instantiable', uuid: crypto.randomUUID(), acceptanceCriteria: [] } });
    req1.addCriterion('EXPORT-01', 'UcpStorage can be imported from dist');
    req1.addCriterion('EXPORT-02', 'UcpStorage is a constructor function');
    req1.addCriterion('EXPORT-03', 'UcpStorage instance has scenarioSave method');
    req1.addCriterion('EXPORT-04', 'UcpStorage instance has scenarioLoad method');
    req1.addCriterion('EXPORT-05', 'UcpStorage instance has init method');

    console.log('\n📋 Requirement 1: UcpStorage Exports');

    const ucpStorageMod = await import('../../dist/ts/layer2/UcpStorage.js');
    req1.validateCriterion('EXPORT-01', ucpStorageMod.UcpStorage !== undefined);

    const UcpStorageClass = ucpStorageMod.UcpStorage;
    req1.validateCriterion('EXPORT-02', typeof UcpStorageClass === 'function');

    const instance = new UcpStorageClass();
    req1.validateCriterion('EXPORT-03', typeof instance.scenarioSave === 'function');
    req1.validateCriterion('EXPORT-04', typeof instance.scenarioLoad === 'function');
    req1.validateCriterion('EXPORT-05', typeof instance.init === 'function');

    if (!req1.allCriteriaPassed()) {
      throw new Error(`Requirement 1 FAILED: ${req1.getFailedCriteria().map((c: any) => c.id).join(', ')}`);
    }
    console.log('  ✅ UcpStorage: all exports verified');

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 2: BrowserScenarioStorage exports
    // ═══════════════════════════════════════════════════════════════

    const req2 = new DefaultWeb4Requirement();
    await req2.init({ model: { name: 'BrowserScenarioStorage Exports', description: 'BrowserScenarioStorage class is importable', uuid: crypto.randomUUID(), acceptanceCriteria: [] } });
    req2.addCriterion('BROWSER-01', 'BrowserScenarioStorage can be imported from dist');
    req2.addCriterion('BROWSER-02', 'BrowserScenarioStorage is a constructor function');

    console.log('\n📋 Requirement 2: BrowserScenarioStorage Exports');

    const browserMod = await import('../../dist/ts/layer2/BrowserScenarioStorage.js');
    req2.validateCriterion('BROWSER-01', browserMod.BrowserScenarioStorage !== undefined);
    req2.validateCriterion('BROWSER-02', typeof browserMod.BrowserScenarioStorage === 'function');

    if (!req2.allCriteriaPassed()) {
      throw new Error(`Requirement 2 FAILED: ${req2.getFailedCriteria().map((c: any) => c.id).join(', ')}`);
    }
    console.log('  ✅ BrowserScenarioStorage: export verified');

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 3: Layer 3 interfaces export
    // ═══════════════════════════════════════════════════════════════

    const req3 = new DefaultWeb4Requirement();
    await req3.init({ model: { name: 'Interface Exports', description: 'Layer 3 interfaces export correctly', uuid: crypto.randomUUID(), acceptanceCriteria: [] } });
    req3.addCriterion('IFACE-01', 'PersistenceManager exports from dist');
    req3.addCriterion('IFACE-02', 'Storage exports from dist');

    console.log('\n📋 Requirement 3: Interface Exports');

    const pmMod = await import('../../dist/ts/layer3/PersistenceManager.interface.js');
    req3.validateCriterion('IFACE-01', pmMod.PersistenceManager !== undefined);

    const storageMod = await import('../../dist/ts/layer3/Storage.interface.js');
    req3.validateCriterion('IFACE-02', storageMod.Storage !== undefined);

    if (!req3.allCriteriaPassed()) {
      throw new Error(`Requirement 3 FAILED: ${req3.getFailedCriteria().map((c: any) => c.id).join(', ')}`);
    }
    console.log('  ✅ Interfaces: all exports verified');

    console.log('\n' + '═'.repeat(50));
    console.log('✅ Test01: All requirements passed');

    return { success: true, requirements: 3, criteria: 9 };
  }
}

export default Test01_PersistenceExports;
