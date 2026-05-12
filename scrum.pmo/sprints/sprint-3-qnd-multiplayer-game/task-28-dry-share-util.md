[Back to Sprint 3 Planning](./planning.md)

# Task 28: DRY — Extract shared/ShareUtil.ts
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-280000000001]
[uc:uuid:433fe03f]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [uc:uuid:433fe03f] UC-R11: room.share
    - DRY Violation V5 in dry-violations.md
  - down
    - None (atomic task)

## Use Case Reference
- **UC:** UC-R11 room.share
- **UC UUID:** 433fe03f
- **DRY Violation:** V5 — Share/clipboard logic duplicated 3 times
- **Files affected:** LobbyUI.ts:182-203, MultiplayerUI.ts:197-210, MultiplayerUI.ts:339-352

## Task Description
Extract identical share/clipboard pattern into `shared/ShareUtil.ts`. Three copies of the same `navigator.share()` / `navigator.clipboard.writeText()` fallback with button feedback.

## Acceptance Criteria
1. `shared/ShareUtil.ts` exports `shareRoomLink(roomId: string, button: HTMLElement): Promise<void>`
2. LobbyUI.ts imports and uses `ShareUtil.shareRoomLink()` — zero inline share code
3. MultiplayerUI.ts room share imports and uses `ShareUtil.shareRoomLink()` — zero inline share code
4. MultiplayerUI.ts game-over share imports and uses `ShareUtil.shareRoomLink()` — zero inline share code
5. Button shows ✅ for 1.5s after share (same behavior as before)
6. `navigator.share` used when available, `clipboard.writeText` as fallback
7. Zero behavioral change from user perspective

## Test File
`qnd/test/vitest/dry-share-util.test.ts`

## Test Structure
```typescript
// @dry:V5 share-util
describe('DRY V5: ShareUtil', () => {
  it('AC1: shareRoomLink exported from shared/ShareUtil.ts', () => { ... });
  it('AC2: LobbyUI has zero inline share code', () => { ... });
  it('AC3: MultiplayerUI room share uses ShareUtil', () => { ... });
  it('AC4: MultiplayerUI gameover share uses ShareUtil', () => { ... });
});
```

## Architect Review
- [x] AC matches DRY violation V5 from dry-violations.md
- [x] AC is specific and testable
- [x] Single source of truth for share logic
