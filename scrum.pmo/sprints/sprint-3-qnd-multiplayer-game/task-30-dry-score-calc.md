[Back to Sprint 3 Planning](./planning.md)

# Task 30: DRY — Extract shared/ScoreCalculator.ts
[task:uuid:a4b5c6d7-e8f9-4a0b-bcde-300000000001]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [uc:uuid:035d2535] UC-P4: player.guess.correct
    - [uc:uuid:18224bc2] UC-P14: player.score
    - [uc:uuid:b1be7a22] UC-GE4: game.end.diamonds
    - DRY Violation V3 in dry-violations.md
  - down
    - None (atomic task)

## Use Case Reference
- **UC UUIDs:** 035d2535, 18224bc2, b1be7a22
- **DRY Violation:** V3 — Score calculation duplicated 4 times
- **Files affected:** GameModel.ts (single-player), GameRoom.ts resolveRound(), GameRoom.ts endGame() diamonds, MultiplayerUI.ts display

## Task Description
Extract scoring formula (`10 + streak` for correct, `streak = 0` for wrong, diamond calculation) into `shared/ScoreCalculator.ts`. Four locations implement the same logic with risk of inconsistency.

## Acceptance Criteria
1. `shared/ScoreCalculator.ts` exports `calculateScore(correct: boolean, streak: number): { score: number, newStreak: number }`
2. `shared/ScoreCalculator.ts` exports `calculateDiamonds(rank: number, roundsPlayed: number, streak: number): number`
3. GameModel.ts imports `calculateScore()` — zero inline scoring
4. GameRoom.ts resolveRound() imports `calculateScore()` — zero inline scoring
5. GameRoom.ts endGame() imports `calculateDiamonds()` — zero inline diamond calc
6. Formula: correct = 10 + streak, wrong = streak reset to 0
7. Diamond formula: 1st=50, 2nd=30, 3rd=20 + rounds*5 + streakBonus(≥10→25, ≥5→10)

## Test File
`qnd/test/vitest/dry-score-calc.test.ts`

## Test Structure
```typescript
// @dry:V3 score-calculator
describe('DRY V3: ScoreCalculator', () => {
  it('AC1: calculateScore correct with streak=5 returns 15', () => { ... });
  it('AC2: calculateScore wrong resets streak to 0', () => { ... });
  it('AC6: calculateDiamonds rank 1 + 10 rounds + streak 12 = 50+50+25', () => { ... });
  it('AC7: diamond formula matches endGame implementation', () => { ... });
});
```

## Architect Review
- [x] AC matches DRY violation V3 from dry-violations.md
- [x] AC is specific and testable
- [x] Covers both SP and MP scoring paths
