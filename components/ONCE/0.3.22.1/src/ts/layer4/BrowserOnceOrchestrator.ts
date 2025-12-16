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
import type { UcpRouter } from '../layer5/views/UcpRouter.js';
import type { ServerDefaultModel } from '../layer5/views/OncePeerDefaultView.js';
import type { ONCEServerModel } from '../layer3/ONCEServerModel.interface.js';
import { LifecycleState } from '../layer3/LifecycleState.enum.js';

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
  
  /** UcpRouter for SPA routing */
  private router: Reference<UcpRouter> = null;
  
  /** WebSocket connection */
  private ws: Reference<WebSocket> = null;
  
  /** Container element for app rendering */
  private container: Reference<Element> = null;
  
  /** Server model for main route (once-peer-default-view) */
  private serverModel: Reference<ServerDefaultModel> = null;
  
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
   * Render the application using UcpRouter
   * Called from once.html after kernel boot
   * 
   * @param container - DOM element to render into
   * @pdca 2025-12-09-UTC-1800.ucpview-framework-independence.pdca.md Phase H.0
   */
  async appRender(container: Element): Promise<void> {
    console.log('[Orchestrator] appRender() starting...');
    this.container = container;
    
    // 1. Preload CSS assets
    await this.assetsPreload();
    
    // 2. Import view components (including UcpRouter)
    await this.viewsImport();
    
    // 3. Fetch server model BEFORE creating router (Layer 4 async operation)
    // This ensures ServerDefaultModel is available when router creates once-peer-default-view
    await this.serverModelFetch();
    
    // 4. Create UcpRouter as main view
    console.log('[Orchestrator] Creating UcpRouter...');
    await import('../layer5/views/UcpRouter.js');
    this.router = document.createElement('ucp-router') as UcpRouter;
    (this.router as any).kernel = this.component;
    // Pass browserModel as default, but router will use serverModel for once-peer-default-view
    (this.router as any).model = this.component.browserModel;
    // Store serverModel reference in router for use when creating once-peer-default-view
    (this.router as any).serverModel = this.serverModel;
    container.appendChild(this.router);
    this.mainView = this.router;
    
    // 5. Register routes
    await this.routesRegister();
    
    // 6. Navigate to current URL
    const currentPath = window.location.pathname;
    console.log(`[Orchestrator] Navigating to: ${currentPath}`);
    (this.router as any).navigateTo(currentPath, true);  // replace=true to not add history entry
    
    // 7. Listen for action events from views
    // ✅ Web4: Layer 4 handles async, Layer 5 dispatches events
    this.router.addEventListener('action-request', this.actionRequestHandle.bind(this) as unknown as EventListener);
    
    // 8. Connect WebSocket for real-time updates
    this.webSocketConnect();
    
    // 9. Initial data fetch (for peers list)
    await this.serversFetch();
    
    // 10. Register Service Worker for PWA
    // @pdca 2025-12-12-UTC-1230.pwa-offline-unit-cache.pdca.md
    this.serviceWorkerRegister();  // Fire and forget - don't await
    
    console.log('[Orchestrator] appRender() complete');
  }
  
  /**
   * Register routes with UcpRouter
   * Maps URL paths to Lit view components
   * 
   * @pdca 2025-12-09-UTC-1800.ucpview-framework-independence.pdca.md Phase H.0
   */
  async routesRegister(): Promise<void> {
    if (!this.router) {
      console.error('[Orchestrator] Router not initialized');
      return;
    }
    
    console.log('[Orchestrator] Registering routes...');
    
    // Main dashboard - shows server status page (regression to 0.3.21.5)
    await (this.router as any).routeRegister('/', 'once-peer-default-view', { 
      title: 'ONCE Server Status' 
    });
    
    // Demo route - peer grid overview
    await (this.router as any).routeRegister('/demo', 'once-over-view', { 
      title: 'ONCE Peer Overview' 
    });
    
    // Communication log - P2P message viewer
    // @pdca 2025-12-12-UTC-1055.spa-route-registration-extension.pdca.md RO.EXT.1
    await (this.router as any).routeRegister('/onceCommunicationLog', 'once-logger-view', { 
      title: 'Communication Log' 
    });
    
    // Server status - detailed metrics
    // @pdca 2025-12-12-UTC-1055.spa-route-registration-extension.pdca.md RO.EXT.2
    await (this.router as any).routeRegister('/server-status', 'once-server-status-view', { 
      title: 'Server Status' 
    });
    
    // Peer details - single peer view with UUID param
    // @pdca 2025-12-12-UTC-1055.spa-route-registration-extension.pdca.md RO.EXT.3
    await (this.router as any).routeRegister('/peer/:uuid', 'once-peer-details-view', { 
      title: 'Peer Details' 
    });
    
    // File browser - folder overview for browsing EAMD.ucp file system
    // @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md R.1
    // viewProps are passed to the view element as properties
    await (this.router as any).routeRegister('/EAMD.ucp', 'folder-over-view', { 
      title: 'File Browser',
      viewProps: {
        rootPath: '/EAMD.ucp',  // Navigation boundary - cannot navigate above
        cwd: `/EAMD.ucp/components/ONCE/${this.component.browserModel.version || '0.3.22.1'}/src/assets`  // Initial folder
      }
    });
    
    console.log('[Orchestrator] ✅ Routes registered');
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ASSET LOADING (async)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Preload CSS assets from component.json units or fallback to /asset-manifest
   * Phase F: Unit Integration - assets tracked in component.json
   * @pdca 2025-11-19-UTC-1800.iteration-tracking.pdca.md Phase F
   */
  private async assetsPreload(): Promise<void> {
    console.log('[Orchestrator] Preloading assets...');
    
    try {
      let cssFiles: string[] = [];
      const version = this.component.browserModel.version || '0.3.21.9';
      const basePath = `/EAMD.ucp/components/ONCE/${version}`;
      
      // Try component.json first (Web4 Unit integration)
      try {
        const componentResponse = await fetch(`${basePath}/ONCE.component.json`);
        if (componentResponse.ok) {
          const componentJson = await componentResponse.json();
          const cssUnits = componentJson.model?.units?.css || [];
          cssFiles = cssUnits.map((unit: { path: string }) => `${basePath}/${unit.path}`);
          console.log(`[Orchestrator] Using component.json units: ${cssFiles.length} CSS files`);
        }
      } catch (e) {
        console.log('[Orchestrator] component.json not available, trying asset-manifest');
      }
      
      // Fallback to /asset-manifest
      if (cssFiles.length === 0) {
        const response = await fetch('/asset-manifest');
        const data = await response.json();
        cssFiles = data.model?.css || data.css || [];
        console.log(`[Orchestrator] Using asset-manifest: ${cssFiles.length} CSS files`);
      }
      
      if (cssFiles.length === 0) {
        console.warn('[Orchestrator] No CSS files found');
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
    await import(`${basePath}/OncePeerDefaultView.js`);
    // Route view components - @pdca 2025-12-11-UTC-1530.route-overview-migration.pdca.md Phase RO.6
    await import(`${basePath}/RouteItemView.js`);
    await import(`${basePath}/RouteOverView.js`);
    // SPA extension views - @pdca 2025-12-12-UTC-1055.spa-route-registration-extension.pdca.md
    await import(`${basePath}/OnceLoggerView.js`);
    await import(`${basePath}/OnceServerStatusView.js`);
    await import(`${basePath}/OncePeerDetailsView.js`);
    // File browser views - @pdca 2025-12-16-UTC-1130.e2e-folder-image-drop-test.pdca.md F.1
    await import(`${basePath}/FolderOverView.js`);
    await import(`${basePath}/FolderItemView.js`);
    await import(`${basePath}/FileItemView.js`);
    await import(`${basePath}/ImageDefaultView.js`);
    
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
    const wsUrl = `wss://${host}`;
    
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
   * Fetch primary server model for main route (once-peer-default-view)
   * ✅ Web4 P7: Layer 4 handles async operations
   * Called BEFORE creating router to ensure ServerDefaultModel is available
   */
  async serverModelFetch(): Promise<void> {
    try {
      // Determine endpoint (primary or local)
      const peerHost = this.component.browserModel.peerHost || window.location.host;
      let endpoint = `https://${peerHost}/servers`;
      
      const primaryPeer = this.component.browserModel.primaryPeer;
      if (primaryPeer) {
        endpoint = `https://${primaryPeer.host}:${primaryPeer.port}/servers`;
      }
      
      console.log('[Orchestrator] Fetching server model from:', endpoint);
      console.log('[Orchestrator] peerHost:', peerHost);
      console.log('[Orchestrator] primaryPeer:', primaryPeer);
      
      const response = await fetch(endpoint);
      console.log('[Orchestrator] Fetch response status:', response.status, response.statusText);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const servers = data.model?.servers || data.servers || [];
      
      // Check if primaryServer is returned separately in response
      let primaryServerModel: ONCEServerModel | null = null;
      
      if (data.model?.primaryServer) {
        // Primary server returned separately
        primaryServerModel = data.model.primaryServer;
      } else {
        // Find primary server in servers array (isPrimaryServer: true)
        const primaryServer = servers.find(function(server: any) {
          const serverModel = server.model || server;
          return serverModel.isPrimaryServer === true;
        });
        
        if (primaryServer) {
          primaryServerModel = primaryServer.model || primaryServer;
        }
      }
      
      if (!primaryServerModel) {
        console.error('[Orchestrator] ❌ CRITICAL: No primary server found in /servers response');
        console.error('[Orchestrator] Response data:', JSON.stringify(data, null, 2));
        console.error('[Orchestrator] Servers array:', servers);
        throw new Error('[Orchestrator] No primary server found in /servers response - cannot render server status');
      }
      
      // Map ONCEServerModel to ServerDefaultModel
      this.serverModel = this.mapToServerDefaultModel(primaryServerModel, servers.length);
      
      console.log('[Orchestrator] Server model fetched:', this.serverModel);
      console.log('[Orchestrator] Server UUID:', this.serverModel.uuid);
      
    } catch (error) {
      console.error('[Orchestrator] ❌ CRITICAL: serverModelFetch failed:', error);
      console.error('[Orchestrator] Error stack:', (error as Error).stack);
      // ⚠️ CRITICAL: If serverModel fetch fails, once-peer-default-view will fall back to browserModel
      // This means Identity section will show browser client UUID instead of server UUID
      // Set serverModel to null explicitly so router knows it's missing
      this.serverModel = null;
      // Don't throw - allow page to load with browserModel as fallback
      // This is a graceful degradation, but should be fixed
      console.warn('[Orchestrator] ⚠️ Page will load with browserModel - Identity section will show browser UUID');
    }
  }
  
  /**
   * Map ONCEServerModel to ServerDefaultModel
   * ✅ Web4 P4: No arrow functions - uses method binding
   */
  private mapToServerDefaultModel(onceModel: ONCEServerModel, peerCount: number): ServerDefaultModel {
    // Map capabilities format: ONCEServerModel.capabilities already has { capability: string, port: number }
    // ServerDefaultModel expects same format, so we can use directly
    const capabilities = (onceModel.capabilities || []).map(function(cap: any) {
      // Ensure capability field exists (should already be there from ONCEServerModel)
      return {
        capability: cap.capability || 'httpPort',
        port: cap.port
      };
    });
    
    // Get peerHost from HTTP capability
    const httpCap = capabilities.find(function(c: any) {
      return c.capability === 'httpPort';
    });
    const peerHost = httpCap ? `${onceModel.hostname || onceModel.host || 'localhost'}:${httpCap.port}` : window.location.host;
    
    // Map state string to LifecycleState enum
    // Server returns "running", "stopped", etc. as strings
    let lifecycleState = LifecycleState.STOPPED;
    if (onceModel.state) {
      const stateStr = onceModel.state.toLowerCase();
      // Map common state strings to enum values
      if (stateStr === 'running') {
        lifecycleState = LifecycleState.RUNNING;
      } else if (stateStr === 'stopped') {
        lifecycleState = LifecycleState.STOPPED;
      } else if (stateStr === 'starting') {
        lifecycleState = LifecycleState.STARTING;
      } else if (stateStr === 'stopping') {
        lifecycleState = LifecycleState.STOPPING;
      } else {
        // Try to match enum value directly
        lifecycleState = (onceModel.state as any) as LifecycleState || LifecycleState.STOPPED;
      }
    }
    
    console.log('[Orchestrator] Mapping server model:', {
      uuid: onceModel.uuid,
      state: onceModel.state,
      lifecycleState: lifecycleState,
      capabilitiesCount: capabilities.length,
      capabilities: capabilities
    });
    
    return {
      uuid: onceModel.uuid,
      name: 'ONCE Server',
      version: this.component.browserModel.version || '0.3.21.9',
      hostname: onceModel.hostname || onceModel.host || 'localhost',
      domain: onceModel.domain || 'local.once',
      lifecycleState: lifecycleState,
      isPrimaryServer: onceModel.isPrimaryServer || false,
      capabilities: capabilities,
      peerCount: peerCount,
      peerHost: peerHost
    };
  }
  
  /**
   * Fetch servers list and update model
   */
  async serversFetch(): Promise<void> {
    try {
      // Determine endpoint (primary or local)
      const peerHost = this.component.browserModel.peerHost || window.location.host;
      let endpoint = `https://${peerHost}/servers`;
      
      const primaryPeer = this.component.browserModel.primaryPeer;
      if (primaryPeer) {
        endpoint = `https://${primaryPeer.host}:${primaryPeer.port}/servers`;
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
      ? `https://${host}:${port}/ONCE/${version}/${uuid}/${method}`
      : `https://${host}:${port}/${method}`;
    
    // Debug log for test capture
    console.log(`[Orchestrator] iorCall URL: ${url}`);
    
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
      const response = await fetch(`https://${peerHost}/health`);
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
        window.open(`https://${host}:${port}/health`, '_blank');
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
  
  // ═══════════════════════════════════════════════════════════════
  // PWA & SERVICE WORKER
  // @pdca 2025-12-12-UTC-1230.pwa-offline-unit-cache.pdca.md
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Register Service Worker for PWA functionality
   * 
   * The SW is self-registering (OnceServiceWorker.ts),
   * this method just tells the browser where to find it.
   * 
   * @pdca 2025-12-12-UTC-1230.pwa-offline-unit-cache.pdca.md
   */
  async serviceWorkerRegister(): Promise<ServiceWorkerRegistration | null> {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.warn('[Orchestrator] Service Workers not supported');
      return null;
    }
    
    try {
      // Register the SW at /sw.js (served by ServiceWorkerRoute)
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('[Orchestrator] ✅ Service Worker registered:', registration.scope);
      
      // Listen for updates
      registration.addEventListener('updatefound', this.swUpdateHandle.bind(this, registration));
      
      return registration;
    } catch (error) {
      // SW registration failure - needs proper bundling
      // @pdca 2025-12-12-UTC-1730.service-worker-fix.pdca.md
      console.error('[Orchestrator] ❌ Service Worker registration failed:', error);
      return null;
    }
  }
  
  /**
   * Handle SW update found
   */
  private swUpdateHandle(registration: ServiceWorkerRegistration): void {
    const newWorker = registration.installing;
    if (!newWorker) {
      return;
    }
    
    console.log('[Orchestrator] 📦 New Service Worker installing...');
    
    newWorker.addEventListener('statechange', this.swStateChangeHandle.bind(this, newWorker, registration));
  }
  
  /**
   * Handle SW state change
   */
  private swStateChangeHandle(worker: ServiceWorker, registration: ServiceWorkerRegistration): void {
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      // New SW is waiting - offer update to user
      console.log('[Orchestrator] 📦 New Service Worker waiting. Call swUpdate() to activate.');
      
      // Could dispatch an event for UI to show "Update available" prompt
      this.container?.dispatchEvent(new CustomEvent('sw-update-available', {
        bubbles: true,
        detail: { registration }
      }));
    }
  }
  
  /**
   * Force update to new waiting Service Worker
   */
  async swUpdate(): Promise<void> {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration?.waiting) {
      console.log('[Orchestrator] No waiting Service Worker');
      return;
    }
    
    // Tell SW to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload page to use new SW
    window.location.reload();
  }
  
  /**
   * Get Service Worker status
   */
  async swStatusGet(): Promise<object> {
    if (!('serviceWorker' in navigator)) {
      return { supported: false };
    }
    
    const registration = await navigator.serviceWorker.getRegistration();
    
    return {
      supported: true,
      registered: !!registration,
      scope: registration?.scope || null,
      active: !!registration?.active,
      waiting: !!registration?.waiting,
      installing: !!registration?.installing
    };
  }
  
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

