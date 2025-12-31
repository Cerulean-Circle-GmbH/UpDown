/**
 * IORLoadingView.ts - Loading State for Unresolved IOR References
 * 
 * Displays a loading indicator while an IOR is resolving in the background.
 * This is part of the ISR (IOR Self-Replacement) pattern in Option C.
 * 
 * When UcpModel.get() encounters an IOR string:
 * 1. Creates IOR object (which has this view registered)
 * 2. View renders loading state
 * 3. IOR resolves in background
 * 4. IOR self-replaces → view re-renders with resolved component
 * 
 * Web4 Principles:
 * - P4: Radical OOP - View IS a UcpView component
 * - P7: Layer 5 is SYNCHRONOUS (no async/await here)
 * - P27: Web Components ARE Radical OOP
 * - P33: Separation of Concerns — styles in external CSS ONLY
 * - P34: IOR as Unified Entry Point
 * 
 * @ior ior:esm:/ONCE/{version}/IORLoadingView
 * @pdca 2025-12-30-UTC-1200.lazy-reference-kernel-isr.pdca.md
 */

import { html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UcpView } from './UcpView.js';

/**
 * IOR Model for display purposes
 * Minimal interface to avoid importing IOR from layer4
 */
interface IORDisplayModel {
  /** The original IOR string */
  ior?: string;
  /** UUID extracted from IOR */
  uuid?: string;
  /** Is the IOR currently resolving? */
  isResolving?: boolean;
}

/**
 * IORLoadingView - Shows loading spinner while IOR resolves
 * 
 * Usage:
 * ```html
 * <ior-loading-view .model=${iorObject}></ior-loading-view>
 * ```
 * 
 * The IOR self-replaces in the model when resolved, causing parent
 * to re-render with the appropriate file/folder view.
 */
@customElement('ior-loading-view')
export class IORLoadingView extends UcpView<IORDisplayModel> {
  
  /** 
   * CSS path for external styles (P33: Separation of Concerns)
   * Styles are in IORLoadingView.css — NO inline styles here!
   */
  static cssPath = 'IORLoadingView.css';
  
  /**
   * Optional display name for better UX
   */
  @property({ type: String })
  displayName: string = '';
  
  render(): TemplateResult {
    const uuid = this.extractUuid();
    const name = this.displayName || 'Loading...';
    
    return html`
      <div class="loading-item">
        <span class="spinner"></span>
        <span class="loading-text">${name}</span>
        ${uuid ? html`<span class="loading-uuid">${uuid}</span>` : ''}
      </div>
    `;
  }
  
  /**
   * Extract UUID from IOR model for display
   */
  private extractUuid(): string {
    if (!this.hasModel) return '';
    
    // Try to get uuid from model
    if (this.model.uuid) {
      // Show last segment of UUID for brevity
      const parts = this.model.uuid.split('/');
      return parts[parts.length - 1] || this.model.uuid;
    }
    
    // Try to extract from IOR string
    if (this.model.ior) {
      // IOR format: ior:protocol://host/path/uuid
      const parts = this.model.ior.split('/');
      return parts[parts.length - 1] || '';
    }
    
    return '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ior-loading-view': IORLoadingView;
  }
}

