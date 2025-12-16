/**
 * Quick verification script for FolderOverView
 * Run with: npx ts-node test/verify-folder-view.ts
 */

import { chromium } from 'playwright';

async function verify(): Promise<void> {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--ignore-certificate-errors']
  });
  
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    if (msg.text().includes('FolderOverView')) {
      console.log(`[Browser] ${msg.text()}`);
    }
  });
  
  console.log('Navigating to /EAMD.ucp...');
  await page.goto('https://localhost:42777/EAMD.ucp', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  // Wait for router
  await page.waitForSelector('ucp-router', { timeout: 10000 });
  console.log('✅ ucp-router found');
  
  // Check shadow DOM
  const result = await page.evaluate(() => {
    const router = document.querySelector('ucp-router');
    const routerShadow = router?.shadowRoot;
    const outlet = routerShadow?.querySelector('.router-outlet');
    const folderView = outlet?.querySelector('folder-over-view') as any;
    
    if (!folderView) {
      return { error: 'folder-over-view not found', html: routerShadow?.innerHTML };
    }
    
    const folderShadow = folderView.shadowRoot;
    
    return {
      found: true,
      route: folderView.route ? {
        pattern: folderView.route.pattern,
        viewTag: folderView.route.viewTag,
        model: folderView.route.model
      } : null,
      rootPath: folderView.rootPath,
      cwd: folderView.cwd,
      currentPath: folderView.currentPath,
      isLoading: folderView.isLoading,
      errorMessage: folderView.errorMessage,
      model: folderView.model,
      shadowHTML: folderShadow?.innerHTML?.substring(0, 500)
    };
  });
  
  console.log('\n=== FolderOverView State ===');
  console.log(JSON.stringify(result, null, 2));
  
  await browser.close();
}

verify().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

