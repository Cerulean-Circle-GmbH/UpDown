/**
 * DefaultGameDemoSystem - GameDemoSystem Component Implementation
 * Web4 pattern: Empty constructor + scenario initialization + component functionality
 */

import { GameDemoSystem } from '../layer3/GameDemoSystem.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { GameDemoSystemModel, DemoScenario } from '../layer3/GameDemoSystemModel.interface.js';
import { User } from '../layer3/User.interface.js';
import { MethodSignature } from '../layer3/MethodSignature.interface.js';
import { existsSync, lstatSync, readlinkSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

export class DefaultGameDemoSystem implements GameDemoSystem {
  // @pdca 2025-11-03-1105-component-template-bugs.pdca.md - Changed to public for Component interface compliance
  model: GameDemoSystemModel;
  private web4ts?: any; // Lazy-initialized Web4TSComponent for delegation (dynamic import, no static dependency)
  private user?: User; // Optional User service (lazy initialization) - @pdca 2025-11-03-1135.pdca.md
  private methods: Map<string, MethodSignature> = new Map(); // @pdca 2025-11-05-UTC-2301 - Match Web4TSComponent type

  constructor() {
    // Empty constructor - Web4 pattern
    // @pdca 2025-11-03-1105-component-template-bugs.pdca.md - Initialize with component name for CLI display
    this.model = {
      uuid: crypto.randomUUID(),
      name: '',
      origin: '',
      definition: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      component: 'GameDemoSystem',  // For CLI display
      version: '0.3.19.0'             // Component version
    };
  }

  /**
   * Check if method exists (Component interface)
   * @pdca 2025-11-05-UTC-2301.dry-shell-libraries.pdca.md - Method discovery for tab completion
   * @cliHide
   */
  hasMethod(name: string): boolean {
    return this.methods.has(name);
  }
  
  /**
   * Get method signature (Component interface)
   * @pdca 2025-11-05-UTC-2301.dry-shell-libraries.pdca.md - Method discovery for tab completion
   * @cliHide
   */
  getMethodSignature(name: string): MethodSignature | null {
    return this.methods.get(name) || null;
  }
  
  /**
   * List all method names (Component interface)
   * @pdca 2025-11-05-UTC-2301.dry-shell-libraries.pdca.md - Method discovery for tab completion
   * @cliHide
   */
  listMethods(): string[] {
    return Array.from(this.methods.keys());
  }

  /**
   * Discover public methods for CLI completion
   * @pdca 2025-11-05-UTC-2301.dry-shell-libraries.pdca.md - Method discovery for tab completion
   * @cliHide
   */
  private discoverMethods(): void {
    const prototype = Object.getPrototypeOf(this);
    const methodNames = Object.getOwnPropertyNames(prototype)
      .filter((name) => typeof prototype[name] === "function")
      .filter((name) => !name.startsWith("_") && name !== "constructor")
      .filter((name) => !["init", "toScenario", "hasMethod", "getMethodSignature", "listMethods", "discoverMethods"].includes(name));

    for (const methodName of methodNames) {
      const method = prototype[methodName];
      this.methods.set(methodName, {
        name: methodName,
        paramCount: method.length,
        isAsync: method.constructor.name === "AsyncFunction",
      });
    }
  }

  /**
   * Lazy initialization of User service for owner data generation
   * NOT a build dependency - warns if unavailable, continues with fallback
   * @pdca 2025-11-03-1135.pdca.md - User service integration pattern
   * @cliHide
   */
  private async getUser(): Promise<User> {
    if (this.user) return this.user;
    
    try {
      // Dynamic ESM import - fails gracefully if User not available
      // @ts-ignore - Optional dependency, path resolved at runtime
      const userModule = await import('../../User/latest/dist/ts/layer2/DefaultUser.js');
      const { DefaultUser } = userModule;
      
      // Initialize User with empty constructor (uses system/localhost defaults)
      this.user = new DefaultUser();
      
      return this.user!; // Non-null assertion: we just assigned it
    } catch (error) {
      // User service not available - throw for caller to handle fallback
      throw new Error('User service not available');
    }
  }

  /**
   * Lazy initialization of Web4TSComponent for delegation (DRY principle)
   * Dynamic imports resolve paths at runtime, enabling location-independent operation
   * @cliHide
   */
  private async getWeb4TSComponent(): Promise<any> {
    if (this.web4ts) return this.web4ts;

    const path = await import('path');
    const url = new URL(import.meta.url);
    const __filename = url.pathname;
    const componentRoot = path.resolve(path.dirname(__filename), '../../..');

    // @pdca 2025-11-10-UTC-1230.test-isolation-path-pollution-analysis.pdca.md
    // Web4 Principle: Detect project root correctly for test isolation
    // Component path: .../test/data/components/ComponentName/0.1.0.0
    // OR: .../components/ComponentName/0.1.0.0
    // Project root is 2 levels up from component directory
    // (ComponentName/ and components/)
    const componentsDir = path.dirname(path.dirname(componentRoot)); // Go up 2: version → component → components
    const projectRoot = path.dirname(componentsDir); // Go up 1 more: components → project root
    
    // @pdca 2025-11-10-UTC-1230.test-isolation-path-pollution-analysis.pdca.md
    // Web4 Principle: Detect test isolation from model paths, NOT environment variables
    // Test isolation: projectRoot contains '/test/data'
    const isTestIsolation = projectRoot.includes('/test/data');
    
    // @pdca 2025-11-10-UTC-1010.pdca.md - Set THIS component's paths for delegation
    // When Web4TSComponent reads context, it needs to know THIS component's paths
    this.model.componentRoot = componentRoot;
    this.model.projectRoot = projectRoot;
    this.model.targetDirectory = projectRoot;
    this.model.targetComponentRoot = componentRoot;
    this.model.isTestIsolation = isTestIsolation;

    // Import Web4TSComponent and SemanticVersion dynamically
    const web4tscomponentModule = await import(
      `${projectRoot}/components/Web4TSComponent/latest/dist/ts/layer2/DefaultWeb4TSComponent.js`
    );
    const semanticVersionModule = await import(
      `${projectRoot}/components/Web4TSComponent/latest/dist/ts/layer2/SemanticVersion.js`
    );
    const { DefaultWeb4TSComponent } = web4tscomponentModule;
    const { SemanticVersion } = semanticVersionModule;

    // ✅ CRITICAL: Initialize Web4TSComponent for delegation
    // @pdca 2025-11-03-UTC-1237.pdca.md - Full delegation initialization
    // @pdca 2025-11-04-UTC-1630.pdca.md - Added projectRoot for version display fix
    // @pdca 2025-11-10-UTC-1010.pdca.md - DO NOT override component identity!
    // Web4TSComponent must retain its own identity ('Web4TSComponent')
    // The delegating component's identity will be set via context in delegateToWeb4TS()
    this.web4ts = new DefaultWeb4TSComponent().init({
      model: {
        // DO NOT set 'component' here - let Web4TSComponent keep its own identity
        version: await SemanticVersion.fromString(this.model.version || '0.0.0.0'), // THIS component's version
        componentRoot: componentRoot,              // THIS component's root directory
        projectRoot: projectRoot,                  // Project root for Path Authority (version display needs this)
        targetDirectory: projectRoot               // Project root for path authority
      }
    });

    return this.web4ts;
  }

  /**
   * DRY helper for delegating methods to Web4TSComponent with correct context
   * Sets context ONCE so Web4TSComponent operates on THIS component's data
   * @pdca 2025-11-03-UTC-1200.pdca.md - DRY OOP pattern for context delegation
   * @pdca 2025-11-10-UTC-1400.eliminate-functional-helpers-make-model-driven.pdca.md - Set display properties (Radical OOP)
   * @cliHide
   */
  private async delegateToWeb4TS<T extends (...args: any[]) => any>(
    method: string,
    ...args: Parameters<T>
  ): Promise<this> {
    const web4ts = await this.getWeb4TSComponent();
    web4ts.model.context = this;  // ← Set context ONCE in ONE place
    
    // ✅ RADICAL OOP: Set display properties in Web4TSComponent's model (NO functional calculation!)
    // @pdca 2025-11-10-UTC-1400.eliminate-functional-helpers-make-model-driven.pdca.md
    // Web4TSComponent will just READ these properties (model-driven display)
    web4ts.model.displayName = this.model.component;  // Show THIS component's name
    web4ts.model.displayVersion = this.model.version || '0.0.0.0';  // Show THIS component's version
    web4ts.model.isDelegation = true;  // We ARE delegating
    web4ts.model.delegationInfo = `via Web4TSComponent v${web4ts.model.version.toString()}`;  // Show infrastructure
    
    // Test isolation context (if applicable)
    if (this.model.isTestIsolation && this.model.projectRoot) {
      const match = this.model.projectRoot.match(/components\/([^/]+)\/([^/]+)\/test\/data/);
      if (match) {
        web4ts.model.testIsolationContext = `${match[1]} v${match[2]}`;
      } else {
        web4ts.model.testIsolationContext = 'test/data environment';
      }
    }
    
    await (web4ts as any)[method](...args);
    return this;
  }

  /**
   * 🎯 TRUE Radical OOP (0.3.19.0) - DRY Excellence
   * Returns the target component instance for operations (this OR context)
   * Eliminates repeated `this.model.context || this` everywhere!
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from Web4TSComponent/0.3.19.0
   * @cliHide
   */
  protected getTarget(): DefaultGameDemoSystem {
    return (this.model.context as DefaultGameDemoSystem) || this;
  }

  /**
   * 🎯 TRUE Radical OOP (0.3.19.0) - Calculate & Store ONCE
   * Calculates all model paths and display properties ONCE at init
   * Methods just READ from model - NO recalculation!
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from Web4TSComponent/0.3.19.0
   * @cliHide
   */
  private updateModelPaths(): void {
    // If context exists, inherit component/version from context
    if (this.model.context) {
      this.model.component = this.model.context.model.component;
      this.model.version = this.model.context.model.version;
    }
    
    // Calculate projectRoot if not already set AND componentRoot is available
    if (!this.model.projectRoot && this.model.componentRoot) {
      this.model.projectRoot = dirname(dirname(dirname(this.model.componentRoot)));
    }
    
    // Set targetDirectory to projectRoot if not set
    if (!this.model.targetDirectory && this.model.projectRoot) {
      this.model.targetDirectory = this.model.projectRoot;
    }
    
    // Set display properties (component name/version to show)
    if (!this.model.displayName) {
      this.model.displayName = this.model.component;
      this.model.displayVersion = this.model.version?.toString();
    }
  }

  /**
   * @cliHide
   * @pdca 2025-11-05-UTC-2301.dry-shell-libraries.pdca.md - Added method discovery
   * @pdca 2025-11-10-UTC-1745.pdca.md - Call updateModelPaths() for TRUE Radical OOP
   */
  init(scenario?: Scenario<GameDemoSystemModel>): this {
    if (scenario?.model) {
      this.model = { ...this.model, ...scenario.model };
    }
    
    // Discover methods for CLI completion
    this.discoverMethods();
    
    // 🎯 TRUE Radical OOP: Calculate & store all paths ONCE
    // @pdca 2025-11-10-UTC-1745.pdca.md
    this.updateModelPaths();
    
    return this;
  }

  /**
   * @cliHide
   * @pdca 2025-11-03-1135.pdca.md - Use User service with fallback pattern
   */
  async toScenario(name?: string): Promise<Scenario<GameDemoSystemModel>> {
    // ✅ RADICAL OOP: Generate owner data using User.toScenario() (Web4 component interface)
    let ownerData: string;
    try {
      // Try to use User service if available (NOT a build dependency)
      const user = await this.getUser();
      
      // ✅ Use User component's toScenario() - universal Web4 interface
      const userScenario = await user.toScenario();
      
      // ✅ Owner data IS the entire User scenario serialized
      const ownerJson = JSON.stringify(userScenario);
      
      ownerData = Buffer.from(ownerJson).toString('base64');
    } catch (error) {
      // ✅ Fallback: Generate minimal User-like scenario without User service
      const fallbackJson = JSON.stringify({
        ior: {
          uuid: this.model.uuid,
          component: 'User',
          version: '0.0.0.0',
          timestamp: new Date().toISOString()
        },
        owner: '',  // No nested owner in fallback
        model: {
          user: process.env.USER || 'system',
          hostname: process.env.HOSTNAME || 'localhost',
          uuid: this.model.uuid,
          component: 'GameDemoSystem',
          version: '0.3.19.0'
        }
      });
      ownerData = Buffer.from(fallbackJson).toString('base64');
    }

    return {
      ior: {
        uuid: this.model.uuid,
        component: 'GameDemoSystem',
        version: '0.3.19.0'
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
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from 0.2.0.0
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
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from 0.2.0.0
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
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from 0.2.0.0
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
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from 0.2.0.0
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
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from 0.2.0.0
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
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from 0.2.0.0
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
   * Process data through GameDemoSystem logic
   * @param data Data to process
   * @cliSyntax data
   */
  async process(data: string): Promise<this> {
    console.log(`🔧 Processing: ${data}`);
    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Show information about current GameDemoSystem state
   * Delegates to Web4TSComponent for DRY architecture and consistent model display
   * @param topic Optional topic to show (e.g., 'standard', 'guidelines', 'model')
   * @cliSyntax topic
   * @cliDefault topic model
   */
  async info(topic: string = 'model'): Promise<this> {
    return this.delegateToWeb4TS('info', topic);
  }

  /**
   * Run component tests with hierarchical selection or full suite with auto-promotion
   * 
   * DRY PRINCIPLE: Delegates ALL testing to Web4TSComponent to avoid code duplication.
   * Web4TSComponent handles:
   * - Hierarchical testing (file/describe/itCase)
   * - Full suite execution with vitest
   * - Auto-promotion workflow (dev → test → prod)
   * - Test result verification
   * - Recursion detection
   * 
   * Context delegation ensures Web4TSComponent operates on THIS component's data.
   * 
   * @param scope Test scope: 'all' (full suite with promotion) or 'file'/'describe'/'itCase' (selective, no promotion)
   * @param references Test references for selective testing (e.g., file number, describe reference, itCase token)
   * @cliSyntax scope references
   * @TODO cliDefault scope all
   * @cliValues file describe itCase
   * @cliExample {{COMPONENT_LOWER}} test
   * @cliExample {{COMPONENT_LOWER}} test file
   * @cliExample {{COMPONENT_LOWER}} test file 1
   * @cliExample {{COMPONENT_LOWER}} test describe 3b
   * @cliExample {{COMPONENT_LOWER}} test itCase 1a1
   * @pdca 2025-11-03-UTC-1200.pdca.md - Replaced 178-line implementation with 1-line delegation
   * @pdca 2025-11-06-UTC-0150.delegated-parameter-completion-broken.pdca.md - Added @cliValues for parameter completion
   */
  async test(scope: string = 'all', ...references: string[]): Promise<this> {
    return this.delegateToWeb4TS('test', scope, ...references);
  }

  /**
   * Build component (TypeScript compilation)
   * Delegates to Web4TSComponent for DRY architecture
   * @cliHide
   */
  async build(): Promise<this> {
    return this.delegateToWeb4TS('build');
  }

  /**
   * Clean component build artifacts
   * Delegates to Web4TSComponent for DRY architecture
   * @cliHide
   */
  async clean(): Promise<this> {
    return this.delegateToWeb4TS('clean');
  }

  /**
   * Show component directory tree structure
   * Delegates to Web4TSComponent for DRY architecture
   * @param depth Maximum depth to show (default: 4)
   * @param showHidden Whether to show hidden files (default: false)
   * @cliHide
   */
  async tree(depth: string = '4', showHidden: string = 'false'): Promise<this> {
    return this.delegateToWeb4TS('tree', depth, showHidden);
  }

  /**
   * Show semantic version links (dev, test, prod, latest)
   * Delegates to Web4TSComponent for DRY architecture
   * @param action Optional action (e.g., 'repair' to fix broken links)
   * @cliHide
   */
  async links(action: string = ''): Promise<this> {
    return this.delegateToWeb4TS('links', action);
  }

  /**
   * Test and discover tab completions for debugging and development
   * @param what Type of completion to test: "method" or "parameter"
   * @param filter Optional prefix to filter results (e.g., "v" shows only validate*, verify*, etc.)
   * @cliSyntax what filter
   * @cliDefault filter ""
   */
  async completion(what: string, filter?: string): Promise<this> {
    const context = this.getComponentContext();
    
    // OOP: Instantiate own CLI and call completeParameter directly (no shell!)
    const { GameDemoSystemCLI } = await import('../layer5/GameDemoSystemCLI.js');
    const cli = new GameDemoSystemCLI();
    
    if (!context) {
      // No context - test completions on GameDemoSystem itself
      console.log(`🔍 Discovering ${what === 'method' ? 'methods' : 'parameter completions'} on GameDemoSystem${filter ? ` (filter: ${filter})` : ''}`);
      console.log(`---`);
      
      // Call completeParameter directly via OOP (completeParameter is on DefaultCLI)
      await cli.completeParameter('completionNameParameterCompletion', 'completion', what, filter || '');
    } else {
      // Context loaded - delegate to web4tscomponent for target component discovery
      const web4ts = await this.getWeb4TSComponent();
      await web4ts.completion(what, filter);
    }
    
    return this;
  }

  /**
   * @cliHide
   */
  protected getComponentContext(): { component: string; version: string; path: string } | null {
    const context = this.model as any;
    if (context.contextComponent && context.contextVersion && context.contextPath) {
      return {
        component: context.contextComponent,
        version: context.contextVersion,
        path: context.contextPath
      };
    }
    return null;
  }

  /**
   * Sleep utility for demo delays
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from 0.2.0.0
   * @cliHide
   */
  private sleep(ms: number): Promise<void> {
    // Skip delays in test mode for fast execution
    if (this.model.testMode) {
      return Promise.resolve();
    }
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
