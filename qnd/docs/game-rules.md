# UpDown — Game Rules

## Overview

UpDown is a card prediction game. A game master (GM) holds a hand of cards and reveals them one at a time. Players guess whether the next card will be **higher**, **lower**, or **equal** to the current card. Guess correctly to score points and stay alive. Guess wrong and you're eliminated.

## The Deck

Standard 52-card French deck:
- **4 suits:** ♥ Hearts, ♦ Diamonds, ♣ Clubs, ♠ Spades
- **13 values** (low to high): 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A
- Numeric values: 2=2, 3=3, ..., 10=10, J=11, Q=12, K=13, A=14

## Game Setup

1. The deck is shuffled
2. The GM draws **7 cards** as their hand
3. One card is revealed face-up as the **current card**
4. Players are shown the current card and must guess what comes next

## Round Flow

Each round follows this sequence:

1. **Current card shown** — all players see the face-up card
2. **Players guess** — choose one:
   - ⬆️ **Higher** — next card will have a higher value
   - ⬇️ **Lower** — next card will have a lower value
   - ⚖️ **Equal** — next card will have the same value
3. **Countdown** — 10 seconds to make your guess (if countdown is enabled)
4. **Card revealed** — GM plays a card from their hand
5. **Results calculated** — correct/wrong determined, scores updated
6. **Next round** — revealed card becomes the new current card

## Scoring

- **Correct guess:** +10 points + current streak bonus
  - Formula: `score += 10 + streak`
  - Streak 0: +10 pts, Streak 3: +13 pts, Streak 10: +20 pts
- **Wrong guess:** 0 points, streak resets to 0, **player eliminated**
- **No guess (timeout):** treated as wrong — eliminated

## Streaks

Consecutive correct guesses build a streak:
- Each correct guess increments your streak by 1
- Streak adds directly to your round score (10 + streak)
- One wrong guess resets streak to 0

## Elimination

- A wrong guess or timeout **eliminates** you from the game
- Eliminated players can watch the remaining rounds
- Special cards can save you from elimination (see [Special Cards](special-cards.md))

## Game End

The game ends when either:
1. **All players eliminated** — everyone guessed wrong or timed out
2. **Deck exhausted** — GM's hand and deck are both empty (no more cards to reveal)

## End-of-Game Leaderboard

Each game ends with a leaderboard ranking all players:
1. **Score** (descending) — highest score wins
2. **Rounds played** (tiebreaker) — survived longer = higher rank

## All-Time Leaderboard

Cumulative stats are tracked across all games you play. Access the 🏆 **Leaderboard** from the lobby to see all-time rankings.

**Ranking criteria:**
1. **Total diamonds** (descending) — earned across all games
2. **Wins** (tiebreaker) — number of 1st place finishes
3. **Best score** (tiebreaker) — highest single-game score
4. **Games played** (tiebreaker) — more experience = higher rank

**Your stats tracked:**
- Games played, wins, total score, total diamonds
- Best single-game score, longest streak ever, best rank achieved

Stats persist between sessions and server restarts. Bots are not included in the all-time leaderboard.

## Diamonds (Currency)

Earned at game end based on performance:

| Reward | Amount |
|--------|--------|
| 1st place | 💎 50 |
| 2nd place | 💎 30 |
| 3rd place | 💎 20 |
| Per round survived | 💎 5 |
| Streak bonus (5-9) | 💎 10 |
| Streak bonus (10+) | 💎 25 |

## GM Hand Mechanics

- GM starts with 7 cards from the deck
- Each round, GM plays one card from their hand (random selection)
- After playing, GM draws one replacement card from the deck (if available)
- When the deck runs out, GM hand shrinks each round
- Game ends when GM has no cards left to play

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| U or ↑ | Guess Higher |
| D or ↓ | Guess Lower |
| E or ←/→ | Guess Equal |
