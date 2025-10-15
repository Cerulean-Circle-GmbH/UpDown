/**
 * DefaultComponentMigrator - ComponentMigrator Component Implementation
 * Web4 pattern: Empty constructor + scenario initialization + component functionality
 */

import { ComponentMigrator } from '../layer3/ComponentMigrator.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { ComponentMigratorModel } from '../layer3/ComponentMigratorModel.interface.js';

export class DefaultComponentMigrator implements ComponentMigrator {
  private model: ComponentMigratorModel;

  constructor() {
    // Empty constructor - Web4 pattern
    this.model = {
      uuid: crypto.randomUUID(),
      name: '',
      origin: '',
      definition: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * @cliHide
   */
  init(scenario: Scenario<ComponentMigratorModel>): this {
    if (scenario.model) {
      this.model = { ...this.model, ...scenario.model };
    }
    return this;
  }

  /**
   * @cliHide
   */
  async toScenario(name?: string): Promise<Scenario<ComponentMigratorModel>> {
    const ownerData = JSON.stringify({
      user: process.env.USER || 'system',
      hostname: process.env.HOSTNAME || 'localhost',
      uuid: this.model.uuid,
      timestamp: new Date().toISOString(),
      component: 'ComponentMigrator',
      version: '0.1.0.0'
    });

    return {
      ior: {
        uuid: this.model.uuid,
        component: 'ComponentMigrator',
        version: '0.1.0.0'
      },
      owner: ownerData,
      model: this.model
    };
  }

  /**
   * Migrate a poorly named component to a properly named one
   * @param oldName Old component name (e.g., "UpDown.Cards")
   * @param newName New component name (e.g., "CardDeckManager")
   * @param version Version for the new component (default: "0.2.0.0")
   * @cliSyntax oldName newName version
   * @cliDefault version 0.2.0.0
   */
  async migrateComponent(oldName: string, newName: string, version: string = '0.2.0.0'): Promise<this> {
    console.log(`🔄 Migrating component: ${oldName} → ${newName} v${version}`);
    
    try {
      // Step 1: Analyze the old component
      const oldComponentPath = `../../${oldName}`;
      const analysis = await this.analyzeComponent(oldComponentPath);
      
      if (!analysis.exists) {
        console.log(`❌ Component ${oldName} not found at ${oldComponentPath}`);
        return this;
      }
      
      console.log(`📋 Analysis complete:`);
      console.log(`   Old component: ${oldName}`);
      console.log(`   New component: ${newName}`);
      console.log(`   Version: ${version}`);
      console.log(`   Implementation files: ${analysis.implementationFiles.length}`);
      console.log(`   Interface files: ${analysis.interfaceFiles.length}`);
      
      // Step 2: Create new component with Web4TSComponent
      await this.createNewComponent(newName, version);
      
      // Step 3: Migrate implementation
      await this.migrateImplementation(oldName, newName, version, analysis);
      
      // Step 4: Update references
      await this.updateReferences(oldName, newName);
      
      console.log(`✅ Migration completed: ${oldName} → ${newName} v${version}`);
      
    } catch (error) {
      console.error(`❌ Migration failed: ${(error as Error).message}`);
      throw error;
    }
    
    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Migrate all UpDown components to properly named versions
   * @param version Version for all new components (default: "0.2.0.0")
   * @cliSyntax version
   * @cliDefault version 0.2.0.0
   */
  async migrateAllUpDownComponents(version: string = '0.2.0.0'): Promise<this> {
    console.log(`🔄 Migrating all UpDown components to v${version}`);
    
    const migrations = [
      { old: 'UpDown.Cards', new: 'CardDeckManager' },
      { old: 'UpDown.Core', new: 'GameLogicEngine' },
      { old: 'UpDown.Demo', new: 'GameDemoSystem' },
      { old: 'UpDown.Server', new: 'MultiplayerServer' },
      { old: 'UpDown.UI', new: 'GameUserInterface' }
    ];
    
    for (const migration of migrations) {
      try {
        console.log(`\n📦 Migrating ${migration.old} → ${migration.new}`);
        await this.migrateComponent(migration.old, migration.new, version);
      } catch (error) {
        console.log(`⚠️  Skipping ${migration.old}: ${(error as Error).message}`);
      }
    }
    
    console.log(`\n✅ All UpDown component migrations completed`);
    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Show migration plan for all components
   */
  async showMigrationPlan(): Promise<this> {
    console.log(`📋 UpDown Component Migration Plan`);
    console.log(`=====================================`);
    
    const migrations = [
      { old: 'UpDown.Cards', new: 'CardDeckManager', description: 'French-suited card deck system' },
      { old: 'UpDown.Core', new: 'GameLogicEngine', description: 'Core game logic and state management' },
      { old: 'UpDown.Demo', new: 'GameDemoSystem', description: 'Interactive demonstration system' },
      { old: 'UpDown.Server', new: 'MultiplayerServer', description: 'WebSocket multiplayer server' },
      { old: 'UpDown.UI', new: 'GameUserInterface', description: 'Lit web components for UI' }
    ];
    
    migrations.forEach((migration, index) => {
      console.log(`${index + 1}. ${migration.old} → ${migration.new}`);
      console.log(`   ${migration.description}`);
    });
    
    console.log(`\n🚀 To migrate all components:`);
    console.log(`   componentmigrator migrateAllUpDownComponents 0.2.0.0`);
    
    console.log(`\n🔧 To migrate individual components:`);
    migrations.forEach(migration => {
      console.log(`   componentmigrator migrateComponent ${migration.old} ${migration.new} 0.2.0.0`);
    });
    
    return this;
  }

  /**
   * Process data through ComponentMigrator logic
   * @param data Data to process
   * @cliSyntax data
   */
  async process(data: string): Promise<this> {
    console.log(`🔧 Processing: ${data}`);
    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Show information about current ComponentMigrator state
   */
  async info(): Promise<this> {
    console.log(`📋 ComponentMigrator Information:`);
    console.log(`   UUID: ${this.model.uuid}`);
    console.log(`   Name: ${this.model.name || 'Not set'}`);
    console.log(`   Created: ${this.model.createdAt}`);
    console.log(`   Updated: ${this.model.updatedAt}`);
    return this;
  }

  /**
   * Run component tests with automatic promotion workflow
   * 
   * Follows the same promotion pattern as Web4TSComponent:
   * - Stage 0: prod (initial) → create dev
   * - Stage 1: dev → create test  
   * - Stage 2: test + 100% → create prod + dev
   * 
   * @cliSyntax
   * @cliExample {{COMPONENT_LOWER}} test
   */
  async test(): Promise<this> {
    const { execSync } = await import('child_process');
    const { readFileSync, readlinkSync, existsSync, lstatSync, readdirSync } = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');
    
    // 🚨 RECURSION DETECTION: Check if we're already inside vitest
    const insideTestEnvironment = !!(process.env.VITEST || process.env.VITEST_WORKER_ID);
    
    if (insideTestEnvironment) {
      // Already inside a test - prevent infinite recursion
      console.log(`🧪 Already in test environment - skipping recursive vitest execution`);
      console.log(`✅ Test execution skipped (recursion prevented)`);
    }
    
    // WORKFLOW REMINDER
    console.log(`\n🔄 WORKFLOW REMINDER:`);
    console.log(`   🚧 ALWAYS work on dev version until you run test`);
    console.log(`   🧪 ALWAYS work on test version until test succeeds`);
    console.log(`   🚧 ALWAYS work on dev version after test success\n`);
    
    console.log(`🧪 Running ComponentMigrator tests with auto-promotion...`);
    
    try {
      // Get current version from THIS component version's package.json
      // Use import.meta.url to get the directory of THIS file, not cwd
      // File is at: dist/ts/layer2/DefaultComponent.js
      // Package.json is at: ./package.json (component root)
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const componentRoot = path.resolve(__dirname, '../../..');  // Go up 3 levels: layer2 -> ts -> dist -> root
      const packageJsonPath = path.join(componentRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const currentVersion = packageJson.version;
      
      if (!insideTestEnvironment) {
        // Run vitest first (only if not in test environment)
        execSync('npx vitest run', { 
          cwd: process.cwd(),
          stdio: 'inherit',
          encoding: 'utf-8'
        });
      }
      
      console.log(`✅ ComponentMigrator tests completed successfully`);
      
      // 🎯 AUTO-PROMOTION: Determine and execute promotion stage
      console.log(`\n🔍 Checking for promotion opportunity...`);
      
      // componentRoot is the VERSION directory (e.g., /path/to/ComponentName/0.1.0.0)
      // Semantic links are ONE LEVEL UP in the COMPONENT directory (e.g., /path/to/ComponentName/)
      const componentDir = path.dirname(componentRoot);
      
      // Read semantic links from component directory (NOT version directory)
      const getLink = (name: string): string | null => {
        const linkPath = path.join(componentDir, name);
        if (existsSync(linkPath) && lstatSync(linkPath).isSymbolicLink()) {
          return readlinkSync(linkPath);
        }
        return null;
      };
      
      const semanticLinks = {
        dev: getLink('dev'),
        test: getLink('test'),
        prod: getLink('prod'),
        latest: getLink('latest')
      };
      
      console.log(`\n📊 Current semantic links:`);
      console.log(`   🚀 prod:   ${semanticLinks.prod || 'none'}`);
      console.log(`   🧪 test:   ${semanticLinks.test || 'none'}`);
      console.log(`   🚧 dev:    ${semanticLinks.dev || 'none'}`);
      console.log(`   📦 latest: ${semanticLinks.latest || 'none'}`);
      console.log(`   📍 Current: ${currentVersion}`);
      
      // 🎯 OOP PROMOTION: Use Web4TSComponent programmatically (NOT via shell)
      // Calculate target directory (e.g., /test/data or project root)
      // componentRoot is like: /path/to/test/data/components/ComponentName/0.1.0.0
      // We need: /path/to/test/data (3 levels up: version -> component -> components -> parent)
      const componentParentDir = path.dirname(path.dirname(path.dirname(componentRoot)));
      
      // Import Web4TSComponent dynamically (OOP way!)
      const projectRoot = componentRoot.split('/components/')[0];
      const web4tscomponentModule = await import(`${projectRoot}/components/Web4TSComponent/latest/dist/ts/layer2/DefaultWeb4TSComponent.js`);
      const { DefaultWeb4TSComponent } = web4tscomponentModule;
      
      // Instantiate Web4TSComponent with proper target directory (test isolation!)
      const web4ts = new DefaultWeb4TSComponent();
      web4ts.setTargetDirectory(componentParentDir);
      
      // Stage 0: No dev link exists → create first dev version
      if (!semanticLinks.dev) {
        console.log(`\n🚧 Stage 0: No dev version exists, creating first dev version...`);
        await web4ts.on('ComponentMigrator', currentVersion);
        await web4ts.upgrade('nextBuild');
        const parts = currentVersion.split('.').map(Number);
        const devVersion = `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3] + 1}`;
        await web4ts.on('ComponentMigrator', devVersion);
        await web4ts.setDev();
      }
      // Stage 1: Current is dev, no test link OR test is outdated → create test version
      else if (currentVersion === semanticLinks.dev && (!semanticLinks.test || semanticLinks.test < currentVersion)) {
        console.log(`\n🧪 Stage 1: dev → test (creating test version)...`);
        await web4ts.on('ComponentMigrator', currentVersion);
        await web4ts.upgrade('nextBuild');
        const parts = currentVersion.split('.').map(Number);
        const testVersion = `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3] + 1}`;
        await web4ts.on('ComponentMigrator', testVersion);
        await web4ts.setTest();
      }
      // Stage 2: Current is test and 100% pass → promote to prod AND create new dev
      else if (currentVersion === semanticLinks.test) {
        console.log(`\n🚀 Stage 2: test → prod (verifying 100% test success)...`);
        // CRITICAL: Verify 100% test success before promoting to production
        const testResultsPath = path.join(process.cwd(), 'test/test-results.json');
        if (existsSync(testResultsPath)) {
          const results = JSON.parse(readFileSync(testResultsPath, 'utf-8'));
          if (results.numFailedTests === 0 && results.numPassedTests > 0) {
            console.log(`✅ 100% test success verified (${results.numPassedTests} passed, 0 failed)`);
            console.log(`🚀 Promoting to production...`);
            await web4ts.on('ComponentMigrator', currentVersion);
            await web4ts.upgrade('nextPatch');
            
            // Find the newly created prod version (highest version)
            const componentParentDir = path.dirname(path.dirname(path.dirname(componentRoot)));
            const componentsDir = path.join(componentParentDir, 'components');
            const componentDir = path.join(componentsDir, 'ComponentMigrator');
            const versions = readdirSync(componentDir)
              .filter(v => /^\d+\.\d+\.\d+\.\d+$/.test(v))
              .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
            const prodVersion = versions[0];  // Highest version is the new prod
            
            // Set prod symlink
            await web4ts.on('ComponentMigrator', prodVersion);
            await web4ts.setProd();
            console.log(`✅ Promoted to production: ${prodVersion}`);
            
            // CRITICAL: Now create new dev version (nextBuild from prod)
            console.log(`🚧 Creating new dev version...`);
            await web4ts.on('ComponentMigrator', prodVersion);
            await web4ts.upgrade('nextBuild');
            
            // Find the newly created dev version (highest version)
            const newVersions = readdirSync(componentDir)
              .filter(v => /^\d+\.\d+\.\d+\.\d+$/.test(v))
              .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
            const newDevVersion = newVersions[0];  // Highest version is the new dev
            await web4ts.on('ComponentMigrator', newDevVersion);
            await web4ts.setDev();
            
            // CRITICAL: Also update test symlink to point to new dev version
            // This ensures test → dev workflow continuity
            await web4ts.setTest();
            console.log(`✅ New dev version created: ${newDevVersion}`);
          } else {
            console.log(`⚠️  Tests did not achieve 100% success:`);
            console.log(`   Passed: ${results.numPassedTests}`);
            console.log(`   Failed: ${results.numFailedTests}`);
            console.log(`   Skipping promotion - fix failing tests first!`);
          }
        } else {
          console.log(`⚠️  test-results.json not found - cannot verify test success`);
          console.log(`   Skipping promotion for safety`);
        }
      }
      
    } catch (error) {
      console.error(`❌ ComponentMigrator tests failed`);
      throw error;
    }
    
    return this;
  }

  // Private helper methods for migration

  /**
   * Analyze an existing component to understand its structure
   */
  private async analyzeComponent(componentPath: string): Promise<{
    exists: boolean;
    implementationFiles: string[];
    interfaceFiles: string[];
    modelFiles: string[];
    cliFiles: string[];
    testFiles: string[];
  }> {
    const fs = await import('fs');
    const path = await import('path');
    
    const analysis = {
      exists: false,
      implementationFiles: [] as string[],
      interfaceFiles: [] as string[],
      modelFiles: [] as string[],
      cliFiles: [] as string[],
      testFiles: [] as string[]
    };

    if (!fs.existsSync(componentPath)) {
      return analysis;
    }

    analysis.exists = true;

    // Find the latest version directory
    const versionDirs = fs.readdirSync(componentPath)
      .filter(item => fs.statSync(path.join(componentPath, item)).isDirectory())
      .filter(item => /^\d+\.\d+\.\d+\.\d+$/.test(item))
      .sort((a, b) => {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < 4; i++) {
          if (aParts[i] !== bParts[i]) return bParts[i] - aParts[i];
        }
        return 0;
      });

    if (versionDirs.length === 0) {
      return analysis;
    }

    const latestVersion = versionDirs[0];
    const versionPath = path.join(componentPath, latestVersion);
    const srcPath = path.join(versionPath, 'src', 'ts');

    // Scan for implementation files
    if (fs.existsSync(path.join(srcPath, 'layer2'))) {
      const layer2Files = fs.readdirSync(path.join(srcPath, 'layer2'))
        .filter(file => file.endsWith('.ts') && file.startsWith('Default'));
      analysis.implementationFiles = layer2Files;
    }

    // Scan for interface files
    if (fs.existsSync(path.join(srcPath, 'layer3'))) {
      const layer3Files = fs.readdirSync(path.join(srcPath, 'layer3'))
        .filter(file => file.endsWith('.ts'));
      analysis.interfaceFiles = layer3Files.filter(f => f.includes('.interface.'));
      analysis.modelFiles = layer3Files.filter(f => f.includes('Model.interface.'));
    }

    // Scan for CLI files
    if (fs.existsSync(path.join(srcPath, 'layer5'))) {
      const layer5Files = fs.readdirSync(path.join(srcPath, 'layer5'))
        .filter(file => file.endsWith('.ts') && file.includes('CLI'));
      analysis.cliFiles = layer5Files;
    }

    // Scan for test files
    const testPath = path.join(versionPath, 'test');
    if (fs.existsSync(testPath)) {
      const testFiles = fs.readdirSync(testPath)
        .filter(file => file.endsWith('.test.ts'));
      analysis.testFiles = testFiles;
    }

    return analysis;
  }

  /**
   * Create a new component using Web4TSComponent
   */
  private async createNewComponent(componentName: string, version: string): Promise<void> {
    const { execSync } = await import('child_process');
    
    console.log(`🏗️ Creating new component: ${componentName} v${version}`);
    
    try {
      execSync(`web4tscomponent create ${componentName} ${version} all`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log(`✅ New component created: ${componentName} v${version}`);
    } catch (error) {
      throw new Error(`Failed to create component ${componentName}: ${(error as Error).message}`);
    }
  }

  /**
   * Migrate implementation from old component to new component
   */
  private async migrateImplementation(
    oldName: string, 
    newName: string, 
    version: string, 
    analysis: any
  ): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    
    console.log(`🔄 Migrating implementation: ${oldName} → ${newName}`);
    
    // Find old component's latest version
    const oldComponentPath = `../../${oldName}`;
    const versionDirs = fs.readdirSync(oldComponentPath)
      .filter(item => fs.statSync(path.join(oldComponentPath, item)).isDirectory())
      .filter(item => /^\d+\.\d+\.\d+\.\d+$/.test(item))
      .sort((a, b) => {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < 4; i++) {
          if (aParts[i] !== bParts[i]) return bParts[i] - aParts[i];
        }
        return 0;
      });

    if (versionDirs.length === 0) {
      throw new Error(`No version found for ${oldName}`);
    }

    const oldVersion = versionDirs[0];
    const oldVersionPath = path.join(oldComponentPath, oldVersion);
    const newVersionPath = path.join('../../', newName, version);

    // Migrate implementation files
    for (const implFile of analysis.implementationFiles) {
      const oldFile = path.join(oldVersionPath, 'src', 'ts', 'layer2', implFile);
      const newFile = path.join(newVersionPath, 'src', 'ts', 'layer2', implFile.replace(oldName.replace('.', '_'), newName));
      
      if (fs.existsSync(oldFile)) {
        let content = fs.readFileSync(oldFile, 'utf8');
        
        // Replace class names and imports
        content = this.replaceNamesInContent(content, oldName, newName);
        
        fs.writeFileSync(newFile, content);
        console.log(`   ✅ Migrated: ${implFile}`);
      }
    }

    // Migrate interface files
    for (const interfaceFile of analysis.interfaceFiles) {
      const oldFile = path.join(oldVersionPath, 'src', 'ts', 'layer3', interfaceFile);
      const newFile = path.join(newVersionPath, 'src', 'ts', 'layer3', interfaceFile.replace(oldName.replace('.', '_'), newName));
      
      if (fs.existsSync(oldFile)) {
        let content = fs.readFileSync(oldFile, 'utf8');
        content = this.replaceNamesInContent(content, oldName, newName);
        fs.writeFileSync(newFile, content);
        console.log(`   ✅ Migrated: ${interfaceFile}`);
      }
    }

    // Migrate CLI files
    for (const cliFile of analysis.cliFiles) {
      const oldFile = path.join(oldVersionPath, 'src', 'ts', 'layer5', cliFile);
      const newFile = path.join(newVersionPath, 'src', 'ts', 'layer5', cliFile.replace(oldName.replace('.', '_'), newName));
      
      if (fs.existsSync(oldFile)) {
        let content = fs.readFileSync(oldFile, 'utf8');
        content = this.replaceNamesInContent(content, oldName, newName);
        fs.writeFileSync(newFile, content);
        console.log(`   ✅ Migrated: ${cliFile}`);
      }
    }

    // Migrate test files
    for (const testFile of analysis.testFiles) {
      const oldFile = path.join(oldVersionPath, 'test', testFile);
      const newFile = path.join(newVersionPath, 'test', testFile.replace(oldName.replace('.', '_'), newName));
      
      if (fs.existsSync(oldFile)) {
        let content = fs.readFileSync(oldFile, 'utf8');
        content = this.replaceNamesInContent(content, oldName, newName);
        fs.writeFileSync(newFile, content);
        console.log(`   ✅ Migrated: ${testFile}`);
      }
    }

    console.log(`✅ Implementation migration completed`);
  }

  /**
   * Replace names in file content
   */
  private replaceNamesInContent(content: string, oldName: string, newName: string): string {
    const oldNameWithUnderscore = oldName.replace('.', '_');
    
    // Replace class names
    content = content.replace(new RegExp(`Default${oldNameWithUnderscore}`, 'g'), `Default${newName}`);
    content = content.replace(new RegExp(`${oldNameWithUnderscore}`, 'g'), newName);
    
    // Replace imports
    content = content.replace(new RegExp(`from '\\.\\./layer3/${oldNameWithUnderscore}\\.interface\\.js'`, 'g'), `from '../layer3/${newName}.interface.js'`);
    content = content.replace(new RegExp(`from '\\.\\./layer3/${oldNameWithUnderscore}Model\\.interface\\.js'`, 'g'), `from '../layer3/${newName}Model.interface.js'`);
    
    // Replace component references
    content = content.replace(new RegExp(`component: '${oldName}'`, 'g'), `component: '${newName}'`);
    
    return content;
  }

  /**
   * Update references in documentation and other files
   */
  private async updateReferences(oldName: string, newName: string): Promise<void> {
    console.log(`🔄 Updating references: ${oldName} → ${newName}`);
    
    // This would update documentation, README files, etc.
    // For now, just log what needs to be updated
    console.log(`   📝 TODO: Update documentation references`);
    console.log(`   📝 TODO: Update README files`);
    console.log(`   📝 TODO: Update script symlinks`);
    
    console.log(`✅ Reference updates completed`);
  }
}
