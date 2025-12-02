/**
 * Test 01: Path Authority and Project Root Detection
 * 
 * ✅ REGRESSION TEST from 0.3.21.5: cli-path-authority.test.ts
 * ✅ RADICAL OOP: Uses Web4Requirement for acceptance criteria
 * 
 * Verifies that ONCE correctly auto-detects:
 * - isTestIsolation (true in test/data, false in production)
 * - projectRoot (UpDown in production, test/data in isolation)
 * - componentRoot (correct component path in both contexts)
 * 
 * Black-Box: Runs `once info` and parses output
 * 
 * @pdca 2025-12-02-UTC-2115.web4requirement-integration.pdca.md
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
    // REQUIREMENT 1: Production Context Path Authority
    // ═══════════════════════════════════════════════════════════════
    
    const productionReq = this.requirement(
      'Production Path Authority',
      'ONCE correctly detects production context'
    );
    
    productionReq.addCriterion('PROD-01', 'isTestIsolation is false in production');
    productionReq.addCriterion('PROD-02', 'projectRoot ends with /UpDown');
    productionReq.addCriterion('PROD-03', 'componentRoot matches expected path');
    productionReq.addCriterion('PROD-04', 'All paths are absolute');
    
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
    
    // Validate acceptance criteria (Radical OOP - no arrow functions)
    productionReq.validateCriterion('PROD-01', prodIsTestIsolation === false, { actual: prodIsTestIsolation });
    productionReq.validateCriterion('PROD-02', prodProjectRoot.endsWith('/UpDown'), { actual: prodProjectRoot });
    productionReq.validateCriterion('PROD-03', prodComponentRoot === componentRoot, { expected: componentRoot, actual: prodComponentRoot });
    productionReq.validateCriterion('PROD-04', prodProjectRoot.startsWith('/') && prodComponentRoot.startsWith('/'), { projectRoot: prodProjectRoot, componentRoot: prodComponentRoot });
    
    // Validate and throw if any criteria failed
    this.validateRequirement(productionReq);
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 2: Test Isolation Context Path Authority
    // ═══════════════════════════════════════════════════════════════
    
    const testIsolationReq = this.requirement(
      'Test Isolation Path Authority',
      'ONCE correctly detects test isolation context'
    );
    
    testIsolationReq.addCriterion('ISO-01', 'isTestIsolation is true in test/data');
    testIsolationReq.addCriterion('ISO-02', 'projectRoot equals test/data directory');
    testIsolationReq.addCriterion('ISO-03', 'componentRoot is within test/data/components');
    testIsolationReq.addCriterion('ISO-04', 'All paths are absolute');
    testIsolationReq.addCriterion('ISO-05', 'TEST ISOLATION MODE warning is shown');
    
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
    
    // Validate acceptance criteria (Radical OOP - no arrow functions)
    testIsolationReq.validateCriterion('ISO-01', testIsTestIsolation === true, { actual: testIsTestIsolation });
    testIsolationReq.validateCriterion('ISO-02', testProjectRoot === testDataDir, { expected: testDataDir, actual: testProjectRoot });
    testIsolationReq.validateCriterion('ISO-03', testComponentRoot.includes('/test/data/components/'), { actual: testComponentRoot });
    testIsolationReq.validateCriterion('ISO-04', testProjectRoot.startsWith('/') && testComponentRoot.startsWith('/'), { projectRoot: testProjectRoot, componentRoot: testComponentRoot });
    testIsolationReq.validateCriterion('ISO-05', testIsolationOutput.includes('TEST ISOLATION MODE'), { outputContains: 'TEST ISOLATION MODE' });
    
    // Validate and throw if any criteria failed
    this.validateRequirement(testIsolationReq);
    
    return {
      success: true,
      requirements: {
        production: productionReq.getCriteria(),
        testIsolation: testIsolationReq.getCriteria()
      },
      production: { projectRoot: prodProjectRoot, componentRoot: prodComponentRoot, isTestIsolation: prodIsTestIsolation },
      testIsolation: { projectRoot: testProjectRoot, componentRoot: testComponentRoot, isTestIsolation: testIsTestIsolation }
    };
  }
}
