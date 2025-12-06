/**
 * UcpRouter - Web4 SPA Router Component
 * 
 * Custom router following Web4 principles:
 * - No external dependencies (except Lit)
 * - Full control over routing logic  
 * - Server-side route integration
 * - NO arrow functions
 * - Layer 5: SYNC view logic only
 * 
 * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
 */

import { LitElement, html, TemplateResult, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import type { Reference } from '../../layer3/Reference.interface.js';
import type { RouteConfig } from './RouteConfig.interface.js';
import type { RouteParams } from './RouteParams.interface.js';

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
  
  /** Current route params */
  @state() private currentParams: RouteParams | null = null;
  
  /** Registered routes */
  private routes: Map<string, RouteConfig> = new Map();
  
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
   * Register a route
   * 
   * @param pattern URL pattern (e.g., '/', '/peer/:uuid')
   * @param viewTag Custom element tag name (e.g., 'once-over-view')
   * @param options Additional route options
   */
  routeRegister(pattern: string, viewTag: string, options?: Partial<Omit<RouteConfig, 'pattern' | 'viewTag'>>): void {
    const config: RouteConfig = {
      pattern,
      viewTag,
      ...options
    };
    this.routes.set(pattern, config);
    console.log(`[UcpRouter] Registered route: ${pattern} → <${viewTag}>`);
  }
  
  /**
   * Unregister a route
   */
  routeUnregister(pattern: string): void {
    this.routes.delete(pattern);
  }
  
  /**
   * Get all registered routes
   */
  routesGet(): Map<string, RouteConfig> {
    return new Map(this.routes);
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
  navigateTo(path: string, replace: boolean = false): void {
    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    this.routeResolve(path);
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
  private routeChangeHandle(event: PopStateEvent): void {
    this.routeResolve(window.location.pathname);
  }
  
  /**
   * Resolve path to a view
   */
  private routeResolve(path: string): void {
    console.log(`[UcpRouter] Resolving: ${path}`);
    this.currentRoute = path;
    
    // Try exact match first
    let config = this.routes.get(path);
    let params: Record<string, string> = {};
    
    // Try pattern matching if no exact match
    if (!config) {
      for (const [pattern, routeConfig] of this.routes) {
        const match = this.patternMatch(pattern, path);
        if (match) {
          config = routeConfig;
          params = match;
          break;
        }
      }
    }
    
    if (config) {
      // Store route params
      this.currentParams = {
        path,
        params,
        query: new URLSearchParams(window.location.search)
      };
      
      // Update page title if specified
      if (config.title) {
        document.title = config.title;
      }
      
      // Create view element
      this.viewCreate(config);
      
      // Notify server if configured
      if (config.serverRoute) {
        this.serverRouteNotify(path);
      }
    } else {
      // 404 - no matching route
      console.warn(`[UcpRouter] 404 - No route for: ${path}`);
      this.currentView = null;
      this.currentParams = null;
    }
    
    this.requestUpdate();
  }
  
  /**
   * Match URL path against pattern with :segments
   */
  private patternMatch(pattern: string, path: string): Record<string, string> | null {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    
    if (patternParts.length !== pathParts.length) {
      return null;
    }
    
    const params: Record<string, string> = {};
    
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];
      
      if (patternPart.startsWith(':')) {
        // Dynamic segment - extract parameter
        params[patternPart.slice(1)] = pathPart;
      } else if (patternPart !== pathPart) {
        // Static segment doesn't match
        return null;
      }
    }
    
    return params;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // VIEW MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Create view element for route config
   */
  private viewCreate(config: RouteConfig): void {
    // Create the view element
    const view = document.createElement(config.viewTag);
    
    // Set model if available
    if (this.model) {
      (view as any).model = this.model;
    }
    
    // Set kernel if available
    if (this.kernel) {
      (view as any).kernel = this.kernel;
    }
    
    // Set route params
    (view as any).routeParams = this.currentParams;
    
    // Set additional model props if specified
    if (config.modelProps) {
      Object.entries(config.modelProps).forEach(
        this.viewPropSet.bind(this, view)
      );
    }
    
    this.currentView = view;
    console.log(`[UcpRouter] Created view: <${config.viewTag}>`);
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
   */
  private serverRouteNotify(path: string): void {
    // Dispatch event for orchestrator to handle
    this.dispatchEvent(new CustomEvent('route-change', {
      bubbles: true,
      composed: true,
      detail: {
        path,
        params: this.currentParams
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
export type { RouteConfig } from './RouteConfig.interface.js';
export type { RouteParams } from './RouteParams.interface.js';

