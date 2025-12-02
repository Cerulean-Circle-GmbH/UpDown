/**
 * Test 13: CLI Command Availability and Help
 * 
 * Validates that all essential ONCE CLI commands are available and documented.
 * Tests CLI discoverability and user guidance.
 * 
 * Black-Box Approach:
 * - Invoke CLI help/usage command
 * - Verify essential commands are listed
 * - Check command documentation quality
 * - Validate command syntax examples
 */

import { ONCETestCase } from './ONCETestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';

export class Test13_CLICommandAvailabilityAndHelp extends ONCETestCase {
  
  protected async executeTestLogic(): Promise<any> {
    const testData = this.scenario?.testDataScenario;
    const essentialCommands = testData?.essentialCommands || [
      'startServer',
      'info',
      'demoMessages',
      'test',
      'build',
      'clean'
    ];
    
    this.recordEvidence('input', 'CLI command availability test input', {
      essentialCommands
    });

    // Step 1: Invoke CLI usage/help
    let usageOutput = '';
    try {
      usageOutput = this.invokeONCECLI('usage');
    } catch (error) {
      // Try alternative help command
      try {
        usageOutput = this.invokeONCECLI('help');
      } catch (error2) {
        // Try just running without command
        try {
          usageOutput = this.invokeONCECLI('');
        } catch (error3) {
          usageOutput = 'No usage output available';
        }
      }
    }

    this.recordEvidence('step', 'CLI usage output retrieved', {
      outputLength: usageOutput.length,
      firstLines: usageOutput.substring(0, 200)
    });

    // Step 2: Check for essential commands
    const commandAvailability = essentialCommands.map((cmd: string) => ({
      command: cmd,
      available: usageOutput.toLowerCase().includes(cmd.toLowerCase())
    }));

    const availableCommands = commandAvailability.filter(c => c.available);

    this.recordEvidence('step', 'Command availability checked', {
      totalCommands: essentialCommands.length,
      availableCommands: availableCommands.length,
      missingCommands: commandAvailability.filter(c => !c.available).map(c => c.command)
    });

    // Step 3: Validate CLI documentation quality
    const validation = {
      usageOutputExists: usageOutput.length > 0,
      hasUsageHeader: usageOutput.includes('Usage') || usageOutput.includes('ONCE'),
      hasCommandList: usageOutput.length > 100, // Reasonable minimum
      allEssentialCommandsAvailable: availableCommands.length === essentialCommands.length,
      mostCommandsAvailable: availableCommands.length >= essentialCommands.length * 0.8, // 80% threshold
      hasExamples: usageOutput.includes('example') || usageOutput.includes('Example')
    };

    this.recordEvidence('assertion', 'CLI help validation', {
      ...validation,
      commandAvailability,
      usageOutputLength: usageOutput.length
    });

    // Step 4: Verify all validations passed
    const allValid = Object.values(validation).every(v => v === true);

    if (!allValid) {
      const failures = Object.entries(validation)
        .filter(([_, v]) => v !== true)
        .map(([k, _]) => k);
      throw new Error(`CLI help validation failed: ${failures.join(', ')}`);
    }

    return {
      success: true,
      validation,
      commandAvailability,
      usageOutput: usageOutput.substring(0, 500)
    };
  }
}

/**
 * Create test scenario for CLI command availability validation
 */
export function createTest13Scenario(): TestScenario {
  return {
    uuid: 'test:uuid:once-lifecycle-13-cli-availability',
    name: 'Test 13: CLI Command Availability and Help',
    description: 'Validates all essential ONCE CLI commands are available and documented',
    requirementIORs: [
      'requirement:uuid:once-cli-usability-001',
      'requirement:uuid:once-cli-documentation-001'
    ],
    componentIORs: [
      'component:once:0.3.21.8'
    ],
    testDataScenario: {
      componentName: 'ONCE',
      version: '0.3.21.8',
      essentialCommands: [
        'startServer',
        'info',
        'demoMessages',
        'test',
        'build',
        'clean'
      ]
    },
    executionContextScenario: {
      timeout: 10000,
      cleanup: false,
      tags: ['lifecycle', 'cli', 'usability', 'documentation']
    },
    expectedResultScenario: {
      success: true,
      validation: {
        usageOutputExists: true,
        hasUsageHeader: true,
        hasCommandList: true,
        allEssentialCommandsAvailable: true,
        mostCommandsAvailable: true,
        hasExamples: true
      }
    },
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
}

