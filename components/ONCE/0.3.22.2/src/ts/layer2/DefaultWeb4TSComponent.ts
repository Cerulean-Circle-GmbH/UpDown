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
import { DefaultUnit } from './DefaultUnit.js';  // P8: DRY — use existing Unit class
import type { Web4TSComponent } from '../layer3/Web4TSComponent.interface.js';
import type { Web4TSComponentModel } from '../layer3/Web4TSComponentModel.interface.js';
import type { Scenario } from '../layer3/Scenario.interface.js';
import type { StorageScenario } from '../layer3/StorageScenario.interface.js';
import type { MethodSignature } from '../layer3/MethodSignature.interface.js';
import type { UnitFilePattern, UnitDefinition } from '../layer3/UnitDefinition.interface.js';
import { TypeM3 } from '../layer3/TypeM3.enum.js';
import { IOR } from '../layer4/IOR.js';  // FsM.6: IOR-based content ops
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
   * Initialize component with scenario (SYNC)
   * @pdca 2026-01-04-UTC-1121.model-consolidation-dry-cleanup.pdca.md MC.4
   */
  init(scenario?: Scenario<Web4TSComponentModel>): this {
    super.init(scenario);
    
    // Ensure model has required fields
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
      .filter((name) => !['init', 'hasMethod', 'methodSignatureGet', 'methodsList', 'methodsDiscover', 'listMethods', 'getMethodSignature'].includes(name));

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
  
  /**
   * Alias for methodsList — ONCECLI compatibility
   * @deprecated Use methodsList() (P16)
   */
  listMethods(): string[] {
    return this.methodsList();
  }
  
  /**
   * Alias for methodSignatureGet — ONCECLI compatibility
   * @deprecated Use methodSignatureGet() (P16)
   */
  getMethodSignature(name: string): MethodSignature | null {
    return this.methodSignatureGet(name);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // DEVELOPMENT METHODS (Web4TSComponent interface)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Tootsie: Quality consciousness testing with test isolation
   * 🔒 SECURITY: ALWAYS runs in test isolation (test/data as projectRoot)
   * 
   * @param scope Test scope: 'all', 'file', 'describe', or 'itCase'
   * @param references Test file numbers or name patterns to execute
   * @cliSyntax scope references
   * @cliDefault scope all
   * @cliValues scope all file describe itCase
   * @cliExample once tootsie file 1
   * @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
   */
  async tootsie(scope: string = 'all', ...references: string[]): Promise<this> {
    const componentRoot = this.model!.componentRoot || this.model!.targetComponentRoot;
    
    if (!componentRoot) {
      throw new Error('Component root not set - cannot determine test isolation path');
    }
    
    const testDataRoot = path.join(componentRoot, 'test', 'data');
    const alreadyInTestIsolation = this.model!.projectRoot?.includes('/test/data') || false;
    
    if (alreadyInTestIsolation) {
      console.log(`🔒 [TOOTSIE TEST ISOLATION] Already in test/data environment`);
      console.log(`   Project Root: ${this.model!.projectRoot}`);
    } else {
      console.log(`🔒 [TOOTSIE TEST ISOLATION] Enforcing test/data isolation`);
      console.log(`   Production Root: ${this.model!.projectRoot}`);
      console.log(`   Test Data Root: ${testDataRoot}`);
      console.log(`   ⚠️  Tests will ONLY run in isolated environment`);
      console.log(`   ⚠️  Production files CANNOT be affected\n`);
      
      const originalProjectRoot = this.model!.projectRoot;
      const originalIsTestIsolation = this.model!.isTestIsolation;
      
      try {
        this.model!.projectRoot = testDataRoot;
        this.model!.isTestIsolation = true;
        (this.model as any).testIsolationContext = `${this.model!.component} v${this.model!.version?.toString()}`;
        
        console.log(`   Switched to Test Isolation Mode ✅`);
        console.log(`   All operations scoped to: ${testDataRoot}\n`);
        
        await this.executeTootsieInIsolation(scope, references);
      } finally {
        this.model!.projectRoot = originalProjectRoot;
        this.model!.isTestIsolation = originalIsTestIsolation;
      }
      
      return this;
    }
    
    await this.executeTootsieInIsolation(scope, references);
    return this;
  }
  
  /**
   * Execute Tootsie tests in test isolation context
   * @cliHide
   */
  private async executeTootsieInIsolation(scope: string, references: string[]): Promise<void> {
    console.log(`🎯 Tootsie: Quality consciousness testing for ${this.model!.component}...`);
    console.log(`   Scope: ${scope}`);
    if (references.length > 0) {
      console.log(`   References: ${references.join(', ')}`);
    }
    console.log(`   Test Isolation: ${this.model!.isTestIsolation ? '✅ ENABLED' : '❌ DISABLED'}`);
    console.log(`   Project Root: ${this.model!.projectRoot}\n`);
    
    const discoveryResult = await this.discoverTestFile(scope, references);
    
    if (!discoveryResult) {
      if (references.length > 0 || scope !== 'file') {
        console.log(`❌ No test file found for: ${scope} ${references.join(' ')}\n`);
      }
      return;
    }
    
    const testFile = discoveryResult;
    console.log(`📄 Test File: ${testFile}\n`);
    
    console.log(`📦 Loading Tootsie component...`);
    const tootsie = await this.loadTootsieComponent();
    
    if (!tootsie) {
      console.log(`❌ Failed to load Tootsie component\n`);
      return;
    }
    
    console.log(`✅ Tootsie loaded: ${tootsie.constructor.name}\n`);
    
    console.log(`🧪 Executing test file...`);
    try {
      await this.executeTestFile(testFile);
      console.log(`\n✅ Test execution completed\n`);
    } catch (error) {
      console.log(`\n❌ Test execution failed: ${error}\n`);
      throw error;
    }
  }
  
  /**
   * Execute a test file via TootsieTestRunner
   * @cliHide
   */
  private async executeTestFile(testFilePath: string): Promise<void> {
    console.log(`   Loading test class from: ${testFilePath}`);
    
    const componentRoot = this.model!.componentRoot || this.model!.targetComponentRoot;
    if (componentRoot) {
      console.log(`🔨 Ensuring component is built before tests...`);
      try {
        execSync('npx tsc --build', {
          cwd: componentRoot,
          encoding: 'utf-8',
          stdio: 'inherit'
        });
        console.log(`✅ Component built\n`);
      } catch (buildError: any) {
        console.error(`❌ Build failed - tests may fail due to missing .js files`);
      }
    }
    
    const tootsieRunnerPath = path.join(
      this.model!.componentsDirectory || path.join(this.model!.projectRoot || '', 'components'),
      'Tootsie',
      '0.3.20.6',
      'src',
      'ts',
      'layer4',
      'TootsieTestRunner.ts'
    );
    
    console.log(`   Using Tootsie runner: ${tootsieRunnerPath}\n`);
    
    try {
      const command = `npx tsx ${tootsieRunnerPath} ${testFilePath}`;
      
      execSync(command, {
        cwd: this.model!.projectRoot || process.cwd(),
        encoding: 'utf-8',
        stdio: 'inherit'
      });
      
      console.log(`\n   ✅ Test PASSED`);
    } catch (error: any) {
      console.log(`\n   ❌ Test FAILED (exit code: ${error.status})`);
      throw error;
    }
  }
  
  /**
   * Load Tootsie component dynamically
   * @cliHide
   */
  private async loadTootsieComponent(): Promise<any> {
    const context = (this.model as any).context;
    
    if (context && typeof context.componentLoad === 'function') {
      try {
        console.log(`   Using context.componentLoad() for Tootsie`);
        const tootsie = await context.componentLoad('Tootsie', '0.3.20.6');
        return tootsie;
      } catch (error) {
        console.log(`   ⚠️  Context componentLoad() failed: ${error}`);
        console.log(`   Falling back to direct import`);
      }
    }
    
    try {
      const componentRoot = this.model!.componentRoot || this.model!.targetComponentRoot;
      if (!componentRoot) {
        throw new Error('Component root not set');
      }
      
      const componentsDir = path.dirname(path.dirname(componentRoot));
      const tootsiePath = path.join(componentsDir, 'Tootsie', '0.3.20.6', 'dist', 'ts', 'layer2', 'DefaultTootsie.js');
      
      console.log(`   Direct import: ${tootsiePath}`);
      
      const tootsieModule = await import(tootsiePath);
      const TootsieClass = tootsieModule.DefaultTootsie;
      
      if (!TootsieClass) {
        throw new Error('DefaultTootsie class not found in module');
      }
      
      const tootsie = new TootsieClass();
      await tootsie.init();
      
      return tootsie;
    } catch (error) {
      console.log(`   ❌ Failed to load Tootsie: ${error}`);
      return null;
    }
  }
  
  /**
   * Discover test file by number, name, or hierarchical token
   * @cliHide
   */
  private async discoverTestFile(scope: string, references: string[]): Promise<string | null> {
    const componentRoot = this.model!.componentRoot || this.model!.targetComponentRoot;
    
    if (!componentRoot) {
      console.log(`❌ Component root not set`);
      return null;
    }
    
    const testDir = path.join(componentRoot, 'test', 'tootsie');
    
    try {
      await fs.promises.access(testDir);
    } catch {
      console.log(`❌ Test directory not found: ${testDir}`);
      return null;
    }
    
    if (references.length === 0 && scope === 'file') {
      console.log(`⚠️  No test reference provided`);
      console.log(`\n📋 Available test files:\n`);
      
      const files = await fs.promises.readdir(testDir);
      const testFiles = files.filter((f: string) => f.startsWith('Test') && f.endsWith('.ts')).sort();
      
      testFiles.forEach(function listTestFile(file: string, index: number) {
        const num = file.match(/Test(\d+)_/)?.[1] || (index + 1);
        const name = file.replace(/Test\d+_/, '').replace('.ts', '');
        console.log(`   ${num}: ${name}`);
      });
      
      console.log(`\n💡 Usage: once tootsie file <number>`);
      console.log(`   Example: once tootsie file 1\n`);
      
      return null;
    }
    
    if (references.length === 0) {
      console.log(`⚠️  No test reference provided`);
      return null;
    }
    
    const reference = references[0];
    
    const files = await fs.promises.readdir(testDir);
    const testFiles = files.filter((f: string) => f.startsWith('Test') && f.endsWith('.ts'));
    
    if (/^\d+$/.test(reference)) {
      const fileNumber = reference.padStart(2, '0');
      const pattern = `Test${fileNumber}_`;
      const match = testFiles.find((f: string) => f.startsWith(pattern));
      
      if (match) {
        return path.join(testDir, match);
      }
    }
    
    const match = testFiles.find((f: string) => 
      f.toLowerCase().includes(reference.toLowerCase())
    );
    
    if (match) {
      return path.join(testDir, match);
    }
    
    if (/^\d+[a-z]\d*$/.test(reference)) {
      const fileNumber = reference.match(/^\d+/)?.[0].padStart(2, '0');
      if (fileNumber) {
        const pattern = `Test${fileNumber}_`;
        const hierarchicalMatch = testFiles.find((f: string) => f.startsWith(pattern));
        
        if (hierarchicalMatch) {
          return path.join(testDir, hierarchicalMatch);
        }
      }
    }
    
    console.log(`❌ No test file found matching: ${reference}`);
    console.log(`   Available tests: ${testFiles.join(', ')}`);
    return null;
  }
  
  /**
   * Run component tests (simple version — use tootsie() for full quality framework)
   */
  async test(scope?: string, ...references: string[]): Promise<this> {
    const componentRoot = this.model!.targetComponentRoot || this.model!.componentRoot;
    
    console.log(`🧪 Running tests for ${this.model!.displayName} v${this.model!.displayVersion}...`);
    
    try {
      if (scope === 'file' && references.length > 0) {
        const testRef = references[0];
        execSync(`npx tsx test/tootsie/Test${testRef.padStart(2, '0')}*.ts`, {
          cwd: componentRoot,
          stdio: 'inherit',
        });
      } else {
        const testDir = path.join(componentRoot, 'test', 'tootsie');
        if (fs.existsSync(testDir)) {
          const testFiles = fs.readdirSync(testDir)
            .filter(function filterTestFiles(f: string) { return f.startsWith('Test') && f.endsWith('.ts'); });
          
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
      
      // Generate component descriptor (self-caring: updates on every build)
      // @pdca 2025-12-31-UTC-1700.component-descriptor-css-units.pdca.md
      console.log(`📄 Generating component descriptor...`);
      await this.componentDescriptorUpdate();
      
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
  
  /**
   * Set CI/CD semantic links for a component version
   * @param targetVersion Semantic link to set: 'dev', 'latest', 'prod', 'test'
   * @param version Version to set for the link (default: current version)
   * @cliValues targetVersion dev latest prod test
   * @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
   */
  async setCICDVersion(targetVersion: string, version: string = 'current'): Promise<this> {
    this.printQuickHeader();
    
    const componentDir = path.dirname(this.model!.componentRoot);
    const actualVersion = await SemanticVersion.resolveVersion(
      version,
      componentDir,
      this.model!.version
    );
    
    if (!SemanticVersion.isSemanticLink(targetVersion)) {
      throw new Error(`Invalid targetVersion: ${targetVersion}. Must be one of: ${SemanticVersion.SEMANTIC_LINKS.join(', ')}`);
    }
    
    console.log(`🔗 Setting ${targetVersion} symlink for ${this.model!.component}:`);
    console.log(`   Target: ${actualVersion}`);
    
    const fsp = await import('fs/promises');
    const linkPath = path.join(componentDir, targetVersion);
    const targetDir = path.join(componentDir, actualVersion);
    
    if (!fs.existsSync(targetDir)) {
      throw new Error(`Target version ${actualVersion} does not exist at ${targetDir}`);
    }
    
    try {
      await fsp.unlink(linkPath).catch(function noopOnError() {});
      await fsp.symlink(actualVersion, linkPath);
      console.log(`   ✅ ${targetVersion} → ${actualVersion}`);
    } catch (error) {
      throw new Error(`Failed to set ${targetVersion} link: ${error}`);
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
    // @pdca 2025-12-31-UTC-1900.unit-descriptor-sw-verification.pdca.md
    const srcPatterns: UnitFilePattern[] = [
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
      },
      {
        glob: '**/*.ts',
        typeM3: TypeM3.CLASS,
        mimetype: 'text/typescript',
        recursive: true,
        excludeDirs: ['node_modules', 'dist', '.git', 'coverage', 'test']
      }
    ];
    
    // Discover units in src/ directory
    for (const pattern of srcPatterns) {
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
    
    // Discover JS units in dist/ directory (with TS origin reference)
    const distDir = path.join(componentRoot, 'dist');
    if (fs.existsSync(distDir)) {
      const jsPattern: UnitFilePattern = {
        glob: '**/*.js',
        typeM3: TypeM3.CLASS,
        mimetype: 'application/javascript',
        recursive: true,
        excludeDirs: ['node_modules', '.git']
      };
      
      const jsDefinitions = await this.unitDiscoveryService.unitsDiscover(distDir, jsPattern);
      
      for (const definition of jsDefinitions) {
        if (!definition.existingUuid) {
          // Calculate origin: dist/ts/... → src/ts/... (.js → .ts)
          const originPath = definition.relativePath
            .replace(/^dist\//, 'src/')
            .replace(/\.js$/, '.ts');
          
          const result = await this.unitDiscoveryService.unitCreate(definition, originPath);
          await this.unitDiscoveryService.unitSave(result);
          console.log(`  📄 Created unit: ${definition.filename} (origin: ${originPath})`);
        }
      }
    }
    
    // Discover root component files (package.json, tsconfig.json, README.md, etc.)
    const rootFilePatterns: { pattern: string; typeM3: TypeM3; mimetype: string }[] = [
      { pattern: 'package.json', typeM3: TypeM3.ATTRIBUTE, mimetype: 'application/json' },
      { pattern: 'package-lock.json', typeM3: TypeM3.ATTRIBUTE, mimetype: 'application/json' },
      { pattern: 'tsconfig.json', typeM3: TypeM3.ATTRIBUTE, mimetype: 'application/json' },
      { pattern: 'README.md', typeM3: TypeM3.ATTRIBUTE, mimetype: 'text/markdown' },
      { pattern: 'vitest.config.ts', typeM3: TypeM3.ATTRIBUTE, mimetype: 'text/typescript' },
      { pattern: 'once', typeM3: TypeM3.CLASS, mimetype: 'application/x-shellscript' },
      { pattern: 'source.env', typeM3: TypeM3.ATTRIBUTE, mimetype: 'text/x-shellscript' },
    ];
    
    for (const rootFile of rootFilePatterns) {
      const filePath = path.join(componentRoot, rootFile.pattern);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const definition: UnitDefinition = {
          filename: rootFile.pattern,
          relativePath: rootFile.pattern,
          fullPath: filePath,
          typeM3: rootFile.typeM3,
          mimetype: rootFile.mimetype,
          description: `Root component file: ${rootFile.pattern}`,
        };
        
        const result = await this.unitDiscoveryService.unitCreate(definition);
        await this.unitDiscoveryService.unitSave(result);
        console.log(`  📄 Created unit: ${definition.filename} (root)`);
      }
    }
    
    // Create folder units using DefaultUnit.from() — P8: DRY
    // @pdca 2026-01-01-UTC-2000.folder-unit-integration-fix.pdca.md
    await this.foldersDiscover(componentRoot, 'src');
    await this.foldersDiscover(componentRoot, 'dist');
    
    return this;
  }
  
  /**
   * Discover folders and create °folder.unit using DefaultUnit.from()
   * Uses existing DefaultUnit class — P8: DRY principle
   * @pdca 2026-01-01-UTC-2000.folder-unit-integration-fix.pdca.md
   */
  private async foldersDiscover(componentRoot: string, baseDir: string): Promise<void> {
    const fullBase = path.join(componentRoot, baseDir);
    if (!fs.existsSync(fullBase)) return;
    
    const excludeDirs = ['node_modules', '.git', 'coverage', 'test-results', '.tootsie'];
    
    const discoverDir = async (dir: string): Promise<void> => {
      const folderUnitPath = path.join(dir, '°folder.unit');
      
      // Only create if doesn't exist
      if (!fs.existsSync(folderUnitPath)) {
        try {
          // P8: DRY — use DefaultUnit.from() instead of reimplementing
          // P6: Empty Constructor — new DefaultUnit().init().from(path)
          // @pdca 2026-01-04-UTC-1800.scenario-only-init-violations.pdca.md SOI.6
          const unit = new DefaultUnit();
          unit.init();  // Uses scenarioDefault() internally
          await unit.from(dir);
          console.log(`  📁 Created folder unit: ${path.relative(componentRoot, dir)}/°folder.unit`);
        } catch (error: any) {
          console.warn(`  ⚠️ Failed to create folder unit for ${dir}: ${error.message}`);
        }
      }
      
      // Recursively process subdirectories
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        if (excludeDirs.includes(entry.name)) continue;
        await discoverDir(path.join(dir, entry.name));
      }
    };
    
    await discoverDir(fullBase);
  }
  
  // manifestUpdate() REMOVED — replaced by componentDescriptorUpdate()
  // component.json IS the manifest (better version)
  // @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
  
  
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
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENT DESCRIPTOR METHODS (WM.2.A)
  // @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Print quick header for CLI output
   * Simplified version without colors
   */
  protected printQuickHeader(): void {
    let header = `Web4 ${this.model!.displayName} CLI Tool`;
    header += ` v${this.model!.displayVersion}`;
    
    if (this.model!.isDelegation && (this.model as any).delegationInfo) {
      header += ` (${(this.model as any).delegationInfo})`;
    }
    
    header += ' - Dynamic Method Discovery';
    console.log(header);
    
    if ((this.model as any).testIsolationContext) {
      console.log(`⚠️  TEST ISOLATION MODE (${(this.model as any).testIsolationContext})`);
    }
    
    console.log('');
  }
  
  /**
   * Get the target component instance for operations
   * Single source of truth for context resolution (Radical OOP principle)
   * Returns context if set (delegation mode), otherwise returns this
   * @cliHide
   */
  protected getTarget(): DefaultWeb4TSComponent {
    return ((this.model as any).context as DefaultWeb4TSComponent) || this;
  }
  
  /**
   * Show Web4 standards - STUB (FUTURE)
   * @cliHide
   */
  showStandard(): void {
    console.log('📋 Web4 Standards documentation - see howto.fractal.pdca.md');
  }
  
  /**
   * Show Web4 guidelines - STUB (FUTURE)
   * @cliHide
   */
  showGuidelines(): void {
    console.log('📋 Web4 Guidelines documentation - see web4-principles-checklist.md');
  }
  
  /**
   * Display component information
   * @param topic Topic to display: 'model' (default), 'standard', 'guidelines'
   * @cliDefault topic model
   */
  async info(topic: string = 'model'): Promise<this> {
    this.printQuickHeader();
    
    const target = this.getTarget();
    const targetModel = target.model!;
    const isContextMode = !!(this.model as any).context;
    
    switch (topic) {
      case 'standard':
      case 'standards':
        this.showStandard();
        break;
      case 'guidelines':
      case 'guide':
        this.showGuidelines();
        break;
      case 'model':
      case 'overview':
      default:
        console.log(`
${'='.repeat(80)}
📊 Component Model Information
${'='.repeat(80)}
`);
        
        if (isContextMode) {
          console.log(`🎯 Context Mode: Showing context.model (delegated component)\n`);
        }
        
        console.log(`🏷️  Component Identity:`);
        console.log(`   Name:         ${targetModel.name || 'N/A'}`);
        console.log(`   Component:    ${targetModel.component || 'N/A'}`);
        console.log(`   Version:      ${targetModel.version?.toString() || 'N/A'}`);
        console.log(`   UUID:         ${targetModel.uuid || 'N/A'}`);
        console.log();
        
        console.log(`📂 Paths:`);
        console.log(`   Project Root:     ${targetModel.projectRoot || 'N/A'}`);
        console.log(`   Component Root:   ${targetModel.componentRoot || 'N/A'}`);
        console.log(`   Target Directory: ${targetModel.targetDirectory || 'N/A'}`);
        console.log();
        
        console.log(`⚙️  Configuration:`);
        console.log(`   Origin:       ${(targetModel as any).origin || 'N/A'}`);
        console.log(`   Definition:   ${(targetModel as any).definition || 'N/A'}`);
        console.log();
        
        if (isContextMode) {
          console.log(`🔗 Context Delegation:`);
          console.log(`   Caller Component: ${targetModel.component}`);
          console.log(`   Caller Version:   ${targetModel.version?.toString() || 'N/A'}`);
          console.log(`   Target Component: ${this.model!.component}`);
          console.log(`   Target Version:   ${this.model!.version.toString()}`);
          console.log();
        }
        
        console.log(`${'='.repeat(80)}\n`);
        break;
    }
    
    return this;
  }
  
  /**
   * Generate component.json scenario file for existing components
   * 
   * Usage: ./once on ONCE latest componentDescriptorUpdate
   * 
   * Web4 Principles:
   * - Principle 1: "Everything is a Scenario" - all components need scenario files
   * - Principle 16: Object-Action naming
   * 
   * @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
   */
  async componentDescriptorUpdate(): Promise<this> {
    this.printQuickHeader();
    
    // Must have context loaded via on()
    if (!(this.model as any).context) {
      console.error('❌ Error: No component context loaded');
      console.log('   Usage: ./once on <Component> <Version> componentDescriptorUpdate');
      throw new Error('componentDescriptorUpdate requires context from on() command');
    }
    
    const targetComponent = (this.model as any).context;
    const componentName = targetComponent.model.component;
    const componentVersion = targetComponent.model.version.toString();
    const componentRoot = this.model!.targetComponentRoot || this.model!.componentRoot;
    
    console.log(`📄 Generating component descriptor for ${componentName} ${componentVersion}...`);
    
    // Generate scenario for TARGET component
    const targetScenario = await targetComponent.toScenario();
    
    // Ensure implementationClassName is set
    if (!targetScenario.model.implementationClassName) {
      targetScenario.model.implementationClassName = targetComponent.constructor.name;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // CD.3: Fix owner format — Base64(JSON(Scenario<UserModel>))
    // @pdca 2025-12-21-UTC-0200.component-descriptor-refactor.pdca.md
    // ═══════════════════════════════════════════════════════════════
    const ownerScenario = {
      ior: {
        uuid: randomUUID(),
        component: 'User',
        version: '0.3.21.1'
      },
      owner: '', // User has no nested owner
      model: {
        user: process.env.USER || 'system',
        hostname: process.env.HOSTNAME || 'localhost',
        uuid: randomUUID()
      }
    };
    const ownerJson = JSON.stringify(ownerScenario);
    targetScenario.owner = Buffer.from(ownerJson).toString('base64');
    console.log(`   ✅ Owner: Base64(Scenario<UserModel>)`);
    
    // ═══════════════════════════════════════════════════════════════
    // CD.3: Discover units and add as flat IOR paths
    // @pdca 2025-12-21-UTC-0200.component-descriptor-refactor.pdca.md
    // ═══════════════════════════════════════════════════════════════
    const units = await this.unitsDiscoverForDescriptor(componentRoot, componentName, componentVersion);
    targetScenario.model.units = units;
    console.log(`   ✅ Units: ${units.length} IOR paths discovered`);
    
    // Generate UUID for scenario
    const scenarioUuid = randomUUID();
    
    // Path Authority: Use projectRoot from model
    const projectRoot = this.model!.projectRoot || '';
    const scenariosRoot = path.join(projectRoot, 'scenarios');
    const scenarioDir = path.join(scenariosRoot, componentName, componentVersion);
    
    // Create directory
    fs.mkdirSync(scenarioDir, { recursive: true });
    
    // FsM.6: Save scenario via IOR (P2P pattern)
    const scenarioPath = path.join(scenarioDir, `${scenarioUuid}.scenario.json`);
    const saveIor = new IOR<string>().initRemote(`ior:file://${scenarioPath}`);
    await saveIor.save(targetScenario);
    
    // Create or update symlink
    const symlinkPath = path.join(componentRoot, `${componentName}.component.json`);
    const relativePath = path.relative(componentRoot, scenarioPath);
    
    try {
      // Remove existing symlink if present
      if (fs.existsSync(symlinkPath)) {
        fs.unlinkSync(symlinkPath);
      }
      fs.symlinkSync(relativePath, symlinkPath);
      console.log(`   ✅ Scenario: ${scenarioUuid}.scenario.json`);
      console.log(`   🔗 Symlink: ${componentName}.component.json → scenarios/${componentName}/${componentVersion}/`);
    } catch (error: any) {
      console.warn(`   ⚠️  Could not create symlink:`, error.message);
    }
    
    console.log(`✅ Component descriptor created successfully`);
    
    return this;
  }
  
  /**
   * Discover units for component descriptor (CD.3)
   * Returns flat array of IOR paths (e.g., "/EAMD.ucp/components/ONCE/0.3.22.1/...")
   * 
   * @pdca 2025-12-21-UTC-0200.component-descriptor-refactor.pdca.md
   */
  private async unitsDiscoverForDescriptor(
    componentRoot: string,
    componentName: string,
    componentVersion: string
  ): Promise<string[]> {
    const units: string[] = [];
    
    // Unit file patterns to discover
    const patterns: { dir: string; extensions: string[] }[] = [
      { dir: 'src/ts/layer5/views/css', extensions: ['.css'] },
      { dir: 'src/ts/layer5/views/html', extensions: ['.html'] },
      { dir: 'src/ts/layer5/views/templates', extensions: ['.html', '.hbs'] },
      { dir: 'src/sh', extensions: ['.sh'] },  // Lifecycle scripts
      { dir: 'src/assets', extensions: ['.svg', '.png', '.jpg', '.jpeg', '.ico', '.webp'] },  // Assets
      { dir: 'dist/ts', extensions: ['.js'] },
      { dir: 'src/ts', extensions: ['.ts'] },
    ];
    
    // Root-level component files (non-recursive)
    const rootFiles = [
      'package.json',
      'tsconfig.json',
      'vitest.config.ts',
      'source.env',
      'README.md',
      '.gitignore',
      '.npmrc',
    ];
    
    for (const filename of rootFiles) {
      const filePath = path.join(componentRoot, filename);
      if (fs.existsSync(filePath)) {
        const iorPath = `/EAMD.ucp/components/${componentName}/${componentVersion}/${filename}`;
        units.push(iorPath);
      }
    }
    
    for (const pattern of patterns) {
      const dirPath = path.join(componentRoot, pattern.dir);
      if (!fs.existsSync(dirPath)) continue;
      
      try {
        const files = this.filesRecursive(dirPath, pattern.extensions);
        for (const file of files) {
          // Create IOR path: /EAMD.ucp/components/{Name}/{Version}/{relativePath}
          const relativePath = path.relative(componentRoot, file);
          const iorPath = `/EAMD.ucp/components/${componentName}/${componentVersion}/${relativePath}`;
          units.push(iorPath);
        }
      } catch (error) {
        // Directory doesn't exist or not readable - skip
      }
    }
    
    return units;
  }
  
  /**
   * Recursively find files with given extensions
   */
  private filesRecursive(dir: string, extensions: string[]): string[] {
    const results: string[] = [];
    
    if (!fs.existsSync(dir)) return results;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...this.filesRecursive(fullPath, extensions));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
    
    return results;
  }
  
  /**
   * Read component descriptor (component.json → scenario)
   * Returns scenario with implementationClassName for dynamic loading
   * 
   * Usage: ./once componentDescriptorRead <Component> <Version>
   * 
   * @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
   * @param componentName Component name (e.g., "ONCE", "Unit")
   * @param version Component version (e.g., "0.3.21.7")
   * @returns Scenario or null if no descriptor exists
   */
  async componentDescriptorRead(componentName: string, version: string): Promise<any> {
    // Resolve component path (respects delegation context)
    const projectRoot = (this.model as any).context?.model?.projectRoot || this.model!.projectRoot;
    const componentPath = path.join(projectRoot, 'components', componentName, version);
    const descriptorPath = path.join(componentPath, `${componentName}.component.json`);
    
    // Check if descriptor exists
    if (!fs.existsSync(descriptorPath)) {
      console.log(`⚠️  No component.json for ${componentName}/${version}`);
      return null;
    }
    
    // FsM.6: Load descriptor via IOR (P2P pattern)
    try {
      const loadIor = new IOR<string>().initRemote(`ior:file://${descriptorPath}`);
      const descriptorContent = await loadIor.resolve();
      if (!descriptorContent) {
        console.log(`⚠️  Could not read component.json for ${componentName}/${version}`);
        return null;
      }
      const descriptor = JSON.parse(descriptorContent);
      console.log(`📋 Loaded descriptor for ${componentName}/${version}`);
      if (descriptor.model?.implementationClassName) {
        console.log(`   Implementation: ${descriptor.model.implementationClassName}`);
      }
      return descriptor;
    } catch (error: any) {
      console.error(`❌ Failed to read descriptor:`, error.message);
      throw new Error(`Failed to read descriptor for ${componentName}/${version}: ${error.message}`);
    }
  }
  
  /**
   * Start a component (ensures it's built and ready for import)
   * Does NOT run npm start script - just ensures dist/ exists
   * 
   * Usage: ./once componentStart <Component> <Version>
   * 
   * @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
   * @param componentName Component name (e.g., "Unit", "ONCE")
   * @param version Component version (e.g., "0.3.19.1")
   */
  async componentStart(componentName: string, version: string): Promise<this> {
    // Resolve component path (respects delegation context)
    const projectRoot = (this.model as any).context?.model?.projectRoot || this.model!.projectRoot;
    const componentPath = path.join(projectRoot, 'components', componentName, version);
    
    // 1. Check if component exists
    if (!fs.existsSync(componentPath)) {
      throw new Error(`Component not found: ${componentName}/${version} at ${componentPath}`);
    }
    
    // 2. Check if already built
    const distPath = path.join(componentPath, 'dist');
    if (fs.existsSync(distPath)) {
      console.log(`✅ ${componentName}/${version} already built`);
      return this;
    }
    
    console.log(`🔨 Building ${componentName}/${version}...`);
    
    // 3. Install dependencies if needed
    const nodeModulesPath = path.join(componentPath, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      console.log(`📦 Installing dependencies for ${componentName}/${version}...`);
      await this.dependenciesInstall(componentPath);
    }
    
    // 4. Compile TypeScript
    console.log(`🔨 Compiling TypeScript for ${componentName}/${version}...`);
    await this.compile(componentPath);
    
    console.log(`✅ ${componentName}/${version} built and ready for import`);
    
    return this;
  }
  
  /**
   * Install dependencies in component directory
   * @param componentPath Full path to component
   */
  private async dependenciesInstall(componentPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        execSync('npm install', { cwd: componentPath, stdio: 'inherit' });
        console.log(`✅ Dependencies installed`);
        resolve();
      } catch (error: any) {
        console.error(`❌ npm install failed`);
        reject(new Error(`npm install failed: ${error.message}`));
      }
    });
  }
  
  /**
   * Compile TypeScript in component directory
   * @param componentPath Full path to component
   */
  private async compile(componentPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        execSync('npx tsc', { cwd: componentPath, stdio: 'inherit' });
        console.log(`✅ TypeScript compiled`);
        resolve();
      } catch (error: any) {
        console.error(`❌ TypeScript compilation failed`);
        reject(new Error(`tsc failed: ${error.message}`));
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // BATCH B: start() (WM.2.B) — set/get/from/find/upgrade deferred
  // @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
  // ═══════════════════════════════════════════════════════════════

  /**
   * Execute start command in loaded component context
   * Build and run the loaded component using its build system
   */
  async start(): Promise<this> {
    // RADICAL OOP: Context required for start
    if (!(this.model as any).context) {
      throw new Error('No component context loaded. Use "on <component> <version>" first.');
    }

    const componentPath = this.model!.targetComponentRoot!;
    
    console.log(`🚀 Starting ${this.model!.component} ${this.model!.version?.toString()}...`);
    
    try {
      execSync('npm start', { 
        cwd: componentPath, 
        stdio: 'inherit',
      });
      console.log(`✅ Started ${this.model!.component} ${this.model!.version?.toString()}`);
    } catch (error) {
      console.error(`❌ Failed to start ${this.model!.component} ${this.model!.version?.toString()}`);
      throw error;
    }

    return this;
  }

  // ═══════════════════════════════════════════════════════════════
  // BATCH C: Testing (WM.2.C) — testCompletion only
  // @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
  // tootsie, testShell, releaseTest DEFERRED — complex dependencies
  // ═══════════════════════════════════════════════════════════════

  /**
   * Run comprehensive TAB completion test suite
   */
  async testCompletion(): Promise<this> {
    const componentRoot = this.model!.projectRoot;
    const testSuitePath = path.join(componentRoot || '', 'test/sh/test-completion-suite.sh');
    
    console.log('🧪 Running TAB completion test suite...');
    console.log(`📂 Component: ${this.model!.component} ${this.model!.version?.toString()}`);
    console.log(`📂 Test Suite: ${testSuitePath}`);
    console.log();
    
    try {
      execSync(`bash "${testSuitePath}"`, {
        cwd: componentRoot || undefined,
        stdio: 'inherit',
      });
      
      console.log('\n✅ TAB completion test suite completed successfully');
    } catch (error) {
      console.error('\n❌ TAB completion test suite failed');
      throw error;
    }
    
    return this;
  }

  // ═══════════════════════════════════════════════════════════════
  // MANDATORY METHODS — User requested 2025-12-21
  // @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
  // upgrade, completion, removeVersion, removeComponent, 
  // targetVersionParameterCompletion, getContext
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get CLI instance
   * @cliHide
   */
  private getCLI(): any {
    return (this as any).cli || this;
  }

  /**
   * Update model with calculated paths for target component
   * @cliHide
   */
  private updateModelPaths(): void {
    if ((this.model as any).context) {
      this.model!.component = (this.model as any).context.model.component;
      this.model!.version = (this.model as any).context.model.version;
    }
    
    const cli = this.getCLI();
    
    if (!this.model!.projectRoot) {
      this.model!.projectRoot = path.dirname(path.dirname(path.dirname(this.model!.componentRoot || '')));
    }
    if (!this.model!.targetDirectory) {
      this.model!.targetDirectory = this.model!.projectRoot;
    }
    if (!this.model!.componentsDirectory) {
      this.model!.componentsDirectory = path.join(this.model!.targetDirectory, 'components');
    }
    
    this.model!.targetComponentRoot = path.join(
      cli.model?.componentsDirectory || this.model!.componentsDirectory || '',
      this.model!.component || '',
      this.model!.version?.toString() || ''
    );
  }

  /**
   * Get available versions for a component
   * @cliHide
   */
  private getAvailableVersions(componentDir: string): string[] {
    try {
      const entries = fs.readdirSync(componentDir);
      return entries.filter(entry => {
        if (SemanticVersion.SEMANTIC_LINKS_SET.has(entry as any)) {
          return false;
        }
        const entryPath = path.join(componentDir, entry);
        try {
          const stats = fs.lstatSync(entryPath);
          return stats.isDirectory() && entry.match(/^\d+\.\d+\.\d+\.\d+$/) !== null;
        } catch {
          return false;
        }
      }).sort((a, b) => SemanticVersion.compare(a, b));
    } catch {
      return [];
    }
  }

  /**
   * Get highest version from array of versions
   * @cliHide
   */
  private getHighestVersion(versions: string[]): string {
    return SemanticVersion.getHighest(versions);
  }

  /**
   * Tab completion for target version parameter
   * @cliHide
   */
  async targetVersionParameterCompletion(): Promise<string[]> {
    return Array.from(SemanticVersion.SEMANTIC_LINKS);
  }

  /**
   * Get current component context from working directory
   * @param format Output format: 'json' or 'bash'
   * @cliSyntax format
   * @cliValues format json bash
   */
  async getContext(format: string = 'json'): Promise<void> {
    const { DefaultCLI } = await import('./DefaultCLI.js');
    const cli = new (class extends DefaultCLI {
      async execute() {}
      showUsage() {}
    })();
    
    await cli.getContext(format);
  }

  /**
   * Test and discover tab completions for debugging
   * @param what Type of completion: "method" or "parameter"
   * @param filter Optional prefix to filter results
   * @cliSyntax what filter
   * @cliValues what method parameter
   */
  async completion(what: string, filter?: string): Promise<this> {
    console.log(`🔍 Discovering ${what === 'method' ? 'methods' : 'parameter completions'} on ${this.model!.component} ${this.model!.version?.toString()}${filter ? ` (filter: ${filter})` : ''}`);
    console.log(`---`);
    
    if (!(this.model as any).context) {
      // List methods from this component
      const methods = this.methodsList();
      const filtered = filter ? methods.filter(m => m.startsWith(filter)) : methods;
      filtered.forEach(m => console.log(m));
    } else {
      // Use context component's CLI
      const componentPath = this.model!.targetComponentRoot!;
      console.log(`   Context: ${componentPath}`);
      // Simple method listing for now
      const methods = this.methodsList();
      const filtered = filter ? methods.filter(m => m.startsWith(filter)) : methods;
      filtered.forEach(m => console.log(m));
    }
    
    return this;
  }

  /**
   * Remove a specific version of a component
   * @param component Component name (or 'current' to use context)
   * @param version Version to remove (or 'current' to use context)
   * @cliSyntax component version
   */
  async removeVersion(component: string = 'current', version: string = 'current'): Promise<this> {
    let targetComponent: string;
    let targetVersion: string;

    if (component === 'current' || version === 'current') {
      if (!(this.model as any).context) {
        throw new Error('No component context loaded. Use "on <component> <version>" first.');
      }
      const target = (this.model as any).context;
      targetComponent = component === 'current' ? target.model.component : component;
      targetVersion = version === 'current' ? target.model.version.toString() : version;
    } else {
      targetComponent = component;
      targetVersion = version;
    }

    const componentDir = path.join(this.model!.componentsDirectory || '', targetComponent);
    const versionDir = path.join(componentDir, targetVersion);

    if (!fs.existsSync(versionDir)) {
      throw new Error(`Version ${targetVersion} of ${targetComponent} does not exist at ${versionDir}`);
    }

    console.log(`🗑️ Removing ${targetComponent} ${targetVersion}...`);
    console.log(`   Directory: ${versionDir}`);

    await fs.promises.rm(versionDir, { recursive: true, force: true });
    console.log(`✅ Removed ${targetComponent} ${targetVersion}`);

    // Update symlinks
    const versions = this.getAvailableVersions(componentDir);
    const highestVersion = versions.length > 0 ? this.getHighestVersion(versions) : null;
    
    for (const linkName of SemanticVersion.SEMANTIC_LINKS) {
      const symlinkPath = path.join(componentDir, linkName);
      
      try {
        const stats = fs.lstatSync(symlinkPath);
        if (stats.isSymbolicLink()) {
          const linkTarget = await fs.promises.readlink(symlinkPath);
          if (linkTarget === targetVersion) {
            await fs.promises.unlink(symlinkPath);
            
            if (linkName === 'latest' && highestVersion) {
              await fs.promises.symlink(highestVersion, symlinkPath);
              console.log(`🔗 Updated ${linkName}: ${targetVersion} → ${highestVersion}`);
            } else {
              console.log(`🔗 Removed ${linkName} symlink`);
            }
          }
        }
      } catch {
        // Symlink doesn't exist
      }
    }

    await this.cleanupVersionScriptSymlinks(targetComponent, targetVersion);

    return this;
  }

  /**
   * Cleanup version-specific script symlinks
   * @cliHide
   */
  private async cleanupVersionScriptSymlinks(componentName: string, version: string): Promise<void> {
    const projectRoot = this.model!.projectRoot || '';
    const versionsDir = path.join(projectRoot, 'scripts', 'versions');
    
    if (!fs.existsSync(versionsDir)) {
      return;
    }

    const componentLowerCase = componentName.toLowerCase();
    const versionScriptName = `${componentLowerCase}-v${version}`;
    const versionScriptPath = path.join(versionsDir, versionScriptName);

    try {
      fs.lstatSync(versionScriptPath);
      await fs.promises.unlink(versionScriptPath);
      console.log(`🔗 Removed version script symlink: ${versionScriptName}`);
    } catch {
      // Doesn't exist
    }

    // Check if main script points to this version
    const mainScriptPath = path.join(versionsDir, componentLowerCase);
    if (fs.existsSync(mainScriptPath)) {
      try {
        const linkTarget = await fs.promises.readlink(mainScriptPath);
        if (linkTarget.includes(versionScriptName)) {
          const componentDir = path.join(this.model!.componentsDirectory || '', componentName);
          const versions = this.getAvailableVersions(componentDir);
          const highestVersion = versions.length > 0 ? this.getHighestVersion(versions) : null;
          
          await fs.promises.unlink(mainScriptPath);
          
          if (highestVersion) {
            const newTarget = `${componentLowerCase}-v${highestVersion}`;
            await fs.promises.symlink(newTarget, mainScriptPath);
            console.log(`🔗 Repointed main script: ${componentLowerCase} → ${newTarget}`);
          }
        }
      } catch {
        // Silent fail
      }
    }
  }

  /**
   * Remove an entire component and all its versions
   * @param component Component name (or 'current' to use context)
   * @cliSyntax component
   */
  async removeComponent(component: string = 'current'): Promise<this> {
    let targetComponent: string;

    if (component === 'current') {
      if (!(this.model as any).context) {
        throw new Error('No component context loaded. Use "on <component> <version>" first.');
      }
      targetComponent = (this.model as any).context.model.component;
    } else {
      targetComponent = component;
    }

    const componentDir = path.join(this.model!.componentsDirectory || '', targetComponent);

    if (!fs.existsSync(componentDir)) {
      throw new Error(`Component ${targetComponent} does not exist at ${componentDir}`);
    }

    console.log(`🗑️ Removing entire component: ${targetComponent}...`);
    console.log(`   Directory: ${componentDir}`);

    const versions = this.getAvailableVersions(componentDir);
    
    await fs.promises.rm(componentDir, { recursive: true, force: true });
    console.log(`✅ Removed component ${targetComponent} and all versions`);

    await this.cleanupAllComponentScriptSymlinks(targetComponent, versions);

    // Clear context if we removed the loaded component
    if ((this.model as any).context?.model?.component === targetComponent) {
      (this.model as any).context = undefined;
      this.updateModelPaths();
      console.log(`🔧 Cleared component context`);
    }

    return this;
  }

  /**
   * Cleanup all script symlinks for a component
   * @cliHide
   */
  private async cleanupAllComponentScriptSymlinks(componentName: string, versions: string[]): Promise<void> {
    const scriptsDir = path.join(this.model!.targetDirectory || '', 'scripts');
    const versionsDir = path.join(scriptsDir, 'versions');
    
    if (!fs.existsSync(versionsDir)) {
      return;
    }

    const componentLowerCase = componentName.toLowerCase();

    // Remove all version-specific symlinks
    for (const version of versions) {
      const versionScriptName = `${componentLowerCase}-v${version}`;
      const versionScriptPath = path.join(versionsDir, versionScriptName);

      try {
        fs.lstatSync(versionScriptPath);
        await fs.promises.unlink(versionScriptPath);
        console.log(`🔗 Removed version script symlink: ${versionScriptName}`);
      } catch {
        // Doesn't exist
      }
    }

    // Remove main script symlink
    const mainScriptPath = path.join(scriptsDir, componentLowerCase);
    try {
      fs.lstatSync(mainScriptPath);
      await fs.promises.unlink(mainScriptPath);
      console.log(`🔗 Removed main script symlink: ${componentLowerCase}`);
    } catch {
      // Doesn't exist
    }
  }

  /**
   * Upgrade component to next version with semantic version control
   * @param versionPromotion Version type: 'nextBuild', 'nextPatch', 'nextMinor', 'nextMajor', or specific version
   * @cliSyntax versionPromotion
   * @cliValues versionPromotion nextPatch nextMinor nextMajor nextBuild
   */
  async upgrade(versionPromotion: string = 'nextPatch'): Promise<this> {
    this.printQuickHeader();
    
    const target = this.getTarget();
    const targetComponent = target.model!.component || this.model!.component || '';
    const targetVersion = target.model!.version || this.model!.version;
    
    const nextVersion = await SemanticVersion.promote(targetVersion?.toString() || '0.0.0.0', versionPromotion);
    console.log(`🔧 Upgrading ${targetComponent}: ${targetVersion?.toString()} → ${nextVersion}`);
    
    (this.model as any).toVersion = nextVersion;
    
    if (target !== this) {
      this.model!.component = targetComponent;
      this.model!.version = targetVersion;
    }
    
    await this.createVersionFromExisting();
    await this.updateSymlinks();
    
    console.log(`✅ ${targetComponent} ${nextVersion} created successfully`);
    console.log(`   Location: components/${targetComponent}/${nextVersion}`);
    
    if ((this.model as any).context) {
      (this.model as any).context.model.version = SemanticVersion.fromString(nextVersion);
      (this.model as any).context.model.origin = `components/${targetComponent}/${nextVersion}`;
    }
    
    return this;
  }

  /**
   * Create new version from existing
   * @cliHide
   */
  private async createVersionFromExisting(): Promise<void> {
    const sourcePath = path.join(this.model!.componentsDirectory || '', this.model!.component || '', this.model!.version?.toString() || '');
    const targetPath = path.join(this.model!.componentsDirectory || '', this.model!.component || '', (this.model as any).toVersion);
    
    if (fs.existsSync(targetPath)) {
      console.error(`❌ ERROR: Version ${(this.model as any).toVersion} already exists!`);
      throw new Error(`Version ${(this.model as any).toVersion} already exists`);
    }
    
    await this.copyDirectory(sourcePath, targetPath);
    await this.updatePackageJsonVersion(targetPath);
    await this.updateCLIScriptVersion(targetPath);
  }

  /**
   * Copy directory recursively
   * @cliHide
   */
  private async copyDirectory(source: string, target: string, componentRoot?: string): Promise<void> {
    await fs.promises.mkdir(target, { recursive: true });
    const entries = await fs.promises.readdir(source, { withFileTypes: true });
    
    if (!componentRoot) {
      componentRoot = source;
    }
    
    const relativePath = path.relative(componentRoot, source);
    
    // Skip patterns
    const skipPatterns = ['node_modules', '.git', 'dist', '*.scenario.json'];
    
    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(target, entry.name);
      
      // Skip node_modules, .git, dist
      if (skipPatterns.some(p => entry.name === p || (p.startsWith('*') && entry.name.endsWith(p.slice(1))))) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath, componentRoot);
      } else if (entry.isSymbolicLink()) {
        const linkTarget = await fs.promises.readlink(srcPath);
        try {
          await fs.promises.symlink(linkTarget, destPath);
        } catch {
          // Silent fail for symlinks
        }
      } else {
        await fs.promises.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Update package.json version field
   * @cliHide
   */
  private async updatePackageJsonVersion(targetPath: string): Promise<void> {
    const packageJsonPath = path.join(targetPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageContent = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf-8'));
      packageContent.version = (this.model as any).toVersion;
      await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageContent, null, 2));
    }
  }

  /**
   * Update CLI script COMPONENT_VERSION variable
   * @cliHide
   */
  private async updateCLIScriptVersion(targetPath: string): Promise<void> {
    try {
      const cliScripts = await fs.promises.readdir(targetPath);
      const cliScript = cliScripts.find(file => 
        file.endsWith('.sh') || 
        (!file.includes('.') && !['node_modules', 'spec', 'src', 'test', 'dist'].includes(file))
      );
      
      if (cliScript) {
        const cliScriptPath = path.join(targetPath, cliScript);
        const stats = await fs.promises.stat(cliScriptPath);
        if (stats.isFile()) {
          let cliContent = await fs.promises.readFile(cliScriptPath, 'utf-8');
          cliContent = cliContent.replace(
            /COMPONENT_VERSION="[^"]+"/,
            `COMPONENT_VERSION="${(this.model as any).toVersion}"`
          );
          await fs.promises.writeFile(cliScriptPath, cliContent);
          console.log(`   ✅ CLI script updated: ${cliScript}`);
        }
      }
    } catch {
      // CLI script update is optional
    }
  }

  /**
   * Update symlinks for component version
   * @cliHide
   */
  private async updateSymlinks(): Promise<void> {
    try {
      await this.updateLatestSymlink();
      await this.updateScriptsSymlinks();
      console.log(`   🔗 Symlinks updated: latest → ${(this.model as any).toVersion}`);
    } catch (error: any) {
      console.log(`   ⚠️ Symlink update had issues: ${error.message}`);
    }
  }

  /**
   * Update latest symlink in component directory
   * @cliHide
   */
  private async updateLatestSymlink(): Promise<void> {
    const componentDir = path.join(this.model!.componentsDirectory || '', this.model!.component || '');
    const latestPath = path.join(componentDir, 'latest');
    
    try {
      if (fs.existsSync(latestPath)) {
        await fs.promises.unlink(latestPath);
      }
      await fs.promises.symlink((this.model as any).toVersion, latestPath);
    } catch (error: any) {
      console.log(`   ⚠️ Could not update latest symlink: ${error.message}`);
    }
  }

  /**
   * Update scripts and scripts/versions symlinks
   * @cliHide
   */
  private async updateScriptsSymlinks(): Promise<void> {
    try {
      await this.createVersionScriptSymlink();
      await this.updateMainScriptSymlink();
    } catch (error: any) {
      console.log(`   ⚠️ Could not update scripts symlinks: ${error.message}`);
    }
  }

  /**
   * Create version-specific script symlink
   * @cliHide
   */
  private async createVersionScriptSymlink(version: string = (this.model as any).toVersion): Promise<void> {
    const projectRoot = this.model!.projectRoot || '';
    const versionsDir = path.join(projectRoot, 'scripts', 'versions');
    
    await fs.promises.mkdir(versionsDir, { recursive: true });
    
    const componentLower = (this.model!.component || '').toLowerCase();
    const scriptName = `${componentLower}-v${version}`;
    const scriptPath = path.join(versionsDir, scriptName);
    
    const componentVersionDir = path.join(projectRoot, 'components', this.model!.component || '', version);
    const possibleScripts = [`${componentLower}.sh`, componentLower, 'cli.sh', 'cli'];
    
    let targetScript = '';
    for (const script of possibleScripts) {
      const scriptFile = path.join(componentVersionDir, script);
      if (fs.existsSync(scriptFile)) {
        targetScript = script;
        break;
      }
    }
    
    if (!targetScript) return;
    
    try {
      try { await fs.promises.unlink(scriptPath); } catch { /* doesn't exist */ }
      const relativePath = path.relative(versionsDir, path.join(componentVersionDir, targetScript));
      await fs.promises.symlink(relativePath, scriptPath);
    } catch (error: any) {
      console.log(`   ❌ Could not create version script symlink: ${error.message}`);
    }
  }

  /**
   * Update main script symlink to point to latest
   * @cliHide
   */
  private async updateMainScriptSymlink(): Promise<void> {
    const scriptsDir = path.join(this.model!.targetDirectory || '', 'scripts');
    const componentLower = (this.model!.component || '').toLowerCase();
    const mainScriptPath = path.join(scriptsDir, componentLower);
    
    const componentDir = path.join(this.model!.componentsDirectory || '', this.model!.component || '');
    const targetPath = path.relative(scriptsDir, path.join(componentDir, 'latest', componentLower));
    
    try {
      if (fs.existsSync(mainScriptPath)) {
        await fs.promises.unlink(mainScriptPath);
      }
      await fs.promises.symlink(targetPath, mainScriptPath);
    } catch (error: any) {
      console.log(`   ⚠️ Could not update main script symlink: ${error.message}`);
    }
  }
}

