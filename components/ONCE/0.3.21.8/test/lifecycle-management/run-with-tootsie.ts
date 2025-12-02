#!/usr/bin/env node
/**
 * Tootsie Test Runner - Demonstrates running ONCE tests with Tootsie Quality Oracle
 * 
 * This is the Web4 way: tests are objects with consciousness, not functions
 * Quality is an object that assesses, learns, and evolves
 * 
 * ✅ RADICAL OOP: Everything is an object with behavior
 * ✅ EVIDENCE-BASED: Complete evidence trail recorded
 * ✅ CONSCIOUSNESS: Quality Oracle learns and evolves from each test
 * ✅ HIBERNATABLE: Tests and quality state persist across runs
 * 
 * @example
 * ```bash
 * # Run Test01 with Tootsie
 * cd components/ONCE/0.3.21.8/test/lifecycle-management
 * npx tsx run-with-tootsie.ts
 * ```
 */

import { Test01_PathAuthorityAndProjectRootDetection, createTest01Scenario } from './Test01_PathAuthorityAndProjectRootDetection.js';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Main execution - Tootsie orchestrates the test run
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎯 Tootsie Test Runner - ONCE Lifecycle Test 01');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: CREATE THE TEST OBJECT (Not a function, an OBJECT!)
  // ═══════════════════════════════════════════════════════════════
  
  console.log('📦 Step 1: Creating Test01 object...');
  
  const test = new Test01_PathAuthorityAndProjectRootDetection();
  const testScenario = createTest01Scenario();
  test.init(testScenario);
  
  console.log(`✅ Test object created: ${testScenario.name}`);
  console.log(`   UUID: ${test.getUUID()}`);
  console.log(`   Requirements: ${test.getRequirementIORs().join(', ')}`);
  console.log(`   Components: ${test.getComponentIORs().join(', ')}\n`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: EXECUTE THE TEST (Behavior, not function call)
  // ═══════════════════════════════════════════════════════════════
  
  console.log('🚀 Step 2: Executing test...');
  console.log('─────────────────────────────────────────────────────────────\n');
  
  const execution = await test.execute();
  
  console.log('\n─────────────────────────────────────────────────────────────');
  console.log(`📊 Test execution completed: ${execution.status}`);
  console.log(`   Execution ID: ${execution.executionId}`);
  console.log(`   Duration: ${execution.performanceMetrics.executionTimeMs}ms`);
  console.log(`   Memory: ${execution.performanceMetrics.memoryUsageMB.toFixed(2)}MB`);
  console.log(`   Evidence count: ${execution.evidenceScenarios.length}\n`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: QUALITY ASSESSMENT (In full Tootsie, Oracle would judge)
  // ═══════════════════════════════════════════════════════════════
  
  console.log('⚖️ Step 3: Quality assessment...');
  
  // Simplified quality check - full Tootsie integration would use QualityOracle
  const qualityScore = execution.status === 'passed' ? 1.0 : 0.0;
  const confidence = execution.evidenceScenarios.length > 5 ? 0.95 : 0.70;
  
  console.log(`   Quality score: ${(qualityScore * 100).toFixed(1)}%`);
  console.log(`   Confidence: ${(confidence * 100).toFixed(1)}%`);
  console.log(`   Evidence analyzed: ${execution.evidenceScenarios.length} pieces\n`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 4: HIBERNATE TEST STATE (Persistence for next run)
  // ═══════════════════════════════════════════════════════════════
  
  console.log('💤 Step 4: Hibernating test state...');
  
  const stateDir = path.join(process.cwd(), 'test', 'data', '.tootsie');
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
  }
  
  const statePath = path.join(stateDir, 'test01-state.json');
  const testState = {
    testScenario: test.toScenario(),
    lastExecution: execution,
    lastRun: new Date().toISOString(),
    runCount: 1,
    qualityScore,
    confidence
  };
  
  fs.writeFileSync(statePath, JSON.stringify(testState, null, 2));
  
  console.log(`   Test state saved: ${statePath}`);
  console.log(`   Test UUID: ${test.getUUID()}\n`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 5: EVIDENCE REPORT (Complete audit trail)
  // ═══════════════════════════════════════════════════════════════
  
  console.log('📋 Step 5: Evidence Report');
  console.log('─────────────────────────────────────────────────────────────');
  
  execution.evidenceScenarios.forEach((evidence, index) => {
    console.log(`\n[${index + 1}] ${evidence.type.toUpperCase()}: ${evidence.description}`);
    console.log(`    Time: ${evidence.timestamp}`);
    if (evidence.data && Object.keys(evidence.data).length > 0) {
      console.log(`    Data:`, JSON.stringify(evidence.data, null, 6).split('\n').slice(1, -1).join('\n'));
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // FINAL STATUS
  // ═══════════════════════════════════════════════════════════════
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  if (execution.status === 'passed') {
    console.log('✅ TEST PASSED - Quality Assessment Complete');
  } else {
    console.log('❌ TEST FAILED - Needs Investigation');
    if (execution.errorDetails) {
      console.log(`   Error: ${execution.errorDetails}`);
    }
  }
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('💡 **Next Steps:**');
  console.log('   - For full Tootsie integration, see components/Tootsie/0.3.20.6/');
  console.log('   - QualityOracle provides consciousness-level quality assessment');
  console.log('   - Tests can be hibernated/restored across test runs');
  console.log('   - Quality evidence accumulates for long-term analysis\n');

  // Exit with appropriate code
  process.exit(execution.status === 'passed' ? 0 : 1);
}

// Run it!
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
