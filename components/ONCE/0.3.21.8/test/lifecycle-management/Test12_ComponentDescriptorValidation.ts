/**
 * Test 12: Component Descriptor Validation
 * 
 * Validates that ONCE component descriptor is well-formed and contains required fields.
 * Tests component metadata and self-description capabilities.
 * 
 * Black-Box Approach:
 * - Read ONCE component descriptor file
 * - Validate required fields are present
 * - Verify implementation class name is correct
 * - Check Web4 compliance markers
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';

export class Test12_ComponentDescriptorValidation extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    const componentName = testData?.componentName || 'ONCE';
    const version = testData?.version || '0.3.21.8';
    
    this.recordEvidence('input', 'Component descriptor validation test input', {
      componentName,
      version
    });

    // Step 1: Read component descriptor
    const descriptorPath = `components/${componentName}/${version}/${componentName}.component.json`;
    const descriptor = this.readScenario(descriptorPath);

    if (!descriptor) {
      throw new Error(`Component descriptor not found: ${descriptorPath}`);
    }

    this.recordEvidence('step', 'Component descriptor read', {
      descriptorPath,
      descriptorUUID: descriptor.uuid
    });

    // Step 2: Validate descriptor structure
    const model = descriptor.model || {};
    const validation = {
      descriptorExists: descriptor !== null,
      hasUUID: !!descriptor.uuid,
      hasModel: !!descriptor.model,
      hasImplementationClassName: !!model.implementationClassName,
      implementationClassCorrect: model.implementationClassName === 'NodeJsOnce' || 
                                   model.implementationClassName === 'DefaultONCE',
      hasComponentName: !!model.componentName || !!model.name,
      componentNameCorrect: model.componentName === componentName || 
                           model.name === componentName,
      hasVersion: !!model.version,
      versionCorrect: model.version === version,
      hasDescription: !!model.description || !!descriptor.description
    };

    this.recordEvidence('assertion', 'Component descriptor validation', {
      ...validation,
      implementationClassName: model.implementationClassName,
      componentName: model.componentName || model.name,
      version: model.version,
      description: (model.description || descriptor.description || '').substring(0, 100)
    });

    // Step 3: Verify all validations passed
    const allValid = Object.values(validation).every(v => v === true);

    if (!allValid) {
      const failures = Object.entries(validation)
        .filter(([_, v]) => v !== true)
        .map(([k, _]) => k);
      throw new Error(`Descriptor validation failed: ${failures.join(', ')}`);
    }

    return {
      success: true,
      validation,
      descriptor,
      implementationClassName: model.implementationClassName
    };
  }
}

/**
 * Create test scenario for component descriptor validation
 */
export function createTest12Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-12-descriptor-validation',
    name: 'Test 12: Component Descriptor Validation',
    description: 'Validates ONCE component descriptor is well-formed with required fields',
    requirementIORs: [
      'requirement:uuid:once-component-descriptor-001',
      'requirement:uuid:once-metadata-001'
    ],
    componentIORs: [
      'component:once:0.3.21.8'
    ],
    testDataScenario: {
      componentName: 'ONCE',
      version: '0.3.21.8'
    },
    executionContextScenario: {
      timeout: 10000,
      cleanup: false,
      tags: ['lifecycle', 'descriptor', 'metadata', 'validation']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        descriptorExists: true,
        hasUUID: true,
        hasModel: true,
        hasImplementationClassName: true,
        implementationClassCorrect: true,
        hasComponentName: true,
        componentNameCorrect: true,
        hasVersion: true,
        versionCorrect: true,
        hasDescription: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

