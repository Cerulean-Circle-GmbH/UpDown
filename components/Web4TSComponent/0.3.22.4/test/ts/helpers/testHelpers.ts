/**
 * Test Helpers - Common test utilities
 *
 * @pdca 2025-10-31-UTC-1230.test-isolation-violation-fix.pdca.md
 *
 * NOTE: v0.3.22.4 is thin wrapper - DefaultWeb4TSComponent removed
 * These helpers are no longer functional but kept for test structure compatibility
 */

import path from 'path';
import { fileURLToPath } from 'url';
// SKIPPED: v0.3.22.4 thin wrapper - DefaultWeb4TSComponent removed, imports from @web4x/once
// import { DefaultWeb4TSComponent } from '../../../src/ts/layer2/DefaultWeb4TSComponent.js';

// ✅ Web4 Pattern: Module-level constants
const currentFileUrl = new URL(import.meta.url);
const currentDir = path.dirname(fileURLToPath(currentFileUrl));
const componentRoot = path.join(currentDir, '../../..');
const testDataPath = path.join(componentRoot, 'test/data');

/**
 * Create a test component with proper test isolation
 * Uses test/data as targetDirectory
 *
 * NOTE: NOT FUNCTIONAL in v0.3.22.4 thin wrapper - returns null
 */
export async function createTestComponent(): Promise<any> {
  // NOTE: v0.3.22.4 thin wrapper - cannot create DefaultWeb4TSComponent instance
  // Tests using this helper should be skipped
  return null;
}

/**
 * Get test data path for test isolation
 */
export function getTestDataPath(): string {
  return testDataPath;
}

/**
 * Get component root path
 */
export function getComponentRoot(): string {
  return componentRoot;
}

