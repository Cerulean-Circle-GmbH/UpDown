[Back to Sprint 3 Planning](./planning.md) | [Back to Task 32](./task-32-vitest-migration.md)

# Task 32.8: Tester — UC-CH1 chat.send vitest
[subtask:uuid:a1b2c3d4-e5f6-7890-abcd-320800000000]
[uc:uuid:0dfe22b0]

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Use Case Reference
- **UC:** UC-CH1 chat.send + UC-CH2 chat.history + UC-CH3 chat.maxLength + UC-CH4 chat.maxHistory
- **UC UUIDs:** 0dfe22b0, 7b4f1505, 8a319461, f552ec48
- **Implementation:** server.ts:511 CHAT_MESSAGE handler / GameRoom broadcast

## Acceptance Criteria
1. CHAT_MESSAGE with text → all players in room receive CHAT_MESSAGE with senderId, senderName, text, timestamp
2. Spectators also receive CHAT_MESSAGE
3. Text longer than 200 chars → truncated to 200 in broadcast
4. New player joining room receives CHAT_HISTORY with past messages
5. Chat history capped at 50 messages (oldest dropped when exceeded)
6. Empty text → no broadcast (guard check)

## Test File
`qnd/test/vitest/uc-ch1-chat.test.ts`

## Test Structure
```typescript
// @uc:uuid:0dfe22b0,7b4f1505,8a319461,f552ec48
describe('UC-CH1 chat.send [0dfe22b0]', () => {
  it('AC1: CHAT_MESSAGE broadcast to all players', async () => { ... });
  it('AC2: spectators receive CHAT_MESSAGE', async () => { ... });
  it('AC3: text > 200 chars truncated', async () => { ... });
  it('AC4: new joiner gets CHAT_HISTORY', async () => { ... });
  it('AC5: history capped at 50 messages', async () => { ... });
  it('AC6: empty text not broadcast', async () => { ... });
});
```

## Architect Review
- [x] AC covers send, receive, truncation, history, cap, guard
- [x] AC is specific and testable
