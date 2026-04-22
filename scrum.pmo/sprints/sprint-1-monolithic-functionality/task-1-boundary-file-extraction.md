[Back to Sprint 1 Planning](./planning.md)

# Task 1: Boundary File Extraction
[task:uuid:b1c2d3e4-f5a6-7890-bcde-200000000001]

## Status
- [ ] Planned
- [ ] In Progress
  - [ ] refinement
  - [ ] creating test cases
  - [ ] implementing
  - [ ] testing
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000001](./requirements.md) (R1)
    - [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000002](./requirements.md) (R2)
    - [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000006](./requirements.md) (R6)
  - down
    - [Task 1.1: Expert — HTTPSServer to @web4x/http](./task-1.1-expert-httpsserver-extraction.md)
    - [Task 1.2: Expert — StaticFileRoute to @web4x/http](./task-1.2-expert-staticfileroute-extraction.md)
    - [Task 1.3: Expert — ACMEChallengeRoute to @web4x/tls](./task-1.3-expert-acme-route-extraction.md)
    - [Task 1.4: Expert — FileOrchestrator to @web4x/filesystem](./task-1.4-expert-fileorchestrator-extraction.md)
    - [Task 1.5: Expert — ProxyRoute + ReverseProxyRoute to @web4x/http](./task-1.5-expert-proxy-routes-extraction.md)
    - [Task 1.6: Tester — Verify all extractions compile clean](./task-1.6-tester-extraction-verification.md)

## Task Description
Extract all "boundary files" identified in the loss report to their natural standalone component. These are files that exist in ONCE 0.3.22.2 but were deferred during Phase 3-4 due to cross-cutting dependencies.

## Context
The loss report identified ~20 files not properly placed. This task addresses the HIGH and MEDIUM priority items:
- HTTPSServer.ts → @web4x/http (add @web4x/tls dep)
- StaticFileRoute.ts → @web4x/http (add @web4x/filesystem dep)
- ACMEChallengeRoute.ts → @web4x/tls (add @web4x/http dep)
- FileOrchestrator.ts → @web4x/filesystem
- ProxyRoute.ts + ReverseProxyRoute.ts + HeaderRewriter.ts + HrefRewriter.ts → @web4x/http

## Intention
After this task, the standalone components contain ALL the files they logically own. The only files remaining in @web4x/once are truly ONCE-specific (kernel, WebSocket, views, ScenarioManager).

## Steps
1. Add `@web4x/tls` as dependency to @web4x/http package.json
2. Copy HTTPSServer.ts to HTTP/0.3.23.1/src/ts/layer2/, rewire TLS import to @web4x/tls
3. Copy StaticFileRoute.ts to HTTP/0.3.23.1/src/ts/layer2/
4. Add `@web4x/http` as dependency to @web4x/tls package.json
5. Copy ACMEChallengeRoute.ts to TLS/0.3.23.1/src/ts/layer2/, rewire Route import to @web4x/http
6. Copy FileOrchestrator.ts to Filesystem/0.3.23.1/src/ts/layer4/
7. Copy ProxyRoute.ts, ReverseProxyRoute.ts, HeaderRewriter.ts, HrefRewriter.ts to HTTP/0.3.23.1/
8. Build all affected components — zero errors
9. Tester verifies compilation and import paths

## Acceptance Criteria
- [ ] `cd HTTP/0.3.23.1 && npx tsc` — zero errors, HTTPSServer.js in dist/
- [ ] `cd TLS/0.3.23.1 && npx tsc` — zero errors, ACMEChallengeRoute.js in dist/
- [ ] `cd Filesystem/0.3.23.1 && npx tsc` — zero errors, FileOrchestrator.js in dist/
- [ ] `grep '@web4x/tls' HTTP/0.3.23.1/src/ts/layer2/HTTPSServer.ts` shows import from @web4x/tls
- [ ] `grep '@web4x/http' TLS/0.3.23.1/src/ts/layer2/AutomaticCertificateManagementEnvironmentChallengeRoute.ts` shows import from @web4x/http
- [ ] No file in the loss report remains unaddressed

## QA Audit & User Feedback
- [ ] [2026-04-21] QA review pending
  - [ ] Issue: Loss report items resolved?
  - [ ] Resolution: pending
