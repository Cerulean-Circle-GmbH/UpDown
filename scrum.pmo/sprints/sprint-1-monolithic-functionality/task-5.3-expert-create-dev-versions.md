[Back to Sprint 1 Planning](./planning.md)

# Task 5.3: Expert — Create 0.3.23.1 dev versions for all components
[subtask:uuid:d1e2f3a4-b5c6-7890-defa-500000000003]

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Task Description
Every component must have both a 0.3.23.0 (frozen extraction) and 0.3.23.1 (dev version for Sprint 1 work). 7 components are missing 0.3.23.1. Create by copying 0.3.23.0 → 0.3.23.1, updating package.json version to "0.3.23-1", removing dist/ and node_modules/.

## Components Missing 0.3.23.1
1. Persistence
2. User
3. CLI
4. ONCE
5. Web4Test
6. Tootsie
7. PDCA
8. IdealMinimalComponent

## Already Have 0.3.23.1
- UCP ✅
- Unit ✅
- Filesystem ✅
- HTTP ✅
- TLS ✅
- Web4TSComponent ✅

## Steps per component
1. `cp -r {Component}/0.3.23.0 {Component}/0.3.23.1`
2. `rm -rf {Component}/0.3.23.1/dist {Component}/0.3.23.1/node_modules {Component}/0.3.23.1/package-lock.json`
3. Update package.json version: "0.3.23-0" → "0.3.23-1"
4. Update file: deps to point to sibling 0.3.23.1 versions (e.g. `../../UCP/0.3.23.1`)
5. `npm install && npx tsc` — zero errors

## Acceptance Criteria
- [ ] All 14 components have 0.3.23.1 directory
- [ ] All package.json versions show "0.3.23-1"
- [ ] All file: deps point to 0.3.23.1 siblings
- [ ] All compile with zero errors
