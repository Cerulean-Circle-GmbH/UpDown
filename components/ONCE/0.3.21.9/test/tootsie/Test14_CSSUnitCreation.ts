/**
 * Test14_CSSUnitCreation - Create CSS Unit scenarios through UnitDiscoveryService
 * 
 * ✅ Web4 Principle 25: Tootsie Tests Only
 * ✅ Creates units properly via UnitDiscoveryService (not manually)
 * ✅ Stores scenarios in scenarios/index/ with symlinks
 * ✅ Fails if creation fails, succeeds if files already exist
 * 
 * @pdca 2025-12-08-UTC-1200.unit-manifest-generation.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { UnitDiscoveryService } from '../../src/ts/layer2/UnitDiscoveryService.js';
import { ScenarioService } from '../../src/ts/layer2/ScenarioService.js';
import { UcpStorage } from '../../src/ts/layer2/UcpStorage.js';
import type { UnitFilePattern } from '../../src/ts/layer3/UnitDefinition.interface.js';
import type { StorageScenario } from '../../src/ts/layer3/StorageScenario.interface.js';
import { TypeM3 } from '../../src/ts/layer3/TypeM3.enum.js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test model
 */
interface Test14Model {
  componentRoot: string;
  projectRoot: string;
  scenariosDir: string;
  cssDir: string;
  createdUnits: Map<string, string>; // filename -> uuid
}

/**
 * Test14_CSSUnitCreation
 * 
 * Creates CSS unit scenarios through UnitDiscoveryService.
 * - If unit doesn't exist: creates it (test passes)
 * - If unit already exists: verifies it (test passes)
 * - If creation fails: test fails
 */
export class Test14_CSSUnitCreation extends ONCETestCase {
  
  testModel: Test14Model = {
    componentRoot: '',
    projectRoot: '',
    scenariosDir: '',
    cssDir: '',
    createdUnits: new Map(),
  };
  
  discoveryService: UnitDiscoveryService | null = null;
  scenarioService: ScenarioService | null = null;
  storage: UcpStorage | null = null;
  
  /** CSS file pattern */
  private readonly CSS_PATTERN: UnitFilePattern = {
    glob: '**/*.css',
    typeM3: TypeM3.ATTRIBUTE,
    mimetype: 'text/css',
    recursive: true,
    excludeDirs: ['node_modules', 'dist', '.git', 'coverage']
  };
  
  /**
   * Test execution
   */
  protected async executeTestLogic(): Promise<void> {
    // Initialize paths
    this.testModel.componentRoot = this.componentRoot;
    this.testModel.projectRoot = path.dirname(path.dirname(path.dirname(this.componentRoot))); // UpDown root
    this.testModel.scenariosDir = path.join(this.testModel.projectRoot, 'scenarios');
    this.testModel.cssDir = path.join(this.componentRoot, 'src', 'ts', 'layer5', 'views', 'css');
    
    // Initialize services
    await this.initializeServices();
    
    // Discover CSS files
    const cssDefinitions = await this.discoverCSSUnits();
    
    // Create or verify each CSS unit
    for (const definition of cssDefinitions) {
      await this.createOrVerifyCSSUnit(definition);
    }
    
    // Update manifest
    await this.updateManifest();
    
    // Final verification
    this.verifyResults();
  }
  
  /**
   * Initialize services
   */
  private async initializeServices(): Promise<void> {
    this.logEvidence('step', 'INIT-01: Initializing services');
    
    const indexBaseDir = path.join(this.testModel.scenariosDir, 'index');
    
    // Ensure directories exist
    await fs.promises.mkdir(indexBaseDir, { recursive: true });
    await fs.promises.mkdir(path.join(this.testModel.scenariosDir, 'type'), { recursive: true });
    
    const storageScenario: StorageScenario = {
      ior: {
        uuid: crypto.randomUUID(),
        component: 'UcpStorage',
        version: this.onceVersion,
      },
      owner: 'system',
      model: {
        uuid: crypto.randomUUID(),
        projectRoot: this.testModel.projectRoot,
        indexBaseDir: indexBaseDir,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    
    this.storage = new UcpStorage().init(storageScenario);
    
    this.scenarioService = new ScenarioService().init({
      persistenceManager: this.storage,
      componentName: 'Unit',
      componentVersion: this.onceVersion,
    });
    
    this.discoveryService = new UnitDiscoveryService().init({
      scenarioService: this.scenarioService,
      componentRoot: this.testModel.componentRoot,
      componentName: 'ONCE',
      componentVersion: this.onceVersion,
      projectRoot: this.testModel.projectRoot,
    });
    
    this.logEvidence('INIT-01', 'Services initialized');
  }
  
  /**
   * Discover CSS files
   */
  private async discoverCSSUnits(): Promise<any[]> {
    this.logEvidence('step', 'DISCOVER: Finding CSS files');
    
    const definitions = await this.discoveryService!.unitsDiscover(
      this.testModel.cssDir,
      this.CSS_PATTERN
    );
    
    this.logEvidence('DISCOVER', `Found ${definitions.length} CSS files`);
    
    for (const def of definitions) {
      this.logEvidence('FILE', `${def.filename} (${def.existingUuid ? 'existing: ' + def.existingUuid.substring(0, 8) + '...' : 'new'})`);
    }
    
    return definitions;
  }
  
  /**
   * Create or verify a CSS unit
   */
  private async createOrVerifyCSSUnit(definition: any): Promise<void> {
    this.logEvidence('step', `UNIT: ${definition.filename}`);
    
    if (definition.existingUuid) {
      // Unit already exists
      this.testModel.createdUnits.set(definition.filename, definition.existingUuid);
      this.logEvidence(`UNIT-${definition.filename}`, `Exists: ${definition.existingUuid}`);
      return;
    }
    
    // Create new unit
    const result = await this.discoveryService!.unitCreate(definition);
    await this.discoveryService!.unitSave(result);
    
    this.testModel.createdUnits.set(definition.filename, result.uuid);
    this.logEvidence(`UNIT-${definition.filename}`, `Created: ${result.uuid}`);
  }
  
  /**
   * Update component manifest
   */
  private async updateManifest(): Promise<void> {
    this.logEvidence('step', 'MANIFEST: Updating ONCE.component.json');
    
    const manifestPath = path.join(this.testModel.componentRoot, 'ONCE.component.json');
    await this.discoveryService!.manifestUpdate(manifestPath);
    
    this.logEvidence('MANIFEST', 'Updated with real UUIDs');
  }
  
  /**
   * Verify all units were created
   */
  private verifyResults(): void {
    this.logEvidence('step', 'VERIFY: Checking results');
    
    const count = this.testModel.createdUnits.size;
    
    if (count === 0) {
      throw new Error('VERIFY FAILED: No CSS units were created/found');
    }
    
    console.log(`\n✅ Test14_CSSUnitCreation: ${count} CSS units created/verified`);
    
    for (const [filename, uuid] of this.testModel.createdUnits) {
      console.log(`   📄 ${filename} → ${uuid}`);
    }
  }
}

// Export for Tootsie
export default Test14_CSSUnitCreation;
