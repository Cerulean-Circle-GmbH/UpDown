/**
 * Test 04: Scenario Hibernation and State Persistence
 * 
 * Validates that ONCE scenarios can be hibernated and persisted to disk.
 * Tests the fundamental Web4 principle of hibernatable objects.
 * 
 * Black-Box Approach:
 * - Start server and let it create bootstrap scenario
 * - Send messages to change server state
 * - Observe scenario file updates (state persistence)
 * - Verify scenario contains all state information
 * - No internal state management knowledge required
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';

export class Test04_ScenarioHibernationAndPersistence extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    const testMessages = testData?.testMessages || [
      'Hibernation test message 1',
      'Hibernation test message 2',
      'Hibernation test message 3'
    ];
    
    this.recordEvidence('input', 'Scenario hibernation test input', {
      testMessages,
      componentName: testData?.componentName || 'ONCE',
      version: testData?.version || '0.3.21.8'
    });

    // Step 1: Start ONCE server
    const pid = await this.startONCEServer(
      testData?.componentName,
      testData?.version
    );

    try {
      const scenarioPath = `scenarios/ONCE/${testData?.version || '0.3.21.8'}/bootstrap.scenario.json`;

      // Step 2: Read initial scenario state
      const scenarioBefore = this.readScenario(scenarioPath);
      
      this.recordEvidence('step', 'Initial scenario state captured', {
        scenarioUUID: scenarioBefore?.uuid,
        initialTimestamp: scenarioBefore?.model?.timestamp
      });

      // Step 3: Send multiple messages to change state
      for (let i = 0; i < testMessages.length; i++) {
        this.sendDemoMessage(testMessages[i]);
        
        // Wait a bit between messages
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      this.recordEvidence('step', 'Multiple messages sent to change state', {
        messageCount: testMessages.length
      });

      // Step 4: Wait for final scenario update
      await this.waitForScenarioChange(scenarioPath, 3000);

      // Step 5: Read final scenario state (hibernated state)
      const scenarioAfter = this.readScenario(scenarioPath);
      const finalMessages = scenarioAfter?.model?.demoMessages || [];

      // Step 6: Validate hibernation and persistence
      const validation = {
        scenarioExists: !!scenarioAfter,
        scenarioHasUUID: !!scenarioAfter?.uuid,
        scenarioHasModel: !!scenarioAfter?.model,
        stateWasPersisted: finalMessages.length >= testMessages.length,
        allMessagesPreserved: testMessages.every((msg: string) => 
          finalMessages.some((m: any) => 
            m.text === msg || m.content === msg
          )
        ),
        hasTimestamps: finalMessages.every((m: any) => !!m.timestamp),
        scenarioIsSerializable: this.isValidJSON(JSON.stringify(scenarioAfter))
      };

      this.recordEvidence('assertion', 'Scenario hibernation validation', {
        ...validation,
        messageCountBefore: scenarioBefore?.model?.demoMessages?.length || 0,
        messageCountAfter: finalMessages.length,
        finalMessages
      });

      // Step 7: Verify all validations passed
      const allValid = Object.values(validation).every(v => v === true);

      if (!allValid) {
        const failures = Object.entries(validation)
          .filter(([_, v]) => v !== true)
          .map(([k, _]) => k);
        throw new Error(`Hibernation validation failed: ${failures.join(', ')}`);
      }

      return {
        success: true,
        pid,
        validation,
        finalMessages,
        scenarioSize: JSON.stringify(scenarioAfter).length
      };

    } finally {
      // Cleanup: Stop server
      this.stopONCEServer(pid);
    }
  }

  /**
   * Validate that a string is valid JSON
   */
  private isValidJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create test scenario for hibernation and persistence validation
 */
export function createTest04Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-04-hibernation',
    name: 'Test 04: Scenario Hibernation and State Persistence',
    description: 'Validates ONCE scenarios are hibernatable and state is persisted to disk',
    requirementIORs: [
      'requirement:uuid:once-hibernation-001',
      'requirement:uuid:once-state-persistence-001'
    ],
    componentIORs: [
      'component:once:0.3.21.8'
    ],
    testDataScenario: {
      componentName: 'ONCE',
      version: '0.3.21.8',
      testMessages: [
        'Hibernation test: State persistence check 1',
        'Hibernation test: State persistence check 2',
        'Hibernation test: State persistence check 3'
      ]
    },
    executionContextScenario: {
      timeout: 25000,
      cleanup: true,
      tags: ['lifecycle', 'hibernation', 'persistence', 'critical']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        scenarioExists: true,
        scenarioHasUUID: true,
        scenarioHasModel: true,
        stateWasPersisted: true,
        allMessagesPreserved: true,
        hasTimestamps: true,
        scenarioIsSerializable: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

