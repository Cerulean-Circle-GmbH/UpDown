/**
 * RouteItemView.ts - Route Item View Component (SPA Routes)
 * 
 * ⚠️ IMPORTANT: Uses SPA RouteModel from RouteScenario.interface.ts
 *    NOT HTTP RouteModel from RouteModel.interface.ts!
 * 
 * SPA RouteModel has: pattern, viewTag, title, isActive, params, query
 * HTTP RouteModel has: pattern, method, priority, statistics (DIFFERENT!)
 * 
 * Hierarchy:
 *   LitElement ← UcpView<T> ← RouteItemView
 * 
 * Web4 Principles:
 * - P4: Radical OOP (use method references, not arrow functions)
 * - P16: nameVerb pattern + TypeScript accessors
 * - P19: CSS in separate file
 * - P27: Web Components ARE Radical OOP
 * 
 * @component Router
 * @layer 5
 * @pdca 2025-12-11-UTC-1530.route-overview-migration.pdca.md Phase RO.1
 */

import { html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UcpView } from './UcpView.js';
// ⚠️ Use SPA RouteModel, NOT HTTP RouteModel!
import type { RouteModel } from '../../layer3/RouteScenario.interface.js';
import type { Reference } from '../../layer3/Reference.interface.js';

/**
 * RouteItemView - Displays a single SPA route as a clickable link
 * 
 * Uses SPA RouteModel directly - NO separate RouteItemModel needed!
 * 
 * SPA RouteModel fields:
 *   - pattern: URL pattern (e.g., '/', '/demo', '/peer/:uuid')
 *   - viewTag: Custom element tag (e.g., 'once-over-view')
 *   - title: Page title for display
 *   - isActive: Currently active?
 *   - params, query: URL parameters
 *   - viewProps: Additional view properties
 * 
 * Usage:
 *   <route-item-view .model=${spaRouteModel} .router=${router}></route-item-view>
 */
@customElement('route-item-view')
export class RouteItemView extends UcpView<RouteModel> {
  
  static cssPath = 'RouteItemView.css';
  
  /** Router reference for navigation */
  @property({ attribute: false }) router: Reference<HTMLElement> = null;
  
  // ═══════════════════════════════════════════════════════════════
  // COMPUTED ACCESSORS (Web4 P16) - derive view values from SPA RouteModel
  // ═══════════════════════════════════════════════════════════════
  
  /** Route pattern as display path */
  get path(): string {
    return this.model?.pattern ?? '';
  }
  
  /** Route title from model (or derived from pattern) */
  get routeTitle(): string {
    // Use model.title if available, otherwise derive from pattern
    if (this.model?.title) return this.model.title;
    // "/" → "Main", "/demo" → "Demo"
    if (this.path === '/') return 'Main';
    const name = this.path.slice(1);
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  /** Is route currently active? */
  get isActive(): boolean {
    return this.model?.isActive ?? false;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION (Web4 P4: Object method references, not arrow functions)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Handle route link click - SPA navigation
   * ✅ Web4 P4: Regular method, not arrow function
   */
  private linkClickHandle(event: Event): void {
    event.preventDefault();
    if (this.router && (this.router as any).navigateTo) {
      (this.router as any).navigateTo(this.path, false);
    } else {
      // Fallback: dispatch popstate for UcpRouter to handle
      window.history.pushState({}, '', this.path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }
  
  /**
   * Get bound click handler
   * ✅ Web4 P4: Returns bound method reference
   */
  private linkClickHandlerGet(): (event: Event) => void {
    return this.linkClickHandle.bind(this);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  
  render(): TemplateResult {
    const activeClass = this.isActive ? 'active' : '';
    
    return html`
      <a href="${this.path}" 
         class="route-link ${activeClass}"
         @click=${this.linkClickHandlerGet()}>
        <span class="route-title">${this.routeTitle}</span>
        <code class="route-path">${this.path}</code>
      </a>
    `;
  }
}
