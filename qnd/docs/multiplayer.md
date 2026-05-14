# UpDown — Multiplayer Guide

## Getting Started

1. Open the game and enter the **Multiplayer** lobby
2. Set your player name (saved for future sessions)
3. Create a room or join an existing one
4. Play with friends, strangers, or AI bots

## Leaderboard

Click the 🏆 **Leaderboard** button in the lobby to see all-time player rankings.

- Ranked by **total diamonds** earned across all games
- Your position is highlighted with a "→ You" marker
- Shows: rank, name, total diamonds, wins, games played
- **Your Stats** section at the bottom: games, wins, best score, best streak, total diamonds
- Updated automatically after every game
- Bots are excluded — only human players appear
- Stats persist across sessions and server restarts

## Rooms

### Creating a Room
- Click **Create Room** in the lobby
- Room name defaults to "{YourName}'s Room"
- Duplicate names auto-append a number: "Marcel's Room (2)"
- Optional: set a **room key** for private rooms (only players with the key can join)
- You become the **host** of the room you create

### Joining a Room
- Public rooms appear in the lobby room list
- Click **Join** on any room in "waiting" state
- Private rooms require the correct room key
- You can join during the **exchange** phase between rounds (mid-game join)
- Cannot join during active countdown or when room is full

### Sharing a Room
- Click **📨 Invite Friends** to copy the room link
- Share via native Share API (mobile) or clipboard (desktop)
- Link format: `https://server/mp?join=ROOM_ID`

### Room Limits
- Maximum 10 players per room
- Minimum 1 player to start (bots fill remaining slots in preset rooms)

## Host Controls

The host (room creator) has special powers:

### Before Game
- **🎲 Start Game** — begins the game for all players
- **🤖 Add Bot** — adds an AI bot player (card-counting heuristic)
- **⏱️ Countdown Toggle** — switch countdown timer ON/OFF

### During Game (Countdown OFF)
- **Enforce Result ▶** — force-reveal the round result (even if some players haven't guessed)
- **Next Round ▶** — advance to the next round after viewing results

### Host Transfer
If the host leaves or disconnects:
- Host role automatically transfers to the next connected human player
- If no humans remain, host transfers to any available player

## Countdown Modes

### Countdown ON (default)
- 10-second timer per round
- All players must guess within the countdown
- No guess = timeout = eliminated
- Countdown ticks shown to all players
- When all alive players have guessed, countdown cancels and round resolves immediately

### Countdown OFF (host toggle)
- No timer — players guess at their own pace
- Host controls the flow with "Enforce Result" and "Next Round" buttons
- When all alive players have guessed, round auto-resolves (no host action needed)
- Good for teaching, casual play, or demos

## Spectator Mode

- Click **👁 Watch** on an active room to spectate
- Spectators see the game state but cannot play
- **Join Next Game** button lets you become a player when the current game ends
- Spectators persist through game replays

## AI Bots

### Adding Bots
- Host clicks **🤖 Add Bot** before starting
- Preset rooms auto-fill with bots if not enough human players
- Bots play with a 1-8 second random delay (human feel)

### Bot Strategy
Bots use a card-counting heuristic:
- Track which cards have been played
- Calculate probability of higher/lower/equal based on remaining cards
- Pick the option with highest probability
- Personality modifiers add slight randomness

### Bots and Replay
- Bots survive through Play Again — they reset with the room
- Bots play automatically each round

## Chat

- In-game chat available in the bottom sheet
- Tap the handle bar to expand/collapse
- New messages show a preview peek when collapsed
- Message history preserved through replays
- Maximum 200 characters per message
- Last 50 messages kept in history

## Play Again

After a game ends:
- **🔄 Play Again** — resets the room, all players stay, host starts new game
- **← Back to Lobby** — leave the room and return to lobby
- Scores reset to 0, deck reshuffled, all players revived
- Chat history preserved
- Bots stay in the room

## Player Status Icons

| Icon | Meaning |
|------|---------|
| ● | Waiting to play (hasn't guessed yet) |
| ✅ | Has played their card |
| 💀 | Eliminated |
| 🧊 | Frozen (can't play this round) |
| 👁️ | Spectating |

## Preset Rooms

The server creates permanent rooms that auto-fill with bots:
- **Quick 2P** — 2 player game
- **Quick 3P** — 3 player game

These rooms auto-recreate after each game ends. They have a 30-second lobby countdown that auto-starts the game.

## Tips

- **Watch the odds** — if the current card is a 2, "Higher" is almost certain. If it's an Ace, "Lower" is the safe bet.
- **Equal is risky** — only 3 out of 51 remaining cards match. But the streak bonus makes it tempting.
- **Save your Shield** — don't play Protective Shell on round 1. Wait until you're unsure.
- **Use Freeze strategically** — freezing a player on a high streak breaks their momentum without eliminating them.
- **Point Steal late** — stealing 20 points matters more in the final rounds when scores are high.
