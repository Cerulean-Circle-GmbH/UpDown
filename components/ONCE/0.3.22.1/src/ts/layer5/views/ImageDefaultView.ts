/**
 * ImageDefaultView.ts - Default View for Image Component
 * 
 * Displays an image with optional caption and loading state.
 * 
 * Web4 Principles:
 * - P4: Radical OOP - View IS a LitElement component
 * - P27: Web Components ARE Radical OOP
 * - P31: Universal Drop Support (inherits from UcpView)
 * 
 * @ior ior:esm:/ONCE/{version}/ImageDefaultView
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UcpView } from './UcpView.js';
import { ImageModel } from '../../layer3/ImageModel.interface.js';
import { Reference } from '../../layer3/Reference.interface.js';

/**
 * ImageDefaultView - Displays an image with metadata
 * 
 * Features:
 * - Responsive image display
 * - Loading spinner
 * - Alt text for accessibility
 * - Optional caption
 * - Error state handling
 */
@customElement('image-default-view')
export class ImageDefaultView extends UcpView<ImageModel> {
  
  static styles = [
    UcpView.dropStyles,
    css`
      :host {
        display: block;
        --image-border-radius: 8px;
        --image-max-width: 100%;
        --caption-font-size: 12px;
      }
      
      .image-container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: var(--color-surface, #ffffff);
        border-radius: var(--image-border-radius);
        overflow: hidden;
      }
      
      .image-wrapper {
        position: relative;
        max-width: var(--image-max-width);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      img {
        max-width: 100%;
        height: auto;
        display: block;
        border-radius: var(--image-border-radius);
        transition: opacity 0.3s ease;
      }
      
      img.loading {
        opacity: 0;
      }
      
      .loading-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border: 3px solid var(--color-border, #e0e0e0);
        border-top-color: var(--color-primary, #1976d2);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
      
      .caption {
        padding: 8px 12px;
        font-size: var(--caption-font-size);
        color: var(--color-text-secondary, #757575);
        text-align: center;
        width: 100%;
        box-sizing: border-box;
      }
      
      .metadata {
        padding: 4px 12px 8px;
        font-size: 10px;
        color: var(--color-text-disabled, #bdbdbd);
        text-align: center;
      }
      
      .error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        color: var(--color-error, #d32f2f);
      }
      
      .error-icon {
        font-size: 48px;
        margin-bottom: 8px;
      }
    `
  ];
  
  /** Image model reference */
  @property({ type: Object })
  imageModel: Reference<ImageModel> = null;
  
  /** Is image loading? */
  @state()
  private isLoading = true;
  
  /** Did image fail to load? */
  @state()
  private hasError = false;
  
  render(): TemplateResult {
    const m = this.imageModel || (this.hasModel ? this.model : null);
    
    if (!m) {
      return html`
        <div class="image-container">
          <div class="loading-spinner"></div>
        </div>
      `;
    }
    
    if (this.hasError) {
      return html`
        <div class="image-container">
          <div class="error">
            <span class="error-icon">🖼️</span>
            <span>Failed to load image</span>
          </div>
        </div>
      `;
    }
    
    return html`
      <div class="image-container">
        <div class="image-wrapper">
          ${this.isLoading ? html`<div class="loading-spinner"></div>` : ''}
          <img
            src=${m.objectUrl || ''}
            alt=${m.alt || m.name}
            class=${this.isLoading ? 'loading' : ''}
            @load=${this.handleImageLoad}
            @error=${this.handleImageError}
          />
        </div>
        ${m.caption ? html`<div class="caption">${m.caption}</div>` : ''}
        ${this.shouldShowMetadata ? html`
          <div class="metadata">
            ${m.width}×${m.height} · ${m.mimetype}
          </div>
        ` : ''}
      </div>
    `;
  }
  
  /**
   * Should we show metadata (dimensions, mimetype)?
   */
  private get shouldShowMetadata(): boolean {
    const m = this.imageModel || (this.hasModel ? this.model : null);
    return m !== null && m.width > 0 && m.height > 0;
  }
  
  /**
   * Handle image load complete
   */
  private handleImageLoad(): void {
    this.isLoading = false;
  }
  
  /**
   * Handle image load error
   */
  private handleImageError(): void {
    this.isLoading = false;
    this.hasError = true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'image-default-view': ImageDefaultView;
  }
}
















