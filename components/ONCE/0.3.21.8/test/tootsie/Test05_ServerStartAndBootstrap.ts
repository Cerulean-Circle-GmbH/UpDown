/**
 * Test 01: Server Start and Bootstrap Validation
 * 
 * Validates that ONCE server starts successfully and creates a valid bootstrap scenario.
 * This is the foundation for all other lifecycle tests.
 * 
 * Black-Box Approach:
 * - Start server via CLI (once.sh startServer)
 * - Observe bootstrap.scenario.json creation
 * - Verify scenario structure and server state
 * - No HTTP calls, no protocol knowledge
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';

export class Test01_ServerStartAndBootstrap extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    
    this.recordEvidence('input', 'Server start test input', {
      componentName: testData?.componentName || 'ONCE',
      version: testData?.version || '0.3.21.8'
    });

    // Step 1: Start ONCE server
    const pid = await this.startONCEServer(
      testData?.componentName,
      testData?.version
    );

    try {
      // Step 2: Read bootstrap scenario (black-box observation)
      const bootstrapPath = `scenarios/ONCE/${testData?.version || '0.3.21.8'}/bootstrap.scenario.json`;
      const bootstrapScenario = this.readScenario(bootstrapPath);

      // Step 3: Validate bootstrap scenario structure
      const validation = {
        scenarioExists: bootstrapScenario !== null,
        hasUUID: !!bootstrapScenario?.uuid,
        hasModel: !!bootstrapScenario?.model,
        serverReady: bootstrapScenario?.model?.serverReady === true,
        hasPort: typeof bootstrapScenario?.model?.port === 'number',
        hasTimestamp: !!bootstrapScenario?.model?.timestamp
      };

      this.recordEvidence('assertion', 'Bootstrap scenario validation', validation);

      // Step 4: Verify all validations passed
      const allValid = Object.values(validation).every(v => v === true);

      if (!allValid) {
        const failures = Object.entries(validation)
          .filter(([_, v]) => v !== true)
          .map(([k, _]) => k);
        throw new Error(`Bootstrap validation failed: ${failures.join(', ')}`);
      }

      return {
        success: true,
        pid,
        bootstrapScenario,
        validation
      };

    } finally {
      // Cleanup: Stop server
      this.stopONCEServer(pid);
    }
  }
}

/**
 * Create test scenario for server start and bootstrap validation
 */
export function createTest01Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-01-server-start',
    name: 'Test 01: Server Start and Bootstrap Validation',
    description: 'Validates ONCE server starts and creates valid bootstrap scenario',
    requirementIORs: [
      'requirement:uuid:once-server-lifecycle-001'
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
      tags: ['lifecycle', 'server', 'critical']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        scenarioExists: true,
        hasUUID: true,
        hasModel: true,
        serverReady: true,
        hasPort: true,
        hasTimestamp: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

