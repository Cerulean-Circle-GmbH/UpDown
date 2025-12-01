/**
 * HTMLRoute.ts
 * 
 * Web4 HTML Route
 * Serves HTML pages (e.g., /demo, /once, /)
 * 
 * @layer2
 * @pattern Radical OOP - All state in model
 * @pdca session/2025-12-01-UTC-0950.iteration-05-phase5-7-httpserver-router-refactoring.pdca.md
 */

import { Route } from './Route.js';
import { IncomingMessage, ServerResponse } from 'http';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';

/**
 * HTML Content Provider
 * Function that returns HTML string
 */
export type HTMLProvider = () => string;

/**
 * HTMLRoute
 * 
 * Serves HTML pages from a provider function
 * Used for: /, /demo, /once, etc.
 * 
 * Architecture:
 * - Receives HTML content via provider function
 * - Sets correct Content-Type header
 * - Returns HTML string to client
 */
export class HTMLRoute extends Route {
    private htmlProvider?: HTMLProvider;
    
    constructor() {
        super();
        this.model.name = 'HTMLRoute';
    }
    
    /**
     * Set HTML provider function
     * 
     * @param provider - Function that returns HTML string
     * @returns this (method chaining)
     */
    public setProvider(provider: HTMLProvider): this {
        this.htmlProvider = provider;
        return this;
    }
    
    /**
     * Set route pattern and method
     * 
     * @param pattern - URL pattern (e.g., "/demo")
     * @param method - HTTP method (default: GET)
     * @returns this (method chaining)
     */
    public setPattern(pattern: string, method: HttpMethod = HttpMethod.GET): this {
        this.model.pattern = pattern;
        this.model.method = method;
        return this;
    }
    
    /**
     * Handle HTML request
     * 
     * Web4 Pattern:
     * - Get HTML from provider
     * - Set headers
     * - Write response
     * - Update statistics (via base class)
     */
    protected async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        if (!this.htmlProvider) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('HTMLRoute: No HTML provider configured');
            return;
        }
        
        try {
            const html = this.htmlProvider();
            res.writeHead(200, { 
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(html);
        } catch (error: any) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`HTMLRoute error: ${error.message}`);
        }
    }
}

