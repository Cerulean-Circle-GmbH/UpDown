/**
 * Test 05: RelatedObjects Registry
 * 
 * ✅ RADICAL OOP: Tests Web4 Principle 24 - RelatedObjects Registry
 * ✅ Uses Web4Requirement for acceptance criteria
 * 
 * Verifies that UcpController:
 * - Registers objects by interface type
 * - Looks up all instances of an interface
 * - Looks up first instance (Reference<T>)
 * - Unregisters objects from all interfaces
 * - Auto-registers for parent classes in prototype chain
 * 
 * @pdca 2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { UcpController } from '../../dist/ts/layer2/UcpController.js';

// Test interfaces/classes for registry testing
class TestModel {
  name: string = 'test';
}

class BaseView {
  viewId: string;
  constructor() {
    this.viewId = crypto.randomUUID();
  }
}

class ItemView extends BaseView {
  itemName: string = 'item';
}

class SpecialItemView extends ItemView {
  special: boolean = true;
}

class OtherView extends BaseView {
  other: string = 'other';
}

export class Test05_RelatedObjectsRegistry extends ONCETestCase {

  protected async executeTestLogic(): Promise<any> {
    this.logEvidence('input', 'RelatedObjects Registry test', {
      testedClass: 'UcpController',
      principle: 'Web4 Principle 24'
    });

    // Create controller
    const controller = new UcpController<TestModel>();
    controller.init({ name: 'test' });

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 1: Register and Lookup Single Interface
    // ═══════════════════════════════════════════════════════════════
    
    const registerReq = this.requirement(
      'Register and Lookup',
      'Objects can be registered and retrieved by interface type'
    );
    
    registerReq.addCriterion('REG-01', 'relatedObjectRegister adds instance');
    registerReq.addCriterion('REG-02', 'relatedObjectLookup returns registered instances');
    registerReq.addCriterion('REG-03', 'relatedObjectLookupFirst returns first or null');
    registerReq.addCriterion('REG-04', 'Empty lookup returns empty array');
    
    this.logEvidence('step', 'Testing basic register and lookup');
    
    // REG-04: Empty lookup before registration
    const emptyLookup = controller.relatedObjectLookup(ItemView);
    registerReq.validateCriterion('REG-04', emptyLookup.length === 0, { 
      actual: emptyLookup.length 
    });
    
    // REG-01: Register an ItemView
    const itemView1 = new ItemView();
    controller.relatedObjectRegister(ItemView, itemView1);
    
    // REG-02: Lookup returns the registered instance
    const lookup1 = controller.relatedObjectLookup(ItemView);
    registerReq.validateCriterion('REG-01', lookup1.length === 1, { 
      expected: 1, 
      actual: lookup1.length 
    });
    registerReq.validateCriterion('REG-02', lookup1[0] === itemView1, { 
      match: lookup1[0] === itemView1 
    });
    
    // REG-03: LookupFirst returns first instance
    const first = controller.relatedObjectLookupFirst(ItemView);
    registerReq.validateCriterion('REG-03', first === itemView1, { 
      match: first === itemView1 
    });
    
    this.validateRequirement(registerReq);

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 2: Multiple Instances of Same Interface
    // ═══════════════════════════════════════════════════════════════
    
    const multiReq = this.requirement(
      'Multiple Instances',
      'Multiple objects of same interface can be registered'
    );
    
    multiReq.addCriterion('MULTI-01', 'Second instance is added');
    multiReq.addCriterion('MULTI-02', 'Lookup returns all instances');
    multiReq.addCriterion('MULTI-03', 'LookupFirst still returns first');
    
    this.logEvidence('step', 'Testing multiple instances');
    
    const itemView2 = new ItemView();
    controller.relatedObjectRegister(ItemView, itemView2);
    
    const lookup2 = controller.relatedObjectLookup(ItemView);
    multiReq.validateCriterion('MULTI-01', lookup2.length === 2, { 
      expected: 2, 
      actual: lookup2.length 
    });
    multiReq.validateCriterion('MULTI-02', lookup2.includes(itemView1) && lookup2.includes(itemView2), { 
      hasFirst: lookup2.includes(itemView1),
      hasSecond: lookup2.includes(itemView2)
    });
    
    const firstStill = controller.relatedObjectLookupFirst(ItemView);
    multiReq.validateCriterion('MULTI-03', firstStill === itemView1, { 
      match: firstStill === itemView1 
    });
    
    this.validateRequirement(multiReq);

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 3: Prototype Chain Registration
    // ═══════════════════════════════════════════════════════════════
    
    const chainReq = this.requirement(
      'Prototype Chain',
      'Instances are auto-registered for parent classes'
    );
    
    chainReq.addCriterion('CHAIN-01', 'SpecialItemView registered under SpecialItemView');
    chainReq.addCriterion('CHAIN-02', 'SpecialItemView also found under ItemView');
    chainReq.addCriterion('CHAIN-03', 'SpecialItemView also found under BaseView');
    
    this.logEvidence('step', 'Testing prototype chain registration');
    
    const specialView = new SpecialItemView();
    controller.relatedObjectRegister(SpecialItemView, specialView);
    
    // CHAIN-01: Direct lookup
    const specialLookup = controller.relatedObjectLookup(SpecialItemView);
    chainReq.validateCriterion('CHAIN-01', specialLookup.includes(specialView), { 
      found: specialLookup.includes(specialView) 
    });
    
    // CHAIN-02: Should also be in ItemView
    const itemLookup = controller.relatedObjectLookup(ItemView);
    chainReq.validateCriterion('CHAIN-02', itemLookup.includes(specialView), { 
      found: itemLookup.includes(specialView),
      totalItemViews: itemLookup.length
    });
    
    // CHAIN-03: Should also be in BaseView
    const baseLookup = controller.relatedObjectLookup(BaseView);
    chainReq.validateCriterion('CHAIN-03', baseLookup.includes(specialView), { 
      found: baseLookup.includes(specialView),
      totalBaseViews: baseLookup.length
    });
    
    this.validateRequirement(chainReq);

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 4: Unregister
    // ═══════════════════════════════════════════════════════════════
    
    const unregisterReq = this.requirement(
      'Unregister',
      'Objects can be unregistered from all interfaces'
    );
    
    unregisterReq.addCriterion('UNREG-01', 'relatedObjectUnregister removes from direct interface');
    unregisterReq.addCriterion('UNREG-02', 'Also removed from parent interfaces');
    unregisterReq.addCriterion('UNREG-03', 'Other instances remain');
    
    this.logEvidence('step', 'Testing unregister');
    
    // Unregister the special view
    controller.relatedObjectUnregister(specialView);
    
    // UNREG-01: No longer in SpecialItemView
    const afterUnregSpecial = controller.relatedObjectLookup(SpecialItemView);
    unregisterReq.validateCriterion('UNREG-01', !afterUnregSpecial.includes(specialView), { 
      found: afterUnregSpecial.includes(specialView) 
    });
    
    // UNREG-02: No longer in BaseView
    const afterUnregBase = controller.relatedObjectLookup(BaseView);
    unregisterReq.validateCriterion('UNREG-02', !afterUnregBase.includes(specialView), { 
      found: afterUnregBase.includes(specialView) 
    });
    
    // UNREG-03: Other ItemViews still present
    const afterUnregItem = controller.relatedObjectLookup(ItemView);
    unregisterReq.validateCriterion('UNREG-03', afterUnregItem.includes(itemView1), { 
      itemView1Found: afterUnregItem.includes(itemView1),
      itemView2Found: afterUnregItem.includes(itemView2)
    });
    
    this.validateRequirement(unregisterReq);

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 5: Different Interface Types
    // ═══════════════════════════════════════════════════════════════
    
    const typesReq = this.requirement(
      'Different Types',
      'Different interface types are kept separate'
    );
    
    typesReq.addCriterion('TYPE-01', 'OtherView registers separately');
    typesReq.addCriterion('TYPE-02', 'OtherView lookup does not include ItemView');
    typesReq.addCriterion('TYPE-03', 'BaseView lookup includes both types');
    
    this.logEvidence('step', 'Testing different interface types');
    
    const otherView = new OtherView();
    controller.relatedObjectRegister(OtherView, otherView);
    
    // TYPE-01: OtherView registered
    const otherLookup = controller.relatedObjectLookup(OtherView);
    typesReq.validateCriterion('TYPE-01', otherLookup.includes(otherView), { 
      found: otherLookup.includes(otherView) 
    });
    
    // TYPE-02: ItemView lookup does not include OtherView
    const itemOnly = controller.relatedObjectLookup(ItemView);
    typesReq.validateCriterion('TYPE-02', !itemOnly.includes(otherView as any), { 
      foundOther: itemOnly.includes(otherView as any) 
    });
    
    // TYPE-03: BaseView includes both
    const allBase = controller.relatedObjectLookup(BaseView);
    typesReq.validateCriterion('TYPE-03', 
      allBase.includes(itemView1) && allBase.includes(otherView), { 
        hasItemView: allBase.includes(itemView1),
        hasOtherView: allBase.includes(otherView)
      }
    );
    
    this.validateRequirement(typesReq);

    return {
      success: true,
      requirements: {
        register: registerReq.getCriteria(),
        multiple: multiReq.getCriteria(),
        prototypeChain: chainReq.getCriteria(),
        unregister: unregisterReq.getCriteria(),
        differentTypes: typesReq.getCriteria()
      }
    };
  }
}












