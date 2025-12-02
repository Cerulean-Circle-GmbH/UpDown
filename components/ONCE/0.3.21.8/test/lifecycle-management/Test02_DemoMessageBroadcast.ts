/**
 * Test 02: Demo Message Broadcast and Scenario Update
 * 
 * Validates that sending a demo message via CLI updates the scenario file.
 * This verifies WebSocket broadcast functionality through scenario observation.
 * 
 * Black-Box Approach:
 * - Start server and read initial scenario state
 * - Send demo message via CLI (once.sh demoMessages)
 * - Observe scenario file changes (WebSocket side effect)
 * - Verify message appears in scenario
 * - No WebSocket protocol knowledge required
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';

export class Test02_DemoMessageBroadcast extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    const testMessage = testData?.testMessage || 'Test message from lifecycle test';
    
    this.recordEvidence('input', 'Demo message test input', {
      testMessage,
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
      const messageCountBefore = scenarioBefore?.model?.demoMessages?.length || 0;

      this.recordEvidence('step', 'Initial scenario state', {
        messageCountBefore,
        scenarioUUID: scenarioBefore?.uuid
      });

      // Step 3: Send demo message via CLI (black-box interaction)
      const cliOutput = this.sendDemoMessage(testMessage);
      
      this.recordEvidence('step', 'Demo message sent via CLI', {
        testMessage,
        cliOutput: cliOutput.substring(0, 200)
      });

      // Step 4: Wait for scenario file change (observe WebSocket effect)
      const changed = await this.waitForScenarioChange(scenarioPath, 5000);

      if (!changed) {
        throw new Error('Scenario file did not change after sending demo message');
      }

      // Step 5: Read updated scenario state
      const scenarioAfter = this.readScenario(scenarioPath);
      const messageCountAfter = scenarioAfter?.model?.demoMessages?.length || 0;
      const lastMessage = scenarioAfter?.model?.demoMessages?.[messageCountAfter - 1];

      // Step 6: Validate message broadcast
      const validation = {
        scenarioChanged: changed,
        messageCountIncreased: messageCountAfter > messageCountBefore,
        lastMessageExists: !!lastMessage,
        lastMessageMatches: lastMessage?.text === testMessage || lastMessage?.content === testMessage,
        lastMessageHasTimestamp: !!lastMessage?.timestamp
      };

      this.recordEvidence('assertion', 'Demo message broadcast validation', {
        ...validation,
        messageCountBefore,
        messageCountAfter,
        lastMessage
      });

      // Step 7: Verify all validations passed
      const allValid = Object.values(validation).every(v => v === true);

      if (!allValid) {
        const failures = Object.entries(validation)
          .filter(([_, v]) => v !== true)
          .map(([k, _]) => k);
        throw new Error(`Demo message validation failed: ${failures.join(', ')}`);
      }

      return {
        success: true,
        pid,
        validation,
        messageCountBefore,
        messageCountAfter,
        lastMessage
      };

    } finally {
      // Cleanup: Stop server
      this.stopONCEServer(pid);
    }
  }
}

/**
 * Create test scenario for demo message broadcast validation
 */
export function createTest02Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-02-demo-message',
    name: 'Test 02: Demo Message Broadcast and Scenario Update',
    description: 'Validates demo message broadcasting updates scenario file (WebSocket effect)',
    requirementIORs: [
      'requirement:uuid:once-demo-messages-001',
      'requirement:uuid:once-websocket-broadcast-001'
    ],
    componentIORs: [
      'component:once:0.3.21.8'
    ],
    testDataScenario: {
      componentName: 'ONCE',
      version: '0.3.21.8',
      testMessage: 'Black-box test message: WebSocket via scenario observation'
    },
    executionContextScenario: {
      timeout: 20000,
      cleanup: true,
      tags: ['lifecycle', 'messaging', 'websocket', 'critical']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        scenarioChanged: true,
        messageCountIncreased: true,
        lastMessageExists: true,
        lastMessageMatches: true,
        lastMessageHasTimestamp: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

