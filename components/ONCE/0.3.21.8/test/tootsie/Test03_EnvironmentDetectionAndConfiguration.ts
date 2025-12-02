/**
 * Test 11: Environment Detection and Configuration
 * 
 * Validates that ONCE correctly detects its environment and configures itself.
 * Tests environment-specific behavior and configuration loading.
 * 
 * Black-Box Approach:
 * - Start server and read bootstrap scenario
 * - Verify environment information is captured
 * - Verify configuration is appropriate for environment
 * - Check for expected environment markers
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';

export class Test11_EnvironmentDetectionAndConfiguration extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    
    this.recordEvidence('input', 'Environment detection test input', {
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

      // Step 2: Read bootstrap scenario
      const scenario = this.readScenario(scenarioPath);

      this.recordEvidence('step', 'Bootstrap scenario read', {
        scenarioUUID: scenario?.uuid
      });

      // Step 3: Extract environment information
      const model = scenario?.model || {};
      const envInfo = {
        hasPort: typeof model.port === 'number',
        hasProjectRoot: typeof model.projectRoot === 'string',
        hasComponentRoot: typeof model.componentRoot === 'string',
        hasNodeEnv: typeof model.nodeEnv === 'string' || typeof model.environment === 'string',
        hasHostname: typeof model.hostname === 'string' || typeof model.host === 'string'
      };

      this.recordEvidence('step', 'Environment information extracted', {
        port: model.port,
        projectRoot: model.projectRoot,
        environment: model.nodeEnv || model.environment,
        ...envInfo
      });

      // Step 4: Validate environment detection
      const validation = {
        scenarioExists: scenario !== null,
        hasEnvironmentInfo: Object.values(envInfo).some(v => v === true),
        portIsValid: typeof model.port === 'number' && model.port > 0 && model.port < 65536,
        projectRootExists: typeof model.projectRoot === 'string' && model.projectRoot.length > 0,
        serverReadyFlagExists: typeof model.serverReady === 'boolean'
      };

      this.recordEvidence('assertion', 'Environment detection validation', {
        ...validation,
        environmentInfo: envInfo,
        detectedPort: model.port,
        detectedEnvironment: model.nodeEnv || model.environment || 'N/A'
      });

      // Step 5: Verify all validations passed
      const allValid = Object.values(validation).every(v => v === true);

      if (!allValid) {
        const failures = Object.entries(validation)
          .filter(([_, v]) => v !== true)
          .map(([k, _]) => k);
        throw new Error(`Environment detection validation failed: ${failures.join(', ')}`);
      }

      return {
        success: true,
        pid,
        validation,
        environment: model.nodeEnv || model.environment,
        port: model.port
      };

    } finally {
      // Cleanup: Stop server
      this.stopONCEServer(pid);
    }
  }
}

/**
 * Create test scenario for environment detection validation
 */
export function createTest11Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-11-environment-detection',
    name: 'Test 11: Environment Detection and Configuration',
    description: 'Validates ONCE correctly detects environment and configures itself',
    requirementIORs: [
      'requirement:uuid:once-environment-detection-001',
      'requirement:uuid:once-configuration-001'
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
      tags: ['lifecycle', 'environment', 'configuration']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        scenarioExists: true,
        hasEnvironmentInfo: true,
        portIsValid: true,
        projectRootExists: true,
        serverReadyFlagExists: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

