[Back to Sprint 3 Planning](./planning.md)

# Task 29: DRY — Extract shared/CardUtils.ts
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-290000000001]

## Status
- [ ] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Traceability
  - up
    - DRY Violation V2 in dry-violations.md
  - down
    - None (atomic task)

## Use Case Reference
- **DRY Violation:** V2 — Card rendering/display duplicated 7 times
- **Files affected:** MultiplayerUI.ts:437 renderCard(), MultiplayerUI.ts:472 cardHtml(), game-card.ts Lit render, GameUI.ts renderCard(), Card.ts getColor(), GameRoom.ts deck creation, SpecialCards.ts card formatting

## Task Description
Extract suit symbol mapping (`hearts → ♥`) and color logic (`hearts|diamonds → red`) into `shared/CardUtils.ts`. Seven locations have the same mapping, risking inconsistency.

## Acceptance Criteria
1. `shared/CardUtils.ts` exports `suitSymbol(suit: string): string` — maps suit name to symbol (♥/♦/♣/♠)
2. `shared/CardUtils.ts` exports `cardColor(suit: string): 'red' | 'black'` — hearts/diamonds → red, clubs/spades → black
3. `shared/CardUtils.ts` exports `cardToHtml(card: {suit, value}): string` — renders card as HTML string
4. MultiplayerUI.ts uses `CardUtils.suitSymbol()` and `CardUtils.cardColor()` — zero inline mappings
5. GameUI.ts uses `CardUtils` — zero inline suit mappings
6. game-card.ts Lit component uses `CardUtils` — zero inline mappings
7. All 7 locations import from single source — verified by grep

## Test File
`qnd/test/vitest/dry-card-utils.test.ts`

## Test Structure
```typescript
// @dry:V2 card-utils
describe('DRY V2: CardUtils', () => {
  it('AC1: suitSymbol maps all 4 suits', () => { ... });
  it('AC2: cardColor returns red for hearts/diamonds, black for clubs/spades', () => { ... });
  it('AC3: cardToHtml renders value + symbol with correct color', () => { ... });
  it('AC7: zero inline suit mappings in source files', () => { ... });
});
```

## Architect Review
- [x] AC matches DRY violation V2 from dry-violations.md
- [x] AC is specific and testable
- [x] Covers all 7 affected locations
