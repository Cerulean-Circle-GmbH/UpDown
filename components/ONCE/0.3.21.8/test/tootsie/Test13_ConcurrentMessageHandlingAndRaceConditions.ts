/**
 * Test 09: Concurrent Message Handling and Race Conditions
 * 
 * Validates that ONCE handles concurrent messages correctly without data loss.
 * Tests thread safety and synchronization in message handling.
 * 
 * Black-Box Approach:
 * - Send multiple messages rapidly (simulating concurrent clients)
 * - Observe scenario file for all messages
 * - Verify no messages are lost
 * - Verify no duplicate messages
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';

export class Test09_ConcurrentMessageHandlingAndRaceConditions extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    const messageCount = testData?.messageCount || 10;
    
    this.recordEvidence('input', 'Concurrent message handling test input', {
      messageCount
    });

    // Step 1: Start ONCE server
    const pid = await this.startONCEServer(
      testData?.componentName,
      testData?.version
    );

    try {
      const scenarioPath = `scenarios/ONCE/${testData?.version || '0.3.21.8'}/bootstrap.scenario.json`;

      // Step 2: Capture initial state
      const scenarioBefore = this.readScenario(scenarioPath);
      const messageCountBefore = scenarioBefore?.model?.demoMessages?.length || 0;

      this.recordEvidence('step', 'Initial state captured', {
        messageCountBefore
      });

      // Step 3: Send multiple messages rapidly (simulating concurrent clients)
      const sentMessages: string[] = [];
      const sendPromises: Promise<void>[] = [];

      for (let i = 0; i < messageCount; i++) {
        const message = `Concurrent test message ${i + 1}/${messageCount}`;
        sentMessages.push(message);
        
        // Send messages with minimal delay to simulate concurrency
        sendPromises.push(
          new Promise<void>((resolve) => {
            setTimeout(() => {
              try {
                this.sendDemoMessage(message);
                resolve();
              } catch (error) {
                console.error(`Failed to send message ${i + 1}:`, error);
                resolve(); // Don't block other messages
              }
            }, i * 50); // 50ms stagger
          })
        );
      }

      // Wait for all sends to complete
      await Promise.all(sendPromises);

      this.recordEvidence('step', 'All concurrent messages sent', {
        sentCount: sentMessages.length
      });

      // Step 4: Wait for scenario to stabilize
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 5: Read final scenario
      const scenarioAfter = this.readScenario(scenarioPath);
      const allMessages = scenarioAfter?.model?.demoMessages || [];
      const messageCountAfter = allMessages.length;
      const newMessages = allMessages.slice(messageCountBefore);

      // Step 6: Check for all sent messages
      const foundMessages = sentMessages.filter(sent =>
        newMessages.some((m: any) => {
          const text = m.text || m.content || '';
          return text.includes(sent) || text === sent;
        })
      );

      // Step 7: Check for duplicates
      const messageTexts = newMessages.map((m: any) => m.text || m.content || '');
      const uniqueTexts = new Set(messageTexts);
      const hasDuplicates = messageTexts.length !== uniqueTexts.size;

      // Step 8: Validate concurrent handling
      const validation = {
        allMessagesSent: sentMessages.length === messageCount,
        allMessagesReceived: foundMessages.length >= messageCount,
        noMessagesLost: foundMessages.length === sentMessages.length,
        noDuplicates: !hasDuplicates,
        messageCountIncreased: messageCountAfter > messageCountBefore
      };

      this.recordEvidence('assertion', 'Concurrent message handling validation', {
        ...validation,
        sentCount: sentMessages.length,
        receivedCount: newMessages.length,
        foundCount: foundMessages.length,
        messageCountBefore,
        messageCountAfter
      });

      // Step 9: Verify all validations passed
      const allValid = Object.values(validation).every(v => v === true);

      if (!allValid) {
        const failures = Object.entries(validation)
          .filter(([_, v]) => v !== true)
          .map(([k, _]) => k);
        throw new Error(`Concurrent handling validation failed: ${failures.join(', ')}`);
      }

      return {
        success: true,
        pid,
        validation,
        sentCount: sentMessages.length,
        receivedCount: newMessages.length
      };

    } finally {
      // Cleanup: Stop server
      this.stopONCEServer(pid);
    }
  }
}

/**
 * Create test scenario for concurrent message handling validation
 */
export function createTest09Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-09-concurrent-handling',
    name: 'Test 09: Concurrent Message Handling and Race Conditions',
    description: 'Validates ONCE handles concurrent messages correctly without data loss',
    requirementIORs: [
      'requirement:uuid:once-concurrent-handling-001',
      'requirement:uuid:once-thread-safety-001',
      'requirement:uuid:once-no-data-loss-001'
    ],
    componentIORs: [
      'component:once:0.3.21.8'
    ],
    testDataScenario: {
      componentName: 'ONCE',
      version: '0.3.21.8',
      messageCount: 10
    },
    executionContextScenario: {
      timeout: 30000,
      cleanup: true,
      tags: ['lifecycle', 'concurrent', 'race-condition', 'thread-safety']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        allMessagesSent: true,
        allMessagesReceived: true,
        noMessagesLost: true,
        noDuplicates: true,
        messageCountIncreased: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

