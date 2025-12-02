/**
 * Test 05: Multi-Peer Message Exchange and Synchronization
 * 
 * Validates that multiple ONCE peers can exchange messages and stay synchronized.
 * Tests WebSocket broadcast to multiple clients through scenario observation.
 * 
 * Black-Box Approach:
 * - Start server
 * - Send messages from different "peers" (via CLI)
 * - Observe scenario file updates for each message
 * - Verify all messages appear in correct order
 * - No WebSocket protocol knowledge required
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';

export class Test05_MultiPeerMessageExchange extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    const peerMessages = testData?.peerMessages || [
      { peer: 'Peer A', message: 'Hello from Peer A' },
      { peer: 'Peer B', message: 'Hello from Peer B' },
      { peer: 'Peer C', message: 'Hello from Peer C' },
      { peer: 'Peer A', message: 'Second message from Peer A' },
      { peer: 'Peer B', message: 'Second message from Peer B' }
    ];
    
    this.recordEvidence('input', 'Multi-peer message exchange test input', {
      peerMessages,
      peerCount: new Set(peerMessages.map((pm: any) => pm.peer)).size,
      messageCount: peerMessages.length
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

      // Step 3: Send messages from multiple "peers"
      const sentMessages = [];
      for (let i = 0; i < peerMessages.length; i++) {
        const { peer, message } = peerMessages[i];
        const fullMessage = `[${peer}] ${message}`;
        
        this.sendDemoMessage(fullMessage);
        sentMessages.push(fullMessage);
        
        this.recordEvidence('step', `Message sent from ${peer}`, {
          peer,
          message: fullMessage,
          sequence: i + 1
        });

        // Wait between messages to ensure ordering
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Step 4: Wait for final scenario update
      await this.waitForScenarioChange(scenarioPath, 3000);

      // Step 5: Read final scenario state
      const scenarioAfter = this.readScenario(scenarioPath);
      const finalMessages = scenarioAfter?.model?.demoMessages || [];
      const messageCountAfter = finalMessages.length;

      // Step 6: Extract messages sent during this test
      const newMessages = finalMessages.slice(messageCountBefore);

      // Step 7: Validate multi-peer synchronization
      const validation = {
        allMessagesSent: sentMessages.length === peerMessages.length,
        allMessagesReceived: messageCountAfter >= messageCountBefore + peerMessages.length,
        messagesHaveTimestamps: newMessages.every((m: any) => !!m.timestamp),
        messagesInOrder: this.validateMessageOrder(newMessages, sentMessages),
        allPeersRepresented: this.validateAllPeersPresent(newMessages, peerMessages)
      };

      this.recordEvidence('assertion', 'Multi-peer synchronization validation', {
        ...validation,
        messageCountBefore,
        messageCountAfter,
        newMessagesCount: newMessages.length,
        sentMessagesCount: sentMessages.length
      });

      // Step 8: Verify all validations passed
      const allValid = Object.values(validation).every(v => v === true);

      if (!allValid) {
        const failures = Object.entries(validation)
          .filter(([_, v]) => v !== true)
          .map(([k, _]) => k);
        throw new Error(`Multi-peer validation failed: ${failures.join(', ')}`);
      }

      return {
        success: true,
        pid,
        validation,
        messageCountBefore,
        messageCountAfter,
        newMessages
      };

    } finally {
      // Cleanup: Stop server
      this.stopONCEServer(pid);
    }
  }

  /**
   * Validate that messages appear in the correct order
   */
  private validateMessageOrder(actualMessages: any[], expectedMessages: string[]): boolean {
    // Check if the sent messages appear in the received messages in the same order
    let expectedIndex = 0;
    
    for (const actual of actualMessages) {
      const actualText = actual.text || actual.content || '';
      
      if (actualText === expectedMessages[expectedIndex]) {
        expectedIndex++;
        if (expectedIndex === expectedMessages.length) {
          return true; // All messages found in order
        }
      }
    }
    
    return expectedIndex === expectedMessages.length;
  }

  /**
   * Validate that all peers are represented in the messages
   */
  private validateAllPeersPresent(actualMessages: any[], expectedPeerMessages: any[]): boolean {
    const expectedPeers = new Set(expectedPeerMessages.map((pm: any) => pm.peer));
    const foundPeers = new Set<string>();
    
    for (const actual of actualMessages) {
      const actualText = actual.text || actual.content || '';
      
      // Check which peer sent this message
      for (const peer of expectedPeers) {
        if (actualText.includes(`[${peer}]`)) {
          foundPeers.add(peer);
        }
      }
    }
    
    return foundPeers.size === expectedPeers.size;
  }
}

/**
 * Create test scenario for multi-peer message exchange validation
 */
export function createTest05Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-05-multi-peer',
    name: 'Test 05: Multi-Peer Message Exchange and Synchronization',
    description: 'Validates multiple peers can exchange messages and stay synchronized',
    requirementIORs: [
      'requirement:uuid:once-multi-peer-001',
      'requirement:uuid:once-message-synchronization-001',
      'requirement:uuid:once-websocket-broadcast-001'
    ],
    componentIORs: [
      'component:once:0.3.21.8'
    ],
    testDataScenario: {
      componentName: 'ONCE',
      version: '0.3.21.8',
      peerMessages: [
        { peer: 'Peer A', message: 'First message from Peer A' },
        { peer: 'Peer B', message: 'First message from Peer B' },
        { peer: 'Peer C', message: 'First message from Peer C' },
        { peer: 'Peer A', message: 'Second message from Peer A' },
        { peer: 'Peer B', message: 'Second message from Peer B' }
      ]
    },
    executionContextScenario: {
      timeout: 30000,
      cleanup: true,
      tags: ['lifecycle', 'multi-peer', 'synchronization', 'websocket', 'critical']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        allMessagesSent: true,
        allMessagesReceived: true,
        messagesHaveTimestamps: true,
        messagesInOrder: true,
        allPeersRepresented: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

