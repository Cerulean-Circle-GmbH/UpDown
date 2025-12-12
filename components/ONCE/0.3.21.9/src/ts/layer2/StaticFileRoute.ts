/**
 * StaticFileRoute.ts
 * 
 * Web4 Static File Route
 * Serves static files (JS, CSS, images) with correct MIME types
 * 
 * URL Patterns (Web4 Principle 23: EAMD.ucp Virtual Root):
 * 
 * Pattern 1: /{Component}/{version}/**
 *   Example: /ONCE/0.3.21.8/src/ts/layer5/views/css/ItemView.css
 *   Resolves to: {projectRoot}/components/{Component}/{version}/...
 * 
 * Pattern 2: /EAMD.ucp/components/**
 *   Example: /EAMD.ucp/components/ONCE/0.3.21.8/dist/ts/layer1/ONCE.js
 *   Resolves to: {projectRoot}/components/...
 * 
 * Pattern 3: /EAMD.ucp/scenarios/**
 *   Example: /EAMD.ucp/scenarios/box/fritz/McDonges-3/ONCE/0.3.21.8/uuid.json
 *   Resolves to: {projectRoot}/scenarios/...
 * 
 * PROBLEM SOLVED:
 * - IORRoute was matching `/dist/ts/layer1/ONCE.js` as IOR pattern (4+ segments)
 * - Browser received application/json instead of JavaScript
 * - Module loading failed with MIME type error
 * 
 * SOLUTION:
 * - StaticFileRoute matches multiple patterns with priority 5 (higher than IORRoute's 10)
 * - /EAMD.ucp/ provides predictable, absolute paths for browser imports
 * - Serves files with preconfigured MIME types
 * 
 * @layer2
 * @pattern Radical OOP - Preconfigured MIME type headers
 * @pattern Web4 Principle 6 - Empty constructor + init()
 * @pattern Web4 Principle 16 - Object-Action naming (nameVerb)
 * @pattern Web4 Principle 19 - One file one type (MIME_TYPES in separate file)
 * @pattern Web4 Principle 23 - EAMD.ucp Virtual Root
 * @pdca session/2025-12-03-UTC-1400.lit-css-preload.pdca.md
 * @pdca session/2025-12-04-UTC-1400.self-orientation-asset-serving.pdca.md
 */

import { Route } from './Route.js';
import { IncomingMessage, ServerResponse } from 'http';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';
import { MIME_TYPES, STATIC_FILE_EXTENSIONS } from '../layer3/MIMETypes.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * StaticFileRoute
 * 
 * Serves static files from components and scenarios with correct MIME types
 * 
 * URL Patterns:
 * 
 * 1. /{Component}/{version}/** (backwards compatible)
 *    Examples:
 *    - /ONCE/0.3.21.8/src/ts/layer5/views/css/ItemView.css
 *    - /Web4TSComponent/0.3.20.6/package.json
 * 
 * 2. /EAMD.ucp/components/** (Web4 Principle 23)
 *    Examples:
 *    - /EAMD.ucp/components/ONCE/0.3.21.8/dist/ts/layer1/ONCE.js
 *    - /EAMD.ucp/components/Tootsie/0.3.20.6/dist/ts/layer4/TootsieTestRunner.js
 * 
 * 3. /EAMD.ucp/scenarios/** (Web4 Principle 23)
 *    Examples:
 *    - /EAMD.ucp/scenarios/box/fritz/McDonges-3/ONCE/0.3.21.8/uuid.json
 * 
 * Priority: 5 (higher than IORRoute's 10)
 * - Matches file extension patterns BEFORE IOR pattern matching
 * - IOR pattern: /{Component}/{version}/{uuid}/{method} (no file extension)
 * - Static pattern: has file extension
 * 
 * Web4 Principles Applied:
 * - Principle 6: Empty constructor (init via projectRootSet)
 * - Principle 16: Object-Action naming (extensionFrom, pathResolve)
 * - Principle 19: MIME_TYPES in separate file
 * - Principle 21: `import * as fs/path`
 * - Principle 23: EAMD.ucp Virtual Root
 */
export class StaticFileRoute extends Route {
    private projectRoot: string = '';
    
    /**
     * Empty constructor - Web4 Principle 6
     * Configuration via projectRootSet() method
     */
    constructor() {
        super();
        // Empty - Web4 Principle 6
    }
    
    /**
     * Initialize route with default values
     * Called after construction, before use
     * 
     * @returns this (method chaining)
     */
    public routeInit(): this {
        this.model.name = 'StaticFileRoute';
        this.model.pattern = '/{Component}/{version}/** | /EAMD.ucp/**'; // Documentation
        this.model.priority = 5; // Higher priority than IORRoute (10)
        return this;
    }
    
    /**
     * Get icon for static file route (Radical OOP: polymorphism)
     * @pdca 2025-12-12-UTC-1103.http-routes-display.pdca.md RO.HTTP.1
     */
    public override iconGet(): string {
        return '📁';
    }
    
    /**
     * Get label for static file route group
     * @pdca 2025-12-12-UTC-1103.http-routes-display.pdca.md RO.HTTP.1
     */
    public override labelGet(): string {
        return '📁 Static Files';
    }
    
    /**
     * Set project root for resolving component paths
     * Web4 Principle 16: Object-Action naming (projectRoot + Set)
     * 
     * @deprecated Use projectRootSet() - follows nameVerb pattern
     * @param componentRoot - Root directory (actually project root)
     * @returns this (method chaining)
     */
    public componentRootSet(componentRoot: string): this {
        // Extract project root from component root
        // /path/to/project/components/ONCE/0.3.21.8 -> /path/to/project
        const componentsIdx = componentRoot.indexOf('/components/');
        if (componentsIdx !== -1) {
            this.projectRoot = componentRoot.substring(0, componentsIdx);
        } else {
            this.projectRoot = componentRoot;
        }
        return this;
    }
    
    /**
     * Set project root for resolving component paths
     * Web4 Principle 16: Object-Action naming (projectRoot + Set)
     * 
     * @param projectRoot - Project root directory
     * @returns this (method chaining)
     */
    public projectRootSet(projectRoot: string): this {
        this.projectRoot = projectRoot;
        return this;
    }
    
    /**
     * Get project root
     * Web4 Principle 16: TypeScript getter
     */
    public get root(): string {
        return this.projectRoot;
    }
    
    /**
     * Match static file patterns:
     * 1. /{Component}/{version}/** - Component files (backwards compatible)
     * 2. /EAMD.ucp/components/** - Virtual root for components (Web4 P23)
     * 3. /EAMD.ucp/scenarios/** - Virtual root for scenarios (Web4 P23)
     * 
     * @param urlPath - URL path (e.g., /ONCE/0.3.21.8/src/ts/... or /EAMD.ucp/...)
     * @param method - HTTP method (only GET supported)
     * @returns true if path is a static file request
     */
    public matches(urlPath: string, method: HttpMethod): boolean {
        // Only GET requests for static files
        if (method !== HttpMethod.GET) {
            return false;
        }
        
        // Must have file extension
        const ext = this.extensionFrom(urlPath);
        if (!STATIC_FILE_EXTENSIONS.includes(ext)) {
            return false;
        }
        
        // Pattern 1: /EAMD.ucp/components/** or /EAMD.ucp/scenarios/**
        if (urlPath.startsWith('/EAMD.ucp/')) {
            const subPath = urlPath.substring('/EAMD.ucp/'.length);
            // Must start with components/ or scenarios/
            return subPath.startsWith('components/') || subPath.startsWith('scenarios/');
        }
        
        // Pattern 2: /{Component}/{version}/**
        // Example: /ONCE/0.3.21.8/src/ts/layer5/views/css/ItemView.css
        // Example: /ONCE/0.3.21.8/dist/ts/layer1/ONCE.js
        // Example: /ONCE/0.3.21.8/package.json
        const parts = urlPath.split('/').filter(p => p.length > 0);
        if (parts.length < 3) {
            return false; // Need at least: Component, version, file
        }
        
        // parts[0] = Component name (PascalCase)
        // parts[1] = version (semantic version pattern like 0.3.21.8)
        // parts[2+] = file path within component
        
        // Basic validation: version should look like a semantic version
        const version = parts[1];
        if (!/^\d+\.\d+\.\d+/.test(version)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Extract file extension from URL path
     * Private helper - extracts extension for MIME type lookup
     * 
     * @param urlPath - URL path
     * @returns File extension (e.g., '.js') or empty string
     */
    private extensionFrom(urlPath: string): string {
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
            const filePath = this.pathResolve(urlPath);
            
            // Security check: must be within project's components or scenarios directory
            const componentsDir = path.join(this.projectRoot, 'components');
            const scenariosDir = path.join(this.projectRoot, 'scenarios');
            const isValidPath = filePath.startsWith(componentsDir) || filePath.startsWith(scenariosDir);
            
            if (!isValidPath) {
                console.log(`[StaticFileRoute] FORBIDDEN: ${urlPath} resolves outside allowed paths: ${filePath}`);
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
            const ext = this.extensionFrom(urlPath);
            const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
            
            // Read and serve file
            const content = fs.readFileSync(filePath);
            
            console.log(`[StaticFileRoute] ✅ ${urlPath} → ${mimeType}`);
            
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
     * 
     * URL Patterns:
     * 1. /{Component}/{version}/** → {projectRoot}/components/{Component}/{version}/**
     * 2. /EAMD.ucp/components/** → {projectRoot}/components/**
     * 3. /EAMD.ucp/scenarios/** → {projectRoot}/scenarios/**
     * 
     * Examples:
     *   /ONCE/0.3.21.8/src/ts/... → /project/components/ONCE/0.3.21.8/src/ts/...
     *   /EAMD.ucp/components/ONCE/0.3.21.8/dist/... → /project/components/ONCE/0.3.21.8/dist/...
     *   /EAMD.ucp/scenarios/box/fritz/... → /project/scenarios/box/fritz/...
     * 
     * Prevents directory traversal attacks via path.normalize()
     * Web4 Principle 16: Object-Action naming (path + Resolve)
     * Web4 Principle 23: EAMD.ucp Virtual Root
     * 
     * @param urlPath - URL path
     * @returns Absolute file system path
     */
    private pathResolve(urlPath: string): string {
        // Normalize path (removes ../, etc.)
        const normalized = path.normalize(urlPath);
        
        // Pattern 1: /EAMD.ucp/components/** or /EAMD.ucp/scenarios/**
        if (normalized.startsWith('/EAMD.ucp/')) {
            const subPath = normalized.substring('/EAMD.ucp/'.length);
            // subPath is either "components/..." or "scenarios/..."
            // Map directly to projectRoot
            return path.join(this.projectRoot, subPath);
        }
        
        // Pattern 2: /{Component}/{version}/**
        // Remove leading slash
        const relativePath = normalized.startsWith('/') ? normalized.substring(1) : normalized;
        
        // URL: {Component}/{version}/...
        // FileSystem: {projectRoot}/components/{Component}/{version}/...
        return path.join(this.projectRoot, 'components', relativePath);
    }
}
