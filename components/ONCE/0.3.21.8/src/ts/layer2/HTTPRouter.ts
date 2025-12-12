/**
 * HTTPRouter.ts
 * 
 * Web4 HTTP Router
 * Routes HTTP requests to registered Route instances
 * 
 * @layer2
 * @pattern Radical OOP - All state in model, route registration
 * @pdca session/2025-12-01-UTC-0950.iteration-05-phase5-7-httpserver-router-refactoring.pdca.md
 */

import { RouterModel } from '../layer3/RouterModel.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { Route } from './Route.js';
import { ErrorRoute } from './ErrorRoute.js';
import { IncomingMessage, ServerResponse } from 'http';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';
import { parse as parseUrl } from 'url';

/**
 * HTTPRouter
 * 
 * Web4 Radical OOP Router
 * - Empty constructor (Web4 Principle 6)
 * - All state in model (routes, statistics)
 * - Route registration (registerRoute)
 * - Route matching by priority
 * - ONE LINE delegation to matched route
 * 
 * Architecture:
 * - HTTPServer owns HTTPRouter
 * - HTTPRouter owns Route[]
 * - Routes handle specific patterns
 * - IORMethodRouter can be integrated as a high-priority route
 */
export class HTTPRouter {
    public model: RouterModel;
    private routes: Map<string, Route>; // key: `${pattern}:${method}`
    private errorRoute: ErrorRoute;  // Error handling route
    
    constructor() {
        // Empty constructor - Web4 Principle 6
        const now = new Date().toISOString();
        this.errorRoute = new ErrorRoute();
        this.model = {
            uuid: '', // Set by init()
            name: 'HTTPRouter',
            routes: [], // Route models (for hibernation)
            statistics: {
                totalOperations: 0,
                successCount: 0,
                errorCount: 0,
                lastOperationAt: '',
                lastErrorAt: '',
                createdAt: now,
                updatedAt: now
            }
        };
        this.routes = new Map();
    }
    
    /**
     * Initialize router with scenario
     * 
     * @param scenario - Optional scenario to restore state
     * @returns this (method chaining)
     */
    public init(scenario?: Scenario<RouterModel>): this {
        if (scenario?.model) {
            Object.assign(this.model, scenario.model);
        }
        return this;
    }
    
    /**
     * Register a route
     * 
     * @param route - Route instance to register
     * @returns this (method chaining)
     */
    public registerRoute(route: Route): this {
        const key = `${route.model.pattern}:${route.model.method}`;
        this.routes.set(key, route);
        
        // Add to model for hibernation
        this.model.routes.push(route.model);
        
        console.log(`📍 HTTPRouter: Registered ${route.constructor.name} for ${route.model.method} ${route.model.pattern}`);
        return this;
    }
    
    /**
     * Route HTTP request to appropriate handler
     * 
     * Web4 Pattern:
     * - Parse URL
     * - Find matching route (by priority)
     * - Delegate to route.handle() (ONE LINE!)
     * - Update statistics
     * 
     * @param req - HTTP request
     * @param res - HTTP response
     */
    public async route(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            const url = parseUrl(req.url || '/', true);
            const path = url.pathname || '/';
            const method = (req.method?.toUpperCase() as HttpMethod) || HttpMethod.GET;
            const hostname = this.hostnameExtract(req);
            
            // Find matching route (with domain support)
            const matchedRoute = this.findMatchingRoute(path, method, hostname);
            
            if (matchedRoute) {
                // ✅ ONE LINE DELEGATION!
                await matchedRoute.handle(req, res);
                this.model.statistics.successCount++;
            } else {
                // No route found - 404
                this.model.statistics.errorCount++;
                this.model.statistics.lastErrorAt = now;
                res.writeHead(404, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ 
                    error: 'Not Found',
                    path,
                    method,
                    availableRoutes: Array.from(this.routes.keys())
                }));
            }
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            
            console.error('[HTTPRouter] Routing error:', error);
            
            // Delegate to errorHandle for consistent error responses
            await this.errorHandle(req, res, error);
        }
    }
    
    /**
     * Handle error via ErrorRoute
     * Server/Router calls this instead of hardcoding error response
     * 
     * Web4 Radical OOP: ErrorRoute decides response format (JSON/HTML)
     * 
     * @param req - HTTP request
     * @param res - HTTP response
     * @param error - Error to handle
     */
    public async errorHandle(req: IncomingMessage, res: ServerResponse, error: Error): Promise<void> {
        console.error('[HTTPRouter] Error:', error.message);
        await this.errorRoute.handleWithError(req, res, error);
    }
    
    /**
     * Find matching route by path, method, and optionally hostname
     * Routes checked by priority (lower number = higher priority)
     * 
     * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md Phase 8.3
     * 
     * @param path - URL path
     * @param method - HTTP method
     * @param hostname - Optional hostname for domain-based routing
     * @returns Matching route or undefined
     */
    private findMatchingRoute(path: string, method: HttpMethod, hostname?: string): Route | undefined {
        // Get all routes as array
        const allRoutes = Array.from(this.routes.values());
        
        // Sort by priority (lower number = higher priority)
        allRoutes.sort(this.routePriorityCompare.bind(this));
        
        // Find first match
        for (const route of allRoutes) {
            // Check domain match first (if domains specified on route)
            if (!this.domainMatches(hostname, route.model.domains)) {
                continue;
            }
            
            // Then check path and method
            if (route.matches(path, method)) {
                return route;
            }
        }
        
        return undefined;
    }
    
    /**
     * Compare route priorities for sorting
     * Web4 P4: Method for sort callback
     * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
     */
    private routePriorityCompare(routeA: Route, routeB: Route): number {
        return (routeA.model.priority || 100) - (routeB.model.priority || 100);
    }
    
    /**
     * Check if hostname matches route domains
     * Web4 P4: Method, not arrow function
     * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md Phase 8.3
     */
    private domainMatches(hostname: string | undefined, domains?: string[]): boolean {
        // No domain restriction = matches all
        if (!domains || domains.length === 0) {
            return true;
        }
        
        // No hostname provided = can't match specific domains
        if (!hostname) {
            return false;
        }
        
        const hostnameLower = hostname.toLowerCase();
        
        for (const domain of domains) {
            if (this.singleDomainMatches(hostnameLower, domain.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if hostname matches single domain pattern
     * Web4 P4: Method for iteration
     * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
     */
    private singleDomainMatches(hostname: string, domain: string): boolean {
        // Exact match
        if (hostname === domain) {
            return true;
        }
        
        // Wildcard match (*.example.com)
        if (domain.startsWith('*.')) {
            const suffix = domain.slice(1);  // .example.com
            if (hostname.endsWith(suffix) && hostname.length > suffix.length) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Extract hostname from request
     * Web4 P16: hostnameExtract
     * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
     */
    private hostnameExtract(request: IncomingMessage): string {
        const host = request.headers.host || '';
        // Remove port if present
        return host.split(':')[0].toLowerCase();
    }
    
    /**
     * Get all registered routes with class names (JsInterface pattern)
     * Web4 P16: routesGet() accessor pattern
     * Web4 P4: Method reference for forEach
     * 
     * @pdca 2025-12-12-UTC-1103.http-routes-display.pdca.md RO.HTTP.2
     * @returns Array of route models with className, icon, label
     */
    public routesGet(): Array<any> {
        const routes: Array<any> = [];
        this.routes.forEach(this.routeModelExtract.bind(this, routes));
        return routes;
    }
    
    /**
     * Extract RouteModel from Route instance
     * JsInterface: Include constructor.name as className
     * Radical OOP: Include icon and label from object (polymorphism)
     * 
     * @pdca 2025-12-12-UTC-1103.http-routes-display.pdca.md RO.HTTP.2
     */
    private routeModelExtract(routes: Array<any>, route: Route): void {
        routes.push({
            pattern: route.model.pattern,
            method: route.model.method || 'GET',
            title: route.model.name || route.constructor.name,
            priority: route.model.priority ?? 0,
            // JsInterface: The class name IS the type - no enum needed!
            className: route.constructor.name,
            // Radical OOP: ASK THE OBJECT for its display properties!
            icon: route.iconGet(),    // Each class defines its own icon
            label: route.labelGet()   // Each class defines its own group label
        });
    }
    
    /**
     * Convert to scenario
     * 
     * @returns Scenario representation
     */
    public async toScenario(): Promise<Scenario<RouterModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: this.model.iorComponent || 'HTTPRouter',  // DRY
                version: this.model.iorVersion || ''  // DRY: from init()
            },
            owner: '',
            model: { ...this.model }
        };
    }
}

