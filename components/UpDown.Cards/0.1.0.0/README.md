**← [Back to Documentation Index](../../docs/DOCUMENTATION-INDEX.md)**  

# UpDown.Cards v0.1.0.0

**Component:** UpDown.Cards  
**Version:** 0.1.0.0  
**Status:** ✅ Production Ready  
**Architecture:** Web4TSComponent  

## 🃏 Overview

UpDown.Cards is a Web4TSComponent that provides a complete French-suited card deck system for the UpDown card game. It implements a 52-card deck with shuffling, dealing, and deck management capabilities.

## 🚀 Features

- **52-Card French Deck**: Complete Ace through King in all suits
- **Fisher-Yates Shuffle**: Cryptographically secure shuffling algorithm
- **Card Dealing**: Deal single or multiple cards with validation
- **Deck Management**: Track remaining cards and dealt cards
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
UpDown.Cards/0.1.0.0/
├── src/ts/
│   ├── layer2/DefaultUpDown_Cards.ts    # Main implementation
│   ├── layer3/UpDown_Cards.interface.ts # Component interface
│   ├── layer3/UpDown_CardsModel.interface.ts # Data model
│   └── layer5/UpDown_CardsCLI.ts        # CLI implementation
├── test/updown.cards.test.ts            # Test suite
├── updown.cards                         # CLI executable
└── README.md                            # This file
```

## 🎮 Usage

### CLI Commands
```bash
# Create and shuffle a 52-card deck
./updown.cards createDeck

# Create deck without shuffling
./updown.cards createDeck false

# Shuffle the current deck
./updown.cards shuffleDeck

# Deal 3 cards from the deck
./updown.cards dealCard 3

# Show current deck status
./updown.cards showDeck

# Show help
./updown.cards
```

### Programmatic Usage
```typescript
import { DefaultUpDown_Cards } from './src/ts/layer2/DefaultUpDown_Cards.js';

const cards = new DefaultUpDown_Cards();

// Initialize with scenario
await cards.init({
  ior: { uuid: '...', component: 'UpDown.Cards', version: '0.1.0.0' },
  owner: '...',
  model: { /* model data */ }
});

// Create deck
await cards.createDeck('true');

// Deal cards
await cards.dealCard('3');

// Show deck status
await cards.showDeck();
```

## 🔧 API Reference

### Methods

#### `createDeck(shuffle?: string): Promise<this>`
Creates a new 52-card French-suited deck.
- **Parameters:**
  - `shuffle` (optional): Whether to shuffle the deck ('true' or 'false', default: 'true')
- **Returns:** Promise<this> for method chaining

#### `shuffleDeck(): Promise<this>`
Shuffles the current deck using Fisher-Yates algorithm.
- **Returns:** Promise<this> for method chaining

#### `dealCard(count?: string): Promise<this>`
Deals cards from the deck.
- **Parameters:**
  - `count` (optional): Number of cards to deal (default: '1')
- **Returns:** Promise<this> for method chaining

#### `showDeck(): Promise<this>`
Displays current deck status.
- **Returns:** Promise<this> for method chaining

### Data Models

#### Card Interface
```typescript
interface Card {
  suit: string;        // 'Hearts', 'Diamonds', 'Clubs', 'Spades'
  rank: string;        // 'Ace', '2', '3', ..., 'King'
  value: number;       // 1-13 (Ace=1, King=13)
  id: string;          // Unique identifier
  displayName: string; // Human-readable name
}
```

#### UpDown_CardsModel Interface
```typescript
interface UpDown_CardsModel extends Model {
  uuid: string;
  name: string;
  origin: string;
  definition: string;
  createdAt: string;
  updatedAt: string;
  deck?: Card[];        // Current deck
  dealtCards?: Card[];  // Cards that have been dealt
}
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
./updown.cards test

# Run specific test
npm test updown.cards.test.ts
```

### Test Coverage
- ✅ Deck creation and initialization
- ✅ Card shuffling algorithm
- ✅ Card dealing with validation
- ✅ Deck status tracking
- ✅ Error handling and edge cases
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
- 52-card French-suited deck
- Fisher-Yates shuffle algorithm
- Card dealing system
- Deck management
- Auto-discovery CLI
- TypeScript interfaces
- Comprehensive testing

## 🚀 Future Enhancements

### Planned Features
- **Multiple Decks**: Support for multiple deck instances
- **Custom Decks**: Create decks with custom card sets
- **Deck Persistence**: Save and load deck states
- **Advanced Shuffling**: Different shuffle algorithms
- **Card Validation**: Enhanced card validation rules

## 📚 Related Documentation

- **Main Documentation**: [../../docs/DOCUMENTATION-INDEX.md](../../docs/DOCUMENTATION-INDEX.md)
- **Implementation Details**: [../../docs/UPDOWN-WEB4-IMPLEMENTATION.md](../../docs/UPDOWN-WEB4-IMPLEMENTATION.md)
- **Web4TSComponent Framework**: [../Web4TSComponent/0.3.13.1/README.md](../Web4TSComponent/0.3.13.1/README.md)

## 🚀 Quick Navigation

- **[← Back to Documentation Index](../../docs/DOCUMENTATION-INDEX.md)**
- **[↑ Back to Project Root](../../../README.md)**
- **[Next Component: UpDown.Core](../UpDown.Core/0.1.0.0/README.md)**
- **[Demo Component: UpDown.Demo](../UpDown.Demo/0.1.0.0/README.md)**

## 🎯 Integration

### With UpDown.Core
```typescript
// UpDown.Core can use UpDown.Cards for game logic
import { DefaultUpDown_Cards } from '../UpDown.Cards/0.1.0.0/src/ts/layer2/DefaultUpDown_Cards.js';

const cards = new DefaultUpDown_Cards();
await cards.createDeck();
// Use cards in game logic
```

### With UpDown.Demo
```typescript
// UpDown.Demo can showcase UpDown.Cards functionality
import { DefaultUpDown_Cards } from '../UpDown.Cards/0.1.0.0/src/ts/layer2/DefaultUpDown_Cards.js';
```

## 🏆 Achievement Summary

UpDown.Cards v0.1.0.0 represents a complete, production-ready card deck system that:

- ✅ **Follows Web4 Principles**: Complete Web4TSComponent compliance
- ✅ **Provides Type Safety**: Full TypeScript implementation
- ✅ **Offers Professional CLI**: Auto-discovery command system
- ✅ **Implements Game Logic**: Complete card deck functionality
- ✅ **Maintains Quality**: CMM4-level development practices
- ✅ **Enables Integration**: Clean component architecture

This component provides the foundation for the UpDown card game's card system, ready for integration with other game components.

---

**Component:** UpDown.Cards v0.1.0.0  
**Status:** Production Ready  
**Next Version:** Will be created when new features are needed  
**Documentation:** Part of UpDown game system documentation
