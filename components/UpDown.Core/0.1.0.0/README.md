**← [Back to Documentation Index](../../docs/DOCUMENTATION-INDEX.md)**  

# UpDown.Core v0.1.0.0

**Component:** UpDown.Core  
**Version:** 0.1.0.0  
**Status:** ✅ Production Ready  
**Architecture:** Web4TSComponent  

## 🎮 Overview

UpDown.Core is the central game logic component for the UpDown card game. It manages game state, player actions, scoring, and round progression in a Web4TSComponent architecture.

## 🚀 Features

- **Multi-Player Support**: 1-10 players per game
- **Game Modes**: Rapid (single-player) and Multiplayer modes
- **Guessing System**: Up, Down, or Even predictions
- **Real-Time Scoring**: 10 points per correct guess
- **Streak Tracking**: Consecutive correct guesses
- **Player Elimination**: Wrong guesses eliminate players
- **Game State Management**: Complete state tracking
- **TypeScript-First**: Full type safety with comprehensive interfaces
- **Auto-Discovery CLI**: Methods automatically become CLI commands

## 🏗️ Architecture

### Web4TSComponent Compliance
- ✅ **Auto-Discovery CLI**: Methods become CLI commands automatically
- ✅ **TypeScript-First**: Full type safety and interfaces
- ✅ **Semantic Versioning**: Professional 0.1.0.0 version management
- ✅ **CMM4 Compliance**: Systematic, automated development workflow
- ✅ **Component Separation**: Clean, reusable architecture

### Component Structure
```
UpDown.Core/0.1.0.0/
├── src/ts/
│   ├── layer2/DefaultUpDown_Core.ts    # Main implementation
│   ├── layer3/UpDown_Core.interface.ts # Component interface
│   ├── layer3/UpDown_CoreModel.interface.ts # Data model
│   └── layer5/UpDown_CoreCLI.ts        # CLI implementation
├── test/updown.core.test.ts            # Test suite
├── updown.core                         # CLI executable
└── README.md                           # This file
```

## 🎮 Usage

### CLI Commands
```bash
# Start a new game with 2 players in rapid mode
./updown.core startGame 2 rapid

# Start a multiplayer game with 4 players
./updown.core startGame 4 multiplayer

# Make a guess for a player
./updown.core makeGuess player_1 up
./updown.core makeGuess player_2 down
./updown.core makeGuess player_3 even

# Deal the next card and evaluate guesses
./updown.core dealNextCard

# Deal a specific card for testing
./updown.core dealNextCard 7

# Show current game status
./updown.core showGameStatus

# Show help
./updown.core
```

### Programmatic Usage
```typescript
import { DefaultUpDown_Core } from './src/ts/layer2/DefaultUpDown_Core.js';

const game = new DefaultUpDown_Core();

// Initialize with scenario
await game.init({
  ior: { uuid: '...', component: 'UpDown.Core', version: '0.1.0.0' },
  owner: '...',
  model: { /* model data */ }
});

// Start a new game
await game.startGame('2', 'rapid');

// Make guesses
await game.makeGuess('player_1', 'up');
await game.makeGuess('player_2', 'down');

// Deal next card
await game.dealNextCard();

// Show game status
await game.showGameStatus();
```

## 🔧 API Reference

### Methods

#### `startGame(playerCount?: string, gameMode?: string): Promise<this>`
Initializes a new UpDown game session.
- **Parameters:**
  - `playerCount` (optional): Number of players (1-10, default: '1')
  - `gameMode` (optional): 'rapid' or 'multiplayer' (default: 'rapid')
- **Returns:** Promise<this> for method chaining

#### `makeGuess(playerId: string, guess: string): Promise<this>`
Records a player's guess for the next card.
- **Parameters:**
  - `playerId`: Player identifier
  - `guess`: 'up', 'down', or 'even'
- **Returns:** Promise<this> for method chaining

#### `dealNextCard(cardValue?: string): Promise<this>`
Deals the next card and evaluates all active players' guesses.
- **Parameters:**
  - `cardValue` (optional): Specific card value for testing (1-13)
- **Returns:** Promise<this> for method chaining

#### `showGameStatus(): Promise<this>`
Displays current game state and player statistics.
- **Returns:** Promise<this> for method chaining

### Data Models

#### Card Interface
```typescript
interface Card {
  suit: string;        // 'Hearts', 'Diamonds', 'Clubs', 'Spades'
  value: number;       // 1-13 (Ace=1, King=13)
  displayName: string; // Human-readable name
}
```

#### Player Interface
```typescript
interface Player {
  id: string;          // Player identifier
  name: string;        // Player display name
  score: number;       // Current score
  streak: number;      // Current streak
  maxStreak: number;   // Maximum streak achieved
  isActive: boolean;   // Whether player is still in game
  hand: {
    upCard: number;    // Up card count
    downCard: number;  // Down card count
    evenCard: number;  // Even card count
    specialCards: any[]; // Special cards (future feature)
  };
}
```

#### GameState Interface
```typescript
interface GameState {
  phase: 'ready' | 'playing' | 'game_over';
  round: number;
  currentCard: Card | null;
  previousCard: Card | null;
  players: Player[];
  gameMode: 'rapid' | 'multiplayer';
  deck: Card[];
  gameMaster: {
    hand: Card[];
    deck: Card[];
  };
  currentGuesses?: Map<string, 'up' | 'down' | 'even'>;
}
```

## 🎯 Game Mechanics

### Core Gameplay
1. **Setup**: Players join game (1-10 players)
2. **Guessing**: Players guess if next card will be higher, lower, or equal
3. **Card Dealing**: Next card is dealt
4. **Evaluation**: Guesses are evaluated against previous card
5. **Scoring**: Correct guesses earn 10 points and increase streak
6. **Elimination**: Wrong guesses eliminate players
7. **Victory**: Last player standing wins

### Scoring System
- **Correct Guess**: +10 points, +1 streak
- **Wrong Guess**: 0 points, streak reset, player eliminated
- **Streak Bonus**: Tracked for statistics
- **Victory**: Last active player wins

### Game Modes
- **Rapid Mode**: Single-player, unlimited deck, high score focus
- **Multiplayer Mode**: Up to 10 players, limited deck, elimination-based

## 🧪 Testing

### Running Tests
```bash
# Run all tests
./updown.core test

# Run specific test
npm test updown.core.test.ts
```

### Test Coverage
- ✅ Game initialization and setup
- ✅ Player management and scoring
- ✅ Guess evaluation logic
- ✅ Card dealing and state updates
- ✅ Player elimination
- ✅ Game state transitions
- ✅ Error handling and validation
- ✅ CLI command execution

## 📊 Quality Metrics

### CMM4 Compliance
- ✅ **Systematic Process**: Web4TSComponent enforces structured development
- ✅ **Automated Workflow**: Build, test, and promotion automation
- ✅ **Quantitative Management**: Version tracking and metrics
- ✅ **Continuous Improvement**: PDCA cycle integration

### Code Quality
- ✅ **TypeScript-First**: Full type safety
- ✅ **Interface-Driven**: Clean separation of concerns
- ✅ **Error Handling**: Comprehensive validation
- ✅ **Documentation**: TSDoc annotations
- ✅ **Testing**: Integrated test framework

## 🔄 Version History

### v0.1.0.0 (Current)
- Initial implementation
- Multi-player game support (1-10 players)
- Up/Down/Even guessing system
- Real-time scoring and streak tracking
- Player elimination system
- Game state management
- Auto-discovery CLI
- TypeScript interfaces
- Comprehensive testing

## 🚀 Future Enhancements

### Planned Features
- **Special Cards**: Special effect cards system
- **Tournament Mode**: Multi-round tournament support
- **Statistics**: Advanced player statistics
- **Replay System**: Game replay functionality
- **AI Players**: Computer-controlled players
- **Custom Rules**: Configurable game rules

## 📚 Related Documentation

- **Main Documentation**: [../../docs/DOCUMENTATION-INDEX.md](../../docs/DOCUMENTATION-INDEX.md)
- **Implementation Details**: [../../docs/UPDOWN-WEB4-IMPLEMENTATION.md](../../docs/UPDOWN-WEB4-IMPLEMENTATION.md)
- **Card System**: [../UpDown.Cards/0.1.0.0/README.md](../UpDown.Cards/0.1.0.0/README.md)
- **Demo System**: [../UpDown.Demo/0.1.0.0/README.md](../UpDown.Demo/0.1.0.0/README.md)
- **Web4TSComponent Framework**: [../Web4TSComponent/0.3.13.1/README.md](../Web4TSComponent/0.3.13.1/README.md)

## 🚀 Quick Navigation

- **[← Back to Documentation Index](../../docs/DOCUMENTATION-INDEX.md)**
- **[↑ Back to Project Root](../../../README.md)**
- **[Previous Component: UpDown.Cards](../UpDown.Cards/0.1.0.0/README.md)**
- **[Next Component: UpDown.Demo](../UpDown.Demo/0.1.0.0/README.md)**

## 🎯 Integration

### With UpDown.Cards
```typescript
// UpDown.Core can integrate with UpDown.Cards for card management
import { DefaultUpDown_Cards } from '../UpDown.Cards/0.1.0.0/src/ts/layer2/DefaultUpDown_Cards.js';

const cards = new DefaultUpDown_Cards();
await cards.createDeck();
// Use cards in game logic
```

### With UpDown.Demo
```typescript
// UpDown.Demo can showcase UpDown.Core functionality
import { DefaultUpDown_Core } from '../UpDown.Core/0.1.0.0/src/ts/layer2/DefaultUpDown_Core.js';
```

### With UpDown.Server (Future)
```typescript
// UpDown.Server will use UpDown.Core for game logic
import { DefaultUpDown_Core } from '../UpDown.Core/0.1.0.0/src/ts/layer2/DefaultUpDown_Core.js';
```

## 🏆 Achievement Summary

UpDown.Core v0.1.0.0 represents a complete, production-ready game logic system that:

- ✅ **Follows Web4 Principles**: Complete Web4TSComponent compliance
- ✅ **Provides Type Safety**: Full TypeScript implementation
- ✅ **Offers Professional CLI**: Auto-discovery command system
- ✅ **Implements Game Logic**: Complete card game mechanics
- ✅ **Maintains Quality**: CMM4-level development practices
- ✅ **Enables Integration**: Clean component architecture

This component provides the core game logic for the UpDown card game, ready for integration with other game components and future multiplayer functionality.

---

**Component:** UpDown.Core v0.1.0.0  
**Status:** Production Ready  
**Next Version:** Will be created when new features are needed  
**Documentation:** Part of UpDown game system documentation
