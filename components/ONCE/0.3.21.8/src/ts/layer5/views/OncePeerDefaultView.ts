/**
 * OncePeerDefaultView.ts - ONCE peer default view
 * 
 * Full-page view for displaying a single ONCE peer's status.
 * Serves as the default "/" route view.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P16: TypeScript accessors
 * - P19: CSS in separate file (OncePeerDefaultView.css)
 * - P24: Registered via RelatedObjects as View
 * - P27: Web Components ARE Radical OOP
 * 
 * @ior ior:esm:/ONCE/{version}/OncePeerDefaultView
 * @pdca 2025-11-19-UTC-1800.iteration-tracking.pdca.md
 */

import { html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UcpView } from './UcpView.js';
import { LifecycleState } from '../../layer3/LifecycleState.enum.js';
import type { Reference } from '../../layer3/Reference.interface.js';

/**
 * ServerCapability - Capability descriptor
 */
export interface ServerCapability {
  capability: string;
  port?: number;
}

/**
 * ServerModel - Model for server default view
 */
export interface ServerDefaultModel {
  uuid: string;
  name: string;
  version: string;
  hostname: string;
  domain: string;
  lifecycleState: LifecycleState;
  isPrimaryServer: boolean;
  capabilities: ServerCapability[];
  peerCount: number;
  peerHost: string;
}

/**
 * OncePeerDefaultView
 * 
 * Full-page view for a single ONCE peer server.
 * Shows detailed status, capabilities, and route links.
 */
@customElement('once-peer-default-view')
export class OncePeerDefaultView extends UcpView<ServerDefaultModel> {
  
  /** 
   * CSS path for external stylesheet - Web4 P19: Separation of Concerns
   * CSS is in: css/OncePeerDefaultView.css
   * Applied via UcpView.applyCachedStyles() in connectedCallback()
   */
  static cssPath = 'OncePeerDefaultView.css';
  
  // ═══════════════════════════════════════════════════════════════
  // Getters - Web4 P16: TypeScript Accessors
  // ═══════════════════════════════════════════════════════════════
  
  get serverUuid(): string {
    return this.model?.uuid || 'unknown';
  }
  
  get serverName(): string {
    return this.model?.name || 'ONCE Server';
  }
  
  get serverVersion(): string {
    return this.model?.version || '0.3.21.8';
  }
  
  get serverHostname(): string {
    return this.model?.hostname || 'localhost';
  }
  
  get serverDomain(): string {
    return this.model?.domain || 'local.once';
  }
  
  get lifecycleState(): LifecycleState {
    return this.model?.lifecycleState || LifecycleState.STOPPED;
  }
  
  get isPrimary(): boolean {
    return this.model?.isPrimaryServer || false;
  }
  
  get capabilities(): ServerCapability[] {
    return this.model?.capabilities || [];
  }
  
  get peerCount(): number {
    return this.model?.peerCount || 0;
  }
  
  get peerHost(): string {
    return this.model?.peerHost || 'localhost:42777';
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Render - Web4 P27: Declarative Templates
  // ═══════════════════════════════════════════════════════════════
  
  render(): TemplateResult {
    return html`
      <div class="container">
        ${this.headerRender()}
        ${this.statusSectionRender()}
        ${this.routesSectionRender()}
      </div>
    `;
  }
  
  /**
   * Render header section - matches 0.3.21.5 styling
   */
  private headerRender(): TemplateResult {
    return html`
      <header class="header">
        <span class="logo">🚀</span>
        <h1>ONCE Server</h1>
        <p class="subtitle">Object Network Communication Engine</p>
        <p class="subtitle">Enhanced v${this.serverVersion} with Server Hierarchy & Dynamic Port Management</p>
        <p class="branding">Powered by <strong>Cerulean Circle GmbH</strong></p>
        <span class="version-badge ${this.isPrimary ? 'primary-badge' : 'client-badge'}">
          ${this.isPrimary ? '🟢 Primary Server' : '🔵 Client Server'}
        </span>
      </header>
    `;
  }
  
  /**
   * Render status section - matches 0.3.21.5 layout
   */
  private statusSectionRender(): TemplateResult {
    const isRunning = this.lifecycleState === LifecycleState.RUNNING;
    
    return html`
      <div class="status-banner">
        <h3>
          <span class="status-dot ${isRunning ? 'running' : 'stopped'}"></span>
          Server Status: ${isRunning ? 'Running' : this.lifecycleState}
        </h3>
        <p>ONCE kernel v${this.serverVersion} initialized and ready for enhanced P2P communication</p>
      </div>
      
      <div class="status-section">
        <div class="status-card">
          <h2>🆔 Identity</h2>
          <p><strong>UUID:</strong></p>
          <code>${this.serverUuid}</code>
          <p><strong>Domain:</strong> ${this.serverDomain}</p>
          <p><strong>State:</strong> ${this.lifecycleState}</p>
        </div>
        
        <div class="status-card">
          <h2>🌐 Network</h2>
          <p><strong>HTTP Port:</strong> ${this.httpPort}</p>
          <p><strong>WebSocket Port:</strong> ${this.wsPort}</p>
          <p><strong>Server Type:</strong> ${this.isPrimary ? 'Primary (42777)' : 'Client (8080+)'}</p>
        </div>
        
        <div class="status-card">
          <h2>⚡ Capabilities</h2>
          <div class="capabilities-list">
            ${this.capabilities.length > 0 
              ? this.capabilities.map(this.capabilityItemRender.bind(this))
              : html`<p>No capabilities registered</p>`
            }
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Get HTTP port from capabilities
   * Web4 P4: Using helper method instead of arrow function in find()
   */
  get httpPort(): string {
    const httpCap = this.capabilityLookup('httpPort');
    return httpCap?.port?.toString() || '42777';
  }
  
  /**
   * Get WebSocket port from capabilities
   * Web4 P4: Using helper method instead of arrow function in find()
   */
  get wsPort(): string {
    const wsCap = this.capabilityLookup('wsPort');
    return wsCap?.port?.toString() || this.httpPort;
  }
  
  /**
   * Lookup capability by name
   * Web4 P16: Parameterized lookup method (not capabilityGet!)
   */
  private capabilityLookup(name: string): ServerCapability | undefined {
    for (const cap of this.capabilities) {
      if (cap.capability === name) {
        return cap;
      }
    }
    return undefined;
  }
  
  /**
   * Render capability item
   */
  private capabilityItemRender(cap: ServerCapability): TemplateResult {
    return html`
      <div class="capability-item">
        <span class="capability-name">${cap.capability}</span>
        <span class="capability-value">${cap.port || 'Active'}</span>
      </div>
    `;
  }
  
  /**
   * Render routes section - delegates to RouteOverView for dynamic routes
   * Web4 P19: Separation of Concerns - route display is RouteOverView's responsibility
   */
  private routesSectionRender(): TemplateResult {
    return html`
      <route-over-view .peerHost="${this.peerHost}"></route-over-view>
      
      <div class="routes-section">
        <h2>🔌 WebSocket Connection</h2>
        <p>WebSocket endpoint available at: <code>ws://${this.peerHost}/</code></p>
        <p>Use this endpoint for real-time P2P communication with ONCE v${this.serverVersion} kernel</p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'once-peer-default-view': OncePeerDefaultView;
  }
}

