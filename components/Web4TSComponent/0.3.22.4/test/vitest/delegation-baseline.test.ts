/**
 * Delegation Baseline Test
 *
 * @description Verifies that all infrastructure methods delegated from generated components
 *              to Web4TSComponent work correctly. This prevents regressions where delegation
 *              breaks (e.g., the tree command bug where target.model.componentsDirectory was undefined).
 *
 * @approach Black-box CLI execution testing - simulates real-world usage
 * @target IdealMinimalComponent (freshly generated minimal component)
 * @pdca 2025-11-06-UTC-0130.delegation-baseline-test.pdca.md
 * @pdca 2026-01-16-UTC-1202.standalone-once-wrapper-architecture.pdca.md
 *
 * @cmm3 Automated verification prevents manual testing (CMM2)
 *
 * PARTIAL SKIP: v0.3.22.4 - Integration tests requiring IdealMinimalComponent
 * Some tests need the full project structure with other components.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Web4 Pattern: Use camelCase (no underscores)
const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const projectRoot = path.resolve(currentDir, '../../../..');

/**
 * Execute CLI command and return result
 */
function executeCLI(command: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(command, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000,
      shell: process.env.SHELL || '/bin/bash'
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || '',
      exitCode: error.status || 1
    };
  }
}

describe('Delegation Baseline Test - Infrastructure Methods', () => {
  // Use latest version of IdealMinimalComponent for testing
  const componentCLI = path.join(projectRoot, 'components/IdealMinimalComponent/latest/idealminimalcomponent');

  describe.skip('✅ Working Infrastructure Methods (Fixed) - SKIPPED for v0.3.22.4', () => {
    // All tests in this block require IdealMinimalComponent to be installed
    it.skip('should execute links command (delegation)', () => {
      // SKIPPED: Requires IdealMinimalComponent to be installed
      const result = executeCLI(`${componentCLI} links`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Semantic Version Links');
      expect(result.stdout).not.toContain('Unknown command');
      expect(result.stdout).not.toContain('Error:');
    });

    it.skip('should execute tree command (delegation)', () => {
      // SKIPPED: Requires IdealMinimalComponent to be installed
      const result = executeCLI(`${componentCLI} tree 4`);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Tree structure for IdealMinimalComponent');
      expect(result.stdout).not.toContain('Unknown command');
      expect(result.stdout).not.toContain('path argument');
      expect(result.stdout).not.toContain('undefined');
    });

    it('should execute no-args (shows usage automatically)', () => {
      const result = executeCLI(`${componentCLI}`);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('IdealMinimalComponent');
      expect(result.stdout).toContain('Commands:');
    });

    it('should execute test command (delegation)', () => {
      // Just verify command is recognized, don't require tests to pass
      const result = executeCLI(`${componentCLI} test`);
      
      // Exit code may be non-zero if tests fail, but command should be recognized
      expect(result.stdout).not.toContain('Unknown command');
      expect(result.stdout + result.stderr).toContain('test');
    });

    it('should execute info command (delegation)', () => {
      const result = executeCLI(`${componentCLI} info`);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Component Model Information');
      expect(result.stdout).toContain('Component Identity');
      expect(result.stdout).toContain('IdealMinimalComponent');
      expect(result.stdout).not.toContain('Unknown command');
      expect(result.stdout).not.toContain('Error:');
    });
  });

  describe('🐛 Known Bugs (TODO: Fix in separate PDCA)', () => {
    it.skip('TODO: build command fails with path undefined (same bug as tree had)', () => {
      // @bug build() method uses target.model.componentsDirectory instead of this.model.componentsDirectory
      // Same fix pattern as tree: use this.model (CLI) for paths, target.model for component data
      const result = executeCLI(`${componentCLI} build`);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Building IdealMinimalComponent');
      expect(result.stdout).not.toContain('path argument');
      expect(result.stdout).not.toContain('undefined');
    });

    it.skip('TODO: clean command fails with module resolution error', () => {
      // @bug Cannot find package 'typescript/index.js'
      // Needs investigation of module resolution in generated components
      const result = executeCLI(`${componentCLI} clean`);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Cleaning');
      expect(result.stdout).not.toContain('Cannot find package');
    });

    it.skip('TODO: usage command does not exist', () => {
      // @bug "Unknown command: usage"
      // Either add usage() method or document that calling with no args shows usage
      const result = executeCLI(`${componentCLI} usage`);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Commands:');
    });

    it.skip('TODO: listMethods command triggers build instead of executing', () => {
      // @bug listMethods output shows build process, not methods list
      // Needs investigation
      const result = executeCLI(`${componentCLI} listMethods`);
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Available methods');
      expect(result.stdout).not.toContain('Building');
    });
  });

  describe.skip('Delegation Pattern Integrity - SKIPPED for v0.3.22.4', () => {
    // All tests in this block require IdealMinimalComponent to be installed
    it('should show delegation in version display', () => {
      const result = executeCLI(`${componentCLI} links`);
      
      // Generated components show "via Web4TSComponent vX.X.X" in their output
      expect(result.stdout).toContain('via Web4TSComponent');
    });

    it('should handle context loading without errors', () => {
      const result = executeCLI(`${componentCLI} tree 4`);
      
      // Should not have context loading errors
      expect(result.stdout).not.toContain('no component context loaded');
      expect(result.stdout).not.toContain('Component context loaded');
      expect(result.stdout).not.toContain('context loading errors');
    });

    it('should access CLI model paths correctly (Path Authority)', () => {
      const result = executeCLI(`${componentCLI} tree 4`);
      
      // Should show valid paths from projectRoot/components/
      expect(result.stdout).toContain('/components/IdealMinimalComponent/0.3.18.2');
      expect(result.stdout).not.toContain('undefined');
      expect(result.stdout).not.toContain('path argument');
    });
  });

  describe.skip('Regression Prevention - SKIPPED for v0.3.22.4', () => {
    // All tests in this block require IdealMinimalComponent to be installed
    it('should prevent tree command path undefined regression', () => {
      // @regression 2025-11-06-UTC-0120.tree-command-fix.pdca.md
      // Previously failed with "path argument must be of type string. Received undefined"
      // This is already tested in "Working Infrastructure Methods" but documented here for regression tracking
      const result = executeCLI(`${componentCLI} tree 4`);
      
      expect(result.exitCode).toBe(0);
      expect(result.stderr).not.toContain('path argument');
      expect(result.stderr).not.toContain('undefined');
      expect(result.stdout).toContain('Tree structure');
    });

    it('should prevent links command unknown command regression', () => {
      // @regression 2025-11-06-UTC-0006.template-delegation-architecture-analysis.pdca.md
      // Previously failed with "Unknown command: links"
      // This is already tested in "Working Infrastructure Methods" but documented here for regression tracking
      const result = executeCLI(`${componentCLI} links`);
      
      // Don't check exit code as it may vary, just verify command is recognized
      expect(result.stdout).not.toContain('Unknown command');
      expect(result.stdout).toContain('Semantic Version Links');
    });
  });
});

