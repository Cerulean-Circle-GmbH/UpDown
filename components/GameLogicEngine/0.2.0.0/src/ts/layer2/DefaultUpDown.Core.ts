/**
 * DefaultUpDown.Core - UpDown.Core Component Implementation
 * Web4 pattern: Empty constructor + scenario initialization + component functionality
 */

import { GameLogicEngine } from '../layer3/GameLogicEngine.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { GameLogicEngineModel } from '../layer3/GameLogicEngineModel.interface.js';

export class DefaultGameLogicEngine implements GameLogicEngine {
  private model: GameLogicEngineModel;

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
  init(scenario: Scenario<GameLogicEngineModel>): this {
    if (scenario.model) {
      this.model = { ...this.model, ...scenario.model };
    }
    return this;
  }

  /**
   * @cliHide
   */
  async toScenario(name?: string): Promise<Scenario<GameLogicEngineModel>> {
    const ownerData = JSON.stringify({
      user: process.env.USER || 'system',
      hostname: process.env.HOSTNAME || 'localhost',
      uuid: this.model.uuid,
      timestamp: new Date().toISOString(),
      component: 'GameLogicEngine',
      version: '0.1.0.0'
    });

    return {
      ior: {
        uuid: this.model.uuid,
        component: 'GameLogicEngine',
        version: '0.1.0.0'
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
   * Process data through UpDown.Core logic
   * @param data Data to process
   * @cliSyntax data
   */
  async process(data: string): Promise<this> {
    console.log(`🔧 Processing: ${data}`);
    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Show information about current UpDown.Core state
   */
  async info(): Promise<this> {
    console.log(`📋 UpDown.Core Information:`);
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
    
    console.log(`🧪 Running UpDown.Core tests with auto-promotion...`);
    
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
      
      console.log(`✅ UpDown.Core tests completed successfully`);
      
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
        await web4ts.on('UpDown.Core', currentVersion);
        await web4ts.upgrade('nextBuild');
        const parts = currentVersion.split('.').map(Number);
        const devVersion = `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3] + 1}`;
        await web4ts.on('UpDown.Core', devVersion);
        await web4ts.setDev();
      }
      // Stage 1: Current is dev, no test link OR test is outdated → create test version
      else if (currentVersion === semanticLinks.dev && (!semanticLinks.test || semanticLinks.test < currentVersion)) {
        console.log(`\n🧪 Stage 1: dev → test (creating test version)...`);
        await web4ts.on('UpDown.Core', currentVersion);
        await web4ts.upgrade('nextBuild');
        const parts = currentVersion.split('.').map(Number);
        const testVersion = `${parts[0]}.${parts[1]}.${parts[2]}.${parts[3] + 1}`;
        await web4ts.on('UpDown.Core', testVersion);
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
            await web4ts.on('UpDown.Core', currentVersion);
            await web4ts.upgrade('nextPatch');
            
            // Find the newly created prod version (highest version)
            const componentParentDir = path.dirname(path.dirname(path.dirname(componentRoot)));
            const componentsDir = path.join(componentParentDir, 'components');
            const componentDir = path.join(componentsDir, 'UpDown.Core');
            const versions = readdirSync(componentDir)
              .filter(v => /^\d+\.\d+\.\d+\.\d+$/.test(v))
              .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
            const prodVersion = versions[0];  // Highest version is the new prod
            
            // Set prod symlink
            await web4ts.on('UpDown.Core', prodVersion);
            await web4ts.setProd();
            console.log(`✅ Promoted to production: ${prodVersion}`);
            
            // CRITICAL: Now create new dev version (nextBuild from prod)
            console.log(`🚧 Creating new dev version...`);
            await web4ts.on('UpDown.Core', prodVersion);
            await web4ts.upgrade('nextBuild');
            
            // Find the newly created dev version (highest version)
            const newVersions = readdirSync(componentDir)
              .filter(v => /^\d+\.\d+\.\d+\.\d+$/.test(v))
              .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
            const newDevVersion = newVersions[0];  // Highest version is the new dev
            await web4ts.on('UpDown.Core', newDevVersion);
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
      console.error(`❌ UpDown.Core tests failed`);
      throw error;
    }
    
    return this;
  }

  /**
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
   * @cliHide
   */
  private getCardDisplayName(value: number, suit: string): string {
    const rankNames = ['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
    const rank = rankNames[value] || value.toString();
    return `${rank} of ${suit}`;
  }
}
