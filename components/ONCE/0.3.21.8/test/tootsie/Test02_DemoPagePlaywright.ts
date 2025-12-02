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
    const componentRoot = this.getComponentRoot();
    const version = this.getONCEVersion();
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

    // ═══════════════════════════════════════════════════════════════
    // SETUP: Ensure server is running
    // ═══════════════════════════════════════════════════════════════
    
    this.logEvidence('step', 'Checking if server is running');
    
    const serverRunning = await this.checkServerHealth(primaryPort);
    let startedByTest = false;
    
    if (!serverRunning) {
      this.logEvidence('step', 'Starting server');
      try {
        this.runOnceCLI('startServer &');
      } catch (e) {
        // Expected - background process
      }
      
      const serverReady = await this.waitForServer(primaryPort, 15000);
      if (!serverReady) {
        throw new Error('Could not start server for demo test');
      }
      startedByTest = true;
      this.logEvidence('step', 'Server started by test');
    } else {
      this.logEvidence('step', 'Server already running');
    }

    try {
      // ═══════════════════════════════════════════════════════════════
      // TEST 1: Launch Browser with Playwright
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Launching Chromium browser');
      
      this.browser = await chromium.launch({ 
        headless: true  // Run headless for CI/automated testing
      });
      this.page = await this.browser.newPage();
      
      this.logEvidence('step', 'Browser launched successfully');

      // ═══════════════════════════════════════════════════════════════
      // TEST 2: Navigate to /demo
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Navigating to demo page', { url: demoUrl });
      
      const response = await this.page.goto(demoUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
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
      // TEST 5: Check for JavaScript Errors
      // ═══════════════════════════════════════════════════════════════
      
      this.logEvidence('step', 'Checking for console errors');
      
      const consoleErrors: string[] = [];
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Reload to capture any errors
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.sleep(1000);  // Wait for any async errors
      
      const noErrors = consoleErrors.length === 0;
      
      this.logEvidence('output', 'JavaScript validation', { noErrors, errorCount: consoleErrors.length, errors: consoleErrors.slice(0, 5) });
      
      // Validate criterion DEMO-06
      demoReq.validateCriterion('DEMO-06', noErrors, { consoleErrors: consoleErrors.slice(0, 5) });

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
      // Cleanup
      if (this.page) {
        await this.page.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      
      // Stop server if we started it
      if (startedByTest) {
        this.logEvidence('step', 'Stopping server');
        try {
          await this.httpPost(`http://localhost:${primaryPort}/shutdown-all`);
        } catch (e) {
          // Already stopped
        }
      }
    }
  }
}

