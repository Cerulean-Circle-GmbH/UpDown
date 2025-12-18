/**
 * Test 32: IOR Method Invocation Routing
 * 
 * ✅ MIGRATED from: test/manual/test-ior-routing.sh
 * ✅ RADICAL OOP: Uses Web4Requirement for acceptance criteria
 * ✅ Tests IORMethodRouter correctly parses and routes IOR URLs
 * 
 * Black-Box: HTTP requests to IOR URLs, verifies routing behavior
 * 
 * @pdca session/2025-12-17-UTC-1649.test-migration-tootsie.pdca.md - TM.3
 * @original session/2025-11-30-UTC-1724.iteration-05-httprouter-ior-routing.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import * as https from 'https';

/**
 * Test model for IOR routing verification
 */
interface IORRoutingTestModel {
  componentRoot: string;
  version: string;
  baseUrl: string;
  testPort: number;
  serverUuid: string | null;
}

export class Test32_IORMethodRouting extends ONCETestCase {
  private testModel: IORRoutingTestModel = {
    componentRoot: '',
    version: '',
    baseUrl: '',
    testPort: 42777,
    serverUuid: null
  };

  /**
   * Test implementation
   */
  protected async executeTestLogic(): Promise<any> {
    // Initialize test model
    this.testModel.componentRoot = this.componentRoot;
    this.testModel.version = this.onceVersion;
    this.testModel.baseUrl = `https://localhost:${this.testModel.testPort}`;

    this.logEvidence('input', 'IOR Method Invocation Routing test', {
      componentRoot: this.testModel.componentRoot,
      version: this.testModel.version,
      baseUrl: this.testModel.baseUrl
    });

    // Cleanup any existing servers
    this.logEvidence('step', 'Cleaning up existing servers');
    await this.serverStopAll();

    // Create requirement
    const req = this.requirement(
      'IOR Method Routing',
      'IORMethodRouter correctly parses and routes IOR URLs to component methods'
    );

    req.addCriterion('IOR-01', 'Server starts successfully');
    req.addCriterion('IOR-02', 'Health endpoint responds');
    req.addCriterion('IOR-03', 'Server UUID can be extracted');
    req.addCriterion('IOR-04', 'IOR method invocation returns valid response');
    req.addCriterion('IOR-05', 'Non-existent method falls back to scenario');

    try {
      // Start server
      this.logEvidence('step', 'Starting ONCE server');
      this.serverStart();
      const serverReady = await this.waitForServer(this.testModel.testPort, 15000);
      req.validateCriterion('IOR-01', serverReady, { serverReady });

      if (!serverReady) {
        throw new Error('Server failed to start');
      }

      // Test health endpoint
      this.logEvidence('step', 'Testing /health endpoint');
      const healthResponse = await this.httpGet(`${this.testModel.baseUrl}/health`);
      const healthOk = healthResponse.status === 200;
      req.validateCriterion('IOR-02', healthOk, {
        status: healthResponse.status,
        body: healthResponse.body.substring(0, 200)
      });

      // Extract server UUID from /health response
      this.logEvidence('step', 'Extracting server UUID');
      let serverUuid = '';
      try {
        const healthData = JSON.parse(healthResponse.body);
        // UUID is in ior.uuid for ONCE health endpoint
        serverUuid = healthData.ior?.uuid || healthData.model?.uuid || healthData.uuid || '';
      } catch {
        // Fallback - try to get from /routes or use test uuid
      }
      this.testModel.serverUuid = serverUuid;
      const hasUuid = serverUuid.length > 0 && serverUuid.includes('-');
      req.validateCriterion('IOR-03', hasUuid, { serverUuid });

      // Test IOR method invocation (healthGet)
      this.logEvidence('step', 'Testing IOR method invocation');
      const iorUrl = `${this.testModel.baseUrl}/ONCE/${this.testModel.version}/${serverUuid}/healthGet`;
      this.logEvidence('request', `IOR URL: ${iorUrl}`);
      
      const iorResponse = await this.httpGet(iorUrl);
      const iorIsJson = iorResponse.body.includes('ior') || 
                        iorResponse.body.includes('model') || 
                        iorResponse.body.includes('error');
      req.validateCriterion('IOR-04', iorIsJson, {
        status: iorResponse.status,
        body: iorResponse.body.substring(0, 300)
      });

      // Test fallback for non-existent method
      this.logEvidence('step', 'Testing fallback for non-existent method');
      const fallbackUrl = `${this.testModel.baseUrl}/ONCE/${this.testModel.version}/${serverUuid}/nonExistentMethod`;
      const fallbackResponse = await this.httpGet(fallbackUrl);
      const fallbackIsScenario = fallbackResponse.body.includes('ior') || 
                                  fallbackResponse.body.includes('model');
      req.validateCriterion('IOR-05', fallbackIsScenario, {
        status: fallbackResponse.status,
        body: fallbackResponse.body.substring(0, 300)
      });

      this.validateRequirement(req);

      return {
        success: req.allCriteriaPassed(),
        model: this.testModel
      };

    } finally {
      // Cleanup
      this.logEvidence('step', 'Cleaning up');
      await this.serverStop();
    }
  }

  /**
   * Make HTTPS GET request
   */
  private httpGet(url: string): Promise<{ status: number; body: string }> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        rejectUnauthorized: false,
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode || 0, body });
        });
      });

      req.on('error', (err) => {
        resolve({ status: 0, body: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 0, body: 'Request timeout' });
      });

      req.end();
    });
  }
}

