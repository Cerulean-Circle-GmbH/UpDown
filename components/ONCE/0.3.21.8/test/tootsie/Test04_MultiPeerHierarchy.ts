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
  
  async execute(): Promise<void> {
    const PRIMARY_PORT = 42777;
    const CLIENT_PORT_1 = 8080;
    const CLIENT_PORT_2 = 8081;
    
    // Step 1: Start primary server
    console.log('[STEP] Starting primary server on 42777');
    this.serverStart();
    await this.waitForServer(PRIMARY_PORT, 15000);
    
    // Step 2: Verify primary is running
    console.log('[STEP] Verifying primary server health');
    const primaryResponse = await this.httpGet(`http://localhost:${PRIMARY_PORT}/health`);
    const primaryHealth = JSON.parse(primaryResponse.body);
    this.assert('Primary server version matches', () => {
      this.expect(primaryHealth.ior?.version).to.equal('0.3.21.8');
    });
    
    // Step 3: Start client server 1
    console.log('[STEP] Starting client server 1 on 8080');
    await this.startClientServer();
    await this.waitForServer(CLIENT_PORT_1, 15000);
    
    // Step 4: Start client server 2
    console.log('[STEP] Starting client server 2 on 8081');
    await this.startClientServer();
    await this.waitForServer(CLIENT_PORT_2, 15000);
    
    // Step 5: Verify /servers shows all peers
    console.log('[STEP] Checking /servers returns all registered peers');
    const serversResponse = await this.httpGet(`http://localhost:${PRIMARY_PORT}/servers`);
    const serversData = JSON.parse(serversResponse.body);
    console.log(`Servers response: ${JSON.stringify(serversData, null, 2)}`);
    
    const servers = serversData.model?.servers || [];
    this.assert('At least 2 client servers registered', () => {
      this.expect(servers.length).to.be.at.least(2);
    });
    
    // Step 6: Verify each client server is healthy
    console.log('[STEP] Verifying client server 1 health');
    const client1Response = await this.httpGet(`http://localhost:${CLIENT_PORT_1}/health`);
    const client1Health = JSON.parse(client1Response.body);
    this.assert('Client 1 version matches', () => {
      this.expect(client1Health.ior?.version).to.equal('0.3.21.8');
    });
    
    console.log('[STEP] Verifying client server 2 health');
    const client2Response = await this.httpGet(`http://localhost:${CLIENT_PORT_2}/health`);
    const client2Health = JSON.parse(client2Response.body);
    this.assert('Client 2 version matches', () => {
      this.expect(client2Health.ior?.version).to.equal('0.3.21.8');
    });
    
    // Step 7: Test peerStopAll cascade
    console.log('[STEP] Testing peerStopAll cascade shutdown');
    await this.callPeerStopAll(PRIMARY_PORT);
    await this.sleep(3000); // Allow cascade
    
    // Step 8: Verify all servers are stopped
    console.log('[STEP] Verifying all servers stopped');
    const primaryStopped = await this.isPortFree(PRIMARY_PORT);
    const client1Stopped = await this.isPortFree(CLIENT_PORT_1);
    const client2Stopped = await this.isPortFree(CLIENT_PORT_2);
    
    this.assert('Primary server stopped', () => {
      this.expect(primaryStopped).to.be.true;
    });
    this.assert('Client server 1 stopped', () => {
      this.expect(client1Stopped).to.be.true;
    });
    this.assert('Client server 2 stopped', () => {
      this.expect(client2Stopped).to.be.true;
    });
    
    console.log('✅ Multi-peer hierarchy test passed');
  }
  
  /**
   * Start a client server using CLI (runs in background)
   */
  private async startClientServer(): Promise<void> {
    const { exec } = await import('child_process');
    
    // Start client server in background
    exec(`cd ${this.componentRoot} && ./once peerStart`, { 
      detached: true,
      stdio: 'ignore'
    });
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
      console.log(`peerStopAll response: ${error}`);
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

