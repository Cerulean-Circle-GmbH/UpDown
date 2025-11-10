/**
 * DefaultGameLogicEngine - GameLogicEngine Component Implementation
 * Web4 pattern: Empty constructor + scenario initialization + component functionality
 */

import { GameLogicEngine } from '../layer3/GameLogicEngine.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { GameLogicEngineModel, Card, Player, GameState } from '../layer3/GameLogicEngineModel.interface.js';
import { User } from '../layer3/User.interface.js';
import { MethodSignature } from '../layer3/MethodSignature.interface.js';
import { existsSync, lstatSync, readlinkSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

export class DefaultGameLogicEngine implements GameLogicEngine {
  // @pdca 2025-11-03-1105-component-template-bugs.pdca.md - Changed to public for Component interface compliance
  model: GameLogicEngineModel;
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
      component: 'GameLogicEngine',  // For CLI display
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
  protected getTarget(): DefaultGameLogicEngine {
    return (this.model.context as DefaultGameLogicEngine) || this;
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
    
    // Calculate projectRoot if not already set
    if (!this.model.projectRoot) {
      this.model.projectRoot = dirname(dirname(dirname(this.model.componentRoot!)));
    }
    
    // Set targetDirectory to projectRoot if not set
    if (!this.model.targetDirectory) {
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
  init(scenario?: Scenario<GameLogicEngineModel>): this {
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
  async toScenario(name?: string): Promise<Scenario<GameLogicEngineModel>> {
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
          component: 'GameLogicEngine',
          version: '0.3.19.0'
        }
      });
      ownerData = Buffer.from(fallbackJson).toString('base64');
    }

    return {
      ior: {
        uuid: this.model.uuid,
        component: 'GameLogicEngine',
        version: '0.3.19.0'
      },
      owner: ownerData,
      model: this.model
    };
  }

  /**
   * Start a new UpDown game session
   * @param playerCount Number of players (1-10)
   * @param gameMode Game mode: 'rapid' or 'multiplayer'
   * @cliSyntax playerCount gameMode
   * @cliDefault gameMode rapid
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from 0.2.0.0
   */
  async startGame(playerCount: string = '1', gameMode: string = 'rapid'): Promise<this> {
    const players = parseInt(playerCount);
    if (players < 1 || players > 10) {
      console.log(`⚠️  Player count must be between 1 and 10`);
      return this;
    }

    console.log(`🎮 Starting UpDown game...`);
    console.log(`   Mode: ${gameMode}`);
    console.log(`   Players: ${players}`);
    
    this.model.gameState = {
      phase: 'ready',
      round: 0,
      currentCard: null,
      previousCard: null,
      players: [],
      gameMode: gameMode as 'rapid' | 'multiplayer',
      deck: [],
      gameMaster: {
        hand: [],
        deck: []
      }
    };

    // Initialize players
    for (let i = 0; i < players; i++) {
      this.model.gameState.players.push({
        id: `player_${i + 1}`,
        name: `Player ${i + 1}`,
        score: 0,
        streak: 0,
        maxStreak: 0,
        isActive: true,
        hand: {
          upCard: 1,
          downCard: 1,
          evenCard: 1,
          specialCards: []
        }
      });
    }

    this.model.updatedAt = new Date().toISOString();
    console.log(`✅ Game initialized with ${players} players`);
    return this;
  }

  /**
   * Make a guess in the current game
   * @param playerId Player making the guess
   * @param guess Type of guess: 'up', 'down', or 'even'
   * @cliSyntax playerId guess
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from 0.2.0.0
   */
  async makeGuess(playerId: string, guess: string): Promise<this> {
    if (!this.model.gameState) {
      console.log(`⚠️  No active game. Start a game first.`);
      return this;
    }

    const validGuesses = ['up', 'down', 'even'];
    if (!validGuesses.includes(guess)) {
      console.log(`⚠️  Invalid guess. Must be: up, down, or even`);
      return this;
    }

    const player = this.model.gameState.players.find(p => p.id === playerId);
    if (!player) {
      console.log(`⚠️  Player ${playerId} not found`);
      return this;
    }

    if (!player.isActive) {
      console.log(`⚠️  Player ${playerId} is not active`);
      return this;
    }

    console.log(`🎯 Player ${playerId} guesses: ${guess}`);
    
    // Store the guess
    if (!this.model.gameState.currentGuesses) {
      this.model.gameState.currentGuesses = new Map();
    }
    this.model.gameState.currentGuesses.set(playerId, guess as 'up' | 'down' | 'even');
    
    this.model.updatedAt = new Date().toISOString();
    console.log(`✅ Guess recorded`);
    return this;
  }

  /**
   * Deal the next card and evaluate guesses
   * @param cardValue Optional card value for testing (1-13)
   * @cliSyntax cardValue
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from 0.2.0.0
   */
  async dealNextCard(cardValue: string = ''): Promise<this> {
    if (!this.model.gameState) {
      console.log(`⚠️  No active game. Start a game first.`);
      return this;
    }

    // Generate or use provided card value
    const value = cardValue ? parseInt(cardValue) : Math.floor(Math.random() * 13) + 1;
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const suit = suits[Math.floor(Math.random() * 4)];
    
    const newCard = {
      suit,
      value,
      displayName: this.getCardDisplayName(value, suit)
    };

    console.log(`🎴 Dealing card: ${newCard.displayName}`);

    // Move previous card
    if (this.model.gameState.currentCard) {
      this.model.gameState.previousCard = this.model.gameState.currentCard;
    }
    this.model.gameState.currentCard = newCard;
    this.model.gameState.round++;

    // Evaluate guesses
    if (this.model.gameState.previousCard && this.model.gameState.currentGuesses) {
      this.evaluateGuesses();
    }

    this.model.updatedAt = new Date().toISOString();
    console.log(`✅ Card dealt. Round ${this.model.gameState.round}`);
    return this;
  }

  /**
   * Show current game status
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from 0.2.0.0
   */
  async showGameStatus(): Promise<this> {
    if (!this.model.gameState) {
      console.log(`📋 No active game. Start a game first.`);
      return this;
    }

    console.log(`📋 Game Status:`);
    console.log(`   Mode: ${this.model.gameState.gameMode}`);
    console.log(`   Round: ${this.model.gameState.round}`);
    console.log(`   Phase: ${this.model.gameState.phase}`);
    
    if (this.model.gameState.currentCard) {
      console.log(`   Current Card: ${this.model.gameState.currentCard.displayName}`);
    }
    if (this.model.gameState.previousCard) {
      console.log(`   Previous Card: ${this.model.gameState.previousCard.displayName}`);
    }

    console.log(`\n👥 Players:`);
    this.model.gameState.players.forEach(player => {
      console.log(`   ${player.name} (${player.id}): Score ${player.score}, Streak ${player.streak}${player.isActive ? '' : ' [ELIMINATED]'}`);
    });

    return this;
  }

  /**
   * Process data through GameLogicEngine logic
   * @param data Data to process
   * @cliSyntax data
   */
  async process(data: string): Promise<this> {
    console.log(`🔧 Processing: ${data}`);
    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Show information about current GameLogicEngine state
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
   * @cliDefault scope all
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
    const { GameLogicEngineCLI } = await import('../layer5/GameLogicEngineCLI.js');
    const cli = new GameLogicEngineCLI();
    
    if (!context) {
      // No context - test completions on GameLogicEngine itself
      console.log(`🔍 Discovering ${what === 'method' ? 'methods' : 'parameter completions'} on GameLogicEngine${filter ? ` (filter: ${filter})` : ''}`);
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
   * Evaluate guesses after card is dealt
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from 0.2.0.0
   * @cliHide
   */
  private evaluateGuesses(): void {
    if (!this.model.gameState || !this.model.gameState.previousCard || !this.model.gameState.currentCard || !this.model.gameState.currentGuesses) {
      return;
    }

    const previousValue = this.model.gameState.previousCard.value;
    const currentValue = this.model.gameState.currentCard.value;
    
    console.log(`\n🔍 Evaluating guesses...`);
    console.log(`   Previous: ${this.model.gameState.previousCard.displayName} (${previousValue})`);
    console.log(`   Current: ${this.model.gameState.currentCard.displayName} (${currentValue})`);

    this.model.gameState.currentGuesses.forEach((guess, playerId) => {
      const player = this.model.gameState!.players.find(p => p.id === playerId);
      if (!player || !player.isActive) return;

      let isCorrect = false;
      if (guess === 'up' && currentValue > previousValue) {
        isCorrect = true;
      } else if (guess === 'down' && currentValue < previousValue) {
        isCorrect = true;
      } else if (guess === 'even' && currentValue === previousValue) {
        isCorrect = true;
      }

      if (isCorrect) {
        player.score += 10;
        player.streak++;
        player.maxStreak = Math.max(player.maxStreak, player.streak);
        console.log(`   ✅ ${player.name}: Correct! +10 points (streak: ${player.streak})`);
      } else {
        player.streak = 0;
        player.isActive = false;
        console.log(`   ❌ ${player.name}: Wrong! Eliminated`);
      }
    });

    // Clear guesses for next round
    this.model.gameState.currentGuesses.clear();

    // Check if game should end
    const activePlayers = this.model.gameState.players.filter(p => p.isActive);
    if (activePlayers.length <= 1) {
      this.model.gameState.phase = 'game_over';
      console.log(`\n🏁 Game Over! Winner: ${activePlayers[0]?.name || 'No one'}`);
    }
  }

  /**
   * Get display name for a card
   * @pdca 2025-11-10-UTC-1745.pdca.md - Copy & Upgrade from 0.2.0.0
   * @cliHide
   */
  private getCardDisplayName(value: number, suit: string): string {
    const rankNames = ['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
    const rank = rankNames[value] || value.toString();
    return `${rank} of ${suit}`;
  }
}
