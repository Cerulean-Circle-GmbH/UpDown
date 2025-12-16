/**
 * Test30_PWAComponents.ts
 * 
 * Unit tests for PWA Offline Cache components
 * 
 * @pdca session/2025-12-12-UTC-1230.pwa-offline-unit-cache.pdca.md
 */

import { UnitCacheManager } from '../layer2/UnitCacheManager.js';
import { OnceServiceWorker } from '../layer2/OnceServiceWorker.js';
import { UnitsRoute } from '../layer2/UnitsRoute.js';
import { ManifestRoute } from '../layer2/ManifestRoute.js';
import { ServiceWorkerRoute } from '../layer2/ServiceWorkerRoute.js';
import { UnitType } from '../layer3/UnitType.enum.js';
import { CacheStrategy } from '../layer3/CacheStrategy.enum.js';

/**
 * Test30_PWAComponents
 * 
 * Tests:
 * - UnitCacheManager initialization
 * - OnceServiceWorker initialization (without SW context)
 * - UnitsRoute functionality
 * - ManifestRoute functionality
 * - ServiceWorkerRoute functionality
 */
export class Test30_PWAComponents {
  
  private testResults: { name: string; passed: boolean; error?: string }[] = [];
  
  constructor() {
    // Empty constructor
  }
  
  public async runAllTests(): Promise<boolean> {
    console.log('\n=== Test30: PWA Components ===\n');
    
    await this.testUnitCacheManagerInit();
    await this.testOnceServiceWorkerInit();
    await this.testUnitsRouteInit();
    await this.testManifestRouteInit();
    await this.testServiceWorkerRouteInit();
    await this.testUnitTypes();
    await this.testCacheStrategies();
    await this.testUnitsRouteUnitRegistration();
    await this.testManifestRouteConfiguration();
    
    // Print summary
    console.log('\n--- Test30 Summary ---');
    let allPassed = true;
    this.testResults.forEach(this.printResult.bind(this));
    
    const passCount = this.testResults.filter(r => r.passed).length;
    console.log(`\nPassed: ${passCount}/${this.testResults.length}`);
    
    this.testResults.forEach(r => { if (!r.passed) allPassed = false; });
    return allPassed;
  }
  
  private printResult(result: { name: string; passed: boolean; error?: string }): void {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}${result.error ? ': ' + result.error : ''}`);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // UnitCacheManager Tests
  // ═══════════════════════════════════════════════════════════════
  
  private async testUnitCacheManagerInit(): Promise<void> {
    try {
      const manager = new UnitCacheManager();
      manager.init({
        cacheName: 'test-cache-v1',
        cacheVersion: '1.0.0'
      });
      
      const model = manager.modelGet();
      
      if (model.cacheName !== 'test-cache-v1') {
        throw new Error('Cache name not set correctly');
      }
      
      if (model.cacheVersion !== '1.0.0') {
        throw new Error('Cache version not set correctly');
      }
      
      if (model.unitCount !== 0) {
        throw new Error('Initial unit count should be 0');
      }
      
      this.testResults.push({ name: 'UnitCacheManager initialization', passed: true });
    } catch (error) {
      this.testResults.push({ 
        name: 'UnitCacheManager initialization', 
        passed: false, 
        error: String(error) 
      });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // OnceServiceWorker Tests
  // ═══════════════════════════════════════════════════════════════
  
  private async testOnceServiceWorkerInit(): Promise<void> {
    try {
      const sw = new OnceServiceWorker();
      sw.init({
        version: '1.0.0',
        cacheNamePrefix: 'test-sw'
      });
      
      const model = sw.modelGet();
      
      if (model.version !== '1.0.0') {
        throw new Error('Version not set correctly');
      }
      
      if (model.cacheNamePrefix !== 'test-sw') {
        throw new Error('Cache name prefix not set correctly');
      }
      
      const cacheName = sw.cacheNameGet();
      if (cacheName !== 'test-sw-v1.0.0') {
        throw new Error('Cache name generation failed: ' + cacheName);
      }
      
      if (!sw.isInitializedGet()) {
        throw new Error('Should be initialized');
      }
      
      this.testResults.push({ name: 'OnceServiceWorker initialization', passed: true });
    } catch (error) {
      this.testResults.push({ 
        name: 'OnceServiceWorker initialization', 
        passed: false, 
        error: String(error) 
      });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // UnitsRoute Tests
  // ═══════════════════════════════════════════════════════════════
  
  private async testUnitsRouteInit(): Promise<void> {
    try {
      const route = new UnitsRoute();
      route.init();
      
      if (route.model.pattern !== '/units') {
        throw new Error('Pattern not set correctly');
      }
      
      if (!route.matches('/units', 'GET')) {
        throw new Error('Should match /units GET');
      }
      
      if (route.matches('/other', 'GET')) {
        throw new Error('Should not match /other GET');
      }
      
      this.testResults.push({ name: 'UnitsRoute initialization', passed: true });
    } catch (error) {
      this.testResults.push({ 
        name: 'UnitsRoute initialization', 
        passed: false, 
        error: String(error) 
      });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ManifestRoute Tests
  // ═══════════════════════════════════════════════════════════════
  
  private async testManifestRouteInit(): Promise<void> {
    try {
      const route = new ManifestRoute();
      route.init();
      
      if (route.model.pattern !== '/manifest.json') {
        throw new Error('Pattern not set correctly');
      }
      
      if (!route.matches('/manifest.json', 'GET')) {
        throw new Error('Should match /manifest.json GET');
      }
      
      this.testResults.push({ name: 'ManifestRoute initialization', passed: true });
    } catch (error) {
      this.testResults.push({ 
        name: 'ManifestRoute initialization', 
        passed: false, 
        error: String(error) 
      });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ServiceWorkerRoute Tests
  // ═══════════════════════════════════════════════════════════════
  
  private async testServiceWorkerRouteInit(): Promise<void> {
    try {
      const route = new ServiceWorkerRoute();
      route.init();
      
      if (route.model.pattern !== '/sw.js') {
        throw new Error('Pattern not set correctly');
      }
      
      if (!route.matches('/sw.js', 'GET')) {
        throw new Error('Should match /sw.js GET');
      }
      
      this.testResults.push({ name: 'ServiceWorkerRoute initialization', passed: true });
    } catch (error) {
      this.testResults.push({ 
        name: 'ServiceWorkerRoute initialization', 
        passed: false, 
        error: String(error) 
      });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Enum Tests
  // ═══════════════════════════════════════════════════════════════
  
  private async testUnitTypes(): Promise<void> {
    try {
      // Verify all unit types exist
      const types = [
        UnitType.JAVASCRIPT,
        UnitType.CSS,
        UnitType.HTML,
        UnitType.JSON,
        UnitType.SCENARIO,
        UnitType.IMAGE,
        UnitType.FONT,
        UnitType.OTHER
      ];
      
      if (types.length !== 8) {
        throw new Error('Expected 8 unit types');
      }
      
      if (UnitType.JAVASCRIPT !== 'javascript') {
        throw new Error('JAVASCRIPT value incorrect');
      }
      
      this.testResults.push({ name: 'UnitType enum', passed: true });
    } catch (error) {
      this.testResults.push({ 
        name: 'UnitType enum', 
        passed: false, 
        error: String(error) 
      });
    }
  }
  
  private async testCacheStrategies(): Promise<void> {
    try {
      const strategies = [
        CacheStrategy.CACHE_FIRST,
        CacheStrategy.NETWORK_FIRST,
        CacheStrategy.STALE_WHILE_REVALIDATE,
        CacheStrategy.NETWORK_ONLY,
        CacheStrategy.CACHE_ONLY
      ];
      
      if (strategies.length !== 5) {
        throw new Error('Expected 5 cache strategies');
      }
      
      if (CacheStrategy.CACHE_FIRST !== 'cache-first') {
        throw new Error('CACHE_FIRST value incorrect');
      }
      
      this.testResults.push({ name: 'CacheStrategy enum', passed: true });
    } catch (error) {
      this.testResults.push({ 
        name: 'CacheStrategy enum', 
        passed: false, 
        error: String(error) 
      });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // UnitsRoute Unit Registration
  // ═══════════════════════════════════════════════════════════════
  
  private async testUnitsRouteUnitRegistration(): Promise<void> {
    try {
      const route = new UnitsRoute();
      route.init();
      route.componentVersionSet('0.3.21.8');
      
      // Generate units from files
      route.unitsFromFilesGenerate('/EAMD.ucp/components/ONCE/0.3.21.8', [
        'dist/ts/layer2/HTTPServer.js',
        'src/ts/layer5/views/css/OnceOverView.css',
        'src/ts/layer5/views/html/DefaultItemView.html'
      ]);
      
      // Note: We can't easily verify the units without a mock response
      // Just verify the route is still valid
      if (!route.matches('/units', 'GET')) {
        throw new Error('Route should still match after unit registration');
      }
      
      this.testResults.push({ name: 'UnitsRoute unit registration', passed: true });
    } catch (error) {
      this.testResults.push({ 
        name: 'UnitsRoute unit registration', 
        passed: false, 
        error: String(error) 
      });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ManifestRoute Configuration
  // ═══════════════════════════════════════════════════════════════
  
  private async testManifestRouteConfiguration(): Promise<void> {
    try {
      const route = new ManifestRoute();
      route.init();
      
      route.nameSet('Test App')
        .shortNameSet('Test')
        .descriptionSet('A test PWA')
        .themeColorSet('#ff0000')
        .backgroundColorSet('#ffffff')
        .iconAdd('/icon-192.png', '192x192', 'image/png', 'any maskable');
      
      const manifest = route.manifestGet();
      
      if (manifest.name !== 'Test App') {
        throw new Error('Name not set correctly');
      }
      
      if (manifest.short_name !== 'Test') {
        throw new Error('Short name not set correctly');
      }
      
      if (manifest.theme_color !== '#ff0000') {
        throw new Error('Theme color not set correctly');
      }
      
      if (manifest.icons.length !== 1) {
        throw new Error('Icon not added');
      }
      
      if (manifest.icons[0].src !== '/icon-192.png') {
        throw new Error('Icon src not set correctly');
      }
      
      this.testResults.push({ name: 'ManifestRoute configuration', passed: true });
    } catch (error) {
      this.testResults.push({ 
        name: 'ManifestRoute configuration', 
        passed: false, 
        error: String(error) 
      });
    }
  }
}

// Run tests if executed directly
const test = new Test30_PWAComponents();
test.runAllTests().then(passed => {
  process.exit(passed ? 0 : 1);
});








