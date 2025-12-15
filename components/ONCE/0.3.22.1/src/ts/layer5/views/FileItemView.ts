/**
 * FileItemView.ts - Compact File Display for FolderOverView
 * 
 * Displays a file as a list item with 3-zone interaction:
 * - LEFT: Drag handle (draggable)
 * - MIDDLE: Tap to select
 * - RIGHT: Navigate "›" (only if has children - files don't)
 * 
 * Web4 Principles:
 * - P4: Radical OOP - View IS a LitElement component
 * - P27: Web Components ARE Radical OOP
 * - P30: Works with Tree interface
 * - P31: Universal Drop Support (inherits from base)
 * 
 * @ior ior:esm:/ONCE/{version}/FileItemView
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { FileModel } from '../../layer3/FileModel.interface.js';
import { Reference } from '../../layer3/Reference.interface.js';

/**
 * Mimetype to icon mapping
 */
const MIMETYPE_ICONS: Record<string, string> = {
  'image/': '🖼️',
  'video/': '🎬',
  'audio/': '🎵',
  'text/': '📝',
  'application/pdf': '📕',
  'application/json': '📋',
  'application/javascript': '⚙️',
  'application/typescript': '⚙️',
  'default': '📄'
};

/**
 * FileItemView - Compact file display for list navigation
 * 
 * 3-Zone Interaction:
 * ┌──────────────────────────────────────────────────────────┐
 * │ [DRAG]  │         [SELECT]            │  (no navigate) │
 * │  icon   │      name + details         │                │
 * │ (left)  │        (middle)             │                │
 * └──────────────────────────────────────────────────────────┘
 * 
 * Events:
 * - 'item-select': Fired when middle zone is tapped
 * - 'item-drag-start': Fired when drag begins
 */
@customElement('file-item-view')
export class FileItemView extends LitElement {
  
  static styles = css`
    :host {
      display: block;
      --item-height: 56px;
      --icon-size: 40px;
      --border-radius: 8px;
    }
    
    .file-item {
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
    
    .file-item:hover {
      background: var(--color-surface-hover, #f5f5f5);
    }
    
    .file-item.selected {
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
    
    .spacer {
      width: 24px;
      flex-shrink: 0;
    }
  `;
  
  /** File model data */
  @property({ type: Object })
  model: Reference<FileModel> = null;
  
  /** Is this item selected? */
  @property({ type: Boolean, reflect: true })
  selected = false;
  
  render(): TemplateResult {
    if (!this.model) {
      return html`<div class="file-item">Loading...</div>`;
    }
    
    return html`
      <div class="file-item ${this.selected ? 'selected' : ''}">
        <span 
          class="drag-handle" 
          draggable="true"
          @dragstart=${this.handleDragStart}
        >${this.mimetypeIcon}</span>
        <span class="content" @click=${this.handleSelect}>
          <span class="name">${this.model.filename || this.model.name}</span>
          <span class="details">${this.formattedSize} · ${this.formattedDate}</span>
        </span>
        <span class="spacer"></span>
      </div>
    `;
  }
  
  /**
   * Get icon for mimetype
   */
  get mimetypeIcon(): string {
    if (!this.model?.mimetype) return MIMETYPE_ICONS['default'];
    
    // Check for exact match first
    if (MIMETYPE_ICONS[this.model.mimetype]) {
      return MIMETYPE_ICONS[this.model.mimetype];
    }
    
    // Check for type prefix match (e.g., "image/")
    const type = this.model.mimetype.split('/')[0] + '/';
    return MIMETYPE_ICONS[type] || MIMETYPE_ICONS['default'];
  }
  
  /**
   * Format file size for display
   */
  get formattedSize(): string {
    const size = this.model?.size || 0;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  
  /**
   * Format modification date for display
   */
  get formattedDate(): string {
    if (!this.model?.modifiedAt) return '';
    const date = new Date(this.model.modifiedAt);
    return date.toLocaleDateString();
  }
  
  /**
   * Handle tap on middle content zone (select)
   */
  private handleSelect(): void {
    this.dispatchEvent(new CustomEvent('item-select', {
      detail: { model: this.model },
      bubbles: true,
      composed: true
    }));
  }
  
  /**
   * Handle drag start from left icon
   */
  private handleDragStart(event: DragEvent): void {
    if (!this.model) return;
    
    // Set drag data
    event.dataTransfer?.setData('application/json', JSON.stringify({
      type: 'file',
      uuid: this.model.uuid,
      name: this.model.name
    }));
    event.dataTransfer!.effectAllowed = 'move';
    
    this.dispatchEvent(new CustomEvent('item-drag-start', {
      detail: { model: this.model, event },
      bubbles: true,
      composed: true
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'file-item-view': FileItemView;
  }
}


