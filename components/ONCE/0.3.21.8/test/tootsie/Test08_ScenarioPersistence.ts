/**
 * Test08_ScenarioPersistence - Verify scenario storage via PersistenceManager
 * 
 * ✅ Web4 Principle 24: RelatedObjects Registry for storage lookup
 * ✅ Web4 Principle 25: Tootsie Tests Only
 * 
 * Tests:
 * 1. UcpStorage saves scenarios to index/{uuid-folders}/
 * 2. Symlinks created in type/domain/capability
 * 3. Scenarios can be loaded by UUID
 * 4. Scenarios can be queried by type/domain
 * 5. Scenarios can be deleted with symlink cleanup
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { UcpStorage } from '../../src/ts/layer2/UcpStorage.js';
import type { StorageScenario } from '../../src/ts/layer3/StorageScenario.interface.js';
import type { Scenario } from '../../src/ts/layer3/Scenario.interface.js';
import type { Model } from '../../src/ts/layer3/Model.interface.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test model for scenario persistence
 */
interface TestScenarioModel extends Model {
  uuid: string;
  name: string;
  testValue: string;
  createdAt: string;
}

/**
 * Test08 Model - Radical OOP test state
 */
interface Test08Model {
  projectRoot: string;
  storage: UcpStorage | null;
  testScenarioUUID: string;
  testScenario: Scenario<TestScenarioModel> | null;
}

/**
 * Test08_ScenarioPersistence - Verify UcpStorage functionality
 */
export class Test08_ScenarioPersistence extends ONCETestCase {
  
  /** Test model - Radical OOP state */
  private testModel: Test08Model = {
    projectRoot: '',
    storage: null,
    testScenarioUUID: '',
    testScenario: null
  };
  
  /**
   * Empty constructor - Web4 Principle 6
   */
  constructor() {
    super();
  }
  
  /**
   * Execute test logic
   */
  protected async executeTestLogic(): Promise<void> {
    this.logEvidence('input', 'Scenario Persistence test', {
      testedClass: 'UcpStorage',
      principle: 'Web4 Principle 24'
    });
    
    // Initialize test environment
    await this.initializeTestEnvironment();
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 1: UcpStorage Initialization
    // ═══════════════════════════════════════════════════════════════
    const initReq = this.requirement('Storage Initialization', 'UcpStorage can be initialized with scenario');
    initReq.addCriterion('INIT-01', 'Test directory created');
    initReq.addCriterion('INIT-02', 'UcpStorage instance created');
    initReq.addCriterion('INIT-03', 'Test scenario created');
    
    // INIT-01: Test directory
    initReq.validateCriterion('INIT-01', fs.existsSync(this.testModel.projectRoot), {
      actual: this.testModel.projectRoot
    });
    
    // INIT-02: Create storage
    await this.createStorageInstance();
    initReq.validateCriterion('INIT-02', this.testModel.storage !== null, {
      actual: 'Storage initialized'
    });
    
    // INIT-03: Create scenario
    await this.createTestScenario();
    initReq.validateCriterion('INIT-03', this.testModel.testScenario !== null, {
      actual: `UUID: ${this.testModel.testScenarioUUID}`
    });
    
    if (!initReq.allCriteriaPassed()) {
      throw new Error(initReq.generateReport());
    }
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 2: Save and Verify Storage
    // ═══════════════════════════════════════════════════════════════
    const saveReq = this.requirement('Save and Verify', 'Scenarios saved to correct locations');
    saveReq.addCriterion('SAVE-01', 'Scenario saved without error');
    saveReq.addCriterion('SAVE-02', 'Scenario file exists in UUID index');
    saveReq.addCriterion('SAVE-03', 'Type symlink exists');
    saveReq.addCriterion('SAVE-04', 'Domain symlink exists');
    saveReq.addCriterion('SAVE-05', 'Capability symlink exists');
    
    // SAVE-01: Save scenario
    await this.saveScenario();
    saveReq.validateCriterion('SAVE-01', true, { actual: 'No exception' });
    
    // SAVE-02: Verify file
    const fileExists = this.verifyScenarioFile();
    saveReq.validateCriterion('SAVE-02', fileExists, { actual: fileExists });
    
    // SAVE-03: Type symlink
    const typeSymlink = this.verifyTypeSymlink();
    saveReq.validateCriterion('SAVE-03', typeSymlink, { actual: typeSymlink });
    
    // SAVE-04: Domain symlink
    const domainSymlink = this.verifyDomainSymlink();
    saveReq.validateCriterion('SAVE-04', domainSymlink, { actual: domainSymlink });
    
    // SAVE-05: Capability symlink
    const capSymlink = this.verifyCapabilitySymlink();
    saveReq.validateCriterion('SAVE-05', capSymlink, { actual: capSymlink });
    
    if (!saveReq.allCriteriaPassed()) {
      throw new Error(saveReq.generateReport());
    }
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 3: Load and Query
    // ═══════════════════════════════════════════════════════════════
    const loadReq = this.requirement('Load and Query', 'Scenarios can be loaded and queried');
    loadReq.addCriterion('LOAD-01', 'Scenario loads by UUID');
    loadReq.addCriterion('LOAD-02', 'Scenario found via type query');
    
    // LOAD-01: Load by UUID
    const loaded = await this.loadScenarioByUUID();
    loadReq.validateCriterion('LOAD-01', loaded, { actual: loaded });
    
    // LOAD-02: Query by type
    const found = await this.queryByType();
    loadReq.validateCriterion('LOAD-02', found, { actual: found });
    
    if (!loadReq.allCriteriaPassed()) {
      throw new Error(loadReq.generateReport());
    }
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 4: Delete and Cleanup
    // ═══════════════════════════════════════════════════════════════
    const deleteReq = this.requirement('Delete and Cleanup', 'Scenarios can be deleted');
    deleteReq.addCriterion('DEL-01', 'Scenario deleted');
    deleteReq.addCriterion('DEL-02', 'Test directory cleaned');
    
    // DEL-01: Delete scenario
    await this.deleteScenario();
    const deleted = !(await this.testModel.storage!.scenarioExists(this.testModel.testScenarioUUID));
    deleteReq.validateCriterion('DEL-01', deleted, { actual: deleted });
    
    // DEL-02: Cleanup test scenarios
    this.cleanupTestDirectory();
    const indexClean = !fs.existsSync(path.join(this.testModel.projectRoot, 'scenarios', 'index'));
    const typeClean = !fs.existsSync(path.join(this.testModel.projectRoot, 'scenarios', 'type'));
    const cleaned = indexClean && typeClean;
    deleteReq.validateCriterion('DEL-02', cleaned, { 
      actual: cleaned ? 'Cleaned' : `index=${indexClean}, type=${typeClean}` 
    });
    
    if (!deleteReq.allCriteriaPassed()) {
      throw new Error(deleteReq.generateReport());
    }
    
    this.logEvidence('output', 'All scenario persistence tests passed', {
      requirements: ['Storage Initialization', 'Save and Verify', 'Load and Query', 'Delete and Cleanup']
    });
  }
  
  /**
   * Initialize test environment
   * Uses test/data/scenarios for proper test isolation verification
   */
  private async initializeTestEnvironment(): Promise<void> {
    // Use test/data as project root for test isolation
    // This ensures symlinks are created in test/data/scenarios/type/, etc.
    this.testModel.projectRoot = path.join(this.componentRoot, 'test', 'data');
    
    // Create the directories (scenarios/index for UUID storage)
    fs.mkdirSync(path.join(this.testModel.projectRoot, 'scenarios', 'index'), { recursive: true });
    
    this.logEvidence('step', `Test directory: ${this.testModel.projectRoot}`);
  }
  
  /**
   * Create UcpStorage instance
   */
  private async createStorageInstance(): Promise<void> {
    const storageScenario: StorageScenario = {
      ior: {
        uuid: this.generateTestUUID(),
        component: 'UcpStorage',
        version: this.onceVersion
      },
      owner: 'test',
      model: {
        uuid: this.generateTestUUID(),
        projectRoot: this.testModel.projectRoot,
        indexBaseDir: path.join(this.testModel.projectRoot, 'scenarios', 'index'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    
    this.testModel.storage = new UcpStorage().init(storageScenario);
    this.logEvidence('step', 'UcpStorage instance created');
  }
  
  /**
   * Create test scenario
   */
  private async createTestScenario(): Promise<void> {
    this.testModel.testScenarioUUID = this.generateTestUUID();
    
    this.testModel.testScenario = {
      ior: {
        uuid: this.testModel.testScenarioUUID,
        component: 'TestComponent',
        version: '1.0.0.0'
      },
      owner: 'test-user',
      model: {
        uuid: this.testModel.testScenarioUUID,
        name: 'TestScenario',
        testValue: 'Hello Web4!',
        createdAt: new Date().toISOString()
      }
    };
    
    this.logEvidence('step', `Test scenario created: ${this.testModel.testScenarioUUID}`);
  }
  
  /**
   * Save scenario to storage
   */
  private async saveScenario(): Promise<void> {
    const symlinkPaths = [
      `type/TestComponent/1.0.0.0`,
      `domain/test.local/TestComponent/1.0.0.0`,
      `capability/testCap/testValue`
    ];
    
    await this.testModel.storage!.scenarioSave(
      this.testModel.testScenarioUUID,
      this.testModel.testScenario!,
      symlinkPaths
    );
    
    this.logEvidence('step', 'Scenario saved to storage');
  }
  
  /**
   * Verify scenario file exists
   * @returns true if file exists
   */
  private verifyScenarioFile(): boolean {
    const uuid = this.testModel.testScenarioUUID;
    // UUID folder structure: 5 single-char folders from first 5 chars of cleaned UUID
    const cleanUuid = uuid.replace(/-/g, '');
    const folderStructure = cleanUuid.substring(0, 5).split('');
    
    const scenarioPath = path.join(
      this.testModel.projectRoot,
      'scenarios', 'index',
      ...folderStructure,
      `${uuid}.scenario.json`
    );
    
    const exists = fs.existsSync(scenarioPath);
    this.logEvidence('step', `Scenario file check: ${scenarioPath} exists=${exists}`);
    return exists;
  }
  
  /**
   * Verify type symlink
   * @returns true if symlink exists
   */
  private verifyTypeSymlink(): boolean {
    const symlinkPath = path.join(
      this.testModel.projectRoot,
      'scenarios', 'type', 'TestComponent', '1.0.0.0',
      `${this.testModel.testScenarioUUID}.scenario.json`
    );
    
    const exists = fs.existsSync(symlinkPath);
    const isSymlink = exists && fs.lstatSync(symlinkPath).isSymbolicLink();
    this.logEvidence('step', `Type symlink check: ${symlinkPath} isSymlink=${isSymlink}`);
    return isSymlink;
  }
  
  /**
   * Verify domain symlink
   * @returns true if symlink exists
   */
  private verifyDomainSymlink(): boolean {
    const symlinkPath = path.join(
      this.testModel.projectRoot,
      'scenarios', 'domain', 'test.local', 'TestComponent', '1.0.0.0',
      `${this.testModel.testScenarioUUID}.scenario.json`
    );
    
    const exists = fs.existsSync(symlinkPath);
    const isSymlink = exists && fs.lstatSync(symlinkPath).isSymbolicLink();
    this.logEvidence('step', `Domain symlink check: ${symlinkPath} isSymlink=${isSymlink}`);
    return isSymlink;
  }
  
  /**
   * Verify capability symlink
   * @returns true if symlink exists
   */
  private verifyCapabilitySymlink(): boolean {
    const symlinkPath = path.join(
      this.testModel.projectRoot,
      'scenarios', 'capability', 'testCap', 'testValue',
      `${this.testModel.testScenarioUUID}.scenario.json`
    );
    
    const exists = fs.existsSync(symlinkPath);
    const isSymlink = exists && fs.lstatSync(symlinkPath).isSymbolicLink();
    this.logEvidence('step', `Capability symlink check: ${symlinkPath} isSymlink=${isSymlink}`);
    return isSymlink;
  }
  
  /**
   * Load scenario by UUID
   * @returns true if loaded correctly
   */
  private async loadScenarioByUUID(): Promise<boolean> {
    const loaded = await this.testModel.storage!.scenarioLoad<TestScenarioModel>(
      this.testModel.testScenarioUUID
    );
    
    const matches = 
      loaded.ior.uuid === this.testModel.testScenarioUUID &&
      loaded.model.testValue === 'Hello Web4!';
    
    this.logEvidence('step', `Scenario loaded: uuid=${loaded.ior.uuid} testValue=${loaded.model.testValue}`);
    return matches;
  }
  
  /**
   * Query scenarios by type
   * @returns true if found
   */
  private async queryByType(): Promise<boolean> {
    const results = await this.testModel.storage!.scenarioFind<TestScenarioModel>({
      component: 'TestComponent',
      version: '1.0.0.0'
    });
    
    const found = results.length > 0 && 
      results.some(s => s.ior?.uuid === this.testModel.testScenarioUUID);
    
    this.logEvidence('step', `Query result: found ${results.length} scenario(s), match=${found}`);
    return found;
  }
  
  /**
   * Delete scenario
   */
  private async deleteScenario(): Promise<void> {
    await this.testModel.storage!.scenarioDelete(
      this.testModel.testScenarioUUID,
      true // Remove symlinks
    );
    
    this.logEvidence('step', 'Scenario deleted');
  }
  
  /**
   * Cleanup test-created files (not entire test/data)
   */
  private cleanupTestDirectory(): void {
    try {
      const scenariosDir = path.join(this.testModel.projectRoot, 'scenarios');
      
      // Remove test-created symlink directories
      const dirsToClean = ['type', 'domain', 'capability', 'index'];
      for (const dir of dirsToClean) {
        const dirPath = path.join(scenariosDir, dir);
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
        }
      }
      
      this.logEvidence('step', 'Test scenarios cleaned up');
    } catch {
      this.logEvidence('step', 'Cleanup warning: some files may remain');
    }
  }
  
  /**
   * Generate a test UUID
   */
  private generateTestUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

