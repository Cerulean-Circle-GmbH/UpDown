/**
 * Test 01: Path Authority and Project Root Detection (FOUNDATION TEST)
 * 
 * Validates that ONCE correctly detects project root in various contexts.
 * Tests the path authority pattern crucial for test isolation.
 * 
 * Black-Box Approach:
 * - Start server and read bootstrap scenario
 * - Verify projectRoot is correctly detected
 * - Verify componentRoot is relative to projectRoot
 * - Check path consistency across contexts
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.3.20.6/src/ts/layer3/TestScenario.js';
import * as fs from 'fs';
import * as path from 'path';

export class Test01_PathAuthorityAndProjectRootDetection extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    
    this.recordEvidence('input', 'Path authority test input', {
      componentName: testData?.componentName || 'ONCE',
      version: testData?.version || '0.3.21.8',
      currentWorkingDir: process.cwd()
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
      const model = scenario?.model || {};

      this.recordEvidence('step', 'Bootstrap scenario paths extracted', {
        projectRoot: model.projectRoot,
        componentRoot: model.componentRoot,
        scenarioUUID: scenario?.uuid
      });

      // Step 3: Validate paths exist and are consistent
      const projectRoot = model.projectRoot || '';
      const componentRoot = model.componentRoot || '';

      const pathValidation = {
        projectRootExists: projectRoot.length > 0 && fs.existsSync(projectRoot),
        componentRootExists: componentRoot.length > 0 && fs.existsSync(componentRoot),
        componentRootWithinProject: componentRoot.startsWith(projectRoot),
        projectRootHasComponents: fs.existsSync(path.join(projectRoot, 'components')),
        projectRootHasScenarios: fs.existsSync(path.join(projectRoot, 'scenarios')),
        projectRootIsAbsolute: projectRoot.startsWith('/'),
        componentRootIsAbsolute: componentRoot.startsWith('/')
      };

      this.recordEvidence('step', 'Path validation checks performed', pathValidation);

      // Step 4: Validate path authority pattern
      const validation = {
        scenarioExists: scenario !== null,
        hasProjectRoot: projectRoot.length > 0,
        hasComponentRoot: componentRoot.length > 0,
        projectRootValid: pathValidation.projectRootExists && 
                         pathValidation.projectRootHasComponents,
        componentRootValid: pathValidation.componentRootExists && 
                           pathValidation.componentRootWithinProject,
        pathsAreAbsolute: pathValidation.projectRootIsAbsolute && 
                         pathValidation.componentRootIsAbsolute,
        pathHierarchyCorrect: pathValidation.componentRootWithinProject
      };

      this.recordEvidence('assertion', 'Path authority validation', {
        ...validation,
        projectRoot,
        componentRoot,
        pathValidation
      });

      // Step 5: Verify all validations passed
      const allValid = Object.values(validation).every(v => v === true);

      if (!allValid) {
        const failures = Object.entries(validation)
          .filter(([_, v]) => v !== true)
          .map(([k, _]) => k);
        throw new Error(`Path authority validation failed: ${failures.join(', ')}`);
      }

      return {
        success: true,
        pid,
        validation,
        projectRoot,
        componentRoot
      };

    } finally {
      // Cleanup: Stop server
      this.stopONCEServer(pid);
    }
  }
}

/**
 * Create test scenario for path authority validation
 */
export function createTest01Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-01-path-authority',
    name: 'Test 01: Path Authority and Project Root Detection (FOUNDATION)',
    description: 'Validates ONCE correctly detects project root and manages path hierarchy',
    requirementIORs: [
      'requirement:uuid:once-path-authority-001',
      'requirement:uuid:once-test-isolation-001'
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
      tags: ['lifecycle', 'path-authority', 'configuration', 'test-isolation']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        scenarioExists: true,
        hasProjectRoot: true,
        hasComponentRoot: true,
        projectRootValid: true,
        componentRootValid: true,
        pathsAreAbsolute: true,
        pathHierarchyCorrect: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

