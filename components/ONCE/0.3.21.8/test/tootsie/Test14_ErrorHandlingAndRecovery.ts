/**
 * Test 10: Error Handling and Recovery
 * 
 * Validates that ONCE handles errors gracefully and can recover.
 * Tests resilience and error reporting mechanisms.
 * 
 * Black-Box Approach:
 * - Send invalid commands/messages
 * - Observe error handling behavior
 * - Verify server remains responsive after errors
 * - Verify error information is preserved
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';

export class Test10_ErrorHandlingAndRecovery extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    
    this.recordEvidence('input', 'Error handling test input', {
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

      // Step 2: Verify server is working normally
      const scenarioBefore = this.readScenario(scenarioPath);
      const serverReadyBefore = scenarioBefore?.model?.serverReady === true;

      this.recordEvidence('step', 'Server initially ready', {
        serverReady: serverReadyBefore
      });

      // Step 3: Try to invoke invalid commands (expect graceful failure)
      let invalidCommandError = null;
      try {
        this.invokeONCECLI('nonexistentCommand123');
      } catch (error) {
        invalidCommandError = error;
        this.recordEvidence('step', 'Invalid command handled gracefully', {
          error: error instanceof Error ? error.message : String(error)
        });
      }

      // Step 4: Send a valid message to verify server is still responsive
      const recoveryMessage = 'Recovery test: Server should still work';
      this.sendDemoMessage(recoveryMessage);

      this.recordEvidence('step', 'Valid message sent after error', {
        message: recoveryMessage
      });

      // Step 5: Wait for scenario update
      await this.waitForScenarioChange(scenarioPath, 3000);

      // Step 6: Verify server recovered and processed the message
      const scenarioAfter = this.readScenario(scenarioPath);
      const serverReadyAfter = scenarioAfter?.model?.serverReady === true;
      const messages = scenarioAfter?.model?.demoMessages || [];
      const recoveryMessageFound = messages.some((m: any) => {
        const text = m.text || m.content || '';
        return text.includes(recoveryMessage) || text === recoveryMessage;
      });

      // Step 7: Validate error handling and recovery
      const validation = {
        serverWasReadyBefore: serverReadyBefore,
        invalidCommandRejected: invalidCommandError !== null,
        serverStillReadyAfter: serverReadyAfter,
        serverProcessedValidMessage: recoveryMessageFound,
        serverRecovered: serverReadyAfter && recoveryMessageFound
      };

      this.recordEvidence('assertion', 'Error handling and recovery validation', {
        ...validation,
        messagesCount: messages.length
      });

      // Step 8: Verify all validations passed
      const allValid = Object.values(validation).every(v => v === true);

      if (!allValid) {
        const failures = Object.entries(validation)
          .filter(([_, v]) => v !== true)
          .map(([k, _]) => k);
        throw new Error(`Error handling validation failed: ${failures.join(', ')}`);
      }

      return {
        success: true,
        pid,
        validation,
        recoveryMessageFound
      };

    } finally {
      // Cleanup: Stop server
      this.stopONCEServer(pid);
    }
  }
}

/**
 * Create test scenario for error handling validation
 */
export function createTest10Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-10-error-handling',
    name: 'Test 10: Error Handling and Recovery',
    description: 'Validates ONCE handles errors gracefully and can recover from failures',
    requirementIORs: [
      'requirement:uuid:once-error-handling-001',
      'requirement:uuid:once-resilience-001',
      'requirement:uuid:once-graceful-degradation-001'
    ],
    componentIORs: [
      'component:once:0.3.21.8'
    ],
    testDataScenario: {
      componentName: 'ONCE',
      version: '0.3.21.8'
    },
    executionContextScenario: {
      timeout: 20000,
      cleanup: true,
      tags: ['lifecycle', 'error-handling', 'recovery', 'resilience']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        serverWasReadyBefore: true,
        invalidCommandRejected: true,
        serverStillReadyAfter: true,
        serverProcessedValidMessage: true,
        serverRecovered: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

