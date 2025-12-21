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
   * Tootsie: Quality consciousness testing (alias for test)
   * @param scope Test scope: 'all', 'file', 'describe', or 'itCase'
   * @param references Test file numbers or name patterns to execute
   * @cliSyntax scope references
   * @cliDefault scope all
   * @cliValues scope all file describe itCase
   * @cliExample once tootsie file 1
   * @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
   */
  async tootsie(scope: string = 'all', ...references: string[]): Promise<this> {
    return this.test(scope, ...references);
  }
  
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
    
    // Generate UUID for scenario
    const scenarioUuid = randomUUID();
    
    // Path Authority: Use projectRoot from model
    const projectRoot = this.model!.projectRoot || '';
    const scenariosRoot = path.join(projectRoot, 'scenarios');
    const scenarioDir = path.join(scenariosRoot, componentName, componentVersion);
    
    // Create directory
    fs.mkdirSync(scenarioDir, { recursive: true });
    
    // Write scenario
    const scenarioPath = path.join(scenarioDir, `${scenarioUuid}.scenario.json`);
    fs.writeFileSync(scenarioPath, JSON.stringify(targetScenario, null, 2));
    
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
    
    // Read descriptor (component.json is symlink to scenario file)
    try {
      const descriptorContent = fs.readFileSync(descriptorPath, 'utf-8');
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
}

