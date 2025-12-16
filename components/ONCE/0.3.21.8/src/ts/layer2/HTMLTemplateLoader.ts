/**
 * HTMLTemplateLoader.ts - Web4 HTML Template Preloader
 * 
 * Preloads HTML template files and caches them as strings
 * for use in Lit component render methods.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P6: Empty constructor
 * - P19: Enables external HTML templates (separation of concerns)
 * 
 * Usage:
 *   await HTMLTemplateLoader.preloadAll(['/webBeans/ItemView.html']);
 *   const template = HTMLTemplateLoader.get('/webBeans/ItemView.html');
 * 
 * @ior ior:esm:/ONCE/{version}/HTMLTemplateLoader
 * @pdca 2025-12-03-UTC-1400.lit-css-preload.pdca.md
 */

import { Reference } from '../layer3/Reference.interface.js';

/**
 * HTMLTemplateLoader - Preloads HTML templates for Lit components
 * 
 * Fetches HTML template files and caches them as strings.
 * Templates define structure, TypeScript/Lit handles bindings.
 * 
 * This enables Web4 Principle 19 (external templates) while
 * keeping Lit's reactive binding capabilities.
 */
export class HTMLTemplateLoader {
  
  /** Cache of loaded templates */
  private static cache: Map<string, string> = new Map();
  
  /** Loading promises to prevent duplicate fetches */
  private static loading: Map<string, Promise<string>> = new Map();
  
  /**
   * Empty constructor - Web4 Principle 6
   * Use static methods for loading
   */
  constructor() {
    // Static class - use HTMLTemplateLoader.preload() etc.
  }
  
  /**
   * Preload a single HTML template file
   * @param templatePath URL path to HTML template file
   * @returns Template content as string
   */
  static async preload(templatePath: string): Promise<string> {
    // Return cached template if available
    const cached = this.cache.get(templatePath);
    if (cached) {
      return cached;
    }
    
    // Return existing loading promise to prevent duplicate fetches
    const existingLoad = this.loading.get(templatePath);
    if (existingLoad) {
      return existingLoad;
    }
    
    // Create loading promise
    const loadPromise = this.fetchTemplate(templatePath);
    this.loading.set(templatePath, loadPromise);
    
    try {
      const template = await loadPromise;
      this.cache.set(templatePath, template);
      return template;
    } finally {
      this.loading.delete(templatePath);
    }
  }
  
  /**
   * Fetch HTML template content
   * @param templatePath URL path to HTML template file
   * @returns Template content as string
   */
  private static async fetchTemplate(templatePath: string): Promise<string> {
    const response = await fetch(templatePath);
    
    if (!response.ok) {
      console.warn(`[HTMLTemplateLoader] Failed to load ${templatePath}: ${response.status}`);
      // Return empty string on error
      return '';
    }
    
    const htmlText = await response.text();
    console.log(`[HTMLTemplateLoader] ✅ Loaded: ${templatePath}`);
    return htmlText;
  }
  
  /**
   * Preload multiple HTML templates in parallel
   * @param templatePaths Array of HTML template file paths
   */
  static async preloadAll(templatePaths: string[]): Promise<void> {
    const promises: Promise<string>[] = [];
    
    // Use method reference binding (not arrow function)
    templatePaths.forEach(this.addPreloadPromise.bind(this, promises));
    
    await Promise.all(promises);
    console.log(`[HTMLTemplateLoader] ✅ Preloaded ${templatePaths.length} templates`);
  }
  
  /**
   * Helper for preloadAll - adds promise to array
   * Called via method reference binding
   */
  private static addPreloadPromise(promises: Promise<string>[], templatePath: string): void {
    promises.push(this.preload(templatePath));
  }
  
  /**
   * Get a cached template
   * @param templatePath URL path to HTML template file
   * @returns Cached template string or null if not loaded
   */
  static get(templatePath: string): Reference<string> {
    return this.cache.get(templatePath) || null;
  }
  
  /**
   * Check if a template is loaded
   * @param templatePath URL path to HTML template file
   */
  static has(templatePath: string): boolean {
    return this.cache.has(templatePath);
  }
  
  /**
   * Parse template with model interpolation
   * Simple ${model.xxx} replacement
   * @param template Template string with placeholders
   * @param model Model object for interpolation
   * @returns Interpolated HTML string
   */
  static interpolate(template: string, model: Record<string, any>): string {
    // Replace ${model.xxx} with actual values
    return template.replace(/\$\{model\.(\w+)\}/g, function(match, prop) {
      const value = model[prop];
      return value !== undefined ? String(value) : '';
    });
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






















