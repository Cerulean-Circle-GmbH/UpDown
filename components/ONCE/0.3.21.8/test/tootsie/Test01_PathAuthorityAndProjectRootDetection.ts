/**
 * Test 01: Path Authority and Project Root Detection
 * 
 * ✅ REGRESSION TEST from 0.3.21.5: cli-path-authority.test.ts
 * 
 * Verifies that ONCE correctly auto-detects:
 * - isTestIsolation (true in test/data, false in production)
 * - projectRoot (UpDown in production, test/data in isolation)
 * - componentRoot (correct component path in both contexts)
 * 
 * Black-Box: Runs `once info` and parses output
 */

import { ONCETestCase } from './ONCETestCase.js';

export class Test01_PathAuthorityAndProjectRootDetection extends ONCETestCase {

  protected async executeTestLogic(): Promise<any> {
    const componentRoot = this.getComponentRoot();
    const version = this.getONCEVersion();
    const testDataDir = this.getTestDataDir();
    
    this.logEvidence('input', 'Path authority regression test', {
      componentRoot,
      version,
      testDataDir
    });

    // ═══════════════════════════════════════════════════════════════
    // TEST 1: Production Context - isTestIsolation should be FALSE
    // ═══════════════════════════════════════════════════════════════
    
    this.logEvidence('step', 'Testing production context');
    
    const productionOutput = this.runOnceCLI('info');
    
    // Parse PATH DISCOVERY line
    const productionMatch = productionOutput.match(
      /\[PATH DISCOVERY\] componentRoot=([^\s]+) projectRoot=([^\s]+) isTestIsolation=(true|false)/
    );
    
    if (!productionMatch) {
      throw new Error('Could not parse PATH DISCOVERY from production once info');
    }
    
    const prodComponentRoot = productionMatch[1];
    const prodProjectRoot = productionMatch[2];
    const prodIsTestIsolation = productionMatch[3] === 'true';
    
    this.logEvidence('output', 'Production context detected', {
      componentRoot: prodComponentRoot,
      projectRoot: prodProjectRoot,
      isTestIsolation: prodIsTestIsolation
    });
    
    // Assertions for production using Chai expect syntax
    this.assert('Production isTestIsolation is false', () => {
      this.expect(prodIsTestIsolation).to.be.false;
    });
    
    this.assert('Production projectRoot ends with /UpDown', () => {
      this.expect(prodProjectRoot).to.match(/\/UpDown$/);
    });
    
    this.assert('Production componentRoot matches expected', () => {
      this.expect(prodComponentRoot).to.equal(componentRoot);
    });
    
    this.assert('Production paths are absolute', () => {
      this.expect(prodProjectRoot).to.match(/^\//);
      this.expect(prodComponentRoot).to.match(/^\//);
    });
    
    const productionValid = {
      isTestIsolationFalse: true,
      projectRootIsUpDown: true,
      componentRootCorrect: true,
      pathsAreAbsolute: true
    };
    
    // ═══════════════════════════════════════════════════════════════
    // TEST 2: Test Isolation Context - isTestIsolation should be TRUE
    // ═══════════════════════════════════════════════════════════════
    
    this.logEvidence('step', 'Testing test isolation context');
    
    // Ensure test isolation is set up
    await this.ensureTestIsolation();
    
    // Run once info from test/data
    const testIsolationOutput = this.runOnceCLIInTestIsolation('info');
    
    // Parse PATH DISCOVERY line
    const testMatch = testIsolationOutput.match(
      /\[PATH DISCOVERY\] componentRoot=([^\s]+) projectRoot=([^\s]+) isTestIsolation=(true|false)/
    );
    
    if (!testMatch) {
      throw new Error('Could not parse PATH DISCOVERY from test isolation once info');
    }
    
    const testComponentRoot = testMatch[1];
    const testProjectRoot = testMatch[2];
    const testIsTestIsolation = testMatch[3] === 'true';
    
    this.logEvidence('output', 'Test isolation context detected', {
      componentRoot: testComponentRoot,
      projectRoot: testProjectRoot,
      isTestIsolation: testIsTestIsolation
    });
    
    // Assertions for test isolation using Chai expect syntax
    this.assert('Test isolation isTestIsolation is true', () => {
      this.expect(testIsTestIsolation).to.be.true;
    });
    
    this.assert('Test isolation projectRoot is test/data', () => {
      this.expect(testProjectRoot).to.equal(testDataDir);
    });
    
    this.assert('Test isolation componentRoot is in test/data', () => {
      this.expect(testComponentRoot).to.include('/test/data/components/');
    });
    
    this.assert('Test isolation paths are absolute', () => {
      this.expect(testProjectRoot).to.match(/^\//);
      this.expect(testComponentRoot).to.match(/^\//);
    });
    
    this.assert('Test isolation warning is shown', () => {
      this.expect(testIsolationOutput).to.include('TEST ISOLATION MODE');
    });
    
    const testIsolationValid = {
      isTestIsolationTrue: true,
      projectRootIsTestData: true,
      componentRootInTestData: true,
      pathsAreAbsolute: true,
      testIsolationWarningShown: true
    };
    
    return {
      success: true,
      production: { projectRoot: prodProjectRoot, componentRoot: prodComponentRoot, isTestIsolation: prodIsTestIsolation, validation: productionValid },
      testIsolation: { projectRoot: testProjectRoot, componentRoot: testComponentRoot, isTestIsolation: testIsTestIsolation, validation: testIsolationValid }
    };
  }
}
