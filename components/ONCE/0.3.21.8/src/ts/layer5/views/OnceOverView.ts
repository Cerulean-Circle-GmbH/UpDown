/**
 * OnceOverView.ts - Overview of all ONCE peers
 * 
 * This is the Web4 OOP replacement for demo-hub.html.
 * Shows a list of ONCE peers using ItemView components.
 * 
 * Naming Convention: {Component}OverView.ts
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions, method references)
 * - P7: All methods SYNCHRONOUS (Layer 5)
 * - P16: TypeScript accessors
 * - P22: Collection<T> for peer list
 * 
 * @ior ior:esm:/ONCE/{version}/OnceOverView
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 */

import { html, TemplateResult, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AbstractWebBean } from './AbstractWebBean.js';
import { ItemView } from './ItemView.js';
import { Reference } from '../../layer3/Reference.interface.js';

/**
 * ONCEModel - Model for ONCE kernel
 */
interface ONCEModel {
  uuid: string;
  version: string;
  peers: any[];
  peerUUID: Reference<string>;
  peerHost: string;
}

/**
 * OnceOverView - Overview of all ONCE peers
 * 
 * This is the Web4 OOP replacement for demo-hub.html.
 * Shows a list of ONCE peers using ItemView components.
 * 
 * Shows:
 * - Stats grid (total peers, running peers)
 * - Action buttons (Start, Discover, Shutdown All)
 * - Peer grid with ItemView for each peer
 * 
 * Web4 Principle 19: CSS source is in css/OnceOverView.css
 * Note: Static styles needed for Lit. Build step will inline from CSS file.
 */
@customElement('once-over-view')
export class OnceOverView extends AbstractWebBean<ONCEModel> {
  
  /** CSS path for adoptedStyleSheets */
  static cssPath = '/dist/ts/layer5/views/css/OnceOverView.css';
  
  /** HTML template path */
  static templatePath = '/dist/ts/layer5/views/webBeans/OnceOverView.html';
  
  /** Child ItemViews for peers */
  private peerViews: ItemView[] = [];
  
  /** Reference to kernel for IOR calls */
  @property({ type: Object }) kernel: Reference<any> = null;
  
  /** View name for CSS/template paths */
  get viewName(): string {
    return 'OnceOverView';
  }
  
  /**
   * Static styles - TEMPORARY inline until build step inlines from css/OnceOverView.css
   * Source of truth: css/OnceOverView.css
   */
  static styles = css`
    :host {
      display: block;
      font-family: var(--font-family, 'Courier New', monospace);
      background: var(--bg-primary, #1a1a1a);
      color: var(--color-primary, #0f0);
      padding: var(--spacing-lg, 20px);
      min-height: 100vh;
    }
    .header {
      border: 2px solid var(--border-color, #0f0);
      padding: var(--spacing-lg, 20px);
      margin-bottom: var(--spacing-lg, 20px);
      text-align: center;
      background: var(--bg-highlight, rgba(0, 255, 0, 0.1));
    }
    h1 { margin: 0 0 10px 0; color: var(--color-primary, #0f0); }
    h2 { color: var(--color-accent, #ff0); margin: var(--spacing-lg, 20px) 0 10px 0; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin: var(--spacing-lg, 20px) 0;
    }
    .stat-box {
      border: 1px solid var(--border-color, #0f0);
      padding: 15px;
      background: var(--bg-highlight, rgba(0, 255, 0, 0.05));
      text-align: center;
    }
    .stat-value {
      font-size: var(--font-size-xxl, 2em);
      font-weight: bold;
      color: var(--color-accent, #ff0);
      display: block;
      margin: 10px 0;
    }
    .controls { text-align: center; margin: var(--spacing-lg, 20px) 0; }
    .peer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
      margin: var(--spacing-lg, 20px) 0;
    }
    button {
      background: var(--btn-primary-bg, #0f0);
      color: var(--btn-primary-color, #000);
      border: none;
      padding: 10px 20px;
      margin: 5px;
      cursor: pointer;
      font-family: inherit;
      font-weight: bold;
    }
    button:hover { background: var(--btn-primary-hover, #ff0); }
    button:disabled { background: var(--text-muted, #666); cursor: not-allowed; }
    .start-btn { background: #0a0; border: 2px solid var(--color-primary, #0f0); }
    .start-btn:hover:not(:disabled) { background: var(--color-primary, #0f0); }
    .discover-btn { background: var(--btn-secondary-bg, #066); border: 2px solid var(--color-secondary, #0ff); }
    .discover-btn:hover { background: var(--color-secondary, #0ff); }
    .shutdown-btn { background: var(--btn-danger-bg, #a00); border: 2px solid var(--color-danger, #f00); color: var(--btn-danger-color, #fff); }
    .shutdown-btn:hover { background: var(--color-danger, #f00); }
  `;
  
  /**
   * Render the overview
   */
  render(): TemplateResult {
    const model = this.hasModel ? this.model : { peers: [], version: '0.3.x.x' };
    const peers = model.peers || [];
    const runningCount = this.runningPeersCount(peers);
    
    return html`
      <div class="header">
        <h1>🎭 ONCE v${model.version} Demo Hub</h1>
        <p>IOR-based Lifecycle Management - Web4 MVC</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-box">
          <strong>Total Peers</strong>
          <span class="stat-value">${peers.length}</span>
        </div>
        <div class="stat-box">
          <strong>Running Peers</strong>
          <span class="stat-value">${runningCount}</span>
        </div>
      </div>
      
      <h2>🎮 Lifecycle Management</h2>
      <div class="controls">
        <button class="start-btn" @click=${this.peerStartHandler.bind(this)}>
          ➕ Start Next Server
        </button>
        <button class="discover-btn" @click=${this.peersDiscoverHandler.bind(this)}>
          🔍 Discover Servers
        </button>
        <button class="shutdown-btn" @click=${this.peerStopAllHandler.bind(this)}>
          🛑 Shutdown All
        </button>
      </div>
      
      <h2>📡 Connected Peers</h2>
      <div class="peer-grid">
        ${this.peersRender(peers)}
      </div>
    `;
  }
  
  /**
   * Count running peers - uses function (not arrow)
   */
  private runningPeersCount(peers: any[]): number {
    let count = 0;
    peers.forEach(this.peerCountIfRunning.bind(this, { count }));
    return count;
  }
  
  /**
   * Count helper - called via method reference
   */
  private peerCountIfRunning(counter: { count: number }, peer: any): void {
    const state = peer.model?.state?.state || peer.state?.state;
    if (state === 'RUNNING' || state === 'INITIALIZED') {
      counter.count++;
    }
  }
  
  /**
   * Render peer ItemViews
   */
  private peersRender(peers: any[]): TemplateResult {
    if (peers.length === 0) {
      return html`<div style="color: #666; text-align: center;">No peers connected yet...</div>`;
    }
    
    const items: TemplateResult[] = [];
    peers.forEach(this.peerItemCreate.bind(this, items));
    return html`${items}`;
  }
  
  /**
   * Create ItemView for peer - called via method reference
   */
  private peerItemCreate(items: TemplateResult[], peer: any): void {
    const model = peer.model || peer;
    items.push(html`
      <once-item-view
        .model=${model}
        @action-invoke=${this.actionInvokeHandler.bind(this)}
      ></once-item-view>
    `);
  }
  
  /**
   * Update view - SYNCHRONOUS
   * Re-renders peer grid when model changes
   */
  update(): void {
    super.update();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Action Handlers - These call kernel methods via IOR
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Start a new peer server
   */
  private async peerStartHandler(): Promise<void> {
    if (!this.kernel) {
      console.error('Kernel not available');
      return;
    }
    
    // Call kernel method (will make IOR call)
    await this.kernel.startClientServer?.();
    this.update();
  }
  
  /**
   * Discover peer servers
   */
  private async peersDiscoverHandler(): Promise<void> {
    if (!this.kernel) {
      console.error('Kernel not available');
      return;
    }
    
    await this.kernel.peersDiscover?.();
    this.update();
  }
  
  /**
   * Shutdown all peer servers
   */
  private async peerStopAllHandler(): Promise<void> {
    const confirmed = confirm('⚠️  Shutdown ALL servers?');
    if (!confirmed) return;
    
    if (!this.kernel) {
      console.error('Kernel not available');
      return;
    }
    
    await this.kernel.peerStopAll?.();
  }
  
  /**
   * Handle action-invoke event from ItemView
   */
  private async actionInvokeHandler(event: CustomEvent): Promise<void> {
    const { action, uuid } = event.detail;
    console.log(`Action: ${action.method} on ${uuid}`);
    
    // TODO: Make IOR call to invoke action
    // For now, dispatch to kernel if available
    if (this.kernel && action.method === 'peerStop') {
      // Would call: kernel.peerStop(uuid)
    }
  }
}

