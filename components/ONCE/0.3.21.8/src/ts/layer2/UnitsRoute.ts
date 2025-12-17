/**
 * UnitsRoute.ts
 * 
 * HTTP Route for /units endpoint
 * Returns all cacheable units for Service Worker
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
import type { CachedUnitModel } from '../layer3/CachedUnitModel.interface.js';
import { UnitType } from '../layer3/UnitType.enum.js';
import { CacheStrategy } from '../layer3/CacheStrategy.enum.js';

/**
 * Units response structure
 */
interface UnitsResponse {
  version: string;
  generatedAt: string;
  totalUnits: number;
  units: CachedUnitModel[];
}

/**
 * UnitsRoute
 * 
 * Serves the /units endpoint for PWA Service Worker
 * Returns JSON array of all cacheable units with their IORs
 * 
 * Usage by Service Worker:
 * 1. On install, SW fetches /units
 * 2. SW precaches all returned units
 * 3. Versioning enables cache invalidation
 */
export class UnitsRoute extends Route {
  
  private componentVersion: string = '0.3.21.8';
  private componentRoot: string = '';
  private units: CachedUnitModel[] = [];
  
  /**
   * Empty constructor - Web4 P6
   */
  constructor() {
    super();
  }
  
  /**
   * Initialize the units route
   */
  public override init(scenario?: { model?: Partial<RouteModel> }): this {
    const now = new Date().toISOString();
    
    this.model = {
      uuid: scenario?.model?.uuid || this.uuidGenerate(),
      name: 'UnitsRoute',
      pattern: '/units',
      method: HttpMethod.GET,
      priority: 100,
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
   * Set component root for IOR generation
   */
  public componentRootSet(root: string): this {
    this.componentRoot = root;
    return this;
  }
  
  /**
   * Set component version
   */
  public componentVersionSet(version: string): this {
    this.componentVersion = version;
    return this;
  }
  
  /**
   * Register a unit to be served
   */
  public unitRegister(unit: CachedUnitModel): this {
    this.units.push(unit);
    return this;
  }
  
  /**
   * Register multiple units
   */
  public unitsRegister(units: CachedUnitModel[]): this {
    units.forEach(this.unitRegisterItem.bind(this));
    return this;
  }
  
  private unitRegisterItem(unit: CachedUnitModel): void {
    this.units.push(unit);
  }
  
  /**
   * Generate units from static file patterns
   * @param basePath Base IOR path (e.g., /EAMD.ucp/components/ONCE/0.3.21.8)
   * @param files Array of relative file paths
   */
  public unitsFromFilesGenerate(basePath: string, files: string[]): this {
    const now = new Date().toISOString();
    
    files.forEach(this.unitFromFileCreate.bind(this, basePath, now));
    
    return this;
  }
  
  private unitFromFileCreate(basePath: string, now: string, file: string): void {
    const ior = basePath + '/' + file;
    const unit: CachedUnitModel = {
      uuid: ior,
      name: this.nameFromPath(file),
      ior: ior,
      unitType: this.unitTypeFromPath(file),
      cacheStrategy: CacheStrategy.CACHE_FIRST,
      version: this.componentVersion,
      hash: '', // Would compute at runtime
      size: 0, // Would get at runtime
      mimeType: this.mimeTypeFromPath(file),
      dependencies: [],
      cachedAt: now,
      lastAccessedAt: now,
      accessCount: 0
    };
    
    this.units.push(unit);
  }
  
  private nameFromPath(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 1] || 'unknown';
  }
  
  private unitTypeFromPath(path: string): UnitType {
    if (path.endsWith('.js') || path.endsWith('.mjs')) {
      return UnitType.JAVASCRIPT;
    }
    if (path.endsWith('.css')) {
      return UnitType.CSS;
    }
    if (path.endsWith('.html')) {
      return UnitType.HTML;
    }
    if (path.endsWith('.json')) {
      return UnitType.JSON;
    }
    if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.svg') || path.endsWith('.webp')) {
      return UnitType.IMAGE;
    }
    if (path.endsWith('.woff') || path.endsWith('.woff2') || path.endsWith('.ttf')) {
      return UnitType.FONT;
    }
    return UnitType.OTHER;
  }
  
  private mimeTypeFromPath(path: string): string {
    if (path.endsWith('.js') || path.endsWith('.mjs')) {
      return 'application/javascript';
    }
    if (path.endsWith('.css')) {
      return 'text/css';
    }
    if (path.endsWith('.html')) {
      return 'text/html';
    }
    if (path.endsWith('.json')) {
      return 'application/json';
    }
    if (path.endsWith('.png')) {
      return 'image/png';
    }
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      return 'image/jpeg';
    }
    if (path.endsWith('.svg')) {
      return 'image/svg+xml';
    }
    if (path.endsWith('.webp')) {
      return 'image/webp';
    }
    if (path.endsWith('.woff')) {
      return 'font/woff';
    }
    if (path.endsWith('.woff2')) {
      return 'font/woff2';
    }
    if (path.endsWith('.ttf')) {
      return 'font/ttf';
    }
    return 'application/octet-stream';
  }
  
  /**
   * Handle the /units request
   */
  protected override handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const now = new Date().toISOString();
    
    const response: UnitsResponse = {
      version: this.componentVersion,
      generatedAt: now,
      totalUnits: this.units.length,
      units: this.units
    };
    
    const body = JSON.stringify(response, null, 2);
    
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-ONCE-Version': this.componentVersion
    });
    res.end(body);
    
    return Promise.resolve();
  }
  
  /**
   * Check if this route matches the request
   */
  public override matches(path: string, method: string): boolean {
    return path === '/units' && method.toUpperCase() === 'GET';
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
  
  private uuidGenerate(): string {
    return 'units-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
  }
}




















