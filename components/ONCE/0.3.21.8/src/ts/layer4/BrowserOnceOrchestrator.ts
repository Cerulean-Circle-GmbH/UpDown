/**
 * BrowserOnceOrchestrator - Layer 4 Async Orchestration
 * 
 * ✅ Web4 Architecture: ALL browser async operations live here
 * ✅ Separates async I/O from domain logic (Layer 2 BrowserOnce)
 * ✅ No arrow functions - uses method binding
 * 
 * Responsibilities:
 * - CSS/JS asset preloading
 * - View creation and mounting
 * - WebSocket connection management
 * - Server fetch operations
 * - IOR calls to server
 * 
 * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
 */

import { LitElement } from 'lit';
import { Reference } from '../layer3/Reference.interface.js';
import type { BrowserOnce } from '../layer2/BrowserOnce.js';

/**
 * BrowserOnceOrchestrator
 * 
 * Layer 4 orchestrator for all browser async operations.
 * BrowserOnce (Layer 2) delegates async work here.
 */
export class BrowserOnceOrchestrator {
  
  /** Reference to the kernel component */
  private component: BrowserOnce;
  
  /** The main Lit view element */
  private mainView: Reference<LitElement> = null;
  
  /** WebSocket connection */
  private ws: Reference<WebSocket> = null;
  
  /** Container element for app rendering */
  private container: Reference<Element> = null;
  
  /**
   * Constructor - receives kernel reference
   */
  constructor(component: BrowserOnce) {
    this.component = component;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // APP LIFECYCLE (async)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Render the application
   * Called from once.html after kernel boot
   * 
   * @param container - DOM element to render into
   */
  async appRender(container: Element): Promise<void> {
    console.log('[Orchestrator] appRender() starting...');
    this.container = container;
    
    // 1. Preload CSS assets
    await this.assetsPreload();
    
    // 2. Import view components
    await this.viewsImport();
    
    // 3. Determine which view to create
    const viewTag = this.component.appEntryView || this.component.defaultView;
    if (!viewTag) {
      console.error('[Orchestrator] No defaultView or appEntryView defined');
      return;
    }
    
    // 4. Create main view
    console.log(`[Orchestrator] Creating view: <${viewTag}>`);
    this.mainView = document.createElement(viewTag) as LitElement;
    (this.mainView as any).model = this.component.browserModel;
    (this.mainView as any).kernel = this.component;
    container.appendChild(this.mainView);
    
    // 5. Listen for action events from views
    // ✅ Web4: Layer 4 handles async, Layer 5 dispatches events
    this.mainView.addEventListener('action-request', this.actionRequestHandle.bind(this) as unknown as EventListener);
    
    // 6. Connect WebSocket for real-time updates
    this.webSocketConnect();
    
    // 7. Initial data fetch
    await this.serversFetch();
    
    console.log('[Orchestrator] appRender() complete');
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ASSET LOADING (async)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Preload CSS assets from manifest
   */
  private async assetsPreload(): Promise<void> {
    console.log('[Orchestrator] Preloading assets...');
    
    try {
      const response = await fetch('/asset-manifest');
      const data = await response.json();
      const cssFiles = data.model?.css || data.css || [];
      
      if (cssFiles.length === 0) {
        console.warn('[Orchestrator] No CSS files in manifest');
        return;
      }
      
      // Load CSS via CSSLoader
      const { CSSLoader } = await import('../layer2/CSSLoader.js');
      await CSSLoader.preloadAll(cssFiles);
      
      console.log(`[Orchestrator] ✅ Preloaded ${cssFiles.length} CSS files`);
    } catch (error) {
      console.warn('[Orchestrator] ⚠️ Asset preload failed:', error);
    }
  }
  
  /**
   * Import view components dynamically
   */
  private async viewsImport(): Promise<void> {
    console.log('[Orchestrator] Importing view components...');
    
    const basePath = `/EAMD.ucp/components/ONCE/${this.component.browserModel.version}/dist/ts/layer5/views`;
    
    await import(`${basePath}/OnceOverView.js`);
    await import(`${basePath}/DefaultItemView.js`);
    await import(`${basePath}/OncePeerItemView.js`);
    
    console.log('[Orchestrator] ✅ View components imported');
  }
  
  // ═══════════════════════════════════════════════════════════════
  // WEBSOCKET (async/event-driven)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Connect to WebSocket for real-time updates
   */
  webSocketConnect(): void {
    const host = this.component.browserModel.peerHost || window.location.host;
    const wsUrl = `ws://${host}`;
    
    console.log(`[Orchestrator] Connecting WebSocket to ${wsUrl}...`);
    
    this.ws = new WebSocket(wsUrl);
    
    // ✅ Web4: Bound methods, not arrow functions
    this.ws.onopen = this.webSocketOnOpen.bind(this);
    this.ws.onmessage = this.webSocketOnMessage.bind(this);
    this.ws.onerror = this.webSocketOnError.bind(this);
    this.ws.onclose = this.webSocketOnClose.bind(this);
  }
  
  /**
   * WebSocket opened
   */
  private webSocketOnOpen(): void {
    console.log('[Orchestrator] ✅ WebSocket connected');
    
    // Send browser identification
    const identifyMessage = JSON.stringify({
      type: 'browser-identify',
      uuid: this.component.browserModel.uuid,
      timestamp: new Date().toISOString()
    });
    this.ws?.send(identifyMessage);
  }
  
  /**
   * WebSocket message received
   */
  private webSocketOnMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'scenario-update' || data.ior) {
        console.log('[Orchestrator] 📡 Scenario update received');
        this.serversFetch();  // Refresh server list
      }
    } catch (error) {
      console.warn('[Orchestrator] WebSocket message parse error:', error);
    }
  }
  
  /**
   * WebSocket error
   */
  private webSocketOnError(event: Event): void {
    console.error('[Orchestrator] ❌ WebSocket error:', event);
  }
  
  /**
   * WebSocket closed
   */
  private webSocketOnClose(): void {
    console.log('[Orchestrator] WebSocket closed');
    this.ws = null;
    
    // Attempt reconnection after delay
    setTimeout(this.webSocketConnect.bind(this), 5000);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // SERVER OPERATIONS (async)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Fetch servers list and update model
   */
  async serversFetch(): Promise<void> {
    try {
      // Determine endpoint (primary or local)
      const peerHost = this.component.browserModel.peerHost || window.location.host;
      let endpoint = `http://${peerHost}/servers`;
      
      const primaryPeer = this.component.browserModel.primaryPeer;
      if (primaryPeer) {
        endpoint = `http://${primaryPeer.host}:${primaryPeer.port}/servers`;
      }
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const servers = data.model?.servers || data.servers || [];
      
      // Update component model
      this.component.browserModel.peers = servers;
      
      // Refresh view
      this.viewRefresh();
      
    } catch (error) {
      console.warn('[Orchestrator] serversFetch failed:', error);
    }
  }
  
  /**
   * Make IOR call to server
   */
  async iorCall(host: string, port: number, method: string, uuid?: string): Promise<any> {
    const version = this.component.browserModel.version;
    const url = uuid 
      ? `http://${host}:${port}/ONCE/${version}/${uuid}/${method}`
      : `http://${host}:${port}/${method}`;
    
    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        console.error(`[Orchestrator] IOR call failed: ${response.status}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('[Orchestrator] IOR call error:', error);
      return null;
    }
  }
  
  /**
   * Health check
   */
  async healthFetch(): Promise<any> {
    const peerHost = this.component.browserModel.peerHost || window.location.host;
    
    try {
      const response = await fetch(`http://${peerHost}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[Orchestrator] Health check failed:', error);
      return { status: 'error', error: String(error) };
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // VIEW MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Refresh the main view with current model
   */
  private viewRefresh(): void {
    if (this.mainView) {
      (this.mainView as any).model = this.component.browserModel;
      this.mainView.requestUpdate();
    }
  }
  
  /**
   * Handle navigation events from views
   */
  navigationHandle(event: CustomEvent): void {
    const path = event.detail?.path;
    if (path) {
      console.log(`[Orchestrator] Navigation requested: ${path}`);
      // For now, simple URL change - UcpRouter will handle this later
      window.history.pushState({}, '', path);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ACTION HANDLING (Layer 4 handles all async from Layer 5 events)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Handle action requests from views
   * ✅ Web4: Layer 4 handles all async operations
   */
  async actionRequestHandle(event: CustomEvent): Promise<void> {
    const { action, host, port, uuid } = event.detail;
    console.log(`[Orchestrator] Action request: ${action}`);
    
    switch (action) {
      case 'peerStart':
        await this.peerStartAction();
        break;
      case 'peersDiscover':
        await this.serversFetch();
        break;
      case 'peerStopAll':
        await this.iorCall(host, port, 'peerStopAll', uuid);
        break;
      case 'peerStop':
        await this.iorCall(host, port, 'peerStop', uuid);
        break;
      case 'healthCheck':
        window.open(`http://${host}:${port}/health`, '_blank');
        break;
      default:
        console.warn(`[Orchestrator] Unknown action: ${action}`);
    }
    
    // Refresh view after action
    this.viewRefresh();
  }
  
  /**
   * Start a new peer server
   */
  private async peerStartAction(): Promise<void> {
    // Call kernel method if available
    const kernel = this.component as any;
    if (typeof kernel.startClientServer === 'function') {
      await kernel.startClientServer();
    } else {
      console.warn('[Orchestrator] startClientServer not available on kernel');
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // CLEANUP
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.mainView && this.container) {
      this.container.removeChild(this.mainView);
      this.mainView = null;
    }
    
    this.container = null;
  }
}

