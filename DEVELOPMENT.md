# UpDown Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run server in development mode
npm run dev
```

## Project Structure

```
src/
├── server/          # Backend server code
│   └── index.ts     # Main server entry point
├── client/          # Frontend client code
│   └── index.ts     # Client entry point (stub)
└── shared/          # Shared game logic
    ├── Card.ts      # Card model and game logic
    ├── Player.ts    # Player model and scoring
    ├── Lobby.ts     # Lobby/room management
    ├── GameModel.ts # Main game state manager
    └── Scenario.ts  # Serialization framework
```

## Game Architecture

### Core Models

- **Card**: Represents playing cards and special effect cards
- **Player**: Manages player state, scoring, and card playing
- **Lobby**: Handles multiplayer rooms and game rounds
- **GameModel**: Top-level game state management

### Key Features Implemented

✅ **Card System**
- Standard 52-card French deck
- Up/Down/Even guess cards
- Special effect cards
- Card comparison logic

✅ **Player Management**
- Unique player IDs and names
- Scoring system with streak bonuses
- Hand management (3 basic cards + specials)
- Status tracking (active/eliminated/waiting)

✅ **Lobby System**
- Configurable max players (default 8)
- Host management
- Round timing (10 second default)
- Game phase management

✅ **Game Logic**
- Turn-based guessing rounds
- Automatic scoring and elimination
- Streak tracking and bonuses
- Serialization for network sync

## Development Status

### Current State ✅
- [x] Core game models implemented
- [x] TypeScript compilation working
- [x] Basic test framework with 9 passing tests
- [x] Server runs in fallback mode (Node.js)
- [x] Serialization/deserialization working

### Next Steps 🚧
- [ ] WebSocket communication protocol
- [ ] Client-side web components (LIT)
- [ ] Real-time multiplayer sync
- [ ] Bun runtime setup for production
- [ ] Docker development environment
- [ ] UI/UX implementation
- [ ] Anti-cheat system
- [ ] Leaderboards and persistence

## Available Commands

- `npm run build` - Compile TypeScript to JavaScript
- `npm test` - Run game logic tests
- `npm run dev` - Start server in development mode
- `npm run start:server` - Start with Bun (if available)
- `npm run start:client` - Start client (stub)

## Testing

The project includes a comprehensive test suite covering:
- Card creation and comparison logic
- Player management and scoring
- Lobby functionality and game flow
- Game state serialization

All tests are passing and validate the core game mechanics work correctly.

## Technical Notes

- Uses ES modules with `.js` extensions for Node.js compatibility
- Fallback server implementation when Bun is not available
- Type-safe TypeScript throughout
- Serializable game state for network synchronization
- Modular architecture for easy testing and extension

## Sprint Methodology

This project follows an AI-driven development approach with role-based sprints. See the `sprints/` directory for detailed planning and task breakdown.