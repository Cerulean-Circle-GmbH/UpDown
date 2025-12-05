/**
 * Test 06: Action Discovery System
 * 
 * ✅ RADICAL OOP: Tests Action static utilities and TSDoc parsing
 * ✅ Uses Web4Requirement for acceptance criteria
 * 
 * Verifies that:
 * - Action.create() generates correct metadata
 * - Action.register() stores in RelatedObjects
 * - Action.lookup() finds by method name
 * - Action.all() returns all actions
 * - Action.do() invokes on target
 * - Action.parseFromTSDoc() extracts annotations
 * - Action.methodNameToActionId() converts correctly
 * 
 * @pdca 2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { UcpController } from '../../dist/ts/layer2/UcpController.js';
import { Action, ActionMetadataImpl } from '../../dist/ts/layer2/Action.js';
import { ActionStyle } from '../../dist/ts/layer3/ActionStyle.enum.js';
import { ActionTarget } from '../../dist/ts/layer3/ActionTarget.interface.js';

// Test model
class TestModel {
  name: string = 'test';
}

// Mock ActionTarget
class MockActionTarget implements ActionTarget {
  invocations: { method: string; args: unknown[] }[] = [];
  
  hasMethod(name: string): boolean {
    return name === 'testAction' || name === 'anotherAction';
  }
  
  async methodInvoke(name: string, ...args: unknown[]): Promise<unknown> {
    this.invocations.push({ method: name, args });
    return `Invoked ${name}`;
  }
}

export class Test06_ActionDiscoverySystem extends ONCETestCase {

  protected async executeTestLogic(): Promise<any> {
    this.logEvidence('input', 'Action Discovery System test', {
      testedClass: 'Action',
      principle: 'Web4 Principle 24 (RelatedObjects for actions)'
    });

    const controller = new UcpController<TestModel>();
    controller.init({ name: 'test' });

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 1: Action Creation and Registration
    // ═══════════════════════════════════════════════════════════════
    
    const createReq = this.requirement(
      'Action Creation',
      'Actions can be created and registered'
    );
    
    createReq.addCriterion('CREATE-01', 'Action.create() returns ActionMetadataImpl');
    createReq.addCriterion('CREATE-02', 'methodNameToActionId converts correctly');
    createReq.addCriterion('CREATE-03', 'Action.register() adds to RelatedObjects');
    createReq.addCriterion('CREATE-04', 'Action.all() returns registered actions');
    
    this.logEvidence('step', 'Testing action creation');
    
    // CREATE-01: Create action
    const action1 = Action.create('ONCE', 'peerStart', 'Start Server');
    createReq.validateCriterion('CREATE-01', action1 instanceof ActionMetadataImpl, {
      isInstance: action1 instanceof ActionMetadataImpl,
      component: action1.component,
      method: action1.method,
      label: action1.label
    });
    
    // CREATE-02: Method name conversion
    const actionId = Action.methodNameToActionId('peerStartAll');
    createReq.validateCriterion('CREATE-02', actionId === 'PEER_START_ALL', {
      input: 'peerStartAll',
      output: actionId,
      expected: 'PEER_START_ALL'
    });
    
    // CREATE-03: Register action
    Action.register(controller, action1);
    const lookupAfterRegister = Action.lookup(controller, 'peerStart');
    createReq.validateCriterion('CREATE-03', lookupAfterRegister === action1, {
      found: lookupAfterRegister !== null
    });
    
    // CREATE-04: Get all actions
    const action2 = Action.create('ONCE', 'peerStop', 'Stop Server');
    action2.style = ActionStyle.DANGER;
    Action.register(controller, action2);
    
    const allActions = Action.all(controller);
    createReq.validateCriterion('CREATE-04', allActions.length === 2, {
      count: allActions.length,
      methods: allActions.map(a => a.method)
    });
    
    this.validateRequirement(createReq);

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 2: Action Lookup
    // ═══════════════════════════════════════════════════════════════
    
    const lookupReq = this.requirement(
      'Action Lookup',
      'Actions can be looked up by method name'
    );
    
    lookupReq.addCriterion('LOOKUP-01', 'Action.lookup() finds existing action');
    lookupReq.addCriterion('LOOKUP-02', 'Action.lookup() returns null for missing');
    lookupReq.addCriterion('LOOKUP-03', 'Returned action has correct properties');
    
    this.logEvidence('step', 'Testing action lookup');
    
    // LOOKUP-01: Find existing
    const found = Action.lookup(controller, 'peerStop');
    lookupReq.validateCriterion('LOOKUP-01', found !== null, {
      found: found !== null
    });
    
    // LOOKUP-02: Missing returns null
    const notFound = Action.lookup(controller, 'nonExistentMethod');
    lookupReq.validateCriterion('LOOKUP-02', notFound === null, {
      result: notFound
    });
    
    // LOOKUP-03: Correct properties
    lookupReq.validateCriterion('LOOKUP-03', 
      found !== null && found.style === ActionStyle.DANGER && found.label === 'Stop Server', {
        style: found?.style,
        label: found?.label
      }
    );
    
    this.validateRequirement(lookupReq);

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 3: Action Invocation
    // ═══════════════════════════════════════════════════════════════
    
    const invokeReq = this.requirement(
      'Action Invocation',
      'Actions can be invoked on targets'
    );
    
    invokeReq.addCriterion('INVOKE-01', 'Action.do() calls target.methodInvoke');
    invokeReq.addCriterion('INVOKE-02', 'Action.do() passes arguments');
    invokeReq.addCriterion('INVOKE-03', 'Action.do() throws for missing method');
    
    this.logEvidence('step', 'Testing action invocation');
    
    const target = new MockActionTarget();
    const testAction = Action.create('Test', 'testAction', 'Test Action');
    
    // INVOKE-01: Basic invocation
    const result = await Action.do(testAction, target);
    invokeReq.validateCriterion('INVOKE-01', target.invocations.length === 1, {
      invocationCount: target.invocations.length,
      result
    });
    
    // INVOKE-02: With arguments
    const anotherAction = Action.create('Test', 'anotherAction', 'Another');
    await Action.do(anotherAction, target, 'arg1', 42);
    invokeReq.validateCriterion('INVOKE-02', 
      target.invocations[1].args.length === 2 && 
      target.invocations[1].args[0] === 'arg1', {
        args: target.invocations[1].args
      }
    );
    
    // INVOKE-03: Missing method throws
    const missingAction = Action.create('Test', 'missingMethod', 'Missing');
    let threwError = false;
    try {
      await Action.do(missingAction, target);
    } catch (e) {
      threwError = true;
    }
    invokeReq.validateCriterion('INVOKE-03', threwError, {
      threwError
    });
    
    this.validateRequirement(invokeReq);

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 4: TSDoc Parsing
    // ═══════════════════════════════════════════════════════════════
    
    const parseReq = this.requirement(
      'TSDoc Parsing',
      'Actions are parsed from TSDoc annotations'
    );
    
    parseReq.addCriterion('PARSE-01', '@action annotation is required');
    parseReq.addCriterion('PARSE-02', '@action label is extracted');
    parseReq.addCriterion('PARSE-03', '@actionIcon is extracted');
    parseReq.addCriterion('PARSE-04', '@actionStyle is parsed as enum');
    parseReq.addCriterion('PARSE-05', '@actionShortcut is extracted');
    parseReq.addCriterion('PARSE-06', '@actionConfirm sets confirmRequired and message');
    
    this.logEvidence('step', 'Testing TSDoc parsing');
    
    // PARSE-01: No @action returns null
    const noAction = Action.parseFromTSDoc('Test', 'method', 'Just a comment without action');
    parseReq.validateCriterion('PARSE-01', noAction === null, {
      result: noAction
    });
    
    // PARSE-02: Basic @action
    const basicTSDoc = `
      /**
       * Some method
       * @action Start Server
       */
    `;
    const basicAction = Action.parseFromTSDoc('ONCE', 'peerStart', basicTSDoc);
    parseReq.validateCriterion('PARSE-02', basicAction?.label === 'Start Server', {
      label: basicAction?.label
    });
    
    // PARSE-03: With @actionIcon
    const iconTSDoc = `
      @action Stop
      @actionIcon fa-stop
    `;
    const iconAction = Action.parseFromTSDoc('ONCE', 'peerStop', iconTSDoc);
    parseReq.validateCriterion('PARSE-03', iconAction?.icon === 'fa-stop', {
      icon: iconAction?.icon
    });
    
    // PARSE-04: With @actionStyle
    const styleTSDoc = `
      @action Delete
      @actionStyle DANGER
    `;
    const styleAction = Action.parseFromTSDoc('ONCE', 'delete', styleTSDoc);
    parseReq.validateCriterion('PARSE-04', styleAction?.style === ActionStyle.DANGER, {
      style: styleAction?.style,
      expected: ActionStyle.DANGER
    });
    
    // PARSE-05: With @actionShortcut
    const shortcutTSDoc = `
      @action Save
      @actionShortcut Ctrl+S
    `;
    const shortcutAction = Action.parseFromTSDoc('Test', 'save', shortcutTSDoc);
    parseReq.validateCriterion('PARSE-05', shortcutAction?.shortcut === 'Ctrl+S', {
      shortcut: shortcutAction?.shortcut
    });
    
    // PARSE-06: With @actionConfirm
    const confirmTSDoc = `
      @action Shutdown All
      @actionConfirm Are you sure you want to stop all servers?
    `;
    const confirmAction = Action.parseFromTSDoc('ONCE', 'peerStopAll', confirmTSDoc);
    parseReq.validateCriterion('PARSE-06', 
      confirmAction?.confirmRequired === true && 
      confirmAction?.confirmMessage?.includes('stop all servers'), {
        confirmRequired: confirmAction?.confirmRequired,
        confirmMessage: confirmAction?.confirmMessage
      }
    );
    
    this.validateRequirement(parseReq);

    return {
      success: true,
      requirements: {
        creation: createReq.getCriteria(),
        lookup: lookupReq.getCriteria(),
        invocation: invokeReq.getCriteria(),
        tsdocParsing: parseReq.getCriteria()
      }
    };
  }
}

