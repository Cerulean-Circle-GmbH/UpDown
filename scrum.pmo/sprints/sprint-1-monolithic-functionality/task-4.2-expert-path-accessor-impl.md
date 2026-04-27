[Back to Sprint 1 Planning](./planning.md)

# Task 4.2: Expert — Implement path accessor helpers

## Status
- [x] Done

## Task Description
Add 2 protected getters to UcpComponent in UCP/0.3.23.1: projectRoot (model.componentRoot 3 levels up) and componentsDirectory (projectRoot + components). Uses import * as path (P21).

## Acceptance Criteria
- [x] protected get projectRoot() at line 220\n- [x] protected get componentsDirectory() at line 229\n- [x] Zero TS errors
