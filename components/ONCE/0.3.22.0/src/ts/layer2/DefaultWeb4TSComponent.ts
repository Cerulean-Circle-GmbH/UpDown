/**
 * DefaultWeb4TSComponent - Web4 TypeScript Component Implementation
 * 
 * Extends UcpComponent with development methods (test, build, clean)
 * Integrates UnitDiscoveryService for automatic unit creation after build
 * 
 * Web4 Principles:
 * - P6: Empty constructor
 * - P16: Object-Action naming (buildRun, testRun, etc.)
 * - P19: One File One Type
 * 
 * Migrated from Web4TSComponent/0.3.20.6
 * 
 * @pdca 2025-12-08-UTC-1400.web4tscomponent-migration.pdca.md
 */

import { UcpComponent } from './UcpComponent.js';
import { UnitDiscoveryService } from './UnitDiscoveryService.js';
import { ScenarioService } from './ScenarioService.js';
import { UcpStorage } from './UcpStorage.js';
import { SemanticVersion } from './SemanticVersion.js';
import { TsAstExtractor } from './TsAstExtractor.js';
import type { Web4TSComponent } from '../layer3/Web4TSComponent.interface.js';
import type { Web4TSComponentModel } from '../layer3/Web4TSComponentModel.interface.js';
import type { Scenario } from '../layer3/Scenario.interface.js';
import type { StorageScenario } from '../layer3/StorageScenario.interface.js';
import type { MethodSignature } from '../layer3/MethodSignature.interface.js';
import type { UnitFilePattern } from '../layer3/UnitDefinition.interface.js';
import { TypeM3 } from '../layer3/TypeM3.enum.js';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';

/**
 * DefaultWeb4TSComponent - Implementation of Web4TSComponent
 * Extends UcpComponent for lifecycle management
 */
export class DefaultWeb4TSComponent 
  extends UcpComponent<Web4TSComponentModel> 
  implements Web4TSComponent {
  
  /** Unit discovery service for build-time unit creation */
  private unitDiscoveryService: UnitDiscoveryService | null = null;
  
  /** Type extractor for build-time TypeDescriptor scenarios */
  private typeExtractor: TsAstExtractor | null = null;
  
  /** Method signatures for CLI routing */
  private methods: Map<string, MethodSignature> = new Map();
  
  /**
   * Empty constructor - Web4 Principle 6
   */
  constructor() {
    super();
  }
  
  /**
   * Provide default model - required by UcpComponent
   */
  protected modelDefault(): Web4TSComponentModel {
    const version = new SemanticVersion().init();
    return {
      uuid: randomUUID(),
      name: 'Web4TSComponent',
      component: 'Web4TSComponent',
      version: version,
      componentRoot: '',
      projectRoot: '',
      targetDirectory: '',
      componentsDirectory: '',
      isTestIsolation: false,
      displayName: 'Web4TSComponent',
      displayVersion: version.toString(),
      isDelegation: false,
    };
  }
  
  /**
   * Initialize component with scenario
   */
  async init(scenario?: Scenario<Web4TSComponentModel>): Promise<this> {
    await super.init(scenario);
    
    // Ensure model has required fields (model is guaranteed non-null after super.init)
    if (!this.model!.version) {
      this.model!.version = new SemanticVersion().init();
    }
    if (!this.model!.component) {
      this.model!.component = 'Web4TSComponent';
    }
    if (!this.model!.implementationClassName) {
      this.model!.implementationClassName = this.constructor.name;
    }
    
    // Discover methods for CLI routing
    this.methodsDiscover();
    
    return this;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // METHOD DISCOVERY (for CLI routing)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Discover methods from prototype chain
   * Skips getters/setters to avoid triggering them with wrong 'this'
   */
  private methodsDiscover(): void {
    const prototype = Object.getPrototypeOf(this);
    const methodNames = Object.getOwnPropertyNames(prototype)
      .filter((name) => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
        if (descriptor?.get || descriptor?.set) return false;
        return typeof prototype[name] === 'function';
      })
      .filter((name) => !name.startsWith('_') && name !== 'constructor')
      .filter((name) => !['init', 'hasMethod', 'methodSignatureGet', 'methodsList', 'methodsDiscover'].includes(name));

    for (const methodName of methodNames) {
      const method = prototype[methodName];
      this.methods.set(methodName, {
        name: methodName,
        paramCount: method.length,
        isAsync: method.constructor.name === 'AsyncFunction',
      });
    }
  }
  
  /**
   * Check if component has a method
   */
  hasMethod(name: string): boolean {
    return this.methods.has(name);
  }
  
  /**
   * Get method signature
   */
  methodSignatureGet(name: string): MethodSignature | null {
    return this.methods.get(name) || null;
  }
  
  /**
   * List all method names
   */
  methodsList(): string[] {
    return Array.from(this.methods.keys());
  }
  
  // ═══════════════════════════════════════════════════════════════
  // DEVELOPMENT METHODS (Web4TSComponent interface)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Run component tests
   */
  async test(scope?: string, ...references: string[]): Promise<this> {
    const componentRoot = this.model!.targetComponentRoot || this.model!.componentRoot;
    
    console.log(`🧪 Running tests for ${this.model!.displayName} v${this.model!.displayVersion}...`);
    
    try {
      // Use Tootsie for testing (Web4 Principle 25)
      if (scope === 'file' && references.length > 0) {
        const testRef = references[0];
        execSync(`npx tsx test/tootsie/Test${testRef.padStart(2, '0')}*.ts`, {
          cwd: componentRoot,
          stdio: 'inherit',
        });
      } else {
        // Run all Tootsie tests
        const testDir = path.join(componentRoot, 'test', 'tootsie');
        if (fs.existsSync(testDir)) {
          const testFiles = fs.readdirSync(testDir)
            .filter(f => f.startsWith('Test') && f.endsWith('.ts'));
          
          for (const testFile of testFiles) {
            console.log(`📄 Running ${testFile}...`);
            execSync(`npx tsx test/tootsie/${testFile}`, {
              cwd: componentRoot,
              stdio: 'inherit',
            });
          }
        }
      }
      console.log(`✅ Tests completed`);
    } catch (error) {
      console.error(`❌ Tests failed`);
      throw error;
    }
    
    return this;
  }
  
  /**
   * Build component (TypeScript compilation)
   * After build, discovers and creates units for new files
   * Also extracts TypeDescriptor scenarios from AST
   */
  async build(...flags: string[]): Promise<this> {
    const componentRoot = this.model!.targetComponentRoot || this.model!.componentRoot;
    
    console.log(`🔨 Building ${this.model!.displayName} v${this.model!.displayVersion}...`);
    
    try {
      // Run TypeScript compiler
      const tscFlags = flags.length > 0 ? flags.join(' ') : '--build';
      execSync(`npx tsc ${tscFlags}`, {
        cwd: componentRoot,
        stdio: 'inherit',
      });
      console.log(`✅ Build completed`);
      
      // Auto-discover and create units for new files
      console.log(`📦 Discovering units...`);
      await this.unitsDiscover();
      
      // Extract TypeDescriptor scenarios from AST
      console.log(`🔍 Extracting type descriptors...`);
      await this.typesExtract();
      
    } catch (error) {
      console.error(`❌ Build failed`);
      throw error;
    }
    
    return this;
  }
  
  /**
   * Extract TypeDescriptor scenarios from TypeScript AST
   * Creates type.scenario.json files for each exported class/interface
   */
  private async typesExtract(): Promise<void> {
    const componentRoot = this.model!.targetComponentRoot || this.model!.componentRoot;
    const projectRoot = this.model!.projectRoot || componentRoot;
    const scenariosDir = path.join(projectRoot, 'scenarios');
    
    // Initialize type extractor if needed
    if (!this.typeExtractor) {
      this.typeExtractor = new TsAstExtractor().init({
        componentRoot,
        componentName: this.model!.displayName,
        componentVersion: this.model!.displayVersion,
        scenariosDir,
      });
    }
    
    // Extract from source directory
    const sourceDir = path.join(componentRoot, 'src', 'ts');
    if (!fs.existsSync(sourceDir)) {
      console.log(`ℹ️ No src/ts directory found, skipping type extraction`);
      return;
    }
    
    const results = await this.typeExtractor.extractDirectory(sourceDir);
    
    // Count extracted types
    let typeCount = 0;
    for (const result of results) {
      typeCount += result.types.length;
    }
    
    if (typeCount > 0) {
      await this.typeExtractor.saveScenarios(results);
      console.log(`✅ Extracted ${typeCount} type descriptors`);
    } else {
      console.log(`ℹ️ No types to extract`);
    }
  }
  
  /**
   * Clean build artifacts
   */
  async clean(): Promise<this> {
    const componentRoot = this.model!.targetComponentRoot || this.model!.componentRoot;
    const distDir = path.join(componentRoot, 'dist');
    
    console.log(`🧹 Cleaning ${this.model!.displayName} v${this.model!.displayVersion}...`);
    
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true });
      console.log(`✅ Cleaned dist/`);
    } else {
      console.log(`ℹ️ No dist/ directory to clean`);
    }
    
    return this;
  }
  
  /**
   * Show component directory tree
   */
  async tree(depth?: string, showHidden?: string): Promise<this> {
    const componentRoot = this.model!.targetComponentRoot || this.model!.componentRoot;
    const maxDepth = depth ? parseInt(depth, 10) : 4;
    const includeHidden = showHidden === 'true';
    
    console.log(`📂 Component tree: ${this.model!.displayName} v${this.model!.displayVersion}`);
    
    const treeCmd = includeHidden 
      ? `find . -maxdepth ${maxDepth} | head -100`
      : `find . -maxdepth ${maxDepth} -not -path '*/.*' | head -100`;
    
    execSync(treeCmd, { cwd: componentRoot, stdio: 'inherit' });
    
    return this;
  }
  
  /**
   * Show semantic version links
   */
  async links(action?: string): Promise<this> {
    const componentDir = path.dirname(this.model!.componentRoot);
    
    console.log(`🔗 Semantic links for ${this.model!.component}:`);
    
    for (const link of SemanticVersion.SEMANTIC_LINKS) {
      const linkPath = path.join(componentDir, link);
      if (fs.existsSync(linkPath)) {
        try {
          const target = fs.readlinkSync(linkPath);
          console.log(`  ${link} → ${target}`);
        } catch {
          console.log(`  ${link} (not a symlink)`);
        }
      } else {
        console.log(`  ${link} (missing)`);
      }
    }
    
    return this;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // UNIT DISCOVERY & CREATION
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Discover and create units for component files
   */
  async unitsDiscover(): Promise<this> {
    const componentRoot = this.model!.targetComponentRoot || this.model!.componentRoot;
    const projectRoot = this.model!.projectRoot;
    
    // Initialize UnitDiscoveryService if not already
    if (!this.unitDiscoveryService) {
      const scenariosDir = path.join(projectRoot, 'scenarios');
      const indexBaseDir = path.join(scenariosDir, 'index');
      
      // Ensure directories exist
      await fs.promises.mkdir(indexBaseDir, { recursive: true });
      
      const storageScenario: StorageScenario = {
        ior: {
          uuid: randomUUID(),
          component: 'UcpStorage',
          version: this.model!.version.toString(),
        },
        owner: 'system',
        model: {
          uuid: randomUUID(),
          projectRoot: projectRoot,
          indexBaseDir: indexBaseDir,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      
      const storage = new UcpStorage().init(storageScenario);
      
      const scenarioService = new ScenarioService().init({
        persistenceManager: storage,
        componentName: 'Unit',
        componentVersion: this.model!.version.toString(),
      });
      
      this.unitDiscoveryService = new UnitDiscoveryService().init({
        scenarioService,
        componentRoot,
        componentName: this.model!.component,
        componentVersion: this.model!.version.toString(),
        projectRoot,
      });
    }
    
    // Define patterns for unit discovery
    const patterns: UnitFilePattern[] = [
      {
        glob: '**/*.css',
        typeM3: TypeM3.ATTRIBUTE,
        mimetype: 'text/css',
        recursive: true,
        excludeDirs: ['node_modules', 'dist', '.git', 'coverage']
      },
      {
        glob: '**/*.html',
        typeM3: TypeM3.ATTRIBUTE,
        mimetype: 'text/html',
        recursive: true,
        excludeDirs: ['node_modules', 'dist', '.git', 'coverage']
      }
    ];
    
    // Discover units for each pattern
    for (const pattern of patterns) {
      const srcDir = path.join(componentRoot, 'src');
      if (fs.existsSync(srcDir)) {
        const definitions = await this.unitDiscoveryService.unitsDiscover(srcDir, pattern);
        
        for (const definition of definitions) {
          if (!definition.existingUuid) {
            const result = await this.unitDiscoveryService.unitCreate(definition);
            await this.unitDiscoveryService.unitSave(result);
            console.log(`  📄 Created unit: ${definition.filename}`);
          }
        }
      }
    }
    
    return this;
  }
  
  /**
   * Update component manifest with discovered units
   */
  async manifestUpdate(): Promise<this> {
    if (!this.unitDiscoveryService) {
      await this.unitsDiscover();
    }
    
    const componentRoot = this.model!.targetComponentRoot || this.model!.componentRoot;
    const manifestPath = path.join(componentRoot, `${this.model!.component}.component.json`);
    
    await this.unitDiscoveryService!.manifestUpdate(manifestPath);
    console.log(`📋 Updated manifest: ${path.basename(manifestPath)}`);
    
    return this;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // WEB4TSCOMPONENT SPECIFIC METHODS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Generate location-resilient CLI wrapper
   * Web4 P16: cliWrapperGenerate (not generateCLIWrapper)
   */
  async cliWrapperGenerate(componentName: string, version: string): Promise<string> {
    return `#!/usr/bin/env node
// Auto-generated CLI wrapper for ${componentName} v${version}
import { DefaultWeb4TSComponent } from './src/ts/layer2/DefaultWeb4TSComponent.js';

const component = new DefaultWeb4TSComponent();
await component.init();
// ... CLI logic
`;
  }
  
  /**
   * Set target directory for component operations
   * Web4 P16: targetDirectorySet (not setTargetDirectory)
   */
  targetDirectorySet(directory: string): void {
    this.model!.targetDirectory = directory;
    this.model!.componentsDirectory = path.join(directory, 'components');
  }
}

