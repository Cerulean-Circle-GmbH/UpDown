# QA Engineer Log - Iteration 2 QA Tasks

**Date:** 2025-07-21

## Task 1: Fix Scenario.ts File Format
- Issue: src/shared/Scenario.ts is not a valid TypeScript file; it contains markdown formatting.
- Action: Remove markdown formatting and ensure the file is valid TypeScript.

## Task 2: Refactor Shared Classes into Separate Files
- Issue: Player, Lobby, and Card classes are all defined in src/shared/Player.ts.
- Action: Refactor so that each class (Player, Lobby, Card) is in its own file (Player.ts, Lobby.ts, Card.ts) in src/shared/.
- Collaborate with the Product Owner to ensure the refactoring aligns with architectural and DRY constraints.

## Task 3: Remove Duplicate Scenario Type from GameModel.ts
- Issue: The Scenario type is still duplicated in src/shared/GameModel.ts. It should only be imported from src/shared/Scenario.ts.
- Action: Remove the duplicate Scenario type definition from GameModel.ts and ensure it imports Scenario from Scenario.ts.

## Task 4: Check and Report Missing TypeScript/NPM Dependencies
- Issue: TypeScript code may be inconsistent or fail to run because required dependencies (e.g., Bun types, WebSocket types, etc.) are not yet installed as npm packages.
- Action: Review the codebase for missing dependencies, document which packages are required, and report to DevOps for installation.

## Task Status
- [x] Task 1: Fix Scenario.ts File Format (done)
- [x] Task 2: Refactor Shared Classes into Separate Files (done)
- [x] Task 3: Remove Duplicate Scenario Type from GameModel.ts (done)
- [x] Task 4: Check and Report Missing TypeScript/NPM Dependencies (done)

## Next Step
- Continue with QA tasks and document progress in this qa/ directory.