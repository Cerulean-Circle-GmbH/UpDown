/**
 * FileItemView.ts - Compact File Display for FolderOverView
 * 
 * Displays a file as a list item with 3-zone interaction:
 * - LEFT: Drag handle (draggable)
 * - MIDDLE: Tap to select
 * - RIGHT: Navigate "›" (only if has children - files don't)
 * 
 * Web4 Principles:
 * - P4: Radical OOP - View IS a UcpView component
 * - P27: Web Components ARE Radical OOP
 * - P30: Works with Tree interface
 * - P31: Universal Drop Support (via UcpView base)
 * - P33: Separation of Concerns (external CSS)
 * 
 * @ior ior:esm:/ONCE/{version}/FileItemView
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UcpView } from './LitUcpView.js';
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
export class FileItemView extends UcpView<FileModel> {
  
  /** CSS path for external styles (P33: Separation of Concerns) */
  static cssPath = 'FileItemView.css';
  
  /** Is this item selected? */
  @property({ type: Boolean, reflect: true })
  selected = false;
  
  render(): TemplateResult {
    if (!this.hasModel) {
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
    if (!this.hasModel) return; // Guard against uninitialized state
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
    if (!this.hasModel) return; // Guard against uninitialized state
    
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



















