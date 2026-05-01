/**
 * CSSLoader.ts - Web4 CSS Preloader
 * 
 * Preloads CSS files and caches them as CSSStyleSheet objects
 * for use with Lit's adoptedStyleSheets API.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P6: Empty constructor
 * - P19: Enables external CSS (separation of concerns)
 * 
 * Cache Keys:
 * - Full URL: /ONCE/0.3.21.9/src/ts/layer5/views/css/ItemView.css
 * - Filename: ItemView.css
 * This allows components to use simple filenames while loading uses full URLs.
 * 
 * Usage:
 *   await CSSLoader.preloadAll(['/ONCE/0.3.21.9/src/.../ItemView.css']);
 *   const sheet = CSSLoader.get('ItemView.css'); // Works with filename!
 *   element.shadowRoot.adoptedStyleSheets = [sheet];
 * 
 * @ior ior:esm:/ONCE/{version}/CSSLoader
 * @pdca 2025-12-03-UTC-1400.lit-css-preload.pdca.md
 */

import { Reference } from '../layer3/Reference.interface.js';
import { IOR } from '../layer4/IOR.js';

/**
 * CSSLoader - Preloads CSS files for Lit components
 * 
 * Fetches CSS files and creates CSSStyleSheet objects that can be
 * applied to shadow roots via adoptedStyleSheets.
 * 
 * Caches by both full path AND filename for flexible lookup.
 * 
 * This enables Web4 Principle 19 (external CSS) while still
 * working with Lit's shadow DOM encapsulation.
 */
export class CSSLoader {
  
  /** Cache of loaded stylesheets (keyed by full path AND filename) */
  private static cache: Map<string, CSSStyleSheet> = new Map();
  
  /** Loading promises to prevent duplicate fetches */
  private static loading: Map<string, Promise<CSSStyleSheet>> = new Map();
  
  /** Retry configuration */
  private static readonly MAX_RETRIES = 3;
  private static readonly INITIAL_DELAY_MS = 100;
  
  /**
   * Empty constructor - Web4 Principle 6
   * Use static methods for loading
   */
  constructor() {
    // Static class - use CSSLoader.preload() etc.
  }
  
  /**
   * Preload a single CSS file
   * @param cssPath URL path to CSS file
   * @returns CSSStyleSheet ready for adoptedStyleSheets
   */
  static async preload(cssPath: string): Promise<CSSStyleSheet> {
    // Return cached sheet if available
    const cached = this.cache.get(cssPath);
    if (cached) {
      return cached;
    }
    
    // Return existing loading promise to prevent duplicate fetches
    const existingLoad = this.loading.get(cssPath);
    if (existingLoad) {
      return existingLoad;
    }
    
    // Create loading promise
    const loadPromise = this.fetchAndParse(cssPath);
    this.loading.set(cssPath, loadPromise);
    
    try {
      const sheet = await loadPromise;
      // Cache by full path
      this.cache.set(cssPath, sheet);
      // Also cache by filename for easy component lookup
      const filename = this.extractFilename(cssPath);
      if (filename) {
        this.cache.set(filename, sheet);
      }
      return sheet;
    } finally {
      this.loading.delete(cssPath);
    }
  }
  
  /**
   * Fetch CSS and parse into CSSStyleSheet with retry logic
   * Via IOR (F.2b)
   * @param cssPath URL path to CSS file
   * @returns Parsed CSSStyleSheet
   */
  private static async fetchAndParse(cssPath: string): Promise<CSSStyleSheet> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const ior = await new IOR().init(cssPath);
        const cssText = await ior.load<string>();
        
        // Debug: Check what IOR.load() actually returned
        const cssType = typeof cssText;
        const cssLength = typeof cssText === 'string' ? cssText.length : 'N/A';
        console.log(`[CSSLoader] 📦 IOR returned type: ${cssType}, length: ${cssLength}`);
        if (typeof cssText === 'string' && cssText.length > 0) {
          console.log(`[CSSLoader] 📄 First 100 chars: ${cssText.substring(0, 100)}`);
        } else {
          console.warn(`[CSSLoader] ⚠️ Empty or non-string CSS content for: ${cssPath}`);
        }
        
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(cssText);
        
        if (attempt > 0) {
          console.log(`[CSSLoader] ✅ Loaded after ${attempt + 1} attempts: ${cssPath}`);
        } else {
          console.log(`[CSSLoader] ✅ Loaded: ${cssPath}`);
        }
        return sheet;
      } catch (error: any) {
        lastError = error;
        if (attempt < this.MAX_RETRIES - 1) {
          const delay = this.INITIAL_DELAY_MS * Math.pow(2, attempt);
          console.warn(`[CSSLoader] Retry ${attempt + 1}/${this.MAX_RETRIES} for ${cssPath} in ${delay}ms`);
          await this.delay(delay);
        }
      }
    }
    
    console.error(`[CSSLoader] ❌ Failed after ${this.MAX_RETRIES} attempts: ${cssPath}`, lastError);
    // Return empty stylesheet on final failure
    const emptySheet = new CSSStyleSheet();
    return emptySheet;
  }
  
  /**
   * Delay helper for retry backoff (P4: no arrow function)
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(this.resolveAfterDelay.bind(this, ms));
  }
  
  /**
   * Resolve callback for delay (P4: bound method)
   */
  private static resolveAfterDelay(ms: number, resolve: () => void): void {
    setTimeout(resolve, ms);
  }
  
  /**
   * Preload multiple CSS files in parallel
   * @param cssPaths Array of CSS file paths
   */
  static async preloadAll(cssPaths: string[]): Promise<void> {
    const promises: Promise<CSSStyleSheet>[] = [];
    
    // Use method reference binding (not arrow function)
    cssPaths.forEach(this.addPreloadPromise.bind(this, promises));
    
    await Promise.all(promises);
    console.log(`[CSSLoader] ✅ Preloaded ${cssPaths.length} stylesheets`);
  }
  
  /**
   * Helper for preloadAll - adds promise to array
   * Called via method reference binding
   */
  private static addPreloadPromise(promises: Promise<CSSStyleSheet>[], cssPath: string): void {
    promises.push(this.preload(cssPath));
  }
  
  /**
   * Get a cached stylesheet
   * @param cssPath URL path to CSS file
   * @returns Cached CSSStyleSheet or null if not loaded
   */
  static get(cssPath: string): Reference<CSSStyleSheet> {
    return this.cache.get(cssPath) || null;
  }
  
  /**
   * Check if a stylesheet is loaded
   * @param cssPath URL path to CSS file
   */
  static has(cssPath: string): boolean {
    return this.cache.has(cssPath);
  }
  
  /**
   * Clear the cache (for testing)
   */
  static clear(): void {
    this.cache.clear();
    this.loading.clear();
  }
  
  /**
   * Get all cached paths (for debugging)
   */
  static get cachedPaths(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Extract filename from path
   * /ONCE/0.3.21.9/src/ts/.../ItemView.css → ItemView.css
   */
  private static extractFilename(cssPath: string): string {
    const parts = cssPath.split('/');
    return parts[parts.length - 1];
  }
}

