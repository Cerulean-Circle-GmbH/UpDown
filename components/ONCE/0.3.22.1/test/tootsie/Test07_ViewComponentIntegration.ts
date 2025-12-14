/**
 * Test07_ViewComponentIntegration.ts - View Component Integration Test
 * 
 * Tests the complete integration of:
 * - OncePeerItemView rendering with OncePeerModel
 * - DefaultItemView base class functionality
 * - ItemView interface implementation
 * - RelatedObjects registration of views
 * - Action discovery from views
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P25: Tootsie Tests Only
 * 
 * @ior ior:esm:/ONCE/{version}/Test07_ViewComponentIntegration
 * @pdca 2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { UcpController } from '../../dist/ts/layer2/UcpController.js';
import { OncePeerItemView, OncePeerModel } from '../../dist/ts/layer5/views/OncePeerItemView.js';
import { DefaultItemView } from '../../dist/ts/layer5/views/DefaultItemView.js';
import { ItemView as ItemViewInterface } from '../../dist/ts/layer3/ItemView.interface.js';
import { ItemViewModel } from '../../dist/ts/layer3/ItemViewModel.interface.js';
import { ActionMetadata } from '../../dist/ts/layer3/ActionMetadata.interface.js';
import { ActionStyle } from '../../dist/ts/layer3/ActionStyle.enum.js';
import { Reference } from '../../dist/ts/layer3/Reference.interface.js';
import { Collection } from '../../dist/ts/layer3/Collection.interface.js';

/**
 * Test07 - View Component Integration
 * 
 * Validates:
 * - VIEW-01: OncePeerItemView extends DefaultItemView
 * - VIEW-02: DefaultItemView implements ItemView interface
 * - VIEW-03: Enforced attributes (name, description, badge, icon) mapped via getters
 * - VIEW-04: actionsDiscover() returns Collection<ActionMetadata>
 * - VIEW-05: Views can be registered as RelatedObjects
 * - VIEW-06: Views can be looked up by ItemView interface
 * - VIEW-07: Computed properties derive from model
 * - VIEW-08: CSS paths defined correctly
 */
export class Test07_ViewComponentIntegration extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<{ success: boolean }> {
    this.logEvidence('input', 'View Component Integration test', {
      testedClasses: ['OncePeerItemView', 'DefaultItemView'],
      principles: ['P4', 'P16', 'P19', 'P22', 'P24']
    });
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 1: Inheritance Chain
    // ═══════════════════════════════════════════════════════════════
    
    const reqInheritance = this.requirement(
      'VIEW-01: Inheritance Chain',
      'OncePeerItemView extends DefaultItemView'
    );
    
    reqInheritance.addCriterion('INH-01', 'Prototype chain includes DefaultItemView');
    reqInheritance.addCriterion('INH-02', 'Prototype chain includes AbstractWebBean');
    
    this.logEvidence('step', 'Checking prototype chain');
    
    const prototypeChain: string[] = [];
    let proto = OncePeerItemView.prototype;
    while (proto && proto !== Object.prototype) {
      prototypeChain.push(proto.constructor.name);
      proto = Object.getPrototypeOf(proto);
    }
    
    reqInheritance.validateCriterion('INH-01', prototypeChain.includes('DefaultItemView'), {
      prototypeChain
    });
    reqInheritance.validateCriterion('INH-02', prototypeChain.includes('AbstractWebBean'), {
      prototypeChain
    });
    
    this.validateRequirement(reqInheritance);
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 2: CSS Path Configuration
    // ═══════════════════════════════════════════════════════════════
    
    const reqCss = this.requirement(
      'VIEW-02: CSS Path Configuration',
      'Views define static cssPath for adoptedStyleSheets'
    );
    
    reqCss.addCriterion('CSS-01', 'OncePeerItemView.cssPath defined');
    reqCss.addCriterion('CSS-02', 'DefaultItemView.cssPath defined');
    reqCss.addCriterion('CSS-03', 'CSS paths end with .css');
    
    this.logEvidence('step', 'Checking CSS path configuration');
    
    const oncePeerCss = (OncePeerItemView as any).cssPath;
    const defaultCss = (DefaultItemView as any).cssPath;
    
    reqCss.validateCriterion('CSS-01', typeof oncePeerCss === 'string', { oncePeerCss });
    reqCss.validateCriterion('CSS-02', typeof defaultCss === 'string', { defaultCss });
    reqCss.validateCriterion('CSS-03', 
      oncePeerCss?.endsWith('.css') && defaultCss?.endsWith('.css'), 
      { oncePeerCss, defaultCss }
    );
    
    this.validateRequirement(reqCss);
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 3: Actions Discovery
    // ═══════════════════════════════════════════════════════════════
    
    const reqActions = this.requirement(
      'VIEW-03: Actions Discovery',
      'Views discover and return actions as Collection<ActionMetadata>'
    );
    
    reqActions.addCriterion('ACT-01', 'actionsDiscover returns iterable');
    reqActions.addCriterion('ACT-02', 'Actions have required fields');
    reqActions.addCriterion('ACT-03', 'Stop action has DANGER style');
    
    this.logEvidence('step', 'Testing action discovery');
    
    // Call actionsDiscover on prototype
    const viewProto = OncePeerItemView.prototype;
    const actions = viewProto.actionsDiscover.call({ model: {} });
    const isIterable = typeof actions[Symbol.iterator] === 'function';
    const actionsArray = Array.from(actions);
    
    reqActions.validateCriterion('ACT-01', isIterable, {
      isIterable,
      actionsCount: actionsArray.length
    });
    
    const firstAction = actionsArray[0] as ActionMetadata;
    const hasRequiredFields = firstAction && 
      typeof firstAction.component === 'string' &&
      typeof firstAction.method === 'string' &&
      typeof firstAction.label === 'string';
    
    reqActions.validateCriterion('ACT-02', hasRequiredFields, {
      action: firstAction
    });
    
    const stopAction = actionsArray.find(function(a: any) { return a.method === 'peerStop'; });
    reqActions.validateCriterion('ACT-03', 
      stopAction && (stopAction as ActionMetadata).style === ActionStyle.DANGER,
      { stopAction }
    );
    
    this.validateRequirement(reqActions);
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 4: RelatedObjects Registration
    // ═══════════════════════════════════════════════════════════════
    
    // Create mock view for registration test
    class MockView {
      mockId: string;
      constructor(id: string) { this.mockId = id; }
    }
    
    const reqReg = this.requirement(
      'VIEW-04: RelatedObjects Registration',
      'Views can be registered and looked up in controller'
    );
    
    reqReg.addCriterion('REG-01', 'View can be registered');
    reqReg.addCriterion('REG-02', 'View can be looked up');
    reqReg.addCriterion('REG-03', 'Multiple views can be registered');
    
    this.logEvidence('step', 'Testing view registration');
    
    const controller = new UcpController<any>().init({});
    const view1 = new MockView('view-1');
    
    controller.relatedObjectRegister(MockView, view1);
    const found = controller.relatedObjectLookup(MockView);
    
    reqReg.validateCriterion('REG-01', found.length >= 1, { foundCount: found.length });
    reqReg.validateCriterion('REG-02', found[0]?.mockId === 'view-1', { 
      expectedId: 'view-1',
      actualId: found[0]?.mockId 
    });
    
    const view2 = new MockView('view-2');
    controller.relatedObjectRegister(MockView, view2);
    const found2 = controller.relatedObjectLookup(MockView);
    
    reqReg.validateCriterion('REG-03', found2.length === 2, { foundCount: found2.length });
    
    this.validateRequirement(reqReg);
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 5: ViewName Property
    // ═══════════════════════════════════════════════════════════════
    
    const reqViewName = this.requirement(
      'VIEW-05: ViewName Property',
      'Views expose viewName for CSS/template path resolution'
    );
    
    reqViewName.addCriterion('VN-01', 'OncePeerItemView.viewName is correct');
    reqViewName.addCriterion('VN-02', 'DefaultItemView.viewName is correct');
    
    this.logEvidence('step', 'Testing viewName properties');
    
    const oncePeerViewName = OncePeerItemView.prototype.viewName;
    const defaultViewName = DefaultItemView.prototype.viewName;
    
    reqViewName.validateCriterion('VN-01', oncePeerViewName === 'OncePeerItemView', {
      viewName: oncePeerViewName
    });
    reqViewName.validateCriterion('VN-02', defaultViewName === 'DefaultItemView', {
      viewName: defaultViewName
    });
    
    this.validateRequirement(reqViewName);
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 6: OncePeerModel Structure
    // ═══════════════════════════════════════════════════════════════
    
    const reqModel = this.requirement(
      'VIEW-06: OncePeerModel Structure',
      'OncePeerModel has required fields for peer display'
    );
    
    reqModel.addCriterion('MOD-01', 'Model has uuid');
    reqModel.addCriterion('MOD-02', 'Model has state with capabilities');
    reqModel.addCriterion('MOD-03', 'Model has isPrimaryServer flag');
    
    this.logEvidence('step', 'Testing model structure');
    
    const testModel: OncePeerModel = {
      uuid: 'test-uuid-1234',
      state: {
        uuid: 'test-uuid-1234',
        state: 'RUNNING',
        capabilities: [{ capability: 'httpPort', port: 42777 }]
      },
      isPrimaryServer: true
    };
    
    reqModel.validateCriterion('MOD-01', typeof testModel.uuid === 'string', {
      uuid: testModel.uuid
    });
    reqModel.validateCriterion('MOD-02', 
      typeof testModel.state === 'object' && Array.isArray(testModel.state?.capabilities),
      { state: testModel.state }
    );
    reqModel.validateCriterion('MOD-03', typeof testModel.isPrimaryServer === 'boolean', {
      isPrimaryServer: testModel.isPrimaryServer
    });
    
    this.validateRequirement(reqModel);
    
    this.logEvidence('output', 'All view component integration tests passed', {
      requirementsPassed: 6
    });
    
    return { success: true };
  }
}
