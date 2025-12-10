/**
 * UcpView.ts - Base class for all Web4 Views
 * 
 * Base class extending LitElement for all Web4 views.
 * Provides model binding, child view management, and CSS preloading.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P5: Reference<T> for nullable
 * - P6: Empty constructor (Lit compatibility via delegation if needed)
 * - P7: All methods are SYNCHRONOUS (Layer 5)
 * - P16: TypeScript accessors
 * - P19: External CSS via adoptedStyleSheets
 * - P22: Collection<T> for child views
 * 
 * CSS Loading Pattern:
 *   1. CSSLoader.preloadAll() called before component import
 *   2. connectedCallback() applies cached CSSStyleSheet
 *   3. No FOUC (Flash of Unstyled Content)
 * 
 * @ior ior:esm:/ONCE/{version}/UcpView
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 * @pdca 2025-12-03-UTC-1400.lit-css-preload.pdca.md
 */

import { LitElement } from 'lit';
import { View } from '../../layer3/View.interface.js';
import { Reference } from '../../layer3/Reference.interface.js';
import { CSSLoader } from '../../layer2/CSSLoader.js';

/**
 * UcpView - Base class for all Web4 Views
 * 
 * All views (ItemView, DefaultView, OnceOverView) extend this.
 * 
 * Layer 5 - All methods are SYNCHRONOUS!
 */
export abstract class UcpView<TModel = any> extends LitElement implements View<TModel> {
  
  /**
   * CSS path for this view - override in subclass
   * Example: '/dist/ts/layer5/views/css/ItemView.css'
   */
  static cssPath: string = '';
  
  /** Model reference - Use Reference<T>, NOT | null */
  private modelRef: Reference<TModel> = null;
  
  /** Child views collection */
  protected childViews: UcpView<any>[] = [];
  
  /**
   * Lit lifecycle: Called when element is added to DOM
   * Applies preloaded CSS from CSSLoader cache
   */
  connectedCallback(): void {
    console.log(`[UcpView] connectedCallback for ${this.constructor.name}`);
    try {
      super.connectedCallback();
      this.applyCachedStyles();
    } catch (e) {
      console.error(`[UcpView] Error in connectedCallback:`, e);
    }
  }
  
  /**
   * Apply cached CSS from CSSLoader
   * Called in connectedCallback to ensure styles are applied
   * 
   * IMPORTANT: APPENDS to existing adoptedStyleSheets (preserves Lit's static styles)
   */
  private applyCachedStyles(): void {
    const cssPath = (this.constructor as typeof UcpView).cssPath;
    
    if (!cssPath) {
      return;  // No external CSS path defined for this view
    }
    
    const sheet = CSSLoader.get(cssPath);
    
    if (sheet && this.shadowRoot) {
      // APPEND to existing styles (don't replace Lit's static styles!)
      const existingStyles = [...this.shadowRoot.adoptedStyleSheets];
      if (!existingStyles.includes(sheet)) {
        this.shadowRoot.adoptedStyleSheets = [...existingStyles, sheet];
      }
    }
  }
  
  /**
   * Model setter - TypeScript accessor (NOT modelConnect!)
   * Triggers requestUpdate() when model is set.
   */
  set model(model: TModel) {
    this.modelRef = model;
    this.requestUpdate();  // Let Lit handle the update lifecycle
  }
  
  /**
   * Model getter
   * @throws Error if model not initialized
   */
  get model(): TModel {
    if (this.modelRef === null) {
      throw new Error('Model not initialized - set model first');
    }
    return this.modelRef;
  }
  
  /**
   * Check if model is initialized
   */
  get hasModel(): boolean {
    return this.modelRef !== null;
  }
  
  /**
   * Refresh view when model changes - SYNCHRONOUS!
   * 
   * Called by: UcpController.viewsUpdateAll() from Layer 2
   * This is the entry point from Layer 2 into Layer 5.
   * 
   * Web4 Principle 7: Layer 5 is synchronous
   * 
   * Note: Named 'refresh' to avoid conflict with Lit's internal update()
   */
  refresh(): void {
    this.requestUpdate();  // Lit schedules re-render (sync call)
  }
  
  /**
   * Add child view - Web4 pattern instead of appendChild()
   * @param childView View to add as child
   */
  add(childView: View<any>): void {
    if (childView instanceof UcpView) {
      this.childViews.push(childView);
    }
    // Subclass decides where to append in DOM
  }
  
  /**
   * Remove child view
   * (Named childRemove to avoid conflict with LitElement.remove())
   * @param childView View to remove
   */
  childRemove(childView: View<any>): void {
    if (!(childView instanceof UcpView)) return;
    const index = this.childViews.indexOf(childView);
    if (index > -1) {
      this.childViews.splice(index, 1);
      childView.remove();  // DOM remove (LitElement method)
    }
  }
  
  /**
   * Render the view - must be implemented by subclass
   * Returns Lit TemplateResult
   */
  abstract render(): any;
}

