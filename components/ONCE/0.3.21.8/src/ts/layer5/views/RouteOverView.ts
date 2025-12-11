/**
 * RouteOverView.ts - Route Overview Component
 * 
 * Displays all registered routes as a list of RouteItemView components.
 * Gets routes from router.routesGet().
 * 
 * <route-over-view> IS the container - no internal wrapper div needed.
 * Styles applied to :host.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (use method references, not arrow functions)
 * - P16: nameVerb pattern
 * - P19: CSS in separate file
 * - P27: Web Components ARE Radical OOP
 * 
 * @component Router
 * @layer 5
 * @pdca 2025-12-11-UTC-1530.route-overview-migration.pdca.md Phase RO.2
 */

import { html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UcpView } from './UcpView.js';
import type { RouteModel } from '../../layer3/RouteScenario.interface.js';
import type { Reference } from '../../layer3/Reference.interface.js';
import './RouteItemView.js';  // Import to register custom element

/**
 * RouteOverView - Displays all registered routes
 * 
 * Pattern: Adding routes to overview = registering routes with router
 * This component reads routes from router.routesGet() and renders them.
 * 
 * Usage:
 *   <route-over-view .router=${router}></route-over-view>
 */
@customElement('route-over-view')
export class RouteOverView extends UcpView<any> {
  
  static cssPath = 'RouteOverView.css';
  
  /** Router reference for getting routes */
  @property({ attribute: false }) router: Reference<HTMLElement> = null;
  
  // ═══════════════════════════════════════════════════════════════
  // ROUTE ACCESS (Web4 P4: Methods, not arrow functions)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get registered routes from router
   * Web4 P4: Method, not arrow function
   */
  private routesGet(): RouteModel[] {
    if (!this.router) return [];
    const routerAny = this.router as any;
    if (!routerAny.routesGet) return [];
    
    const routeMap = routerAny.routesGet() as Map<string, any>;
    const routes: RouteModel[] = [];
    
    // Convert Route instances to RouteModel
    routeMap.forEach(this.routeModelExtract.bind(this, routes));
    return routes;
  }
  
  /**
   * Extract RouteModel from Route instance
   * Web4 P4: Method for forEach callback
   */
  private routeModelExtract(routes: RouteModel[], route: any): void {
    routes.push(route.model);
  }
  
  /**
   * Render single route item
   * Web4 P4: Method for map callback
   */
  private routeItemRender(routeModel: RouteModel): TemplateResult {
    return html`
      <route-item-view
        .model=${routeModel}
        .router=${this.router}
      ></route-item-view>
    `;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  
  render(): TemplateResult {
    const routes = this.routesGet();
    
    if (routes.length === 0) {
      return html`<p class="no-routes">No routes registered</p>`;
    }
    
    // No wrapper div - <route-over-view> IS the container
    // Styles applied to :host in CSS
    return html`${routes.map(this.routeItemRender.bind(this))}`;
  }
}
