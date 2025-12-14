/**
 * ProxyRoute.ts - Forward proxy route
 * 
 * Client → ONCE → Upstream Server
 * 
 * Radical OOP: ProxyRoute knows how to proxy.
 * Server just delegates - ONE LINE! (router.route(req, res))
 * 
 * Use Cases:
 * - ONCE as gateway to external APIs
 * - Add authentication headers before forwarding
 * - Cache responses from upstream
 * - Rate limiting / throttling
 * 
 * @component Router
 * @layer 2
 * @pdca 2025-12-12-UTC-1545.proxy-routes-radical-oop.pdca.md PX.4
 * Web4 P4: No arrow functions - bound methods for callbacks
 * Web4 P6: Empty constructor + init()
 */

import * as http from 'http';
import * as https from 'https';
import { IncomingMessage, ServerResponse } from 'http';
import { Route } from './Route.js';
import { HeaderRewriter, RewriteContext } from './HeaderRewriter.js';
import { ProxyRouteModel } from '../layer3/ProxyRouteModel.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';

/**
 * ProxyRoute - Forward proxy for external services
 * 
 * Forwards client requests to upstream servers with:
 * - Header rewriting (request and response)
 * - Load balancing (round-robin, random)
 * - Path prefix manipulation
 * - Standard proxy headers (X-Forwarded-For, etc.)
 */
export class ProxyRoute extends Route {
    public override model!: ProxyRouteModel;
    
    protected headerRewriter: HeaderRewriter;
    private upstreamIndex: number = 0;  // For round-robin load balancing
    
    constructor() {
        super();
        this.headerRewriter = new HeaderRewriter();
        this.model.name = 'ProxyRoute';
    }
    
    /**
     * Initialize with scenario
     * Web4 P6: Empty constructor + init()
     */
    public override init(scenario?: Scenario<ProxyRouteModel>): this {
        super.init(scenario);
        return this;
    }
    
    /**
     * Get icon for proxy route (Radical OOP: polymorphism)
     * @pdca 2025-12-12-UTC-1103.http-routes-display.pdca.md RO.HTTP.1
     */
    public override iconGet(): string {
        return '🔀';
    }
    
    /**
     * Get label for proxy route group
     */
    public override labelGet(): string {
        return '🔀 Proxy Routes';
    }
    
    /**
     * Match proxy route pattern
     * Supports wildcard patterns like /api/**
     */
    protected override matchesPattern(path: string, pattern: string): boolean {
        // Handle wildcard patterns
        if (pattern.endsWith('/**')) {
            const prefix = pattern.slice(0, -3);
            return path.startsWith(prefix);
        }
        if (pattern.endsWith('/*')) {
            const prefix = pattern.slice(0, -2);
            return path.startsWith(prefix);
        }
        return path === pattern;
    }
    
    /**
     * Handle proxy request
     * Web4 P4: Bound methods for callbacks
     */
    protected override async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const upstream = this.upstreamSelect();
        const upstreamUrl = new URL(upstream);
        
        // Build context for header rewriting
        const context: RewriteContext = {
            clientIp: this.clientIpExtract(req),
            originalHost: req.headers.host,
            originalUrl: req.url,
            protocol: upstreamUrl.protocol === 'https:' ? 'https' : 'http'
        };
        
        // Rewrite request headers
        const headers = this.headerRewriter.rewrite(
            req.headers,
            this.model.requestHeaderRules || [],
            context
        );
        
        // Add standard proxy headers
        headers['x-forwarded-for'] = context.clientIp;
        headers['x-forwarded-host'] = context.originalHost;
        headers['x-forwarded-proto'] = context.protocol;
        
        if (!this.model.preserveHost) {
            headers['host'] = upstreamUrl.host;
        }
        
        // Build upstream path
        let path = req.url || '/';
        if (this.model.stripPrefix) {
            path = path.replace(new RegExp(`^${this.model.stripPrefix}`), '');
            if (!path.startsWith('/')) {
                path = '/' + path;
            }
        }
        if (this.model.addPrefix) {
            path = this.model.addPrefix + path;
        }
        
        // Make upstream request
        const options: http.RequestOptions = {
            hostname: upstreamUrl.hostname,
            port: upstreamUrl.port || (upstreamUrl.protocol === 'https:' ? 443 : 80),
            path: path,
            method: req.method,
            headers: headers,
            timeout: this.model.timeout || 30000
        };
        
        const transport = upstreamUrl.protocol === 'https:' ? https : http;
        const proxyReq = transport.request(
            options, 
            this.upstreamResponseHandle.bind(this, res, context)
        );
        
        proxyReq.on('error', this.proxyErrorHandle.bind(this, res));
        proxyReq.on('timeout', this.proxyTimeoutHandle.bind(this, res, proxyReq));
        
        // Pipe request body
        req.pipe(proxyReq);
    }
    
    /**
     * Handle upstream response
     * Web4 P4: Bound method for callback
     */
    protected upstreamResponseHandle(
        res: ServerResponse,
        context: RewriteContext,
        upstreamRes: IncomingMessage
    ): void {
        // Rewrite response headers
        const headers = this.headerRewriter.rewrite(
            upstreamRes.headers,
            this.model.responseHeaderRules || [],
            context
        );
        
        res.writeHead(upstreamRes.statusCode || 200, headers);
        
        // Pipe response body
        upstreamRes.pipe(res);
    }
    
    /**
     * Handle proxy error
     * Web4 P4: Bound method for callback
     */
    protected proxyErrorHandle(res: ServerResponse, error: Error): void {
        console.error('[ProxyRoute] Upstream error:', error.message);
        
        if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Bad Gateway',
                message: `Upstream error: ${error.message}`
            }));
        }
    }
    
    /**
     * Handle proxy timeout
     * Web4 P4: Bound method for callback
     */
    protected proxyTimeoutHandle(res: ServerResponse, proxyReq: http.ClientRequest): void {
        console.error('[ProxyRoute] Upstream timeout');
        proxyReq.destroy();
        
        if (!res.headersSent) {
            res.writeHead(504, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Gateway Timeout',
                message: `Upstream did not respond within ${this.model.timeout || 30000}ms`
            }));
        }
    }
    
    /**
     * Select upstream (load balancing)
     * Supports: round-robin, random
     */
    protected upstreamSelect(): string {
        const upstreams = this.model.upstreams || [this.model.upstream];
        
        if (upstreams.length === 1) {
            return upstreams[0];
        }
        
        switch (this.model.loadBalancing) {
            case 'round-robin':
                this.upstreamIndex = (this.upstreamIndex + 1) % upstreams.length;
                return upstreams[this.upstreamIndex];
                
            case 'random':
                return upstreams[Math.floor(Math.random() * upstreams.length)];
                
            case 'least-connections':
                // Not implemented - fall back to round-robin
                this.upstreamIndex = (this.upstreamIndex + 1) % upstreams.length;
                return upstreams[this.upstreamIndex];
                
            default:
                return upstreams[0];
        }
    }
    
    /**
     * Extract client IP from request
     * Respects X-Forwarded-For if present
     */
    protected clientIpExtract(req: IncomingMessage): string {
        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
            return forwardedStr.split(',')[0].trim();
        }
        return req.socket.remoteAddress || '127.0.0.1';
    }
}
