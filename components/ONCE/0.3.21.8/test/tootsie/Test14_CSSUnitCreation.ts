/**
 * Test14_CSSUnitCreation - Create CSS Unit scenarios through ScenarioService
 * 
 * ✅ Web4 Principle 25: Tootsie Tests Only
 * ✅ Creates units properly via ScenarioService (not manually)
 * ✅ Stores scenarios in index/ with symlinks
 * ✅ Fails if creation fails, succeeds if files already exist
 * 
 * @pdca 2025-12-08-UTC-1000.scenario-unit-unification.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { ScenarioService } from '../../src/ts/layer2/ScenarioService.js';
import { UcpStorage } from '../../src/ts/layer2/UcpStorage.js';
import type { Scenario } from '../../src/ts/layer3/Scenario.interface.js';
import type { StorageScenario } from '../../src/ts/layer3/StorageScenario.interface.js';
import { TypeM3 } from '../../src/ts/layer3/TypeM3.enum.js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CSS Unit Model - extends base Model with CSS-specific fields
 */
interface CSSUnitModel {
  uuid: string;
  name: string;
  typeM3: TypeM3;
  origin: string;
  definition: string;
  cssPath: string;
  mimetype: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * CSS file definition for unit creation
 */
interface CSSFileDefinition {
  filename: string;
  relativePath: string;
  description: string;
}

/**
 * Test model
 */
interface Test14Model {
  componentRoot: string;
  projectRoot: string;
  scenariosDir: string;
  cssDir: string;
  cssFiles: CSSFileDefinition[];
  createdUnits: Map<string, string>; // filename -> uuid
}

/**
 * Test14_CSSUnitCreation
 * 
 * Creates CSS unit scenarios through ScenarioService.
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
    cssFiles: [],
    createdUnits: new Map(),
  };
  
  scenarioService: ScenarioService | null = null;
  storage: UcpStorage | null = null;
  
  /**
   * CSS files to create units for
   */
  private readonly CSS_FILES: CSSFileDefinition[] = [
    {
      filename: 'OnceOverView.css',
      relativePath: 'src/ts/layer5/views/css/OnceOverView.css',
      description: 'CSS stylesheet for OnceOverView Lit component - main dashboard grid layout'
    },
    {
      filename: 'OncePeerItemView.css',
      relativePath: 'src/ts/layer5/views/css/OncePeerItemView.css',
      description: 'CSS stylesheet for OncePeerItemView Lit component - peer card styling'
    },
    {
      filename: 'DefaultItemView.css',
      relativePath: 'src/ts/layer5/views/css/DefaultItemView.css',
      description: 'CSS stylesheet for DefaultItemView Lit component - base item card styling'
    },
    {
      filename: 'ItemView.css',
      relativePath: 'src/ts/layer5/views/css/ItemView.css',
      description: 'CSS stylesheet for ItemView interface - shared item styling'
    },
    {
      filename: 'themeBase.css',
      relativePath: 'src/ts/layer5/views/css/themeBase.css',
      description: 'CSS stylesheet for base theme variables and shared styles'
    },
    {
      filename: 'OncePeerDefaultView.css',
      relativePath: 'src/ts/layer5/views/css/OncePeerDefaultView.css',
      description: 'CSS stylesheet for OncePeerDefaultView Lit component - full page peer view'
    },
    {
      filename: 'RouteOverView.css',
      relativePath: 'src/ts/layer5/views/css/RouteOverView.css',
      description: 'CSS stylesheet for RouteOverView Lit component - route listing view'
    }
  ];
  
  /**
   * Test execution
   */
  protected async executeTestLogic(): Promise<void> {
    // Initialize paths
    this.testModel.componentRoot = this.componentRoot;
    this.testModel.projectRoot = path.dirname(path.dirname(path.dirname(this.componentRoot))); // UpDown root
    this.testModel.scenariosDir = path.join(this.testModel.projectRoot, 'scenarios');
    this.testModel.cssDir = path.join(this.componentRoot, 'src', 'ts', 'layer5', 'views', 'css');
    this.testModel.cssFiles = this.CSS_FILES;
    
    // Initialize storage and service
    await this.initializeServices();
    
    // Create or verify each CSS unit
    for (const cssFile of this.testModel.cssFiles) {
      await this.createOrVerifyCSSUnit(cssFile);
    }
    
    // Verify all units were created/verified
    await this.verifyAllUnitsExist();
    
    // Update ONCE.component.json with actual UUIDs
    await this.updateComponentJson();
  }
  
  /**
   * Initialize storage and ScenarioService
   */
  private async initializeServices(): Promise<void> {
    this.logEvidence('step', 'INIT-01: Initializing ScenarioService');
    
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
    
    this.logEvidence('INIT-01', 'ScenarioService initialized');
  }
  
  /**
   * Create or verify a CSS unit scenario
   */
  private async createOrVerifyCSSUnit(cssFile: CSSFileDefinition): Promise<void> {
    const unitLinkPath = path.join(this.testModel.cssDir, `${cssFile.filename}.unit`);
    
    this.logEvidence('step', `UNIT-CREATE: ${cssFile.filename}`);
    
    // Check if unit symlink already exists
    if (fs.existsSync(unitLinkPath)) {
      // Verify it's a valid symlink
      try {
        const stats = await fs.promises.lstat(unitLinkPath);
        if (stats.isSymbolicLink()) {
          const target = await fs.promises.readlink(unitLinkPath);
          this.logEvidence(`UNIT-${cssFile.filename}`, `Already exists as symlink → ${target}`);
          
          // Extract UUID from target path
          const uuidMatch = target.match(/([0-9a-f-]{36})\.scenario\.json/);
          if (uuidMatch) {
            this.testModel.createdUnits.set(cssFile.filename, uuidMatch[1]);
          }
          return;
        }
      } catch (error) {
        // Not a symlink or broken, recreate
        await fs.promises.unlink(unitLinkPath);
      }
    }
    
    // Create new unit
    const uuid = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const unitModel: CSSUnitModel = {
      uuid,
      name: cssFile.filename,
      typeM3: TypeM3.ATTRIBUTE,
      origin: `ior:git:github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/${this.onceVersion}/${cssFile.relativePath}`,
      definition: cssFile.description,
      cssPath: cssFile.relativePath,
      mimetype: 'text/css',
      createdAt: now,
      updatedAt: now,
    };
    
    // Create scenario via ScenarioService
    const scenario = this.scenarioService!.scenarioCreate<CSSUnitModel>({
      uuid,
      model: unitModel,
      owner: 'system',
      symlinkPaths: [
        `type/Unit/${this.onceVersion}/css`,
      ],
    });
    
    // Build symlink path to CSS directory
    const cssUnitSymlinkPath = `components/ONCE/${this.onceVersion}/src/ts/layer5/views/css/${cssFile.filename}.unit`;
    
    // Save scenario with symlinks
    await this.scenarioService!.scenarioSave(scenario, [
      this.scenarioService!.typePathBuild('Unit', this.onceVersion),
      cssUnitSymlinkPath,
    ]);
    
    // Create symlink in CSS directory pointing to the scenario
    const scenarioIndexPath = path.join(
      this.testModel.scenariosDir,
      'index',
      this.scenarioService!.indexPathBuild(uuid)
    );
    
    // Calculate relative path from CSS dir to scenario
    const relativePath = path.relative(this.testModel.cssDir, scenarioIndexPath);
    
    // Create symlink
    await fs.promises.symlink(relativePath, unitLinkPath);
    
    this.testModel.createdUnits.set(cssFile.filename, uuid);
    this.logEvidence(`UNIT-${cssFile.filename}`, `Created: ${uuid} → ${unitLinkPath}`);
  }
  
  /**
   * Verify all units exist
   */
  private async verifyAllUnitsExist(): Promise<void> {
    this.logEvidence('step', 'VERIFY: Checking all CSS units exist');
    
    let allExist = true;
    
    for (const cssFile of this.testModel.cssFiles) {
      const unitLinkPath = path.join(this.testModel.cssDir, `${cssFile.filename}.unit`);
      const exists = fs.existsSync(unitLinkPath);
      
      if (!exists) {
        this.logEvidence(`VERIFY-${cssFile.filename}`, 'MISSING!');
        allExist = false;
      } else {
        const uuid = this.testModel.createdUnits.get(cssFile.filename);
        this.logEvidence(`VERIFY-${cssFile.filename}`, `OK (${uuid})`);
      }
    }
    
    if (!allExist) {
      throw new Error('VERIFY FAILED: Not all CSS units exist');
    }
    
    console.log(`✅ All ${this.testModel.cssFiles.length} CSS unit scenarios verified`);
  }
  
  /**
   * Update ONCE.component.json with actual UUIDs
   */
  private async updateComponentJson(): Promise<void> {
    this.logEvidence('step', 'UPDATE: Updating ONCE.component.json with UUIDs');
    
    const componentJsonPath = path.join(this.testModel.componentRoot, 'ONCE.component.json');
    
    try {
      const content = await fs.promises.readFile(componentJsonPath, 'utf-8');
      const componentJson = JSON.parse(content);
      
      // Update CSS units with actual UUIDs
      if (componentJson.model?.units?.css) {
        for (const cssUnit of componentJson.model.units.css) {
          const uuid = this.testModel.createdUnits.get(cssUnit.name);
          if (uuid) {
            cssUnit.uuid = uuid;
            cssUnit.unitPath = `src/ts/layer5/views/css/${cssUnit.name}.unit`;
          }
        }
        
        // Write back
        await fs.promises.writeFile(
          componentJsonPath,
          JSON.stringify(componentJson, null, 2) + '\n'
        );
        
        this.logEvidence('UPDATE-JSON', `Updated ${this.testModel.createdUnits.size} UUIDs`);
      }
    } catch (error) {
      this.logEvidence('UPDATE-JSON', `Warning: Could not update component.json: ${error}`);
    }
  }
}

// Export for Tootsie
export default Test14_CSSUnitCreation;

