/**
 * DefaultProjectStatusManager - ProjectStatusManager Component Implementation
 * Web4 pattern: Empty constructor + scenario initialization + component functionality
 */

import { ProjectStatusManager } from '../layer3/ProjectStatusManager.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { ProjectStatusManagerModel } from '../layer3/ProjectStatusManagerModel.interface.js';

export class DefaultProjectStatusManager implements ProjectStatusManager {
  private model: ProjectStatusManagerModel;

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
  init(scenario: Scenario<ProjectStatusManagerModel>): this {
    if (scenario.model) {
      this.model = { ...this.model, ...scenario.model };
    }
    return this;
  }

  /**
   * @cliHide
   */
  async toScenario(name?: string): Promise<Scenario<ProjectStatusManagerModel>> {
    const ownerData = JSON.stringify({
      user: process.env.USER || 'system',
      hostname: process.env.HOSTNAME || 'localhost',
      uuid: this.model.uuid,
      timestamp: new Date().toISOString(),
      component: 'ProjectStatusManager',
      version: '0.1.0.0'
    });

    return {
      ior: {
        uuid: this.model.uuid,
        component: 'ProjectStatusManager',
        version: '0.1.0.0'
      },
      owner: ownerData,
      model: this.model
    };
  }

  /**
   * Show current project status and progress
   * @cliSyntax
   */
  async status(): Promise<this> {
    console.log(`📊 UpDown Project Status Report`);
    console.log(`=====================================`);
    
    // Check component migration status
    const fs = await import('fs');
    const path = await import('path');
    
    // Get the project root (3 levels up from component directory)
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const componentRoot = path.resolve(__dirname, '../../../../..');
    const componentsDir = componentRoot; // componentsDir is already the components directory
    
    const components = [
      { old: 'UpDown.Cards', new: 'CardDeckManager', status: 'unknown' },
      { old: 'UpDown.Core', new: 'GameLogicEngine', status: 'unknown' },
      { old: 'UpDown.Demo', new: 'GameDemoSystem', status: 'unknown' },
      { old: 'UpDown.Server', new: 'MultiplayerServer', status: 'unknown' },
      { old: 'UpDown.UI', new: 'GameUserInterface', status: 'unknown' }
    ];
    
    console.log(`\n🔄 Component Migration Status:`);
    for (const component of components) {
      const oldPath = path.join(componentsDir, component.old);
      const newPath = path.join(componentsDir, component.new);
      
      if (fs.existsSync(newPath)) {
        console.log(`   ✅ ${component.old} → ${component.new} (MIGRATED)`);
      } else if (fs.existsSync(oldPath)) {
        console.log(`   🚧 ${component.old} (PENDING MIGRATION)`);
      } else {
        console.log(`   ❓ ${component.old} (NOT FOUND)`);
      }
    }
    
    // Check documentation status
    console.log(`\n📚 Documentation Status:`);
    const docsDir = path.join(componentRoot, 'docs');
    const docFiles = [
      'PROJECT-PLAN-CHECKLIST.md',
      'COMPONENT-MIGRATION-ACHIEVEMENT.md',
      'CONTINUATION-PLAN.md',
      'DOCUMENTATION-INDEX.md'
    ];
    
    for (const docFile of docFiles) {
      const docPath = path.join(docsDir, docFile);
      if (fs.existsSync(docPath)) {
        console.log(`   ✅ ${docFile}`);
      } else {
        console.log(`   ❌ ${docFile} (MISSING)`);
      }
    }
    
    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Show next actions based on current project status
   * @cliSyntax
   */
  async nextActions(): Promise<this> {
    console.log(`🎯 Next Actions for UpDown Project`);
    console.log(`=====================================`);
    
    console.log(`\n📋 Phase 1: Complete Component Migration (IMMEDIATE)`);
    console.log(`   1. Run: componentmigrator migrateAllUpDownComponents 0.2.0.0`);
    console.log(`   2. Test all migrated components`);
    console.log(`   3. Clean up old component directories`);
    console.log(`   4. Update documentation references`);
    
    console.log(`\n📋 Phase 2: Documentation and Cleanup (SHORT-TERM)`);
    console.log(`   1. Update main README with new component names`);
    console.log(`   2. Update component READMEs`);
    console.log(`   3. Update implementation history documents`);
    console.log(`   4. Update tech stack documentation`);
    
    console.log(`\n📋 Phase 3: Enhanced Development (MEDIUM-TERM)`);
    console.log(`   1. Implement MultiplayerServer functionality`);
    console.log(`   2. Create GameUserInterface components`);
    console.log(`   3. Enhance GameLogicEngine features`);
    console.log(`   4. Improve GameDemoSystem capabilities`);
    
    console.log(`\n📋 Phase 4: Production Deployment (LONG-TERM)`);
    console.log(`   1. Performance optimization`);
    console.log(`   2. Security review and implementation`);
    console.log(`   3. Production environment setup`);
    console.log(`   4. Launch strategy execution`);
    
    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Show project progress and metrics
   * @cliSyntax
   */
  async progress(): Promise<this> {
    console.log(`📈 UpDown Project Progress Metrics`);
    console.log(`=====================================`);
    
    // Calculate progress percentages
    const fs = await import('fs');
    const path = await import('path');
    
    // Get the project root (3 levels up from component directory)
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const componentRoot = path.resolve(__dirname, '../../../../..');
    const componentsDir = componentRoot; // componentsDir is already the components directory
    const totalComponents = 5;
    let migratedComponents = 0;
    
    const components = [
      { old: 'UpDown.Cards', new: 'CardDeckManager' },
      { old: 'UpDown.Core', new: 'GameLogicEngine' },
      { old: 'UpDown.Demo', new: 'GameDemoSystem' },
      { old: 'UpDown.Server', new: 'MultiplayerServer' },
      { old: 'UpDown.UI', new: 'GameUserInterface' }
    ];
    
    for (const component of components) {
      const newPath = path.join(componentsDir, component.new);
      if (fs.existsSync(newPath)) {
        migratedComponents++;
      }
    }
    
    const migrationProgress = (migratedComponents / totalComponents) * 100;
    
    console.log(`\n🔄 Component Migration Progress: ${migrationProgress.toFixed(1)}%`);
    console.log(`   Migrated: ${migratedComponents}/${totalComponents} components`);
    console.log(`   Remaining: ${totalComponents - migratedComponents} components`);
    
    // Check documentation completeness
    const docsDir = path.join(componentRoot, 'docs');
    const requiredDocs = [
      'PROJECT-PLAN-CHECKLIST.md',
      'COMPONENT-MIGRATION-ACHIEVEMENT.md',
      'CONTINUATION-PLAN.md',
      'DOCUMENTATION-INDEX.md',
      'LEARNING-FROM-ITERATION-1.md',
      'tech-stack.md'
    ];
    
    let existingDocs = 0;
    for (const doc of requiredDocs) {
      const docPath = path.join(docsDir, doc);
      if (fs.existsSync(docPath)) {
        existingDocs++;
      }
    }
    
    const docProgress = (existingDocs / requiredDocs.length) * 100;
    
    console.log(`\n📚 Documentation Progress: ${docProgress.toFixed(1)}%`);
    console.log(`   Complete: ${existingDocs}/${requiredDocs.length} documents`);
    console.log(`   Remaining: ${requiredDocs.length - existingDocs} documents`);
    
    // Overall project progress
    const overallProgress = (migrationProgress + docProgress) / 2;
    
    console.log(`\n🏆 Overall Project Progress: ${overallProgress.toFixed(1)}%`);
    
    if (overallProgress >= 90) {
      console.log(`   🚀 Excellent progress! Project is nearly complete.`);
    } else if (overallProgress >= 70) {
      console.log(`   📈 Good progress! Continue with current plan.`);
    } else if (overallProgress >= 50) {
      console.log(`   🔄 Steady progress! Focus on completing migrations.`);
    } else {
      console.log(`   🚧 Early stage! Focus on component migrations first.`);
    }
    
    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Show project timeline and milestones
   * @cliSyntax
   */
  async timeline(): Promise<this> {
    console.log(`📅 UpDown Project Timeline`);
    console.log(`=====================================`);
    
    console.log(`\n🎯 Phase 1: Component Migration (CURRENT)`);
    console.log(`   Status: IN PROGRESS`);
    console.log(`   Goal: Migrate all components to proper naming`);
    console.log(`   Next: Run componentmigrator migrateAllUpDownComponents 0.2.0.0`);
    
    console.log(`\n📋 Phase 2: Documentation & Cleanup (NEXT)`);
    console.log(`   Status: PENDING`);
    console.log(`   Goal: Update all documentation and clean up old components`);
    console.log(`   Timeline: After Phase 1 completion`);
    
    console.log(`\n🚀 Phase 3: Enhanced Development (FUTURE)`);
    console.log(`   Status: PLANNED`);
    console.log(`   Goal: Implement advanced game features and UI`);
    console.log(`   Timeline: After Phase 2 completion`);
    
    console.log(`\n🏆 Phase 4: Production Deployment (FUTURE)`);
    console.log(`   Status: PLANNED`);
    console.log(`   Goal: Production-ready game platform`);
    console.log(`   Timeline: After Phase 3 completion`);
    
    console.log(`\n📊 Current Focus:`);
    console.log(`   🎯 Immediate: Complete component migrations`);
    console.log(`   📚 Short-term: Update documentation`);
    console.log(`   🚀 Medium-term: Enhanced development`);
    console.log(`   🏆 Long-term: Production deployment`);
    
    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Process data through ProjectStatusManager logic
   * @param data Data to process
   * @cliSyntax data
   */
  async process(data: string): Promise<this> {
    console.log(`🔧 Processing: ${data}`);
    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Show information about current ProjectStatusManager state
   */
  async info(): Promise<this> {
    console.log(`📋 ProjectStatusManager Information:`);
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
    
    console.log(`🧪 Running ProjectStatusManager tests with auto-promotion...`);
    
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
      
      console.log(`✅ ProjectStatusManager tests completed successfully`);
      
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
        await web4ts.on('ProjectStatusManager', currentVersion);
        await web4ts.upgrade('nextBuild');
        const parts = currentVersion.split('.').map(Number);
        const devVersion = `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3] + 1}`;
        await web4ts.on('ProjectStatusManager', devVersion);
        await web4ts.setDev();
      }
      // Stage 1: Current is dev, no test link OR test is outdated → create test version
      else if (currentVersion === semanticLinks.dev && (!semanticLinks.test || semanticLinks.test < currentVersion)) {
        console.log(`\n🧪 Stage 1: dev → test (creating test version)...`);
        await web4ts.on('ProjectStatusManager', currentVersion);
        await web4ts.upgrade('nextBuild');
        const parts = currentVersion.split('.').map(Number);
        const testVersion = `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3] + 1}`;
        await web4ts.on('ProjectStatusManager', testVersion);
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
            await web4ts.on('ProjectStatusManager', currentVersion);
            await web4ts.upgrade('nextPatch');
            
            // Find the newly created prod version (highest version)
            const componentParentDir = path.dirname(path.dirname(path.dirname(componentRoot)));
            const componentsDir = path.join(componentParentDir, 'components');
            const componentDir = path.join(componentsDir, 'ProjectStatusManager');
            const versions = readdirSync(componentDir)
              .filter(v => /^\d+\.\d+\.\d+\.\d+$/.test(v))
              .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
            const prodVersion = versions[0];  // Highest version is the new prod
            
            // Set prod symlink
            await web4ts.on('ProjectStatusManager', prodVersion);
            await web4ts.setProd();
            console.log(`✅ Promoted to production: ${prodVersion}`);
            
            // CRITICAL: Now create new dev version (nextBuild from prod)
            console.log(`🚧 Creating new dev version...`);
            await web4ts.on('ProjectStatusManager', prodVersion);
            await web4ts.upgrade('nextBuild');
            
            // Find the newly created dev version (highest version)
            const newVersions = readdirSync(componentDir)
              .filter(v => /^\d+\.\d+\.\d+\.\d+$/.test(v))
              .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
            const newDevVersion = newVersions[0];  // Highest version is the new dev
            await web4ts.on('ProjectStatusManager', newDevVersion);
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
      console.error(`❌ ProjectStatusManager tests failed`);
      throw error;
    }
    
    return this;
  }
}
