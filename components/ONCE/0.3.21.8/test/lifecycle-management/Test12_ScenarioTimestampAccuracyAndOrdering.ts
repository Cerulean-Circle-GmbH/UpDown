/**
 * Test 08: Scenario Timestamp Accuracy and Ordering
 * 
 * Validates that scenario timestamps are accurate and events are ordered correctly.
 * Tests temporal consistency in distributed Web4 systems.
 * 
 * Black-Box Approach:
 * - Send multiple messages with delays
 * - Observe scenario timestamps
 * - Verify timestamps are monotonically increasing
 * - Verify time accuracy (within tolerance)
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';

export class Test08_ScenarioTimestampAccuracyAndOrdering extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    const messageDelayMs = testData?.messageDelayMs || 500;
    const testMessages = testData?.testMessages || [
      'Timestamp test 1',
      'Timestamp test 2',
      'Timestamp test 3'
    ];
    
    this.recordEvidence('input', 'Timestamp accuracy test input', {
      testMessages,
      messageDelayMs
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

      // Step 3: Send messages with known delays and capture send times
      const sentMessages: { message: string; sentAt: number }[] = [];
      
      for (const message of testMessages) {
        const sentAt = Date.now();
        this.sendDemoMessage(message);
        sentMessages.push({ message, sentAt });
        
        this.recordEvidence('step', 'Message sent with timestamp', {
          message,
          sentAt: new Date(sentAt).toISOString()
        });

        await new Promise(resolve => setTimeout(resolve, messageDelayMs));
      }

      // Step 4: Wait for final update
      await this.waitForScenarioChange(scenarioPath, 3000);

      // Step 5: Read final scenario and extract new messages
      const scenarioAfter = this.readScenario(scenarioPath);
      const allMessages = scenarioAfter?.model?.demoMessages || [];
      const newMessages = allMessages.slice(messageCountBefore);

      // Step 6: Validate timestamps
      const timestamps = newMessages.map((m: any) => {
        const ts = m.timestamp || m.createdAt || m.time;
        return ts ? new Date(ts).getTime() : 0;
      });

      const validation = {
        allMessagesHaveTimestamps: timestamps.every((ts: number) => ts > 0),
        timestampsAreOrdered: this.areTimestampsOrdered(timestamps),
        timestampsAreRecent: this.areTimestampsRecent(timestamps, sentMessages[0].sentAt),
        timestampAccuracyGood: this.checkTimestampAccuracy(timestamps, sentMessages),
        messageCount: newMessages.length >= testMessages.length
      };

      this.recordEvidence('assertion', 'Timestamp validation', {
        ...validation,
        timestamps: timestamps.map((ts: number) => new Date(ts).toISOString()),
        sentTimes: sentMessages.map(sm => new Date(sm.sentAt).toISOString())
      });

      // Step 7: Verify all validations passed
      const allValid = Object.values(validation).every(v => v === true);

      if (!allValid) {
        const failures = Object.entries(validation)
          .filter(([_, v]) => v !== true)
          .map(([k, _]) => k);
        throw new Error(`Timestamp validation failed: ${failures.join(', ')}`);
      }

      return {
        success: true,
        pid,
        validation,
        newMessages,
        timestamps
      };

    } finally {
      // Cleanup: Stop server
      this.stopONCEServer(pid);
    }
  }

  /**
   * Check if timestamps are monotonically increasing
   */
  private areTimestampsOrdered(timestamps: number[]): boolean {
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] < timestamps[i - 1]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if timestamps are recent (within last 60 seconds)
   */
  private areTimestampsRecent(timestamps: number[], firstSentAt: number): boolean {
    const now = Date.now();
    const maxAge = 60000; // 60 seconds
    
    return timestamps.every((ts: number) => {
      const age = now - ts;
      return age >= 0 && age < maxAge;
    });
  }

  /**
   * Check timestamp accuracy (within 5 seconds of send time)
   */
  private checkTimestampAccuracy(
    timestamps: number[],
    sentMessages: { message: string; sentAt: number }[]
  ): boolean {
    const maxDiff = 5000; // 5 seconds tolerance
    
    for (let i = 0; i < Math.min(timestamps.length, sentMessages.length); i++) {
      const diff = Math.abs(timestamps[i] - sentMessages[i].sentAt);
      if (diff > maxDiff) {
        return false;
      }
    }
    
    return true;
  }
}

/**
 * Create test scenario for timestamp accuracy validation
 */
export function createTest08Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-08-timestamp-accuracy',
    name: 'Test 08: Scenario Timestamp Accuracy and Ordering',
    description: 'Validates scenario timestamps are accurate and events are ordered correctly',
    requirementIORs: [
      'requirement:uuid:once-timestamp-accuracy-001',
      'requirement:uuid:once-temporal-ordering-001'
    ],
    componentIORs: [
      'component:once:0.3.21.8'
    ],
    testDataScenario: {
      componentName: 'ONCE',
      version: '0.3.21.8',
      messageDelayMs: 500,
      testMessages: [
        'Timestamp test: Event 1',
        'Timestamp test: Event 2',
        'Timestamp test: Event 3'
      ]
    },
    executionContextScenario: {
      timeout: 25000,
      cleanup: true,
      tags: ['lifecycle', 'timestamp', 'ordering', 'temporal']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        allMessagesHaveTimestamps: true,
        timestampsAreOrdered: true,
        timestampsAreRecent: true,
        timestampAccuracyGood: true,
        messageCount: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

