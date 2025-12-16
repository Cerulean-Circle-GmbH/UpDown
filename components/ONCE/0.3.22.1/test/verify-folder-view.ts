/**
 * Quick verification script for FolderOverView
 * Run with: npx tsx test/verify-folder-view.ts
 */

import { chromium } from 'playwright';

async function verify(): Promise<void> {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--ignore-certificate-errors']
  });
  
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  
  // Capture ALL console logs
  page.on('console', msg => {
    console.log(`[Browser] ${msg.text()}`);
  });
  
  // First, test the directory listing endpoint directly
  console.log('=== Testing Directory Listing Endpoint ===');
  const apiResponse = await page.goto('https://localhost:42777/EAMD.ucp/components/ONCE/0.3.22.1/src/assets/', {
    timeout: 10000
  });
  const apiContent = await apiResponse?.text();
  console.log('Directory listing response:', apiContent?.substring(0, 500));
  
  console.log('\n=== Navigating to /EAMD.ucp ===');
  await page.goto('https://localhost:42777/EAMD.ucp', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  // Wait for router and folder view to load
  await page.waitForSelector('ucp-router', { timeout: 10000 });
  console.log('✅ ucp-router found');
  
  // Wait a bit for async folder loading
  await page.waitForTimeout(2000);
  
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
    
    // Get the folder model specifically
    const folderModel = folderView.model;
    
    // Check FileItemViews inside
    const fileItemViews = folderShadow?.querySelectorAll('file-item-view') || [];
    const fileItemStates = Array.from(fileItemViews).map((fiv: any) => {
      const fileItemShadow = fiv.shadowRoot;
      const computedStyle = fileItemShadow ? 
        getComputedStyle(fileItemShadow.querySelector('.file-item') || fiv) : null;
      
      return {
        hasModel: fiv.hasModel,
        model: fiv.hasModel ? {
          name: fiv.model?.name,
          filename: fiv.model?.filename
        } : null,
        adoptedStyleSheetsCount: fileItemShadow?.adoptedStyleSheets?.length || 0,
        computedStyles: computedStyle ? {
          display: computedStyle.display,
          height: computedStyle.height,
          visibility: computedStyle.visibility,
          color: computedStyle.color
        } : null,
        innerHTML: fileItemShadow?.innerHTML?.substring(0, 300)
      };
    });
    
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
      children: folderModel?.children?.slice(0, 3),
      fileItemViewCount: fileItemViews.length,
      fileItemStates: fileItemStates.slice(0, 3)
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


