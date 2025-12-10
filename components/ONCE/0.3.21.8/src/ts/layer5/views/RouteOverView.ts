/**
 * RouteOverView.ts - Dynamic routes overview
 * 
 * Displays all available endpoints/routes for the ONCE server.
 * Fetches routes dynamically from the server.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P16: TypeScript accessors
 * - P19: CSS in separate file (or inline critical)
 * - P27: Web Components ARE Radical OOP
 * 
 * @ior ior:esm:/ONCE/{version}/RouteOverView
 * @pdca 2025-11-19-UTC-1800.iteration-tracking.pdca.md
 */

import { html, TemplateResult, css, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UcpView } from './UcpView.js';

/**
 * RouteInfo - Information about a route
 */
export interface RouteInfo {
  pattern: string;
  method: string;
  description?: string;
  category?: string;
}

/**
 * RoutesModel - Model for routes overview
 */
export interface RoutesModel {
  routes: RouteInfo[];
  serverHost: string;
}

/**
 * RouteOverView
 * 
 * Collection view displaying all available routes/endpoints.
 * Fetches routes from server and categorizes them.
 */
@customElement('route-over-view')
export class RouteOverView extends UcpView<RoutesModel> {
  
  /** CSS path - external CSS for Web4 P19 */
  static cssPath = 'RouteOverView.css';
  
  /** Peer host for constructing URLs */
  @property({ type: String })
  peerHost: string = 'localhost:42777';
  
  /** Fetched routes */
  @state()
  private routesList: RouteInfo[] = [];
  
  /** Loading state */
  @state()
  private loading: boolean = true;
  
  /** Error state */
  @state()
  private error: string = '';
  
  /** Inline critical styles */
  static styles: CSSResultGroup = css`
    :host {
      display: block;
    }
    
    .routes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    
    .route-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 1rem;
      transition: all 0.2s ease;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    
    .route-card:hover {
      background: rgba(0, 255, 136, 0.05);
      border-color: rgba(0, 255, 136, 0.3);
      transform: translateY(-2px);
    }
    
    .route-method {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 3px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-right: 0.5rem;
    }
    
    .method-get {
      background: rgba(0, 200, 100, 0.2);
      color: #00c864;
    }
    
    .method-post {
      background: rgba(0, 136, 255, 0.2);
      color: #0088ff;
    }
    
    .method-put {
      background: rgba(255, 170, 0, 0.2);
      color: #ffaa00;
    }
    
    .method-delete {
      background: rgba(255, 68, 68, 0.2);
      color: #ff4444;
    }
    
    .route-pattern {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.95rem;
      color: #e0e0e0;
    }
    
    .route-description {
      font-size: 0.8rem;
      color: #888;
      margin-top: 0.5rem;
    }
    
    .category-section {
      margin-bottom: 1.5rem;
    }
    
    .category-title {
      font-size: 0.85rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .loading {
      color: #888;
      padding: 2rem;
      text-align: center;
    }
    
    .error {
      color: #ff4444;
      padding: 1rem;
      background: rgba(255, 68, 68, 0.1);
      border-radius: 4px;
    }
  `;
  
  // ═══════════════════════════════════════════════════════════════
  // Lifecycle
  // ═══════════════════════════════════════════════════════════════
  
  connectedCallback(): void {
    super.connectedCallback();
    this.routesFetch();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Data Fetching - SYNC Layer 5: Dispatch event
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Fetch routes from server
   * Note: In Layer 5, we dispatch an event for the orchestrator to handle
   * For simplicity, we use a minimal fetch here (can be moved to orchestrator)
   */
  private async routesFetch(): Promise<void> {
    this.loading = true;
    this.error = '';
    
    try {
      // Parse available routes from error response (clever hack!)
      const response = await fetch(`http://${this.peerHost}/ONCE/0.3.21.8/invalid-uuid/invalid-method`);
      const data = await response.json();
      
      if (data.availableRoutes) {
        this.routesList = this.parseRoutes(data.availableRoutes);
      }
    } catch (err: any) {
      this.error = `Failed to fetch routes: ${err.message}`;
    } finally {
      this.loading = false;
    }
  }
  
  /**
   * Parse routes from server response
   */
  private parseRoutes(routeStrings: string[]): RouteInfo[] {
    // ✅ Web4 P4: Method reference instead of arrow function
    return routeStrings.map(this.parseRouteString.bind(this));
  }
  
  /**
   * Parse a single route string like "/{component}/{version}/{uuid}/{method}:GET"
   */
  private parseRouteString(routeStr: string): RouteInfo {
    const [pattern, method] = routeStr.split(':');
    return {
      pattern: pattern || routeStr,
      method: method || 'GET',
      category: this.categorizeRoute(pattern || routeStr),
      description: this.describeRoute(pattern || routeStr)
    };
  }
  
  /**
   * Categorize route by pattern
   */
  private categorizeRoute(pattern: string): string {
    if (pattern.includes('{Component}') || pattern.includes('{component}')) {
      return 'Dynamic';
    }
    if (pattern.includes('EAMD.ucp')) {
      return 'Static Files';
    }
    if (['/health', '/servers', '/asset-manifest'].includes(pattern)) {
      return 'API';
    }
    if (['/', '/demo', '/demo/', '/demo-lit', '/demo-legacy', '/app', '/once', '/once/'].includes(pattern)) {
      return 'Pages';
    }
    return 'Other';
  }
  
  /**
   * Generate description for route
   */
  private describeRoute(pattern: string): string {
    const descriptions: Record<string, string> = {
      '/': 'Server status and overview',
      '/demo': 'Demo hub with peer management',
      '/demo/': 'Demo hub with peer management',
      '/demo-lit': 'Lit MVC demo interface',
      '/demo-legacy': 'Legacy demo hub',
      '/app': 'ONCE SPA entry point',
      '/once': 'Minimal ONCE view',
      '/once/': 'Minimal ONCE view',
      '/health': 'Server health status (JSON)',
      '/servers': 'List of connected peers (JSON)',
      '/asset-manifest': 'CSS/template manifest (JSON)',
      '/onceCommunicationLog': 'Communication log view',
      '/onceCommunicationLog/': 'Communication log view',
      '/{Component}/{version}/(src|dist)/**': 'Static file serving',
      '/{component}/{version}/{uuid}/{method}': 'IOR method invocation'
    };
    return descriptions[pattern] || '';
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════
  
  render(): TemplateResult {
    if (this.loading) {
      return html`<div class="loading">Loading routes...</div>`;
    }
    
    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }
    
    return this.routesByCategoryRender();
  }
  
  /**
   * Render routes grouped by category
   * ✅ Web4 P4: Uses helper method instead of arrow function
   */
  private routesByCategoryRender(): TemplateResult {
    const categories = this.routesGroupByCategory();
    const categoryOrder = ['Pages', 'API', 'Dynamic', 'Static Files', 'Other'];
    const sections: TemplateResult[] = [];
    
    for (const category of categoryOrder) {
      const routes = categories.get(category) || [];
      if (routes.length > 0) {
        sections.push(this.categorySectionRender(category, routes));
      }
    }
    
    return html`${sections}`;
  }
  
  /**
   * Group routes by category
   */
  private routesGroupByCategory(): Map<string, RouteInfo[]> {
    const groups = new Map<string, RouteInfo[]>();
    
    for (const route of this.routesList) {
      const category = route.category || 'Other';
      const existing = groups.get(category) || [];
      existing.push(route);
      groups.set(category, existing);
    }
    
    return groups;
  }
  
  /**
   * Render a category section
   */
  /**
   * Render a category section
   * ✅ Web4 P4: Method reference instead of arrow function
   */
  private categorySectionRender(category: string, routes: RouteInfo[]): TemplateResult {
    return html`
      <div class="category-section">
        <div class="category-title">${category}</div>
        <div class="routes-grid">
          ${routes.map(this.routeCardRender.bind(this))}
        </div>
      </div>
    `;
  }
  
  /**
   * Render a single route card
   */
  private routeCardRender(route: RouteInfo): TemplateResult {
    const href = this.routeHrefBuild(route);
    const isNavigable = !route.pattern.includes('{');
    
    if (isNavigable) {
      return html`
        <a class="route-card" href="${href}" target="_blank">
          <span class="route-method method-${route.method.toLowerCase()}">${route.method}</span>
          <span class="route-pattern">${route.pattern}</span>
          ${route.description ? html`<div class="route-description">${route.description}</div>` : ''}
        </a>
      `;
    }
    
    return html`
      <div class="route-card" style="cursor: default;">
        <span class="route-method method-${route.method.toLowerCase()}">${route.method}</span>
        <span class="route-pattern">${route.pattern}</span>
        ${route.description ? html`<div class="route-description">${route.description}</div>` : ''}
      </div>
    `;
  }
  
  /**
   * Build href for route
   */
  private routeHrefBuild(route: RouteInfo): string {
    if (route.pattern.includes('{')) {
      return '#'; // Dynamic routes can't be directly linked
    }
    return `http://${this.peerHost}${route.pattern}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'route-over-view': RouteOverView;
  }
}

