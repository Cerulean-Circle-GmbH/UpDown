# QA Engineer Log - Iteration 2 QA Tasks

**Date:** 2025-07-21

## Task 1: Fix Scenario.ts File Format
- Issue: src/shared/Scenario.ts is not a valid TypeScript file; it contains markdown formatting.
- Action: Remove markdown formatting and ensure the file is valid TypeScript.

## Task 2: Refactor Shared Classes into Separate Files
- Issue: Player, Lobby, and Card classes are all defined in src/shared/Player.ts.
- Action: Refactor so that each class (Player, Lobby, Card) is in its own file (Player.ts, Lobby.ts, Card.ts) in src/shared/.
- Collaborate with the Product Owner to ensure the refactoring aligns with architectural and DRY constraints.

## Next Step
- Scrum Master to orchestrate the execution of these QA/refactoring tasks in the optimal order.
- Document user feedback and keep the user informed of the current active role.
