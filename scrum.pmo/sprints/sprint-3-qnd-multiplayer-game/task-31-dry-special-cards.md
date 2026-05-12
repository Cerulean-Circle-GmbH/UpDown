[Back to Sprint 3 Planning](./planning.md)

# Task 31: DRY — Unify Special Card Data Catalog
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-310000000001]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [uc:uuid:f43897d5] UC-P9: player.playSpecial
    - [uc:uuid:dda127ab] UC-SC13: special.inventory
    - DRY Violation V4 in dry-violations.md
  - down
    - None (atomic task)

## Use Case Reference
- **UC UUIDs:** f43897d5, dda127ab
- **DRY Violation:** V4 — Special card data duplicated in 2 catalogs
- **Files affected:** SpecialCards.ts (10 cards with descriptions, levels, emojis), MultiplayerUI.ts (11 entries with emoji + short name)

## Task Description
Unify special card definitions into single shared catalog. SpecialCards.ts has full definitions (level, description, effect function). MultiplayerUI.ts has a partial duplicate (emoji + display name only). Both must import from one source.

## Acceptance Criteria
1. `shared/SpecialCardInfo.ts` exports `SPECIAL_CARDS` catalog with: id, name, emoji, level, description
2. SpecialCards.ts imports card metadata from `shared/SpecialCardInfo.ts` — zero inline card definitions for display data
3. MultiplayerUI.ts imports card display info from `shared/SpecialCardInfo.ts` — zero inline emoji/name mappings
4. All 13 cards present in single catalog (protective_shell through inventory)
5. Card levels correct: L1 (shield, mass_intelligence, double_points), L2 (peek, sacrifice, swap, reveal_hand), L3 (freeze, one_for_the_team, second_chance, point_steal)
6. Priority order preserved: L3 resolves before L2 before L1

## Test File
`qnd/test/vitest/dry-special-cards.test.ts`

## Test Structure
```typescript
// @dry:V4 special-card-catalog
describe('DRY V4: SpecialCardInfo', () => {
  it('AC1: SPECIAL_CARDS exports 13 cards', () => { ... });
  it('AC4: all cards have id, name, emoji, level, description', () => { ... });
  it('AC5: L1/L2/L3 level assignments correct', () => { ... });
  it('AC6: priority order L3 > L2 > L1', () => { ... });
});
```

## Architect Review
- [x] AC matches DRY violation V4 from dry-violations.md
- [x] AC is specific and testable
- [x] Single catalog covers both server and client needs
