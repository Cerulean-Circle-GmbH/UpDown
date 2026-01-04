/**
 * Test 24: File Browser Curl Tests
 * 
 * ✅ REGRESSION TEST: Verifies /EAMD.ucp file browser routes work
 * ✅ Uses curl (no Playwright) for stability
 * 
 * Tests:
 * - /EAMD.ucp returns HTML (SPA)
 * - /EAMD.ucp/.../src/?format=json returns JSON directory listing
 * - /EAMD.ucp/.../src/assets/?format=json returns JSON with files
 * 
 * @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { execSync, spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as https from 'https';

export class Test24_FileBrowserCurlTests extends ONCETestCase {
  private serverProcess: ChildProcess | null = null;
  private serverPort = 42777;

  protected async executeTestLogic(): Promise<any> {
    const componentRoot = this.componentRoot;
    const version = this.onceVersion;
    const onceExec = path.join(componentRoot, 'once');
    const baseUrl = `https://localhost:${this.serverPort}`;
    
    this.logEvidence('input', 'File Browser curl test', {
      componentRoot,
      version,
      baseUrl
    });

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT: File Browser Routes Work
    // ═══════════════════════════════════════════════════════════════
    
    const browseReq = this.requirement(
      'File Browser Routes',
      'EAMD.ucp file browser serves correct content types'
    );
    
    browseReq.addCriterion('FB-01', '/EAMD.ucp returns HTML (SPA entry point)');
    browseReq.addCriterion('FB-02', '/EAMD.ucp/.../src/?format=json returns JSON');
    browseReq.addCriterion('FB-03', 'JSON contains entries array');
    browseReq.addCriterion('FB-04', '/EAMD.ucp/.../src/assets/?format=json lists files');
    browseReq.addCriterion('FB-05', 'Assets JSON contains image files');

    try {
      // ═══════════════════════════════════════════════════════════════
      // CLEANUP: Ensure no servers running
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Cleaning up any existing servers');
      await this.killAllONCEProcesses();
      await this.sleep(1000);

      // ═══════════════════════════════════════════════════════════════
      // START SERVER
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Starting ONCE server');
      
      await this.startServerAndWait(onceExec, 8000);
      
      this.logEvidence('output', 'Server started', {
        port: this.serverPort
      });

      // ═══════════════════════════════════════════════════════════════
      // TEST 1: /EAMD.ucp returns HTML
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Testing /EAMD.ucp returns HTML');
      
      const htmlResponse = await this.curlGet(`${baseUrl}/EAMD.ucp`);
      const isHtml = htmlResponse.body.includes('<!DOCTYPE html') || 
                     htmlResponse.body.includes('<html');
      
      this.logEvidence('output', '/EAMD.ucp response', {
        statusCode: htmlResponse.statusCode,
        contentType: htmlResponse.contentType,
        isHtml,
        bodySnippet: htmlResponse.body.substring(0, 200)
      });
      
      browseReq.validateCriterion('FB-01', isHtml, {
        contentType: htmlResponse.contentType
      });

      // ═══════════════════════════════════════════════════════════════
      // TEST 2: ?format=json returns JSON
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Testing ?format=json returns JSON');
      
      const srcPath = `/EAMD.ucp/components/ONCE/${version}/src/`;
      const jsonResponse = await this.curlGet(`${baseUrl}${srcPath}?format=json`);
      
      let srcJson: any = null;
      let isJson = false;
      try {
        srcJson = JSON.parse(jsonResponse.body);
        isJson = true;
      } catch (e) {
        isJson = false;
      }
      
      this.logEvidence('output', '?format=json response', {
        statusCode: jsonResponse.statusCode,
        contentType: jsonResponse.contentType,
        isJson,
        bodySnippet: jsonResponse.body.substring(0, 300)
      });
      
      browseReq.validateCriterion('FB-02', isJson, {
        contentType: jsonResponse.contentType
      });

      // ═══════════════════════════════════════════════════════════════
      // TEST 3: JSON has entries array
      // ═══════════════════════════════════════════════════════════════
      
      const hasEntries = srcJson && Array.isArray(srcJson.entries);
      
      this.logEvidence('output', 'JSON structure', {
        hasEntries,
        entriesCount: srcJson?.entries?.length || 0
      });
      
      browseReq.validateCriterion('FB-03', hasEntries, {
        entries: srcJson?.entries?.map((e: any) => e.name) || []
      });

      // ═══════════════════════════════════════════════════════════════
      // TEST 4: Assets directory JSON
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Testing assets directory listing');
      
      const assetsPath = `/EAMD.ucp/components/ONCE/${version}/src/assets/`;
      const assetsResponse = await this.curlGet(`${baseUrl}${assetsPath}?format=json`);
      
      let assetsJson: any = null;
      let assetsIsJson = false;
      try {
        assetsJson = JSON.parse(assetsResponse.body);
        assetsIsJson = true;
      } catch (e) {
        assetsIsJson = false;
      }
      
      this.logEvidence('output', 'Assets JSON response', {
        statusCode: assetsResponse.statusCode,
        isJson: assetsIsJson,
        entries: assetsJson?.entries?.map((e: any) => e.name) || []
      });
      
      browseReq.validateCriterion('FB-04', assetsIsJson && Array.isArray(assetsJson?.entries), {
        entriesCount: assetsJson?.entries?.length || 0
      });

      // ═══════════════════════════════════════════════════════════════
      // TEST 5: Assets contains image files
      // ═══════════════════════════════════════════════════════════════
      
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
      const hasImages = assetsJson?.entries?.some((e: any) => 
        imageExtensions.some(ext => e.name?.toLowerCase().endsWith(ext))
      ) || false;
      
      const imageFiles = assetsJson?.entries?.filter((e: any) =>
        imageExtensions.some(ext => e.name?.toLowerCase().endsWith(ext))
      ).map((e: any) => e.name) || [];
      
      this.logEvidence('output', 'Image files found', {
        hasImages,
        imageFiles
      });
      
      browseReq.validateCriterion('FB-05', hasImages, {
        imageFiles
      });

      // ═══════════════════════════════════════════════════════════════
      // CLEANUP
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Cleaning up');
      await this.killAllONCEProcesses();

      return browseReq.getSummary();

    } catch (error: any) {
      this.logEvidence('error', 'Test failed', { error: error.message });
      await this.killAllONCEProcesses();
      throw error;
    }
  }

  /**
   * Start server and wait for it to be ready
   */
  private async startServerAndWait(onceExec: string, timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Server did not start within ${timeoutMs}ms`));
      }, timeoutMs);

      this.serverProcess = spawn(onceExec, ['peerStart'], {
        cwd: this.componentRoot,
        env: { ...process.env, ONCE_SCENARIO: 'primary' },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';
      
      this.serverProcess.stdout?.on('data', (data) => {
        output += data.toString();
        // Server is ready when we see the listening message
        if (output.includes('HTTPSServer listening') || output.includes('port 42777')) {
          clearTimeout(timeout);
          // Give it a moment to fully initialize
          setTimeout(() => resolve(), 1000);
        }
      });

      this.serverProcess.stderr?.on('data', (data) => {
        output += data.toString();
      });

      this.serverProcess.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  /**
   * Make HTTPS GET request (ignoring self-signed cert)
   */
  private async curlGet(url: string): Promise<{ statusCode: number; contentType: string; body: string }> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        rejectUnauthorized: false // Allow self-signed certs
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            contentType: res.headers['content-type'] || '',
            body
          });
        });
      });

      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.end();
    });
  }

  /**
   * Kill all ONCE processes
   */
  private async killAllONCEProcesses(): Promise<void> {
    try {
      execSync('pkill -f "node.*ONCE" 2>/dev/null || true', { stdio: 'ignore' });
    } catch (e) {
      // Ignore errors
    }
    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');
      this.serverProcess = null;
    }
  }
}

// Export for test runner
export default Test24_FileBrowserCurlTests;
