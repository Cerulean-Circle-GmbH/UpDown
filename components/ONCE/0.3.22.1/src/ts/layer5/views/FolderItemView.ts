/**
 * FolderItemView.ts - Compact Folder Display for FolderOverView
 * 
 * Displays a folder as a list item with 3-zone interaction:
 * - LEFT: Drag handle (draggable)
 * - MIDDLE: Tap to select
 * - RIGHT: Navigate "›" (if has children)
 * 
 * Web4 Principles:
 * - P4: Radical OOP - View IS a LitElement component
 * - P27: Web Components ARE Radical OOP
 * - P30: Works with Tree interface - shows "›" if hasChildren
 * - P31: Universal Drop Support (inherits from base)
 * 
 * @ior ior:esm:/ONCE/{version}/FolderItemView
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FolderModel, FolderChildReference } from '../../layer3/FolderModel.interface.js';
import { Reference } from '../../layer3/Reference.interface.js';

/**
 * FolderItemView - Compact folder display for list navigation
 * 
 * 3-Zone Interaction:
 * ┌──────────────────────────────────────────────────────────┐
 * │ [DRAG]  │         [SELECT]            │  [NAVIGATE]      │
 * │  📁    │      name + count           │      ›           │
 * │ (left)  │        (middle)             │   (right)        │
 * └──────────────────────────────────────────────────────────┘
 * 
 * Events:
 * - 'item-select': Fired when middle zone is tapped
 * - 'item-navigate': Fired when right "›" is tapped (opens folder)
 * - 'item-drag-start': Fired when drag begins
 */
@customElement('folder-item-view')
export class FolderItemView extends LitElement {
  
  static styles = css`
    :host {
      display: block;
      --item-height: 56px;
      --icon-size: 40px;
      --border-radius: 8px;
    }
    
    .folder-item {
      display: flex;
      align-items: center;
      height: var(--item-height);
      padding: 0 12px;
      background: var(--color-surface, #ffffff);
      border-radius: var(--border-radius);
      margin-bottom: 4px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    
    .folder-item:hover {
      background: var(--color-surface-hover, #f5f5f5);
    }
    
    .folder-item.selected {
      background: var(--color-primary-light, #e3f2fd);
    }
    
    .drag-handle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--icon-size);
      height: var(--icon-size);
      font-size: 24px;
      cursor: grab;
      user-select: none;
      flex-shrink: 0;
    }
    
    .drag-handle:active {
      cursor: grabbing;
    }
    
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 12px;
      min-width: 0; /* Enable text truncation */
    }
    
    .name {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-primary, #212121);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .details {
      font-size: 12px;
      color: var(--color-text-secondary, #757575);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .navigate {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: var(--item-height);
      font-size: 20px;
      color: var(--color-text-secondary, #757575);
      flex-shrink: 0;
      cursor: pointer;
      transition: color 0.15s ease;
    }
    
    .navigate:hover {
      color: var(--color-primary, #1976d2);
    }
    
    .spacer {
      width: 32px;
      flex-shrink: 0;
    }
  `;
  
  /** Folder model data */
  @property({ type: Object })
  model: Reference<FolderModel> = null;
  
  /** Or use lightweight reference (from parent listing) */
  @property({ type: Object })
  childRef: Reference<FolderChildReference> = null;
  
  /** Is this item selected? */
  @property({ type: Boolean, reflect: true })
  selected = false;
  
  render(): TemplateResult {
    const displayData = this.getDisplayData();
    if (!displayData) {
      return html`<div class="folder-item">Loading...</div>`;
    }
    
    return html`
      <div class="folder-item ${this.selected ? 'selected' : ''}">
        <span 
          class="drag-handle" 
          draggable="true"
          @dragstart=${this.handleDragStart}
        >📁</span>
        <span class="content" @click=${this.handleSelect}>
          <span class="name">${displayData.name}</span>
          <span class="details">${displayData.itemCount} items</span>
        </span>
        ${displayData.hasChildren 
          ? html`<span class="navigate" @click=${this.handleNavigate}>›</span>`
          : html`<span class="spacer"></span>`
        }
      </div>
    `;
  }
  
  /**
   * Get display data from model or childRef
   */
  private getDisplayData(): { name: string; itemCount: number; hasChildren: boolean; uuid: string } | null {
    if (this.model) {
      return {
        name: this.model.folderName || this.model.name,
        itemCount: this.model.children?.length || 0,
        hasChildren: (this.model.children?.length || 0) > 0,
        uuid: this.model.uuid
      };
    }
    
    if (this.childRef) {
      return {
        name: this.childRef.name,
        itemCount: this.childRef.hasChildren ? 1 : 0, // Approximate
        hasChildren: this.childRef.hasChildren,
        uuid: this.childRef.uuid
      };
    }
    
    return null;
  }
  
  /**
   * Handle tap on middle content zone (select)
   */
  private handleSelect(): void {
    const data = this.getDisplayData();
    this.dispatchEvent(new CustomEvent('item-select', {
      detail: { model: this.model, childRef: this.childRef, uuid: data?.uuid },
      bubbles: true,
      composed: true
    }));
  }
  
  /**
   * Handle tap on right "›" zone (navigate into folder)
   */
  private handleNavigate(event: Event): void {
    event.stopPropagation(); // Don't trigger select
    
    const data = this.getDisplayData();
    this.dispatchEvent(new CustomEvent('item-navigate', {
      detail: { model: this.model, childRef: this.childRef, uuid: data?.uuid },
      bubbles: true,
      composed: true
    }));
  }
  
  /**
   * Handle drag start from left icon
   */
  private handleDragStart(event: DragEvent): void {
    const data = this.getDisplayData();
    if (!data) return;
    
    // Set drag data
    event.dataTransfer?.setData('application/json', JSON.stringify({
      type: 'folder',
      uuid: data.uuid,
      name: data.name
    }));
    event.dataTransfer!.effectAllowed = 'move';
    
    this.dispatchEvent(new CustomEvent('item-drag-start', {
      detail: { model: this.model, childRef: this.childRef, event },
      bubbles: true,
      composed: true
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'folder-item-view': FolderItemView;
  }
}
