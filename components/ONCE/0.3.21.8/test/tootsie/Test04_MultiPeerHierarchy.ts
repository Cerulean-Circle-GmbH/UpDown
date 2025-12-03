/**
 * Test04: Multi-Peer Hierarchy
 * 
 * Tests ONCE peer hierarchy with 3+ peers:
 * - Primary server on 42777
 * - Client server 1 on 8080
 * - Client server 2 on 8081
 * 
 * Verifies:
 * - All peers register with primary
 * - /servers returns all registered peers
 * - peerStopAll cascades to all peers
 * 
 * @layer test
 * @pdca 2025-12-03-UTC-1930.websocket-scenario-broadcast.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';

export class Test04_MultiPeerHierarchy extends ONCETestCase {
  
  get testName(): string {
    return 'Test04_MultiPeerHierarchy';
  }
  
  get testDescription(): string {
    return 'Multi-peer hierarchy with 3+ peers and cascade shutdown';
  }
  
  protected async executeTestLogic(): Promise<any> {
    const PRIMARY_PORT = 42777;
    const CLIENT_PORT_1 = 8080;
    const CLIENT_PORT_2 = 8081;
    
    // Create Web4Requirement for acceptance criteria
    const peerReq = this.requirement(
      'Multi-Peer Hierarchy',
      'Test ONCE multi-peer hierarchy with primary + 2 client servers'
    );
    
    // Define acceptance criteria
    peerReq.addCriterion('MPEER-01', 'Primary server starts and responds to /health');
    peerReq.addCriterion('MPEER-02', 'Client server 1 starts and registers with primary');
    peerReq.addCriterion('MPEER-03', 'Client server 2 starts and registers with primary');
    peerReq.addCriterion('MPEER-04', '/servers returns at least 2 client servers');
    peerReq.addCriterion('MPEER-05', 'Client server 1 /health returns correct version');
    peerReq.addCriterion('MPEER-06', 'Client server 2 /health returns correct version');
    peerReq.addCriterion('MPEER-07', 'peerStopAll cascade stops all servers');
    
    // ═══════════════════════════════════════════════════════════════
    // TEST 1: Start Primary Server
    // ═══════════════════════════════════════════════════════════════
    
    this.logEvidence('step', 'Starting primary server on 42777');
    this.serverStart();
    await this.waitForServer(PRIMARY_PORT, 15000);
    
    const primaryResponse = await this.httpGet(`http://localhost:${PRIMARY_PORT}/health`);
    const primaryHealth = JSON.parse(primaryResponse.body);
    const primaryVersionCorrect = primaryHealth.ior?.version === '0.3.21.8';
    
    peerReq.validateCriterion('MPEER-01', primaryVersionCorrect, {
      version: primaryHealth.ior?.version,
      uuid: primaryHealth.ior?.uuid
    });
    
    // ═══════════════════════════════════════════════════════════════
    // TEST 2: Start Client Server 1
    // ═══════════════════════════════════════════════════════════════
    
    this.logEvidence('step', 'Starting client server 1 on 8080');
    await this.startClientServer();
    await this.waitForServer(CLIENT_PORT_1, 15000);
    await this.sleep(2000); // Allow registration to complete
    
    let serversResponse = await this.httpGet(`http://localhost:${PRIMARY_PORT}/servers`);
    let serversData = JSON.parse(serversResponse.body);
    const client1Registered = (serversData.model?.servers?.length || 0) >= 1;
    
    peerReq.validateCriterion('MPEER-02', client1Registered, {
      serversCount: serversData.model?.servers?.length || 0
    });
    
    // ═══════════════════════════════════════════════════════════════
    // TEST 3: Start Client Server 2
    // ═══════════════════════════════════════════════════════════════
    
    this.logEvidence('step', 'Starting client server 2 on 8081');
    await this.startClientServer();
    await this.waitForServer(CLIENT_PORT_2, 15000);
    await this.sleep(2000); // Allow registration to complete
    
    serversResponse = await this.httpGet(`http://localhost:${PRIMARY_PORT}/servers`);
    serversData = JSON.parse(serversResponse.body);
    const client2Registered = (serversData.model?.servers?.length || 0) >= 2;
    
    peerReq.validateCriterion('MPEER-03', client2Registered, {
      serversCount: serversData.model?.servers?.length || 0
    });
    
    // ═══════════════════════════════════════════════════════════════
    // TEST 4: Verify /servers Returns All Peers
    // ═══════════════════════════════════════════════════════════════
    
    this.logEvidence('step', 'Checking /servers returns all registered peers');
    const servers = serversData.model?.servers || [];
    const hasMinimumPeers = servers.length >= 2;
    
    peerReq.validateCriterion('MPEER-04', hasMinimumPeers, {
      expectedMinimum: 2,
      actual: servers.length,
      serverUUIDs: servers.map((s: any) => s.ior?.uuid)
    });
    
    // ═══════════════════════════════════════════════════════════════
    // TEST 5: Verify Client Server 1 Health
    // ═══════════════════════════════════════════════════════════════
    
    this.logEvidence('step', 'Verifying client server 1 health');
    const client1Response = await this.httpGet(`http://localhost:${CLIENT_PORT_1}/health`);
    const client1Health = JSON.parse(client1Response.body);
    const client1VersionCorrect = client1Health.ior?.version === '0.3.21.8';
    
    peerReq.validateCriterion('MPEER-05', client1VersionCorrect, {
      version: client1Health.ior?.version,
      uuid: client1Health.ior?.uuid,
      port: CLIENT_PORT_1
    });
    
    // ═══════════════════════════════════════════════════════════════
    // TEST 6: Verify Client Server 2 Health
    // ═══════════════════════════════════════════════════════════════
    
    this.logEvidence('step', 'Verifying client server 2 health');
    const client2Response = await this.httpGet(`http://localhost:${CLIENT_PORT_2}/health`);
    const client2Health = JSON.parse(client2Response.body);
    const client2VersionCorrect = client2Health.ior?.version === '0.3.21.8';
    
    peerReq.validateCriterion('MPEER-06', client2VersionCorrect, {
      version: client2Health.ior?.version,
      uuid: client2Health.ior?.uuid,
      port: CLIENT_PORT_2
    });
    
    // ═══════════════════════════════════════════════════════════════
    // TEST 7: peerStopAll Cascade
    // ═══════════════════════════════════════════════════════════════
    
    this.logEvidence('step', 'Testing peerStopAll cascade shutdown');
    await this.callPeerStopAll(PRIMARY_PORT);
    await this.sleep(5000); // Allow cascade to complete
    
    const primaryStopped = await this.isPortFree(PRIMARY_PORT);
    const client1Stopped = await this.isPortFree(CLIENT_PORT_1);
    const client2Stopped = await this.isPortFree(CLIENT_PORT_2);
    const allStopped = primaryStopped && client1Stopped && client2Stopped;
    
    peerReq.validateCriterion('MPEER-07', allStopped, {
      primaryStopped,
      client1Stopped,
      client2Stopped
    });
    
    // ═══════════════════════════════════════════════════════════════
    // VALIDATE REQUIREMENT
    // ═══════════════════════════════════════════════════════════════
    
    this.validateRequirement(peerReq);
    
    return {
      testName: this.testName,
      passed: peerReq.allCriteriaPassed(),
      serversResponse: serversData
    };
  }
  
  /**
   * Start a client server using CLI (runs in background)
   */
  private async startClientServer(): Promise<void> {
    const { spawn } = await import('child_process');
    
    // Start client server in background using spawn (supports detached)
    const child = spawn('./once', ['peerStart'], {
      cwd: this.componentRoot,
      detached: true,
      stdio: 'ignore'
    });
    
    // Prevent parent from waiting for child
    child.unref();
  }
  
  /**
   * Call peerStopAll via IOR
   */
  private async callPeerStopAll(port: number): Promise<void> {
    try {
      // Get server UUID from health
      const healthResponse = await this.httpGet(`http://localhost:${port}/health`);
      const health = JSON.parse(healthResponse.body);
      const uuid = health.ior?.uuid;
      
      if (uuid) {
        // Call peerStopAll via IOR route
        await this.httpGet(`http://localhost:${port}/ONCE/0.3.21.8/${uuid}/peerStopAll`);
      }
    } catch (error) {
      // Server might already be stopping
      this.logEvidence('info', `peerStopAll response: ${error}`);
    }
  }
  
  /**
   * Check if port is free (server stopped)
   */
  private async isPortFree(port: number): Promise<boolean> {
    try {
      await this.httpGet(`http://localhost:${port}/health`);
      return false; // Server still running
    } catch {
      return true; // Connection refused = port free
    }
  }
}

// Radical OOP: Test is an object, executed via Tootsie CLI
