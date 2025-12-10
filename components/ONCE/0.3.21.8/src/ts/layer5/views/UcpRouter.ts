/**
 * UcpRouter - Web4 SPA Router Component
 * 
 * Custom router following Web4 principles:
 * - No external dependencies (except Lit)
 * - Full control over routing logic  
 * - Server-side route integration
 * - NO arrow functions
 * - Layer 5: SYNC view logic only
 * - ✅ Web4 P1: Routes are Scenarios
 * 
 * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
 */

import { LitElement, html, TemplateResult, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import type { Reference } from '../../layer3/Reference.interface.js';
import type { RouteScenario, RouteModel } from '../../layer3/RouteScenario.interface.js';
import { Route } from '../../layer3/Route.js';
import { LifecycleState } from '../../layer3/LifecycleState.enum.js';

/**
 * UcpRouter - Web4 compliant SPA router
 * 
 * Usage:
 * ```html
 * <ucp-router>
 *   <!-- Routes registered via routeRegister() -->
 * </ucp-router>
 * ```
 * 
 * Or programmatically:
 * ```typescript
 * const router = document.createElement('ucp-router') as UcpRouter;
 * router.routeRegister('/', 'once-over-view', { title: 'Dashboard' });
 * router.routeRegister('/peer/:uuid', 'once-peer-detail-view');
 * ```
 */
@customElement('ucp-router')
export class UcpRouter extends LitElement {
  
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    
    .router-outlet {
      width: 100%;
      height: 100%;
    }
    
    .not-found {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #ff6b6b;
      font-size: 1.5rem;
    }
    
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #aaa;
    }
  `;
  
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════
  
  /** Current route path */
  @state() private currentRoute: string = '/';
  
  /** Currently rendered view element */
  @state() private currentView: Reference<HTMLElement> = null;
  
  /** Current active route - ✅ Web4 P26: Route class not factory */
  @state() private activeRoute: Reference<Route> = null;
  
  /** Registered routes - ✅ Web4 P1: Routes are Scenarios, P26: Classes */
  private routes: Map<string, Route> = new Map();
  
  /** Kernel reference for model/server integration */
  @property({ attribute: false }) kernel: Reference<any> = null;
  
  /** Model to pass to views */
  @property({ attribute: false }) model: Reference<any> = null;
  
  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════
  
  connectedCallback(): void {
    super.connectedCallback();
    // ✅ Web4: Bound methods, not arrow functions
    window.addEventListener('popstate', this.routeChangeHandle.bind(this));
    // Initial route resolution
    this.routeResolve(window.location.pathname);
  }
  
  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.routeChangeHandle.bind(this));
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ROUTE REGISTRATION
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Register a route - async because Route.init() is async
   * ✅ Web4 P1: Routes are Scenarios
   * ✅ Web4 P26: No Factory Functions - uses new Route().init()
   * 
   * @param pattern URL pattern (e.g., '/', '/peer/:uuid')
   * @param viewTag Custom element tag name (e.g., 'once-over-view')
   * @param options Additional route options
   */
  async routeRegister(pattern: string, viewTag: string, options?: Partial<RouteModel>): Promise<Route> {
    const route = await new Route().init({
      model: { pattern, viewTag, ...options }
    });
    this.routes.set(pattern, route);
    console.log(`[UcpRouter] Registered route: ${pattern} → <${viewTag}>`);
    return route;
  }
  
  /**
   * Register an existing Route instance
   * ✅ Web4 P26: Route is a class
   */
  routeInstanceRegister(route: Route): void {
    this.routes.set(route.pattern, route);
    console.log(`[UcpRouter] Registered route: ${route.pattern} → <${route.viewTag}>`);
  }
  
  /**
   * Unregister a route
   */
  routeUnregister(pattern: string): void {
    this.routes.delete(pattern);
  }
  
  /**
   * Get all registered routes
   * ✅ Web4 P26: Returns Route classes
   */
  routesGet(): Map<string, Route> {
    return new Map(this.routes);
  }
  
  /**
   * Get the currently active route
   */
  activeRouteGet(): Reference<Route> {
    return this.activeRoute;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Navigate to a path
   * 
   * @param path URL path to navigate to
   * @param replace If true, replaces current history entry
   */
  async navigateTo(path: string, replace: boolean = false): Promise<void> {
    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    await this.routeResolve(path);
  }
  
  /**
   * Navigate back in history
   */
  navigateBack(): void {
    window.history.back();
  }
  
  /**
   * Navigate forward in history
   */
  navigateForward(): void {
    window.history.forward();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ROUTE RESOLUTION
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Handle browser back/forward navigation
   */
  private async routeChangeHandle(event: PopStateEvent): Promise<void> {
    await this.routeResolve(window.location.pathname);
  }
  
  /**
   * Resolve path to a view
   * ✅ Web4 P26: Works with Route class
   */
  private async routeResolve(path: string): Promise<void> {
    console.log(`[UcpRouter] Resolving: ${path}`);
    this.currentRoute = path;
    
    // Deactivate previous route
    if (this.activeRoute) {
      this.activeRoute.deactivate();
    }
    
    // Try exact match first
    let route = this.routes.get(path);
    let params: Record<string, string> = {};
    
    // Try pattern matching if no exact match
    if (!route) {
      for (const [pattern, routeInstance] of this.routes) {
        const match = routeInstance.pathMatch(path);
        if (match) {
          route = routeInstance;
          params = match;
          break;
        }
      }
    }
    
    if (route) {
      // Activate route with path and params
      const query = this.queryParamsToObject(window.location.search);
      route.activate(path, params, query);
      
      // Store active route
      this.activeRoute = route;
      
      // Update page title if specified
      if (route.title) {
        document.title = route.title;
      }
      
      // Create view element (async - waits for server model fetch if needed)
      await this.viewCreate(route);
      
      // Notify server if configured
      if (route.serverRoute) {
        this.serverRouteNotify(path);
      }
    } else {
      // 404 - no matching route
      console.warn(`[UcpRouter] 404 - No route for: ${path}`);
      this.currentView = null;
      this.activeRoute = null;
    }
    
    this.requestUpdate();
  }
  
  /**
   * Convert query string to object
   */
  private queryParamsToObject(search: string): Record<string, string> {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    params.forEach(this.queryParamAdd.bind(this, result));
    return result;
  }
  
  /**
   * Add query param to result object (Web4: no arrow functions)
   */
  private queryParamAdd(result: Record<string, string>, value: string, key: string): void {
    result[key] = value;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // NOTE: Pattern matching moved to Route.pathMatch() (Web4 P26)
  // ═══════════════════════════════════════════════════════════════
  // VIEW MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create view element for route
   * ✅ Web4 P26: Works with Route class
   * @pdca 2025-12-10-UTC-1202.main-route-0.3.21.5-regression.pdca.md
   */
  private async viewCreate(route: Route): Promise<void> {
    // Create the view element
    const view = document.createElement(route.viewTag);
    
    // Set kernel if available
    if (this.kernel) {
      (view as any).kernel = this.kernel;
    }
    
    // Set route reference (Web4 P26: pass the Route class instance)
    (view as any).route = route;
    
    // Set additional view props if specified
    if (route.viewProps) {
      Object.entries(route.viewProps).forEach(
        this.viewPropSet.bind(this, view)
      );
    }
    
    // ✅ FIX: Fetch server model for once-peer-default-view BEFORE setting currentView
    // This view needs ServerDefaultModel, not BrowserOnceModel
    // Wait for async fetch to complete so model is set before rendering
    if (route.viewTag === 'once-peer-default-view' && this.kernel) {
      await this.serverModelFetch(view);
    } else if (this.model) {
      // Set model for other views
      (view as any).model = this.model;
    }
    
    this.currentView = view;
    console.log(`[UcpRouter] Created view: <${route.viewTag}>`);
  }
  
  /**
   * Fetch server model for OncePeerDefaultView
   * Fetches server status via /servers endpoint and uses primaryServer model
   * @pdca 2025-12-10-UTC-1202.main-route-0.3.21.5-regression.pdca.md
   */
  private async serverModelFetch(view: HTMLElement): Promise<void> {
    try {
      const peerHost = (this.kernel as any)?.browserModel?.peerHost || window.location.host;
      const response = await fetch(`http://${peerHost}/servers`);
      
      if (!response.ok) {
        console.warn(`[UcpRouter] Servers fetch failed: ${response.status}`);
        return;
      }
      
      const serversData = await response.json();
      const serversModel = serversData.model || serversData;
      
      // Use primaryServer from /servers response
      const primaryServer = serversModel.primaryServer;
      if (!primaryServer) {
        console.warn('[UcpRouter] No primaryServer in /servers response');
        return;
      }
      
      // Extract server data from primaryServer model
      const httpCap = primaryServer.capabilities?.find(function(c: any) {
        return c.capability === 'httpPort';
      });
      const wsCap = primaryServer.capabilities?.find(function(c: any) {
        return c.capability === 'wsPort';
      });
      const port = httpCap?.port || wsCap?.port || 42777;
      const hostname = primaryServer.hostname || primaryServer.host || window.location.hostname;
      const peerHostFull = `${hostname}:${port}`;
      
      // Map lifecycle state string to enum
      let lifecycleState = LifecycleState.RUNNING;
      const stateStr = primaryServer.state || 'running';
      if (stateStr === 'stopped') lifecycleState = LifecycleState.STOPPED;
      else if (stateStr === 'stopping') lifecycleState = LifecycleState.STOPPING;
      else if (stateStr === 'starting') lifecycleState = LifecycleState.STARTING;
      else if (stateStr === 'shutdown') lifecycleState = LifecycleState.SHUTDOWN;
      
      // Get peer count from servers array
      const servers = serversModel.servers || [];
      const peerCount = servers.length;
      
      // Build ServerDefaultModel matching serveDefaultView() format
      const serverModel = {
        uuid: primaryServer.uuid || 'unknown',
        name: 'ONCE Server',
        version: (this.kernel as any)?.browserModel?.version || '0.3.21.8',
        hostname: hostname,
        domain: primaryServer.domain || 'local.once',
        lifecycleState: lifecycleState,
        isPrimaryServer: primaryServer.isPrimaryServer || serversModel.primary || false,
        capabilities: primaryServer.capabilities || [],
        peerCount: peerCount,
        peerHost: peerHostFull
      };
      
      // Set model on view
      (view as any).model = serverModel;
      
      // Request update to re-render with new model
      if ((view as any).requestUpdate) {
        (view as any).requestUpdate();
      }
      
      console.log('[UcpRouter] ✅ Server model fetched from /servers and set on once-peer-default-view');
      
    } catch (error) {
      console.error('[UcpRouter] ❌ Failed to fetch server model:', error);
    }
  }
  
  /**
   * Set a property on view element
   */
  private viewPropSet(view: HTMLElement, entry: [string, any]): void {
    const [key, value] = entry;
    (view as any)[key] = value;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // SERVER INTEGRATION
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Notify server of route change (for SSR/analytics)
   * ✅ Web4 P26: Sends Route instance in event
   */
  private serverRouteNotify(path: string): void {
    // Dispatch event for orchestrator to handle
    this.dispatchEvent(new CustomEvent('route-change', {
      bubbles: true,
      composed: true,
      detail: {
        path,
        route: this.activeRoute,
        scenario: this.activeRoute?.toScenario()
      }
    }));
  }
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  
  render(): TemplateResult {
    if (this.currentView) {
      return html`
        <div class="router-outlet">
          ${this.currentView}
        </div>
      `;
    }
    
    // 404 fallback
    return html`
      <div class="not-found">
        404 - Route not found: ${this.currentRoute}
      </div>
    `;
  }
}

// Export for use by other modules
// ✅ Web4 P1: Routes are Scenarios
// ✅ Web4 P26: Route is a class (not factory)
export type { RouteScenario, RouteModel } from '../../layer3/RouteScenario.interface.js';
export { Route } from '../../layer3/Route.js';

