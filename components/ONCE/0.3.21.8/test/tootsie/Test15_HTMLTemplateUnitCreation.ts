/**
 * Test15_HTMLTemplateUnitCreation - Create HTML Template Unit scenarios
 * 
 * ✅ Web4 Principle 25: Tootsie Tests Only
 * ✅ Creates units properly via UnitDiscoveryService
 * ✅ Stores scenarios in scenarios/index/ with symlinks
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
interface Test15Model {
  componentRoot: string;
  projectRoot: string;
  scenariosDir: string;
  viewDir: string;
  createdUnits: Map<string, string>;
}

/**
 * Test15_HTMLTemplateUnitCreation
 */
export class Test15_HTMLTemplateUnitCreation extends ONCETestCase {
  
  testModel: Test15Model = {
    componentRoot: '',
    projectRoot: '',
    scenariosDir: '',
    viewDir: '',
    createdUnits: new Map(),
  };
  
  discoveryService: UnitDiscoveryService | null = null;
  scenarioService: ScenarioService | null = null;
  storage: UcpStorage | null = null;
  
  /** HTML file pattern */
  private readonly HTML_PATTERN: UnitFilePattern = {
    glob: '**/*.html',
    typeM3: TypeM3.ATTRIBUTE,
    mimetype: 'text/html',
    recursive: true,
    excludeDirs: ['node_modules', 'dist', '.git', 'coverage']
  };
  
  /**
   * Test execution
   */
  protected async executeTestLogic(): Promise<void> {
    this.testModel.componentRoot = this.componentRoot;
    this.testModel.projectRoot = path.dirname(path.dirname(path.dirname(this.componentRoot)));
    this.testModel.scenariosDir = path.join(this.testModel.projectRoot, 'scenarios');
    this.testModel.viewDir = path.join(this.componentRoot, 'src', 'view', 'html');
    
    await this.initializeServices();
    
    const htmlDefinitions = await this.discoverHTMLUnits();
    
    for (const definition of htmlDefinitions) {
      await this.createOrVerifyHTMLUnit(definition);
    }
    
    await this.updateManifest();
    this.verifyResults();
  }
  
  /**
   * Initialize services
   */
  private async initializeServices(): Promise<void> {
    this.logEvidence('step', 'INIT-01: Initializing services');
    
    const indexBaseDir = path.join(this.testModel.scenariosDir, 'index');
    await fs.promises.mkdir(indexBaseDir, { recursive: true });
    
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
   * Discover HTML files
   */
  private async discoverHTMLUnits(): Promise<any[]> {
    this.logEvidence('step', 'DISCOVER: Finding HTML files');
    
    const definitions = await this.discoveryService!.unitsDiscover(
      this.testModel.viewDir,
      this.HTML_PATTERN
    );
    
    this.logEvidence('DISCOVER', `Found ${definitions.length} HTML files`);
    
    for (const def of definitions) {
      this.logEvidence('FILE', `${def.filename} (${def.existingUuid ? 'existing' : 'new'})`);
    }
    
    return definitions;
  }
  
  /**
   * Create or verify an HTML unit
   */
  private async createOrVerifyHTMLUnit(definition: any): Promise<void> {
    this.logEvidence('step', `UNIT: ${definition.filename}`);
    
    if (definition.existingUuid) {
      this.testModel.createdUnits.set(definition.filename, definition.existingUuid);
      this.logEvidence(`UNIT-${definition.filename}`, `Exists: ${definition.existingUuid}`);
      return;
    }
    
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
    this.logEvidence('MANIFEST', 'Updated');
  }
  
  /**
   * Verify results
   */
  private verifyResults(): void {
    this.logEvidence('step', 'VERIFY: Checking results');
    const count = this.testModel.createdUnits.size;
    
    console.log(`\n✅ Test15_HTMLTemplateUnitCreation: ${count} HTML units created/verified`);
    
    for (const [filename, uuid] of this.testModel.createdUnits) {
      console.log(`   📄 ${filename} → ${uuid}`);
    }
  }
}

export default Test15_HTMLTemplateUnitCreation;





