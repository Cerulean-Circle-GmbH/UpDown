/**
 * ONCETestCase - Base test case for ONCE component regression tests
 * 
 * ✅ Minimal base class for Tootsie-based regression tests
 * ✅ Version-agnostic using path-based version detection
 * ✅ Tests existing functionality - does NOT reimplement
 * ✅ Radical OOP: Uses Web4Requirement for acceptance criteria (not arrow functions)
 * 
 * @pdca 2025-12-02-UTC-2115.web4requirement-integration.pdca.md
 */

import { DefaultWeb4TestCase } from '../../../../Web4Test/0.3.20.6/dist/ts/layer2/DefaultWeb4TestCase.js';
import { TestScenario } from '../../../../Web4Test/0.3.20.6/dist/ts/layer3/TestScenario.js';
import { DefaultWeb4Requirement } from '../../../../Web4Requirement/0.3.20.6/dist/ts/layer2/DefaultWeb4Requirement.js';
import { Web4Requirement } from '../../../../Web4Requirement/0.3.20.6/dist/ts/layer3/Web4Requirement.interface.js';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { expect as chaiExpect } from 'chai';

export abstract class ONCETestCase extends DefaultWeb4TestCase {
  
  constructor() {
    super();
  }

  // ═══════════════════════════════════════════════════════════════
  // VERSION-AGNOSTIC HELPERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get ONCE version from file location (Version Authority pattern)
   */
  protected getONCEVersion(): string {
    const currentFilePath = fileURLToPath(import.meta.url);
    const testDir = path.dirname(currentFilePath);
    const testRoot = path.dirname(testDir);
    const versionDir = path.dirname(testRoot);
    return path.basename(versionDir);
  }

  /**
   * Get component root dynamically
   */
  protected getComponentRoot(): string {
    const currentFilePath = fileURLToPath(import.meta.url);
    const testDir = path.dirname(currentFilePath);
    const testRoot = path.dirname(testDir);
    return path.dirname(testRoot);
  }

  /**
   * Get test data directory
   */
  protected getTestDataDir(): string {
    return path.join(this.getComponentRoot(), 'test', 'data');
  }

  // ═══════════════════════════════════════════════════════════════
  // CLI HELPERS (Black-Box Testing)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Run once CLI command and return output
   */
  protected runOnceCLI(command: string, options?: { cwd?: string }): string {
    const componentRoot = this.getComponentRoot();
    const onceExec = path.join(componentRoot, 'once');
    const cwd = options?.cwd || componentRoot;
    
    return execSync(`"${onceExec}" ${command} 2>&1`, {
      encoding: 'utf8',
      cwd
    });
  }

  /**
   * Run once CLI from test/data (test isolation context)
   */
  protected runOnceCLIInTestIsolation(command: string): string {
    const testDataDir = this.getTestDataDir();
    const onceExec = path.join(testDataDir, 'scripts', 'once');
    
    return execSync(`"${onceExec}" ${command} 2>&1`, {
      encoding: 'utf8',
      cwd: testDataDir
    });
  }

  /**
   * Ensure test isolation is set up
   */
  protected async ensureTestIsolation(): Promise<void> {
    const testDataDir = this.getTestDataDir();
    const scriptsOnce = path.join(testDataDir, 'scripts', 'once');
    
    if (!fs.existsSync(scriptsOnce)) {
      this.logEvidence('step', 'Setting up test isolation');
      this.runOnceCLI('test shell');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HTTP HELPERS (Black-Box Testing)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Check if server is healthy via HTTP
   */
  protected async checkServerHealth(port: number, timeout: number = 1000): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port,
        path: '/health',
        method: 'GET',
        timeout
      }, (res) => {
        resolve(res.statusCode === 200);
      });
      
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  }

  /**
   * Wait for server to be ready
   */
  protected async waitForServer(port: number, maxWaitMs: number = 10000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      if (await this.checkServerHealth(port)) {
        return true;
      }
      await this.sleep(500);
    }
    return false;
  }

  /**
   * HTTP GET request
   */
  protected async httpGet(url: string): Promise<{ status: number; body: string }> {
    return new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode || 0, body }));
      }).on('error', reject);
    });
  }

  /**
   * HTTP POST request
   */
  protected async httpPost(url: string, data?: any): Promise<{ status: number; body: string }> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const req = http.request({
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers: data ? { 'Content-Type': 'application/json' } : {}
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode || 0, body }));
      });
      
      req.on('error', reject);
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITY HELPERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Sleep for specified milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log evidence (wrapper for parent's recordEvidence)
   */
  protected logEvidence(type: string, description: string, data?: any): void {
    console.log(`[${new Date().toISOString()}][${type.toUpperCase()}] ${description}:`, 
      data ? JSON.stringify(data, null, 2) : '');
  }

  // ═══════════════════════════════════════════════════════════════
  // RADICAL OOP WEB4REQUIREMENT
  // ═══════════════════════════════════════════════════════════════
  // 
  // ✅ Replaces arrow function assertions with Web4Requirement objects
  // ✅ Acceptance criteria are objects, not functions
  // 
  // Usage:
  //   const req = this.requirement('Path Authority', 'Verify path detection');
  //   req.addCriterion('AC-01', 'isTestIsolation is false in production');
  //   req.addCriterion('AC-02', 'projectRoot ends with /UpDown');
  //   req.validateCriterion('AC-01', isTestIsolation === false);
  //   req.validateCriterion('AC-02', projectRoot.endsWith('/UpDown'));
  //   if (!req.allCriteriaPassed()) throw new Error(req.generateReport());

  /**
   * Create a Web4Requirement for acceptance criteria validation
   * 
   * @example
   * const req = this.requirement('Path Authority', 'Verify path detection');
   * req.addCriterion('AC-01', 'isTestIsolation is false');
   * req.validateCriterion('AC-01', isTestIsolation === false, { actual: isTestIsolation });
   */
  protected requirement(name: string, description: string): Web4Requirement {
    const req = new DefaultWeb4Requirement();
    req.model.name = name;
    req.model.description = description;
    req.model.uuid = crypto.randomUUID();
    this.logEvidence('requirement', `📋 ${name}: ${description}`);
    return req;
  }

  /**
   * Validate a requirement and throw if any criteria failed
   * Logs the full report as evidence
   */
  protected validateRequirement(req: Web4Requirement): void {
    const report = req.generateReport();
    this.logEvidence('requirement-report', report);
    
    if (!req.allCriteriaPassed()) {
      const failed = req.getFailedCriteria();
      throw new Error(`Requirement failed: ${failed.map(c => `${c.id}: ${c.description}`).join(', ')}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // RADICAL OOP CHAI ASSERTIONS (Legacy Support)
  // ═══════════════════════════════════════════════════════════════
  // 
  // Wraps Chai's expect() in Radical OOP pattern with evidence logging.
  // Usage: this.expect(value).to.equal(expected)
  // 
  // The assertion is logged as evidence for Tootsie quality tracking.
  //
  // ⚠️ DEPRECATED: Prefer Web4Requirement for new tests

  /**
   * Radical OOP expect() - Chai syntax with evidence logging
   * 
   * @deprecated Use this.requirement() for Radical OOP acceptance criteria
   * 
   * @example
   * this.expect(isTestIsolation).to.be.false;
   * this.expect(projectRoot).to.include('/UpDown');
   * this.expect(response.status).to.equal(200);
   */
  protected expect(value: any, description?: string): Chai.Assertion {
    // Log the expectation as evidence
    if (description) {
      this.logEvidence('expect', description, { value });
    }
    return chaiExpect(value);
  }

  /**
   * Radical OOP assertion with automatic evidence logging
   * 
   * @deprecated Use this.requirement() for Radical OOP acceptance criteria
   * 
   * @example
   * this.assert('Production isTestIsolation is false', () => {
   *   this.expect(isTestIsolation).to.be.false;
   * });
   */
  protected assert(description: string, assertion: () => void): void {
    try {
      assertion();
      this.logEvidence('assertion', `✅ ${description}`, { passed: true });
    } catch (error: any) {
      this.logEvidence('assertion', `❌ ${description}`, { 
        passed: false, 
        error: error.message 
      });
      throw error;
    }
  }
}
