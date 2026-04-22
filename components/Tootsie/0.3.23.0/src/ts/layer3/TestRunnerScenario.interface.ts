/**
 * TestRunnerScenario - Configuration scenario for TootsieTestRunner
 * 
 * ✅ Web4 Principle: One file, one type
 * ✅ Web4 Principle 1: Everything is a Scenario
 */

export interface TestRunnerScenario {
  /** Path to the test file to execute */
  testFilePath: string;
  
  /** Name of the test class to instantiate */
  testClassName: string;
  
  /** Optional path to scenario file for test initialization */
  scenarioPath?: string;
}

