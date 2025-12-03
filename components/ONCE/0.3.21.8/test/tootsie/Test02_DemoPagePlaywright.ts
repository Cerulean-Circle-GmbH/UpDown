/**
 * Test 02: Demo Page with Playwright
 * 
 * ✅ REGRESSION TEST: Verifies /demo route works in real browser
 * ✅ RADICAL OOP: Uses Web4Requirement for acceptance criteria
 * 
 * This is the FOUNDATION test - if /demo doesn't load, nothing else matters.
 * Uses Playwright for real browser testing, not just HTTP requests.
 * 
 * Black-Box: Browser navigates to /demo, verifies page loads
 * 
 * @pdca 2025-12-02-UTC-2115.web4requirement-integration.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

export class Test02_DemoPagePlaywright extends ONCETestCase {
  private browser: Browser | null = null;
  private page: Page | null = null;

  protected async executeTestLogic(): Promise<any> {
    const componentRoot = this.componentRoot;
    const version = this.onceVersion;
    const primaryPort = 42777;
    const demoUrl = `http://localhost:${primaryPort}/demo`;
    
    this.logEvidence('input', 'Demo page Playwright test', {
      componentRoot,
      version,
      demoUrl
    });

    // ═══════════════════════════════════════════════════════════════
    // REQUIREMENT: Demo Page Loads Correctly
    // ═══════════════════════════════════════════════════════════════
    
    const demoReq = this.requirement(
      'Demo Page Functionality',
      'ONCE /demo route loads correctly in browser'
    );
    
    demoReq.addCriterion('DEMO-01', 'Server responds with HTTP 200 OK');
    demoReq.addCriterion('DEMO-02', 'Page has a title');
    demoReq.addCriterion('DEMO-03', 'Page title contains ONCE');
    demoReq.addCriterion('DEMO-04', 'Page has valid HTML structure');
    demoReq.addCriterion('DEMO-05', 'Page contains demo content');
    demoReq.addCriterion('DEMO-06', 'No critical JavaScript errors');
    demoReq.addCriterion('DEMO-07', 'ONCE kernel booted in browser (window.ONCE exists)');
    demoReq.addCriterion('DEMO-08', 'IOR version matches component version (0.3.21.8)');
    demoReq.addCriterion('DEMO-09', 'Shutdown button sends IOR with correct version');
    demoReq.addCriterion('DEMO-10', 'Server shuts down via IOR call');

    // ═══════════════════════════════════════════════════════════════
    // SETUP: Ensure server is running
    // ═══════════════════════════════════════════════════════════════
    
    this.logEvidence('step', 'Checking if server is running');
    
    const serverRunning = await this.checkServerHealth(primaryPort);
    let startedByTest = false;
    
    if (!serverRunning) {
      this.serverStart();
      
      const serverReady = await this.waitForServer(primaryPort, 15000);
      if (!serverReady) {
        await this.serverStop();
        throw new Error('Could not start server for demo test (timeout after 15s)');
      }
      startedByTest = true;
      this.logEvidence('step', 'Server started by test');
    } else {
      this.logEvidence('step', 'Server already running');
    }

    // Collect ALL console errors from the start
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const failedResources: string[] = [];

    try {
      // ═══════════════════════════════════════════════════════════════
      // TEST 1: Launch Browser with Playwright
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Launching Chromium browser');
      
      this.browser = await chromium.launch({ 
        headless: true  // Run headless for CI/automated testing
      });
      this.page = await this.browser.newPage();
      
      // ✅ Set up error listeners BEFORE navigation to capture ALL errors
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      this.page.on('pageerror', error => {
        pageErrors.push(error.message);
      });
      
      this.page.on('requestfailed', request => {
        failedResources.push(`${request.url()}: ${request.failure()?.errorText || 'unknown'}`);
      });
      
      this.logEvidence('step', 'Browser launched, error listeners attached');

      // ═══════════════════════════════════════════════════════════════
      // TEST 2: Navigate to /demo
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Navigating to demo page', { url: demoUrl });
      
      const response = await this.page.goto(demoUrl, { 
        waitUntil: 'networkidle',  // Wait for all network activity to settle
        timeout: 30000  // Longer timeout for full load
      });
      
      const responseOK = response?.ok() ?? false;
      const statusCode = response?.status() ?? 0;
      
      this.logEvidence('output', 'Navigation result', { responseOK, statusCode });
      
      // Validate criterion DEMO-01
      demoReq.validateCriterion('DEMO-01', responseOK, { statusCode });

      // ═══════════════════════════════════════════════════════════════
      // TEST 3: Verify Page Content
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Verifying page content');
      
      const pageTitle = await this.page.title();
      const bodyContent = await this.page.content();
      
      const hasTitle = pageTitle.length > 0;
      const titleContainsONCE = pageTitle.includes('ONCE');
      const hasHTML = bodyContent.includes('<!DOCTYPE') || bodyContent.includes('<html');
      const hasBody = bodyContent.includes('<body');
      const hasDemoContent = bodyContent.includes('Demo') || bodyContent.includes('demo');
      
      this.logEvidence('output', 'Page content', { pageTitle, hasTitle, titleContainsONCE, hasHTML, hasBody, hasDemoContent });
      
      // Validate criteria DEMO-02 through DEMO-05
      demoReq.validateCriterion('DEMO-02', hasTitle, { pageTitle });
      demoReq.validateCriterion('DEMO-03', titleContainsONCE, { pageTitle });
      demoReq.validateCriterion('DEMO-04', hasHTML && hasBody, { hasHTML, hasBody });
      demoReq.validateCriterion('DEMO-05', hasDemoContent, { hasDemoContent });

      // ═══════════════════════════════════════════════════════════════
      // TEST 4: Take Screenshot as Evidence
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Taking screenshot');
      
      const screenshotDir = path.join(componentRoot, 'test', 'tootsie', 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const screenshotPath = path.join(screenshotDir, `test02-demo-page-${Date.now()}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      
      this.logEvidence('output', 'Screenshot saved', { path: screenshotPath });

      // ═══════════════════════════════════════════════════════════════
      // TEST 5: Check for JavaScript Errors (collected since page load)
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Checking for console errors (collected during load)');
      
      // Wait a bit more for any async errors
      await this.sleep(2000);
      
      const totalErrors = consoleErrors.length + pageErrors.length + failedResources.length;
      const noErrors = totalErrors === 0;
      
      this.logEvidence('output', 'JavaScript validation', { 
        noErrors, 
        consoleErrorCount: consoleErrors.length,
        pageErrorCount: pageErrors.length,
        failedResourceCount: failedResources.length,
        consoleErrors: consoleErrors.slice(0, 5),
        pageErrors: pageErrors.slice(0, 5),
        failedResources: failedResources.slice(0, 5)
      });
      
      // Validate criterion DEMO-06
      demoReq.validateCriterion('DEMO-06', noErrors, { 
        consoleErrors: consoleErrors.slice(0, 5),
        pageErrors: pageErrors.slice(0, 5),
        failedResources: failedResources.slice(0, 5)
      });

      // ═══════════════════════════════════════════════════════════════
      // TEST 6: Check if ONCE Kernel Booted
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Checking if ONCE kernel booted in browser');
      
      // Wait for ONCE to boot (it's async)
      await this.sleep(2000);
      
      // Check if window.ONCE exists (it's the kernel instance, not the class)
      // In browser: window.ONCE = kernel (the booted instance)
      const onceBootStatus = await this.page.evaluate(() => {
        const kernel = (window as any).ONCE;
        const hasWindowOnce = typeof kernel !== 'undefined' && kernel !== null;
        
        // Check if it's actually a kernel instance (has model with uuid)
        let isKernelInstance = false;
        let kernelUuid: string | null = null;
        
        if (hasWindowOnce) {
          try {
            // Kernel should have model.uuid
            isKernelInstance = typeof kernel.model === 'object' && 
                              typeof kernel.model.uuid === 'string';
            kernelUuid = kernel.model?.uuid || null;
          } catch (e) {
            // Not a valid kernel
          }
        }
        
        return {
          hasWindowOnce,
          isKernelInstance,
          kernelUuid,
          connectionStatus: document.getElementById('connectionStatus')?.textContent || ''
        };
      });
      
      const onceBooted = onceBootStatus.hasWindowOnce && onceBootStatus.isKernelInstance;
      
      this.logEvidence('output', 'ONCE kernel boot status', onceBootStatus);
      
      // Validate criterion DEMO-07
      demoReq.validateCriterion('DEMO-07', onceBooted, onceBootStatus);

      // ═══════════════════════════════════════════════════════════════
      // TEST 6: Verify IOR Version in Page Functions
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Checking IOR version in page functions');
      
      // Get the onceVersion variable and verify IOR patterns use correct version
      const iorVersionCheck = await this.page.evaluate(() => {
        const kernel = (window as any).ONCE;
        const kernelVersion = kernel?.model?.version || 'unknown';
        
        // Check if IOR calls would use the correct version
        // The HTML uses onceVersion for IOR URLs like:
        // `http://${peerHost}/ONCE/${onceVersion}/${primaryUUID}/shutdownAll`
        
        // Get the onceVersion from the page's JavaScript context
        // It should match the kernel version
        const pageTitle = document.title;
        const versionFromTitle = pageTitle.match(/v(\d+\.\d+\.\d+\.\d+)/)?.[1] || 'unknown';
        
        return {
          kernelVersion,
          versionFromTitle,
          versionsMatch: kernelVersion === versionFromTitle,
          expectedVersion: '0.3.21.8'  // The component version we're testing
        };
      });
      
      this.logEvidence('output', 'IOR version verification', iorVersionCheck);
      
      // IOR version should match the current component version (0.3.21.8)
      const iorVersionCorrect = iorVersionCheck.kernelVersion === '0.3.21.8' && 
                                iorVersionCheck.versionsMatch;
      
      demoReq.validateCriterion('DEMO-08', iorVersionCorrect, iorVersionCheck);

      // ═══════════════════════════════════════════════════════════════
      // TEST 7: Click Shutdown Button and Verify IOR URL Version
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Testing Shutdown All button IOR URL');
      
      // Set up request interception to capture IOR URL
      let capturedIorUrl: string | null = null;
      
      // Listen for the IOR request
      this.page.on('request', (request) => {
        const url = request.url();
        if (url.includes('/shutdownAll')) {
          capturedIorUrl = url;
        }
      });
      
      // Override confirm to auto-accept
      await this.page.evaluate(() => {
        (window as any).confirm = () => true;
      });
      
      // Click the shutdown button (we'll catch the request but not let it complete)
      // Use page.route to intercept and abort the actual request
      await this.page.route('**/shutdownAll', route => {
        capturedIorUrl = route.request().url();
        route.abort();  // Don't actually shutdown the server
      });
      
      // Click the shutdown button
      await this.page.click('#shutdownAllBtn');
      
      // Wait a bit for the request to be captured
      await this.sleep(500);
      
      // Verify the captured URL contains the correct version
      const shutdownIorEvidence = {
        capturedUrl: capturedIorUrl,
        containsCorrectVersion: capturedIorUrl?.includes('/0.3.21.8/') || false,
        containsOldVersion: capturedIorUrl?.includes('/0.3.21.6/') || false,
        expectedPattern: '/ONCE/0.3.21.8/{uuid}/shutdownAll'
      };
      
      this.logEvidence('output', 'Shutdown button IOR URL', shutdownIorEvidence);
      
      const shutdownVersionCorrect = shutdownIorEvidence.containsCorrectVersion && 
                                     !shutdownIorEvidence.containsOldVersion;
      
      demoReq.validateCriterion('DEMO-09', shutdownVersionCorrect, shutdownIorEvidence);

      // ═══════════════════════════════════════════════════════════════
      // TEST 8: Actually Shutdown Server via IOR (only if test started server)
      // ═══════════════════════════════════════════════════════════════
      
      if (startedByTest) {
        this.logEvidence('step', 'Testing actual server shutdown via IOR');
        
        // Remove the route interception so the real request goes through
        await this.page.unroute('**/shutdownAll');
        
        // Listen for the actual shutdown request
        let shutdownResponseStatus: number | null = null;
        this.page.on('response', (response) => {
          if (response.url().includes('/shutdownAll')) {
            shutdownResponseStatus = response.status();
          }
        });
        
        // Click shutdown again (confirm is already overridden)
        await this.page.click('#shutdownAllBtn');
        
        // Wait for the response and server to shut down
        await this.sleep(3000);
        
        // Check if server is actually down
        let serverDown = false;
        try {
          const response = await fetch('http://localhost:42777/health');
          // If we get here, server is still running
          serverDown = false;
        } catch (e) {
          // Connection refused = server is down
          serverDown = true;
        }
        
        const actualShutdownEvidence = {
          shutdownResponseStatus,
          serverDown,
          message: serverDown ? 'Server successfully shut down via IOR' : 'Server still running after shutdown'
        };
        
        this.logEvidence('output', 'Actual shutdown result', actualShutdownEvidence);
        
        // Server should be down after shutdown
        demoReq.validateCriterion('DEMO-10', serverDown, actualShutdownEvidence);
        
        // Mark that server was shut down by IOR (not by test cleanup)
        if (serverDown) {
          startedByTest = false;  // Don't call serverStop() in finally since IOR shutdown worked
        }
      } else {
        // Skip DEMO-10 if server was already running (can't guarantee UUID match)
        this.logEvidence('info', 'Skipping DEMO-10: Server was already running (UUID may not match)');
        demoReq.validateCriterion('DEMO-10', true, { 
          skipped: true, 
          reason: 'Server was already running - use fresh server for shutdown test' 
        });
      }

      // ═══════════════════════════════════════════════════════════════
      // FINAL: Validate Requirement
      // ═══════════════════════════════════════════════════════════════
      
      this.validateRequirement(demoReq);
      
      return {
        success: demoReq.allCriteriaPassed(),
        requirements: demoReq.getCriteria(),
        screenshot: screenshotPath,
        startedByTest
      };

    } finally {
      // Cleanup browser
      if (this.page) {
        await this.page.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      
      // Stop server if we started it
      if (startedByTest) {
        await this.serverStop();
      }
    }
  }
}

