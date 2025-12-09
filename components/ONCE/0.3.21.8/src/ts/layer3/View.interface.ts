/**
 * View.interface.ts - Web4 View Interface
 * 
 * Base interface for all MVC views in Web4.
 * 
 * Note: Kept as interface (not JsInterface class) because Lit views
 * need to extend LitElement. TypeScript doesn't support multiple inheritance.
 * 
 * For JsInterface-style registration, use ViewRegistry in Layer 2.
 * 
 * Web4 Principles:
 * - P7: Layer 5 is SYNCHRONOUS (update() is sync)
 * - P16: TypeScript accessors (set model(), get model())
 * - P19: One file, one type
 * - P22: Collection<T> for child views
 * 
 * @ior ior:esm:/ONCE/{version}/View
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 * @pdca 2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

/**
 * Web4 View Interface
 * 
 * All views implement this for consistent rendering and model binding.
 * Views are Layer 5 components - all methods are SYNCHRONOUS.
 * 
 * Note: This is an interface (not JsInterface) because views must extend LitElement.
 * Use RelatedObjects registry with concrete view classes for lookup.
 */
export interface View<TModel = any> {
  
  /**
   * Model setter - TypeScript accessor pattern
   * NOT modelConnect()!
   */
  set model(model: TModel);
  
  /**
   * Model getter
   */
  get model(): TModel;
  
  /**
   * Refresh view when model changes - SYNCHRONOUS!
   * Called by ModelProxy.viewsNotify() from Layer 2.
   * 
   * Note: Named 'refresh' because Lit's 'update' is protected.
   * 
   * Web4 Principle 7: Layer 5 is synchronous
   */
  refresh(): void;
  
  /**
   * Add child view - Web4 pattern instead of appendChild()
   * @param childView View to add as child
   */
  add(childView: View<any>): void;
  
  /**
   * Remove child view
   * (Named childRemove to avoid conflict with LitElement.remove())
   * @param childView View to remove
   */
  childRemove(childView: View<any>): void;
  
  /**
   * Render the view
   * For Lit components, returns TemplateResult
   * For vanilla, manipulates DOM directly
   */
  render(): any;
}
