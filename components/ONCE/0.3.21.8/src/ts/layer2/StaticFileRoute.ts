/**
 * StaticFileRoute.ts
 * 
 * Web4 Static File Route
 * Serves static files (JS, CSS, images) with correct MIME types
 * 
 * PROBLEM SOLVED:
 * - IORRoute was matching `/dist/ts/layer1/ONCE.js` as IOR pattern
 * - Browser received application/json instead of JavaScript
 * - Module loading failed with MIME type error
 * 
 * SOLUTION:
 * - StaticFileRoute has priority 5 (higher than IORRoute's 10)
 * - Matches paths with file extensions
 * - Serves files with preconfigured MIME types
 * 
 * @layer2
 * @pattern Radical OOP - Preconfigured MIME type headers
 * @pdca session/2025-12-03-UTC-0900.fix-path-authority-dry-violation.pdca.md
 */

import { Route } from './Route.js';
import { IncomingMessage, ServerResponse } from 'http';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Preconfigured MIME types for static files
 * Web4 Pattern: Configuration objects over hardcoded strings
 */
const MIME_TYPES: Record<string, string> = {
    // JavaScript (ESM)
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    
    // TypeScript (for development/source maps)
    '.ts': 'application/typescript',
    '.mts': 'application/typescript',
    
    // CSS
    '.css': 'text/css',
    
    // HTML
    '.html': 'text/html',
    '.htm': 'text/html',
    
    // JSON
    '.json': 'application/json',
    
    // Images
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    
    // Fonts
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    
    // Other
    '.txt': 'text/plain',
    '.xml': 'application/xml',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.map': 'application/json',  // Source maps
};

/**
 * File extensions that StaticFileRoute handles
 * Used for matching - if path ends with one of these, it's a static file
 */
const STATIC_FILE_EXTENSIONS = Object.keys(MIME_TYPES);

/**
 * StaticFileRoute
 * 
 * Serves static files with correct MIME types
 * 
 * Priority: 5 (higher than IORRoute's 10)
 * - Checks before IOR pattern matching
 * - Prevents IOR from misinterpreting file paths
 */
export class StaticFileRoute extends Route {
    private componentRoot: string = '';
    
    constructor() {
        super();
        this.model.name = 'StaticFileRoute';
        this.model.pattern = '/static'; // Informational - actual matching uses extension
        this.model.priority = 5; // Higher priority than IORRoute (10)
    }
    
    /**
     * Set component root for serving files
     * 
     * @param componentRoot - Root directory for serving files
     * @returns this (method chaining)
     */
    public componentRootSet(componentRoot: string): this {
        this.componentRoot = componentRoot;
        return this;
    }
    
    /**
     * Match static file pattern
     * Returns true if path has a recognized file extension
     * 
     * @param urlPath - URL path
     * @param method - HTTP method (only GET supported)
     * @returns true if path is a static file request
     */
    public matches(urlPath: string, method: HttpMethod): boolean {
        // Only GET requests for static files
        if (method !== HttpMethod.GET) {
            return false;
        }
        
        // Check if path ends with a known file extension
        const ext = this.getExtension(urlPath);
        return STATIC_FILE_EXTENSIONS.includes(ext);
    }
    
    /**
     * Get file extension from path
     * 
     * @param urlPath - URL path
     * @returns File extension (e.g., '.js') or empty string
     */
    private getExtension(urlPath: string): string {
        // Remove query string
        const pathWithoutQuery = urlPath.split('?')[0];
        const lastDot = pathWithoutQuery.lastIndexOf('.');
        
        if (lastDot === -1 || lastDot === pathWithoutQuery.length - 1) {
            return '';
        }
        
        return pathWithoutQuery.substring(lastDot).toLowerCase();
    }
    
    /**
     * Handle static file request
     * 
     * Web4 Pattern:
     * - Resolve file path securely (prevent directory traversal)
     * - Read file
     * - Set correct MIME type from preconfigured headers
     * - Return file content
     */
    protected async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const urlPath = req.url?.split('?')[0] || '/';
        
        try {
            // Resolve file path
            const filePath = this.resolvePath(urlPath);
            
            // Security check: must be within component root
            if (!filePath.startsWith(this.componentRoot)) {
                console.log(`[StaticFileRoute] FORBIDDEN: ${urlPath} resolves outside component root`);
                res.writeHead(403, { 'Content-Type': 'text/plain' });
                res.end('Forbidden');
                return;
            }
            
            // Check file exists
            if (!fs.existsSync(filePath)) {
                console.log(`[StaticFileRoute] NOT FOUND: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }
            
            // Get MIME type
            const ext = this.getExtension(urlPath);
            const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
            
            // Read and serve file
            const content = fs.readFileSync(filePath);
            
            console.log(`[StaticFileRoute] Serving: ${urlPath} (${mimeType})`);
            
            res.writeHead(200, {
                'Content-Type': mimeType,
                'Content-Length': content.length,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600' // 1 hour cache
            });
            res.end(content);
            
        } catch (error: any) {
            console.error(`[StaticFileRoute] Error serving ${urlPath}:`, error.message);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }
    
    /**
     * Resolve URL path to file system path
     * Prevents directory traversal attacks
     * 
     * @param urlPath - URL path (e.g., '/dist/ts/layer1/ONCE.js')
     * @returns Absolute file system path
     */
    private resolvePath(urlPath: string): string {
        // Normalize path (removes ../, etc.)
        const normalized = path.normalize(urlPath);
        
        // Remove leading slash
        const relativePath = normalized.startsWith('/') ? normalized.substring(1) : normalized;
        
        // Join with component root
        return path.join(this.componentRoot, relativePath);
    }
}

