/**
 * ServiceWorkerRoute.ts
 * 
 * HTTP Route for serving the Service Worker
 * Maps /sw.js to the compiled OnceServiceWorker.js
 * 
 * @layer2
 * @pattern Web4 P4: Radical OOP
 * @pattern Web4 P6: Empty constructor + init()
 * @pdca session/2025-12-12-UTC-1230.pwa-offline-unit-cache.pdca.md
 */

import { Route } from './Route.js';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';
import type { IncomingMessage, ServerResponse } from 'http';
import type { RouteModel } from '../layer3/RouteModel.interface.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * ServiceWorkerRoute
 * 
 * Serves /sw.js by redirecting to the compiled OnceServiceWorker.js
 * This provides a clean URL for SW registration while using the
 * self-registering OnceServiceWorker component
 * 
 * The SW must be served from the root scope to control all pages
 */
export class ServiceWorkerRoute extends Route {
  
  private componentRoot: string = '';
  private swFilePath: string = '';
  
  /**
   * Empty constructor - Web4 P6
   */
  constructor() {
    super();
  }
  
  /**
   * Initialize the SW route
   */
  public override init(scenario?: { model?: Partial<RouteModel> }): this {
    const now = new Date().toISOString();
    
    this.model = {
      uuid: scenario?.model?.uuid || this.uuidGenerate(),
      name: 'ServiceWorkerRoute',
      pattern: '/sw.js',
      method: HttpMethod.GET,
      priority: 200, // High priority
      statistics: {
        totalOperations: 0,
        successCount: 0,
        errorCount: 0,
        lastOperationAt: '',
        lastErrorAt: '',
        createdAt: now,
        updatedAt: now
      }
    };
    
    return this;
  }
  
  /**
   * Set component root for file path resolution
   */
  public componentRootSet(root: string): this {
    this.componentRoot = root;
    this.swFilePath = path.join(root, 'dist', 'ts', 'layer2', 'OnceServiceWorker.js');
    return this;
  }
  
  /**
   * Handle the /sw.js request
   * Serves the compiled OnceServiceWorker.js with appropriate headers
   */
  protected override handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // Check if SW file exists
    if (!this.swFilePath || !fs.existsSync(this.swFilePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Service Worker not found. Run tsc to compile.');
      return Promise.resolve();
    }
    
    try {
      const content = fs.readFileSync(this.swFilePath, 'utf-8');
      
      res.writeHead(200, {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Service-Worker-Allowed': '/',
        'X-ONCE-Component': 'OnceServiceWorker'
      });
      res.end(content);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading Service Worker: ' + String(error));
    }
    
    return Promise.resolve();
  }
  
  /**
   * Check if this route matches the request
   */
  public override matches(path: string, method: string): boolean {
    return path === '/sw.js' && method.toUpperCase() === 'GET';
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Private Helpers
  // ═══════════════════════════════════════════════════════════════
  
  private statisticsSuccessRecord(): void {
    const now = new Date().toISOString();
    this.model.statistics.totalOperations = this.model.statistics.totalOperations + 1;
    this.model.statistics.successCount = this.model.statistics.successCount + 1;
    this.model.statistics.lastOperationAt = now;
    this.model.statistics.updatedAt = now;
  }
  
  private statisticsErrorRecord(): void {
    const now = new Date().toISOString();
    this.model.statistics.totalOperations = this.model.statistics.totalOperations + 1;
    this.model.statistics.errorCount = this.model.statistics.errorCount + 1;
    this.model.statistics.lastOperationAt = now;
    this.model.statistics.lastErrorAt = now;
    this.model.statistics.updatedAt = now;
  }
  
  private uuidGenerate(): string {
    return 'sw-route-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
  }
}







