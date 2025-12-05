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

import { html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AbstractWebBean } from './AbstractWebBean.js';
import { OncePeerItemView, OncePeerModel } from './OncePeerItemView.js';
import { Reference } from '../../layer3/Reference.interface.js';
import { Collection } from '../../layer3/Collection.interface.js';

/**
 * ONCEModel - Model for ONCE kernel
 */
interface ONCEModel {
  uuid: string;
  version: string;
  peers: Collection<OncePeerModel>;
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
  static cssPath = 'OnceOverView.css'; // CSSLoader caches by filename
  
  /** HTML template path */
  static templatePath = '/dist/ts/layer5/views/webBeans/OnceOverView.html';
  
  /** Child ItemViews for peers */
  private peerViews: Collection<OncePeerItemView> = [];
  
  /** Reference to kernel for IOR calls */
  @property({ type: Object }) kernel: Reference<any> = null;
  
  /** View name for CSS/template paths */
  get viewName(): string {
    return 'OnceOverView';
  }
  
  // CSS loaded via adoptedStyleSheets from CSSLoader cache
  // Source: css/OnceOverView.css (preloaded before component import)
  // @pdca 2025-12-03-UTC-1400.lit-css-preload.pdca.md
  
  /**
   * Render the overview
   */
  render(): TemplateResult {
    const model = this.hasModel ? this.model : { peers: [], version: '0.3.x.x' };
    const peersCollection = model.peers || [];
    const peers = Array.from(peersCollection);
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
  private runningPeersCount(peers: OncePeerModel[]): number {
    let count = 0;
    peers.forEach(this.peerCountIfRunning.bind(this, { count }));
    return count;
  }
  
  /**
   * Count helper - called via method reference
   */
  private peerCountIfRunning(counter: { count: number }, peer: OncePeerModel): void {
    const model = (peer as any).model || peer;
    const state = model?.state?.state;
    if (state === 'RUNNING' || state === 'INITIALIZED') {
      counter.count++;
    }
  }
  
  /**
   * Render peer ItemViews
   */
  private peersRender(peers: OncePeerModel[]): TemplateResult {
    if (peers.length === 0) {
      return html`<div style="color: #666; text-align: center;">No peers connected yet...</div>`;
    }
    
    const items: TemplateResult[] = [];
    peers.forEach(this.peerItemCreate.bind(this, items));
    return html`${items}`;
  }
  
  /**
   * Create OncePeerItemView for peer - called via method reference
   */
  private peerItemCreate(items: TemplateResult[], peer: OncePeerModel): void {
    const model = (peer as any).model || peer;
    items.push(html`
      <once-peer-item-view
        .model=${model}
        @action-invoke=${this.actionInvokeHandler.bind(this)}
      ></once-peer-item-view>
    `);
  }
  
  // Removed update() override - use Lit's built-in update mechanism
  // Call requestUpdate() to trigger re-render
  
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
    this.requestUpdate();
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
    this.requestUpdate();
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

