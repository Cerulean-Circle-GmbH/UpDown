# Test Configuration Documentation

## Overview
This document uniquely defines the current test configuration and exclusions for the UpDown project, following CMM Level 3+ principles with no ambiguities.

## Current Test Setup (2025-08-06)

### Vitest Configuration
- **Test Runner**: Vitest v3.2.4
- **Configuration File**: `vitest.config.ts`
- **Test Environment**: Node.js
- **Module System**: ESM (ES Modules)

### Exclusions (Unique Definition)
The following directories and files are excluded from test execution until the first task is created to change this behavior:

1. **Source Code Directory**: `src/**`
2. **Legacy Test Files**: 
   - `**/*.mocha.test.js`
   - `**/*.mocha.test.ts`
3. **External Project Directories**:
   - `**/Web4*/**`
   - `**/Once*/**`
   - `**/tssh*/**`
4. **Build Artifacts**:
   - `**/node_modules/**`
   - `**/dist/**`
   - `**/build/**`

### Inclusions (Unique Definition)
Only the following test files are included in test execution:

1. **Unit Tests**: `tests/unit/**/*.test.ts`
2. **Unit Tests**: `tests/unit/**/*.test.js`

### Rationale
This configuration ensures clean test runs focused on new unit tests while excluding legacy files that cause failures. The exclusion of `src/` directory is temporary until the first task is created to change this behavior.

### Change Management
Any changes to this configuration must be:
1. Documented in this file
2. Referenced in relevant process files
3. Tested and validated before deployment
4. Approved through the established QA review process

## References
- `vitest.config.ts` - Implementation of this configuration
- Process files reference this document for test setup details 