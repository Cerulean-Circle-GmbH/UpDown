/**
 * StaticFileRoute.ts
 * 
 * Web4 Static File Route
 * Serves static files (JS, CSS, images) with correct MIME types
 * 
 * URL Patterns (Web4 Principle 23: EAMD.ucp Virtual Root):
 * 
 * Pattern 1: /{Component}/{version}/**
 *   Example: /ONCE/0.3.21.9/src/ts/layer5/views/css/ItemView.css
 *   Resolves to: {projectRoot}/components/{Component}/{version}/...
 * 
 * Pattern 2: /EAMD.ucp/components/**
 *   Example: /EAMD.ucp/components/ONCE/0.3.21.9/dist/ts/layer1/ONCE.js
 *   Resolves to: {projectRoot}/components/...
 * 
 * Pattern 3: /EAMD.ucp/scenarios/**
 *   Example: /EAMD.ucp/scenarios/box/fritz/McDonges-3/ONCE/0.3.21.9/uuid.json
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
import type { UnitsRoute } from './UnitsRoute.js';
import type { CachedUnitModel } from '../layer3/CachedUnitModel.interface.js';
import type { Reference } from '../layer3/Reference.interface.js';
import { UnitType } from '../layer3/UnitType.enum.js';
import { CacheStrategy } from '../layer3/CacheStrategy.enum.js';
import { sha256Provider } from './SHA256Provider.js';
import { SyncStatus } from '../layer3/SyncStatus.enum.js';
import type { Scenario } from '../layer3/Scenario.interface.js';
import type { FileModel } from '../layer3/FileModel.interface.js';
import type { ArtefactModel } from '../layer3/ArtefactModel.interface.js';
import type { UnitModel } from '../layer3/UnitModel.interface.js';
import { IOR } from '../layer4/IOR.js';  // FsM.2: IOR-based file loading

/**
 * StaticFileRoute
 * 
 * Serves static files from components and scenarios with correct MIME types
 * 
 * URL Patterns:
 * 
 * 1. /{Component}/{version}/** (backwards compatible)
 *    Examples:
 *    - /ONCE/0.3.21.9/src/ts/layer5/views/css/ItemView.css
 *    - /Web4TSComponent/0.3.20.6/package.json
 * 
 * 2. /EAMD.ucp/components/** (Web4 Principle 23)
 *    Examples:
 *    - /EAMD.ucp/components/ONCE/0.3.21.9/dist/ts/layer1/ONCE.js
 *    - /EAMD.ucp/components/Tootsie/0.3.20.6/dist/ts/layer4/TootsieTestRunner.js
 * 
 * 3. /EAMD.ucp/scenarios/** (Web4 Principle 23)
 *    Examples:
 *    - /EAMD.ucp/scenarios/box/fritz/McDonges-3/ONCE/0.3.21.9/uuid.json
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
    private unitsRoute: Reference<UnitsRoute> = null;
    private registeredUnits: Set<string> = new Set();
    private componentVersion: string = '0.3.22.1';
    
    /**
     * Empty constructor - Web4 Principle 6
     * Configuration via projectRootSet() method
     */
    constructor() {
        super();
        // Empty - Web4 Principle 6
    }
    
    /**
     * Set the UnitsRoute for unit registration
     * Web4 P16: Object-Action naming
     */
    public unitsRouteSet(route: UnitsRoute): this {
        this.unitsRoute = route;
        return this;
    }
    
    /**
     * Set component version for IOR generation
     */
    public componentVersionSet(version: string): this {
        this.componentVersion = version;
        return this;
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
        // /path/to/project/components/ONCE/0.3.21.9 -> /path/to/project
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
     * @param urlPath - URL path (e.g., /ONCE/0.3.21.9/src/ts/... or /EAMD.ucp/...)
     * @param method - HTTP method (only GET supported)
     * @returns true if path is a static file request
     */
    public matches(urlPath: string, method: HttpMethod): boolean {
        // Only GET requests for static files
        if (method !== HttpMethod.GET) {
            return false;
        }
        
        // Check if it's a file (has extension) or directory (no extension)
        const ext = this.extensionFrom(urlPath);
        const isFile = STATIC_FILE_EXTENSIONS.includes(ext);
        // Directory: no file extension, or ends with /
        // Check last segment for file extension, not whole path (version numbers have dots)
        const lastSegment = urlPath.split('/').filter(s => s.length > 0).pop() || '';
        const lastSegmentHasExtension = lastSegment.includes('.') && STATIC_FILE_EXTENSIONS.includes('.' + lastSegment.split('.').pop()?.toLowerCase());
        const isDirectory = !isFile && (urlPath.endsWith('/') || !lastSegmentHasExtension);
        
        if (!isFile && !isDirectory) {
            return false;
        }
        
        // Pattern 1: /EAMD.ucp/components/** or /EAMD.ucp/scenarios/**
        if (urlPath.startsWith('/EAMD.ucp/')) {
            const subPath = urlPath.substring('/EAMD.ucp/'.length);
            // Must start with components/ or scenarios/
            return subPath.startsWith('components/') || subPath.startsWith('scenarios/');
        }
        
        // Pattern 2: /{Component}/{version}/**
        // Example: /ONCE/0.3.21.9/src/ts/layer5/views/css/ItemView.css
        // Example: /ONCE/0.3.21.9/dist/ts/layer1/ONCE.js
        // Example: /ONCE/0.3.21.9/package.json
        const parts = urlPath.split('/').filter(p => p.length > 0);
        if (parts.length < 2) {
            return false; // Need at least: Component, version (+ optional path for directories)
        }
        
        // parts[0] = Component name (PascalCase)
        // parts[1] = version (semantic version pattern like 0.3.21.9)
        // parts[2+] = file path within component
        
        // Basic validation: version should look like a semantic version
        const version = parts[1];
        if (!/^\d+\.\d+\.\d+/.test(version)) {
            return false;
        }
        
        // ⚠️ FIX 16: Reject IOR patterns to prevent route shadowing
        // IOR pattern: /{Component}/{version}/{uuid}/{method}
        // IOR URLs have 4+ segments, UUID in position 3, no file extension
        // @pdca 2025-12-17-UTC-1613.web4-principles-review.pdca.md Fix 16
        if (parts.length >= 4 && !lastSegmentHasExtension) {
            const potentialUuid = parts[2];
            // UUID pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidPattern.test(potentialUuid)) {
                return false; // This is an IOR URL, let IORRoute handle it
            }
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
            
            // Check file/directory exists
            if (!fs.existsSync(filePath)) {
                console.log(`[StaticFileRoute] NOT FOUND: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }
            
            // Handle directory listing
            // @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                const entries = fs.readdirSync(filePath, { withFileTypes: true });
                const listing = entries.map(function(entry) {
                    return {
                        name: entry.name,
                        isDirectory: entry.isDirectory(),
                        isFile: entry.isFile(),
                        isSymbolicLink: entry.isSymbolicLink()
                    };
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ entries: listing }));
                return;
            }
            
            // Get MIME type
            const ext = this.extensionFrom(urlPath);
            const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
            
            // FsM.2: Read file via IOR (P2P pattern)
            // Uses FileLoader on Node.js, HTTPSLoader fallback on browser
            const fileIor = new IOR<Buffer>().initRemote(`ior:file://${filePath}`);
            const content = await fileIor.resolve();
            
            if (!content) {
                console.log(`[StaticFileRoute] IOR returned null for: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }
            
            console.log(`[StaticFileRoute] ✅ ${urlPath} → ${mimeType} (via IOR)`);
            
            res.writeHead(200, {
                'Content-Type': mimeType,
                'Content-Length': content.length,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600' // 1 hour cache
            });
            res.end(content);
            
            // Register as Unit for ServiceWorker caching (I.6 + I.9.9-I.9.13)
            this.unitRegisterForPath(urlPath, filePath, content, mimeType);
            
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
     *   /ONCE/0.3.21.9/src/ts/... → /project/components/ONCE/0.3.21.9/src/ts/...
     *   /EAMD.ucp/components/ONCE/0.3.21.9/dist/... → /project/components/ONCE/0.3.21.9/dist/...
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
    
    // ═══════════════════════════════════════════════════════════════
    // Unit Registration (I.6 + I.9.9-I.9.13)
    // Creates proper Scenario<FileModel> + Scenario<ArtefactModel> + Scenario<UnitModel>
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Register a served file as a Unit for ServiceWorker caching (I.9.9-I.9.13)
     * 
     * Creates the full Web4 scenario structure:
     * - Scenario<FileModel>: file metadata
     * - Scenario<ArtefactModel>: content-addressable storage (deduplication)
     * - Scenario<UnitModel>: links File + Artefact + references
     * 
     * Only registers each path once (deduplicated by URL path)
     * 
     * @param urlPath URL path of the served file
     * @param filePath Absolute filesystem path
     * @param content File content as Buffer
     * @param mimeType MIME type
     */
    private unitRegisterForPath(
        urlPath: string, 
        filePath: string,
        content: Buffer,
        mimeType: string
    ): void {
        // Skip if no UnitsRoute configured
        if (!this.unitsRoute) {
            return;
        }
        
        // Skip if already registered (deduplication by URL)
        if (this.registeredUnits.has(urlPath)) {
            return;
        }
        
        const now = Date.now();
        const nowIso = new Date().toISOString();
        
        // I.9.10: Compute content hash (for Artefact deduplication)
        const contentHash = sha256Provider.contentIdCreateSync(content) || crypto.randomUUID();
        
        // Generate UUIDs
        const fileUuid = crypto.randomUUID();
        const unitUuid = crypto.randomUUID();
        // Note: Artefact UUID = contentHash (content-addressable!)
        
        const filename = this.nameFromPath(urlPath);
        
        // I.9.9: Create Scenario<FileModel>
        const fileScenario: Scenario<FileModel> = {
            ior: { uuid: fileUuid, component: 'File', version: this.componentVersion },
            owner: 'ONCE/' + this.componentVersion,
            model: {
                uuid: fileUuid,
                name: filename,           // Required by Model
                path: filePath,
                filename: filename,
                mimetype: mimeType,
                size: content.length,
                contentHash: contentHash,
                createdAt: now,
                modifiedAt: now,
                isLink: false,            // Not a symlink
                linkTarget: null,         // No link target
                content: null             // Server-side: content served directly, not stored in model
            }
        };
        
        // I.9.10: Create Scenario<ArtefactModel> (content-addressable)
        const artefactScenario: Scenario<ArtefactModel> = {
            ior: { uuid: contentHash, component: 'Artefact', version: this.componentVersion },
            owner: 'ONCE/' + this.componentVersion,
            model: {
                uuid: contentHash,        // Artefact UUID = content hash!
                name: `Artefact-${contentHash.substring(0, 8)}`,  // Required by Model
                contentHash: contentHash,
                algorithm: 'SHA-256',
                size: content.length,
                unitUuid: unitUuid,
                createdAt: now,
                mimetype: mimeType
            }
        };
        
        // I.9.11: Create Scenario<UnitModel> linking File + Artefact
        // UnitModel from Unit/0.3.0.5 MASTER: createdAt/updatedAt are ISO strings, not numbers
        const unitScenario: Scenario<UnitModel> = {
            ior: { uuid: unitUuid, component: 'Unit', version: this.componentVersion },
            owner: 'ONCE/' + this.componentVersion,
            model: {
                uuid: unitUuid,
                name: `Unit-${filename}`,   // Required by Model
                origin: `ior:fs:${filePath}`,  // Unit/0.3.0.5 MASTER
                definition: `ior:url:${urlPath}`,  // Unit/0.3.0.5 MASTER
                indexPath: '',  // Will be set when stored
                createdAt: nowIso,  // ISO string, not number
                updatedAt: nowIso,  // ISO string, not number (was modifiedAt)
                // ONCE-specific extensions (optional)
                componentType: 'File',
                componentIor: `ior:esm:/File/${this.componentVersion}/${fileUuid}`,
                artefactUuid: contentHash,
                fileUuid: fileUuid,
                storagePath: null,
                // I.9.12: Add references for filesystem path and URL path
                references: [
                    {
                        linkLocation: `ior:fs:${filePath}`,
                        linkTarget: `ior:unit:${unitUuid}`,
                        syncStatus: SyncStatus.SYNCED
                    },
                    {
                        linkLocation: `ior:url:${urlPath}`,
                        linkTarget: `ior:unit:${unitUuid}`,
                        syncStatus: SyncStatus.SYNCED
                    }
                ]
            }
        };
        
        // I.9.13: Register Unit with UnitsRoute for ServiceWorker
        // Convert to CachedUnitModel format for UnitsRoute
        const cachedUnit: CachedUnitModel = {
            uuid: unitUuid,
            name: this.nameFromPath(urlPath),
            ior: urlPath,
            unitType: this.unitTypeFromMime(mimeType),
            cacheStrategy: CacheStrategy.CACHE_FIRST,
            version: this.componentVersion,
            hash: contentHash,
            size: content.length,
            mimeType: mimeType,
            dependencies: [],
            cachedAt: nowIso,
            lastAccessedAt: nowIso,
            accessCount: 1
        };
        
        this.unitsRoute.unitRegister(cachedUnit);
        this.registeredUnits.add(urlPath);
        
        console.log(`[StaticFileRoute] 📦 Unit: ${unitUuid.substring(0, 8)}... File: ${fileUuid.substring(0, 8)}... Artefact: ${contentHash.substring(0, 16)}...`);
    }
    
    /**
     * Extract filename from path
     */
    private nameFromPath(urlPath: string): string {
        const parts = urlPath.split('/');
        return parts[parts.length - 1] || 'unknown';
    }
    
    /**
     * Determine UnitType from MIME type
     */
    private unitTypeFromMime(mimeType: string): UnitType {
        if (mimeType.includes('javascript')) return UnitType.JAVASCRIPT;
        if (mimeType.includes('css')) return UnitType.CSS;
        if (mimeType.includes('html')) return UnitType.HTML;
        if (mimeType.includes('json')) return UnitType.JSON;
        if (mimeType.includes('image')) return UnitType.IMAGE;
        if (mimeType.includes('font')) return UnitType.FONT;
        return UnitType.OTHER;
    }
}
