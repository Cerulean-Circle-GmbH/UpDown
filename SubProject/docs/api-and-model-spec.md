# UpDown Game: Initial Data Models & API Interfaces

**Date:** 2025-07-22

## Data Models

### Player
- id: string
- name: string
- score: number
- streak: number
- hand: Card[]
- status: 'active' | 'eliminated' | 'spectator'

### Card
- suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
- value: number (1-13)
- type: 'up' | 'down' | 'even' | 'special'
- owner: string (player id)

### Lobby
- id: string
- host: string (player id)
- players: Player[]
- settings: object
- status: 'open' | 'in-game' | 'closed'

### GameState
- round: number
- cardsInPlay: Card[]
- players: Player[]
- lobby: Lobby
- currentCard: Card
- history: Card[]

## API Interfaces

### Message/Event Types
- scenario: { classRef: string, model: object (encrypted) }
- join: { playerId, lobbyId }
- leave: { playerId, lobbyId }
- playCard: { playerId, card }
- chat: { playerId, message }
- error: { code, message }

### Radical OOP, Protocol-less API Design Principle

**Date:** 2025-07-22

#### Principle
- All actions and communications in the UpDown game are implemented as methods on the relevant model classes.
- There are no explicit protocol-style function calls (e.g., joinLobby(lobbyId)). Instead, use object-oriented methods (e.g., Lobby.join()).
- Scenario objects encapsulate state and behavior. To send a scenario, use Scenario.send().
- This approach follows the vision of radical OOP as advocated by Alan Kay and Dan Ingalls.

#### Example
- Instead of: joinLobby(lobbyId) → Use: Lobby.join()
- Instead of: playCard(card) → Use: Player.playCard(card)
- Instead of: sendScenario(scenario) → Use: scenario.send()

#### Developer Guidance
- All future core and API design must follow this principle.
- Update all documentation, specs, and code to reflect this approach.

---

This file is the authoritative reference for initial data models and API interfaces for client-server and P2P communication in UpDown. This section supersedes previous protocol-style API definitions. All developers must follow this radical OOP, protocol-less approach.



---  
# backup and QA user annotations


## Data Models

### Player
- id: string
- name: string
- score: number
- streak: number
- hand: Card[]
- status: 'active' | 'eliminated' | 'spectator'

### Card
- suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
- value: number (1-13)
- type: 'up' | 'down' | 'even' | 'special'
- owner: string (player id)

### Lobby
- id: string
- host: string (player id)
- players: Player[]
- settings: object
- status: 'open' | 'in-game' | 'closed'

### GameState
- round: number
- cardsInPlay: Card[]
- players: Player[]
- lobby: Lobby
- currentCard: Card
- history: Card[]


## API Interfaces

### Message/Event Types
- class Scenarion: scenario: { classRef: string, model: object (encrypted) }
- class Lobby:join: { playerId, lobbyId }
- class Lobby:leave: { playerId, lobbyId }
- class GameState: playCard: { playerId, card }
- class GameChat: chat: { playerId, message }
- error: { code, message }

- class Scenarion: broadcast(scenario)
- class Lobby: update(lobby)
- class GameState: update(gameState)
- error(message)

### P2P
- syncScenario(scenario)

### Protocols for just Scenario exchange and sync
- WebSocket for real-time communication
- HTTPS for initial setup/fallback
