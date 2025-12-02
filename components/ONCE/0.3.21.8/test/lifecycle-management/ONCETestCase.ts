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

import { DefaultWeb4TestCase } from '../../../../Web4Test/0.3.20.6/src/ts/layer2/DefaultWeb4TestCase.js';
import { TestScenario } from '../../../../Web4Test/0.3.20.6/src/ts/layer3/TestScenario.js';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

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
    // ✅ Auto-detect project root from import.meta.url (ESM compliant)
    this.projectRoot = this.detectProjectRootFromImportMeta();
    this.testDataRoot = path.join(this.projectRoot, 'test/data');
  }

  /**
   * Initialize with scenario and detect test isolation
   */
  init(scenario: TestScenario): this {
    super.init(scenario);
    
    // ✅ Path Authority: Override from scenario if provided
    if ((scenario as any).testDataScenario?.projectRoot) {
      this.projectRoot = (scenario as any).testDataScenario.projectRoot;
    }
    
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
    const fullPath = path.join(this.projectRoot, scenarioPath);
    
    if (!fs.existsSync(fullPath)) {
      this.logEvidence('step', 'Scenario file not found', { scenarioPath: fullPath });
      return null;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const scenario = JSON.parse(content);
      
      this.logEvidence('step', 'Scenario file read', {
        scenarioPath: fullPath,
        scenarioUUID: scenario.uuid || 'N/A',
        timestamp: scenario.model?.timestamp || 'N/A'
      });

      return scenario;
    } catch (error) {
      this.logEvidence('error', 'Failed to read scenario file', {
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
    const fullPath = path.join(this.projectRoot, scenarioPath);
    
    return new Promise((resolve) => {
      const initialMtime = fs.existsSync(fullPath) 
        ? fs.readFileSync(fullPath, 'utf8') 
        : null;

      let changeDetected = false;
      const watcher = fs.watch(fullPath, (eventType) => {
        if (eventType === 'change' && !changeDetected) {
          changeDetected = true;
          const newContent = fs.readFileSync(fullPath, 'utf8');
          
          if (newContent !== initialMtime) {
            this.logEvidence('step', 'Scenario file changed (WebSocket effect observed)', {
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
          this.logEvidence('step', 'Scenario change timeout', {
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
    const beforeValue = this.getFieldByPath(before, fieldPath);
    const afterValue = this.getFieldByPath(after, fieldPath);
    const changed = beforeValue !== afterValue;

    this.logEvidence('assertion', 'Scenario comparison', {
      fieldPath,
      beforeValue,
      afterValue,
      changed
    });

    return changed;
  }

  /**
   * Get nested field value by dot-notation path (Radical OOP - method, not function)
   */
  private getFieldByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
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
      const oncePath = path.join(this.projectRoot, 'components', componentName, version);
      const onceExec = path.join(oncePath, 'once.sh');

      // Start server in background
      const cmd = `cd ${oncePath} && ./once.sh startServer &`;
      const output = execSync(cmd, { 
        encoding: 'utf8',
        cwd: oncePath
      });

      // Extract PID (if available in output)
      const pidMatch = output.match(/PID:\s*(\d+)/);
      const pid = pidMatch ? parseInt(pidMatch[1]) : 0;

      this.logEvidence('step', 'ONCE server started via CLI', {
        componentName,
        version,
        pid,
        command: cmd
      });

      // Wait for server to be ready (observe scenario bootstrap)
      await this.waitForServerReady();

      return pid;
    } catch (error) {
      this.logEvidence('error', 'Failed to start ONCE server', {
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
        this.logEvidence('step', 'ONCE server stopped via PID', { pid });
      } else {
        // Fallback: find and kill by port
        execSync('pkill -f "once.sh startServer" || true', { encoding: 'utf8' });
        this.logEvidence('step', 'ONCE server stopped via pkill', {});
      }
    } catch (error) {
      this.logEvidence('error', 'Failed to stop ONCE server', {
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
      const oncePath = path.join(this.projectRoot, 'components', componentName, version);
      const cmd = `cd ${oncePath} && ./once.sh ${command}`;
      
      const output = execSync(cmd, { 
        encoding: 'utf8',
        cwd: oncePath
      });

      this.logEvidence('step', 'ONCE CLI invocation', {
        command,
        output: output.substring(0, 500) // Limit output size
      });

      return output;
    } catch (error) {
      this.logEvidence('error', 'ONCE CLI invocation failed', {
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
  // TEST MANAGEMENT (Radical OOP - Tests manage themselves!)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Rename this test to a new name (Radical OOP - test renames itself!)
   * Updates filename, class name, function names, and UUIDs
   * 
   * @param newName New test name (e.g., "ServerStartup" or "PathAuthority")
   * @param newNumber Optional new number (if not provided, keeps current number)
   */
  rename(newName: string, newNumber?: number): this {
    // ✅ ESM way to get current file path
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFilePath);
    
    // Extract current test info from filename
    const currentFileName = path.basename(currentFilePath);
    const match = currentFileName.match(/Test(\d+)_(.+)\.ts$/);
    
    if (!match) {
      throw new Error(`Cannot extract test info from filename: ${currentFileName}`);
    }
    
    const oldNumber = match[1];
    const oldName = match[2];
    const finalNumber = newNumber !== undefined ? String(newNumber).padStart(2, '0') : oldNumber;
    
    // Generate new filename
    const newFilename = `Test${finalNumber}_${newName}.ts`;
    const newFilePath = path.join(currentDir, newFilename);
    
    // Read current file content
    let content = fs.readFileSync(currentFilePath, 'utf8');
    
    // Update all references in content
    // 1. Class name
    content = content.replace(
      new RegExp(`Test${oldNumber}_${oldName}`, 'g'), 
      `Test${finalNumber}_${newName}`
    );
    
    // 2. Test title in comments
    content = content.replace(
      new RegExp(`Test ${oldNumber}:`, 'g'), 
      `Test ${finalNumber}:`
    );
    
    // 3. Scenario factory function name
    content = content.replace(
      new RegExp(`createTest${oldNumber}Scenario`, 'g'), 
      `createTest${finalNumber}Scenario`
    );
    
    // 4. UUID references
    const oldUuidPart = oldName.replace(/([A-Z])/g, '-$1').toLowerCase().substring(1);
    const newUuidPart = newName.replace(/([A-Z])/g, '-$1').toLowerCase().substring(1);
    content = content.replace(
      new RegExp(`test:uuid:once-lifecycle-${oldNumber}-${oldUuidPart}`, 'g'), 
      `test:uuid:once-lifecycle-${finalNumber}-${newUuidPart}`
    );
    
    // Write updated content to new file
    fs.writeFileSync(newFilePath, content, 'utf8');
    
    // Delete old file if different
    if (currentFilePath !== newFilePath) {
      fs.unlinkSync(currentFilePath);
    }
    
    console.log(`✅ Test renamed:`);
    console.log(`   From: Test${oldNumber}_${oldName}`);
    console.log(`   To:   Test${finalNumber}_${newName}`);
    console.log(`   File: ${currentFileName} → ${newFilename}`);
    
    return this;
  }

  /**
   * Renumber this test to a new number (Radical OOP - test renames itself!)
   * Updates filename, class name, function names, and UUIDs
   */
  renumber(newNumber: number): this {
    // ✅ ESM way to get current filename
    const currentFileName = path.basename(fileURLToPath(import.meta.url));
    const match = currentFileName.match(/Test\d+_(.+)\.ts$/);
    
    if (!match) {
      throw new Error(`Cannot extract test name from filename: ${currentFileName}`);
    }
    
    const currentName = match[1];
    return this.rename(currentName, newNumber);
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
        this.logEvidence('step', 'ONCE server ready', {
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
   * Detect project root from import.meta.url (ESM compliant)
   * Path Authority principle - auto-detect from file location
   */
  private detectProjectRootFromImportMeta(): string {
    // ✅ ESM way:
    const currentFilePath = fileURLToPath(import.meta.url);
    // From: components/ONCE/0.3.21.8/test/lifecycle-management/ONCETestCase.ts
    // Navigate up to project root
    const testDir = path.dirname(currentFilePath);         // test/lifecycle-management
    const testRoot = path.dirname(testDir);                 // test
    const versionRoot = path.dirname(testRoot);             // 0.3.21.8
    const componentRoot = path.dirname(versionRoot);        // ONCE
    const componentsRoot = path.dirname(componentRoot);     // components
    const projectRoot = path.dirname(componentsRoot);       // UpDown (project root)
    return projectRoot;
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
   * Log test evidence (ONCE-specific)
   * Note: Parent's recordEvidence is private, so we log separately
   */
  private logEvidence(type: string, description: string, data: any): void {
    const timestamp = new Date().toISOString();
    
    // Add ONCE context
    const enhancedData = {
      ...data,
      testIsolation: process.cwd().includes('test/data'),
      projectRoot: this.projectRoot
    };

    console.log(`[${timestamp}][${type.toUpperCase()}] ${description}:`, enhancedData);
  }

}

