/**
 * IORRoute.ts
 * 
 * Web4 IOR Route
 * Handles IOR method invocation: /{component}/{version}/{uuid}/{method}
 * 
 * @layer2
 * @pattern Radical OOP - IOR-based method invocation
 * @pdca session/2025-12-01-UTC-0950.iteration-05-phase5-7-httpserver-router-refactoring.pdca.md
 */

import { Route } from './Route.js';
import { IncomingMessage, ServerResponse } from 'http';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';
import { IORMethodRouter } from './IORMethodRouter.js';
import { parse as parseUrl } from 'url';

/**
 * IORRoute
 * 
 * Handles IOR method invocation pattern
 * Pattern: /{component}/{version}/{uuid}/{method}?param=value
 * 
 * Web4 Principle 12: IOR-based Method Invocation
 * - Parses IOR URLs
 * - Delegates to IORMethodRouter
 * - Returns Scenario<T> or error with available methods
 * 
 * Priority: 10 (highest - checked before HTML and Scenario routes)
 */
export class IORRoute extends Route {
    private iorRouter: IORMethodRouter;
    
    constructor(iorRouter: IORMethodRouter) {
        super();
        this.model.name = 'IORRoute';
        this.model.priority = 10; // Highest priority
        this.iorRouter = iorRouter;
    }
    
    /**
     * Get icon for IOR route (Radical OOP: polymorphism)
     * @pdca 2025-12-12-UTC-1103.http-routes-display.pdca.md RO.HTTP.1
     */
    public override iconGet(): string {
        return '🔗';
    }
    
    /**
     * Get label for IOR route group
     * @pdca 2025-12-12-UTC-1103.http-routes-display.pdca.md RO.HTTP.1
     */
    public override labelGet(): string {
        return '🔗 IOR Methods';
    }
    
    /**
     * Match IOR pattern: /{component}/{version}/{uuid}/{method}
     * 
     * IOR paths must:
     * - Have exactly 4 path segments
     * - NOT have a file extension (static files handled by StaticFileRoute)
     * 
     * @param path - URL path
     * @param method - HTTP method
     * @returns true if path matches IOR pattern
     */
    public matches(path: string, method: HttpMethod): boolean {
        // Remove query string for matching
        const pathWithoutQuery = path.split('?')[0];
        
        // Check for file extension - IOR paths don't have extensions
        const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(pathWithoutQuery);
        if (hasFileExtension) {
            return false; // Static file route should handle this
        }
        
        // IOR pattern: exactly 4 path segments: /{component}/{version}/{uuid}/{method}
        const pathParts = pathWithoutQuery.split('/').filter(p => p.length > 0);
        if (pathParts.length !== 4) {
            return false; // Must be exactly 4 segments
        }
        
        // Parse to verify it's a valid IOR
        const iorMethodCall = this.iorRouter.parseIorUrl(path);
        return iorMethodCall !== null;
    }
    
    /**
     * Handle IOR method invocation
     * 
     * Web4 Pattern:
     * - Parse IOR URL
     * - Read request body (for POST/PUT)
     * - Delegate to IORMethodRouter
     * - Return Scenario<T> or error
     */
    protected async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const url = parseUrl(req.url || '/', true);
        const path = url.pathname || '/';
        
        // Initialize IOR router if not already done
        if (!this.iorRouter.model.uuid) {
            throw new Error('IORRoute: IORMethodRouter not initialized with ONCE kernel');
        }
        
        // Read request body for POST/PUT
        let body: any = undefined;
        if (req.method === 'POST' || req.method === 'PUT') {
            body = await new Promise((resolve) => {
                let data = '';
                req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
                req.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch {
                        resolve(data); // Not JSON, return as string
                    }
                });
            });
        }
        
        // Route to IOR method
        try {
            const result = await this.iorRouter.route(path, body);
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(result));
        } catch (error: any) {
            res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ 
                error: error.message,
                ior: path 
            }));
        }
    }
}

