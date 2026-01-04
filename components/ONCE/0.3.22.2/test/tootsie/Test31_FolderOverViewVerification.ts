/**
 * Test 31: FolderOverView Verification
 * 
 * ✅ MIGRATED from: test/verify-folder-view.ts
 * ✅ RADICAL OOP: Uses Web4Requirement for acceptance criteria
 * ✅ Playwright-based browser testing for FolderOverView component
 * 
 * Black-Box: Browser navigates to /EAMD.ucp, verifies folder view loads
 * 
 * @pdca session/2025-12-17-UTC-1649.test-migration-tootsie.pdca.md - TM.4
 */

import { ONCETestCase } from './ONCETestCase.js';
import { chromium, Browser, Page } from 'playwright';

/**
 * Test model for FolderOverView verification
 */
interface FolderViewTestModel {
  componentRoot: string;
  version: string;
  baseUrl: string;
  eamdUrl: string;
  directoryListingUrl: string;
}

export class Test31_FolderOverViewVerification extends ONCETestCase {
  private browser: Browser | null = null;
  private page: Page | null = null;
  
  private testModel: FolderViewTestModel = {
    componentRoot: '',
    version: '',
    baseUrl: '',
    eamdUrl: '',
    directoryListingUrl: ''
  };

  /**
   * Test implementation
   */
  protected async executeTestLogic(): Promise<any> {
    // Initialize test model
    this.testModel.componentRoot = this.componentRoot;
    this.testModel.version = this.onceVersion;
    this.testModel.baseUrl = `https://localhost:42777`;
    this.testModel.eamdUrl = `${this.testModel.baseUrl}/EAMD.ucp`;
    this.testModel.directoryListingUrl = `${this.testModel.baseUrl}/EAMD.ucp/components/ONCE/${this.testModel.version}/src/assets/`;

    this.logEvidence('input', 'FolderOverView verification test', {
      componentRoot: this.testModel.componentRoot,
      version: this.testModel.version,
      eamdUrl: this.testModel.eamdUrl
    });

    // Ensure server is running
    await this.ensureServerRunning();

    // Create requirement
    const req = this.requirement(
      'FolderOverView Functionality',
      'FolderOverView component loads and displays directory contents correctly'
    );

    req.addCriterion('FOV-01', 'Server responds to directory listing endpoint');
    req.addCriterion('FOV-02', 'ucp-router element exists in DOM');
    req.addCriterion('FOV-03', 'folder-over-view element exists in router shadow DOM');
    req.addCriterion('FOV-04', 'FolderOverView has correct model type');
    req.addCriterion('FOV-05', 'FolderOverView displays file items');

    try {
      // Launch browser
      this.logEvidence('step', 'Launching Playwright browser');
      this.browser = await chromium.launch({
        headless: true,
        args: ['--ignore-certificate-errors']
      });

      const context = await this.browser.newContext({ ignoreHTTPSErrors: true });
      this.page = await context.newPage();

      // Capture browser console
      this.page.on('console', msg => {
        this.logEvidence('browser-console', msg.text());
      });

      // Test directory listing endpoint
      this.logEvidence('step', 'Testing directory listing endpoint');
      const apiResponse = await this.page.goto(this.testModel.directoryListingUrl, {
        timeout: 10000
      });
      const apiStatus = apiResponse?.status() || 0;
      req.validateCriterion('FOV-01', apiStatus === 200, {
        url: this.testModel.directoryListingUrl,
        status: apiStatus
      });

      // Navigate to /EAMD.ucp
      this.logEvidence('step', 'Navigating to /EAMD.ucp');
      await this.page.goto(this.testModel.eamdUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for router
      const routerExists = await this.page.waitForSelector('ucp-router', { timeout: 10000 })
        .then(() => true)
        .catch(() => false);
      req.validateCriterion('FOV-02', routerExists, { routerFound: routerExists });

      // Wait for folder view to load
      await this.page.waitForTimeout(2000);

      // Check shadow DOM for folder view
      const result = await this.page.evaluate(function() {
        const router = document.querySelector('ucp-router');
        const routerShadow = router?.shadowRoot;
        const outlet = routerShadow?.querySelector('.router-outlet');
        const folderView = outlet?.querySelector('folder-over-view') as any;

        if (!folderView) {
          return {
            found: false,
            error: 'folder-over-view not found',
            routerShadowHtml: routerShadow?.innerHTML?.substring(0, 500)
          };
        }

        const folderShadow = folderView.shadowRoot;
        const folderModel = folderView.model;

        // Check FileItemViews
        const fileItemViews = folderShadow?.querySelectorAll('file-item-view') || [];
        const fileItemCount = fileItemViews.length;

        return {
          found: true,
          rootPath: folderView.rootPath,
          cwd: folderView.cwd,
          currentPath: folderView.currentPath,
          isLoading: folderView.isLoading,
          errorMessage: folderView.errorMessage,
          modelType: folderModel?.folderName ? 'FolderModel' : (folderModel?.environment ? 'BrowserModel' : 'Unknown'),
          modelName: folderModel?.name,
          modelPath: folderModel?.path,
          childrenCount: folderModel?.children?.length || 0,
          fileItemViewCount: fileItemCount
        };
      });

      this.logEvidence('output', 'FolderOverView state', result);

      // Validate folder view exists
      req.validateCriterion('FOV-03', result.found === true, {
        found: result.found,
        error: result.found ? null : result.error
      });

      // Validate model type
      const hasValidModel = result.modelType === 'FolderModel' || result.modelType === 'BrowserModel';
      req.validateCriterion('FOV-04', hasValidModel, {
        modelType: result.modelType,
        modelName: result.modelName
      });

      // Validate file items display
      const hasFileItems = result.fileItemViewCount > 0 || result.childrenCount > 0;
      req.validateCriterion('FOV-05', hasFileItems, {
        fileItemViewCount: result.fileItemViewCount,
        childrenCount: result.childrenCount
      });

      this.validateRequirement(req);

      return {
        success: req.allCriteriaPassed(),
        model: this.testModel,
        folderViewState: result
      };

    } finally {
      // Cleanup
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    }
  }

  /**
   * Ensure server is running for test
   */
  private async ensureServerRunning(): Promise<void> {
    // Check if server already running
    try {
      const https = await import('https');
      const serverReady = await new Promise<boolean>((resolve) => {
        const req = https.request({
          hostname: 'localhost',
          port: 42777,
          path: '/health',
          method: 'GET',
          rejectUnauthorized: false
        }, (res) => {
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(2000, () => {
          req.destroy();
          resolve(false);
        });
        req.end();
      });

      if (serverReady) {
        this.logEvidence('server-check', 'Server already running');
        return;
      }
    } catch {
      // Server not running - start it
    }

    this.logEvidence('step', 'Starting server for FolderOverView test');
    this.serverStart();
    const ready = await this.waitForServer(42777, 15000);
    if (!ready) {
      throw new Error('Could not start server for FolderOverView test (timeout)');
    }
  }
}

