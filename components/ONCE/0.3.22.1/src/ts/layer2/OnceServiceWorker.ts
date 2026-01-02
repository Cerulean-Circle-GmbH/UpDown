/**
 * OnceServiceWorker.ts
 * 
 * ONCE Service Worker Component - Self-Registering!
 * 
 * When loaded in Service Worker context, this module auto-registers
 * event handlers, eliminating the need for a separate sw.ts entry point.
 * 
 * @layer2
 * @pattern Web4 P4: Radical OOP (bound methods, no arrow functions)
 * @pattern Web4 P6: Empty constructor + init()
 * @pattern Web4 P16: Object-Action naming
 * @pattern Self-Registration: Auto-registers in SW context
 * @pdca session/2025-12-12-UTC-1230.pwa-offline-unit-cache.pdca.md
 */

import type { ServiceWorkerModel } from '../layer3/ServiceWorkerModel.interface.js';
import type { StatisticsModel } from '../layer3/StatisticsModel.interface.js';
import { UnitCacheManager } from './UnitCacheManager.js';
import { CacheStrategy } from '../layer3/CacheStrategy.enum.js';
import { UnitType } from '../layer3/UnitType.enum.js';

// ═══════════════════════════════════════════════════════════════
// Service Worker Type Declarations
// These are needed because SW types aren't always in tsconfig
// ═══════════════════════════════════════════════════════════════

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const self: any;

// Minimal type declarations for SW context
interface SWExtendableEvent {
  waitUntil(promise: Promise<any>): void;
}

interface SWFetchEvent extends SWExtendableEvent {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

interface SWMessageEvent extends SWExtendableEvent {
  data: any;
  source: any;
}

interface SWClient {
  postMessage(message: any): void;
}

// Unit descriptor for precaching (matches /units response structure)
interface UnitDescriptor {
  ior: string;
  unitType?: string;
  name?: string;
}

interface UnitsApiResponse {
  version: string;
  generatedAt: string;
  totalUnits: number;
  units: UnitDescriptor[];
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Detect if we're running in Service Worker context
 * This is checked at module load time
 */
const isServiceWorkerContext: boolean = 
  typeof self !== 'undefined' && 
  typeof self.registration !== 'undefined' &&
  typeof self.skipWaiting === 'function';

/**
 * OnceServiceWorker
 * 
 * A ONCE kernel running in Service Worker context.
 * Provides:
 * - IOR-based caching using UnitCacheManager
 * - Cache-first strategy for versioned assets
 * - Offline support for PWA functionality
 * 
 * Self-Registration:
 * When this module is loaded in a Service Worker context,
 * it automatically creates an instance and registers event handlers.
 * This eliminates the need for a separate sw.ts entry point.
 * 
 * Web4 Principles:
 * - P4: All callbacks are bound methods (no arrow functions)
 * - P6: Empty constructor, init() for setup
 * - P16: fetchHandle(), installHandle() naming
 * - Environment Detection: Uses existing ONCE pattern for self.global.ONCE
 */
export class OnceServiceWorker {
  
  private model!: ServiceWorkerModel;
  private cacheManager: UnitCacheManager;
  private isInitialized: boolean = false;
  
  // Bandwidth tracking for adaptive strategy
  private recentFetchTimesMs: number[] = [];
  private readonly BANDWIDTH_SAMPLE_SIZE: number = 10;
  private readonly SLOW_THRESHOLD_MS: number = 2000;  // 2 seconds = "slow" network
  
  /**
   * Empty constructor - Web4 P6
   */
  constructor() {
    this.cacheManager = new UnitCacheManager();
  }
  
  /**
   * Initialize the Service Worker
   * @param model Configuration model
   */
  public init(model?: Partial<ServiceWorkerModel>): this {
    const now = new Date().toISOString();
    const config = model || {};
    
    this.model = {
      uuid: config.uuid || this.uuidGenerate(),
      name: config.name || 'OnceServiceWorker',
      iorComponent: 'OnceServiceWorker',
      iorVersion: config.iorVersion || '0.3.21.9',
      version: config.version || '1.0.0',
      cacheNamePrefix: config.cacheNamePrefix || 'once-pwa',
      defaultCacheStrategy: config.defaultCacheStrategy || CacheStrategy.NETWORK_FIRST,
      precachePatterns: config.precachePatterns || ['*.js', '*.css', '*.html'],
      // IOR calls (/ONCE/{version}/{uuid}/{method}) should never be cached - they're dynamic actions
      noCachePatterns: config.noCachePatterns || ['/api/*', '/ws/*', '/health', '/ONCE/*/*/*/*'],
      maxCacheSizeBytes: config.maxCacheSizeBytes || 50 * 1024 * 1024,
      maxCachedUnits: config.maxCachedUnits || 500,
      isActive: false,
      isWaiting: false,
      cachedUnitsCount: 0,
      cachedSizeBytes: 0,
      statistics: config.statistics || this.statisticsCreate(now)
    };
    
    // Initialize cache manager
    this.cacheManager.init({
      cacheName: this.cacheNameGet(),
      cacheVersion: this.model.version,
      maxSizeBytes: this.model.maxCacheSizeBytes
    });
    
    this.isInitialized = true;
    console.log('🔧 OnceServiceWorker initialized:', this.model.name);
    
    return this;
  }
  
  /**
   * Get full cache name with version
   */
  public cacheNameGet(): string {
    return this.model.cacheNamePrefix + '-v' + this.model.version;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Service Worker Event Handlers
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Handle install event
   * Called when SW is first installed
   */
  public installHandle(event: SWExtendableEvent): void {
    console.log('📦 OnceServiceWorker: install event');
    
    event.waitUntil(this.installExecute());
  }
  
  private installExecute(): Promise<void> {
    return this.cacheManager.cacheOpen()
      .then(this.precacheExecute.bind(this))
      .then(this.skipWaitingExecute.bind(this));
  }
  
  private precacheExecute(): Promise<void> {
    // Precache critical assets by fetching /units endpoint
    console.log('📦 OnceServiceWorker: precaching assets...');
    
    return fetch('/units')
      .then(this.unitsResponseParse.bind(this))
      .then(this.unitsPrecache.bind(this))
      .catch(this.precacheError.bind(this));
  }
  
  private unitsResponseParse(response: Response): Promise<UnitDescriptor[]> {
    if (!response.ok) {
      throw new Error(`Units fetch failed: ${response.status}`);
    }
    return response.json().then(this.unitsExtract.bind(this));
  }
  
  private unitsExtract(data: UnitsApiResponse): UnitDescriptor[] {
    // Extract units array from response
    return data.units || [];
  }
  
  private unitsPrecache(units: UnitDescriptor[]): Promise<void> {
    // Filter to essential units (JS, CSS, HTML)
    const essentialUnits = units.filter(this.unitIsEssential.bind(this));
    const urls = essentialUnits.map(this.unitIorGet.bind(this));
    
    console.log(`📦 Precaching ${urls.length} essential assets...`);
    
    // Cache all essential URLs
    return this.cacheManager.addAllToCache(urls)
      .then(this.precacheComplete.bind(this, urls.length));
  }
  
  private unitIsEssential(unit: UnitDescriptor): boolean {
    const ior = unit.ior || '';
    // Essential: JS, CSS, HTML files, and main entry points
    return ior.endsWith('.js') || 
           ior.endsWith('.css') || 
           ior.endsWith('.html') ||
           ior.includes('/dist/') ||
           ior.includes('/layer1/') ||
           ior.includes('/layer5/');
  }
  
  private unitIorGet(unit: UnitDescriptor): string {
    return unit.ior || '';
  }
  
  private precacheComplete(count: number): void {
    console.log(`✅ Precached ${count} assets successfully`);
  }
  
  private precacheError(error: Error): void {
    // Non-fatal: app works without precache, just slower first load
    console.warn('⚠️ Precache failed (non-fatal):', error.message);
  }
  
  private skipWaitingExecute(): Promise<void> {
    // Skip waiting to activate immediately
    if (isServiceWorkerContext) {
      return self.skipWaiting().then(this.skipWaitingComplete.bind(this));
    }
    return Promise.resolve();
  }
  
  private skipWaitingComplete(): void {
    console.log('📦 OnceServiceWorker: skipWaiting complete');
  }
  
  /**
   * Handle activate event
   * Called when SW becomes active
   */
  public activateHandle(event: SWExtendableEvent): void {
    console.log('✅ OnceServiceWorker: activate event');
    
    this.model.isActive = true;
    this.model.isWaiting = false;
    
    event.waitUntil(this.activateExecute());
  }
  
  private activateExecute(): Promise<void> {
    return this.oldCachesClean()
      .then(this.clientsClaimExecute.bind(this));
  }
  
  private oldCachesClean(): Promise<void> {
    const currentCache = this.cacheNameGet();
    
    return caches.keys().then(this.oldCachesFilter.bind(this, currentCache));
  }
  
  private oldCachesFilter(currentCache: string, cacheNames: string[]): Promise<void> {
    const deletePromises: Promise<boolean>[] = [];
    
    cacheNames.forEach(this.oldCacheCheck.bind(this, currentCache, deletePromises));
    
    return Promise.all(deletePromises).then(this.oldCachesCleanComplete.bind(this));
  }
  
  private oldCacheCheck(currentCache: string, deletePromises: Promise<boolean>[], cacheName: string): void {
    if (cacheName.startsWith(this.model.cacheNamePrefix) && cacheName !== currentCache) {
      console.log('🗑️ Deleting old cache:', cacheName);
      deletePromises.push(caches.delete(cacheName));
    }
  }
  
  private oldCachesCleanComplete(): void {
    console.log('✅ Old caches cleaned');
  }
  
  private clientsClaimExecute(): Promise<void> {
    if (isServiceWorkerContext) {
      return self.clients.claim().then(this.clientsClaimComplete.bind(this));
    }
    return Promise.resolve();
  }
  
  private clientsClaimComplete(): void {
    console.log('✅ OnceServiceWorker: clients claimed');
    this.globalSingletonRegister();
  }
  
  /**
   * Handle fetch event
   * Intercepts all network requests
   * 
   * Strategy: Network-first by default, cache-first when bandwidth is limited
   * This ensures fresh content during development while still supporting offline
   * 
   * @pdca 2026-01-02-UTC-1200.filebrowser-fix.pdca.md
   */
  public fetchHandle(event: SWFetchEvent): void {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
      return;
    }
    
    // Skip requests matching noCachePatterns
    if (this.shouldSkipCache(url.pathname)) {
      return;
    }
    
    // Adaptive strategy: network-first normally, cache-first on slow networks
    if (this.isBandwidthLimited()) {
      event.respondWith(this.cacheFirstFetch(request));
    } else {
      event.respondWith(this.networkFirstFetch(request));
    }
  }
  
  /**
   * Check if we should use cache-first due to bandwidth limitations
   * Looks at recent fetch times to determine if network is slow
   */
  private isBandwidthLimited(): boolean {
    if (this.recentFetchTimesMs.length < 3) {
      // Not enough data yet, assume network is fine
      return false;
    }
    
    // Calculate average of recent fetch times
    const sum = this.recentFetchTimesMs.reduce(this.sumReducer.bind(this), 0);
    const avg = sum / this.recentFetchTimesMs.length;
    
    return avg > this.SLOW_THRESHOLD_MS;
  }
  
  private sumReducer(acc: number, val: number): number {
    return acc + val;
  }
  
  /**
   * Record a fetch time for bandwidth tracking
   */
  private fetchTimeRecord(durationMs: number): void {
    this.recentFetchTimesMs.push(durationMs);
    
    // Keep only last N samples
    if (this.recentFetchTimesMs.length > this.BANDWIDTH_SAMPLE_SIZE) {
      this.recentFetchTimesMs.shift();
    }
  }
  
  /**
   * Network-first fetch strategy
   * Try network first, fallback to cache if offline/slow
   */
  private networkFirstFetch(request: Request): Promise<Response> {
    const ior = new URL(request.url).pathname;
    const startTime = Date.now();
    
    return fetch(request)
      .then(this.networkFirstSuccess.bind(this, ior, startTime))
      .catch(this.networkFirstFallback.bind(this, request, ior));
  }
  
  private networkFirstSuccess(ior: string, startTime: number, response: Response): Response {
    const duration = Date.now() - startTime;
    this.fetchTimeRecord(duration);
    
    console.log(`🌐 Network fetch: ${ior} (${duration}ms)`);
    
    // Cache successful responses
    if (response && response.status === 200) {
      const unitType = this.unitTypeFromPath(ior);
      this.cacheManager.unitPut(ior, response.clone(), unitType);
    }
    
    return response;
  }
  
  private networkFirstFallback(request: Request, ior: string, error: Error): Promise<Response> {
    console.log(`⚠️ Network failed for ${ior}, trying cache:`, error.message);
    
    return this.cacheManager.unitGet(ior)
      .then(this.cacheFallbackHandle.bind(this, ior));
  }
  
  private cacheFallbackHandle(ior: string, cachedResponse: Response | undefined): Response {
    if (cachedResponse) {
      console.log(`📦 Cache fallback hit: ${ior}`);
      return cachedResponse;
    }
    
    // No cache, return error response
    console.log(`❌ No cache for: ${ior}`);
    return new Response('Network error and no cache available', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
  
  private shouldSkipCache(pathname: string): boolean {
    const patterns = this.model.noCachePatterns;
    
    for (let i = 0; i < patterns.length; i = i + 1) {
      if (this.patternMatches(patterns[i], pathname)) {
        return true;
      }
    }
    
    return false;
  }
  
  private patternMatches(pattern: string, pathname: string): boolean {
    // Simple glob matching: * matches any characters
    const regex = pattern
      .replace(/\*/g, '.*')
      .replace(/\//g, '\\/');
    return new RegExp('^' + regex + '$').test(pathname);
  }
  
  /**
   * Cache-first fetch strategy
   * Check cache first, fallback to network
   */
  private cacheFirstFetch(request: Request): Promise<Response> {
    const ior = new URL(request.url).pathname;
    
    return this.cacheManager.unitGet(ior)
      .then(this.cacheFirstHandle.bind(this, request, ior));
  }
  
  private cacheFirstHandle(request: Request, ior: string, cachedResponse: Response | undefined): Promise<Response> | Response {
    if (cachedResponse) {
      console.log('📦 Cache hit:', ior);
      return cachedResponse;
    }
    
    console.log('🌐 Cache miss, fetching:', ior);
    return fetch(request).then(this.fetchAndCache.bind(this, ior));
  }
  
  private fetchAndCache(ior: string, response: Response): Response {
    // Only cache successful responses
    if (!response || response.status !== 200) {
      return response;
    }
    
    // Determine unit type from URL
    const unitType = this.unitTypeFromPath(ior);
    
    // Cache the response (async, don't wait)
    this.cacheManager.unitPut(ior, response.clone(), unitType);
    
    return response;
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
  
  /**
   * Handle message event
   * Receives messages from main thread
   */
  public messageHandle(event: SWMessageEvent): void {
    console.log('📨 OnceServiceWorker: message received', event.data);
    
    const data = event.data;
    
    if (!data || !data.type) {
      return;
    }
    
    switch (data.type) {
      case 'SKIP_WAITING':
        this.skipWaitingExecute();
        break;
      case 'CACHE_CLEAR':
        this.cacheManager.cacheClear();
        break;
      case 'GET_STATUS':
        this.statusReply(event);
        break;
    }
  }
  
  private statusReply(event: SWMessageEvent): void {
    const client = event.source as SWClient;
    if (client) {
      client.postMessage({
        type: 'STATUS',
        model: this.model
      });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Global Singleton Registration (ONCE Pattern)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Register as global singleton in SW context
   * Follows ONCE pattern: self.global.ONCE
   */
  private globalSingletonRegister(): void {
    if (!isServiceWorkerContext) {
      return;
    }
    
    try {
      // Create global namespace if it doesn't exist
      if (!(self as any).global) {
        (self as any).global = {};
      }
      
      // Register this instance (or a minimal kernel interface)
      (self as any).global.ONCE_SW = this;
      
      console.log('🌐 OnceServiceWorker registered as self.global.ONCE_SW');
    } catch (error) {
      console.warn('⚠️ Failed to register SW singleton:', error);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Static Self-Registration
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Static method to register the Service Worker
   * Called at module load time only in SW context
   */
  public static register(): void {
    console.log('🚀 OnceServiceWorker.register() called');
    
    const instance = new OnceServiceWorker();
    instance.init();
    
    // Register SW lifecycle events using bound methods (Web4 P4)
    self.addEventListener('install', instance.installHandle.bind(instance));
    self.addEventListener('activate', instance.activateHandle.bind(instance));
    self.addEventListener('fetch', instance.fetchHandle.bind(instance));
    self.addEventListener('message', instance.messageHandle.bind(instance));
    
    console.log('✅ OnceServiceWorker event handlers registered');
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Accessors
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get the model
   */
  public modelGet(): ServiceWorkerModel {
    return this.model;
  }
  
  /**
   * Get cache manager
   */
  public cacheManagerGet(): UnitCacheManager {
    return this.cacheManager;
  }
  
  /**
   * Check if initialized
   */
  public isInitializedGet(): boolean {
    return this.isInitialized;
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
  
  private uuidGenerate(): string {
    return 'sw-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
  }
}

// ═══════════════════════════════════════════════════════════════
// SELF-REGISTRATION
// ═══════════════════════════════════════════════════════════════
// When this module is loaded in Service Worker context,
// automatically register the service worker.
// This eliminates the need for a separate sw.ts entry point!

if (isServiceWorkerContext) {
  OnceServiceWorker.register();
}
