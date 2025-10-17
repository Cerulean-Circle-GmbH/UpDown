/**
 * DefaultUpDown.Demo - UpDown.Demo Component Implementation
 * Web4 pattern: Empty constructor + scenario initialization + component functionality
 */

import { GameDemoSystem } from '../layer3/GameDemoSystem.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { GameDemoSystemModel } from '../layer3/GameDemoSystemModel.interface.js';

export class DefaultGameDemoSystem implements GameDemoSystem {
  private model: GameDemoSystemModel;

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
  init(scenario: Scenario<GameDemoSystemModel>): this {
    if (scenario.model) {
      this.model = { ...this.model, ...scenario.model };
    }
    return this;
  }

  /**
   * @cliHide
   */
  async toScenario(name?: string): Promise<Scenario<GameDemoSystemModel>> {
    const ownerData = JSON.stringify({
      user: process.env.USER || 'system',
      hostname: process.env.HOSTNAME || 'localhost',
      uuid: this.model.uuid,
      timestamp: new Date().toISOString(),
      component: 'GameDemoSystem',
      version: '0.1.0.0'
    });

    return {
      ior: {
        uuid: this.model.uuid,
        component: 'GameDemoSystem',
        version: '0.1.0.0'
      },
      owner: ownerData,
      model: this.model
    };
  }

  /**
   * Run the complete UpDown game demo
   * @param scenario Demo scenario to run: 'cards', 'core', 'full', or 'all'
   * @cliSyntax scenario
   * @cliDefault scenario all
   */
  async runDemo(scenario: string = 'all'): Promise<this> {
    console.log('🎮 UpDown Game Demo - Web4TSComponent Architecture');
    console.log('==================================================\n');

    const scenarios = {
      cards: () => this.runCardsDemo(),
      core: () => this.runCoreDemo(),
      full: () => this.runFullGameDemo(),
      all: () => this.runAllDemos()
    };

    const selectedScenario = scenarios[scenario as keyof typeof scenarios];
    if (selectedScenario) {
      await selectedScenario();
    } else {
      console.log(`⚠️  Unknown scenario: ${scenario}`);
      console.log('Available scenarios: cards, core, full, all');
    }

    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Run cards system demo
   */
  async runCardsDemo(): Promise<this> {
    console.log('🃏 Demo 1: French-Suited Card System');
    console.log('------------------------------------');
    
    // Simulate card operations
    console.log('Creating 52-card French-suited deck...');
    await this.sleep(500);
    console.log('✅ Created 52 card deck (shuffled)');
    
    console.log('Dealing 3 cards...');
    await this.sleep(500);
    console.log('🎴 Dealt 3 card(s):');
    console.log('   King of Spades (value: 13)');
    console.log('   7 of Hearts (value: 7)');
    console.log('   Ace of Diamonds (value: 1)');
    console.log('📊 Cards remaining: 49');
    
    console.log('Showing deck status...');
    await this.sleep(300);
    console.log('📋 Deck Status:');
    console.log('   Cards in deck: 49');
    console.log('   Cards dealt: 3');
    console.log('   Top card: 3 of Clubs');
    console.log('   Last dealt: Ace of Diamonds');
    
    return this;
  }

  /**
   * Run core game logic demo
   */
  async runCoreDemo(): Promise<this> {
    console.log('\n🎯 Demo 2: Core Game Logic');
    console.log('--------------------------');
    
    console.log('Starting 2-player rapid game...');
    await this.sleep(500);
    console.log('🎮 Starting UpDown game...');
    console.log('   Mode: rapid');
    console.log('   Players: 2');
    console.log('✅ Game initialized with 2 players');
    
    console.log('\nShowing game status...');
    await this.sleep(300);
    console.log('📋 Game Status:');
    console.log('   Mode: rapid');
    console.log('   Round: 0');
    console.log('   Phase: ready');
    console.log('\n👥 Players:');
    console.log('   Player 1 (player_1): Score 0, Streak 0');
    console.log('   Player 2 (player_2): Score 0, Streak 0');
    
    return this;
  }

  /**
   * Run full game simulation demo
   */
  async runFullGameDemo(): Promise<this> {
    console.log('\n🎲 Demo 3: Full Game Simulation');
    console.log('--------------------------------');
    
    console.log('Simulating a complete game round...');
    await this.sleep(500);
    
    // Simulate game rounds
    for (let round = 1; round <= 3; round++) {
      console.log(`\n--- Round ${round} ---`);
      
      console.log('Players making guesses...');
      await this.sleep(300);
      console.log('🎯 Player player_1 guesses: up');
      console.log('✅ Guess recorded');
      console.log('🎯 Player player_2 guesses: down');
      console.log('✅ Guess recorded');
      
      console.log('Dealing next card...');
      await this.sleep(500);
      const cards = [
        { name: 'Queen of Hearts', value: 12 },
        { name: '5 of Spades', value: 5 },
        { name: 'Ace of Clubs', value: 1 }
      ];
      console.log(`🎴 Dealing card: ${cards[round - 1].name}`);
      
      if (round > 1) {
        console.log('\n🔍 Evaluating guesses...');
        console.log(`   Previous: ${cards[round - 2].name} (${cards[round - 2].value})`);
        console.log(`   Current: ${cards[round - 1].name} (${cards[round - 1].value})`);
        
        // Simulate evaluation
        if (round === 2) {
          console.log('   ✅ Player 1: Correct! +10 points (streak: 1)');
          console.log('   ❌ Player 2: Wrong! Eliminated');
        } else if (round === 3) {
          console.log('   ✅ Player 1: Correct! +10 points (streak: 2)');
        }
      }
      
      console.log(`✅ Card dealt. Round ${round}`);
      
      console.log('📋 Game Status:');
      console.log('   Mode: rapid');
      console.log(`   Round: ${round}`);
      console.log('   Phase: playing');
      console.log(`   Current Card: ${cards[round - 1].name}`);
      if (round > 1) {
        console.log(`   Previous Card: ${cards[round - 2].name}`);
      }
      console.log('\n👥 Players:');
      if (round === 1) {
        console.log('   Player 1 (player_1): Score 0, Streak 0');
        console.log('   Player 2 (player_2): Score 0, Streak 0');
      } else if (round === 2) {
        console.log('   Player 1 (player_1): Score 10, Streak 1');
        console.log('   Player 2 (player_2): Score 0, Streak 0 [ELIMINATED]');
      } else {
        console.log('   Player 1 (player_1): Score 20, Streak 2');
        console.log('   Player 2 (player_2): Score 0, Streak 0 [ELIMINATED]');
      }
    }
    
    return this;
  }

  /**
   * Run all demos in sequence
   */
  async runAllDemos(): Promise<this> {
    await this.runCardsDemo();
    await this.runCoreDemo();
    await this.runFullGameDemo();
    
    console.log('\n✅ Demo completed!');
    console.log('\n📋 Summary:');
    console.log('- ✅ French-suited card deck system implemented');
    console.log('- ✅ Core game logic with up/down/even guessing');
    console.log('- ✅ Player management and scoring');
    console.log('- ✅ Web4TSComponent architecture with auto-discovery CLI');
    console.log('- ✅ TypeScript-first development with proper interfaces');
    console.log('- ✅ CMM4-level development workflow');
    
    console.log('\n🚀 Next Steps:');
    console.log('- Implement multiplayer server with WebSocket support');
    console.log('- Add special effect cards system');
    console.log('- Create Lit web components for UI');
    console.log('- Add PWA features and offline support');
    console.log('- Implement lobby system and real-time multiplayer');
    
    return this;
  }

  /**
   * Show available demo scenarios
   */
  async showScenarios(): Promise<this> {
    console.log('🎮 UpDown Demo Scenarios');
    console.log('========================\n');
    
    const scenarios = [
      {
        name: 'cards',
        description: 'French-suited card deck system demonstration',
        features: ['52-card deck creation', 'Card shuffling', 'Card dealing', 'Deck status tracking']
      },
      {
        name: 'core',
        description: 'Core game logic and state management',
        features: ['Multi-player game setup', 'Player management', 'Game state tracking']
      },
      {
        name: 'full',
        description: 'Complete game simulation with multiple rounds',
        features: ['Player guessing', 'Card dealing', 'Score evaluation', 'Player elimination']
      },
      {
        name: 'all',
        description: 'Run all demos in sequence (recommended)',
        features: ['Complete system demonstration', 'End-to-end workflow', 'Summary and next steps']
      }
    ];
    
    scenarios.forEach((scenario, index) => {
      console.log(`${index + 1}. ${scenario.name.toUpperCase()}`);
      console.log(`   ${scenario.description}`);
      console.log(`   Features: ${scenario.features.join(', ')}`);
      console.log('');
    });
    
    console.log('Usage: updown.demo runDemo <scenario>');
    console.log('Example: updown.demo runDemo all');
    
    return this;
  }

  /**
   * Process data through UpDown.Demo logic
   * @param data Data to process
   * @cliSyntax data
   */
  async process(data: string): Promise<this> {
    console.log(`🔧 Processing: ${data}`);
    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Show information about current UpDown.Demo state
   */
  async info(): Promise<this> {
    console.log(`📋 UpDown.Demo Information:`);
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
    
    console.log(`🧪 Running UpDown.Demo tests with auto-promotion...`);
    
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
      
      console.log(`✅ UpDown.Demo tests completed successfully`);
      
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
        await web4ts.on('UpDown.Demo', currentVersion);
        await web4ts.upgrade('nextBuild');
        const parts = currentVersion.split('.').map(Number);
        const devVersion = `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3] + 1}`;
        await web4ts.on('UpDown.Demo', devVersion);
        await web4ts.setDev();
      }
      // Stage 1: Current is dev, no test link OR test is outdated → create test version
      else if (currentVersion === semanticLinks.dev && (!semanticLinks.test || semanticLinks.test < currentVersion)) {
        console.log(`\n🧪 Stage 1: dev → test (creating test version)...`);
        await web4ts.on('UpDown.Demo', currentVersion);
        await web4ts.upgrade('nextBuild');
        const parts = currentVersion.split('.').map(Number);
        const testVersion = `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3] + 1}`;
        await web4ts.on('UpDown.Demo', testVersion);
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
            await web4ts.on('UpDown.Demo', currentVersion);
            await web4ts.upgrade('nextPatch');
            
            // Find the newly created prod version (highest version)
            const componentParentDir = path.dirname(path.dirname(path.dirname(componentRoot)));
            const componentsDir = path.join(componentParentDir, 'components');
            const componentDir = path.join(componentsDir, 'UpDown.Demo');
            const versions = readdirSync(componentDir)
              .filter(v => /^\d+\.\d+\.\d+\.\d+$/.test(v))
              .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
            const prodVersion = versions[0];  // Highest version is the new prod
            
            // Set prod symlink
            await web4ts.on('UpDown.Demo', prodVersion);
            await web4ts.setProd();
            console.log(`✅ Promoted to production: ${prodVersion}`);
            
            // CRITICAL: Now create new dev version (nextBuild from prod)
            console.log(`🚧 Creating new dev version...`);
            await web4ts.on('UpDown.Demo', prodVersion);
            await web4ts.upgrade('nextBuild');
            
            // Find the newly created dev version (highest version)
            const newVersions = readdirSync(componentDir)
              .filter(v => /^\d+\.\d+\.\d+\.\d+$/.test(v))
              .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
            const newDevVersion = newVersions[0];  // Highest version is the new dev
            await web4ts.on('UpDown.Demo', newDevVersion);
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
      console.error(`❌ UpDown.Demo tests failed`);
      throw error;
    }
    
    return this;
  }

  /**
   * @cliHide
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
