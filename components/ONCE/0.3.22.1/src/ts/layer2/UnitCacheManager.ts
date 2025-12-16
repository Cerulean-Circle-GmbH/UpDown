/**
 * UnitCacheManager.ts
 * 
 * Manages caching of Units using the Cache API
 * Works in Service Worker context
 * 
 * @layer2
 * @pattern Web4 P4: Radical OOP (bound methods, no arrow functions)
 * @pattern Web4 P6: Empty constructor + init()
 * @pattern Web4 P16: Object-Action naming
 * @pdca session/2025-12-12-UTC-1230.pwa-offline-unit-cache.pdca.md
 */

import type { UnitCacheManagerModel } from '../layer3/UnitCacheManagerModel.interface.js';
import type { CachedUnitModel } from '../layer3/CachedUnitModel.interface.js';
import type { StatisticsModel } from '../layer3/StatisticsModel.interface.js';
import { CacheStrategy } from '../layer3/CacheStrategy.enum.js';
import { UnitType } from '../layer3/UnitType.enum.js';

/**
 * Unit Cache Manager
 * 
 * Provides IOR-based caching using the browser Cache API
 * Each Unit is stored with its IOR as the cache key
 * 
 * Web4 Principles:
 * - P4: All callbacks are bound methods
 * - P6: Empty constructor, init() for setup
 * - P16: unitGet(), unitPut() naming
 */
export class UnitCacheManager {
  
  private model!: UnitCacheManagerModel;
  private cache: Cache | null = null;
  private unitMetadata: Map<string, CachedUnitModel> = new Map();
  
  /**
   * Empty constructor - Web4 P6
   */
  constructor() {
    // Empty - initialization in init()
  }
  
  /**
   * Initialize the cache manager
   * @param model Configuration model
   */
  public init(model: Partial<UnitCacheManagerModel>): this {
    const now = new Date().toISOString();
    
    this.model = {
      uuid: model.uuid || this.uuidGenerate(),
      name: model.name || 'UnitCacheManager',
      iorComponent: 'UnitCacheManager',
      iorVersion: model.iorVersion || '',
      cacheName: model.cacheName || 'once-units-v1',
      cacheVersion: model.cacheVersion || '1.0.0',
      unitCount: 0,
      totalSizeBytes: 0,
      maxSizeBytes: model.maxSizeBytes || 50 * 1024 * 1024, // 50MB default
      cachedIors: [],
      statistics: model.statistics || this.statisticsCreate(now)
    };
    
    return this;
  }
  
  /**
   * Open the cache (must be called before operations)
   * Returns Promise for Layer 4 callers
   */
  public cacheOpen(): Promise<Cache> {
    return caches.open(this.model.cacheName).then(this.cacheStoreHandle.bind(this));
  }
  
  private cacheStoreHandle(cache: Cache): Cache {
    this.cache = cache;
    return cache;
  }
  
  /**
   * Get a unit from cache by IOR
   * @param ior The IOR path to retrieve
   */
  public unitGet(ior: string): Promise<Response | undefined> {
    if (!this.cache) {
      return Promise.resolve(undefined);
    }
    
    return this.cache.match(ior).then(this.unitGetHandle.bind(this, ior));
  }
  
  private unitGetHandle(ior: string, response: Response | undefined): Response | undefined {
    if (response) {
      this.statisticsSuccessRecord();
      this.unitAccessRecord(ior);
    }
    return response;
  }
  
  private unitAccessRecord(ior: string): void {
    const metadata = this.unitMetadata.get(ior);
    if (metadata) {
      metadata.lastAccessedAt = new Date().toISOString();
      metadata.accessCount = metadata.accessCount + 1;
    }
  }
  
  /**
   * Put a unit into cache
   * @param ior The IOR path as cache key
   * @param response The response to cache
   * @param unitType Type of the unit
   */
  public unitPut(ior: string, response: Response, unitType: UnitType): Promise<void> {
    if (!this.cache) {
      // Cache not yet opened (install in progress) - skip silently
      // This is normal during SW startup, caching will work after install completes
      console.debug('[UnitCacheManager] Skipping cache (not yet open):', ior);
      return Promise.resolve();
    }
    
    // Clone response since it can only be used once
    const responseClone = response.clone();
    
    return this.cache.put(ior, responseClone).then(this.unitPutHandle.bind(this, ior, response, unitType));
  }
  
  private unitPutHandle(ior: string, response: Response, unitType: UnitType): void {
    const now = new Date().toISOString();
    
    // Create metadata for this unit
    const metadata: CachedUnitModel = {
      uuid: ior, // Use IOR as UUID
      name: this.nameFromIor(ior),
      ior: ior,
      unitType: unitType,
      cacheStrategy: this.strategyForType(unitType),
      version: this.model.cacheVersion,
      hash: '', // Would compute from response
      size: 0, // Would get from headers
      mimeType: response.headers.get('Content-Type') || 'application/octet-stream',
      dependencies: [],
      cachedAt: now,
      lastAccessedAt: now,
      accessCount: 0
    };
    
    this.unitMetadata.set(ior, metadata);
    this.model.cachedIors.push(ior);
    this.model.unitCount = this.model.unitCount + 1;
    this.statisticsSuccessRecord();
  }
  
  private nameFromIor(ior: string): string {
    const parts = ior.split('/');
    return parts[parts.length - 1] || 'unknown';
  }
  
  /**
   * Add multiple URLs to cache at once
   * Used for precaching during install
   * @param urls Array of URLs to cache
   */
  public addAllToCache(urls: string[]): Promise<void> {
    if (!this.cache) {
      return Promise.reject(new Error('Cache not opened'));
    }
    
    return this.cache.addAll(urls).then(this.addAllHandle.bind(this, urls));
  }
  
  private addAllHandle(urls: string[]): void {
    const now = new Date().toISOString();
    
    urls.forEach(this.urlMetadataCreate.bind(this, now));
    
    this.model.unitCount = this.model.unitCount + urls.length;
    console.log(`📦 Added ${urls.length} URLs to cache`);
  }
  
  private urlMetadataCreate(now: string, url: string): void {
    const metadata: CachedUnitModel = {
      uuid: url,
      name: this.nameFromIor(url),
      ior: url,
      unitType: this.typeFromUrl(url),
      cacheStrategy: CacheStrategy.CACHE_FIRST,
      version: this.model.cacheVersion,
      hash: '',
      size: 0,
      mimeType: this.mimeFromUrl(url),
      dependencies: [],
      cachedAt: now,
      lastAccessedAt: now,
      accessCount: 0
    };
    
    this.unitMetadata.set(url, metadata);
    this.model.cachedIors.push(url);
  }
  
  private typeFromUrl(url: string): UnitType {
    if (url.endsWith('.js')) return UnitType.JAVASCRIPT;
    if (url.endsWith('.css')) return UnitType.CSS;
    if (url.endsWith('.html')) return UnitType.HTML;
    if (url.endsWith('.json')) return UnitType.JSON;
    if (url.endsWith('.woff') || url.endsWith('.woff2')) return UnitType.FONT;
    if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.svg')) return UnitType.IMAGE;
    return UnitType.OTHER;
  }
  
  private mimeFromUrl(url: string): string {
    if (url.endsWith('.js')) return 'application/javascript';
    if (url.endsWith('.css')) return 'text/css';
    if (url.endsWith('.html')) return 'text/html';
    if (url.endsWith('.json')) return 'application/json';
    return 'application/octet-stream';
  }
  
  private strategyForType(unitType: UnitType): CacheStrategy {
    switch (unitType) {
      case UnitType.JAVASCRIPT:
      case UnitType.CSS:
      case UnitType.FONT:
        return CacheStrategy.CACHE_FIRST;
      case UnitType.HTML:
        return CacheStrategy.STALE_WHILE_REVALIDATE;
      case UnitType.JSON:
      case UnitType.SCENARIO:
        return CacheStrategy.NETWORK_FIRST;
      default:
        return CacheStrategy.CACHE_FIRST;
    }
  }
  
  /**
   * Delete a unit from cache
   * @param ior The IOR to delete
   */
  public unitDelete(ior: string): Promise<boolean> {
    if (!this.cache) {
      return Promise.resolve(false);
    }
    
    return this.cache.delete(ior).then(this.unitDeleteHandle.bind(this, ior));
  }
  
  private unitDeleteHandle(ior: string, deleted: boolean): boolean {
    if (deleted) {
      this.unitMetadata.delete(ior);
      const index = this.model.cachedIors.indexOf(ior);
      if (index > -1) {
        this.model.cachedIors.splice(index, 1);
      }
      this.model.unitCount = Math.max(0, this.model.unitCount - 1);
    }
    return deleted;
  }
  
  /**
   * Check if a unit is cached
   * @param ior The IOR to check
   */
  public unitHas(ior: string): Promise<boolean> {
    if (!this.cache) {
      return Promise.resolve(false);
    }
    
    return this.cache.match(ior).then(this.unitHasHandle.bind(this));
  }
  
  private unitHasHandle(response: Response | undefined): boolean {
    return response !== undefined;
  }
  
  /**
   * Get all cached IORs
   */
  public cachedIorsGet(): string[] {
    return this.model.cachedIors.slice();
  }
  
  /**
   * Get metadata for a cached unit
   * @param ior The IOR to get metadata for
   */
  public metadataGet(ior: string): CachedUnitModel | undefined {
    return this.unitMetadata.get(ior);
  }
  
  /**
   * Clear all cached units
   */
  public cacheClear(): Promise<boolean> {
    return caches.delete(this.model.cacheName).then(this.cacheClearHandle.bind(this));
  }
  
  private cacheClearHandle(deleted: boolean): boolean {
    if (deleted) {
      this.unitMetadata.clear();
      this.model.cachedIors = [];
      this.model.unitCount = 0;
      this.model.totalSizeBytes = 0;
      this.cache = null;
    }
    return deleted;
  }
  
  /**
   * Get the model
   */
  public modelGet(): UnitCacheManagerModel {
    return this.model;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Private Helpers
  // ═══════════════════════════════════════════════════════════════
  
  private statisticsCreate(now: string): StatisticsModel {
    return {
      totalOperations: 0,
      successCount: 0,
      errorCount: 0,
      lastOperationAt: '',
      lastErrorAt: '',
      createdAt: now,
      updatedAt: now
    };
  }
  
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
    return 'ucm-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
  }
}
