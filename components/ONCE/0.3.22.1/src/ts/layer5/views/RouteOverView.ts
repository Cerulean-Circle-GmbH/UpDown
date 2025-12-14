/**
 * RouteOverView.ts - Unified Route Overview Component
 * 
 * Displays ALL routes: SPA (from router) + HTTP (from /routes endpoint)
 * Groups by route class name (JsInterface pattern), NOT enum.
 * 
 * <route-over-view> IS the container - no internal wrapper div needed.
 * Styles applied to :host.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (use method references, not arrow functions)
 * - P16: nameVerb pattern
 * - P19: CSS in separate file
 * - P27: Web Components ARE Radical OOP
 * - JsInterface: Object IS its type (no RouteType enum)
 * 
 * @component Router
 * @layer 5
 * @pdca 2025-12-11-UTC-1530.route-overview-migration.pdca.md Phase RO.2
 * @pdca 2025-12-12-UTC-1103.http-routes-display.pdca.md RO.HTTP.4
 */

import { html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UcpView } from './UcpView.js';
import type { RouteModel } from '../../layer3/RouteScenario.interface.js';
import type { Reference } from '../../layer3/Reference.interface.js';
import './RouteItemView.js';  // Import to register custom element

/** Route with class info for JsInterface grouping */
interface RouteWithClass {
    model: RouteModel & { className?: string; icon?: string; label?: string };
    route: any;  // Live Route object (for SPA) or null (for HTTP)
    className: string;
}

/**
 * RouteOverView - Displays all registered routes (SPA + HTTP)
 * 
 * Pattern: Adding routes to overview = registering routes with router
 * This component reads routes from router.routesGet() and /routes endpoint.
 * 
 * Usage:
 *   <route-over-view .router=${router}></route-over-view>
 *   <route-over-view .router=${router} .includeHttpRoutes=${true}></route-over-view>
 */
@customElement('route-over-view')
export class RouteOverView extends UcpView<any> {
  
    static override cssPath = 'RouteOverView.css';
  
    /** Router reference for getting SPA routes */
    @property({ attribute: false }) router: Reference<HTMLElement> = null;
  
    /** Whether to include HTTP routes from /routes endpoint */
    @property({ type: Boolean }) includeHttpRoutes: boolean = false;
  
    /** Whether to group routes by class type */
    @property({ type: Boolean }) groupByType: boolean = true;
  
    @state() private httpRoutes: RouteWithClass[] = [];
    @state() private loading: boolean = false;
  
    // ═══════════════════════════════════════════════════════════════
    // LIFECYCLE
    // ═══════════════════════════════════════════════════════════════
  
    override connectedCallback(): void {
        super.connectedCallback();
        if (this.includeHttpRoutes) {
            this.httpRoutesFetch();
        }
    }
  
    // ═══════════════════════════════════════════════════════════════
    // ROUTE ACCESS (Web4 P4: Methods, not arrow functions)
    // ═══════════════════════════════════════════════════════════════
  
    /**
     * Get SPA routes from router (have viewTag)
     * Web4 P4: Method, not arrow function
     */
    private spaRoutesGet(): RouteWithClass[] {
        if (!this.router) return [];
        const routerAny = this.router as any;
        if (!routerAny.routesGet) return [];
    
        const routeMap = routerAny.routesGet() as Map<string, any>;
        const routes: RouteWithClass[] = [];
    
        routeMap.forEach(this.spaRouteExtract.bind(this, routes));
        return routes;
    }
  
    /**
     * Extract SPA route
     * Web4 P4: Method for forEach callback
     */
    private spaRouteExtract(routes: RouteWithClass[], route: any): void {
        routes.push({
            model: { ...route.model, className: 'SpaRoute', icon: '🧭', label: '🧭 SPA Routes' },
            route: route,
            className: 'SpaRoute'
        });
    }
  
    /**
     * Fetch HTTP routes from /routes endpoint
     * Web4 P7: Uses .then() pattern (registration is sync)
     */
    private httpRoutesFetch(): void {
        this.loading = true;
        fetch('/routes')
            .then(this.httpResponseHandle.bind(this))
            .catch(this.httpErrorHandle.bind(this));
    }
  
    /**
     * Handle HTTP response
     * Web4 P4: Method reference
     */
    private httpResponseHandle(response: Response): void {
        if (response.ok) {
            response.json().then(this.httpDataHandle.bind(this));
        } else {
            this.loading = false;
        }
    }
  
    /**
     * Handle parsed JSON data
     * Web4 P4: Method reference
     */
    private httpDataHandle(data: any): void {
        const routes = data.model?.routes || data.routes || [];
        this.httpRoutes = routes.map(this.httpRouteTransform.bind(this));
        this.loading = false;
    }
  
    /**
     * Transform HTTP route to RouteWithClass
     * Web4 P4: Method for map callback
     */
    private httpRouteTransform(r: any): RouteWithClass {
        return {
            model: r,
            route: null,  // No live object for HTTP routes
            className: r.className || 'Route'
        };
    }
  
    /**
     * Handle fetch error
     * Web4 P4: Method reference
     */
    private httpErrorHandle(err: Error): void {
        console.warn('[RouteOverView] Failed to fetch HTTP routes:', err);
        this.loading = false;
    }
  
    /**
     * Get all routes (SPA + HTTP if enabled)
     */
    private allRoutesGet(): RouteWithClass[] {
        const spaRoutes = this.spaRoutesGet();
        if (!this.includeHttpRoutes) return spaRoutes;
        return [...spaRoutes, ...this.httpRoutes];
    }
  
    /**
     * Group routes by class name (JsInterface pattern)
     */
    private routesByClassGet(): Map<string, RouteWithClass[]> {
        const grouped = new Map<string, RouteWithClass[]>();
        const allRoutes = this.allRoutesGet();
        allRoutes.forEach(this.routeGroupAdd.bind(this, grouped));
        return grouped;
    }
  
    /**
     * Add route to group
     * Web4 P4: Method for forEach callback
     */
    private routeGroupAdd(grouped: Map<string, RouteWithClass[]>, rwc: RouteWithClass): void {
        const className = rwc.className;
        if (!grouped.has(className)) grouped.set(className, []);
        grouped.get(className)!.push(rwc);
    }
  
    /**
     * Get group label - from model (Radical OOP: server included it)
     */
    private classLabelGet(rwc: RouteWithClass): string {
        return rwc.model?.label ?? `🔌 ${rwc.className}`;
    }
  
    /**
     * Render single route item
     * Web4 P4: Method for map callback
     */
    private routeItemRender(rwc: RouteWithClass): TemplateResult {
        return html`
            <route-item-view
                .model=${rwc.model}
                .route=${rwc.route}
                .router=${this.router}
            ></route-item-view>
        `;
    }
  
    /**
     * Render route group
     */
    private routeGroupRender(className: string, routes: RouteWithClass[]): TemplateResult {
        const firstRoute = routes[0];
        return html`
            <div class="route-group">
                <h4 class="group-title">${this.classLabelGet(firstRoute)}</h4>
                ${routes.map(this.routeItemRender.bind(this))}
            </div>
        `;
    }
  
    /**
     * Push rendered group to array
     * Web4 P4: Method for forEach callback
     */
    private groupRenderPush(groups: TemplateResult[], routes: RouteWithClass[], className: string): void {
        groups.push(this.routeGroupRender(className, routes));
    }
  
    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════
  
    override render(): TemplateResult {
        if (this.loading) {
            return html`<p class="loading">Loading routes...</p>`;
        }
    
        const allRoutes = this.allRoutesGet();
    
        if (allRoutes.length === 0) {
            return html`<p class="no-routes">No routes registered</p>`;
        }
    
        // Grouped view (by class name - JsInterface)
        if (this.groupByType) {
            const grouped = this.routesByClassGet();
            const groups: TemplateResult[] = [];
            grouped.forEach(this.groupRenderPush.bind(this, groups));
            return html`${groups}`;
        }
    
        // Flat view
        return html`${allRoutes.map(this.routeItemRender.bind(this))}`;
    }
}
