/**
 * AbstractWebBean.ts - Base class for Web4 Lit Web Components
 * 
 * Extends UcpView with CSS/HTML file loading capabilities.
 * Uses Unit component to track external files with UUIDs.
 * 
 * Web4 Principles:
 * - P8: DRY (shared CSS/template loading)
 * - P19: Separation of concerns (CSS/HTML in separate files)
 * 
 * Directory Structure:
 *   layer5/views/
 *   ├── css/ItemView.css
 *   ├── css/DefaultView.css
 *   ├── webBeans/ItemView.html
 *   └── webBeans/DefaultView.html
 * 
 * @ior ior:esm:/ONCE/{version}/AbstractWebBean
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 */

import { CSSResult, unsafeCSS } from 'lit';
import { UcpView } from './UcpView.js';
import { Reference } from '../../layer3/Reference.interface.js';

/**
 * AbstractWebBean - Base class for Lit web components with external CSS/HTML
 * 
 * Handles loading of external CSS and HTML template files.
 * Subclasses provide viewName to locate their files.
 */
export abstract class AbstractWebBean<TModel = any> extends UcpView<TModel> {
  
  /** Cached CSS content */
  protected cssCache: Reference<CSSResult> = null;
  
  /** Cached HTML template content */
  protected templateCache: Reference<string> = null;
  
  /**
   * Abstract: Subclass must provide view name for file discovery
   * Example: 'ItemView' → css/ItemView.css, webBeans/ItemView.html
   */
  abstract get viewName(): string;
  
  /**
   * Lit lifecycle: Ensure parent connectedCallback is called
   * This triggers UcpView.applyCachedStyles()
   */
  connectedCallback(): void {
    super.connectedCallback();  // Calls UcpView.connectedCallback → applyCachedStyles
    console.log(`[AbstractWebBean] ${this.viewName} connected`);
  }
  
  /**
   * Get CSS path for this view (instance method)
   * Note: Static cssPath is used by UcpView.applyCachedStyles()
   */
  protected get cssPathInstance(): string {
    return `./css/${this.viewName}.css`;
  }
  
  /**
   * Get HTML template path for this view
   */
  protected get templatePath(): string {
    return `./webBeans/${this.viewName}.html`;
  }
  
  /**
   * Load CSS from external file
   * Caches result for performance
   * @param cssPath Path to CSS file
   * @returns CSSResult for Lit static styles
   */
  protected async cssLoad(cssPath: string): Promise<CSSResult> {
    if (this.cssCache !== null) {
      return this.cssCache;
    }
    
    const cssContent = await this.fileLoad(cssPath);
    this.cssCache = unsafeCSS(cssContent);
    return this.cssCache;
  }
  
  /**
   * Load HTML template from external file
   * @param templatePath Path to HTML template file
   * @returns HTML string
   */
  protected async templateLoad(templatePath: string): Promise<string> {
    if (this.templateCache !== null) {
      return this.templateCache;
    }
    
    this.templateCache = await this.fileLoad(templatePath);
    return this.templateCache;
  }
  
  /**
   * Generic file loader
   * @param filePath Path to file
   * @returns File content as string
   */
  private async fileLoad(filePath: string): Promise<string> {
    const response = await fetch(filePath);
    if (!response.ok) {
      console.warn(`Failed to load ${filePath}: ${response.status}`);
      return '';
    }
    return response.text();
  }
  
  /**
   * Initialize view - load CSS and template
   * Called after construction, before first render
   * @deprecated Use CSSLoader preloading instead
   */
  async viewInit(): Promise<void> {
    await Promise.all([
      this.cssLoad(this.cssPathInstance),
      this.templateLoad(this.templatePath)
    ]);
  }
}

