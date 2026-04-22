# UpDown Controls Reference 🎮

## Server Commands

| Command | Action |
|---------|--------|
| `npm start` | Start server + open browser |
| `npm run stop` | Stop the server gracefully |
| `Ctrl+C` | Stop server (in terminal) |

## Keyboard Shortcuts ⌨️

| Key | Action | When Available |
|-----|--------|----------------|
| **U** | **Game Up** - Start the game | When game is not active |
| **D** | **Game Down** - Stop current game | During active gameplay |

## Game Controls 🎴

### Mouse/Touch
- Click **⬆ Higher** button - Guess next card is higher
- Click **⬇ Lower** button - Guess next card is lower  
- Click **= Equal** button - Guess next card is equal (50 pts!)
- Click **Start Game** - Begin new game
- Click **Play Again** - Restart after game over

### Visual Feedback
- ✓ Green message = Correct guess
- ✗ Red message = Wrong guess (game over)
- 🛑 Orange message = Game stopped by player
- Animated notification appears when using keyboard shortcuts

## Quick Tips 💡

1. Press `U` to quickly start a new game
2. Press `D` to quit mid-game if you want to preserve your high score
3. Watch the on-screen hint: "Keyboard: U = Start • D = Stop"
4. Keyboard controls only work when appropriate (can't start twice, can't stop if not playing)

---

**Open Game:** http://localhost:3000 (after running `npm start`)

