[Back to Sprint 3 Planning](./planning.md)

# Task 14: AI Agent Player — Architectural Spec
[task:uuid:e1f2a3b4-c5d6-7890-efab-030000000014]

## Status
- [x] Done

## Decision 1: No LLM — Pure Heuristic

LLM is overkill for Up/Down/Even. The decision space is tiny (3 choices) and card counting gives near-optimal play. QnD approach: **probability-based heuristic with personality**.

Reasons:
- Groq/Ollama adds latency (100-2000ms) for a 10-second countdown — wasteful
- Card counting is mathematically superior to any LLM guess
- LLM can't "see" the remaining deck — heuristic can
- Zero external dependencies, zero API keys, works offline

## Decision 2: Architecture — Internal Bot, NOT WebSocket Client

**Internal player object** injected into GameRoom, not a WS client.

Why not WS client:
- Extra process, extra connection, extra failure mode
- Bot needs to see the deck state for card counting — WS protocol doesn't expose it
- Latency of self-connecting via WS is pointless overhead

Why internal:
- GameRoom already has `RoomPlayer` — bot is a RoomPlayer with `ws: null`
- Bot logic runs server-side in `resolveRound()` or a pre-resolve hook
- No network, no serialization, instant decisions
- `broadcast()` already skips closed/null sockets (line 328: `readyState === OPEN` check)

## Decision 3: AI Decision Strategy — Card Counting Heuristic

### Core Algorithm

The AI tracks which cards have been played and calculates probability:

```typescript
interface BotStrategy {
  decideGuess(currentCard: Card, playedCards: Card[], deckSize: number): 'up' | 'down' | 'equal';
}
```

**Logic:**
1. Current card has numericValue N (2-14, where 14=Ace)
2. Count remaining cards in deck (52 - played)
3. Count how many remaining cards are > N, < N, === N
4. Pick the option with highest probability

```
Given current card value N:
  cardsAbove = count of remaining cards with value > N
  cardsBelow = count of remaining cards with value < N
  cardsEqual = count of remaining cards with value === N
  
  probUp    = cardsAbove / totalRemaining
  probDown  = cardsBelow / totalRemaining
  probEqual = cardsEqual / totalRemaining
  
  Choose max(probUp, probDown, probEqual)
```

**Example:** Current card is 7 (numericValue 9). In a fresh 52-card deck:
- Cards above 9: 10,J,Q,K,A = 5 ranks × 4 suits = 20
- Cards below 9: 2,3,4,5,6,7,8 = 7 ranks × 4 suits = 28 (minus the 7 already played)
- Cards equal 9: 3 remaining 9s
- Decision: **DOWN** (highest probability)

### Personality Variants

Add flavor without changing core logic:

| Personality | Modifier | Behavior |
|-------------|----------|----------|
| **Cautious** | Always picks highest probability | Optimal play, boring |
| **Gambler** | 20% chance to pick second-best option | Occasionally surprising |
| **Equal-lover** | +15% bias toward 'equal' | Goes for high-risk equal guesses |
| **Random** | Pure random | Chaotic, for easy difficulty |

Implementation: `personality` field on bot config, applied as probability modifier before argmax.

## Decision 4: Special Cards — Simple Priority Rules

For QnD, bots use special cards with simple rules:

```
IF bot has protective_shell AND streak >= 3:
  USE protective_shell (protect the streak)
  
IF bot has mass_intelligence AND round >= 5:
  USE mass_intelligence (reveal next card)
  
OTHERWISE:
  NO special card (save for later)
```

Special card inventory for bots: assigned randomly at game start from a small pool. No diamond economy for bots.

## Implementation Spec

### New File: `qnd/src/ts/server/BotPlayer.ts`

```typescript
export interface BotConfig {
  name: string;
  personality: 'cautious' | 'gambler' | 'equal-lover' | 'random';
  avatarUrl: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export class BotPlayer {
  id: string;
  config: BotConfig;
  playedCards: Card[];  // tracks all cards seen
  
  constructor(config: BotConfig);
  
  // Called by GameRoom before resolveRound()
  decideGuess(currentCard: Card): 'up' | 'down' | 'equal';
  
  // Called each round to update card tracking
  observeCard(card: Card): void;
  
  // Reset for new game
  reset(): void;
}

// Preset bots with names and personalities
export const BOT_PRESETS: BotConfig[] = [
  { name: 'Lucky Bot',    personality: 'gambler',     avatarUrl: '/img/bot-lucky.png',    difficulty: 'medium' },
  { name: 'Safe Bot',     personality: 'cautious',    avatarUrl: '/img/bot-safe.png',     difficulty: 'hard' },
  { name: 'Wild Bot',     personality: 'random',      avatarUrl: '/img/bot-wild.png',     difficulty: 'easy' },
  { name: 'Even Steven',  personality: 'equal-lover', avatarUrl: '/img/bot-even.png',     difficulty: 'medium' },
];
```

### GameRoom Integration

Modify `GameRoom.ts`:

```typescript
// In addBot():
addBot(config: BotConfig): string {
  const bot = new BotPlayer(config);
  const botPlayer: RoomPlayer = {
    id: bot.id,
    ws: null as any,  // no WebSocket for bots
    name: config.name,
    avatarUrl: config.avatarUrl,
    score: 0, streak: 0, alive: true,
    currentGuess: null, specialCard: null, roundsPlayed: 0,
    isBot: true,       // NEW field
    botInstance: bot    // NEW field
  };
  this.players.set(bot.id, botPlayer);
  return bot.id;
}

// In startCountdown() or resolveRound():
// Before resolving, make bot decisions:
private botDecisions(): void {
  this.players.forEach(player => {
    if (player.isBot && player.alive && player.currentGuess === null) {
      const bot = player.botInstance as BotPlayer;
      player.currentGuess = bot.decideGuess(this.currentCard!);
    }
  });
}
```

### When Bots Decide

Two options:
- **Option A:** Bot decides immediately when round starts (instant, boring — other players see "bot played" instantly)
- **Option B:** Bot decides after random delay (1-8 seconds) — feels more human

**Recommendation: Option B** with `setTimeout(randomDelay, botDecide)`. The delay makes it feel like a real player thinking.

### WebSocket Protocol Addition

New client message:
```
{ type: 'ADD_BOT', personality: 'cautious' }  // host only
{ type: 'REMOVE_BOT', botId: '<id>' }          // host only
```

New server broadcast:
```
{ type: 'PLAYER_JOINED', player: { id, name, avatarUrl, isBot: true } }
```

### broadcast() Fix for Bots

Current `broadcast()` checks `ws.readyState === WebSocket.OPEN`. For bots, `ws` is null. Fix:

```typescript
broadcast(msg: object): void {
  const data = JSON.stringify(msg);
  this.players.forEach(p => {
    if (p.ws && p.ws.readyState === WebSocket.OPEN) p.ws.send(data);
    // Bots have ws: null — silently skipped
  });
}
```

## Effort Estimate

| Item | Lines | Time |
|------|-------|------|
| BotPlayer.ts (class + presets) | ~120 | 30min |
| GameRoom.ts modifications (addBot, botDecisions, broadcast fix) | ~40 | 15min |
| Server.ts WS handler (ADD_BOT/REMOVE_BOT messages) | ~20 | 10min |
| UI: "Add Bot" button in lobby (host only) | ~30 | 15min |
| **Total** | ~210 | ~1h |

## Test Cases (append to task-9)

### TC-BOT.1: Add bot to room
```
PRE:     Host created room
SEND:    { type: 'ADD_BOT', personality: 'cautious' }
EXPECT:  { type: 'PLAYER_JOINED', player: { name: 'Safe Bot', isBot: true } }
```

### TC-BOT.2: Bot plays during round
```
PRE:     Game started with 1 human + 1 bot
WAIT:    Bot plays within 1-8 seconds
EXPECT:  { type: 'CARD_PLAYED', playerId: <botId>, hasPlayed: true }
```

### TC-BOT.3: Bot makes probabilistic decisions
```
PRE:     Current card is 2 (lowest possible)
EXPECT:  Bot with 'cautious' personality picks 'up' (overwhelming probability)
```

### TC-BOT.4: Only host can add bots
```
PRE:     Player B is NOT host
SEND B:  { type: 'ADD_BOT', personality: 'random' }
EXPECT:  { type: 'ERROR', message: 'Only host can add bots' }
```

### TC-BOT.5: Bot survives disconnect of human players
```
PRE:     1 human + 2 bots playing
ACTION:  Human disconnects
EXPECT:  Game continues with bots (they play against each other until deck empty)
```
