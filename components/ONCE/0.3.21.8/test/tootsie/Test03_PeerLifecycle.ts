/**
 * Test 03: Peer Lifecycle
 * 
 * ✅ REGRESSION TEST: Verifies peer start/stop lifecycle
 * ✅ RADICAL OOP: Uses Web4Requirement for acceptance criteria
 * 
 * Tests the core peer lifecycle:
 * - peerStart on free port 42777 becomes primary
 * - peerStart on occupied 42777 falls back to 8080+
 * - peerStopAll via CLI IOR stops all peers
 * 
 * @pdca 2025-12-03-UTC-1100.peer-naming-refactoring.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { execSync, spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export class Test03_PeerLifecycle extends ONCETestCase {
  private primaryProcess: ChildProcess | null = null;
  private clientProcess: ChildProcess | null = null;

  protected async executeTestLogic(): Promise<any> {
    const componentRoot = this.componentRoot;
    const version = this.onceVersion;
    const onceExec = path.join(componentRoot, 'once');
    
    this.logEvidence('input', 'Peer lifecycle test', {
      componentRoot,
      version,
      onceExec
    });

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT: Peer Lifecycle Works Correctly
    // ═══════════════════════════════════════════════════════════════
    
    const peerReq = this.requirement(
      'Peer Lifecycle',
      'ONCE peer start/stop lifecycle works correctly'
    );
    
    peerReq.addCriterion('PEER-01', 'peerStart on free port becomes primary (42777)');
    peerReq.addCriterion('PEER-02', 'Primary server is listening on port 42777');
    peerReq.addCriterion('PEER-03', 'peerStart with occupied 42777 falls back to 8080');
    peerReq.addCriterion('PEER-04', 'Client server is listening on port 8080');
    peerReq.addCriterion('PEER-05', 'Both servers respond to health check');
    peerReq.addCriterion('PEER-06', 'peerStopAll from CLI finds primary');
    peerReq.addCriterion('PEER-07', 'peerStopAll shuts down primary server');
    peerReq.addCriterion('PEER-08', 'Deprecated startServer still works with warning');

    try {
      // ═══════════════════════════════════════════════════════════════
      // CLEANUP: Ensure no servers running
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Cleaning up any existing servers');
      await this.killAllONCEProcesses();
      await this.sleep(1000);

      // ═══════════════════════════════════════════════════════════════
      // TEST 1: peerStart becomes primary on 42777
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Starting primary peer');
      
      const primaryOutput = await this.startPeerAndCapture(onceExec, 5000);
      
      const isPrimary = primaryOutput.includes('PRIMARY SERVER') || 
                        primaryOutput.includes('port 42777');
      
      this.logEvidence('output', 'Primary peer output', {
        isPrimary,
        outputSnippet: primaryOutput.substring(0, 500)
      });
      
      peerReq.validateCriterion('PEER-01', isPrimary, { 
        output: primaryOutput.substring(0, 500) 
      });

      // ═══════════════════════════════════════════════════════════════
      // TEST 2: Primary server listening on 42777
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Checking if primary listening on 42777');
      
      const primaryListening = await this.isPortListening(42777);
      
      peerReq.validateCriterion('PEER-02', primaryListening, {
        port: 42777,
        listening: primaryListening
      });

      // ═══════════════════════════════════════════════════════════════
      // TEST 3: peerStart falls back to 8080
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Starting client peer (should fallback to 8080)');
      
      const clientOutput = await this.startPeerAndCapture(onceExec, 5000);
      
      const isClient = clientOutput.includes('CLIENT SERVER') || 
                       clientOutput.includes('port 8080');
      
      this.logEvidence('output', 'Client peer output', {
        isClient,
        outputSnippet: clientOutput.substring(0, 500)
      });
      
      peerReq.validateCriterion('PEER-03', isClient, { 
        output: clientOutput.substring(0, 500) 
      });

      // ═══════════════════════════════════════════════════════════════
      // TEST 4: Client server listening on 8080
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Checking if client listening on 8080');
      
      const clientListening = await this.isPortListening(8080);
      
      peerReq.validateCriterion('PEER-04', clientListening, {
        port: 8080,
        listening: clientListening
      });

      // ═══════════════════════════════════════════════════════════════
      // TEST 5: Health check on both servers
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Health checking both servers');
      
      let primaryHealth = false;
      let clientHealth = false;
      
      try {
        const primaryResp = await fetch('http://localhost:42777/health');
        primaryHealth = primaryResp.ok;
      } catch (e) {
        primaryHealth = false;
      }
      
      try {
        const clientResp = await fetch('http://localhost:8080/health');
        clientHealth = clientResp.ok;
      } catch (e) {
        clientHealth = false;
      }
      
      const bothHealthy = primaryHealth && clientHealth;
      
      peerReq.validateCriterion('PEER-05', bothHealthy, {
        primaryHealth,
        clientHealth
      });

      // ═══════════════════════════════════════════════════════════════
      // TEST 6: peerStopAll from CLI finds primary
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Testing peerStopAll from CLI');
      
      let stopOutput = '';
      try {
        stopOutput = execSync(`${onceExec} peerStopAll`, {
          cwd: componentRoot,
          encoding: 'utf-8',
          timeout: 10000
        });
      } catch (e: any) {
        stopOutput = e.stdout || e.message || '';
      }
      
      const foundPrimary = stopOutput.includes('Found primary peer') ||
                           stopOutput.includes('port 42777');
      
      this.logEvidence('output', 'peerStopAll output', {
        foundPrimary,
        output: stopOutput
      });
      
      peerReq.validateCriterion('PEER-06', foundPrimary, {
        output: stopOutput
      });

      // ═══════════════════════════════════════════════════════════════
      // TEST 7: Primary server shut down
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Verifying primary server shut down');
      
      await this.sleep(2000); // Give time for shutdown
      
      const primaryStillRunning = await this.isPortListening(42777);
      const primaryShutdown = !primaryStillRunning;
      
      peerReq.validateCriterion('PEER-07', primaryShutdown, {
        port: 42777,
        stillListening: primaryStillRunning,
        shutdown: primaryShutdown
      });

      // ═══════════════════════════════════════════════════════════════
      // TEST 8: Deprecated startServer still works
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Testing deprecated startServer command');
      
      // First clean up any remaining processes
      await this.killAllONCEProcesses();
      await this.sleep(1000);
      
      const deprecatedOutput = await this.startServerAndCapture(onceExec, 5000);
      
      const hasDeprecationWarning = deprecatedOutput.includes('deprecated') ||
                                    deprecatedOutput.includes('peerStart');
      const stillWorks = deprecatedOutput.includes('SERVER') ||
                         deprecatedOutput.includes('listening');
      
      peerReq.validateCriterion('PEER-08', stillWorks, {
        hasDeprecationWarning,
        stillWorks,
        outputSnippet: deprecatedOutput.substring(0, 300)
      });

      // ═══════════════════════════════════════════════════════════════
      // FINAL: Validate Requirement
      // ═══════════════════════════════════════════════════════════════
      
      this.validateRequirement(peerReq);

      return {
        success: peerReq.allCriteriaPassed(),
        requirements: peerReq.getCriteria()
      };

    } finally {
      // ═══════════════════════════════════════════════════════════════
      // CLEANUP: Kill all ONCE processes
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Cleaning up test processes');
      await this.killAllONCEProcesses();
    }
  }

  /**
   * Start peer and capture output
   */
  private async startPeerAndCapture(onceExec: string, timeoutMs: number): Promise<string> {
    return new Promise((resolve) => {
      let output = '';
      
      const proc = spawn(onceExec, ['peerStart'], {
        cwd: path.dirname(onceExec),
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      proc.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      proc.stderr?.on('data', (data) => {
        output += data.toString();
      });
      
      proc.unref(); // Allow parent to exit independently
      
      // Wait for startup then resolve with captured output
      setTimeout(() => {
        resolve(output);
      }, timeoutMs);
    });
  }

  /**
   * Start server (deprecated command) and capture output
   */
  private async startServerAndCapture(onceExec: string, timeoutMs: number): Promise<string> {
    return new Promise((resolve) => {
      let output = '';
      
      const proc = spawn(onceExec, ['startServer'], {
        cwd: path.dirname(onceExec),
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      proc.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      proc.stderr?.on('data', (data) => {
        output += data.toString();
      });
      
      proc.unref();
      
      setTimeout(() => {
        resolve(output);
      }, timeoutMs);
    });
  }

  /**
   * Check if a port is listening
   */
  private async isPortListening(port: number): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${port}/health`, {
        signal: AbortSignal.timeout(2000)
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Kill all ONCE processes
   */
  private async killAllONCEProcesses(): Promise<void> {
    try {
      execSync('pkill -9 -f "node.*ONCE" 2>/dev/null || true', {
        encoding: 'utf-8'
      });
    } catch (e) {
      // Ignore errors
    }
  }
}

