/**
 * Test13_ScenarioServiceMigration - Tootsie test for ScenarioService migration
 * 
 * Tests the convention-based scenario migration system:
 * - Legacy scenarios (no unit) get unit metadata added
 * - Old version scenarios get upgraded via upgradeScenarioFromX_Y_Z()
 * - Schema version tracking works correctly
 * 
 * @pdca 2025-12-08-UTC-1000.scenario-unit-unification.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { ScenarioService } from '../../src/ts/layer2/ScenarioService.js';
import { UcpStorage } from '../../src/ts/layer2/UcpStorage.js';
import { UcpComponent } from '../../src/ts/layer2/UcpComponent.js';
import type { Scenario } from '../../src/ts/layer3/Scenario.interface.js';
import type { Model } from '../../src/ts/layer3/Model.interface.js';
import type { StorageScenario } from '../../src/ts/layer3/StorageScenario.interface.js';
import { SCENARIO_SCHEMA_VERSION } from '../../src/ts/layer3/ScenarioUnit.interface.js';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Test model for scenarios
 */
interface TestModel extends Model {
  uuid: string;
  name: string;
  testValue: string;
}

/**
 * Test component with migration method
 */
class TestComponent extends UcpComponent<TestModel> {
  
  protected modelDefault(): TestModel {
    return {
      uuid: '',
      name: 'TestComponent',
      testValue: 'default',
    };
  }
  
  /**
   * Convention-based migration from 0.3.21.7
   */
  upgradeScenarioFrom0_3_21_7(scenario: Scenario<TestModel>): Scenario<TestModel> {
    // Example migration: rename field, add default
    const upgradedModel = {
      ...scenario.model,
      testValue: scenario.model.testValue || 'migrated-from-0.3.21.7',
    };
    
    return {
      ...scenario,
      model: upgradedModel,
    };
  }
}

/**
 * Test model for validation
 */
interface ScenarioServiceTestModel {
  componentRoot: string;
  projectRoot: string;
  testDataDir: string;
  scenariosDir: string;
}

/**
 * Test13_ScenarioServiceMigration
 */
export class Test13_ScenarioServiceMigration extends ONCETestCase {
  
  testModel: ScenarioServiceTestModel = {
    componentRoot: '',
    projectRoot: '',
    testDataDir: '',
    scenariosDir: '',
  };
  
  scenarioService: ScenarioService | null = null;
  storage: UcpStorage | null = null;
  testComponent: TestComponent | null = null;
  
  /**
   * Test execution
   */
  protected async executeTestLogic(): Promise<void> {
    // Initialize paths
    this.testModel.componentRoot = this.componentRoot;
    this.testModel.projectRoot = path.join(this.componentRoot, 'test', 'data');
    this.testModel.testDataDir = this.testModel.projectRoot;
    this.testModel.scenariosDir = path.join(this.testModel.projectRoot, 'scenarios');
    
    // Ensure clean test directory
    await this.cleanupTestDirectory();
    await this.createTestDirectories();
    
    // Initialize storage
    await this.initializeStorage();
    
    // Initialize test component
    this.testComponent = new TestComponent();
    await this.testComponent.init();
    
    // Initialize ScenarioService
    this.scenarioService = new ScenarioService().init({
      persistenceManager: this.storage!,
      component: this.testComponent as unknown as UcpComponent<Model>,
      componentName: 'TestComponent',
      componentVersion: '0.3.21.8',
    });
    
    // Run tests
    await this.testLegacyScenarioMigration();
    await this.testVersionMigration();
    await this.testScenarioCreate();
    await this.testReferenceTracking();
    
    // Cleanup
    await this.cleanupTestDirectory();
  }
  
  /**
   * Test legacy scenario (no unit) gets unit metadata
   */
  private async testLegacyScenarioMigration(): Promise<void> {
    this.logEvidence('step', 'MIGRATE-01: Testing legacy scenario migration');
    
    // Create a legacy scenario (no unit field)
    const legacyScenario: Scenario<TestModel> = {
      ior: {
        uuid: 'legacy-test-uuid-0001',
        component: 'TestComponent',
        version: '0.3.21.8',
      },
      owner: 'test-owner',
      model: {
        uuid: 'legacy-test-uuid-0001',
        name: 'LegacyTest',
        testValue: 'legacy-value',
      },
      // Note: No unit field!
    };
    
    // Migrate the scenario
    const migrated = this.scenarioService!.scenarioMigrate(legacyScenario);
    
    // Validate
    const hasUnit = migrated.unit !== undefined;
    const hasIndexPath = migrated.unit?.indexPath !== undefined;
    const hasSchemaVersion = migrated.unit?.schemaVersion === SCENARIO_SCHEMA_VERSION;
    const hasCreatedBy = migrated.unit?.createdBy?.includes('TestComponent');
    
    this.logEvidence('MIGRATE-01', `Legacy scenario got unit metadata: ${hasUnit && hasIndexPath && hasSchemaVersion}`);
    
    if (!hasUnit || !hasIndexPath || !hasSchemaVersion) {
      throw new Error('MIGRATE-01 FAILED: Legacy scenario not properly migrated');
    }
    
    console.log('✅ MIGRATE-01: Legacy scenario migration works');
  }
  
  /**
   * Test version migration via convention method
   */
  private async testVersionMigration(): Promise<void> {
    this.logEvidence('step', 'MIGRATE-02: Testing version migration via convention');
    
    // Create a scenario from old version
    const oldVersionScenario: Scenario<TestModel> = {
      ior: {
        uuid: 'old-version-uuid-0001',
        component: 'TestComponent',
        version: '0.3.21.7',  // Old version
      },
      owner: 'test-owner',
      model: {
        uuid: 'old-version-uuid-0001',
        name: 'OldVersionTest',
        testValue: '',  // Empty, should be filled by migration
      },
    };
    
    // Migrate the scenario (should call upgradeScenarioFrom0_3_21_7)
    const migrated = this.scenarioService!.scenarioMigrate(oldVersionScenario);
    
    // Validate
    const versionUpdated = migrated.ior.version === '0.3.21.8';
    const valueMigrated = migrated.model.testValue === 'migrated-from-0.3.21.7';
    const hasUnit = migrated.unit !== undefined;
    
    this.logEvidence('MIGRATE-02', `Version migration worked: ${versionUpdated && valueMigrated && hasUnit}`);
    
    if (!versionUpdated || !valueMigrated || !hasUnit) {
      throw new Error(`MIGRATE-02 FAILED: Version migration failed. Version: ${migrated.ior.version}, Value: ${migrated.model.testValue}`);
    }
    
    console.log('✅ MIGRATE-02: Version migration via convention works');
  }
  
  /**
   * Test scenario creation with unit metadata
   */
  private async testScenarioCreate(): Promise<void> {
    this.logEvidence('step', 'CREATE-01: Testing scenario creation with unit');
    
    const testUuid = 'create-test-uuid-0001';
    
    // Create scenario via service
    const created = this.scenarioService!.scenarioCreate<TestModel>({
      uuid: testUuid,
      model: {
        uuid: testUuid,
        name: 'CreatedTest',
        testValue: 'created-value',
      },
      owner: 'test-owner',
      symlinkPaths: ['type/TestComponent/0.3.21.8'],
    });
    
    // Validate
    const hasUnit = created.unit !== undefined;
    const hasIndexPath = created.unit?.indexPath.includes(testUuid);
    const hasSymlinks = created.unit?.symlinkPaths.length === 1;
    const hasSchemaVersion = created.unit?.schemaVersion === SCENARIO_SCHEMA_VERSION;
    
    this.logEvidence('CREATE-01', `Scenario created with unit: ${hasUnit && hasIndexPath && hasSymlinks && hasSchemaVersion}`);
    
    if (!hasUnit || !hasIndexPath || !hasSymlinks || !hasSchemaVersion) {
      throw new Error('CREATE-01 FAILED: Scenario not properly created with unit');
    }
    
    console.log('✅ CREATE-01: Scenario creation with unit works');
  }
  
  /**
   * Test reference tracking
   */
  private async testReferenceTracking(): Promise<void> {
    this.logEvidence('step', 'REF-01: Testing reference tracking');
    
    const testUuid = 'ref-test-uuid-0001';
    
    // Create scenario
    let scenario = this.scenarioService!.scenarioCreate<TestModel>({
      uuid: testUuid,
      model: {
        uuid: testUuid,
        name: 'RefTest',
        testValue: 'ref-value',
      },
      owner: 'test-owner',
    });
    
    // Track a reference
    scenario = this.scenarioService!.referenceTrack(
      scenario,
      'ior:local:ln:file:/workspace/scenarios/ontology/RefTest.unit',
      `ior:unit:${testUuid}`
    );
    
    // Validate
    const hasReferences = scenario.unit?.references.length === 1;
    const refHasLocation = scenario.unit?.references[0]?.linkLocation.includes('ontology');
    const refHasTarget = scenario.unit?.references[0]?.linkTarget.includes(testUuid);
    const refIsSynced = scenario.unit?.references[0]?.syncStatus === 'SYNCED';
    
    this.logEvidence('REF-01', `Reference tracking works: ${hasReferences && refHasLocation && refHasTarget && refIsSynced}`);
    
    if (!hasReferences || !refHasLocation || !refHasTarget || !refIsSynced) {
      throw new Error('REF-01 FAILED: Reference tracking failed');
    }
    
    console.log('✅ REF-01: Reference tracking works');
  }
  
  /**
   * Initialize storage for tests
   */
  private async initializeStorage(): Promise<void> {
    const storageScenario: StorageScenario = {
      ior: {
        uuid: 'test-storage-uuid',
        component: 'UcpStorage',
        version: '0.3.21.8',
      },
      owner: 'test-owner',
      model: {
        uuid: 'test-storage-uuid',
        projectRoot: this.testModel.projectRoot,
        indexBaseDir: path.join(this.testModel.scenariosDir, 'index'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    
    this.storage = new UcpStorage().init(storageScenario);
  }
  
  /**
   * Create test directories
   */
  private async createTestDirectories(): Promise<void> {
    const dirs = [
      this.testModel.scenariosDir,
      path.join(this.testModel.scenariosDir, 'index'),
      path.join(this.testModel.scenariosDir, 'type'),
      path.join(this.testModel.scenariosDir, 'domain'),
    ];
    
    for (const dir of dirs) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  }
  
  /**
   * Cleanup test directory
   */
  private async cleanupTestDirectory(): Promise<void> {
    try {
      // Only cleanup the test scenarios dir
      if (fs.existsSync(this.testModel.scenariosDir)) {
        await fs.promises.rm(this.testModel.scenariosDir, { recursive: true, force: true });
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

// Export for Tootsie
export default Test13_ScenarioServiceMigration;





