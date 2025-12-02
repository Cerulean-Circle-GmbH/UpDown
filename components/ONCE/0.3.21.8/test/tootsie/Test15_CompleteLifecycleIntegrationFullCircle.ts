/**
 * Test 15: Complete Lifecycle Integration - Full Circle
 * 
 * Validates the complete ONCE lifecycle from birth to hibernation.
 * This is the ultimate integration test combining all lifecycle aspects.
 * 
 * Black-Box Approach:
 * - Start server (birth)
 * - Load component (growth)
 * - Exchange messages (life)
 * - Hibernate state (sleep)
 * - Restart and restore (resurrection)
 * - Shutdown (death)
 * 
 * This test demonstrates the complete Web4 object lifecycle!
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';

export class Test15_CompleteLifecycleIntegrationFullCircle extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    const lifecycleMessages = testData?.lifecycleMessages || [
      'Birth: Server starting',
      'Growth: Components loading',
      'Life: Processing messages',
      'Sleep: Hibernating state'
    ];
    
    this.recordEvidence('input', 'Complete lifecycle integration test input', {
      lifecycleMessages,
      stagesCount: 6
    });

    const scenarioPath = `scenarios/ONCE/${testData?.version || '0.3.21.8'}/bootstrap.scenario.json`;
    const lifecycleStages: any = {};

    // ═══════════════════════════════════════════════════════════════
    // STAGE 1: BIRTH - Server starts and creates initial scenario
    // ═══════════════════════════════════════════════════════════════
    
    this.recordEvidence('step', 'STAGE 1: BIRTH - Starting server', {});
    
    const pid1 = await this.startONCEServer(
      testData?.componentName,
      testData?.version
    );

    const birthScenario = this.readScenario(scenarioPath);
    lifecycleStages.birth = {
      success: birthScenario !== null && birthScenario?.model?.serverReady === true,
      uuid: birthScenario?.uuid,
      timestamp: birthScenario?.model?.timestamp
    };

    this.recordEvidence('assertion', 'BIRTH stage completed', lifecycleStages.birth);

    // ═══════════════════════════════════════════════════════════════
    // STAGE 2: GROWTH - Components can be loaded
    // ═══════════════════════════════════════════════════════════════
    
    this.recordEvidence('step', 'STAGE 2: GROWTH - Loading component info', {});
    
    try {
      const infoOutput = this.invokeONCECLI('info');
      lifecycleStages.growth = {
        success: infoOutput.length > 0,
        hasONCEInfo: infoOutput.includes('ONCE') || infoOutput.includes('0.3.21')
      };
    } catch (error) {
      lifecycleStages.growth = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }

    this.recordEvidence('assertion', 'GROWTH stage completed', lifecycleStages.growth);

    // ═══════════════════════════════════════════════════════════════
    // STAGE 3: LIFE - Messages are exchanged and processed
    // ═══════════════════════════════════════════════════════════════
    
    this.recordEvidence('step', 'STAGE 3: LIFE - Exchanging messages', {});
    
    for (const message of lifecycleMessages) {
      this.sendDemoMessage(message);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    await this.waitForScenarioChange(scenarioPath, 3000);

    const lifeScenario = this.readScenario(scenarioPath);
    const messages = lifeScenario?.model?.demoMessages || [];
    const lifeMessagesFound = lifecycleMessages.filter((msg: string) =>
      messages.some((m: any) => (m.text || m.content || '').includes(msg))
    );

    lifecycleStages.life = {
      success: lifeMessagesFound.length === lifecycleMessages.length,
      messagesProcessed: lifeMessagesFound.length,
      totalMessages: messages.length
    };

    this.recordEvidence('assertion', 'LIFE stage completed', lifecycleStages.life);

    // ═══════════════════════════════════════════════════════════════
    // STAGE 4: SLEEP - State is hibernated to disk
    // ═══════════════════════════════════════════════════════════════
    
    this.recordEvidence('step', 'STAGE 4: SLEEP - Hibernating state', {});
    
    const sleepScenario = this.readScenario(scenarioPath);
    const sleepUUID = sleepScenario?.uuid;

    lifecycleStages.sleep = {
      success: sleepScenario !== null,
      scenarioPreserved: !!sleepUUID,
      stateSize: JSON.stringify(sleepScenario).length,
      messagesPreserved: (sleepScenario?.model?.demoMessages || []).length >= lifecycleMessages.length
    };

    this.recordEvidence('assertion', 'SLEEP stage completed', lifecycleStages.sleep);

    // ═══════════════════════════════════════════════════════════════
    // STAGE 5: RESURRECTION - Stop and restart, verify state restored
    // ═══════════════════════════════════════════════════════════════
    
    this.recordEvidence('step', 'STAGE 5: RESURRECTION - Restarting server', {});
    
    this.stopONCEServer(pid1);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const pid2 = await this.startONCEServer(
      testData?.componentName,
      testData?.version
    );

    const resurrectionScenario = this.readScenario(scenarioPath);
    const resurrectionUUID = resurrectionScenario?.uuid;

    lifecycleStages.resurrection = {
      success: resurrectionUUID === sleepUUID,
      uuidPreserved: resurrectionUUID === sleepUUID,
      stateRestored: resurrectionScenario !== null,
      serverReadyAgain: resurrectionScenario?.model?.serverReady === true
    };

    this.recordEvidence('assertion', 'RESURRECTION stage completed', lifecycleStages.resurrection);

    // ═══════════════════════════════════════════════════════════════
    // STAGE 6: DEATH - Graceful shutdown
    // ═══════════════════════════════════════════════════════════════
    
    this.recordEvidence('step', 'STAGE 6: DEATH - Shutting down server', {});
    
    this.stopONCEServer(pid2);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const deathScenario = this.readScenario(scenarioPath);

    lifecycleStages.death = {
      success: deathScenario !== null,
      legacyPreserved: !!deathScenario,
      historyIntact: (deathScenario?.model?.demoMessages || []).length >= lifecycleMessages.length
    };

    this.recordEvidence('assertion', 'DEATH stage completed', lifecycleStages.death);

    // ═══════════════════════════════════════════════════════════════
    // FINAL VALIDATION: All lifecycle stages completed successfully
    // ═══════════════════════════════════════════════════════════════
    
    const validation = {
      birthSuccessful: lifecycleStages.birth.success,
      growthSuccessful: lifecycleStages.growth.success,
      lifeSuccessful: lifecycleStages.life.success,
      sleepSuccessful: lifecycleStages.sleep.success,
      resurrectionSuccessful: lifecycleStages.resurrection.success,
      deathSuccessful: lifecycleStages.death.success,
      completeLifecycle: Object.values(lifecycleStages).every((stage: any) => stage.success)
    };

    this.recordEvidence('assertion', 'COMPLETE LIFECYCLE validation', {
      ...validation,
      lifecycleStages
    });

    // Verify all validations passed
    const allValid = Object.values(validation).every(v => v === true);

    if (!allValid) {
      const failures = Object.entries(validation)
        .filter(([_, v]) => v !== true)
        .map(([k, _]) => k);
      throw new Error(`Lifecycle validation failed: ${failures.join(', ')}`);
    }

    return {
      success: true,
      validation,
      lifecycleStages,
      message: '🎭 Complete Web4 object lifecycle demonstrated: Birth → Growth → Life → Sleep → Resurrection → Death'
    };
  }
}

/**
 * Create test scenario for complete lifecycle integration
 */
export function createTest15Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-15-complete-integration',
    name: 'Test 15: Complete Lifecycle Integration - Full Circle',
    description: 'Validates the complete ONCE lifecycle from birth to death and resurrection',
    requirementIORs: [
      'requirement:uuid:once-complete-lifecycle-001',
      'requirement:uuid:once-object-lifecycle-001',
      'requirement:uuid:once-hibernation-cycle-001'
    ],
    componentIORs: [
      'component:once:0.3.21.8'
    ],
    testDataScenario: {
      componentName: 'ONCE',
      version: '0.3.21.8',
      lifecycleMessages: [
        'Lifecycle: Server birth',
        'Lifecycle: Component growth',
        'Lifecycle: Active life',
        'Lifecycle: Hibernation sleep'
      ]
    },
    executionContextScenario: {
      timeout: 60000, // 60 seconds for complete lifecycle
      cleanup: true,
      tags: ['lifecycle', 'integration', 'complete', 'critical', 'web4-principles']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        birthSuccessful: true,
        growthSuccessful: true,
        lifeSuccessful: true,
        sleepSuccessful: true,
        resurrectionSuccessful: true,
        deathSuccessful: true,
        completeLifecycle: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

