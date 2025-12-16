/**
 * ManifestRoute.ts
 * 
 * HTTP Route for serving the PWA manifest.json
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

/**
 * PWA Manifest structure
 */
interface PWAManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  background_color: string;
  theme_color: string;
  orientation: 'portrait' | 'landscape' | 'any';
  scope: string;
  icons: PWAIcon[];
  categories: string[];
  lang: string;
  dir: 'ltr' | 'rtl' | 'auto';
}

interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

/**
 * ManifestRoute
 * 
 * Serves the PWA manifest.json at /manifest.json
 * The manifest enables PWA installation (Add to Home Screen)
 */
export class ManifestRoute extends Route {
  
  private manifest: PWAManifest;
  
  /**
   * Empty constructor - Web4 P6
   */
  constructor() {
    super();
    
    // Default manifest
    this.manifest = {
      name: 'ONCE - Open Network Computing Environment',
      short_name: 'ONCE',
      description: 'Web4 Progressive Web Application',
      start_url: '/',
      display: 'standalone',
      background_color: '#1a1a2e',
      theme_color: '#0f3460',
      orientation: 'any',
      scope: '/',
      icons: [],
      categories: ['productivity', 'utilities'],
      lang: 'en',
      dir: 'ltr'
    };
  }
  
  /**
   * Initialize the manifest route
   */
  public override init(scenario?: { model?: Partial<RouteModel> }): this {
    const now = new Date().toISOString();
    
    this.model = {
      uuid: scenario?.model?.uuid || this.uuidGenerate(),
      name: 'ManifestRoute',
      pattern: '/manifest.json',
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
   * Set manifest name
   */
  public nameSet(name: string): this {
    this.manifest.name = name;
    return this;
  }
  
  /**
   * Set manifest short name
   */
  public shortNameSet(shortName: string): this {
    this.manifest.short_name = shortName;
    return this;
  }
  
  /**
   * Set manifest description
   */
  public descriptionSet(description: string): this {
    this.manifest.description = description;
    return this;
  }
  
  /**
   * Set theme color
   */
  public themeColorSet(color: string): this {
    this.manifest.theme_color = color;
    return this;
  }
  
  /**
   * Set background color
   */
  public backgroundColorSet(color: string): this {
    this.manifest.background_color = color;
    return this;
  }
  
  /**
   * Add an icon
   */
  public iconAdd(src: string, sizes: string, type: string, purpose?: string): this {
    const icon: PWAIcon = { src, sizes, type };
    if (purpose) {
      icon.purpose = purpose;
    }
    this.manifest.icons.push(icon);
    return this;
  }
  
  /**
   * Set start URL
   */
  public startUrlSet(url: string): this {
    this.manifest.start_url = url;
    return this;
  }
  
  /**
   * Set scope
   */
  public scopeSet(scope: string): this {
    this.manifest.scope = scope;
    return this;
  }
  
  /**
   * Get the manifest object
   */
  public manifestGet(): PWAManifest {
    return this.manifest;
  }
  
  /**
   * Handle the /manifest.json request
   */
  protected override handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = JSON.stringify(this.manifest, null, 2);
    
    res.writeHead(200, {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=86400',
      'X-ONCE-Component': 'ManifestRoute'
    });
    res.end(body);
    
    return Promise.resolve();
  }
  
  /**
   * Check if this route matches the request
   */
  public override matches(path: string, method: string): boolean {
    return path === '/manifest.json' && method.toUpperCase() === 'GET';
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
    return 'manifest-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
  }
}






