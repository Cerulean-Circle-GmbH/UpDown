# How to Play UpDown 🎴

## Quick Start

Run the game with one command:

```bash
npm start
```

This will:
- Start the server on port 3000
- Automatically open your browser to the game

Or manually open: **http://localhost:3000**

## How to Play

1. **Start the Game** - Click the "Start Game" button or press `U` key
2. **See the Current Card** - A card from a standard 52-card deck is shown
3. **Make Your Guess** - Click one of three buttons:
   - **⬆ Higher** - Guess the next card will be higher in value
   - **⬇ Lower** - Guess the next card will be lower in value
   - **= Equal** - Guess the next card will be the same value (risky but high reward!)

## Keyboard Shortcuts ⌨️

- **U** = **Game Up** (Start the game)
- **D** = **Game Down** (Stop the current game)

4. **Score Points** - 
   - Correct guess: +10 points (50 for Equal!)
   - Wrong guess: -5 points and GAME OVER
   - Build streaks for multipliers (every 5 correct guesses)

5. **Survive as Long as Possible** - The game ends when:
   - You guess wrong
   - The deck runs out of cards (52 cards total)

## Scoring System

- **Base Points**: 10 per correct guess
- **Equal Bonus**: 50 points (because it's harder!)
- **Streak Multiplier**: Every 5 correct guesses in a row multiplies your points
  - 1-4 correct: 1x multiplier
  - 5-9 correct: 2x multiplier
  - 10-14 correct: 3x multiplier
  - And so on...

## Card Values

- **2-10**: Face value
- **J (Jack)**: 11
- **Q (Queen)**: 12
- **K (King)**: 13
- **A (Ace)**: 14 (highest)

## Tips

- Equal is rare but gives lots of points!
- Build streaks for bigger multipliers
- Watch the "Cards Left" counter - plan your strategy!
- Remember which cards have been played

## Starting/Stopping the Server

**Start the game:**
```bash
npm start
```

**Stop the server:**
```bash
npm run stop
```

Or press `Ctrl+C` in the terminal where the server is running.

**Manual start (alternative):**
```bash
cd public
python3 -m http.server 3000
```

Then open http://localhost:3000 in your browser.

Enjoy the game! 🎮

