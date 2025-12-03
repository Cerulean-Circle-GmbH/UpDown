/**
 * UcpView.ts - Base class for all Web4 Views
 * 
 * Base class extending LitElement for all Web4 views.
 * Provides model binding and child view management.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P5: Reference<T> for nullable
 * - P6: Empty constructor (Lit compatibility via delegation if needed)
 * - P7: All methods are SYNCHRONOUS (Layer 5)
 * - P16: TypeScript accessors
 * - P22: Collection<T> for child views
 * 
 * Note: If LitElement isn't compatible with empty constructors,
 * use delegation pattern - see AbstractWebBean.
 * 
 * @ior ior:esm:/ONCE/{version}/UcpView
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 */

import { LitElement } from 'lit';
import { View } from '../../layer3/View.interface.js';
import { Reference } from '../../layer3/Reference.interface.js';

/**
 * UcpView - Base class for all Web4 Views
 * 
 * All views (ItemView, DefaultView, OnceOverView) extend this.
 * 
 * Layer 5 - All methods are SYNCHRONOUS!
 */
export abstract class UcpView<TModel = any> extends LitElement implements View<TModel> {
  
  /** Model reference - Use Reference<T>, NOT | null */
  private modelRef: Reference<TModel> = null;
  
  /** Child views collection */
  protected childViews: UcpView<any>[] = [];
  
  /**
   * Model setter - TypeScript accessor (NOT modelConnect!)
   * Triggers update() when model is set.
   */
  set model(model: TModel) {
    this.modelRef = model;
    this.update();
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
   * Update view when model changes - SYNCHRONOUS!
   * 
   * Called by: UcpController.viewsUpdateAll() from Layer 2
   * This is the entry point from Layer 2 into Layer 5.
   * 
   * Web4 Principle 7: Layer 5 is synchronous
   * 
   * Override for custom behavior, but always call super.update()
   */
  update(): void {
    this.requestUpdate();  // Lit schedules re-render (sync call)
  }
  
  /**
   * Add child view - Web4 pattern instead of appendChild()
   * @param childView View to add as child
   */
  add(childView: UcpView<any>): void {
    this.childViews.push(childView);
    // Subclass decides where to append in DOM
  }
  
  /**
   * Remove child view
   * (Named childRemove to avoid conflict with LitElement.remove())
   * @param childView View to remove
   */
  childRemove(childView: UcpView<any>): void {
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

