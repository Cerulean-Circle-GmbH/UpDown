/**
 * WebSocketDefaultView.ts - Real-time WebSocket status display
 * 
 * Replaces the static 🔌 section in OncePeerDefaultView.
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
 * WebSocketDefaultView - Real-time WebSocket status display
 * 
 * Replaces the static 🔌 section in OncePeerDefaultView
 * State changes via UcpModel trigger automatic re-renders
 */
@customElement('web-socket-default-view')
export class WebSocketDefaultView extends UcpView<WebSocketModel> {
  
  static styles: CSSResultGroup = css`
    :host {
      display: block;
      padding: 1rem;
      /* Inherit theme from parent - transparent allows parent background to show */
      background: var(--color-surface, transparent);
      border-radius: 8px;
      border: 1px solid var(--color-border, rgba(255,255,255,0.1));
    }
    
    .header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .header h3 {
      margin: 0;
      font-size: 1.1rem;
    }
    
    .status-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    
    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    .status-indicator.connected {
      background: #4caf50;
      box-shadow: 0 0 8px #4caf50;
    }
    
    .status-indicator.connecting {
      background: #ff9800;
      box-shadow: 0 0 8px #ff9800;
      animation: blink 1s infinite;
    }
    
    .status-indicator.disconnected {
      background: #f44336;
      box-shadow: 0 0 8px #f44336;
      animation: none;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    
    .endpoint {
      font-family: monospace;
      background: rgba(255,255,255,0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    
    .info-row {
      color: var(--color-text-secondary, #888);
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
    
    .error-message {
      color: #f44336;
      margin-top: 0.5rem;
    }
    
    .reconnect-info {
      color: #ff9800;
      margin-top: 0.5rem;
    }
    
    p {
      margin: 0.5rem 0;
    }
  `;
  
  /**
   * Render the WebSocket status view
   */
  render(): TemplateResult {
    const model = this.model;
    
    // Handle null model (before init)
    if (!model) {
      return html`<div class="header">
        <span class="emoji">🔌</span>
        <h3>WebSocket Connection</h3>
      </div>
      <p>Loading...</p>`;
    }
    
    return html`
      <div class="header">
        <span class="emoji">🔌</span>
        <h3>WebSocket Connection</h3>
      </div>
      
      <div class="status-row">
        <span class="status-indicator ${this.statusClass}"></span>
        <span class="status-text">${this.statusText}</span>
      </div>
      
      <p><strong>Endpoint:</strong> <code class="endpoint">${model.url}</code></p>
      
      ${this.renderReconnectInfo(model)}
      ${this.renderError(model)}
      ${this.renderConnectionTime(model)}
      ${this.renderLastMessage(model)}
    `;
  }
  
  /**
   * Render reconnection info if reconnecting
   */
  private renderReconnectInfo(model: WebSocketModel): TemplateResult | string {
    if (model.state === WebSocketState.DISCONNECTED && model.reconnectAttempts > 0) {
      return html`<p class="reconnect-info">
        🔄 Reconnecting... (${model.reconnectAttempts}/${model.maxReconnectAttempts})
      </p>`;
    }
    return '';
  }
  
  /**
   * Render error message if present
   */
  private renderError(model: WebSocketModel): TemplateResult | string {
    if (model.lastError) {
      return html`<p class="error-message">❌ ${model.lastError}</p>`;
    }
    return '';
  }
  
  /**
   * Render connection time if connected
   */
  private renderConnectionTime(model: WebSocketModel): TemplateResult | string {
    if (model.connectedAt) {
      return html`<p class="info-row">
        🕐 Connected since: ${model.connectedAt.toLocaleTimeString()}
      </p>`;
    }
    return '';
  }
  
  /**
   * Render last message time if available
   */
  private renderLastMessage(model: WebSocketModel): TemplateResult | string {
    if (model.lastMessageTime) {
      return html`<p class="info-row">
        📨 Last message: ${model.lastMessageTime.toLocaleTimeString()}
      </p>`;
    }
    return '';
  }
  
  /**
   * Get CSS class for status indicator
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
   * Get display text for status
   */
  get statusText(): string {
    if (!this.model) return '🔴 Unknown';
    
    switch (this.model.state) {
      case WebSocketState.OPEN: return '🟢 Connected';
      case WebSocketState.CONNECTING: return '🟡 Connecting...';
      case WebSocketState.CLOSING: return '🟠 Closing...';
      default: return '🔴 Disconnected';
    }
  }
}



















