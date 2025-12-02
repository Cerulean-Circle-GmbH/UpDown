/**
 * ONCETestCase - Base test case for all ONCE lifecycle tests
 * Layer 2: Extends DefaultWeb4TestCase with ONCE-specific helpers
 * 
 * Web4 Principles Applied:
 * - Empty constructor (Web4 Principle 4)
 * - Scenario-based initialization (Web4 Principle 5)
 * - Black-box testing only (Web4 Principle 18)
 * - IOR-based component references (Web4 Principle 8)
 */

import { DefaultWeb4TestCase } from '../../../../Web4Test/0.1.0.0/src/ts/layer2/DefaultWeb4TestCase.js';
import { TestScenario } from '../../../../Web4Test/0.1.0.0/src/ts/layer3/TestScenario.js';
import { readFileSync, existsSync, watch } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * ONCETestCase - Base test case for ONCE component lifecycle tests
 * Provides ONCE-specific helpers for scenario observation and CLI invocation
 */
export abstract class ONCETestCase extends DefaultWeb4TestCase {
  protected projectRoot: string;
  protected testDataRoot: string;
  
  /**
   * Web4 empty constructor principle
   */
  constructor() {
    super();
    this.projectRoot = '/Users/Shared/Workspaces/2cuGitHub/UpDown';
    this.testDataRoot = join(this.projectRoot, 'test/data');
  }

  /**
   * Initialize with scenario and detect test isolation
   */
  init(scenario: TestScenario): this {
    super.init(scenario);
    
    // Detect test isolation environment
    const isTestIsolation = process.cwd().includes('test/data');
    if (isTestIsolation) {
      this.projectRoot = this.detectProjectRootFromTest();
      console.log(`🧪 Test Isolation Active - Project Root: ${this.projectRoot}`);
    }
    
    return this;
  }

  // ═══════════════════════════════════════════════════════════════
  // SCENARIO OBSERVATION HELPERS (Black-Box Pattern)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Read a scenario file (black-box observation)
   * This is how we observe WebSocket broadcast side effects!
   */
  protected readScenario(scenarioPath: string): any {
    const fullPath = join(this.projectRoot, scenarioPath);
    
    if (!existsSync(fullPath)) {
      this.recordEvidence('step', 'Scenario file not found', { scenarioPath: fullPath });
      return null;
    }

    try {
      const content = readFileSync(fullPath, 'utf8');
      const scenario = JSON.parse(content);
      
      this.recordEvidence('step', 'Scenario file read', {
        scenarioPath: fullPath,
        scenarioUUID: scenario.uuid || 'N/A',
        timestamp: scenario.model?.timestamp || 'N/A'
      });

      return scenario;
    } catch (error) {
      this.recordEvidence('error', 'Failed to read scenario file', {
        scenarioPath: fullPath,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Wait for scenario file to change (observing WebSocket side effects)
   * This is the black-box way to verify WebSocket broadcasts!
   */
  protected async waitForScenarioChange(
    scenarioPath: string,
    timeoutMs: number = 5000
  ): Promise<boolean> {
    const fullPath = join(this.projectRoot, scenarioPath);
    
    return new Promise((resolve) => {
      const initialMtime = existsSync(fullPath) 
        ? readFileSync(fullPath, 'utf8') 
        : null;

      let changeDetected = false;
      const watcher = watch(fullPath, (eventType) => {
        if (eventType === 'change' && !changeDetected) {
          changeDetected = true;
          const newContent = readFileSync(fullPath, 'utf8');
          
          if (newContent !== initialMtime) {
            this.recordEvidence('step', 'Scenario file changed (WebSocket effect observed)', {
              scenarioPath: fullPath,
              eventType
            });
            watcher.close();
            resolve(true);
          }
        }
      });

      setTimeout(() => {
        if (!changeDetected) {
          this.recordEvidence('step', 'Scenario change timeout', {
            scenarioPath: fullPath,
            timeoutMs
          });
          watcher.close();
          resolve(false);
        }
      }, timeoutMs);
    });
  }

  /**
   * Compare two scenario states (black-box verification)
   */
  protected compareScenarios(before: any, after: any, fieldPath: string): boolean {
    const getField = (obj: any, path: string): any => {
      return path.split('.').reduce((acc, part) => acc?.[part], obj);
    };

    const beforeValue = getField(before, fieldPath);
    const afterValue = getField(after, fieldPath);
    const changed = beforeValue !== afterValue;

    this.recordEvidence('assertion', 'Scenario comparison', {
      fieldPath,
      beforeValue,
      afterValue,
      changed
    });

    return changed;
  }

  // ═══════════════════════════════════════════════════════════════
  // CLI INVOCATION HELPERS (Black-Box Control)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Start ONCE server via CLI (black-box control)
   * Returns PID for cleanup
   */
  protected async startONCEServer(
    componentName: string = 'ONCE',
    version: string = '0.3.21.8'
  ): Promise<number> {
    try {
      const oncePath = join(this.projectRoot, 'components', componentName, version);
      const onceExec = join(oncePath, 'once.sh');

      // Start server in background
      const cmd = `cd ${oncePath} && ./once.sh startServer &`;
      const output = execSync(cmd, { 
        encoding: 'utf8',
        cwd: oncePath
      });

      // Extract PID (if available in output)
      const pidMatch = output.match(/PID:\s*(\d+)/);
      const pid = pidMatch ? parseInt(pidMatch[1]) : 0;

      this.recordEvidence('step', 'ONCE server started via CLI', {
        componentName,
        version,
        pid,
        command: cmd
      });

      // Wait for server to be ready (observe scenario bootstrap)
      await this.waitForServerReady();

      return pid;
    } catch (error) {
      this.recordEvidence('error', 'Failed to start ONCE server', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Stop ONCE server via CLI (black-box control)
   */
  protected stopONCEServer(pid?: number): void {
    try {
      if (pid && pid > 0) {
        execSync(`kill ${pid}`, { encoding: 'utf8' });
        this.recordEvidence('step', 'ONCE server stopped via PID', { pid });
      } else {
        // Fallback: find and kill by port
        execSync('pkill -f "once.sh startServer" || true', { encoding: 'utf8' });
        this.recordEvidence('step', 'ONCE server stopped via pkill', {});
      }
    } catch (error) {
      this.recordEvidence('error', 'Failed to stop ONCE server', {
        error: error instanceof Error ? error.message : String(error),
        pid
      });
    }
  }

  /**
   * Invoke ONCE CLI command (black-box interaction)
   */
  protected invokeONCECLI(
    command: string,
    componentName: string = 'ONCE',
    version: string = '0.3.21.8'
  ): string {
    try {
      const oncePath = join(this.projectRoot, 'components', componentName, version);
      const cmd = `cd ${oncePath} && ./once.sh ${command}`;
      
      const output = execSync(cmd, { 
        encoding: 'utf8',
        cwd: oncePath
      });

      this.recordEvidence('step', 'ONCE CLI invocation', {
        command,
        output: output.substring(0, 500) // Limit output size
      });

      return output;
    } catch (error) {
      this.recordEvidence('error', 'ONCE CLI invocation failed', {
        command,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Send demo message via CLI (black-box interaction)
   */
  protected sendDemoMessage(message: string): string {
    return this.invokeONCECLI(`demoMessages "${message}"`);
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Wait for ONCE server to be ready (observe bootstrap scenario)
   */
  private async waitForServerReady(maxWaitMs: number = 10000): Promise<void> {
    const bootstrapPath = 'scenarios/ONCE/0.3.21.8/bootstrap.scenario.json';
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const scenario = this.readScenario(bootstrapPath);
      
      if (scenario?.model?.serverReady === true) {
        this.recordEvidence('step', 'ONCE server ready', {
          bootstrapPath,
          waitTimeMs: Date.now() - startTime
        });
        return;
      }

      // Wait 100ms before next check
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Server not ready after ${maxWaitMs}ms`);
  }

  /**
   * Detect project root from test isolation environment
   */
  private detectProjectRootFromTest(): string {
    const cwd = process.cwd();
    
    // If in test/data, go up to project root
    if (cwd.includes('test/data')) {
      const parts = cwd.split('/test/data');
      return parts[0];
    }
    
    return cwd;
  }

  /**
   * Record evidence during test execution
   * Overrides parent to add ONCE-specific context
   */
  protected recordEvidence(type: string, description: string, data: any): void {
    const timestamp = new Date().toISOString();
    
    // Add ONCE context to all evidence
    const enhancedData = {
      ...data,
      testIsolation: process.cwd().includes('test/data'),
      projectRoot: this.projectRoot
    };

    // Call parent's recordEvidence (if available)
    // Otherwise, log directly
    console.log(`[${timestamp}][${type.toUpperCase()}] ${description}:`, enhancedData);
  }
}

