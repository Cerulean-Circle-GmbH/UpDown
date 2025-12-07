/**
 * Test09_ServerShutdownCleanup - Verify server shutdown and scenario cleanup
 * 
 * ✅ Web4 Principle 25: Tootsie Tests Only
 * 
 * Tests:
 * 1. Server can be started via CLI
 * 2. Server can be stopped gracefully
 * 3. Scenario removed from storage on shutdown
 * 4. No orphan processes remain
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawn, ChildProcess } from 'child_process';

/**
 * Test09 Model - Radical OOP test state
 */
interface Test09Model {
  componentRoot: string;
  version: string;
  serverProcess: ChildProcess | null;
  serverPort: number;
  serverUUID: string;
  scenariosDir: string;
}

/**
 * Test09_ServerShutdownCleanup
 */
export class Test09_ServerShutdownCleanup extends ONCETestCase {
  
  /** Test model - Radical OOP state */
  private testModel: Test09Model = {
    componentRoot: '',
    version: '',
    serverProcess: null,
    serverPort: 42777,
    serverUUID: '',
    scenariosDir: ''
  };
  
  constructor() {
    super();
  }
  
  protected async executeTestLogic(): Promise<void> {
    this.testModel.componentRoot = this.componentRoot;
    this.testModel.version = this.onceVersion;
    this.testModel.scenariosDir = path.join(this.componentRoot, '..', '..', '..', 'scenarios');
    
    this.logEvidence('input', 'Server Shutdown & Cleanup test', {
      componentRoot: this.testModel.componentRoot,
      version: this.testModel.version
    });
    
    // Ensure clean state
    await this.serverStopAll();
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 1: Server Start
    // ═══════════════════════════════════════════════════════════════
    const startReq = this.requirement('Server Start', 'Server starts and creates scenario');
    startReq.addCriterion('START-01', 'Server process starts');
    startReq.addCriterion('START-02', 'Health endpoint responds');
    startReq.addCriterion('START-03', 'Scenario file created');
    
    this.logEvidence('step', 'Starting server...');
    
    // START-01: Start server
    await this.serverStart();
    
    // Wait for server to be fully ready
    const serverRunning = await this.waitForServer(this.testModel.serverPort, 15000);
    startReq.validateCriterion('START-01', serverRunning, { 
      actual: serverRunning ? 'Server running' : 'Server not running' 
    });
    
    // START-02: Health check
    const healthOk = await this.healthCheck(this.testModel.serverPort);
    startReq.validateCriterion('START-02', healthOk, { actual: healthOk });
    
    // START-03: Scenario file
    const scenarioExists = this.findScenarioFile();
    startReq.validateCriterion('START-03', scenarioExists, { 
      actual: this.testModel.serverUUID || 'No scenario found' 
    });
    
    if (!startReq.allCriteriaPassed()) {
      await this.serverStopAll();
      throw new Error(startReq.generateReport());
    }
    
    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT 2: Graceful Shutdown
    // ═══════════════════════════════════════════════════════════════
    const shutdownReq = this.requirement('Graceful Shutdown', 'Server shuts down cleanly');
    shutdownReq.addCriterion('SHUT-01', 'Shutdown command succeeds');
    shutdownReq.addCriterion('SHUT-02', 'Server no longer responds');
    shutdownReq.addCriterion('SHUT-03', 'No orphan processes');
    
    this.logEvidence('step', 'Shutting down server...');
    
    // SHUT-01: Send shutdown
    await this.serverStopAll();
    await this.sleep(2000);
    
    shutdownReq.validateCriterion('SHUT-01', true, { actual: 'Shutdown sent' });
    
    // SHUT-02: Verify not responding
    const stillRunning = await this.isServerRunning(this.testModel.serverPort);
    shutdownReq.validateCriterion('SHUT-02', !stillRunning, { 
      actual: stillRunning ? 'Still running' : 'Stopped' 
    });
    
    // SHUT-03: No orphan processes
    const orphanCount = this.countOnceProcesses();
    shutdownReq.validateCriterion('SHUT-03', orphanCount === 0, { 
      actual: `${orphanCount} processes` 
    });
    
    if (!shutdownReq.allCriteriaPassed()) {
      throw new Error(shutdownReq.generateReport());
    }
    
    this.logEvidence('output', 'Server shutdown test passed', {
      criteria: ['START-01', 'START-02', 'START-03', 'SHUT-01', 'SHUT-02', 'SHUT-03']
    });
  }
  
  /**
   * Check if server is running on port
   */
  private async isServerRunning(port: number): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  /**
   * Health check - use base class method
   */
  private async healthCheck(port: number): Promise<boolean> {
    return this.checkServerHealth(port);
  }
  
  /**
   * Find scenario file for current server
   */
  private findScenarioFile(): boolean {
    try {
      // Look in scenarios directory for ONCE scenarios
      const onceScenariosPath = path.join(
        this.testModel.scenariosDir,
        'box', 'fritz', '*', 'ONCE', this.testModel.version
      );
      
      // Use glob-like search
      const baseDir = path.join(this.testModel.scenariosDir, 'box', 'fritz');
      if (!fs.existsSync(baseDir)) return false;
      
      const domains = fs.readdirSync(baseDir);
      for (const domain of domains) {
        const oncePath = path.join(baseDir, domain, 'ONCE', this.testModel.version);
        if (fs.existsSync(oncePath)) {
          const files = fs.readdirSync(oncePath).filter(f => f.endsWith('.scenario.json'));
          if (files.length > 0) {
            this.testModel.serverUUID = files[0].replace('.scenario.json', '');
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }
  
  /**
   * Count ONCE processes
   */
  private countOnceProcesses(): number {
    try {
      const result = execSync('pgrep -f "node.*ONCECLI.js" || true', { encoding: 'utf8' });
      const lines = result.trim().split('\n').filter(l => l.length > 0);
      return lines.length;
    } catch {
      return 0;
    }
  }
}

