/**
 * WebSocketItemView.ts - Compact WebSocket status indicator
 * 
 * Small inline indicator for lists and toolbars.
 * State changes via UcpModel trigger automatic re-renders.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P16: TypeScript accessors
 * 
 * @layer5
 * @pdca 2025-12-12-UTC-2300.i13-websocket-component.pdca.md
 */

import { html, css, TemplateResult, CSSResultGroup } from 'lit';
import { customElement } from 'lit/decorators.js';
import { UcpView } from './UcpView.js';
import { WebSocketModel, WebSocketState } from '../../layer3/WebSocketModel.interface.js';

/**
 * WebSocketItemView - Compact status indicator for lists
 */
@customElement('web-socket-item-view')
export class WebSocketItemView extends UcpView<WebSocketModel> {
  
  static styles: CSSResultGroup = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .indicator.connected { background: #4caf50; }
    .indicator.connecting { 
      background: #ff9800; 
      animation: blink 1s infinite;
    }
    .indicator.disconnected { background: #f44336; }
    
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    
    .label {
      font-size: 0.85rem;
      color: var(--color-text-secondary, #888);
    }
  `;
  
  /**
   * Render compact status indicator
   */
  render(): TemplateResult {
    return html`
      <span class="indicator ${this.statusClass}"></span>
      <span class="label">${this.statusLabel}</span>
    `;
  }
  
  /**
   * Get CSS class for indicator
   */
  get statusClass(): string {
    if (!this.model) return 'disconnected';
    
    switch (this.model.state) {
      case WebSocketState.OPEN: return 'connected';
      case WebSocketState.CONNECTING: return 'connecting';
      default: return 'disconnected';
    }
  }
  
  /**
   * Get compact label for status
   */
  get statusLabel(): string {
    if (!this.model) return 'WS ✗';
    
    switch (this.model.state) {
      case WebSocketState.OPEN: return 'WS';
      case WebSocketState.CONNECTING: return 'WS...';
      default: return 'WS ✗';
    }
  }
}



















