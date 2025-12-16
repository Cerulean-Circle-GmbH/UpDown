/**
 * RouteItemView.ts - Unified Route Item View Component
 * 
 * Displays ANY route type (SPA or HTTP). Uses the Route object's icon
 * via iconGet() (Radical OOP polymorphism), or falls back to model.icon.
 * 
 * JsInterface: Object IS its type - no RouteType enum needed!
 * 
 * Hierarchy:
 *   LitElement ← UcpView<T> ← RouteItemView
 * 
 * Web4 Principles:
 * - P4: Radical OOP (use method references, not arrow functions)
 * - P16: nameVerb pattern + TypeScript accessors
 * - P19: CSS in separate file
 * - P27: Web Components ARE Radical OOP
 * - JsInterface: Ask the object, don't switch!
 * 
 * @component Router
 * @layer 5
 * @pdca 2025-12-11-UTC-1530.route-overview-migration.pdca.md Phase RO.1
 * @pdca 2025-12-12-UTC-1103.http-routes-display.pdca.md RO.HTTP.3
 */

import { html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UcpView } from './UcpView.js';
import type { RouteModel } from '../../layer3/RouteScenario.interface.js';
import type { Reference } from '../../layer3/Reference.interface.js';

/** Extended RouteModel with JsInterface fields */
interface ExtendedRouteModel extends RouteModel {
    className?: string;
    icon?: string;
    label?: string;
    method?: string;
}

/**
 * RouteItemView - Displays a single route (SPA or HTTP)
 * 
 * SPA routes: clickable, navigate via router
 * HTTP routes: info display (or open in new tab)
 * 
 * Usage:
 *   <route-item-view .model=${routeModel} .router=${router}></route-item-view>
 *   <route-item-view .model=${routeModel} .route=${routeObject} .router=${router}></route-item-view>
 */
@customElement('route-item-view')
export class RouteItemView extends UcpView<ExtendedRouteModel> {
  
    static override cssPath = 'RouteItemView.css';
  
    /** Router reference for navigation */
    @property({ attribute: false }) router: Reference<HTMLElement> = null;
  
    /** Live Route object (for iconGet() polymorphism) */
    @property({ attribute: false }) route: any = null;
  
    // ═══════════════════════════════════════════════════════════════
    // COMPUTED ACCESSORS (Web4 P16 + JsInterface)
    // ═══════════════════════════════════════════════════════════════
  
    /** Route pattern as display path */
    get path(): string {
        return this.model?.pattern ?? '';
    }
  
    /** Route class name (JsInterface: object IS its type) */
    get routeClassName(): string {
        return this.model?.className ?? 'Route';
    }
  
    /** Is this a SPA route? (has viewTag) */
    get isSpaRoute(): boolean {
        return !!this.model?.viewTag || this.routeClassName === 'SpaRoute';
    }
  
    /**
     * Get route icon - Radical OOP polymorphism
     * ✅ RIGHT: Ask the object via iconGet()
     * Fallback: model.icon (from server serialization)
     */
    get routeIcon(): string {
        // Radical OOP: Ask the object first!
        if (this.route?.iconGet) {
            return this.route.iconGet();
        }
        // Fallback for serialized routes (no live object)
        return this.model?.icon ?? '📍';
    }
  
    /** HTTP method for HTTP routes */
    get routeMethod(): string {
        return this.model?.method ?? 'GET';
    }
  
    /** Show method badge for HTTP routes only */
    get showMethodBadge(): boolean {
        return !this.isSpaRoute && !!this.model?.method;
    }
  
    /** Route title from model or derived from pattern */
    get routeTitle(): string {
        if (this.model?.title) return this.model.title;
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
     * Handle route link click
     * SPA routes: prevent default, use router.navigateTo()
     * HTTP routes: let default behavior (new tab)
     */
    private linkClickHandle(event: Event): void {
        if (this.isSpaRoute) {
            event.preventDefault();
            if (this.router && (this.router as any).navigateTo) {
                (this.router as any).navigateTo(this.path, false);
            } else {
                // Fallback: dispatch popstate for UcpRouter to handle
                window.history.pushState({}, '', this.path);
                window.dispatchEvent(new PopStateEvent('popstate'));
            }
        }
        // HTTP routes: let default behavior (open in new tab)
    }
  
    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════
  
    override render(): TemplateResult {
        const activeClass = this.isActive ? 'active' : '';
        const target = this.isSpaRoute ? '' : '_blank';
        const typeClass = this.routeClassName.toLowerCase();
    
        return html`
            <a href="${this.path}" 
               class="route-link ${activeClass} route-${typeClass}"
               target="${target}"
               @click=${this.linkClickHandle.bind(this)}>
                <span class="route-icon">${this.routeIcon}</span>
                ${this.showMethodBadge ? html`
                    <span class="method-badge method-${this.routeMethod.toLowerCase()}">${this.routeMethod}</span>
                ` : ''}
                <span class="route-title">${this.routeTitle}</span>
                <code class="route-path">${this.path}</code>
            </a>
        `;
    }
}








