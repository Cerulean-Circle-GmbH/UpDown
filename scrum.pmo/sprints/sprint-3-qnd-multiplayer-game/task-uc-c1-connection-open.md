# Task: UC-C1 connection.open — Vitest
[uc:uuid:92a061e0]

## Use Case
A client connects to the WebSocket server and receives a welcome message with a unique player ID.

## Implementation
- WebSocketClient.ts:14 connect()
- server.ts:303 setupWebSocketServer()

## Acceptance Criteria

### AC-1: WebSocket connects successfully
- Client opens WSS connection to localhost:3443
- Connection reaches OPEN state (readyState === 1)

### AC-2: Server sends welcome message
- First message received has type 'welcome'
- Message includes clientId field (non-empty string)

### AC-3: Multiple concurrent connections get unique IDs
- 3 simultaneous connections each receive unique clientId
- All 3 reach OPEN state

### AC-4: Welcome includes online count
- welcome message has onlineCount field (number >= 1)

## Test File
`qnd/test/vitest/uc-c1-connection-open.test.ts`

## Status
- [ ] AC reviewed by architect
- [ ] Test implemented
- [ ] Test passing
- [ ] Traceability matrix updated
