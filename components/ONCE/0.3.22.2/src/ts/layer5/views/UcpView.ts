/**
 * UcpView.ts - Base class for all Web4 Views
 * 
 * Base class extending LitElement for all Web4 views.
 * Provides model binding, child view management, CSS preloading,
 * UNIVERSAL DROP SUPPORT (Web4 Principle 31), and POLYMORPHIC
 * VIEW DISPATCH via tagFor() (Option C - ISR Pattern).
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P5: Reference<T> for nullable
 * - P6: Empty constructor (Lit compatibility via delegation if needed)
 * - P7: All methods are SYNCHRONOUS (Layer 5)
 * - P16: TypeScript accessors
 * - P19: External CSS via adoptedStyleSheets
 * - P22: Collection<T> for child views
 * - P31: Universal Drop Support - ALL views accept drops by default
 * - P34: IOR as Unified Entry Point (tagFor polymorphic dispatch)
 * 
 * CSS Loading Pattern:
 *   1. CSSLoader.preloadAll() called before component import
 *   2. connectedCallback() applies cached CSSStyleSheet
 *   3. No FOUC (Flash of Unstyled Content)
 * 
 * Drop Handling (P31):
 *   1. ALL views accept file drops by default
 *   2. Set dropDisabled="true" attribute to opt out
 *   3. Drop fires 'file-drop' event with file details
 *   4. Parent can call view.add(component) to add dropped content
 * 
 * Polymorphic View Dispatch (Option C - ISR):
 *   1. Use UcpView.tagFor(child) to get custom element tag
 *   2. Returns 'ior-loading-view' for unresolved IOR objects
 *   3. Returns 'file-item-view' for File instances
 *   4. Returns 'folder-item-view' for Folder instances
 *   5. Views register via UcpView.viewRegister(TypeClass, 'tag-name')
 * 
 * @ior ior:esm:/ONCE/{version}/UcpView
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 * @pdca 2025-12-03-UTC-1400.lit-css-preload.pdca.md
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 * @pdca 2025-12-30-UTC-1200.lazy-reference-kernel-isr.pdca.md
 */

import { LitElement, css, CSSResultGroup } from 'lit';
import { property } from 'lit/decorators.js';
import { View } from '../../layer3/View.interface.js';
import { Reference } from '../../layer3/Reference.interface.js';
import { FileDropDetail } from '../../layer3/FileDropDetail.interface.js';
import { CSSLoader } from '../../layer2/CSSLoader.js';

// Re-export for backwards compatibility
export type { FileDropDetail };

/**
 * UcpView - Base class for all Web4 Views
 * 
 * All views (ItemView, DefaultView, OnceOverView) extend this.
 * 
 * Layer 5 - All methods are SYNCHRONOUS!
 */
export abstract class UcpView<TModel = any> extends LitElement implements View<TModel> {
  
  // ═══════════════════════════════════════════════════════════════
  // STATIC: View Registry for Polymorphic Dispatch (Option C - ISR)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Registry: Constructor → custom element tag name
   * Used by tagFor() for polymorphic view dispatch.
   */
  private static viewRegistry: Map<Function, string> = new Map();
  
  /**
   * Default tag for unresolved IOR objects
   */
  private static readonly IOR_LOADING_TAG = 'ior-loading-view';
  
  /**
   * Default tag when no view is registered for a type
   */
  private static readonly DEFAULT_TAG = 'default-item-view';
  
  /**
   * Register a view for a type (polymorphic dispatch)
   * 
   * Called during view module initialization to register which
   * custom element tag to use for rendering instances of a type.
   * 
   * @param typeClass The constructor function (e.g., DefaultFile, DefaultFolder)
   * @param tagName The custom element tag (e.g., 'file-item-view')
   * 
   * @example
   * ```typescript
   * // In FileItemView.ts
   * UcpView.viewRegister(DefaultFile, 'file-item-view');
   * ```
   */
  static viewRegister(typeClass: Function, tagName: string): void {
    UcpView.viewRegistry.set(typeClass, tagName);
    console.log(`[UcpView] Registered ${typeClass.name} → <${tagName}>`);
  }
  
  /**
   * Get the custom element tag for an instance (polymorphic dispatch)
   * 
   * Used in views to render Collection<T> children polymorphically.
   * Checks if the value is an IOR (loading) or resolved instance.
   * 
   * @param value The value from Collection (IOR or instance)
   * @returns Custom element tag name
   * 
   * @example
   * ```typescript
   * // In FolderOverView.renderChildren()
   * for (const child of this.model.children) {
   *   const tag = UcpView.tagFor(child);  // 'ior-loading-view' or 'file-item-view'
   *   parts.push(html`<${tag} .model=${child.model || child}></${tag}>`);
   * }
   * ```
   */
  static tagFor(value: unknown): string {
    // Null/undefined → default
    if (value === null || value === undefined) {
      return UcpView.DEFAULT_TAG;
    }
    
    // String (IOR string not yet converted) → loading
    if (typeof value === 'string') {
      return UcpView.IOR_LOADING_TAG;
    }
    
    // IOR object (resolving or resolved) → check isResolving
    if (typeof value === 'object' && 'isResolving' in value) {
      const ior = value as { isResolving: boolean; value?: unknown };
      
      // If resolved, use the resolved value's tag
      if (!ior.isResolving && ior.value !== undefined && ior.value !== null) {
        return UcpView.tagFor(ior.value);
      }
      
      // Still resolving → loading view
      return UcpView.IOR_LOADING_TAG;
    }
    
    // Check registry for constructor match
    const constructor = (value as object).constructor;
    const registeredTag = UcpView.viewRegistry.get(constructor);
    if (registeredTag) {
      return registeredTag;
    }
    
    // Check prototype chain for registered parent classes
    let proto = Object.getPrototypeOf(value);
    while (proto && proto.constructor !== Object) {
      const parentTag = UcpView.viewRegistry.get(proto.constructor);
      if (parentTag) {
        return parentTag;
      }
      proto = Object.getPrototypeOf(proto);
    }
    
    // No registration found → default
    return UcpView.DEFAULT_TAG;
  }
  
  /**
   * Check if a value is an unresolved IOR (still loading)
   * 
   * @param value Value to check
   * @returns true if IOR and still resolving
   */
  static isLoading(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.startsWith('ior:')) return true;
    if (typeof value === 'object' && 'isResolving' in value) {
      return (value as { isResolving: boolean }).isResolving === true;
    }
    return false;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // STATIC: CSS Configuration
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * CSS path for this view - override in subclass
   * Example: '/dist/ts/layer5/views/css/ItemView.css'
   */
  static cssPath: string = '';
  
  /**
   * Base styles for drop indicator (P31: Universal Drop Support)
   * Subclasses should include this in their static styles
   */
  static dropStyles: CSSResultGroup = css`
    :host {
      position: relative;
    }
    
    :host(.drop-active) {
      outline: 2px dashed var(--color-primary, #1976d2);
      outline-offset: -2px;
      background-color: var(--color-drop-highlight, rgba(25, 118, 210, 0.08));
    }
    
    :host(.drop-active)::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: var(--color-drop-overlay, rgba(25, 118, 210, 0.04));
    }
  `;
  
  /** Model reference - Use Reference<T>, NOT | null */
  private modelRef: Reference<TModel> = null;
  
  /** Child views collection */
  protected childViews: UcpView<any>[] = [];
  
  /**
   * Disable drop handling for this view (P31: opt-out)
   * Set to "true" to disable file drops on this view
   */
  @property({ type: String, reflect: true })
  dropDisabled: string = 'false';
  
  /** Is a drag currently over this view? */
  private isDragOver = false;
  
  /**
   * Lit lifecycle: Called when element is added to DOM
   * Applies preloaded CSS from CSSLoader cache
   * Sets up drop handling (P31: Universal Drop Support)
   */
  connectedCallback(): void {
    console.log(`[UcpView] connectedCallback for ${this.constructor.name}`);
    try {
      super.connectedCallback();
      this.applyCachedStyles();
      this.dropHandlersSetup();
    } catch (e) {
      console.error(`[UcpView] Error in connectedCallback:`, e);
    }
  }
  
  /**
   * Lit lifecycle: Called when element is removed from DOM
   * Cleans up drop handlers
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.dropHandlersRemove();
  }
  
  /**
   * Setup drop event handlers (P31: Universal Drop Support)
   * Called in connectedCallback
   */
  private dropHandlersSetup(): void {
    // Initialize bound handlers if not already done
    if (!this.boundHandleDragEnter) {
      this.boundHandlersInit();
    }
    
    // Use bound methods to allow removal
    this.addEventListener('dragover', this.boundHandleDragOver);
    this.addEventListener('dragleave', this.boundHandleDragLeave);
    this.addEventListener('drop', this.boundHandleDrop);
    this.addEventListener('dragenter', this.boundHandleDragEnter);
  }
  
  /**
   * Remove drop event handlers
   * Called in disconnectedCallback
   */
  private dropHandlersRemove(): void {
    this.removeEventListener('dragover', this.boundHandleDragOver);
    this.removeEventListener('dragleave', this.boundHandleDragLeave);
    this.removeEventListener('drop', this.boundHandleDrop);
    this.removeEventListener('dragenter', this.boundHandleDragEnter);
  }
  
  /** Bound event handlers (P4a: No arrow functions) - initialized in boundHandlersInit() */
  private boundHandleDragEnter!: (event: DragEvent) => void;
  private boundHandleDragOver!: (event: DragEvent) => void;
  private boundHandleDragLeave!: (event: DragEvent) => void;
  private boundHandleDrop!: (event: DragEvent) => void;
  
  /**
   * Initialize bound handlers (called once per instance)
   * P4a: Use .bind(this) instead of arrow functions
   */
  private boundHandlersInit(): void {
    this.boundHandleDragEnter = this.handleDragEnter.bind(this);
    this.boundHandleDragOver = this.handleDragOver.bind(this);
    this.boundHandleDragLeave = this.handleDragLeave.bind(this);
    this.boundHandleDrop = this.handleDrop.bind(this);
  }
  
  /**
   * Handle dragenter event
   */
  private handleDragEnter(event: DragEvent): void {
    if (this.isDropDisabled) return;
    
    // Check if this is a file drag
    if (event.dataTransfer?.types.includes('Files')) {
      event.preventDefault();
      this.isDragOver = true;
      this.classList.add('drop-active');
    }
  }
  
  /**
   * Handle dragover event - must preventDefault to allow drop
   */
  private handleDragOver(event: DragEvent): void {
    if (this.isDropDisabled) return;
    
    // Check if this is a file drag
    if (event.dataTransfer?.types.includes('Files')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  }
  
  /**
   * Handle dragleave event
   */
  private handleDragLeave(event: DragEvent): void {
    if (this.isDropDisabled) return;
    
    // Only remove highlight if leaving to an element outside this view
    const relatedTarget = event.relatedTarget as Node | null;
    if (!this.contains(relatedTarget)) {
      this.isDragOver = false;
      this.classList.remove('drop-active');
    }
  }
  
  /**
   * Handle drop event - process dropped files
   */
  private handleDrop(event: DragEvent): void {
    if (this.isDropDisabled) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    this.isDragOver = false;
    this.classList.remove('drop-active');
    
    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;
    
    // Process each dropped file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.fileDropProcess(file);
    }
  }
  
  /**
   * Check if drop is disabled
   */
  private get isDropDisabled(): boolean {
    return this.dropDisabled === 'true';
  }
  
  /**
   * Process a dropped file
   * Dispatches 'file-drop' event for parent handling
   * @param file The dropped File object
   */
  protected fileDropProcess(file: File): void {
    const detail: FileDropDetail = {
      file,
      mimetype: file.type || 'application/octet-stream',
      filename: file.name,
      size: file.size,
      targetView: this
    };
    
    console.log(`[UcpView] File dropped: ${file.name} (${file.type})`);
    
    // Dispatch event for parent component/controller to handle
    this.dispatchEvent(new CustomEvent<FileDropDetail>('file-drop', {
      detail,
      bubbles: true,
      composed: true
    }));
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
      console.log(`[UcpView] ${this.constructor.name} has no cssPath defined`);
      return;  // No external CSS path defined for this view
    }
    
    const sheet = CSSLoader.get(cssPath);
    
    if (!sheet) {
      console.warn(`[UcpView] ❌ CSS not found in cache for: ${cssPath}. Available keys:`, CSSLoader.cachedPaths);
      return;
    }
    
    if (sheet && this.shadowRoot) {
      // APPEND to existing styles (don't replace Lit's static styles!)
      const existingStyles = [...this.shadowRoot.adoptedStyleSheets];
      if (!existingStyles.includes(sheet)) {
        this.shadowRoot.adoptedStyleSheets = [...existingStyles, sheet];
        console.log(`[UcpView] ✅ Applied CSS: ${cssPath} to ${this.constructor.name}`);
        console.log(`[UcpView] 📋 Shadow root has ${this.shadowRoot.adoptedStyleSheets.length} stylesheets after apply`);
        // Debug: Log first 200 chars of the CSS
        const cssText = sheet.cssRules?.length > 0 ? sheet.cssRules[0].cssText.substring(0, 200) : 'no rules';
        console.log(`[UcpView] 📄 CSS content preview: ${cssText}`);
      }
    } else {
      console.warn(`[UcpView] ⚠️ Cannot apply CSS - sheet:`, !!sheet, `shadowRoot:`, !!this.shadowRoot);
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

