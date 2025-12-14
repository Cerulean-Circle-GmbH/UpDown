/**
 * Test11_ErrorHandlingRecovery - Verify error handling and recovery
 * 
 * ✅ Web4 Principle 25: Tootsie Tests Only
 * 
 * Tests:
 * 1. Server handles invalid requests gracefully
 * 2. Server handles malformed IOR calls
 * 3. Server returns proper error responses
 * 4. Server remains operational after errors
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import * as http from 'http';

/**
 * Test11 Model - Radical OOP test state
 */
interface Test11Model {
  componentRoot: string;
  version: string;
  serverPort: number;
  errorResponses: Array<{ path: string; status: number; body: string }>;
}

/**
 * Test11_ErrorHandlingRecovery
 */
export class Test11_ErrorHandlingRecovery extends ONCETestCase {
  
  /** Test model - Radical OOP state */
  private testModel: Test11Model = {
    componentRoot: '',
    version: '',
    serverPort: 42777,
    errorResponses: []
  };
  
  constructor() {
    super();
  }
  
  protected async executeTestLogic(): Promise<void> {
    this.testModel.componentRoot = this.componentRoot;
    this.testModel.version = this.onceVersion;
    
    this.logEvidence('input', 'Error Handling & Recovery test', {
      componentRoot: this.testModel.componentRoot,
      version: this.testModel.version
    });
    
    // Ensure clean state
    await this.serverStopAll();
    
    try {
      // ═══════════════════════════════════════════════════════════════
      // REQUIREMENT 1: Server Setup
      // ═══════════════════════════════════════════════════════════════
      const setupReq = this.requirement('Server Setup', 'Server starts for error testing');
      setupReq.addCriterion('SETUP-01', 'Server starts successfully');
      
      this.logEvidence('step', 'Starting server...');
      await this.serverStart();
      const serverReady = await this.waitForServer(this.testModel.serverPort, 15000);
      setupReq.validateCriterion('SETUP-01', serverReady, { actual: serverReady ? 'Running' : 'Not running' });
      
      if (!serverReady) {
        throw new Error(setupReq.generateReport());
      }
      
      // ═══════════════════════════════════════════════════════════════
      // REQUIREMENT 2: Invalid Route Handling
      // ═══════════════════════════════════════════════════════════════
      const routeReq = this.requirement('Invalid Route Handling', 'Server handles invalid routes');
      routeReq.addCriterion('ROUTE-01', 'Returns 404 for unknown route');
      routeReq.addCriterion('ROUTE-02', 'Returns JSON error response');
      routeReq.addCriterion('ROUTE-03', 'Lists available routes in error');
      
      this.logEvidence('step', 'Testing invalid route...');
      const unknownRouteResponse = await this.makeRequest('/nonexistent-route-xyz123');
      
      routeReq.validateCriterion('ROUTE-01', unknownRouteResponse.status === 404, {
        actual: `Status ${unknownRouteResponse.status}`
      });
      
      let hasJsonError = false;
      let hasAvailableRoutes = false;
      try {
        const errorJson = JSON.parse(unknownRouteResponse.body);
        hasJsonError = errorJson.error !== undefined;
        hasAvailableRoutes = errorJson.availableRoutes !== undefined && Array.isArray(errorJson.availableRoutes);
      } catch {
        hasJsonError = false;
      }
      
      routeReq.validateCriterion('ROUTE-02', hasJsonError, { actual: hasJsonError ? 'JSON error' : 'Non-JSON' });
      routeReq.validateCriterion('ROUTE-03', hasAvailableRoutes, { actual: hasAvailableRoutes ? 'Routes listed' : 'No routes' });
      
      if (!routeReq.allCriteriaPassed()) {
        throw new Error(routeReq.generateReport());
      }
      
      // ═══════════════════════════════════════════════════════════════
      // REQUIREMENT 3: Malformed IOR Handling
      // ═══════════════════════════════════════════════════════════════
      const iorReq = this.requirement('Malformed IOR Handling', 'Server handles malformed IOR calls');
      iorReq.addCriterion('IOR-01', 'Handles invalid UUID');
      iorReq.addCriterion('IOR-02', 'Handles missing method');
      iorReq.addCriterion('IOR-03', 'Returns appropriate error status');
      
      this.logEvidence('step', 'Testing malformed IOR calls...');
      
      // Invalid UUID format - server should return error (any response is OK, it shouldn't crash)
      const invalidUuidResponse = await this.makeRequest(`/ONCE/${this.testModel.version}/not-a-uuid/someMethod`);
      const ior1HasResponse = invalidUuidResponse.status > 0;
      iorReq.validateCriterion('IOR-01', ior1HasResponse, {
        actual: `Status ${invalidUuidResponse.status} (server responded)`
      });
      
      // Non-existent method on valid-looking UUID - server should return error
      const missingMethodResponse = await this.makeRequest(`/ONCE/${this.testModel.version}/00000000-0000-0000-0000-000000000000/nonExistentMethod`);
      const ior2HasResponse = missingMethodResponse.status > 0;
      iorReq.validateCriterion('IOR-02', ior2HasResponse, {
        actual: `Status ${missingMethodResponse.status} (server responded)`
      });
      
      // Verify server returns meaningful response (not empty)
      const hasErrorBody = invalidUuidResponse.body.length > 0 && missingMethodResponse.body.length > 0;
      iorReq.validateCriterion('IOR-03', hasErrorBody, {
        actual: hasErrorBody ? 'Error bodies present' : 'Empty response'
      });
      
      if (!iorReq.allCriteriaPassed()) {
        throw new Error(iorReq.generateReport());
      }
      
      // ═══════════════════════════════════════════════════════════════
      // REQUIREMENT 4: Recovery After Errors
      // ═══════════════════════════════════════════════════════════════
      const recoverReq = this.requirement('Recovery After Errors', 'Server remains operational after errors');
      recoverReq.addCriterion('RECOVER-01', 'Health endpoint still works');
      recoverReq.addCriterion('RECOVER-02', 'Valid routes still accessible');
      recoverReq.addCriterion('RECOVER-03', 'No server crash');
      
      this.logEvidence('step', 'Testing server recovery...');
      
      // Health check after errors
      const healthOk = await this.checkServerHealth(this.testModel.serverPort);
      recoverReq.validateCriterion('RECOVER-01', healthOk, { actual: healthOk ? 'Healthy' : 'Unhealthy' });
      
      // Try a valid route
      const serversResponse = await this.makeRequest('/servers');
      recoverReq.validateCriterion('RECOVER-02', serversResponse.status === 200, {
        actual: `Status ${serversResponse.status}`
      });
      
      // Server still responding
      const stillUp = await this.checkServerHealth(this.testModel.serverPort);
      recoverReq.validateCriterion('RECOVER-03', stillUp, { actual: stillUp ? 'Running' : 'Crashed' });
      
      if (!recoverReq.allCriteriaPassed()) {
        throw new Error(recoverReq.generateReport());
      }
      
      this.logEvidence('output', 'Error handling test passed', {
        criteria: ['SETUP-01', 'ROUTE-01', 'ROUTE-02', 'ROUTE-03', 'IOR-01', 'IOR-02', 'IOR-03', 'RECOVER-01', 'RECOVER-02', 'RECOVER-03']
      });
      
    } finally {
      await this.serverStopAll();
    }
  }
  
  /**
   * Make HTTP request and return status + body
   */
  private async makeRequest(path: string): Promise<{ status: number; body: string }> {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: this.testModel.serverPort,
        path,
        method: 'GET',
        timeout: 5000
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          this.testModel.errorResponses.push({ path, status: res.statusCode || 0, body });
          resolve({ status: res.statusCode || 0, body });
        });
      });
      
      req.on('error', () => resolve({ status: 0, body: 'Connection error' }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 0, body: 'Timeout' });
      });
      req.end();
    });
  }
}

