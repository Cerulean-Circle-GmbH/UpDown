/**
 * ReverseProxyRoute.ts - Reverse proxy with body rewriting
 * 
 * External Client → ONCE → Internal Service
 * 
 * Extends ProxyRoute, adds:
 * - Response body buffering
 * - Href rewriting in HTML responses
 * 
 * Use Cases:
 * - ONCE as frontend for backend microservices
 * - SSL termination (HTTPS → HTTP internal)
 * - Load balancing across backends
 * - Response body rewriting (href URLs)
 * 
 * @component Router
 * @layer 2
 * @pdca 2025-12-12-UTC-1545.proxy-routes-radical-oop.pdca.md PX.5
 * Web4 P4: No arrow functions
 */

import { IncomingMessage, ServerResponse } from 'http';
import { ProxyRoute } from './ProxyRoute.js';
import { HrefRewriter } from './HrefRewriter.js';
import { RewriteContext } from './HeaderRewriter.js';

/**
 * ReverseProxyRoute - Reverse proxy with HTML body rewriting
 * 
 * When hrefRules are configured and response is HTML:
 * - Buffers the response body
 * - Rewrites href/src/action URLs
 * - Sends modified response
 * 
 * Otherwise behaves like ProxyRoute (streams through).
 */
export class ReverseProxyRoute extends ProxyRoute {
    
    private hrefRewriter: HrefRewriter;
    
    constructor() {
        super();
        this.hrefRewriter = new HrefRewriter();
        this.model.name = 'ReverseProxyRoute';
    }
    
    /**
     * Get icon for reverse proxy route
     */
    public override iconGet(): string {
        return '🔁';
    }
    
    /**
     * Get label for reverse proxy route group
     */
    public override labelGet(): string {
        return '🔁 Reverse Proxy Routes';
    }
    
    /**
     * Override to add body rewriting for HTML responses
     * Web4 P4: Bound methods for callbacks
     */
    protected override upstreamResponseHandle(
        res: ServerResponse,
        context: RewriteContext,
        upstreamRes: IncomingMessage
    ): void {
        const contentType = upstreamRes.headers['content-type'] || '';
        const hasHrefRules = this.model.hrefRules && this.model.hrefRules.length > 0;
        const isHtml = contentType.includes('text/html');
        const needsRewrite = hasHrefRules && isHtml;
        
        if (needsRewrite) {
            // Buffer response for rewriting
            this.bufferedResponseHandle(res, context, upstreamRes);
        } else {
            // Stream through (no rewriting needed)
            super.upstreamResponseHandle(res, context, upstreamRes);
        }
    }
    
    /**
     * Buffer and rewrite HTML response
     * Web4 P4: Bound methods for event handlers
     */
    private bufferedResponseHandle(
        res: ServerResponse,
        context: RewriteContext,
        upstreamRes: IncomingMessage
    ): void {
        const chunks: Buffer[] = [];
        
        upstreamRes.on('data', this.chunkCollect.bind(this, chunks));
        upstreamRes.on('end', this.bufferedResponseSend.bind(this, res, context, upstreamRes, chunks));
        upstreamRes.on('error', this.bufferErrorHandle.bind(this, res));
    }
    
    /**
     * Collect data chunk
     * Web4 P4: Bound method for event handler
     */
    private chunkCollect(chunks: Buffer[], chunk: Buffer): void {
        chunks.push(chunk);
    }
    
    /**
     * Send buffered response after rewriting
     * Web4 P4: Bound method for event handler
     */
    private bufferedResponseSend(
        res: ServerResponse,
        context: RewriteContext,
        upstreamRes: IncomingMessage,
        chunks: Buffer[]
    ): void {
        let body = Buffer.concat(chunks).toString('utf-8');
        
        // Rewrite hrefs in HTML
        body = this.hrefRewriter.rewrite(body, this.model.hrefRules || []);
        
        // Rewrite response headers
        const headers = this.headerRewriter.rewrite(
            upstreamRes.headers,
            this.model.responseHeaderRules || [],
            context
        );
        
        // Update content-length for modified body
        headers['content-length'] = Buffer.byteLength(body).toString();
        
        // Remove content-encoding if present (we decoded for rewriting)
        delete headers['content-encoding'];
        delete headers['transfer-encoding'];
        
        res.writeHead(upstreamRes.statusCode || 200, headers);
        res.end(body);
    }
    
    /**
     * Handle buffer error
     * Web4 P4: Bound method for event handler
     */
    private bufferErrorHandle(res: ServerResponse, error: Error): void {
        console.error('[ReverseProxyRoute] Buffer error:', error.message);
        
        if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Bad Gateway',
                message: `Response buffering error: ${error.message}`
            }));
        }
    }
}




















