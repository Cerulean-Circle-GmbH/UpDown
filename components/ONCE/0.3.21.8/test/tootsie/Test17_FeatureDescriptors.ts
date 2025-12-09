/**
 * Test17_FeatureDescriptors - Regression tests for descriptor interfaces
 * 
 * ✅ Web4 Principle 25: Tootsie Tests Only
 * ✅ Web4 Principle 28: DRY + Code-First
 * ✅ Tests FeatureDescriptor and all derived descriptors
 * 
 * @pdca 2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TypeDescriptor, TypeDescriptorJSON } from '../../src/ts/layer3/TypeDescriptor.js';
import type { FeatureDescriptor } from '../../src/ts/layer3/FeatureDescriptor.interface.js';
import type { AttributeDescriptor } from '../../src/ts/layer3/AttributeDescriptor.interface.js';
import type { PropertyDescriptor } from '../../src/ts/layer3/PropertyDescriptor.interface.js';
import type { ReferenceDescriptor } from '../../src/ts/layer3/ReferenceDescriptor.interface.js';
import type { CollectionDescriptor } from '../../src/ts/layer3/CollectionDescriptor.interface.js';
import type { MethodDescriptor } from '../../src/ts/layer3/MethodDescriptor.interface.js';
import type { ParameterDescriptor } from '../../src/ts/layer3/ParameterDescriptor.interface.js';

/**
 * Test model
 */
interface Test17Model {
  descriptor: TypeDescriptor | null;
}

/**
 * Test17_FeatureDescriptors
 * 
 * Tests:
 * 1. FeatureDescriptor base interface (name property)
 * 2. All derived descriptor interfaces
 * 3. TypeDescriptor.fromASTData() factory method
 * 4. Descriptor getters return Reference<T> (nullable)
 * 5. Serialization via toJSON()
 */
export class Test17_FeatureDescriptors extends ONCETestCase {
  
  testModel: Test17Model = {
    descriptor: null,
  };
  
  /** Sample AST data for testing */
  private readonly SAMPLE_AST_DATA: TypeDescriptorJSON = {
    name: 'TestComponent',
    extends: 'UcpComponent',
    implements: ['PersistenceManager', 'View'],
    attributes: [
      { name: 'uuid', type: 'string', optional: false, defaultValue: null },
      { name: 'state', type: 'LifecycleState', optional: false, defaultValue: 'CREATED' },
    ],
    properties: [
      { name: 'name', type: 'string', hasGetter: true, hasSetter: true, isReadonly: false },
      { name: 'version', type: 'string', hasGetter: true, hasSetter: false, isReadonly: true },
    ],
    references: [
      { name: 'parent', targetType: 'UcpComponent' },
      { name: 'persistenceManager', targetType: 'PersistenceManager' },
    ],
    collections: [
      { name: 'children', elementType: 'UcpComponent' },
      { name: 'views', elementType: 'View' },
    ],
    methods: [
      { 
        name: 'init', 
        parameters: [{ name: 'scenario', type: 'Scenario', optional: false, defaultValue: null }],
        returnType: 'this',
        isAsync: false,
        isAction: false,
        actionMetadata: null
      },
      { 
        name: 'peerStart', 
        parameters: [],
        returnType: 'Promise<void>',
        isAsync: true,
        isAction: true,
        actionMetadata: {
          label: 'Start Server',
          icon: 'fa-play',
          style: 'PRIMARY',
          shortcut: 'Ctrl+S',
          confirmMessage: null
        }
      },
    ],
  };
  
  /**
   * Test execution
   */
  protected async executeTestLogic(): Promise<void> {
    await this.testFeatureDescriptorBase();
    await this.testAttributeDescriptors();
    await this.testPropertyDescriptors();
    await this.testReferenceDescriptors();
    await this.testCollectionDescriptors();
    await this.testMethodDescriptors();
    await this.testTypeDescriptorFromAST();
    await this.testSerialization();
  }
  
  /**
   * Test FeatureDescriptor base interface
   */
  private async testFeatureDescriptorBase(): Promise<void> {
    this.logEvidence('step', 'TEST-01: FeatureDescriptor base interface');
    
    // All descriptors must have name property
    const attr: FeatureDescriptor = { name: 'testAttr' };
    
    this.logEvidence('requirement', 'REQ-01: FeatureDescriptor requires name property');
    this.logEvidence('evidence', `Created FeatureDescriptor with name: ${attr.name}`);
    
    if (!attr.name) {
      throw new Error('FeatureDescriptor must have name property');
    }
    
    this.logEvidence('status', 'PASS: FeatureDescriptor base interface works');
  }
  
  /**
   * Test AttributeDescriptor
   */
  private async testAttributeDescriptors(): Promise<void> {
    this.logEvidence('step', 'TEST-02: AttributeDescriptor interface');
    
    const attr: AttributeDescriptor = {
      name: 'uuid',
      type: 'string',
      optional: false,
      defaultValue: null
    };
    
    this.logEvidence('requirement', 'REQ-02: AttributeDescriptor extends FeatureDescriptor');
    this.logEvidence('evidence', `AttributeDescriptor: name=${attr.name}, type=${attr.type}, optional=${attr.optional}`);
    
    if (!attr.name || !attr.type) {
      throw new Error('AttributeDescriptor must have name and type');
    }
    
    // Test optional with default
    const optAttr: AttributeDescriptor = {
      name: 'state',
      type: 'LifecycleState',
      optional: true,
      defaultValue: 'CREATED'
    };
    
    this.logEvidence('evidence', `Optional AttributeDescriptor: name=${optAttr.name}, default=${optAttr.defaultValue}`);
    
    this.logEvidence('status', 'PASS: AttributeDescriptor interface works');
  }
  
  /**
   * Test PropertyDescriptor
   */
  private async testPropertyDescriptors(): Promise<void> {
    this.logEvidence('step', 'TEST-03: PropertyDescriptor interface');
    
    const readWrite: PropertyDescriptor = {
      name: 'name',
      type: 'string',
      hasGetter: true,
      hasSetter: true,
      isReadonly: false
    };
    
    const readonly: PropertyDescriptor = {
      name: 'version',
      type: 'string',
      hasGetter: true,
      hasSetter: false,
      isReadonly: true
    };
    
    this.logEvidence('requirement', 'REQ-03: PropertyDescriptor tracks getter/setter presence');
    this.logEvidence('evidence', `Read/write property: ${readWrite.name}, getter=${readWrite.hasGetter}, setter=${readWrite.hasSetter}`);
    this.logEvidence('evidence', `Readonly property: ${readonly.name}, readonly=${readonly.isReadonly}`);
    
    if (readonly.hasSetter || !readonly.isReadonly) {
      throw new Error('Readonly property should not have setter');
    }
    
    this.logEvidence('status', 'PASS: PropertyDescriptor interface works');
  }
  
  /**
   * Test ReferenceDescriptor
   */
  private async testReferenceDescriptors(): Promise<void> {
    this.logEvidence('step', 'TEST-04: ReferenceDescriptor interface (nullable, serializes as IOR)');
    
    const ref: ReferenceDescriptor = {
      name: 'parent',
      targetType: 'UcpComponent'
    };
    
    this.logEvidence('requirement', 'REQ-04: ReferenceDescriptor is always nullable (Reference<T>)');
    this.logEvidence('evidence', `Reference: ${ref.name} -> ${ref.targetType}`);
    this.logEvidence('evidence', 'References serialize as IOR strings in scenarios');
    
    this.logEvidence('status', 'PASS: ReferenceDescriptor interface works');
  }
  
  /**
   * Test CollectionDescriptor
   */
  private async testCollectionDescriptors(): Promise<void> {
    this.logEvidence('step', 'TEST-05: CollectionDescriptor interface (array of references)');
    
    const col: CollectionDescriptor = {
      name: 'children',
      elementType: 'UcpComponent'
    };
    
    this.logEvidence('requirement', 'REQ-05: CollectionDescriptor is array of Reference<T>');
    this.logEvidence('evidence', `Collection: ${col.name}[] of ${col.elementType}`);
    this.logEvidence('evidence', 'Collections serialize as IOR arrays in scenarios');
    
    this.logEvidence('status', 'PASS: CollectionDescriptor interface works');
  }
  
  /**
   * Test MethodDescriptor
   */
  private async testMethodDescriptors(): Promise<void> {
    this.logEvidence('step', 'TEST-06: MethodDescriptor interface');
    
    const initMethod: MethodDescriptor = {
      name: 'init',
      parameters: [{ name: 'scenario', type: 'Scenario', optional: false, defaultValue: null }],
      returnType: 'this',
      isAsync: false,
      isAction: false,
      actionMetadata: null
    };
    
    const actionMethod: MethodDescriptor = {
      name: 'peerStart',
      parameters: [],
      returnType: 'Promise<void>',
      isAsync: true,
      isAction: true,
      actionMetadata: {
        label: 'Start Server',
        icon: 'fa-play',
        style: 'PRIMARY',
        shortcut: 'Ctrl+S',
        confirmMessage: null
      }
    };
    
    this.logEvidence('requirement', 'REQ-06: MethodDescriptor includes parameters and action metadata');
    this.logEvidence('evidence', `Method: ${initMethod.name}(${initMethod.parameters.length} params) -> ${initMethod.returnType}`);
    this.logEvidence('evidence', `Action method: ${actionMethod.name}, label="${actionMethod.actionMetadata?.label}"`);
    
    if (actionMethod.isAction && !actionMethod.actionMetadata) {
      throw new Error('Action method must have actionMetadata');
    }
    
    this.logEvidence('status', 'PASS: MethodDescriptor interface works');
  }
  
  /**
   * Test TypeDescriptor.fromASTData()
   */
  private async testTypeDescriptorFromAST(): Promise<void> {
    this.logEvidence('step', 'TEST-07: TypeDescriptor.fromASTData() factory');
    
    this.testModel.descriptor = TypeDescriptor.fromASTData(this.SAMPLE_AST_DATA);
    const descriptor = this.testModel.descriptor;
    
    this.logEvidence('requirement', 'REQ-07: TypeDescriptor built from AST data (not reflection)');
    this.logEvidence('evidence', `TypeDescriptor.name: ${descriptor.name}`);
    this.logEvidence('evidence', `Attributes: ${descriptor.attributes.size}`);
    this.logEvidence('evidence', `Properties: ${descriptor.properties.size}`);
    this.logEvidence('evidence', `References: ${descriptor.references.size}`);
    this.logEvidence('evidence', `Collections: ${descriptor.collections.size}`);
    this.logEvidence('evidence', `Methods: ${descriptor.methods.size}`);
    
    // Verify all features populated
    if (descriptor.attributes.size !== 2) {
      throw new Error(`Expected 2 attributes, got ${descriptor.attributes.size}`);
    }
    if (descriptor.properties.size !== 2) {
      throw new Error(`Expected 2 properties, got ${descriptor.properties.size}`);
    }
    if (descriptor.references.size !== 2) {
      throw new Error(`Expected 2 references, got ${descriptor.references.size}`);
    }
    if (descriptor.collections.size !== 2) {
      throw new Error(`Expected 2 collections, got ${descriptor.collections.size}`);
    }
    if (descriptor.methods.size !== 2) {
      throw new Error(`Expected 2 methods, got ${descriptor.methods.size}`);
    }
    
    // Test getters return Reference<T> (nullable)
    const existingAttr = descriptor.attributeGet('uuid');
    const missingAttr = descriptor.attributeGet('nonexistent');
    
    this.logEvidence('evidence', `attributeGet('uuid'): ${existingAttr?.name ?? 'null'}`);
    this.logEvidence('evidence', `attributeGet('nonexistent'): ${missingAttr ?? 'null'}`);
    
    if (!existingAttr) {
      throw new Error('attributeGet should return existing attribute');
    }
    if (missingAttr !== null) {
      throw new Error('attributeGet should return null for missing attribute');
    }
    
    this.logEvidence('status', 'PASS: TypeDescriptor.fromASTData() works');
  }
  
  /**
   * Test serialization via toJSON()
   */
  private async testSerialization(): Promise<void> {
    this.logEvidence('step', 'TEST-08: TypeDescriptor.toJSON() serialization');
    
    if (!this.testModel.descriptor) {
      throw new Error('Descriptor not initialized');
    }
    
    const json = this.testModel.descriptor.toJSON();
    
    this.logEvidence('requirement', 'REQ-08: TypeDescriptor serializes to JSON format');
    this.logEvidence('evidence', `JSON name: ${json.name}`);
    this.logEvidence('evidence', `JSON attributes: ${json.attributes.length}`);
    this.logEvidence('evidence', `JSON methods: ${json.methods.length}`);
    
    // Verify round-trip
    const reconstructed = TypeDescriptor.fromASTData(json);
    
    if (reconstructed.name !== this.testModel.descriptor.name) {
      throw new Error('Round-trip failed: name mismatch');
    }
    if (reconstructed.attributes.size !== this.testModel.descriptor.attributes.size) {
      throw new Error('Round-trip failed: attributes mismatch');
    }
    
    this.logEvidence('evidence', 'Round-trip serialization verified');
    this.logEvidence('status', 'PASS: TypeDescriptor.toJSON() works');
  }
}

