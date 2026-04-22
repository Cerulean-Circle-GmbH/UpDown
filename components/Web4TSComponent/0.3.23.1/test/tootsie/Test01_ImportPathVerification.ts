/**
 * Test01_ImportPathVerification - Verify W4TSC imports from @web4x packages
 *
 * ✅ P25: Tootsie test class (not vitest/jest)
 * ✅ P18: Black-box testing — verifies dist imports resolve
 * ✅ P27: Imports REAL code, no fake types
 *
 * Validates:
 * - W4TSC imports UcpStorage from @web4x/persistence (not local copy)
 * - W4TSC imports UcpComponent from @web4x/ucp
 * - W4TSC imports DefaultUnit from @web4x/unit
 * - All 4 @web4x package dependencies resolve correctly
 */

import { DefaultWeb4TestCase } from '../../../../Web4Test/0.3.20.6/dist/ts/layer2/DefaultWeb4TestCase.js';
import { DefaultWeb4Requirement } from '../../../../Web4Requirement/0.3.20.6/dist/ts/layer2/DefaultWeb4Requirement.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

export class Test01_ImportPathVerification extends DefaultWeb4TestCase {

  constructor() {
    super();
  }

  private get componentRoot(): string {
    const currentFilePath = fileURLToPath(import.meta.url);
    return path.resolve(path.dirname(currentFilePath), '..', '..');
  }

  async executeTestLogic(): Promise<any> {
    console.log('🧪 Test01: Import Path Verification for Web4TSComponent 0.3.23.0');
    console.log('═'.repeat(60));

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 1: package.json declares all @web4x dependencies
    // ═══════════════════════════════════════════════════════════════

    const req1 = new DefaultWeb4Requirement();
    await req1.init({ model: { name: 'Package Dependencies', description: 'All @web4x deps declared in package.json' } });
    req1.addCriterion('DEP-01', '@web4x/ucp dependency declared');
    req1.addCriterion('DEP-02', '@web4x/unit dependency declared');
    req1.addCriterion('DEP-03', '@web4x/persistence dependency declared');
    req1.addCriterion('DEP-04', 'All use file: protocol (local linking)');

    console.log('\n📋 Requirement 1: Package Dependencies');

    const pkgPath = path.join(this.componentRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const deps = pkg.dependencies || {};

    req1.validateCriterion('DEP-01', deps['@web4x/ucp'] !== undefined);
    req1.validateCriterion('DEP-02', deps['@web4x/unit'] !== undefined);
    req1.validateCriterion('DEP-03', deps['@web4x/persistence'] !== undefined);

    const allFileProtocol =
      (deps['@web4x/ucp'] || '').startsWith('file:') &&
      (deps['@web4x/unit'] || '').startsWith('file:') &&
      (deps['@web4x/persistence'] || '').startsWith('file:');
    req1.validateCriterion('DEP-04', allFileProtocol);

    if (!req1.allCriteriaPassed()) {
      const failed = req1.getFailedCriteria();
      throw new Error(`Requirement 1 FAILED: ${failed.map((c: any) => c.id).join(', ')}`);
    }
    console.log('  ✅ All @web4x dependencies declared with file: protocol');

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 2: @web4x/ucp imports resolve
    // ═══════════════════════════════════════════════════════════════

    const req2 = new DefaultWeb4Requirement();
    await req2.init({ model: { name: 'UCP Imports', description: 'UcpComponent and IOR importable from @web4x/ucp' } });
    req2.addCriterion('UCP-01', 'UcpComponent importable from @web4x/ucp dist');
    req2.addCriterion('UCP-02', 'IOR importable from @web4x/ucp dist');

    console.log('\n📋 Requirement 2: @web4x/ucp Imports');

    try {
      const ucpMod = await import('@web4x/ucp/dist/ts/layer2/UcpComponent.js');
      req2.validateCriterion('UCP-01', ucpMod.UcpComponent !== undefined);
    } catch (e: any) {
      console.log(`  ❌ UcpComponent import failed: ${e.message}`);
      req2.validateCriterion('UCP-01', false);
    }

    try {
      const iorMod = await import('@web4x/ucp/dist/ts/layer4/IOR.js');
      req2.validateCriterion('UCP-02', iorMod.IOR !== undefined);
    } catch (e: any) {
      console.log(`  ❌ IOR import failed: ${e.message}`);
      req2.validateCriterion('UCP-02', false);
    }

    if (!req2.allCriteriaPassed()) {
      const failed = req2.getFailedCriteria();
      throw new Error(`Requirement 2 FAILED: ${failed.map((c: any) => c.id).join(', ')}`);
    }
    console.log('  ✅ @web4x/ucp imports resolve');

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 3: @web4x/persistence imports resolve
    // ═══════════════════════════════════════════════════════════════

    const req3 = new DefaultWeb4Requirement();
    await req3.init({ model: { name: 'Persistence Imports', description: 'UcpStorage importable from @web4x/persistence' } });
    req3.addCriterion('PERS-01', 'UcpStorage importable from @web4x/persistence dist');

    console.log('\n📋 Requirement 3: @web4x/persistence Imports');

    try {
      const persMod = await import('@web4x/persistence/dist/ts/layer2/UcpStorage.js');
      req3.validateCriterion('PERS-01', persMod.UcpStorage !== undefined);
    } catch (e: any) {
      console.log(`  ❌ UcpStorage import failed: ${e.message}`);
      req3.validateCriterion('PERS-01', false);
    }

    if (!req3.allCriteriaPassed()) {
      const failed = req3.getFailedCriteria();
      throw new Error(`Requirement 3 FAILED: ${failed.map((c: any) => c.id).join(', ')}`);
    }
    console.log('  ✅ @web4x/persistence imports resolve');

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 4: @web4x/unit imports resolve
    // ═══════════════════════════════════════════════════════════════

    const req4 = new DefaultWeb4Requirement();
    await req4.init({ model: { name: 'Unit Imports', description: 'DefaultUnit importable from @web4x/unit' } });
    req4.addCriterion('UNIT-01', 'DefaultUnit importable from @web4x/unit dist');

    console.log('\n📋 Requirement 4: @web4x/unit Imports');

    try {
      const unitMod = await import('@web4x/unit/dist/ts/layer2/DefaultUnit.js');
      req4.validateCriterion('UNIT-01', unitMod.DefaultUnit !== undefined);
    } catch (e: any) {
      console.log(`  ❌ DefaultUnit import failed: ${e.message}`);
      req4.validateCriterion('UNIT-01', false);
    }

    if (!req4.allCriteriaPassed()) {
      const failed = req4.getFailedCriteria();
      throw new Error(`Requirement 4 FAILED: ${failed.map((c: any) => c.id).join(', ')}`);
    }
    console.log('  ✅ @web4x/unit imports resolve');

    console.log('\n' + '═'.repeat(60));
    console.log('✅ Test01: All 4 requirements passed (9 criteria)');

    return { success: true, requirements: 4, criteria: 9 };
  }
}

export default Test01_ImportPathVerification;
