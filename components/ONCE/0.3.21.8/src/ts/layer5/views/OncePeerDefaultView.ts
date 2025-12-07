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
  
  /** Inline critical styles (for immediate rendering) */
  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%);
      color: #e0e0e0;
      padding: 2rem;
      box-sizing: border-box;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(0, 255, 136, 0.3);
    }
    
    .logo {
      font-size: 3rem;
    }
    
    h1 {
      font-size: 2rem;
      font-weight: 400;
      color: #00ff88;
      margin: 0;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }
    
    .version-badge {
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 4px;
      padding: 0.25rem 0.75rem;
      font-size: 0.85rem;
      color: #00ff88;
    }
    
    .status-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .status-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1.5rem;
    }
    
    .status-card h2 {
      font-size: 1rem;
      font-weight: 500;
      color: #888;
      margin: 0 0 1rem 0;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .status-value {
      font-size: 1.5rem;
      color: #fff;
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
      background: #00ff88;
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }
    
    .status-dot.stopped {
      background: #ff4444;
      box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
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
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .capability-name {
      color: #888;
    }
    
    .capability-value {
      color: #00ff88;
      font-family: monospace;
    }
    
    .routes-section {
      margin-top: 2rem;
    }
    
    .routes-section h2 {
      font-size: 1.2rem;
      font-weight: 400;
      color: #888;
      margin-bottom: 1rem;
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
   * Render header section
   */
  private headerRender(): TemplateResult {
    return html`
      <header class="header">
        <span class="logo">🌐</span>
        <h1>${this.serverName}</h1>
        <span class="version-badge">v${this.serverVersion}</span>
        ${this.isPrimary 
          ? html`<span class="version-badge" style="background: rgba(0, 136, 255, 0.1); border-color: rgba(0, 136, 255, 0.3); color: #0088ff;">PRIMARY</span>`
          : html`<span class="version-badge" style="background: rgba(136, 136, 136, 0.1); border-color: rgba(136, 136, 136, 0.3); color: #888;">CLIENT</span>`
        }
      </header>
    `;
  }
  
  /**
   * Render status section
   */
  private statusSectionRender(): TemplateResult {
    const isRunning = this.lifecycleState === LifecycleState.RUNNING;
    
    return html`
      <div class="status-section">
        <div class="status-card">
          <h2>Status</h2>
          <div class="status-value status-indicator">
            <span class="status-dot ${isRunning ? 'running' : 'stopped'}"></span>
            ${this.lifecycleState}
          </div>
        </div>
        
        <div class="status-card">
          <h2>Identity</h2>
          <div class="status-value" style="font-size: 1rem; word-break: break-all;">
            ${this.serverUuid}
          </div>
        </div>
        
        <div class="status-card">
          <h2>Network</h2>
          <div class="status-value" style="font-size: 1rem;">
            ${this.serverHostname}.${this.serverDomain}
          </div>
        </div>
        
        <div class="status-card">
          <h2>Capabilities</h2>
          <div class="capabilities-list">
            ${this.capabilities.map(cap => this.capabilityItemRender(cap))}
          </div>
        </div>
        
        ${this.isPrimary ? html`
          <div class="status-card">
            <h2>Cluster</h2>
            <div class="status-value">
              ${this.peerCount} peer${this.peerCount !== 1 ? 's' : ''} connected
            </div>
          </div>
        ` : ''}
      </div>
    `;
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
   * Render routes section with route-over-view component
   */
  private routesSectionRender(): TemplateResult {
    return html`
      <div class="routes-section">
        <h2>Available Endpoints</h2>
        <route-over-view .peerHost="${this.peerHost}"></route-over-view>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'once-peer-default-view': OncePeerDefaultView;
  }
}

