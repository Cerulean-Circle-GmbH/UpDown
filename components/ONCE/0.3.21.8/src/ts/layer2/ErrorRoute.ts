/**
 * ErrorRoute.ts
 * 
 * Handles error responses polymorphically based on request type
 * 
 * Different error formats:
 * - API requests → JSON error
 * - HTML requests → HTML error page
 * 
 * Web4 Radical OOP:
 * - Route knows how to handle errors (polymorphism)
 * - No arrow functions (P4)
 * 
 * @component Router
 * @layer 2
 */

import { IncomingMessage, ServerResponse } from 'http';
import { Route } from './Route.js';

/**
 * ErrorRoute
 * 
 * Provides polymorphic error responses based on request type
 * 
 * Note: This route is NOT registered in HTTPRouter normally.
 * It is used by HTTPRouter.errorHandle() to delegate error responses.
 */
export class ErrorRoute extends Route {
    public protocol = 'error';
    
    /** Stored error for use in handleRequest */
    private currentError?: Error;
    
    constructor() {
        super();
        this.model.pattern = '/**';  // Matches all paths (for error handling)
        this.model.priority = 999;   // Lowest priority - only for errors
    }
    
    /**
     * Get icon for error route (Radical OOP: polymorphism)
     */
    public override iconGet(): string {
        return '⚠️';
    }
    
    /**
     * Get label for error route group
     */
    public override labelGet(): string {
        return '⚠️ Error Handling';
    }
    
    /**
     * Implement abstract handleRequest
     * Called by base Route.handle() with statistics tracking
     */
    protected override async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        if (res.headersSent) return;
        
        const acceptHeader = req.headers['accept'] || '';
        const isApiRequest = acceptHeader.includes('application/json') || 
                             req.url?.startsWith('/ONCE/') ||
                             req.url?.startsWith('/units');
        
        if (isApiRequest) {
            this.jsonErrorRespond(res, this.currentError);
        } else {
            this.htmlErrorRespond(res, this.currentError);
        }
    }
    
    /**
     * Handle error with error object - used by HTTPRouter.errorHandle()
     * 
     * @param req - HTTP request
     * @param res - HTTP response
     * @param error - Error object to display
     */
    public async handleWithError(req: IncomingMessage, res: ServerResponse, error: Error): Promise<void> {
        this.currentError = error;
        await this.handle(req, res);
        this.currentError = undefined;
    }
    
    /**
     * Send JSON error response
     */
    private jsonErrorRespond(res: ServerResponse, error?: Error): void {
        res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            error: 'Internal Server Error',
            message: error?.message || 'An unexpected error occurred',
            timestamp: new Date().toISOString()
        }));
    }
    
    /**
     * Send HTML error response
     */
    private htmlErrorRespond(res: ServerResponse, error?: Error): void {
        res.writeHead(500, {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(`
<!DOCTYPE html>
<html>
    <head>
        <title>500 Internal Server Error</title>
        <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; }
            h1 { color: #c00; }
            .message { color: #666; }
        </style>
    </head>
    <body>
        <h1>500 Internal Server Error</h1>
        <p class="message">${error?.message || 'An unexpected error occurred'}</p>
    </body>
</html>
        `);
    }
}






