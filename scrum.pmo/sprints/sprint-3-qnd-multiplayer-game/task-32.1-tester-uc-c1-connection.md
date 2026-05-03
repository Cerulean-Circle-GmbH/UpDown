[Back to Sprint 3 Planning](./planning.md) | [Back to Task 32](./task-32-vitest-migration.md)

# Task 32.1: Tester — UC-C1 connection.open vitest
[subtask:uuid:a1b2c3d4-e5f6-7890-abcd-320100000000]
[uc:uuid:92a061e0]

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Use Case Reference
- **UC:** UC-C1 connection.open
- **UC UUID:** 92a061e0
- **Implementation:** WebSocketClient.ts:14 connect() / server.ts:303 setupWebSocketServer()
- **Current test:** protocol-test-suite.js:70 TC1.1 (hand-rolled)

## Acceptance Criteria
1. WebSocket connects to wss://localhost:3443 within 5 seconds
2. Server responds with WELCOME message containing clientId
3. Multiple simultaneous connections each get unique clientId
4. Connection close triggers cleanup (no zombie connections)

## Test File
`qnd/test/vitest/uc-c1-connection-open.test.ts`

## Test Structure
```typescript
// @uc:uuid:92a061e0
describe('UC-C1 connection.open [92a061e0]', () => {
  it('AC1: connects within 5 seconds', async () => { ... });
  it('AC2: receives WELCOME with clientId', async () => { ... });
  it('AC3: multiple connections get unique clientIds', async () => { ... });
  it('AC4: close triggers cleanup', async () => { ... });
});
```

## Architect Review
- [ ] AC matches UC-C1 spec from use case diagram
- [ ] AC is specific and testable (no vague criteria)
