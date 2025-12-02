/**
 * TootsieTestRunner - Executes Web4 test classes
 * 
 * ✅ Web4 Separation of Concerns: Test execution logic is a dedicated component
 * ✅ Radical OOP: Runner is an object, not inline code generation
 * ✅ Web4 Principle 6: Empty constructor, then init with scenario
 * ✅ Web4 Principle: One file, one type
 * 
 * Usage:
 *   npx tsx TootsieTestRunner.ts <testFilePath>
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { TestRunnerScenario } from '../layer3/TestRunnerScenario.interface.js';

/**
 * TootsieTestRunner - Radical OOP test executor
 */
export class TootsieTestRunner {
  private scenario: TestRunnerScenario | null = null;

  constructor() {
    // Web4 Principle 6: Empty constructor
  }

  init(scenario: TestRunnerScenario): this {
    this.scenario = scenario;
    return this;
  }

  /**
   * Execute the test
   */
  async execute(): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.scenario) {
      throw new Error('TootsieTestRunner not initialized - call init(scenario) first');
    }

    const { testFilePath, testClassName, scenarioPath } = this.scenario;

    console.log(`🧪 [TOOTSIE] Loading test class: ${testClassName}`);
    console.log(`   File: ${testFilePath}`);

    try {
      // Dynamic import of the test class
      const testModule = await import(testFilePath);
      const TestClass = testModule[testClassName];

      if (!TestClass) {
        throw new Error(`Test class '${testClassName}' not found in ${testFilePath}`);
      }

      // Instantiate test (Web4 Principle 6: Empty constructor)
      console.log(`🧪 [TOOTSIE] Instantiating test: ${testClassName}`);
      const test = new TestClass();

      // Load scenario from file if provided or auto-discover
      let testScenario = this.loadTestScenario(testFilePath, scenarioPath);
      
      // Initialize test with scenario
      console.log(`🧪 [TOOTSIE] Initializing test with scenario...`);
      test.init(testScenario);

      // Execute test
      console.log(`🧪 [TOOTSIE] Executing test...`);
      const result = await test.execute();

      console.log(`🧪 [TOOTSIE] Test result:`, JSON.stringify(result, null, 2));
      
      // Check test status from result
      if (result && result.status === 'failed') {
        console.error(`❌ [TOOTSIE] Test FAILED: ${result.errorDetails || 'Unknown error'}`);
        return { success: false, result, error: result.errorDetails };
      }
      
      // ✅ Provide detailed PASS explanation
      console.log(`\n${'═'.repeat(60)}`);
      console.log(`✅ [TOOTSIE] Test PASSED: ${testClassName}`);
      console.log(`${'═'.repeat(60)}`);
      
      // Show why it passed based on actualResultScenario
      if (result?.actualResultScenario) {
        const actual = result.actualResultScenario;
        console.log(`\n📋 PASS CRITERIA MET:`);
        
        // Iterate through result properties and show what passed
        for (const [key, value] of Object.entries(actual)) {
          if (key === 'success' && value === true) {
            console.log(`   ✅ success: true`);
          } else if (typeof value === 'object' && value !== null) {
            // Show nested validations
            const validations = Object.entries(value as object)
              .filter(([k, v]) => typeof v === 'boolean' && v === true)
              .map(([k]) => k);
            if (validations.length > 0) {
              console.log(`   ✅ ${key}: ${validations.join(', ')}`);
            }
          } else if (typeof value === 'boolean' && value === true) {
            console.log(`   ✅ ${key}: passed`);
          }
        }
      }
      
      // Show performance metrics if available
      if (result?.performanceMetrics) {
        console.log(`\n⏱️  PERFORMANCE:`);
        console.log(`   Execution time: ${result.performanceMetrics.executionTimeMs}ms`);
        console.log(`   Memory usage: ${result.performanceMetrics.memoryUsageMB?.toFixed(2)}MB`);
      }
      
      console.log(`${'═'.repeat(60)}\n`);
      
      return { success: true, result };

    } catch (error: any) {
      console.error(`❌ [TOOTSIE] Test FAILED:`, error.message);
      console.error(error.stack);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load test scenario from file or create default
   */
  private loadTestScenario(testFilePath: string, scenarioPath?: string): any {
    const testDir = path.dirname(testFilePath);
    const scenarioDir = path.join(testDir, 'scenarios');
    const fileName = path.basename(testFilePath, '.ts');
    
    // Extract test number from filename (e.g., Test01_Name -> 01)
    const testNumber = fileName.match(/Test(\d+)_/)?.[1] || '01';
    const paddedNumber = testNumber.padStart(2, '0');

    // Try explicit scenario path first
    if (scenarioPath && fs.existsSync(scenarioPath)) {
      console.log(`🧪 [TOOTSIE] Loading scenario from: ${scenarioPath}`);
      return JSON.parse(fs.readFileSync(scenarioPath, 'utf-8'));
    }

    // Try to find scenario file in scenarios directory
    try {
      if (fs.existsSync(scenarioDir)) {
        const files = fs.readdirSync(scenarioDir);
        const matchingFile = files.find(f => 
          f.startsWith(`test-${paddedNumber}-`) && f.endsWith('.scenario.json')
        );
        
        if (matchingFile) {
          const fullPath = path.join(scenarioDir, matchingFile);
          console.log(`🧪 [TOOTSIE] Loaded scenario: ${matchingFile}`);
          return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        }
      }
    } catch (e) {
      // Ignore errors, use default
    }

    // Return default scenario
    console.log(`🧪 [TOOTSIE] Using default scenario (no scenario file found)`);
    return {
      uuid: `test:auto:${fileName}`,
      name: fileName,
      description: `Auto-generated scenario for ${fileName}`
    };
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: npx tsx TootsieTestRunner.ts <testFilePath> [scenarioPath]');
    process.exit(1);
  }

  const testFilePath = args[0];
  const scenarioPath = args[1];
  
  // Extract class name from file path
  const fileName = path.basename(testFilePath, '.ts');
  const testClassName = fileName;

  const runner = new TootsieTestRunner();
  runner.init({
    testFilePath,
    testClassName,
    scenarioPath
  });

  runner.execute().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

