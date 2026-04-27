[Back to Sprint 1 Planning](./planning.md)

# Task 3.1: Expert — Wire @web4x/once to import from extracted components

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Task Description
Update ONCE/0.3.23.1 to import HTTPSServer from @web4x/http, TLSCertificateLoader from @web4x/tls, etc. instead of local copies. Add file: deps to package.json.

## Acceptance Criteria
- [ ] ONCE/0.3.23.1 package.json has all @web4x/* file: deps\n- [ ] Imports rewired to @web4x/* paths\n- [ ] npx tsc compiles with zero errors
