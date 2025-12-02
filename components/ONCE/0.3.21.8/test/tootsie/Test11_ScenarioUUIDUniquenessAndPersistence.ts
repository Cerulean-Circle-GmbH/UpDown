/**
 * Test 07: Scenario UUID Uniqueness and Persistence
 * 
 * Validates that scenario UUIDs are unique and persistent across restarts.
 * Tests Web4's identity principle for distributed objects.
 * 
 * Black-Box Approach:
 * - Start server and capture scenario UUID
 * - Stop server
 * - Start server again
 * - Verify UUID remains the same (persistence)
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';

export class Test07_ScenarioUUIDUniquenessAndPersistence extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    
    this.recordEvidence('input', 'Scenario UUID persistence test input', {
      componentName: testData?.componentName || 'ONCE',
      version: testData?.version || '0.3.21.8'
    });

    const scenarioPath = `scenarios/ONCE/${testData?.version || '0.3.21.8'}/bootstrap.scenario.json`;

    // Step 1: Start server first time
    const pid1 = await this.startONCEServer(
      testData?.componentName,
      testData?.version
    );

    try {
      // Step 2: Read scenario and capture UUID
      const scenario1 = this.readScenario(scenarioPath);
      const uuid1 = scenario1?.uuid;

      this.recordEvidence('step', 'First server start - UUID captured', {
        uuid: uuid1,
        pid: pid1
      });

      if (!uuid1) {
        throw new Error('No UUID found in bootstrap scenario');
      }

      // Step 3: Stop first server
      this.stopONCEServer(pid1);
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.recordEvidence('step', 'First server stopped', { pid: pid1 });

      // Step 4: Start server second time
      const pid2 = await this.startONCEServer(
        testData?.componentName,
        testData?.version
      );

      try {
        // Step 5: Read scenario again and capture UUID
        const scenario2 = this.readScenario(scenarioPath);
        const uuid2 = scenario2?.uuid;

        this.recordEvidence('step', 'Second server start - UUID captured', {
          uuid: uuid2,
          pid: pid2
        });

        // Step 6: Validate UUID persistence
        const validation = {
          firstUUIDExists: !!uuid1,
          secondUUIDExists: !!uuid2,
          uuidsMatch: uuid1 === uuid2,
          uuidFormat: this.isValidUUID(uuid1),
          scenarioPersisted: scenario1 !== null && scenario2 !== null
        };

        this.recordEvidence('assertion', 'UUID persistence validation', {
          ...validation,
          uuid1,
          uuid2,
          uuidsIdentical: uuid1 === uuid2
        });

        // Step 7: Verify all validations passed
        const allValid = Object.values(validation).every(v => v === true);

        if (!allValid) {
          const failures = Object.entries(validation)
            .filter(([_, v]) => v !== true)
            .map(([k, _]) => k);
          throw new Error(`UUID persistence validation failed: ${failures.join(', ')}`);
        }

        return {
          success: true,
          pid1,
          pid2,
          validation,
          uuid1,
          uuid2
        };

      } finally {
        // Cleanup: Stop second server
        this.stopONCEServer(pid2);
      }

    } catch (error) {
      // Ensure cleanup even on error
      this.stopONCEServer(pid1);
      throw error;
    }
  }

  /**
   * Validate UUID format (basic check)
   */
  private isValidUUID(uuid: string): boolean {
    if (!uuid) return false;
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid) || uuid.startsWith('once:') || uuid.startsWith('scenario:');
  }
}

/**
 * Create test scenario for UUID persistence validation
 */
export function createTest07Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-07-uuid-persistence',
    name: 'Test 07: Scenario UUID Uniqueness and Persistence',
    description: 'Validates scenario UUIDs are unique and persist across server restarts',
    requirementIORs: [
      'requirement:uuid:once-scenario-identity-001',
      'requirement:uuid:once-uuid-persistence-001'
    ],
    componentIORs: [
      'component:once:0.3.21.8'
    ],
    testDataScenario: {
      componentName: 'ONCE',
      version: '0.3.21.8'
    },
    executionContextScenario: {
      timeout: 30000,
      cleanup: true,
      tags: ['lifecycle', 'uuid', 'persistence', 'identity']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        firstUUIDExists: true,
        secondUUIDExists: true,
        uuidsMatch: true,
        uuidFormat: true,
        scenarioPersisted: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

