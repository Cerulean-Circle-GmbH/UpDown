/**
 * Test21_RelatedObjectsWithJsInterface - Test RelatedObjects with real JsInterface infrastructure
 * 
 * ✅ Web4 Principle 25: Tootsie Tests Only
 * ✅ Web4 Principle 24: RelatedObjects Registry
 * ✅ Uses real JsInterface classes, not dummy test classes
 * 
 * Verifies that UcpController RelatedObjects registry works with:
 * - PersistenceManager (abstract JsInterface class)
 * - UcpStorage (concrete implementation)
 * - JsInterface.implementationRegister() tracking
 * 
 * Note: Lit-based views cannot be tested in tsx environment (decorator issues).
 * View testing is covered by browser-based tests (Test02, Test07).
 * 
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { UcpController } from '../../src/ts/layer2/UcpController.js';
import { UcpStorage } from '../../src/ts/layer2/UcpStorage.js';
import { PersistenceManager } from '../../src/ts/layer3/PersistenceManager.interface.js';
import { JsInterface } from '../../src/ts/layer3/JsInterface.js';
import type { Reference } from '../../src/ts/layer3/Reference.interface.js';

/**
 * Test model
 */
interface Test21Model {
  controller: UcpController<any> | null;
  storage1: UcpStorage | null;
  storage2: UcpStorage | null;
}

/**
 * Test21_RelatedObjectsWithJsInterface
 */
export class Test21_RelatedObjectsWithJsInterface extends ONCETestCase {
  
  testModel: Test21Model = {
    controller: null,
    storage1: null,
    storage2: null,
  };
  
  protected async executeTestLogic(): Promise<void> {
    this.logEvidence('input', 'RelatedObjects with JsInterface infrastructure', {
      testedClasses: ['UcpController', 'PersistenceManager', 'UcpStorage', 'JsInterface'],
      principle: 'Web4 Principle 24 + JsInterface'
    });

    // Initialize controller
    this.testModel.controller = new UcpController<any>();
    this.testModel.controller.init({ uuid: 'test-controller' });

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 1: PersistenceManager is a JsInterface
    // ═══════════════════════════════════════════════════════════════
    
    const jsIntReq = this.requirement(
      'PersistenceManager is JsInterface',
      'PersistenceManager extends JsInterface abstract class'
    );
    
    jsIntReq.addCriterion('JS-01', 'PersistenceManager is a class (not Symbol)');
    jsIntReq.addCriterion('JS-02', 'PersistenceManager extends JsInterface');
    jsIntReq.addCriterion('JS-03', 'PersistenceManager has static type property');
    jsIntReq.addCriterion('JS-04', 'PersistenceManager has implementationRegister method');
    
    this.logEvidence('step', 'Testing PersistenceManager is JsInterface');
    
    // JS-01: Is a class
    const isClass = typeof PersistenceManager === 'function';
    jsIntReq.validateCriterion('JS-01', isClass, {
      typeOf: typeof PersistenceManager,
      isClass,
    });
    
    // JS-02: Extends JsInterface (check prototype chain)
    const extendsJsInterface = this.prototypeChainIncludes(PersistenceManager, JsInterface);
    jsIntReq.validateCriterion('JS-02', extendsJsInterface, {
      extendsJsInterface,
    });
    
    // JS-03: Has static type property
    const hasType = 'type' in PersistenceManager;
    jsIntReq.validateCriterion('JS-03', hasType, {
      hasType,
    });
    
    // JS-04: Has implementationRegister method
    const hasRegister = typeof PersistenceManager.implementationRegister === 'function';
    jsIntReq.validateCriterion('JS-04', hasRegister, {
      hasRegister,
    });
    
    this.validateRequirement(jsIntReq);

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 2: Register UcpStorage under PersistenceManager
    // ═══════════════════════════════════════════════════════════════
    
    const regReq = this.requirement(
      'Register via Abstract Class Key',
      'UcpStorage can be registered under abstract PersistenceManager'
    );
    
    regReq.addCriterion('REG-01', 'Empty lookup before registration');
    regReq.addCriterion('REG-02', 'Register UcpStorage under PersistenceManager');
    regReq.addCriterion('REG-03', 'Lookup returns UcpStorage instance');
    regReq.addCriterion('REG-04', 'LookupFirst returns Reference<PersistenceManager>');
    
    this.logEvidence('step', 'Testing registration with abstract class key');
    
    // REG-01: Empty lookup
    const emptyLookup = this.testModel.controller.relatedObjectLookup(PersistenceManager);
    regReq.validateCriterion('REG-01', emptyLookup.length === 0, {
      count: emptyLookup.length,
    });
    
    // REG-02: Create and register UcpStorage
    this.testModel.storage1 = new UcpStorage();
    this.testModel.storage1.init({
      ior: { uuid: 'storage-1', component: 'ONCE', version: '0.3.21.8' },
      owner: 'Test21',
      model: {
        uuid: 'storage-1',
        projectRoot: this.componentRoot,
        indexBaseDir: 'scenarios/index',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    
    this.testModel.controller.relatedObjectRegister(PersistenceManager, this.testModel.storage1);
    regReq.validateCriterion('REG-02', true, { registered: true });
    
    // REG-03: Lookup returns storage
    const lookup1 = this.testModel.controller.relatedObjectLookup(PersistenceManager);
    const found = lookup1.length === 1 && lookup1[0] === this.testModel.storage1;
    regReq.validateCriterion('REG-03', found, {
      count: lookup1.length,
      match: lookup1[0] === this.testModel.storage1,
    });
    
    // REG-04: LookupFirst
    const first: Reference<PersistenceManager> = this.testModel.controller.relatedObjectLookupFirst(PersistenceManager);
    regReq.validateCriterion('REG-04', first === this.testModel.storage1, {
      match: first === this.testModel.storage1,
    });
    
    this.validateRequirement(regReq);

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 3: Multiple Instances
    // ═══════════════════════════════════════════════════════════════
    
    const multiReq = this.requirement(
      'Multiple PersistenceManager Instances',
      'Multiple UcpStorage instances can be registered'
    );
    
    multiReq.addCriterion('MULTI-01', 'Register second UcpStorage');
    multiReq.addCriterion('MULTI-02', 'Lookup returns both instances');
    multiReq.addCriterion('MULTI-03', 'LookupFirst still returns first');
    
    this.logEvidence('step', 'Testing multiple instances');
    
    // MULTI-01: Register second
    this.testModel.storage2 = new UcpStorage();
    this.testModel.storage2.init({
      ior: { uuid: 'storage-2', component: 'ONCE', version: '0.3.21.8' },
      owner: 'Test21',
      model: {
        uuid: 'storage-2',
        projectRoot: this.componentRoot,
        indexBaseDir: 'scenarios/index',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    
    this.testModel.controller.relatedObjectRegister(PersistenceManager, this.testModel.storage2);
    multiReq.validateCriterion('MULTI-01', true, { registered: true });
    
    // MULTI-02: Both in lookup
    const lookup2 = this.testModel.controller.relatedObjectLookup(PersistenceManager);
    const hasBoth = this.itemInArray(lookup2, this.testModel.storage1) && 
                    this.itemInArray(lookup2, this.testModel.storage2);
    multiReq.validateCriterion('MULTI-02', lookup2.length === 2 && hasBoth, {
      count: lookup2.length,
      hasFirst: this.itemInArray(lookup2, this.testModel.storage1),
      hasSecond: this.itemInArray(lookup2, this.testModel.storage2),
    });
    
    // MULTI-03: First is still first
    const stillFirst = this.testModel.controller.relatedObjectLookupFirst(PersistenceManager);
    multiReq.validateCriterion('MULTI-03', stillFirst === this.testModel.storage1, {
      match: stillFirst === this.testModel.storage1,
    });
    
    this.validateRequirement(multiReq);

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 4: Unregister
    // ═══════════════════════════════════════════════════════════════
    
    const unregReq = this.requirement(
      'Unregister',
      'UcpStorage can be unregistered'
    );
    
    unregReq.addCriterion('UNREG-01', 'Unregister first storage');
    unregReq.addCriterion('UNREG-02', 'First no longer in lookup');
    unregReq.addCriterion('UNREG-03', 'Second still in lookup');
    unregReq.addCriterion('UNREG-04', 'LookupFirst now returns second');
    
    this.logEvidence('step', 'Testing unregister');
    
    // UNREG-01: Unregister
    this.testModel.controller.relatedObjectUnregister(this.testModel.storage1);
    unregReq.validateCriterion('UNREG-01', true, { unregistered: true });
    
    // UNREG-02: First gone
    const afterUnreg = this.testModel.controller.relatedObjectLookup(PersistenceManager);
    unregReq.validateCriterion('UNREG-02', !this.itemInArray(afterUnreg, this.testModel.storage1), {
      found: this.itemInArray(afterUnreg, this.testModel.storage1),
    });
    
    // UNREG-03: Second still there
    unregReq.validateCriterion('UNREG-03', this.itemInArray(afterUnreg, this.testModel.storage2), {
      found: this.itemInArray(afterUnreg, this.testModel.storage2),
    });
    
    // UNREG-04: LookupFirst returns second
    const newFirst = this.testModel.controller.relatedObjectLookupFirst(PersistenceManager);
    unregReq.validateCriterion('UNREG-04', newFirst === this.testModel.storage2, {
      match: newFirst === this.testModel.storage2,
    });
    
    this.validateRequirement(unregReq);

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 5: JsInterface.implementationRegister
    // ═══════════════════════════════════════════════════════════════
    
    const implReq = this.requirement(
      'JsInterface Implementation Tracking',
      'PersistenceManager tracks UcpStorage via implementationRegister'
    );
    
    implReq.addCriterion('IMPL-01', 'UcpStorage.start() registers with PersistenceManager');
    implReq.addCriterion('IMPL-02', 'PersistenceManager.implementations includes UcpStorage');
    implReq.addCriterion('IMPL-03', 'implementationCheck returns true for UcpStorage');
    
    this.logEvidence('step', 'Testing JsInterface implementation tracking');
    
    // IMPL-01: Call static start()
    UcpStorage.start();
    implReq.validateCriterion('IMPL-01', true, { started: true });
    
    // IMPL-02: Check implementations array
    const implementations = PersistenceManager.implementations;
    const hasUcpStorage = this.classInArray(implementations, UcpStorage);
    implReq.validateCriterion('IMPL-02', hasUcpStorage, {
      count: implementations.length,
      hasUcpStorage,
      names: this.classNamesExtract(implementations),
    });
    
    // IMPL-03: implementationCheck
    const checkResult = PersistenceManager.implementationCheck(UcpStorage);
    implReq.validateCriterion('IMPL-03', checkResult, {
      checkResult,
    });
    
    this.validateRequirement(implReq);

    // ═══════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════
    this.logEvidence('step', '═══════════════════════════════════════════════════════════════');
    this.logEvidence('step', 'TEST SUMMARY');
    this.logEvidence('step', '═══════════════════════════════════════════════════════════════');
    this.logEvidence('evidence', 'All requirements verified with real JsInterface infrastructure');
    this.logEvidence('evidence', 'PersistenceManager is now a JsInterface class (not Symbol)');
    this.logEvidence('evidence', 'UcpStorage.start() registers implementation with PersistenceManager');
  }
  
  // ═══════════════════════════════════════════════════════════════
  // RADICAL OOP HELPER METHODS (no inline functions)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Check if item exists in array
   */
  private itemInArray<T>(array: T[], item: T): boolean {
    for (const element of array) {
      if (element === item) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Check if class exists in array
   */
  private classInArray(array: any[], targetClass: any): boolean {
    for (const element of array) {
      if (element === targetClass) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Extract class names from array
   */
  private classNamesExtract(classes: any[]): string[] {
    const names: string[] = [];
    for (const cls of classes) {
      names.push(cls.name || 'unknown');
    }
    return names;
  }
  
  /**
   * Check if prototype chain includes target class
   */
  private prototypeChainIncludes(childClass: any, parentClass: any): boolean {
    let proto = Object.getPrototypeOf(childClass);
    while (proto) {
      if (proto === parentClass) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }
    return false;
  }
}
