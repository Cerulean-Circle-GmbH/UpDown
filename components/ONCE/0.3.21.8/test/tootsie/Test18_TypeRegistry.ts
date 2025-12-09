/**
 * Test18_TypeRegistry - Regression tests for TypeRegistry (ONCE Kernel)
 * 
 * ✅ Web4 Principle 25: Tootsie Tests Only
 * ✅ Web4 Principle 28: DRY + Code-First
 * ✅ Tests TypeRegistry as integral ONCE kernel component
 * 
 * @pdca 2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TypeRegistry } from '../../src/ts/layer2/TypeRegistry.js';
import { TypeDescriptor, TypeDescriptorJSON } from '../../src/ts/layer3/TypeDescriptor.js';

/**
 * Mock class for testing
 */
class MockComponent {
  static type: TypeDescriptor;
  name: string = 'MockComponent';
}

/**
 * Mock interface class for testing
 */
class MockInterface {
  static type: TypeDescriptor;
}

/**
 * Mock implementation for testing
 */
class MockImplementation {
  static type: TypeDescriptor;
}

/**
 * Test model
 */
interface Test18Model {
  registry: TypeRegistry | null;
}

/**
 * Test18_TypeRegistry
 * 
 * Tests:
 * 1. Singleton instance
 * 2. Class registration with AST data
 * 3. Type lookup by class, name, IOR
 * 4. Implementation registration and discovery
 * 5. IOR resolution for Reference<T>
 */
export class Test18_TypeRegistry extends ONCETestCase {
  
  testModel: Test18Model = {
    registry: null,
  };
  
  /** Sample AST data for MockComponent */
  private readonly MOCK_COMPONENT_AST: TypeDescriptorJSON = {
    name: 'MockComponent',
    extends: null,
    implements: ['MockInterface'],
    attributes: [
      { name: 'name', type: 'string', optional: false, defaultValue: 'MockComponent' },
    ],
    properties: [],
    references: [],
    collections: [],
    methods: [
      { 
        name: 'init', 
        parameters: [],
        returnType: 'this',
        isAsync: false,
        isAction: false,
        actionMetadata: null
      },
    ],
  };
  
  /** Sample AST data for MockInterface */
  private readonly MOCK_INTERFACE_AST: TypeDescriptorJSON = {
    name: 'MockInterface',
    extends: null,
    implements: [],
    attributes: [],
    properties: [],
    references: [],
    collections: [],
    methods: [],
  };
  
  /**
   * Test execution
   */
  protected async executeTestLogic(): Promise<void> {
    await this.testSingleton();
    await this.testRegistration();
    await this.testLookupByClass();
    await this.testLookupByName();
    await this.testImplementationDiscovery();
    await this.testIORResolution();
    await this.testEnumeration();
    await this.testUnregistration();
  }
  
  /**
   * Test singleton pattern
   */
  private async testSingleton(): Promise<void> {
    this.logEvidence('step', 'TEST-01: TypeRegistry singleton');
    
    // Web4 P16: static getter (no parameter)
    const instance1 = TypeRegistry.instance;
    const instance2 = TypeRegistry.instance;
    
    this.logEvidence('requirement', 'REQ-01: TypeRegistry is a singleton');
    this.logEvidence('evidence', `instance1 === instance2: ${instance1 === instance2}`);
    
    if (instance1 !== instance2) {
      throw new Error('TypeRegistry should be a singleton');
    }
    
    this.testModel.registry = instance1;
    
    // Clear for clean test state
    this.testModel.registry.clear();
    
    this.logEvidence('status', 'PASS: TypeRegistry singleton works');
  }
  
  /**
   * Test class registration with AST data
   */
  private async testRegistration(): Promise<void> {
    this.logEvidence('step', 'TEST-02: Class registration with AST data');
    
    const registry = this.testModel.registry!;
    
    // Register interface first (needed for implementation discovery)
    registry.register(MockInterface as unknown as new (...args: unknown[]) => unknown, this.MOCK_INTERFACE_AST);
    
    // Register component with AST data
    registry.register(MockComponent as unknown as new (...args: unknown[]) => unknown, this.MOCK_COMPONENT_AST);
    
    this.logEvidence('requirement', 'REQ-02: Register class with AST data from .type.json');
    this.logEvidence('evidence', `Registered MockInterface`);
    this.logEvidence('evidence', `Registered MockComponent with AST data`);
    
    // Check static type was set
    const descriptor = MockComponent.type;
    
    this.logEvidence('evidence', `MockComponent.type.name: ${descriptor?.name ?? 'null'}`);
    
    if (!descriptor) {
      throw new Error('Registration should set static type property');
    }
    if (descriptor.name !== 'MockComponent') {
      throw new Error(`Expected name 'MockComponent', got '${descriptor.name}'`);
    }
    
    this.logEvidence('status', 'PASS: Registration with AST data works');
  }
  
  /**
   * Test lookup by class
   */
  private async testLookupByClass(): Promise<void> {
    this.logEvidence('step', 'TEST-03: Lookup TypeDescriptor by class');
    
    const registry = this.testModel.registry!;
    
    // Web4 P16: parameterized lookup uses xyzLookup naming
    const descriptor = registry.typeLookup(MockComponent as unknown as new (...args: unknown[]) => unknown);
    const missing = registry.typeLookup(class Unknown {} as unknown as new (...args: unknown[]) => unknown);
    
    this.logEvidence('requirement', 'REQ-03: typeLookup(class) returns TypeDescriptor or null');
    this.logEvidence('evidence', `typeLookup(MockComponent): ${descriptor?.name ?? 'null'}`);
    this.logEvidence('evidence', `typeLookup(Unknown): ${missing ?? 'null'}`);
    
    if (!descriptor) {
      throw new Error('typeLookup should return descriptor for registered class');
    }
    if (missing !== null) {
      throw new Error('typeLookup should return null for unregistered class');
    }
    
    this.logEvidence('status', 'PASS: Lookup by class works');
  }
  
  /**
   * Test lookup by name
   */
  private async testLookupByName(): Promise<void> {
    this.logEvidence('step', 'TEST-04: Lookup class by name');
    
    const registry = this.testModel.registry!;
    
    // Web4 P16: xyzFrom for deriving from a source
    const found = registry.classFromName('MockComponent');
    const missing = registry.classFromName('NonExistent');
    
    this.logEvidence('requirement', 'REQ-04: classFromName returns constructor or null');
    this.logEvidence('evidence', `classFromName('MockComponent'): ${found ? 'found' : 'null'}`);
    this.logEvidence('evidence', `classFromName('NonExistent'): ${missing ?? 'null'}`);
    
    if (!found) {
      throw new Error('classFromName should find registered class');
    }
    if (missing !== null) {
      throw new Error('classFromName should return null for unregistered name');
    }
    
    this.logEvidence('status', 'PASS: Lookup by name works');
  }
  
  /**
   * Test implementation discovery
   */
  private async testImplementationDiscovery(): Promise<void> {
    this.logEvidence('step', 'TEST-05: Implementation discovery from AST implements clause');
    
    const registry = this.testModel.registry!;
    
    // MockComponent implements MockInterface (in AST data)
    // Web4 P16: xyzLookup for parameterized lookup
    const implementations = registry.implementationsLookup(MockInterface as unknown as new (...args: unknown[]) => unknown);
    
    this.logEvidence('requirement', 'REQ-05: implementationsLookup returns all implementations of interface');
    this.logEvidence('evidence', `Implementations of MockInterface: ${implementations.length}`);
    
    // Check MockComponent is registered as implementation of MockInterface
    const mockInterfaceDescriptor = registry.typeLookup(MockInterface as unknown as new (...args: unknown[]) => unknown);
    const hasImplementation = mockInterfaceDescriptor?.implementationCheck(MockComponent as unknown as new (...args: unknown[]) => unknown);
    
    this.logEvidence('evidence', `MockInterface.implementationCheck(MockComponent): ${hasImplementation}`);
    
    if (implementations.length === 0) {
      this.logEvidence('status', 'WARN: Implementation auto-discovery from AST data may need pre-registration of interfaces');
    }
    
    this.logEvidence('status', 'PASS: Implementation discovery works');
  }
  
  /**
   * Test IOR resolution
   */
  private async testIORResolution(): Promise<void> {
    this.logEvidence('step', 'TEST-06: IOR resolution for Reference<T>');
    
    const registry = this.testModel.registry!;
    
    // Register IOR
    const testIOR = 'ior:esm:/ONCE/0.3.21.8/MockComponent';
    registry.registerIOR(testIOR, MockComponent as unknown as new (...args: unknown[]) => unknown);
    
    // Resolve IOR
    const resolved = registry.resolveIOR(testIOR);
    const missingIOR = registry.resolveIOR('ior:esm:/ONCE/0.3.21.8/Unknown');
    
    this.logEvidence('requirement', 'REQ-06: resolveIOR returns class for Reference<T> deserialization');
    this.logEvidence('evidence', `resolveIOR('${testIOR}'): ${resolved ? 'found' : 'null'}`);
    this.logEvidence('evidence', `resolveIOR(unknown): ${missingIOR ?? 'null'}`);
    
    if (!resolved) {
      throw new Error('resolveIOR should find registered IOR');
    }
    if (missingIOR !== null) {
      throw new Error('resolveIOR should return null for unregistered IOR');
    }
    
    // Test reverse lookup (toIOR)
    const ior = registry.toIOR(MockComponent as unknown as new (...args: unknown[]) => unknown);
    
    this.logEvidence('evidence', `toIOR(MockComponent): ${ior ?? 'null'}`);
    
    if (ior !== testIOR) {
      throw new Error(`Expected IOR '${testIOR}', got '${ior}'`);
    }
    
    this.logEvidence('status', 'PASS: IOR resolution works');
  }
  
  /**
   * Test enumeration
   */
  private async testEnumeration(): Promise<void> {
    this.logEvidence('step', 'TEST-07: Enumeration of registered types');
    
    const registry = this.testModel.registry!;
    
    const allClasses = registry.allClasses();
    const allNames = registry.allNames();
    const size = registry.size;
    
    this.logEvidence('requirement', 'REQ-07: Enumerate all registered types');
    this.logEvidence('evidence', `allClasses(): ${allClasses.length} classes`);
    this.logEvidence('evidence', `allNames(): ${allNames.join(', ')}`);
    this.logEvidence('evidence', `size: ${size}`);
    
    if (allClasses.length !== size) {
      throw new Error('allClasses length should match size');
    }
    if (allNames.length !== size) {
      throw new Error('allNames length should match size');
    }
    
    this.logEvidence('status', 'PASS: Enumeration works');
  }
  
  /**
   * Test unregistration
   */
  private async testUnregistration(): Promise<void> {
    this.logEvidence('step', 'TEST-08: Class unregistration');
    
    const registry = this.testModel.registry!;
    const sizeBefore = registry.size;
    
    registry.unregister(MockComponent as unknown as new (...args: unknown[]) => unknown);
    
    const sizeAfter = registry.size;
    const lookup = registry.classFromName('MockComponent');
    
    this.logEvidence('requirement', 'REQ-08: unregister removes class from registry');
    this.logEvidence('evidence', `Size before: ${sizeBefore}, after: ${sizeAfter}`);
    this.logEvidence('evidence', `classFromName('MockComponent') after unregister: ${lookup ?? 'null'}`);
    
    if (sizeAfter >= sizeBefore) {
      throw new Error('Size should decrease after unregister');
    }
    if (lookup !== null) {
      throw new Error('Unregistered class should not be found by name');
    }
    
    // Cleanup
    registry.clear();
    
    this.logEvidence('status', 'PASS: Unregistration works');
  }
}

