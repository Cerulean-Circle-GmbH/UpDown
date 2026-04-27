[Back to Sprint 1 Planning](./planning.md)

# Task 9.5: Expert — CLI Infrastructure for ALL 6 Library Components (BLOCKER)
[subtask:uuid:d1e2f3a4-b5c6-7890-defa-900000000005]

## Status
- [ ] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## BLOCKER
`web4tscomponent on {Component} latest` fails with "CLI back-reference not set. Call setCLI() from {Name}CLI." This blocks ALL component lifecycle operations (setCICDVersion, upgrade, links fix, etc.) for the 6 library components.

## Root Cause
The 6 library components (Unit, Persistence, User, Filesystem, HTTP, TLS) were created from scratch during de-monolithization. They have build.sh and a minimal CLI script but are missing the Web4TSComponent CLI template infrastructure:
- layer2/DefaultCLI.ts — CLI base class with method dispatch
- layer2/DelegationProxy.ts — delegates lifecycle methods to Web4TSComponent
- layer3/ CLI interfaces (CLI.interface, CLIModel.interface, Colors.interface, Component.interface, etc.)
- layer4/ utilities (DefaultColors, TSCompletion, HierarchicalCompletionFilter, TestFileParser)
- layer5/{Name}CLI.ts — component-specific CLI entry point

Generated components (Web4Test, Tootsie, PDCA, IdealMinimalComponent) have ALL of these because web4tscomponent create generates them from templates.

## Task Description
Copy the CLI template files from IdealMinimalComponent (simplest reference) into each of the 6 library components, creating {Name}CLI.ts for each. Adapt component name, model interface, and any component-specific methods.

## Components to Fix
1. Unit/0.3.23.1 → UnitCLI.ts (also port create/classify from Unit.prod)
2. Persistence/0.3.23.1 → PersistenceCLI.ts
3. User/0.3.23.1 → UserCLI.ts
4. Filesystem/0.3.23.1 → FilesystemCLI.ts
5. HTTP/0.3.23.1 → HTTPCLI.ts
6. TLS/0.3.23.1 → TLSCLI.ts

## Files to Copy per Component (from IMC template)
- layer2/DefaultCLI.ts
- layer2/DelegationProxy.ts
- layer3/CLI.interface.ts, CLIModel.interface.ts, Colors.interface.ts, Component.interface.ts, MethodInfo.interface.ts, MethodSignature.interface.ts, User.interface.ts, Completion.ts
- layer4/DefaultColors.ts, TSCompletion.ts, HierarchicalCompletionFilter.ts, TestFileParser.ts
- layer5/{Name}CLI.ts

## Acceptance Criteria
- [ ] All 6 components have DefaultCLI.ts + DelegationProxy.ts in layer2
- [ ] All 6 have {Name}CLI.ts in layer5
- [ ] All 6 have CLI layer3 interfaces
- [ ] All 6 have layer4 utilities
- [ ] `web4tscomponent on Unit 0.3.23.1 info` works (no CLI back-reference error)
- [ ] `web4tscomponent on Persistence 0.3.23.1 info` works
- [ ] All 6 compile with zero TS errors
- [ ] UnitCLI additionally has create/classify commands from Unit.prod
