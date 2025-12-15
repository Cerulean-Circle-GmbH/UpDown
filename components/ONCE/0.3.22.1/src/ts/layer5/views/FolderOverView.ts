/**
 * FolderOverView.ts - Animated Folder Browser
 * 
 * Mobile-optimized folder navigation with:
 * - Breadcrumb navigation (via Container.pathFromRoot())
 * - Animated panel transitions
 * - Swipe gestures for folder navigation
 * - Portrait screen optimized
 * 
 * Web4 Principles:
 * - P4: Radical OOP - View IS a LitElement component
 * - P27: Web Components ARE Radical OOP
 * - P30: Works with Container interface (Tree with navigation)
 * - P31: Universal Drop Support
 * 
 * @ior ior:esm:/ONCE/{version}/FolderOverView
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { LitElement, html, css, TemplateResult, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { FolderModel, FolderChildReference } from '../../layer3/FolderModel.interface.js';
import { Container } from '../../layer3/Container.interface.js';
import { Reference } from '../../layer3/Reference.interface.js';
import './FileItemView.js';
import './FolderItemView.js';

/**
 * NavigationDirection - Animation direction
 */
type NavigationDirection = 'forward' | 'back' | 'none';

/**
 * FolderOverView - Animated folder browser with breadcrumb
 * 
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │  📁 Home / Documents / Projects         │  ← Breadcrumb
 * ├─────────────────────────────────────────┤
 * │  ┌─────────────────────────────────┐    │
 * │  │ 📁 Folder 1           ›         │    │  ← FolderItemView
 * │  └─────────────────────────────────┘    │
 * │  ┌─────────────────────────────────┐    │
 * │  │ 📄 File.txt                     │    │  ← FileItemView
 * │  └─────────────────────────────────┘    │
 * └─────────────────────────────────────────┘
 * 
 * Gestures:
 * - Swipe left: Navigate into folder (forward)
 * - Swipe right: Navigate to parent (back)
 * - Tap breadcrumb: Jump to ancestor folder
 */
@customElement('folder-over-view')
export class FolderOverView extends LitElement {
  
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--color-background, #fafafa);
      overflow: hidden;
    }
    
    /* Breadcrumb */
    .breadcrumb {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: var(--color-surface, #ffffff);
      border-bottom: 1px solid var(--color-border, #e0e0e0);
      overflow-x: auto;
      white-space: nowrap;
      flex-shrink: 0;
    }
    
    .breadcrumb-item {
      display: inline-flex;
      align-items: center;
      font-size: 14px;
      color: var(--color-text-secondary, #757575);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.15s ease, color 0.15s ease;
    }
    
    .breadcrumb-item:hover {
      background: var(--color-surface-hover, #f5f5f5);
      color: var(--color-primary, #1976d2);
    }
    
    .breadcrumb-item.current {
      color: var(--color-text-primary, #212121);
      font-weight: 500;
      cursor: default;
    }
    
    .breadcrumb-item.current:hover {
      background: transparent;
      color: var(--color-text-primary, #212121);
    }
    
    .breadcrumb-separator {
      margin: 0 4px;
      color: var(--color-text-disabled, #bdbdbd);
    }
    
    .breadcrumb-icon {
      margin-right: 4px;
    }
    
    /* Panel container */
    .panel-container {
      flex: 1;
      position: relative;
      overflow: hidden;
      touch-action: pan-y;
    }
    
    .panel {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 8px 16px;
      overflow-y: auto;
      transition: transform 0.3s ease-out;
    }
    
    .panel.entering-forward {
      transform: translateX(100%);
    }
    
    .panel.entering-back {
      transform: translateX(-100%);
    }
    
    .panel.leaving-forward {
      transform: translateX(-100%);
    }
    
    .panel.leaving-back {
      transform: translateX(100%);
    }
    
    .panel.active {
      transform: translateX(0);
    }
    
    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--color-text-secondary, #757575);
    }
    
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .empty-text {
      font-size: 14px;
    }
  `;
  
  /** Current folder model */
  @property({ type: Object })
  model: Reference<FolderModel> = null;
  
  /** Container reference (if using Tree/Container pattern) */
  @property({ type: Object })
  container: Reference<Container<unknown>> = null;
  
  /** Breadcrumb path (computed from Container.pathFromRoot or manual) */
  @state()
  private breadcrumbPath: { name: string; uuid: string }[] = [];
  
  /** Animation direction for panel transitions */
  @state()
  private animationDirection: NavigationDirection = 'none';
  
  /** Is animating? */
  @state()
  private isAnimating = false;
  
  /** Touch tracking for swipe gestures */
  private touchStartX = 0;
  private touchStartY = 0;
  
  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
  }
  
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }
  
  updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('model') || changedProperties.has('container')) {
      this.breadcrumbUpdate();
    }
  }
  
  render(): TemplateResult {
    return html`
      <nav class="breadcrumb">
        ${this.renderBreadcrumb()}
      </nav>
      
      <div class="panel-container">
        <div class="panel ${this.getPanelClass()}">
          ${this.renderChildren()}
        </div>
      </div>
    `;
  }
  
  /**
   * Render breadcrumb navigation - P4a: No arrow functions
   */
  private renderBreadcrumb(): TemplateResult {
    if (this.breadcrumbPath.length === 0) {
      return html`
        <span class="breadcrumb-item current">
          <span class="breadcrumb-icon">📁</span>
          Root
        </span>
      `;
    }
    
    // P4a: Build template parts using for...of instead of map with arrow
    const parts: TemplateResult[] = [];
    for (let index = 0; index < this.breadcrumbPath.length; index++) {
      const item = this.breadcrumbPath[index];
      const isLast = index === this.breadcrumbPath.length - 1;
      parts.push(this.renderBreadcrumbItem(item, index, isLast));
    }
    
    return html`${parts}`;
  }
  
  /**
   * Render a single breadcrumb item - P4a: Separate method for click handler
   */
  private renderBreadcrumbItem(
    item: { name: string; uuid: string }, 
    index: number, 
    isLast: boolean
  ): TemplateResult {
    return html`
      ${index > 0 ? html`<span class="breadcrumb-separator">/</span>` : ''}
      <span 
        class="breadcrumb-item ${isLast ? 'current' : ''}"
        data-uuid="${item.uuid}"
        data-index="${index}"
        @click=${isLast ? undefined : this.handleBreadcrumbClick}
      >
        ${index === 0 ? html`<span class="breadcrumb-icon">📁</span>` : ''}
        ${item.name}
      </span>
    `;
  }
  
  /**
   * Handle breadcrumb click - P4a: Method reference instead of arrow
   */
  private handleBreadcrumbClick(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    const uuid = target.dataset.uuid || '';
    const index = parseInt(target.dataset.index || '0', 10);
    this.breadcrumbNavigate(uuid, index);
  }
  
  /**
   * Render folder children (files and folders) - P4a: No arrow functions
   */
  private renderChildren(): TemplateResult {
    if (!this.model?.children || this.model.children.length === 0) {
      return html`
        <div class="empty-state">
          <span class="empty-icon">📂</span>
          <span class="empty-text">This folder is empty</span>
        </div>
      `;
    }
    
    // P4a: Use function comparator instead of arrow
    function compareChildren(a: FolderChildReference, b: FolderChildReference): number {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    }
    
    // Sort: folders first, then files
    const sorted = [...this.model.children].sort(compareChildren);
    
    // P4a: Build template parts using for...of instead of map with arrow
    const parts: TemplateResult[] = [];
    for (const child of sorted) {
      parts.push(this.renderChildItem(child));
    }
    
    return html`${parts}`;
  }
  
  /**
   * Render a single child item (file or folder) - P4a: Separate method
   */
  private renderChildItem(child: FolderChildReference): TemplateResult {
    if (child.isFolder) {
      return html`
        <folder-item-view
          .childRef=${child}
          @item-select=${this.handleItemSelect}
          @item-navigate=${this.handleItemNavigate}
        ></folder-item-view>
      `;
    }
    return html`
      <file-item-view
        .model=${{ 
          ...child, 
          filename: child.name, 
          path: '', 
          createdAt: 0, 
          modifiedAt: 0, 
          isLink: false, 
          linkTarget: null, 
          contentHash: null 
        }}
        @item-select=${this.handleItemSelect}
      ></file-item-view>
    `;
  }
  
  /**
   * Get CSS class for panel animation
   */
  private getPanelClass(): string {
    if (!this.isAnimating) return 'active';
    
    // During animation, apply the entering class
    return this.animationDirection === 'forward' 
      ? 'entering-forward active'
      : 'entering-back active';
  }
  
  /**
   * Update breadcrumb path
   */
  private breadcrumbUpdate(): void {
    // Try to use Container.pathFromRoot() if available
    if (this.container && 'pathFromRoot' in this.container) {
      const path = (this.container as Container<unknown>).pathFromRoot();
      // P4a: Use for...of instead of map with arrow
      const breadcrumbs: { name: string; uuid: string }[] = [];
      for (const node of path) {
        breadcrumbs.push({
          name: (node as any).displayName || (node as any).model?.name || 'Folder',
          uuid: (node as any).uuid || (node as any).model?.uuid || ''
        });
      }
      this.breadcrumbPath = breadcrumbs;
      return;
    }
    
    // Fallback: just show current folder
    if (this.model) {
      this.breadcrumbPath = [{
        name: this.model.name || this.model.folderName || 'Root',
        uuid: this.model.uuid
      }];
    } else {
      this.breadcrumbPath = [];
    }
  }
  
  /**
   * Navigate via breadcrumb click
   */
  private breadcrumbNavigate(uuid: string, index: number): void {
    // Navigate back to ancestor
    this.animationDirection = 'back';
    this.isAnimating = true;
    
    this.dispatchEvent(new CustomEvent('folder-navigate', {
      detail: { uuid, index, direction: 'back' },
      bubbles: true,
      composed: true
    }));
    
    // Reset animation after transition - P4a: Use bound method
    setTimeout(this.animationReset.bind(this), 300);
  }
  
  /**
   * Reset animation state - P4a: Method for setTimeout callback
   */
  private animationReset(): void {
    this.isAnimating = false;
  }
  
  /**
   * Handle item select (from FileItemView or FolderItemView)
   */
  private handleItemSelect(event: CustomEvent): void {
    this.dispatchEvent(new CustomEvent('item-select', {
      detail: event.detail,
      bubbles: true,
      composed: true
    }));
  }
  
  /**
   * Handle item navigate (open folder)
   */
  private handleItemNavigate(event: CustomEvent): void {
    this.animationDirection = 'forward';
    this.isAnimating = true;
    
    this.dispatchEvent(new CustomEvent('folder-navigate', {
      detail: { ...event.detail, direction: 'forward' },
      bubbles: true,
      composed: true
    }));
    
    // Reset animation after transition - P4a: Use bound method
    setTimeout(this.animationReset.bind(this), 300);
  }
  
  /**
   * Handle touch start for swipe detection
   */
  private handleTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }
  
  /**
   * Handle touch end for swipe detection
   */
  private handleTouchEnd(event: TouchEvent): void {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    
    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;
    
    // Minimum swipe distance (50px) and mostly horizontal
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 2) {
      if (deltaX > 0) {
        // Swipe right → go back
        this.swipeBack();
      } else {
        // Swipe left → go forward (if item selected)
        // Forward requires an item to be selected first
      }
    }
  }
  
  /**
   * Handle swipe back gesture (navigate to parent)
   */
  private swipeBack(): void {
    if (this.breadcrumbPath.length > 1) {
      const parentIndex = this.breadcrumbPath.length - 2;
      const parent = this.breadcrumbPath[parentIndex];
      this.breadcrumbNavigate(parent.uuid, parentIndex);
    }
  }
  
  /**
   * Public: Navigate to a specific folder
   */
  navigateTo(folderModel: FolderModel, direction: NavigationDirection = 'forward'): void {
    this.animationDirection = direction;
    this.isAnimating = true;
    this.model = folderModel;
    
    // P4a: Use bound method instead of arrow
    setTimeout(this.animationReset.bind(this), 300);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'folder-over-view': FolderOverView;
  }
}


