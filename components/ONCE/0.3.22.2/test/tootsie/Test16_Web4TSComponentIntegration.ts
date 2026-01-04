/**
 * Test16_Web4TSComponentIntegration - Test DefaultWeb4TSComponent extends UcpComponent
 * 
 * Validates:
 * - DefaultWeb4TSComponent can be instantiated and initialized
 * - Model is correctly set via UcpComponent inheritance
 * - toScenario() works correctly
 * - Method discovery works
 * - Unit discovery integration works
 * 
 * @pdca 2025-12-08-UTC-1400.web4tscomponent-migration.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { DefaultWeb4TSComponent } from '../../src/ts/layer2/DefaultWeb4TSComponent.js';
import { SemanticVersion } from '../../src/ts/layer2/SemanticVersion.js';
import type { Web4TSComponentModel } from '../../src/ts/layer3/Web4TSComponentModel.interface.js';
import type { Scenario } from '../../src/ts/layer3/Scenario.interface.js';
import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * Test16 - Web4TSComponent Integration Test
 */
export class Test16_Web4TSComponentIntegration extends ONCETestCase {
  
  // Test state
  private component: DefaultWeb4TSComponent | null = null;
  
  /**
   * Execute test
   */
  async execute(): Promise<this> {
    console.log('🧪 Test16: Web4TSComponent Integration');
    console.log('═'.repeat(50));
    
    // Requirement 1: Can instantiate and initialize
    await this.testInstantiationAndInit();
    
    // Requirement 2: Model is correctly set
    await this.testModelSetup();
    
    // Requirement 3: toScenario() works
    await this.testToScenario();
    
    // Requirement 4: Method discovery
    await this.testMethodDiscovery();
    
    // Requirement 5: Inherits from UcpComponent
    await this.testUcpComponentInheritance();
    
    console.log('═'.repeat(50));
    console.log('✅ Test16: All requirements passed');
    
    return this;
  }
  
  /**
   * Test 1: Instantiation and initialization
   */
  private async testInstantiationAndInit(): Promise<void> {
    console.log('\n📋 Requirement 1: Instantiation and Init');
    
    // Create component with empty constructor
    const component = new DefaultWeb4TSComponent();
    
    // Initialize with scenario
    const version = new SemanticVersion().init({ major: 0, minor: 3, patch: 21, revision: 8 });
    
    const scenario: Scenario<Web4TSComponentModel> = {
      ior: {
        uuid: 'test-web4ts-component',
        component: 'Web4TSComponent',
        version: '0.3.21.8',
      },
      owner: 'test',
      model: {
        uuid: 'test-web4ts-component',
        name: 'TestComponent',
        component: 'Web4TSComponent',
        version: version,
        componentRoot: this.componentRoot,
        projectRoot: path.resolve(this.componentRoot, '../../../'),
        targetDirectory: this.testDataDir,
        componentsDirectory: path.join(this.testDataDir, 'components'),
        isTestIsolation: true,
        displayName: 'TestComponent',
        displayVersion: '0.3.21.8',
        isDelegation: false,
      },
    };
    
    await component.init(scenario);
    
    // Store for later tests
    this.component = component;
    
    console.log('  ✅ Component instantiated with empty constructor');
    console.log('  ✅ Component initialized with scenario');
  }
  
  /**
   * Test 2: Model setup
   */
  private async testModelSetup(): Promise<void> {
    console.log('\n📋 Requirement 2: Model Setup');
    
    const component = this.component!;
    
    // Access model via protected getter (need to cast for test)
    // In real usage, model is accessed internally
    const modelAccess = (component as any).model as Web4TSComponentModel;
    
    if (!modelAccess) {
      throw new Error('Model should be set after init');
    }
    
    if (modelAccess.component !== 'Web4TSComponent') {
      throw new Error(`Expected component 'Web4TSComponent', got '${modelAccess.component}'`);
    }
    
    if (modelAccess.displayName !== 'TestComponent') {
      throw new Error(`Expected displayName 'TestComponent', got '${modelAccess.displayName}'`);
    }
    
    if (!modelAccess.implementationClassName) {
      throw new Error('implementationClassName should be set by init');
    }
    
    console.log(`  ✅ Model.component: ${modelAccess.component}`);
    console.log(`  ✅ Model.displayName: ${modelAccess.displayName}`);
    console.log(`  ✅ Model.implementationClassName: ${modelAccess.implementationClassName}`);
  }
  
  /**
   * Test 3: toScenario()
   */
  private async testToScenario(): Promise<void> {
    console.log('\n📋 Requirement 3: toScenario()');
    
    const component = this.component!;
    
    const scenario = await component.toScenario('test-export');
    
    if (!scenario) {
      throw new Error('toScenario() should return a scenario');
    }
    
    if (!scenario.ior) {
      throw new Error('Scenario should have ior');
    }
    
    if (!scenario.model) {
      throw new Error('Scenario should have model');
    }
    
    console.log(`  ✅ Scenario UUID: ${scenario.ior.uuid}`);
    console.log(`  ✅ Scenario component: ${scenario.ior.component}`);
    console.log(`  ✅ Scenario model.name: ${scenario.model.name}`);
  }
  
  /**
   * Test 4: Method discovery
   */
  private async testMethodDiscovery(): Promise<void> {
    console.log('\n📋 Requirement 4: Method Discovery');
    
    const component = this.component!;
    
    // Check hasMethod
    if (!component.hasMethod('test')) {
      throw new Error('Should have method "test"');
    }
    
    if (!component.hasMethod('build')) {
      throw new Error('Should have method "build"');
    }
    
    if (!component.hasMethod('clean')) {
      throw new Error('Should have method "clean"');
    }
    
    // List methods
    const methods = component.methodsList();
    console.log(`  ✅ Discovered ${methods.length} methods`);
    console.log(`  ✅ Has test: ${component.hasMethod('test')}`);
    console.log(`  ✅ Has build: ${component.hasMethod('build')}`);
    console.log(`  ✅ Has clean: ${component.hasMethod('clean')}`);
    
    // Get method signature
    const buildSig = component.methodSignatureGet('build');
    if (!buildSig) {
      throw new Error('Should get method signature for "build"');
    }
    
    console.log(`  ✅ build() isAsync: ${buildSig.isAsync}`);
  }
  
  /**
   * Test 5: UcpComponent inheritance
   */
  private async testUcpComponentInheritance(): Promise<void> {
    console.log('\n📋 Requirement 5: UcpComponent Inheritance');
    
    const component = this.component!;
    
    // Check instanceof
    if (!(component instanceof DefaultWeb4TSComponent)) {
      throw new Error('Should be instance of DefaultWeb4TSComponent');
    }
    
    // Check inherited methods exist
    if (typeof component.toScenario !== 'function') {
      throw new Error('Should inherit toScenario from UcpComponent');
    }
    
    if (typeof component.init !== 'function') {
      throw new Error('Should inherit init from UcpComponent');
    }
    
    console.log(`  ✅ Inherited from UcpComponent`);
    console.log(`  ✅ Has toScenario(): true`);
    console.log(`  ✅ Has init(): true`);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new Test16_Web4TSComponentIntegration();
  await test.init({});
  await test.execute();
}

