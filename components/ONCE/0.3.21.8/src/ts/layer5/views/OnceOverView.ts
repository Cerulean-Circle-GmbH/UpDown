/**
 * OnceOverView.ts - Overview of all ONCE peers
 * 
 * This is the Web4 OOP replacement for demo-hub.html.
 * Shows a list of ONCE peers using ItemView components.
 * 
 * Features:
 * - Real-time WebSocket updates (server-registered, server-stopped)
 * - IOR action invocation (peerStop, healthCheck, peersDiscover, peerStopAll)
 * - Stats grid with live counts
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
 * @pdca 2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md
 */

import { html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AbstractWebBean } from './AbstractWebBean.js';
import { OncePeerItemView, OncePeerModel } from './OncePeerItemView.js';
import { ActionMetadata } from '../../layer3/ActionMetadata.interface.js';
import { Reference } from '../../layer3/Reference.interface.js';
import { Collection } from '../../layer3/Collection.interface.js';
import { LifecycleState } from '../../layer3/LifecycleState.enum.js';

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
  static cssPath = 'OnceOverView.css';
  
  /** HTML template path */
  static templatePath = '/dist/ts/layer5/views/webBeans/OnceOverView.html';
  
  /** Child ItemViews for peers */
  private peerViews: Collection<OncePeerItemView> = [];
  
  /** Reference to kernel for IOR calls */
  @property({ type: Object }) kernel: Reference<any> = null;
  
  /** WebSocket connection for real-time updates */
  private ws: Reference<WebSocket> = null;
  
  /** WebSocket reconnect attempts */
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  
  /** Local peer data (for real-time updates) */
  @state() private localPeers: OncePeerModel[] = [];
  
  /** Last update timestamp */
  @state() private lastUpdate: Reference<string> = null;
  
  /** View name for CSS/template paths */
  get viewName(): string {
    return 'OnceOverView';
  }
  
  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════
  
  connectedCallback(): void {
    super.connectedCallback();
    this.webSocketConnect();
    this.serversFetch();
  }
  
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.webSocketDisconnect();
  }
  
  /**
   * Render the overview
   */
  render(): TemplateResult {
    const model = this.hasModel ? this.model : { peers: [], version: '0.3.21.8' };
    
    // Use localPeers (from WebSocket) if available, else model.peers
    const peers = this.localPeers.length > 0 
      ? this.localPeers 
      : Array.from(model.peers || []);
    
    const runningCount = this.runningPeersCount(peers);
    const stoppedCount = peers.length - runningCount;
    
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
        <div class="stat-box running">
          <strong>🟢 Running</strong>
          <span class="stat-value">${runningCount}</span>
        </div>
        <div class="stat-box stopped">
          <strong>⚪ Stopped</strong>
          <span class="stat-value">${stoppedCount}</span>
        </div>
      </div>
      
      ${this.lastUpdate ? html`
        <div class="last-updated">Last updated: ${this.lastUpdate}</div>
      ` : ''}
      
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
    const counter = { count: 0 };
    peers.forEach(this.peerCountIfRunning.bind(this, counter));
    return counter.count;
  }
  
  /**
   * Count helper - called via method reference
   * ✅ Web4 P4: Use LifecycleState enum, flat model design
   */
  private peerCountIfRunning(counter: { count: number }, peer: OncePeerModel): void {
    const state = peer.lifecycleState;
    if (state === LifecycleState.RUNNING || state === LifecycleState.INITIALIZED) {
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
   * Makes IOR call based on action.method
   */
  private async actionInvokeHandler(event: CustomEvent): Promise<void> {
    const { action, uuid, model } = event.detail as { 
      action: ActionMetadata; 
      uuid: string; 
      model: OncePeerModel;
    };
    console.log(`Action: ${action.method} on ${uuid}`);
    
    const host = window.location.hostname;
    // ✅ Web4: Flat model - capabilities directly on model
    const port = model?.capabilities?.find(
      function(c) { return c.capability === 'httpPort'; }
    )?.port || 42777;
    
    switch (action.method) {
      case 'peerStop':
        await this.iorCall(host, port, 'peerStop', uuid);
        break;
      case 'healthCheck':
        await this.healthCheckOpen(host, port);
        break;
      case 'peersDiscover':
        await this.peersDiscoverHandler();
        break;
      case 'peerStopAll':
        await this.peerStopAllHandler();
        break;
      default:
        console.warn(`Unknown action: ${action.method}`);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // WEBSOCKET - Real-time peer updates
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Connect to WebSocket for real-time updates
   */
  private webSocketConnect(): void {
    const host = window.location.hostname;
    const port = 42777;
    
    try {
      this.ws = new WebSocket(`ws://${host}:${port}`);
      
      this.ws.onopen = this.webSocketOnOpen.bind(this);
      this.ws.onmessage = this.webSocketOnMessage.bind(this);
      this.ws.onerror = this.webSocketOnError.bind(this);
      this.ws.onclose = this.webSocketOnClose.bind(this);
    } catch (error) {
      console.error('❌ Failed to connect WebSocket:', error);
    }
  }
  
  /**
   * Disconnect WebSocket
   */
  private webSocketDisconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  /**
   * WebSocket open handler
   */
  private webSocketOnOpen(): void {
    console.log('✅ WebSocket connected to primary server');
    this.reconnectAttempts = 0;
  }
  
  /**
   * WebSocket message handler
   */
  private webSocketOnMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      this.serverEventHandle(message);
    } catch (error) {
      console.error('❌ Failed to parse WebSocket message:', error);
    }
  }
  
  /**
   * WebSocket error handler
   */
  private webSocketOnError(error: Event): void {
    console.error('❌ WebSocket error:', error);
  }
  
  /**
   * WebSocket close handler - attempt reconnect
   */
  private webSocketOnClose(): void {
    console.log('📡 WebSocket connection closed');
    this.ws = null;
    
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... (attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
      setTimeout(this.webSocketConnect.bind(this), 2000 * this.reconnectAttempts);
    }
  }
  
  /**
   * Handle server events from WebSocket
   */
  private serverEventHandle(message: { type: string; data: any }): void {
    console.log('📨 Received event:', message.type);
    
    switch (message.type) {
      case 'server-registered':
        this.serverRegisteredHandle(message.data);
        break;
      case 'server-stopped':
        this.serverStoppedHandle(message.data);
        break;
      default:
        // Ignore other message types
        break;
    }
  }
  
  /**
   * Handle server-registered event
   */
  private serverRegisteredHandle(serverModel: any): void {
    console.log('🟢 Server registered:', serverModel.uuid);
    
    const existingIndex = this.localPeers.findIndex(
      function(p) { return p.uuid === serverModel.uuid; }
    );
    
    const port = serverModel.capabilities?.find(
      function(c: any) { return c.capability === 'httpPort'; }
    )?.port;
    
    // ✅ Web4: Flat model design - no nested state.state
    const peerModel: OncePeerModel = {
      uuid: serverModel.uuid,
      lifecycleState: LifecycleState.RUNNING,
      capabilities: serverModel.capabilities || [{ capability: 'httpPort', port }],
      isPrimaryServer: port === 42777
    };
    
    if (existingIndex === -1) {
      this.localPeers = [...this.localPeers, peerModel];
    } else {
      this.localPeers = this.localPeers.map(function(p, i) {
        return i === existingIndex ? peerModel : p;
      });
    }
    
    this.lastUpdate = new Date().toLocaleTimeString();
    this.requestUpdate();
  }
  
  /**
   * Handle server-stopped event
   * ✅ Web4: Flat model update
   */
  private serverStoppedHandle(data: { uuid: string }): void {
    console.log('🛑 Server stopped:', data.uuid);
    
    this.localPeers = this.localPeers.map(function(p) {
      if (p.uuid === data.uuid) {
        return { ...p, lifecycleState: LifecycleState.STOPPED };
      }
      return p;
    });
    
    this.lastUpdate = new Date().toLocaleTimeString();
    this.requestUpdate();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // IOR CALLS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Make IOR call to server
   */
  private async iorCall(host: string, port: number, method: string, uuid?: string): Promise<void> {
    const url = uuid 
      ? `http://${host}:${port}/ONCE/0.3.21.8/${uuid}/${method}`
      : `http://${host}:${port}/${method}`;
    
    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        console.error(`❌ IOR call failed: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ IOR call error:`, error);
    }
  }
  
  /**
   * Open health check in new window
   */
  private async healthCheckOpen(host: string, port: number): Promise<void> {
    window.open(`http://${host}:${port}/health`, '_blank');
  }
  
  /**
   * Fetch initial server list
   * ✅ Web4: Flat model design - maps API response to OncePeerModel
   */
  private async serversFetch(): Promise<void> {
    const host = window.location.hostname;
    const port = 42777;
    
    try {
      const response = await fetch(`http://${host}:${port}/servers`);
      const data = await response.json();
      
      // Add primary server - ✅ Web4: Flat model
      const primaryModel: OncePeerModel = {
        uuid: 'primary',
        lifecycleState: LifecycleState.RUNNING,
        capabilities: [{ capability: 'httpPort', port: 42777 }],
        isPrimaryServer: true
      };
      
      // Map registered clients from data.model.servers (scenario format)
      const serverList = data.model?.servers || data.servers || [];
      const clients = serverList.map(function(s: any) {
        // Access nested API structure: s.model.state or s.state
        const serverModel = s.model || s;
        const serverState = serverModel?.state || {};
        const clientPort = serverState.capabilities?.find(
          function(c: any) { return c.capability === 'httpPort'; }
        )?.port;
        
        // ✅ Web4: Flat model - no nested state.state
        return {
          uuid: serverModel.uuid || s.ior?.uuid || 'unknown',
          lifecycleState: LifecycleState.RUNNING,
          capabilities: serverState.capabilities || [{ capability: 'httpPort', port: clientPort }],
          isPrimaryServer: false
        } as OncePeerModel;
      });
      
      this.localPeers = [primaryModel, ...clients];
      this.lastUpdate = new Date().toLocaleTimeString();
      this.requestUpdate();
      
    } catch (error) {
      console.error('❌ Failed to fetch servers:', error);
    }
  }
}

