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

import { html, TemplateResult, css, CSSResultGroup } from 'lit';
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
  
  /** CSS path - external CSS for Web4 P19 */
  static cssPath = 'OncePeerDefaultView.css';
  
  /** 
   * Inline critical styles - Cerulean theme matching 0.3.21.5
   * @pdca 2025-12-09-UTC-1800.ucpview-framework-independence.pdca.md
   */
  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #0e7490 100%);
      color: white;
      padding: 20px;
      box-sizing: border-box;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .logo {
      font-size: 3.5rem;
      filter: drop-shadow(0 4px 8px rgba(8, 145, 178, 0.3));
    }
    
    h1 {
      margin: 10px 0;
      font-size: 2.5em;
      background: linear-gradient(45deg, #fff, #67e8f9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-weight: 300;
      margin: 10px 0;
    }
    
    .branding {
      color: #67e8f9;
      font-style: italic;
      margin: 10px 0;
    }
    
    .version-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: bold;
      margin: 5px;
    }
    
    .primary-badge {
      background: linear-gradient(45deg, #10b981, #34d399);
      color: white;
    }
    
    .client-badge {
      background: linear-gradient(45deg, #3b82f6, #60a5fa);
      color: white;
    }
    
    .status-banner {
      background: rgba(0, 255, 0, 0.2);
      border: 2px solid rgba(0, 255, 0, 0.4);
      border-radius: 15px;
      padding: 25px;
      margin: 25px 0;
      text-align: center;
    }
    
    .status-banner h3 {
      margin-top: 0;
      color: #4ade80;
      font-size: 1.5em;
    }
    
    .status-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin: 25px 0;
    }
    
    .status-card {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 15px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .status-card h2 {
      margin-top: 0;
      color: #a8edea;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.1em;
    }
    
    .status-value {
      font-size: 1rem;
      color: #fff;
      word-break: break-all;
    }
    
    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    .status-dot.running {
      background: #4ade80;
      box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
    }
    
    .status-dot.stopped {
      background: #f87171;
      box-shadow: 0 0 10px rgba(248, 113, 113, 0.5);
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .capabilities-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .capability-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .capability-name {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .capability-value {
      color: #a8edea;
      font-family: 'Monaco', 'Menlo', monospace;
    }
    
    .routes-section {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      padding: 25px;
      margin: 25px 0;
    }
    
    .routes-section h2 {
      margin-top: 0;
      color: #fbbf24;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    code {
      background: rgba(0, 0, 0, 0.4);
      padding: 5px 10px;
      border-radius: 5px;
      font-family: 'Monaco', 'Menlo', monospace;
      color: #a8edea;
    }
    
    .endpoint {
      margin: 15px 0;
      padding: 15px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
      border-left: 4px solid #10b981;
    }
    
    .endpoint strong {
      color: #10b981;
    }
    
    .endpoint p {
      margin: 8px 0 0 0;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .endpoint a {
      color: #a8edea;
      text-decoration: none;
    }
    
    .endpoint a:hover {
      color: #fff;
      text-decoration: underline;
    }
  `;
  
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
   * Render routes section - matches 0.3.21.5's endpoint list
   */
  private routesSectionRender(): TemplateResult {
    return html`
      <div class="routes-section">
        <h2>📡 Available Endpoints</h2>
        
        <div class="endpoint">
          <strong>Server Status:</strong> 
          <code><a href="/" target="_blank">/</a></code>
          <p>This page - server status and information</p>
        </div>
        
        <div class="endpoint">
          <strong>Health Check:</strong> 
          <code><a href="/health" target="_blank">/health</a></code>
          <p>JSON server health and status information</p>
        </div>
        
        <div class="endpoint">
          <strong>Server Registry:</strong> 
          <code><a href="/servers" target="_blank">/servers</a></code>
          <p>${this.isPrimary ? 'JSON list of all registered servers in hierarchy' : 'Only available on primary server'}</p>
        </div>
        
        <div class="endpoint">
          <strong>Interactive Client:</strong> 
          <code><a href="/once" target="_blank">/once</a></code>
          <p>Interactive WebSocket browser client with message exchange</p>
        </div>
        
        <div class="endpoint">
          <strong>Demo Hub:</strong> 
          <code><a href="/demo" target="_blank">/demo</a></code>
          <p>Live server management dashboard with auto-refresh and status monitoring</p>
        </div>
      </div>
      
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

