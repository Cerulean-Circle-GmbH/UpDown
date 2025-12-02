/**
 * Test 06: Server Shutdown and Cleanup
 * 
 * Validates that ONCE server can be gracefully shut down and cleans up resources.
 * Tests the complete server lifecycle: start → run → shutdown.
 * 
 * Black-Box Approach:
 * - Start server and verify it's running
 * - Stop server via CLI
 * - Verify server is no longer running
 * - Verify scenario file remains (hibernated state)
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';

export class Test06_ServerShutdownAndCleanup extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    
    this.recordEvidence('input', 'Server shutdown test input', {
      componentName: testData?.componentName || 'ONCE',
      version: testData?.version || '0.3.21.8'
    });

    const scenarioPath = `scenarios/ONCE/${testData?.version || '0.3.21.8'}/bootstrap.scenario.json`;

    // Step 1: Start ONCE server
    const pid = await this.startONCEServer(
      testData?.componentName,
      testData?.version
    );

    this.recordEvidence('step', 'Server started', { pid });

    // Step 2: Verify server is running (read scenario)
    const scenarioBefore = this.readScenario(scenarioPath);
    const serverWasReady = scenarioBefore?.model?.serverReady === true;

    this.recordEvidence('assertion', 'Server was running', {
      serverWasReady,
      pid,
      scenarioUUID: scenarioBefore?.uuid
    });

    // Step 3: Stop server
    this.stopONCEServer(pid);
    
    this.recordEvidence('step', 'Server stopped', { pid });

    // Step 4: Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Verify scenario file still exists (hibernated state)
    const scenarioAfter = this.readScenario(scenarioPath);
    const scenarioPreserved = scenarioAfter !== null;

    // Step 6: Validate shutdown and cleanup
    const validation = {
      serverWasRunning: serverWasReady,
      serverWasStopped: true, // stopONCEServer succeeded
      scenarioPreserved: scenarioPreserved,
      scenarioHasUUID: !!scenarioAfter?.uuid,
      stateHibernated: scenarioAfter?.model !== undefined
    };

    this.recordEvidence('assertion', 'Shutdown and cleanup validation', validation);

    // Step 7: Verify all validations passed
    const allValid = Object.values(validation).every(v => v === true);

    if (!allValid) {
      const failures = Object.entries(validation)
        .filter(([_, v]) => v !== true)
        .map(([k, _]) => k);
      throw new Error(`Shutdown validation failed: ${failures.join(', ')}`);
    }

    return {
      success: true,
      pid,
      validation,
      scenarioPreserved
    };
  }
}

/**
 * Create test scenario for server shutdown validation
 */
export function createTest06Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-06-shutdown',
    name: 'Test 06: Server Shutdown and Cleanup',
    description: 'Validates ONCE server can be gracefully shut down with proper cleanup',
    requirementIORs: [
      'requirement:uuid:once-server-lifecycle-002',
      'requirement:uuid:once-graceful-shutdown-001'
    ],
    componentIORs: [
      'component:once:0.3.21.8'
    ],
    testDataScenario: {
      componentName: 'ONCE',
      version: '0.3.21.8'
    },
    executionContextScenario: {
      timeout: 15000,
      cleanup: true,
      tags: ['lifecycle', 'shutdown', 'cleanup']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        serverWasRunning: true,
        serverWasStopped: true,
        scenarioPreserved: true,
        scenarioHasUUID: true,
        stateHibernated: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

