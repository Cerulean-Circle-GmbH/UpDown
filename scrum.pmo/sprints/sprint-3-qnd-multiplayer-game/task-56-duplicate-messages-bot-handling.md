[Back to Sprint 3 Planning](./planning.md)

# Task 56: BUG — Duplicate Messages (Chat + Keybindings Handler Stacking)
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-560000000001]
[uc:uuid:0dfe22b0]

## Status
- [x] Planned
- [x] Architect Analysis
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [uc:uuid:0dfe22b0] UC-CH1: chat.send
  - down
    - None (atomic bug fix)

## Problem (Tron report)
Chat messages appear multiple times in chat dialog. Gets worse after each Play Again.

## Root Cause (Architect analysis)
**Handler stacking via `client.on()` inside `render()`.** Two separate instances of the same bug:

### Bug A: Chat handlers stacking
`render()` (line 165) → `setupChat()` (line 230) → `client.on(MSG.CHAT_MESSAGE, handler)` (line 309)

Every `render()` call pushes ANOTHER `CHAT_MESSAGE` handler onto `WebSocketClient.handlers` array. `WebSocketClient.on()` (line 54) pushes into array, never removes. `WebSocketClient.emit()` (line 59) calls ALL handlers.

After N replays (each triggers ROOM_RESET → render()):
- 1 CHAT_MESSAGE arrives from server
- N handlers fire
- Each does `chatMessages.push()` + `appendChatMessage()`
- Message appears N times in chat UI

Also stacking in `render()`: `CHAT_HISTORY` handler (line 303), `disconnected`/`reconnecting`/`reconnected` handlers (lines 264-266).

### Bug B: Keybinding handlers stacking
`render()` → `setupKeybindings()` (line 663) → `document.addEventListener('keydown', handler)` (line 674)

Same pattern — new handler added per render, never removed. After N replays, one keypress fires N `playCard()` calls.

### Server is CLEAN
- `broadcast()` sends once per message
- `resolveRound()` has re-entry guard (line 467-468)
- CHAT_MESSAGE: server broadcasts once, no local pre-append on client
- Bot broadcasts: bots have `ws: null`, skipped by `broadcast()` — no double-send to humans

## Fix

### 56.1: Expert — Move chat handlers from setupChat() to constructor
Move these `client.on()` calls from `setupChat()` (called per-render) to the constructor (called once):
- `client.on(MSG.CHAT_MESSAGE, ...)` (line 309)
- `client.on(MSG.CHAT_HISTORY, ...)` (line 303)

The constructor already correctly has: ROOM_JOINED, PLAYER_JOINED, PLAYER_LEFT, HOST_CHANGED, ROUND_START, COUNTDOWN, CARD_PLAYED, ROUND_RESULT, GAME_OVER, ROOM_RESET, COUNTDOWN_SETTING, SPECTATE_JOINED, SPECTATE_LEFT. Chat handlers should join them.

### 56.2: Expert — Fix keybinding handler stacking
Store handler reference, remove before adding:
```typescript
private keyHandler: ((e: KeyboardEvent) => void) | null = null;

setupKeybindings(): void {
  if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler);
  this.keyHandler = (e: KeyboardEvent) => { /* existing logic */ };
  document.addEventListener('keydown', this.keyHandler);
}
```

### 56.3: Expert — Move WS status handlers from render() to constructor
Move from `render()` (lines 264-266) to constructor:
- `client.on('disconnected', ...)`
- `client.on('reconnecting', ...)`
- `client.on('reconnected', ...)`

### 56.4: Expert — Add client.off() for future safety (optional DRY)
Add `off(type, handler)` method to WebSocketClient:
```typescript
off(type: string, handler?: MessageHandler): void {
  if (!handler) { this.handlers.delete(type); return; }
  const h = this.handlers.get(type);
  if (h) this.handlers.set(type, h.filter(fn => fn !== handler));
}
```

## Acceptance Criteria
1. Send chat message → appears exactly ONCE in chat (not duplicated)
2. After 5 Play Again replays → chat still shows each message once
3. After 5 replays → pressing U key sends exactly 1 PLAY_CARD (not N)
4. WS disconnect/reconnect status indicator works correctly after replays
5. All existing chat functionality preserved (preview peek, history on join, max 50)
6. Rebuilt with esbuild

## Test File
`qnd/test/vitest/task-56-no-duplicate-messages.test.ts`

## Test Structure
```typescript
// @uc:uuid:0dfe22b0
describe('Task 56: No duplicate messages', () => {
  it('AC1: CHAT_MESSAGE handler registered exactly once', () => { ... });
  it('AC2: chat message appears once after 5 replays', () => { ... });
  it('AC3: keydown handler fires playCard once after 5 replays', () => { ... });
});
```

## Architect Review
- [x] Root cause identified: client.on() inside render() stacks handlers
- [x] Server verified clean: broadcast once, re-entry guard, bots skipped
- [x] Fix is surgical: move 5 client.on() calls to constructor + fix 1 addEventListener
- [x] No behavior change — same handlers, registered once instead of per-render
