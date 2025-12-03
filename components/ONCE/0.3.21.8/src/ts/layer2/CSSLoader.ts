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
 * Usage:
 *   await CSSLoader.preloadAll(['/css/ItemView.css', '/css/OnceOverView.css']);
 *   const sheet = CSSLoader.get('/css/ItemView.css');
 *   element.shadowRoot.adoptedStyleSheets = [sheet];
 * 
 * @ior ior:esm:/ONCE/{version}/CSSLoader
 * @pdca 2025-12-03-UTC-1400.lit-css-preload.pdca.md
 */

import { Reference } from '../layer3/Reference.interface.js';

/**
 * CSSLoader - Preloads CSS files for Lit components
 * 
 * Fetches CSS files and creates CSSStyleSheet objects that can be
 * applied to shadow roots via adoptedStyleSheets.
 * 
 * This enables Web4 Principle 19 (external CSS) while still
 * working with Lit's shadow DOM encapsulation.
 */
export class CSSLoader {
  
  /** Cache of loaded stylesheets */
  private static cache: Map<string, CSSStyleSheet> = new Map();
  
  /** Loading promises to prevent duplicate fetches */
  private static loading: Map<string, Promise<CSSStyleSheet>> = new Map();
  
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
      this.cache.set(cssPath, sheet);
      return sheet;
    } finally {
      this.loading.delete(cssPath);
    }
  }
  
  /**
   * Fetch CSS and parse into CSSStyleSheet
   * @param cssPath URL path to CSS file
   * @returns Parsed CSSStyleSheet
   */
  private static async fetchAndParse(cssPath: string): Promise<CSSStyleSheet> {
    const response = await fetch(cssPath);
    
    if (!response.ok) {
      console.warn(`[CSSLoader] Failed to load ${cssPath}: ${response.status}`);
      // Return empty stylesheet on error
      const emptySheet = new CSSStyleSheet();
      return emptySheet;
    }
    
    const cssText = await response.text();
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssText);
    
    console.log(`[CSSLoader] ✅ Loaded: ${cssPath}`);
    return sheet;
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
}

