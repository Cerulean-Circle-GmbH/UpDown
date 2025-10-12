# UpDown Game - UX Specification

## Meta Requirement

> **Quote 0**: "write an ux.spec.md and quote all my ux requirements in chapter one in a table and track which are already realized and do s short code quotea and filename into the table. keep the file up to date with my further quotes. also make this prompt hte entry quote in that new file."

**Status**: ✅ REALIZED  
**Implementation**: This document with commit SHA tracking  
**File**: `ux.spec.md`  
**Commit**: `94423fe` (added SHA column)

---

## Architecture Migration

> **Quote**: "i wanted a bigger migration. in want the ts client to completly use lit webcomponents!"

**Status**: 🚧 PLANNED  
**Implementation**: Migrate TypeScript client (`/ts` route) to Lit web components architecture  
**Target Files**: 
- `qnd/src/public/ts/components/` (new directory)
- `qnd/package.json` (add Lit dependency)
- Convert: `Card.ts`, `GameModel.ts`, `GameUI.ts` → Lit components

**Architecture**:
- `<game-card>` - Card display component
- `<game-board>` - Main game board
- `<game-controls>` - Button controls (Up/Down)
- `<game-stats>` - Score/Streak display
- Reactive state management with Lit's `@state` decorator

**Commit**: TBD

---

## Chapter 1: UX Requirements Tracking

| # | User Quote | Status | Implementation | Files | Code Reference | Commit SHA |
|---|------------|--------|----------------|-------|----------------|------------|
| 1 | "read README.md and create a startable playable prototype in the browser with what is already there. use the internal todo to reach a point where i can play the game. focus on visuals and the core game logic." | ✅ REALIZED | Full playable card game with visual UI | `public/index.html`<br>`public/game.js`<br>`public/styles.css` | Game loop: `makeGuess()` in `game.js:229-263`<br>Card rendering: `renderCard()` in `game.js:276-281` | - |
| 2 | "support npm run stop to greacefully stop everything. add keyboad input u an d to start [u] = game up and stop [d] = game down" | ✅ REALIZED | npm stop command + U/D keyboard shortcuts | `stop.sh`<br>`package.json`<br>`public/game.js` | Stop script: `stop.sh:1-30`<br>Keyboard: `setupKeyboardControls()` in `game.js:165-189`<br>U key: `line 170-176`<br>D key: `line 179-186` | - |
| 3 | "ok make the app as responsive as possible. currently on an iphone15 it uses just half the hight of the sceen. make it fill the screen without whitespace below the keys, but always without scrollbars" | ✅ REALIZED | Flexbox layout with dynamic viewport height | `public/styles.css` | `body { height: 100dvh; }` line 10-11<br>`.game-board { flex: 1; }` line 74<br>`justify-content: space-evenly` line 77 | - |
| 4 | "ok. add a updown.sh that starts the server and the browser client on 'npm start' only" | ✅ REALIZED | Single command startup script | `updown.sh`<br>`package.json` | Script: `updown.sh:1-53`<br>npm: `"start": "bash ./updown.sh"` in `package.json:7` | - |
| 5 | "cool. add landscape layout and outoswitch on rotating the phone" | ✅ REALIZED | CSS media queries for orientation with grid layout | `public/styles.css` | `@media (orientation: landscape)` line 554<br>Grid layout: `game-board { display: grid; }` line 530 | - |
| 6 | "ok in landscabe mode the lower button shall be the lowest button ...for sure hehehe" | ✅ REALIZED | CSS flexbox order property | `public/styles.css` | `.choices .up-btn { order: 1; }` line 568<br>`.choices .down-btn { order: 3; }` line 576 | - |
| 7 | "make the header in all responsive versions clickable/touchable. on double click/tab toggle devices borderless fullscreen mode" | ✅ REALIZED | Double-click/tap fullscreen with iOS-specific handling | `public/game.js`<br>`public/styles.css` | `setupFullscreenToggle()` line 204<br>`toggleFullscreen()` line 226<br>iOS instructions: `showIOSFullscreenInstructions()` line 276 | - |
| 8 | "ok works on mac desktop bu not on iphone15 double check" | ✅ REALIZED | iOS-specific fullscreen with PWA instructions | `public/game.js`<br>`public/index.html` | iOS detection: `isIOS = /iPad|iPhone|iPod/.test()` line 228<br>PWA meta tags: `index.html:6-10` | - |
| 9 | "i like the look and feel. optimize the css that the complete page displays on a stone age iphon4 with no scroll bars" | ✅ REALIZED | iPhone 4 (320x480) specific CSS optimizations | `public/styles.css` | `@media (max-width: 480px)` line 434<br>Compact sizing: cards 70x98px line 445<br>Overflow hidden: line 79 | - |
| 10 | "on iphone15 app mode we need to add space for the nodge (so time and the balck element on the top. updown headline is now under the nodge)" | ✅ REALIZED | CSS safe-area-inset for notch/Dynamic Island | `public/styles.css` | `padding-top: env(safe-area-inset-top)` in body line 15<br>`@media (display-mode: standalone)` line 403<br>Header padding: `max(10px, env(safe-area-inset-top))` line 46 | - |
| 11 | "ok add a reaload button on the top left as decent as the fullscreen icon" | ✅ REALIZED | Reload button with hover animation and confirmation | `public/styles.css`<br>`public/game.js` | Icon: `.game-header::before { content: '⟲'; }` line 52<br>Click handler: `reloadGame()` in `game.js:247-255`<br>Area detection: `clickX < 60` line 210 | - |
| 12 | "wonderfull reload button. but you need to have in the iphone app mode at least 50px plank over the headline in portrait mode" | ❌ REVERTED | Caused flickering on rotation | N/A | Issue: 50px padding caused ~50 flickers on phone rotation. Reverted to 10px. | `7cf57df` |
| 13 | "the reaload button does not work on iphone app mode. sure its capable of a single ta activation?" | ✅ REALIZED | Touch event support for reload button | `public/game.js`<br>`public/styles.css` | Touch handler: `addEventListener('touchend', handleTap)` line 240<br>Touch position: `touch.clientX` line 213<br>Larger tap target: `padding: 10px` line 64 | `7cf57df` |
| 14 | "stop. my bad. do NOT revert the touch event. its perfect. revert the iphone15 50px header. on rotating the phone starts to flicker about 50 times untl its settels strange." | ✅ REALIZED | Fixed rotation flickering, reverted 50px padding | `public/styles.css`<br>`public/game.js` | Padding reverted to 10px line 437<br>Removed forced reflow on resize line 365 | `7cf57df` |

---

## Chapter 2: Design Principles

### Visual Design
- Modern gradient backgrounds (`#667eea` to `#764ba2`)
- Card-based UI with realistic playing cards
- Smooth animations (flip, bounce, shake effects)
- Clear visual feedback for game states

### Responsive Strategy
- **Desktop**: Full-featured with larger cards (120×168px)
- **Tablets/Modern Phones**: Optimized with 100dvh viewport
- **iPhone 4 (320px)**: Ultra-compact (70×98px cards)
- **Landscape**: Horizontal grid layout with vertical button stack

### Interaction Patterns
- Click/Tap for primary actions
- Double-tap header for fullscreen
- Keyboard shortcuts: `U` (start), `D` (stop)
- Touch-optimized button sizes
- No text selection, no zoom

---

## Chapter 3: Technical Implementation

### Core Technologies
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with Flexbox/Grid
- **Viewport**: Dynamic viewport height (`100dvh`)
- **Build**: None required (pure browser)

### Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Safari Desktop
- ✅ Safari iOS (with PWA support)
- ✅ Firefox
- ✅ Mobile browsers

### File Structure
```
public/
├── index.html      # Game UI structure
├── game.js         # Game logic & UI controller
└── styles.css      # Responsive styling
updown.sh           # Server launcher
stop.sh             # Server stop script
package.json        # npm commands
```

---

## Chapter 4: User Experience Highlights

### Onboarding
- Immediate playability (click "Start Game")
- Visual hints for keyboard controls
- Orientation change notifications
- iOS fullscreen instructions when needed

### Game Flow
1. Start with "Start Game" button or `U` key
2. See current card, guess Higher/Lower/Equal
3. Instant visual feedback (✓ or ✗)
4. Animated card flips
5. Real-time score/streak tracking
6. Game over screen with final stats

### Accessibility
- Large touch targets (min 44×44px on mobile)
- High contrast colors
- Clear visual hierarchy
- Keyboard navigation support
- Double-tap tolerance (300ms)

---

## Chapter 5: Future Enhancements

### Potential Improvements
- [ ] Sound effects for correct/wrong guesses
- [ ] Haptic feedback on mobile
- [ ] High score persistence (localStorage)
- [ ] Multiple difficulty levels
- [ ] Multiplayer support (as per README)
- [ ] Achievement system
- [ ] Custom themes
- [ ] Swipe gestures for choices

---

## Appendix: Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-12 | 0.1 | Initial playable prototype created |
| 2025-10-12 | 0.1.1 | Added keyboard controls (U/D) and npm stop |
| 2025-10-12 | 0.1.2 | Full responsive design (iPhone 4 to iPhone 15) |
| 2025-10-12 | 0.1.3 | Landscape mode with auto-rotation |
| 2025-10-12 | 0.1.4 | Fullscreen toggle with iOS support |
| 2025-10-12 | 0.1.5 | iPhone 15 notch/Dynamic Island safe area support |
| 2025-10-12 | 0.1.6 | Reload button with confirmation dialog |
| 2025-10-12 | 0.1.7 | ~~Minimum 50px header padding~~ (REVERTED - caused flickering) |
| 2025-10-12 | 0.1.8 | Touch event support for mobile reload button |
| 2025-10-12 | 0.1.9 | Fixed rotation flickering, reverted to 10px header padding |

---

**Document Status**: Living document - Updated with each UX requirement  
**Last Updated**: 2025-10-12  
**Maintained By**: AI Development Team

