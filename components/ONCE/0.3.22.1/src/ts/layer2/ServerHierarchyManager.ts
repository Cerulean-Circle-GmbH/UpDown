/**
 * Server Hierarchy Manager v0.3.0.0 - HTTPS by Default
 * Implements requirement 9beee86b-09c2-43c8-b449-b9a7b8f2b338
 * 
 * @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
 * 
 * H.2: HTTP Redirect Server (42000 → 42777)
 * H.3: HTTPS as Default for ALL Servers
 */

import { createServer, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { exec } from 'child_process';
import { PortManager } from './PortManager.js';
import { ONCEServerModel } from '../layer3/ONCEServerModel.interface.js';
import { LifecycleState } from '../layer3/LifecycleEvents.js';
import { IOR, iorToUrl } from '../layer3/IOR.js';
import { IDProvider } from '../layer3/IDProvider.interface.js';
import { UUIDProvider } from './UUIDProvider.js';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { realpathSync } from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as http from 'http';
import { logAction, logBroadcast, logRegistration, logConnection, logDisconnection, shortUUID, serverIdentity } from '../layer1/LoggingUtils.js';
// ⚠️ DELETED: ONCEScenarioMessage - Protocol violation (Web4 is protocol-less)
// @pdca 2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md - Iteration 1.6.2
import { NodeOSInfrastructure } from '../layer1/NodeOSInfrastructure.js';
import { EnvironmentModel } from '../layer3/EnvironmentModel.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import type { ONCEPeerModel } from '../layer3/ONCEPeerModel.interface.js';
import { HostnameParser } from '../layer1/HostnameParser.js';
import { IORMethodRouter } from '../layer4/IORMethodRouter.js';
import { HTTPServer } from './HTTPServer.js';
import { HTTPSServer } from './HTTPSServer.js';
import { HTTPRouter } from './HTTPRouter.js';
import { TLSOptions } from '../layer3/TLSOptions.interface.js';
import { HTMLRoute } from './HTMLRoute.js';
import { ScenarioRoute } from './ScenarioRoute.js';
import { IORRoute } from './IORRoute.js';
import { StaticFileRoute } from './StaticFileRoute.js';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';
// PWA Routes
import { UnitsRoute } from './UnitsRoute.js';
import { ManifestRoute } from './ManifestRoute.js';
import { ServiceWorkerRoute } from './ServiceWorkerRoute.js';

/**
 * Default ports for HTTPS servers
 */
const HTTP_REDIRECT_PORT = 42000;   // HTTP redirect → HTTPS
const PRIMARY_HTTPS_PORT = 42777;   // Primary HTTPS server
const SECONDARY_PORT_START = 8080;  // Secondary HTTPS servers

/**
 * Server registry entry for primary server
 * ✅ Protocol-Less: Stores scenarios, not message data
 * @pdca 2025-11-22-UTC-1500.iteration-01.6.4b-protocol-less-registry.pdca.md
 */
export interface ServerRegistryEntry {
    scenario: Scenario<ONCEPeerModel>;  // MC.3: Now uses ONCEPeerModel
    lastSeen: string;
    websocket?: WebSocket;  // KEEP for browser peers (NOT for peer kernel registration)
}

/**
 * Server Hierarchy Manager - manages ONCE v0.3.0.0 server hierarchy
 * 
 * ✅ HTTPS by Default for ALL servers (primary + secondaries)
 * ✅ HTTP Redirect Server on port 42000 (primary only)
 * ✅ PWA Support (Service Worker requires HTTPS)
 * 
 * Handles primary server (42777 HTTPS) and client server registration (8080+ HTTPS)
 * 
 * @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
 */
export class ServerHierarchyManager {
    private serverModel: ONCEServerModel;
    private httpServer?: HTTPServer; // ✅ Web4 Radical OOP HTTPServer (HTTPS by default)
    private httpRouter: HTTPRouter; // ✅ Web4 Radical OOP HTTPRouter
    private httpRedirectServer?: http.Server; // ✅ HTTP→HTTPS redirect (primary only, port 42000)
    private wsServer?: WebSocketServer;
    private portManager: PortManager;
    private serverRegistry: Map<string, ServerRegistryEntry> = new Map();
    private primaryServerConnection?: WebSocket;
    private browserClients: Set<WebSocket> = new Set(); // Track browser WebSocket connections
    private infrastructure: NodeOSInfrastructure; // ✅ Layer 1 infrastructure injection
    private iorRouter: IORMethodRouter; // ✅ IOR method router for Web4 routing
    private idProvider: IDProvider; // ✅ Web4 Principle 20: Radical OOP ID generation
    component?: any; // Backward link to DefaultONCE for path authority
    version: string; // ✅ Self-discovered version (ALWAYS set, never undefined)
    private tlsConfig?: TLSOptions; // ✅ Auto-discovered TLS configuration

    constructor(idProvider: IDProvider = new UUIDProvider()) {
        this.idProvider = idProvider; // ✅ Inject ID provider (testable, replaceable)
        this.portManager = PortManager.getInstance();
        this.infrastructure = new NodeOSInfrastructure(); // ✅ Create infrastructure
        this.iorRouter = new IORMethodRouter(); // ✅ Create IOR router (kernel injected later)
        this.httpRouter = new HTTPRouter(); // ✅ Create HTTP router (routes registered later)
        
        // ✅ Self-discover version from own location (ALWAYS set in constructor)
        // This ensures version is NEVER undefined, eliminating need for fallbacks
        const currentFileUrl = new URL(import.meta.url);
        const currentFilePath = path.dirname(fileURLToPath(currentFileUrl));
        const currentVersionDir = realpathSync(path.resolve(currentFilePath, '..', '..', '..'));
        const componentDirName = path.basename(currentVersionDir);
        this.version = /^\d+\.\d+\.\d+\.\d+$/.test(componentDirName) 
            ? componentDirName 
            : '0.0.0.0';  // Known fallback for development (not a bug-hiding fallback)
        
        // Initialize peer model with defaults (inlined from ONCEServerModel.ts)
        this.serverModel = {
            uuid: this.idProvider.create(), // ✅ Web4 Principle 20: Radical OOP ID generation
            pid: process.pid,
            state: LifecycleState.CREATED,
            platform: this.detectEnvironment(),
            domain: 'local.once', // ✅ Will be detected dynamically
            hostname: 'localhost', // ✅ Will be detected dynamically
            host: 'localhost', // ✅ Will be detected dynamically
            ip: '127.0.0.1', // ✅ Will be detected dynamically
            capabilities: [],
            isPrimaryServer: false
        } as ONCEServerModel;
        
        // ✅ FIX: Call synchronous hostname detection immediately in constructor
        this.detectAndSetEnvironmentSync();
    }
    
    /**
     * Detect and set environment using NodeOSInfrastructure (TRUE Radical OOP)
     * Must be called after construction and before startServer()
     */
    public async detectAndSetEnvironment(): Promise<void> {
        const env: EnvironmentModel = await this.infrastructure.detectEnvironment();
        this.serverModel.hostname = env.getHostname();
        this.serverModel.host = env.getFqdn();
        this.serverModel.ip = env.getPrimaryIP();
        this.serverModel.domain = env.getDomain();
    }
    
    /**
     * Synchronous version of detectAndSetEnvironment() for use in constructor
     * Uses direct os module calls (will be improved in Iteration 2 with Layer 1)
     * ✅ Web4 Principle 7: Async only in Layer 4 (this is sync for Layer 2)
     * ✅ Web4 Principle 8: DRY - Uses HostnameParser utility class
     * @private
     */
    private detectAndSetEnvironmentSync(): void {
        try {
            // Detect hostname using os.hostname()
            const fullHostname = os.hostname();
            
            if (fullHostname && fullHostname !== 'localhost') {
                // ✅ DRY: Use HostnameParser instead of inline logic
                const parsed = HostnameParser.parseFQDN(fullHostname);
                
                this.serverModel.host = parsed.fqdn;              // "McDonges-3.fritz.box"
                this.serverModel.hostname = parsed.hostname;       // "McDonges-3"
                this.serverModel.domain = parsed.domainReversed;   // "box.fritz" (reversed for paths)
                
                // Detect IP address from network interfaces
                const interfaces = os.networkInterfaces();
                for (const name of Object.keys(interfaces)) {
                    const ifaces = interfaces[name];
                    if (ifaces) {
                        for (const iface of ifaces) {
                            // Skip internal (loopback) interfaces
                            if (iface.family === 'IPv4' && !iface.internal) {
                                this.serverModel.ip = iface.address;
                                break;
                            }
                        }
                    }
                    // Break outer loop if we found a non-loopback IP
                    if (this.serverModel.ip !== '127.0.0.1') break;
                }
            }
            // If detection fails, keep fallback values from model initialization
        } catch (error) {
            // If detection fails, keep fallback values
            console.warn('⚠️  Hostname detection failed, using fallback values:', error);
        }
    }
    
    /**
     * Setter for infrastructure (JavaBean pattern for testability)
     */
    public setInfrastructure(infrastructure: NodeOSInfrastructure): void {
        this.infrastructure = infrastructure;
    }
    
    /**
     * Getter for infrastructure (JavaBean pattern)
     */
    public getInfrastructure(): NodeOSInfrastructure {
        return this.infrastructure;
    }
    
    /**
     * Register all HTTP routes
     * 
     * Web4 Pattern:
     * - Routes registered with priorities
     * - IOR routes have highest priority (10)
     * - HTML routes have medium priority (50)
     * - Scenario routes have normal priority (100)
     * 
     * @pdca 2025-12-01-UTC-0950.iteration-05-phase5-7-httpserver-router-refactoring.pdca.md
     */
    private registerRoutes(): void {
        // ✅ Route 0: Static Files (HIGHEST PRIORITY)
        // Serves .js, .css, .html, etc. with correct MIME types
        // Priority 5 - higher than IOR (10) to prevent mismatching file paths
        const staticRoute = new StaticFileRoute();
        staticRoute.routeInit(); // Web4 Principle 6: init after empty constructor
        staticRoute.model.uuid = this.idProvider.create();
        staticRoute.componentRootSet(this.component!.model.componentRoot || '');
        this.httpRouter.registerRoute(staticRoute);
        
        // ✅ Route 1: IOR Method Invocation
        // Initialize IOR router with ONCE kernel and ID provider
        if (!this.iorRouter.model.uuid) {
            // ✅ Web4 Principle 6: init() handles complete initialization including UUID
            this.iorRouter.init(undefined, this.component, this.idProvider);
        }
        
        const iorRoute = new IORRoute(this.iorRouter);
        iorRoute.model.uuid = this.idProvider.create(); // ✅ Web4 Principle 20
        iorRoute.model.pattern = '/{component}/{version}/{uuid}/{method}'; // Documentation only
        iorRoute.model.method = HttpMethod.GET; // Accepts all methods
        iorRoute.model.priority = 10; // Highest priority
        this.httpRouter.registerRoute(iorRoute);
        
        // ✅ Route 2: Home page ("/") - Lit-based OncePeerDefaultView
        // @pdca 2025-11-19-UTC-1800.iteration-tracking.pdca.md
        const homeRoute = new HTMLRoute();
        homeRoute.model.uuid = this.idProvider.create(); // ✅ Web4 Principle 20
        homeRoute.setPattern('/', HttpMethod.GET);
        // ✅ Web4: Use once.html SPA - UcpRouter handles view selection
        // / renders once-peer-default-view via UcpRouter
        // @pdca 2025-12-09-UTC-1800.ucpview-framework-independence.pdca.md Phase H.0
        homeRoute.setProvider(() => this.component!.serveOnceApp());
        homeRoute.model.priority = 50;
        this.httpRouter.registerRoute(homeRoute);
        
        // ✅ Route 3: Demo Hub ("/demo") - NOW serves Lit MVC view
        // @pdca 2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md - A.3
        const demoRoute = new HTMLRoute();
        demoRoute.model.uuid = this.idProvider.create();
        demoRoute.setPattern('/demo', HttpMethod.GET);
        demoRoute.setProvider(() => this.component!.serveDemoLit()); // ✅ Now serves Lit view
        demoRoute.model.priority = 50;
        this.httpRouter.registerRoute(demoRoute);
        
        // ✅ Route 3b: Demo Hub with trailing slash ("/demo/")
        const demoRoute2 = new HTMLRoute();
        demoRoute2.model.uuid = this.idProvider.create();
        demoRoute2.setPattern('/demo/', HttpMethod.GET);
        demoRoute2.setProvider(() => this.component!.serveDemoLit()); // ✅ Now serves Lit view
        demoRoute2.model.priority = 50;
        this.httpRouter.registerRoute(demoRoute2);
        
        // ✅ Route 3c: Demo Lit MVC ("/demo-lit") - Alias for /demo
        const demoLitRoute = new HTMLRoute();
        demoLitRoute.model.uuid = this.idProvider.create();
        demoLitRoute.setPattern('/demo-lit', HttpMethod.GET);
        demoLitRoute.setProvider(() => this.component!.serveDemoLit());
        demoLitRoute.model.priority = 50;
        this.httpRouter.registerRoute(demoLitRoute);
        
        // ✅ Route 3d: Legacy demo-hub ("/demo-legacy") - Old demo-hub.html
        const demoLegacyRoute = new HTMLRoute();
        demoLegacyRoute.model.uuid = this.idProvider.create();
        demoLegacyRoute.setPattern('/demo-legacy', HttpMethod.GET);
        demoLegacyRoute.setProvider(() => this.component!.serveDemoHub()); // Old demo
        demoLegacyRoute.model.priority = 50;
        this.httpRouter.registerRoute(demoLegacyRoute);
        
        // ✅ Route 3e: ONCE App ("/app") - Minimal SPA entry point
        // @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
        const appRoute = new HTMLRoute();
        appRoute.model.uuid = this.idProvider.create();
        appRoute.setPattern('/app', HttpMethod.GET);
        appRoute.setProvider(() => this.component!.serveOnceApp());
        appRoute.model.priority = 50;
        this.httpRouter.registerRoute(appRoute);
        
        // ✅ Route 4: ONCE Minimal ("/once")
        const onceRoute = new HTMLRoute();
        onceRoute.model.uuid = this.idProvider.create(); // ✅ Web4 Principle 20
        onceRoute.setPattern('/once', HttpMethod.GET);
        onceRoute.setProvider(() => this.component!.serveOnceMinimal());
        onceRoute.model.priority = 50;
        this.httpRouter.registerRoute(onceRoute);
        
        // ✅ Route 5: ONCE Minimal with trailing slash ("/once/")
        const onceRoute2 = new HTMLRoute();
        onceRoute2.model.uuid = this.idProvider.create(); // ✅ Web4 Principle 20
        onceRoute2.setPattern('/once/', HttpMethod.GET);
        onceRoute2.setProvider(() => this.component!.serveOnceMinimal());
        onceRoute2.model.priority = 50;
        this.httpRouter.registerRoute(onceRoute2);
        
        // ✅ Route 6: Communication Log ("/onceCommunicationLog")
        const logRoute = new HTMLRoute();
        logRoute.model.uuid = this.idProvider.create(); // ✅ Web4 Principle 20
        logRoute.setPattern('/onceCommunicationLog', HttpMethod.GET);
        logRoute.setProvider(() => this.component!.serveOnceCommunicationLog());
        logRoute.model.priority = 50;
        this.httpRouter.registerRoute(logRoute);
        
        // ✅ Route 7: Communication Log with trailing slash ("/onceCommunicationLog/")
        const logRoute2 = new HTMLRoute();
        logRoute2.model.uuid = this.idProvider.create(); // ✅ Web4 Principle 20
        logRoute2.setPattern('/onceCommunicationLog/', HttpMethod.GET);
        logRoute2.setProvider(() => this.component!.serveOnceCommunicationLog());
        logRoute2.model.priority = 50;
        this.httpRouter.registerRoute(logRoute2);
        
        // ✅ Route 7b: File Browser ("/EAMD.ucp") - Folder browser SPA
        // @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md R.1
        const eamdRoute = new HTMLRoute();
        eamdRoute.model.uuid = this.idProvider.create();
        eamdRoute.setPattern('/EAMD.ucp', HttpMethod.GET);
        eamdRoute.setProvider(() => this.component!.serveDemoLit()); // Use same SPA as /demo
        eamdRoute.model.priority = 50;
        this.httpRouter.registerRoute(eamdRoute);
        
        // ✅ Route 7c: File Browser with trailing slash ("/EAMD.ucp/")
        const eamdRoute2 = new HTMLRoute();
        eamdRoute2.model.uuid = this.idProvider.create();
        eamdRoute2.setPattern('/EAMD.ucp/', HttpMethod.GET);
        eamdRoute2.setProvider(() => this.component!.serveDemoLit());
        eamdRoute2.model.priority = 50;
        this.httpRouter.registerRoute(eamdRoute2);
        
        // ✅ Route 7d: File Browser catch-all for deep folder paths
        // Handles direct navigation to /EAMD.ucp/components/.../folder
        // Matches directory paths (with or without trailing slash), not files
        // @pdca 2025-12-11-UTC-1400.file-browser-eamd-route.pdca.md
        const eamdCatchAll = new HTMLRoute();
        eamdCatchAll.model.uuid = this.idProvider.create();
        eamdCatchAll.model.name = 'EAMD.ucp Folder Browser Catch-All';
        // Custom matcher for directory paths under /EAMD.ucp/
        // Serves SPA for browser navigation, skips API requests (?format=json)
        eamdCatchAll.matches = function(urlPath: string, method: HttpMethod): boolean {
            if (method !== HttpMethod.GET) return false;
            // Skip API requests that want JSON (FolderOverView uses this)
            if (urlPath.includes('?format=json') || urlPath.includes('&format=json')) return false;
            // Extract path without query string
            const pathOnly = urlPath.split('?')[0];
            // Must start with /EAMD.ucp/
            if (!pathOnly.startsWith('/EAMD.ucp/')) return false;
            // Get last segment (handles both with and without trailing slash)
            const segments = pathOnly.split('/').filter(s => s.length > 0);
            const lastSegment = segments[segments.length - 1] || '';
            // File extensions to exclude (serve via StaticFileRoute instead)
            const fileExtensions = /\.(js|ts|css|html|json|svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|map|md|txt|sh|xml)$/i;
            if (fileExtensions.test(lastSegment)) return false;
            // Otherwise it's a directory path - serve SPA
            return true;
        };
        eamdCatchAll.setProvider(() => this.component!.serveDemoLit());
        eamdCatchAll.model.priority = 4; // Lower number = higher priority than StaticFileRoute (5)
        this.httpRouter.registerRoute(eamdCatchAll);
        
        // ✅ Route 8: Health endpoint ("/health") - Returns Scenario
        const healthRoute = new ScenarioRoute();
        healthRoute.model.uuid = this.idProvider.create(); // ✅ Web4 Principle 20
        healthRoute.setPattern('/health', HttpMethod.GET);
        healthRoute.setProvider(async () => {
            const health = this.component!.getHealth();
            // Convert to proper Scenario<T> format
            return {
                ior: {
                    uuid: this.serverModel.uuid,
                    component: 'ONCE',
                    version: this.version
                },
                owner: 'system',
                model: health
            };
        });
        healthRoute.model.priority = 100;
        
        // ✅ Route 9: Asset Manifest ("/asset-manifest") - CSS and HTML template discovery
        // @pdca 2025-12-03-UTC-1400.lit-css-preload.pdca.md
        const assetManifestRoute = new ScenarioRoute();
        assetManifestRoute.model.uuid = this.idProvider.create();
        assetManifestRoute.setPattern('/asset-manifest', HttpMethod.GET);
        assetManifestRoute.setProvider(async () => {
            const manifest = await this.component!.getAssetManifest();
            return {
                ior: {
                    uuid: this.serverModel.uuid,
                    component: 'ONCE',
                    version: this.version
                },
                owner: 'system',
                model: manifest
            };
        });
        assetManifestRoute.model.priority = 100;
        this.httpRouter.registerRoute(healthRoute);
        this.httpRouter.registerRoute(assetManifestRoute);
        
        // ✅ Route 10: Routes list ("/routes") - Returns HTTP routes for browser UI
        // @pdca 2025-12-12-UTC-1103.http-routes-display.pdca.md RO.HTTP.2
        const routesRoute = new ScenarioRoute();
        routesRoute.model.uuid = this.idProvider.create();
        routesRoute.setPattern('/routes', HttpMethod.GET);
        routesRoute.setProvider(async () => {
            return {
                ior: {
                    uuid: this.serverModel.uuid,
                    component: 'ONCE',
                    version: this.version
                },
                owner: 'system',
                model: {
                    routes: this.httpRouter.routesGet()
                }
            };
        });
        routesRoute.model.priority = 100;
        this.httpRouter.registerRoute(routesRoute);
        
        // ═══════════════════════════════════════════════════════════════
        // PWA ROUTES (Service Worker, Manifest, Units)
        // @pdca 2025-12-12-UTC-1230.pwa-offline-unit-cache.pdca.md
        // ═══════════════════════════════════════════════════════════════
        
        // ✅ Route 11: Service Worker ("/sw.js") - Self-registering OnceServiceWorker
        const swRoute = new ServiceWorkerRoute();
        swRoute.init();
        swRoute.model.uuid = this.idProvider.create();
        swRoute.componentRootSet(this.component!.model.componentRoot || '');
        this.httpRouter.registerRoute(swRoute);
        
        // ✅ Route 12: PWA Manifest ("/manifest.json") - Enables PWA install
        const manifestRoute = new ManifestRoute();
        manifestRoute.init();
        manifestRoute.model.uuid = this.idProvider.create();
        manifestRoute.nameSet('ONCE - Open Network Computing Environment')
            .shortNameSet('ONCE')
            .descriptionSet('Web4 Progressive Web Application')
            .themeColorSet('#0f3460')
            .backgroundColorSet('#1a1a2e')
            .iconAdd('/EAMD.ucp/components/ONCE/' + this.version + '/src/assets/icon-192.svg', '192x192', 'image/svg+xml', 'any')
            .iconAdd('/EAMD.ucp/components/ONCE/' + this.version + '/src/assets/icon-512.svg', '512x512', 'image/svg+xml', 'any');
        this.httpRouter.registerRoute(manifestRoute);
        
        // ✅ Route 13: Units Registry ("/units") - For Service Worker precache
        const unitsRoute = new UnitsRoute();
        unitsRoute.init();
        unitsRoute.model.uuid = this.idProvider.create();
        unitsRoute.componentVersionSet(this.version);
        // Register critical units for offline support
        unitsRoute.unitsFromFilesGenerate('/EAMD.ucp/components/ONCE/' + this.version, [
            'dist/ts/layer2/BrowserOnce.js',
            'dist/ts/layer4/BrowserOnceOrchestrator.js',
            'dist/ts/layer5/views/OnceOverView.js',
            'dist/ts/layer5/views/OncePeerDefaultView.js',
            'dist/ts/layer5/views/OncePeerItemView.js',
            'dist/ts/layer5/views/DefaultItemView.js',
            'dist/ts/layer5/views/css/OnceOverView.css',
            'dist/ts/layer5/views/css/OncePeerItemView.css',
            'dist/ts/layer5/views/css/DefaultItemView.css'
        ]);
        this.httpRouter.registerRoute(unitsRoute);
        
        // Note: /servers route registered after port is bound (see registerPrimaryOnlyRoutes)
        
        console.log(`📍 Registered ${this.httpRouter.model.routes.length} routes in HTTPRouter`);
    }
    
    /**
     * Register routes that are only available on primary server
     * Called AFTER port binding determines isPrimaryServer status
     * @pdca 2025-12-03-UTC-1930.websocket-scenario-broadcast.pdca.md
     */
    private registerPrimaryOnlyRoutes(): void {
        if (!this.serverModel.isPrimaryServer) {
            return;
        }
        
        // ✅ Route: Servers list ("/servers") - Returns Scenario (Primary only)
        const serversRoute = new ScenarioRoute();
        serversRoute.model.uuid = this.idProvider.create();
        serversRoute.setPattern('/servers', HttpMethod.GET);
        serversRoute.setProvider(async () => {
            const serverList = this.component!.getServers();
            return {
                ior: {
                    uuid: this.serverModel.uuid,
                    component: 'ONCE',
                    version: this.version
                },
                owner: 'system',
                model: serverList
            };
        });
        serversRoute.model.priority = 100;
        this.httpRouter.registerRoute(serversRoute);
        
        console.log(`📍 Registered /servers route (Primary only)`);
    }

    /**
     * Start server with automatic port management and hierarchy
     * 
     * ✅ Web4 Principle: Retry on EADDRINUSE to handle race conditions
     * The PortManager.isPortAvailable() has a TOCTOU race where the port
     * check closes the test server before the real server binds.
     */
    async startServer(): Promise<void> {
        this.serverModel.state = LifecycleState.STARTING;

        try {
            // ✅ FIX: Detect hostname/domain/IP before starting peer kernel
            await this.detectAndSetEnvironment();
            
            // Try to find and bind to an available port with retry logic
            const boundPort = await this.findAndBindPort();
            
            // Start WebSocket peer communication
            await this.startWebSocketServer();
            
            if (this.serverModel.isPrimaryServer) {
                // ✅ Register primary-only routes after port is bound
                this.registerPrimaryOnlyRoutes();
                
                console.log(`🟢 Started as PRIMARY SERVER on port ${boundPort}`);
                console.log(`📋 Server UUID: ${this.serverModel.uuid}`);
                console.log(`🏠 Domain: ${this.serverModel.domain}`);
                this.serverModel.state = LifecycleState.PRIMARY_SERVER;
                
                // Perform housekeeping: discover existing peers, cleanup shutdown scenarios
                await this.performHousekeeping();
            } else {
                console.log(`🔵 Started as CLIENT SERVER on port ${boundPort}`);
                console.log(`📋 Server UUID: ${this.serverModel.uuid}`);
                
                // Register with primary peer (sends initial STARTING state)
                await this.registerWithPrimaryServer();
                this.serverModel.state = LifecycleState.CLIENT_SERVER;
            }

            this.serverModel.state = LifecycleState.RUNNING;
            
            // ✅ FIX: Notify primary of RUNNING state (for registry acceptance)
            // @pdca 2025-12-03-UTC-1930.websocket-scenario-broadcast.pdca.md
            if (!this.serverModel.isPrimaryServer) {
                this.notifyPrimaryOfStateChange();
                console.log(`📤 Notified primary of RUNNING state`);
            }
            
            // Try to load existing scenario first, then save if needed
            await this.loadOrCreateScenario();
            
        } catch (error) {
            this.serverModel.state = LifecycleState.ERROR;
            console.error('❌ Failed to start server:', error);
            throw error;
        }
    }

    /**
     * Find and bind to an available port with retry logic
     * 
     * ✅ HTTPS by Default: ALL servers use HTTPS
     * ✅ HTTP Redirect: Port 42000 redirects to HTTPS 42777 (primary only)
     * 
     * @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
     * 
     * @returns The port that was successfully bound
     */
    private async findAndBindPort(): Promise<number> {
        const MAX_RETRIES = 100;
        
        // ✅ Auto-discover TLS certificates from component certs folder
        this.tlsConfigAutoDiscover();
        
        // First try primary port 42777 (HTTPS)
        try {
            await this.startHttpServer(PRIMARY_HTTPS_PORT);
            this.serverModel.isPrimaryServer = true;
            this.serverModel.capabilities.push({
                capability: 'httpsPort',  // ✅ Changed from httpPort to httpsPort
                port: PRIMARY_HTTPS_PORT
            });
            
            // ✅ H.2: Start HTTP redirect server on port 42000 (primary only)
            await this.httpRedirectServerStart();
            
            return PRIMARY_HTTPS_PORT;
        } catch (error: any) {
            if (error.code !== 'EADDRINUSE') {
                throw error;
            }
            // Primary port is in use, fall through to fallback
        }
        
        // Try fallback ports 8080, 8081, 8082... (all HTTPS)
        for (let port = SECONDARY_PORT_START; port < SECONDARY_PORT_START + MAX_RETRIES; port++) {
            try {
                await this.startHttpServer(port);
                this.serverModel.isPrimaryServer = false;
                this.serverModel.capabilities.push({
                    capability: 'httpsPort',  // ✅ Changed from httpPort to httpsPort
                    port
                });
                return port;
            } catch (error: any) {
                if (error.code !== 'EADDRINUSE') {
                    throw error;
                }
                // Port is in use, try next one
            }
        }
        
        throw new Error(`No available ports found in range ${SECONDARY_PORT_START}-${SECONDARY_PORT_START + MAX_RETRIES}`);
    }
    
    /**
     * Auto-discover TLS configuration from component certs folder
     * 
     * Checks for certs/server.crt and certs/server.key in componentRoot
     * Falls back to component model tls config if provided
     * 
     * @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md H.1
     */
    private tlsConfigAutoDiscover(): void {
        // First check component model for explicit TLS config
        const modelTls = this.component?.model?.tls as TLSOptions | undefined;
        if (modelTls && modelTls.certPath && modelTls.keyPath) {
            if (fs.existsSync(modelTls.certPath) && fs.existsSync(modelTls.keyPath)) {
                this.tlsConfig = modelTls;
                console.log(`🔐 Using TLS config from model: ${modelTls.certPath}`);
                return;
            }
        }
        
        // Auto-discover from component's certs folder
        const componentRoot = this.component?.model?.componentRoot;
        if (!componentRoot) {
            console.warn('⚠️  No componentRoot set, cannot auto-discover TLS certs');
            return;
        }
        
        const certPath = path.join(componentRoot, 'certs', 'server.crt');
        const keyPath = path.join(componentRoot, 'certs', 'server.key');
        
        if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
            this.tlsConfig = { certPath, keyPath };
            console.log(`🔐 Auto-discovered TLS certs: ${certPath}`);
        } else {
            console.warn(`⚠️  No TLS certs found in ${path.join(componentRoot, 'certs')}`);
            console.warn(`   Run: ./src/sh/generate-self-signed-cert.sh ./certs`);
        }
    }
    
    /**
     * Start HTTP redirect server on port 42000 (primary only)
     * Redirects all HTTP requests to HTTPS on port 42777
     * 
     * @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md H.2
     */
    private async httpRedirectServerStart(): Promise<void> {
        if (!this.serverModel.isPrimaryServer) {
            return; // Only primary server has HTTP redirect
        }
        
        return new Promise((resolve, reject) => {
            this.httpRedirectServer = http.createServer(this.httpRedirectHandle.bind(this));
            
            this.httpRedirectServer.on('error', (error: any) => {
                if (error.code === 'EADDRINUSE') {
                    console.warn(`⚠️  HTTP redirect port ${HTTP_REDIRECT_PORT} in use, skipping`);
                    resolve(); // Not fatal, just skip
                } else {
                    reject(error);
                }
            });
            
            this.httpRedirectServer.listen(HTTP_REDIRECT_PORT, '0.0.0.0', () => {
                console.log(`🔀 HTTP→HTTPS redirect server started on port ${HTTP_REDIRECT_PORT}`);
                console.log(`   All requests to http://*:${HTTP_REDIRECT_PORT} → https://*:${PRIMARY_HTTPS_PORT}`);
                
                this.serverModel.capabilities.push({
                    capability: 'httpRedirect',
                    port: HTTP_REDIRECT_PORT
                });
                
                resolve();
            });
        });
    }
    
    /**
     * Handle HTTP→HTTPS redirect request
     * Web4 P4: Bound method (no arrow function)
     */
    private httpRedirectHandle(req: http.IncomingMessage, res: http.ServerResponse): void {
        const host = req.headers.host?.split(':')[0] || this.serverModel.host;
        const httpsUrl = `https://${host}:${PRIMARY_HTTPS_PORT}${req.url}`;
        
        res.writeHead(301, { 
            'Location': httpsUrl,
            'Content-Type': 'text/html'
        });
        res.end(`<html><body>Redirecting to <a href="${httpsUrl}">${httpsUrl}</a></body></html>`);
    }

    /**
     * Start HTTPS server on specified port (HTTPS by default)
     * 
     * ✅ HTTPS by Default: ALL servers use HTTPS
     * ✅ Web4 Radical OOP: Uses HTTPSServer + HTTPRouter classes
     * ✅ Web4 Principle 19: Separate bindInterface from urlHost
     * 
     * @pdca 2025-12-01-UTC-0950.iteration-05-phase5-7-httpserver-router-refactoring.pdca.md
     * @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md H.3
     */
    private async startHttpServer(port: number): Promise<void> {
        // Register all routes
        this.registerRoutes();
        
        // ✅ H.3: HTTPS by default - use auto-discovered TLS config
        if (this.tlsConfig && this.tlsConfig.certPath && this.tlsConfig.keyPath) {
            // ✅ Use HTTPS server with TLS (DEFAULT)
            const httpsServer = new HTTPSServer();
            httpsServer.init({
                ior: { uuid: '', component: '', version: '' },
                owner: '',
                model: {
                    uuid: this.idProvider.create(),
                    name: 'HTTPSServer',
                    port: port,
                    bindInterface: '0.0.0.0',
                    urlHost: this.serverModel.host,
                    state: LifecycleState.CREATED,
                    routerUuid: this.httpRouter.model.uuid,
                    tls: this.tlsConfig,
                    httpRedirect: {
                        enabled: false,  // ✅ Disabled - we use separate HTTP redirect server on 42000
                        httpPort: 0
                    },
                    defaultHeaders: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    statistics: {
                        totalOperations: 0,
                        successCount: 0,
                        errorCount: 0,
                        lastOperationAt: '',
                        lastErrorAt: '',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                }
            }, this.httpRouter);
            
            this.httpServer = httpsServer;
            await this.httpServer.start(port, '0.0.0.0');
            
            console.log(`🔒 HTTPS server started on 0.0.0.0:${port} (URLs use: https://${this.serverModel.host}:${port})`);
        } else {
            // ⚠️ Fallback to HTTP (no certs available)
            console.warn(`⚠️  No TLS certs found - falling back to HTTP (PWA will NOT work)`);
            console.warn(`   Run: ./src/sh/generate-self-signed-cert.sh ./certs`);
            
            this.httpServer = new HTTPServer();
            this.httpServer.model.uuid = this.idProvider.create(); // ✅ Web4 Principle 20
            this.httpServer.model.port = port;
            this.httpServer.model.bindInterface = '0.0.0.0'; // ✅ Bind to all interfaces
            this.httpServer.model.urlHost = this.serverModel.host; // ✅ FQDN for URLs
            this.httpServer.router = this.httpRouter;
            
            // Start the server (bind to 0.0.0.0)
            await this.httpServer.start(port, '0.0.0.0');
            
            console.log(`🌐 HTTP server started on 0.0.0.0:${port} (URLs use: http://${this.serverModel.host}:${port})`);
        }
    }

    /**
     * Start WebSocket server
     */
    private async startWebSocketServer(): Promise<void> {
        if (!this.httpServer || !this.httpServer.server) {
            throw new Error('HTTP server must be started first');
        }

        this.wsServer = new WebSocketServer({ server: this.httpServer.server });
        
        // Add WebSocket capability
        const httpCapability = this.serverModel.capabilities.find(c => c.capability === 'httpPort');
        if (httpCapability) {
            this.serverModel.capabilities.push({
                capability: 'wsPort',
                port: httpCapability.port
            });
        }

    this.wsServer.on('connection', (ws: WebSocket, request: any) => {
      this.handleWebSocketConnection(ws, request);
    });

        console.log(`📡 WebSocket server started`);
    }

    /**
     * Get list of available public methods for method invocation
     * Used for error messages when method not found
     * @pdca 2025-11-22-UTC-1730.iteration-01.6.5-ior-method-invocation.pdca.md
     */
    private getAvailableMethods(): string[] {
        return [
            'getHealth',
            'getServers',
            'info',
            'test',
            'serveOnceClient',
            'serveDemoHub',
            'serveStatus',
            'startServer',
            'stopServer',
            'startClientServer',
            'discoverServers',
            'shutdownAll'
        ];
    }

    /**
     * Serve static files from component directory
     */
    private serveStaticFile(pathname: string, res: any): void {
        try {
            const componentRoot = this.component?.model.componentRoot;
            if (!componentRoot) {
                throw new Error('Component not initialized');
            }
            const filePath = path.join(componentRoot, pathname);
            
            console.log('Static file request:', pathname);
            console.log('Resolved to:', filePath);
            console.log('Component root:', componentRoot);
            console.log('Starts with check:', filePath.startsWith(componentRoot));
            
            // Security: prevent directory traversal
            if (!filePath.startsWith(componentRoot)) {
                console.log('FORBIDDEN: Path outside component root');
                res.writeHead(403, { 'Content-Type': 'text/plain' });
                res.end('Forbidden');
                return;
            }
            
            if (!fs.existsSync(filePath)) {
                console.log('NOT FOUND: File does not exist');
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }
            
            const content = fs.readFileSync(filePath);
            const ext = path.extname(filePath);
            const contentTypes: { [key: string]: string } = {
                '.js': 'application/javascript',
                '.mjs': 'application/javascript',
                '.json': 'application/json',
                '.css': 'text/css',
                '.html': 'text/html',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.svg': 'image/svg+xml'
            };
            
            console.log('SERVING:', filePath, 'as', contentTypes[ext]);
            res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
            res.end(content);
        } catch (error) {
            console.log('ERROR serving static file:', error);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    }

    /**
     * Radical OOP template renderer - uses native JS template literals with this context
     * 
     * Templates can use ${this.version}, ${this.httpPort}, etc.
     * The template is evaluated with 'this' bound to ServerHierarchyManager.
     * 
     * @param templatePath - Path relative to component root, OR just filename for src/view/html
     */
    private renderTemplate(templatePath: string): string {
        const componentRoot = this.component?.model.componentRoot;
        if (!componentRoot) {
            throw new Error('Component not initialized');
        }
        
        // If path contains '/', treat as relative to component root
        // Otherwise, assume it's in src/view/html
        const fullPath = templatePath.includes('/') 
            ? path.join(componentRoot, templatePath)
            : path.join(componentRoot, 'src/view/html', templatePath);
            
        const template = fs.readFileSync(fullPath, 'utf-8');
        // Escape backticks in template to prevent breaking the Function constructor
        const escapedTemplate = template.replace(/`/g, '\\`');
        return new Function('return `' + escapedTemplate + '`;').call(this);
    }

    /**
     * Get comprehensive server status HTML (for root path /)
     * @deprecated Use DefaultONCE.serveStatus() instead (delegates to this method)
     * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
     */
    getServerStatusHTML(): string {
        return this.renderTemplate('server-status.html');
    }

    /**
     * Getters for template placeholders - Radical OOP model-driven
     */
    private get httpPort(): string {
        const httpCapability = this.serverModel.capabilities.find(c => c.capability === 'httpPort');
        return httpCapability?.port?.toString() || 'Unknown';
    }

    private get wsPort(): string {
        const wsCapability = this.serverModel.capabilities.find(c => c.capability === 'wsPort');
        return wsCapability?.port?.toString() || 'Unknown';
    }

    private get capabilitiesHTML(): string {
        return this.serverModel.capabilities.map(cap => 
            `<p><strong>${cap.capability}:</strong> ${cap.port || 'Active'}</p>`
        ).join('');
    }

    /**
     * Get version (self-discovered in constructor, always set)
     * ✅ TRUE Radical OOP: Self-sufficient (knows its own version)
     * No fallback needed - version is ALWAYS set in constructor
     */
    private get versionFromComponent(): string {
        return this.component?.model?.version || this.version;
    }

    private get projectRoot(): string {
        // ✅ Path authority: Use component model (DRY)
        return this.component?.model?.projectRoot || '';
    }
    
    /**
     * Public accessor for projectRoot (needed by DefaultONCE)
     * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
     */
    public getProjectRoot(): string {
        return this.projectRoot;
    }

    /**
     * Get simple ONCE client HTML (for /once endpoint)
     * ✅ TRUE Radical OOP: Dynamically inject version instead of hardcoding
     * @deprecated Use DefaultONCE.serveOnceClient() instead (delegates to this method)
     * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
     */
    getOnceCommunicationLogHTML(): string {
        return this.renderTemplate('once-client.html');
    }

    /**
     * Get minimal ONCE bootstrap HTML (for /once endpoint)
     * Uses model-based template renderer with ${this.version} syntax.
     * 
     * @pdca 2025-11-25-UTC-2030.iteration-01.11-once-route-refactoring.pdca.md
     * @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
     */
    getOnceMinimalHTML(): string {
        return this.renderTemplate('once-minimal.html');
    }

    /**
     * Get demo hub HTML (for /demo endpoint)
     * Uses model-based template renderer with ${this.version} syntax.
     * 
     * @deprecated Use DefaultONCE.serveDemoHub() instead (delegates to this method)
     * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
     * @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
     */
    getDemoHubHTML(): string {
        return this.renderTemplate('demo-hub.html');
    }
    
    /**
     * Get demo Lit MVC HTML (for /demo-lit endpoint)
     * Web4 MVC Architecture with Lit 3 components
     * 
     * Uses model-based template renderer with ${this.version} syntax.
     * 
     * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
     * @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
     */
    getDemoLitHTML(): string {
        return this.renderTemplate('demo-lit.html');
    }

    /**
     * Get ONCE App HTML (for /app endpoint)
     * Minimal SPA entry point - ALL logic in classes
     * 
     * Uses model-based template renderer with ${this.version} syntax.
     * 
     * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
     * @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
     */
    getOnceAppHTML(): string {
        return this.renderTemplate('src/ts/layer5/views/once.html');
    }

    /**
     * Handle WebSocket connections
     */
    private handleWebSocketConnection(ws: WebSocket, request: any): void {
        // Remove generic log - will log specific events (browser/server connections)
        
        // Initially treat as browser client (server registrations will be tracked separately)
        this.browserClients.add(ws);

    ws.on('message', async (data: any) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleWebSocketMessage(ws, message);
      } catch (error) {
        console.error('❌ WebSocket message error:', error);
      }
    });

        ws.on('close', () => {
            // Remove generic log - connection close is normal and not useful without context
            // Remove from browser clients set
            this.browserClients.delete(ws);
        });
    }

    /**
     * Handle WebSocket messages
     * ✅ Protocol-Less: Receives scenarios directly (not protocol messages)
     * @pdca 2025-11-22-UTC-1600.iteration-01.6.4d-scenario-state-transfer.pdca.md
     */
    private async handleWebSocketMessage(ws: WebSocket, message: any): Promise<void> {
        // ✅ NEW: Check if message is a scenario (has ior and model)
        if (message.ior && message.model) {
            // This is a scenario state update from a client server
            this.handleScenarioStateUpdate(ws, message);
            return;
        }
        
        // Legacy protocol handling (for backward compatibility / deprecation warnings)
        switch (message.type) {
            case 'server-registration':
                // ❌ DEPRECATED: Protocol-based server registration
                console.warn('⚠️  server-registration deprecated - send scenario directly');
                break;
            case 'server-unregister':
                // ❌ DEPRECATED: Protocol-based unregistration
                console.warn('⚠️  server-unregister deprecated - send scenario with state=stopped');
                break;
            case 'server-discovery':
                // ❌ DEPRECATED: Protocol-based discovery
                console.warn('⚠️  server-discovery deprecated - use filesystem discovery');
                break;
            case 'scenario-message':
                // @pdca 2025-11-11-UTC-2322.pdca.md - Handle incoming scenario messages
                // ✅ Extract model from Web4 scenario format if needed
                const scenarioModel = message.scenario.ior && message.scenario.model 
                    ? message.scenario.model  // Web4 format: {ior, owner, model}
                    : message.scenario;       // Legacy format: model directly
                
                if (scenarioModel.state?.type === 'broadcast') {
                    if (this.serverModel.isPrimaryServer) {
                        // Primary received broadcast (from browser or client) - broadcast to all
                        console.log(`📡 Primary broadcasting scenario ${message.scenario.uuid}`);
                        // Broadcast to all registered client servers
                        this.broadcastScenario(message.scenario);
                        // Also broadcast to primary's own browser clients
                        this.broadcastToBrowserClients(message.scenario);
                    } else {
                        // Client server received broadcast
                        // Check if it's from our own browser client or from primary server
                        const fromPrimary = message.fromPrimary === true;
                        console.log(`📡 Client received broadcast, fromPrimary=${fromPrimary}, message.fromPrimary=${message.fromPrimary}`);
                        
                        if (fromPrimary) {
                            // Received from primary - broadcast to our browser clients
                            console.log(`📡 Forwarding to browser clients (wsServer has ${this.wsServer?.clients.size || 0} clients)`);
                            this.broadcastToBrowserClients(message.scenario);
                        } else {
                            // Received from our browser client - forward to primary
                            console.log(`📡 Forwarding to primary server`);
                            if (this.primaryServerConnection && this.primaryServerConnection.readyState === WebSocket.OPEN) {
                                this.primaryServerConnection.send(JSON.stringify({
                                    ...message,
                                    fromPrimary: false
                                }));
                            }
                        }
                    }
                } else {
                    await this.handleScenarioMessage(message.scenario);
                }
                break;
            case 'scenario-relay':
                // @pdca 2025-11-11-UTC-2322.pdca.md - Relay message to target
                if (this.serverModel.isPrimaryServer) {
                    this.relayScenario(message.scenario, message.targetUUID);
                } else {
                    // Client forwards to primary for relay
                    if (this.primaryServerConnection && this.primaryServerConnection.readyState === WebSocket.OPEN) {
                        this.primaryServerConnection.send(JSON.stringify(message));
                    }
                }
                break;
            case 'scenario-p2p':
                // @pdca 2025-11-11-UTC-2322.pdca.md - P2P direct message
                // Find a peer and send directly
                if (this.serverModel.isPrimaryServer && this.serverRegistry.size > 0) {
                    // Primary can help route P2P
                    const firstClient = Array.from(this.serverRegistry.values())[0];
                    // Extract capabilities from scenario (Scenario<ONCEPeerModel>)
                    const model = firstClient.scenario.model;
                    const capabilities = model.capabilities;
                    const port = capabilities?.find((c: any) => c.capability === 'httpPort')?.port || model.port;
                    if (port) {
                        this.sendScenarioToPeer(message.scenario, port);
                    }
                } else {
                    // Send to any peer we know
                    const peerPort = message.peerPort || 8080;
                    this.sendScenarioToPeer(message.scenario, peerPort);
                }
                break;
            case 'shutdown-command':
                // Remote shutdown command from primary
                console.log('🛑 Received shutdown command from primary server');
                void this.stopServer();
                break;
            case 'client-connected':
                // Browser client connected notification
                logConnection(this.serverModel.uuid, 'Browser', message.data?.clientId || 'unknown');
                // Optionally acknowledge or track browser clients
                break;
            case 'acknowledgment':
                // Browser client acknowledgment of received message
                const ackedType = message.data?.acknowledgedType || 'unknown';
                console.log(`✅ Browser acknowledged: ${ackedType}`);
                // Track acknowledgments if needed for reliability
                break;
            default:
                console.log('🔄 Unknown WebSocket message type:', message.type);
        }
    }

    /**
     * Handle incoming scenario message
     * ⚠️ DEPRECATED: Protocol-based messaging violates Web4 protocol-less communication
     * @pdca 2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md - Iteration 1.6.2
     * @deprecated Will be replaced with scenario replication in Iteration 1.6.3
     */
    private async handleScenarioMessage(scenario: any): Promise<void> {
        // ✅ Extract model from Web4 scenario format if needed
        const scenarioModel = (scenario as any).ior && (scenario as any).model 
            ? (scenario as any).model  // Web4 format: {ior, owner, model}
            : scenario;                // Legacy format: model directly
        
        // Extract sender info
        const fromUUID = scenarioModel.state?.from?.uuid || 'unknown';
        const fromPort = scenarioModel.state?.from?.port || 'unknown';
        const fromURL = fromPort !== 'unknown' ? `http://localhost:${fromPort}` : 'unknown';
        
        console.log(`📥 Received: scenario-message from ${fromUUID.substring(0, 8)}... at ${fromURL}`);
        console.log(`   Type: ${scenarioModel.state?.type || 'unknown'}`);
        console.log(`   Content: ${scenarioModel.state?.content || 'N/A'}`);
        console.log(`   Sequence: ${scenarioModel.state?.sequence || 'N/A'}`);
        
        // Do NOT ACK an ACK (prevents infinite loop)
        if (scenarioModel.state?.content?.startsWith('ACK:')) {
            return;
        }
        
        // Send acknowledgment as proper Scenario
        const ackScenario: any = {
            uuid: this.idProvider.create(), // ✅ Web4 Principle 20
            objectType: 'ONCEMessage',
            version: this.versionFromComponent, // ✅ Use dynamic version
            state: {
                type: scenarioModel.state?.type || 'direct',
                from: { uuid: this.serverModel.uuid, port: this.getHttpPort() },
                to: scenarioModel.state?.from || { uuid: 'unknown', port: 0 },
                content: `ACK: ${(scenario as any).ior?.uuid || scenario.uuid}`,
                timestamp: new Date().toISOString(),
                sequence: 0
            },
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                creator: 'ONCE-auto-ack',
                description: `Acknowledgment for ${(scenario as any).ior?.uuid || scenario.uuid}`
            }
        };

        // Send ack back to sender
        if (scenarioModel.state?.from?.port) {
            try {
                // ✅ Use WSS (all servers are HTTPS now)
                const ackConnection = new WebSocket(`wss://localhost:${scenarioModel.state.from.port}`, {
                    rejectUnauthorized: false  // Accept self-signed certs
                });
                ackConnection.on('open', () => {
                    ackConnection.send(JSON.stringify({
                        type: 'scenario-message',
                        scenario: ackScenario
                    }));
                    ackConnection.close();
                });
            } catch (error) {
                console.log(`⚠️  Failed to send acknowledgment to ${scenario.state.from.port}`);
            }
        }
    }

    /**
     * Get server port from capabilities (supports both httpsPort and httpPort)
     * 
     * ✅ Backward compatible: Checks httpsPort first, then falls back to httpPort
     * 
     * @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
     */
    private getHttpPort(): number {
        // Check for HTTPS port first (new default)
        const httpsCapability = this.serverModel.capabilities.find(c => c.capability === 'httpsPort');
        if (httpsCapability?.port) {
            return httpsCapability.port;
        }
        // Fall back to HTTP port (legacy scenarios)
        const httpCapability = this.serverModel.capabilities.find(c => c.capability === 'httpPort');
        return httpCapability?.port || 0;
    }
    
    /**
     * Get port from capabilities array (static helper for scenarios)
     * 
     * ✅ Backward compatible: Checks httpsPort first, then falls back to httpPort
     */
    private static portFromCapabilitiesGet(capabilities: any[] | undefined): number | undefined {
        if (!capabilities) return undefined;
        // Check for HTTPS port first (new default)
        const httpsCapability = capabilities.find((c: any) => c.capability === 'httpsPort');
        if (httpsCapability?.port) {
            return httpsCapability.port;
        }
        // Fall back to HTTP port (legacy scenarios)
        const httpCapability = capabilities.find((c: any) => c.capability === 'httpPort');
        return httpCapability?.port;
    }

    /**
     * Handle server registration (primary server only)
     * ⚠️ DEPRECATED: Protocol-based registration removed
     * @pdca 2025-11-22-UTC-1500.iteration-01.6.4b-protocol-less-registry.pdca.md
     * @deprecated Use filesystem scenario discovery instead
     */
    private async handleServerRegistration(ws: WebSocket, clientServerModel: ONCEServerModel): Promise<void> {
        console.warn('⚠️  handleServerRegistration deprecated - use filesystem scenario discovery');
        // ❌ REMOVED: Protocol-based registration
        // Servers are discovered via performHousekeeping() filesystem scan
    }

    /**
     * Handle server unregister (primary server only)
     * @pdca 2025-11-18-UTC-1830.pdca.md - Remove client from registry on shutdown
     */
    private async handleServerUnregister(data: { uuid: string; port?: number }): Promise<void> {
        console.log(`🗑️  [${shortUUID(this.serverModel.uuid)}] Client unregistered: ${shortUUID(data.uuid)} (port ${data.port})`);
        
        // Remove from registry
        this.serverRegistry.delete(data.uuid);
        
        // ✅ Broadcast server stopped event to all browser clients
        this.broadcastServerEvent('server-stopped', data);
    }

    /**
     * Notify primary server of state change via scenario transfer
     * ✅ Protocol-Less: Sends full scenario, no message wrapper
     * @pdca 2025-11-22-UTC-1600.iteration-01.6.4d-scenario-state-transfer.pdca.md
     */
    private notifyPrimaryOfStateChange(): void {
        if (this.serverModel.isPrimaryServer) return;  // Primary doesn't notify itself
        
        if (this.primaryServerConnection && this.primaryServerConnection.readyState === WebSocket.OPEN) {
            // Generate scenario directly from current state
            const scenario = this.getScenarioFromState();
            if (scenario) {
                this.primaryServerConnection.send(JSON.stringify(scenario));
                console.log(`📤 Sent scenario to primary (state: ${this.serverModel.state})`);
            }
        }
    }
    
    /**
     * Generate scenario from current server state
     * Used for real-time state transfer to primary
     */
    private getScenarioFromState(): any {
        // ✅ Web4 Scenario Format: { ior, owner, model }
        return {
            ior: {
                protocol: 'https',
                host: this.serverModel.host,
                port: this.serverModel.capabilities.find(c => c.capability === 'httpPort')?.port || 0,
                path: `/ONCE/${this.version}/${this.serverModel.uuid}`,
                uuid: this.serverModel.uuid,
                iorString: `ior:https://${this.serverModel.host}:${this.serverModel.capabilities.find(c => c.capability === 'httpPort')?.port}/ONCE/${this.version}/${this.serverModel.uuid}`
            },
            owner: { userId: 'system', timestamp: new Date().toISOString() },  // Default owner
            model: {
                uuid: this.serverModel.uuid,
                version: this.version,
                state: this.serverModel  // Full server model as state
            }
        };
    }

    /**
     * Handle incoming scenario from client server
     * ✅ Protocol-Less: No message types, just scenarios
     * @pdca 2025-11-22-UTC-1600.iteration-01.6.4d-scenario-state-transfer.pdca.md
     */
    private handleScenarioStateUpdate(ws: WebSocket, scenario: Scenario<ONCEPeerModel>): void {
        // Direct access to ONCEPeerModel
        const model = scenario.model;
        
        const state = model.state;
        const uuid = model.uuid;
        const capabilities = model.capabilities;
        const port = capabilities?.find((c: any) => c.capability === 'httpPort')?.port || model.port;
        
        if (!uuid) {
            console.warn('⚠️  Received scenario without UUID');
            return;
        }
        
        console.log(`📥 Received scenario from ${uuid} (state: ${state}, port: ${port})`);
        
        // State-based actions
        if (state === LifecycleState.STOPPED || state === LifecycleState.SHUTDOWN) {
            // Deregister server
            if (this.serverRegistry.has(uuid)) {
                this.serverRegistry.delete(uuid);
                console.log(`🗑️  Server ${uuid} deregistered (state: ${state})`);
                
                // ✅ Web4 P24: Remove from PersistenceManager
                this.scenarioRemoveFromStorage(uuid);
                
                // ✅ Protocol-less: Broadcast scenario with updated state
                // Browser peers will detect STOPPED/SHUTDOWN state and remove from UI
                this.broadcastToBrowserClients(scenario);
            }
        } else if (state === LifecycleState.RUNNING || state === LifecycleState.CLIENT_SERVER) {
            // Register or update server
            const wasRegistered = this.serverRegistry.has(uuid);
            this.serverRegistry.set(uuid, {
                scenario: scenario,  // ✅ Store full scenario
                lastSeen: new Date().toISOString(),
                websocket: ws  // Keep connection for real-time updates
            });
            
            const action = wasRegistered ? 'updated' : 'registered';
            console.log(`📡 Server ${uuid} ${action} (state: ${state}, port: ${port})`);
            
            // ✅ Web4 P24: Save to PersistenceManager
            this.scenarioSaveToStorage(uuid, scenario, port);
            
            // ✅ Protocol-less: Broadcast scenario (browser detects from state)
            this.broadcastToBrowserClients(scenario);
        }
    }
    
    /**
     * Save scenario to ScenarioService (single point of truth)
     * ✅ Web4 Principle 24: RelatedObjects Registry
     * ✅ Uses ScenarioService for unit metadata and reference tracking
     * @pdca 2025-12-08-UTC-1000.scenario-unit-unification.pdca.md
     */
    private async scenarioSaveToStorage(uuid: string, scenario: any, port?: number): Promise<void> {
        try {
            const scenarioService = this.component?.scenarioServiceGet?.();
            if (!scenarioService) {
                console.log('[ServerHierarchyManager] No ScenarioService available (skipping storage)');
                return;
            }
            
            const version = scenario.ior?.version || scenario.version || this.version;
            const component = 'ONCE';
            const domainParts = this.getDetectDomainPath(); // ['box', 'fritz']
            const hostname = this.serverModel.hostname;      // 'McDonges'
            
            // Build symlink paths using ScenarioService's path builders
            const symlinkPaths: string[] = [
                // Type index: type/ONCE/0.3.21.9
                scenarioService.typePathBuild(component, version),
                
                // Domain index: domain/box/fritz/McDonges/ONCE/0.3.21.9
                scenarioService.domainPathBuild(domainParts, hostname, component, version)
            ];
            
            // Capability index under domain: domain/box/fritz/McDonges/ONCE/0.3.21.9/capability/httpPort/42777
            if (port) {
                symlinkPaths.push(
                    scenarioService.capabilityPathBuild(
                        domainParts, hostname, component, version,
                        'httpPort', String(port)
                    )
                );
            }
            
            await scenarioService.scenarioSave(scenario, symlinkPaths);
            console.log(`[ServerHierarchyManager] ✅ Scenario ${uuid} saved via ScenarioService`);
        } catch (error) {
            console.warn(`[ServerHierarchyManager] Failed to save scenario: ${error}`);
        }
    }
    
    /**
     * Remove scenario from ScenarioService
     * ✅ Web4 Principle 24: RelatedObjects Registry
     * @pdca 2025-12-08-UTC-1000.scenario-unit-unification.pdca.md
     */
    private async scenarioRemoveFromStorage(uuid: string): Promise<void> {
        try {
            const scenarioService = this.component?.scenarioServiceGet?.();
            if (!scenarioService) {
                return;
            }
            
            await scenarioService.scenarioDelete(uuid, true);
            console.log(`[ServerHierarchyManager] ✅ Scenario ${uuid} removed via ScenarioService`);
        } catch (error) {
            console.warn(`[ServerHierarchyManager] Failed to remove scenario: ${error}`);
        }
    }

    /**
     * Handle server discovery requests (primary server only)
     * ⚠️ DEPRECATED: Protocol-based discovery removed
     * @pdca 2025-11-22-UTC-1500.iteration-01.6.4b-protocol-less-registry.pdca.md
     * @deprecated Use filesystem scenario discovery instead
     */
    private async handleServerDiscovery(ws: WebSocket, query: any): Promise<void> {
        console.warn('⚠️  handleServerDiscovery deprecated - use filesystem scenario discovery');
        // ❌ REMOVED: Protocol-based discovery
        // Servers are discovered via performHousekeeping() filesystem scan
    }

    /**
     * Register with primary server (client servers only)
     * ✅ Protocol-Less: Sends scenario state, not protocol message
     * @pdca 2025-11-22-UTC-1600.iteration-01.6.4d-scenario-state-transfer.pdca.md
     */
    private async registerWithPrimaryServer(): Promise<void> {
        if (this.serverModel.isPrimaryServer) {
            return; // Primary server doesn't register with itself
        }

        try {
            const primaryPort = this.portManager.getPrimaryPort();
            // ✅ Use WSS (all servers are HTTPS now)
            const wsUrl = `wss://localhost:${primaryPort}`;
            
            // ✅ Accept self-signed certificates for WSS connections
            this.primaryServerConnection = new WebSocket(wsUrl, {
                rejectUnauthorized: false  // Accept self-signed certs
            });
            
            return new Promise((resolve, reject) => {
                if (!this.primaryServerConnection) {
                    reject(new Error('Failed to create primary server connection'));
                    return;
                }

                this.primaryServerConnection.on('open', () => {
                    console.log(`🔗 Connected to primary server at port ${primaryPort}`);
                    
                    // ✅ NEW: Send full scenario (not protocol message)
                    this.notifyPrimaryOfStateChange();
                    
                    // Mark as registered immediately (no confirmation needed)
                    this.serverModel.state = LifecycleState.REGISTERED;
                    resolve();
                });

        this.primaryServerConnection.on('message', async (data: any) => {
          try {
            const message = JSON.parse(data.toString());
            if (message.type === 'registration-confirmed') {
              console.log('✅ Registration confirmed with primary server');
              this.serverModel.primaryServerIOR = this.createPrimaryServerIOR(message.primaryServerModel);
              
              // Store primary server connection info for browser clients
              const primaryHttpPort = message.primaryServerModel.capabilities.find((c: any) => c.capability === 'httpPort')?.port;
              this.serverModel.primaryServer = {
                host: message.primaryServerModel.hostname || message.primaryServerModel.host || 'localhost',
                port: primaryHttpPort || 42777
              };
              
              this.serverModel.state = LifecycleState.REGISTERED;
              resolve();
            } else {
              // Handle all other messages (broadcasts, relays, etc.) from primary
              await this.handleWebSocketMessage(this.primaryServerConnection!, message);
            }
          } catch (error) {
            console.error('❌ Primary server message error:', error);
          }
        });

        this.primaryServerConnection.on('error', (error: any) => {
          console.error('❌ Primary server connection error:', error);
          reject(error);
        });
            });
            
        } catch (error) {
            console.error('❌ Failed to register with primary server:', error);
            throw error;
        }
    }

    /**
     * Create IOR for primary server
     */
    private createPrimaryServerIOR(primaryServerModel: ONCEServerModel): string {
        const httpCapability = primaryServerModel.capabilities.find(c => c.capability === 'httpPort');
        if (!httpCapability) {
            throw new Error('Primary server has no HTTP capability');
        }

        const ior: IOR = {
            protocol: 'web4',
            host: primaryServerModel.host,
            port: httpCapability.port,
            path: '/once',
            uuid: primaryServerModel.uuid,
            objectType: 'ONCE',
            version: this.versionFromComponent
        };

        return iorToUrl(ior);
    }

    /**
     * Load existing scenario or create new one using ScenarioService
     * ✅ Uses ScenarioService for unit metadata and migration
     * ✅ Primary file in scenarios/index/, symlinks in type/domain/capability
     * @pdca 2025-12-08-UTC-1000.scenario-unit-unification.pdca.md
     */
    private async loadOrCreateScenario(): Promise<void> {
        const httpCapability = this.serverModel.capabilities.find(c => c.capability === 'httpPort');
        if (!httpCapability) return;

        const uuid = this.serverModel.uuid;
        
        // Try to load existing scenario from ScenarioService
        const scenarioService = this.component?.scenarioServiceGet?.();
        if (scenarioService) {
            try {
                const exists = await scenarioService.scenarioExists(uuid);
                if (exists) {
                    const scenario = await scenarioService.scenarioLoad(uuid);
                    console.log(`📂 Loaded existing scenario from index: ${uuid}`);
                    return;
                }
            } catch (error) {
                console.log(`⚠️ Could not load existing scenario: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        // Create new scenario using ScenarioService
        await this.saveScenarioViaScenarioService();
    }

    /**
     * Save server scenario using ScenarioService (single point of truth)
     * ✅ Primary file → scenarios/index/{uuid-folders}/
     * ✅ Symlinks → type/, domain/, capability/
     * ✅ Unit metadata added automatically
     * @pdca 2025-12-08-UTC-1000.scenario-unit-unification.pdca.md
     */
    private async saveScenarioViaScenarioService(): Promise<void> {
        const scenarioService = this.component?.scenarioServiceGet?.();
        if (!scenarioService) {
            console.log('[ServerHierarchyManager] No ScenarioService available - using legacy save');
            await this.saveScenarioLegacy();
            return;
        }

        try {
            const httpCapability = this.serverModel.capabilities.find(c => c.capability === 'httpPort');
            const uuid = this.serverModel.uuid;
            const version = this.versionFromComponent;
            const component = 'ONCE';
            const domainParts = this.getDetectDomainPath();
            const hostname = this.serverModel.hostname;
            const port = httpCapability?.port;
            
            // Build Web4 Standard scenario
            const scenario = {
                ior: {
                    uuid,
                    component,
                    version
                },
                owner: 'system',
                model: {
                    ...this.serverModel,
                    name: `ONCE-${hostname}`,
                    created: new Date().toISOString()
                }
            };

            // Build symlink paths using ScenarioService's path builders
            const symlinkPaths: string[] = [
                scenarioService.typePathBuild(component, version),
                scenarioService.domainPathBuild(domainParts, hostname, component, version)
            ];
            
            if (port) {
                symlinkPaths.push(
                    scenarioService.capabilityPathBuild(
                        domainParts, hostname, component, version,
                        'httpPort', String(port)
                    )
                );
            }

            await scenarioService.scenarioSave(scenario, symlinkPaths);
            console.log(`📝 [PERSISTENCE] ServerHierarchyManager saved scenario ${uuid} via ScenarioService`);
        } catch (error) {
            console.error(`❌ Failed to save scenario via ScenarioService: ${error instanceof Error ? error.message : String(error)}`);
            // Fallback to legacy
            await this.saveScenarioLegacy();
        }
    }

    /**
     * Legacy save method (fallback when PersistenceManager not available)
     * @deprecated Use saveScenarioViaPersistenceManager() instead
     */
    private async saveScenarioLegacy(): Promise<void> {
        try {
            const httpCapability = this.serverModel.capabilities.find(c => c.capability === 'httpPort');
            if (!httpCapability) return;

            const domainParts = this.getDetectDomainPath();
            const hostname = this.serverModel.hostname;
            
            const mainScenarioDir = path.join(
                this.projectRoot, 
                'scenarios',
                'domain',
                ...domainParts,
                hostname,
                'ONCE',
                this.versionFromComponent
            );
            const mainScenarioPath = path.join(mainScenarioDir, `${this.serverModel.uuid}.scenario.json`);
            
            // Ensure main directory exists
            fs.mkdirSync(mainScenarioDir, { recursive: true });
            
            const scenario = {
                uuid: this.serverModel.uuid,
                objectType: 'ONCE',
                version: this.versionFromComponent,
                state: {
                    ...this.serverModel,
                    created: new Date().toISOString()
                },
                metadata: {
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    creator: `ONCE-v${this.versionFromComponent}`,
                    description: `ONCE server scenario - ${this.serverModel.isPrimaryServer ? 'Primary' : 'Client'} server`,
                    domain: this.serverModel.domain,
                    host: this.serverModel.host,
                    port: httpCapability?.port,
                    isPrimaryServer: this.serverModel.isPrimaryServer,
                    capabilities: this.serverModel.capabilities
                }
            };

            fs.writeFileSync(mainScenarioPath, JSON.stringify(scenario, null, 2));
            console.log(`📝 [WRITE] ServerHierarchyManager.saveScenarioLegacy() → ${mainScenarioPath}`);
        } catch (error) {
            console.error(`❌ Failed to save scenario (legacy): ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Detect current environment (platform info only, no network data)
     */
    private detectEnvironment(): any {
        return {
            platform: 'node',
            version: process.version,
            capabilities: ['server', 'websocket', 'p2p'],
            isOnline: true
        };
    }

    /**
     * Get domain as path components (TRUE Radical OOP - uses infrastructure)
     * Examples:
     *   - "McDonges-3.fritz.box" -> ["box", "fritz"]
     *   - "localhost" -> ["local", "once"]
     */
    public getDetectDomainPath(): string[] {
        const domain = this.serverModel.domain;
        if (domain === 'local.once') {
            return ['local', 'once'];
        }
        return domain.split('.').filter(p => p.length > 0);
    }

    /**
     * Get current server model
     */
    getServerModel(): ONCEServerModel {
        return { ...this.serverModel };
    }

    /**
     * Check if this is the primary server
     */
    isPrimaryServer(): boolean {
        return this.serverModel.isPrimaryServer;
    }

    /**
     * Get registered servers (primary server only)
     * ✅ PROTOCOL-LESS: Returns scenarios (not models)
     * @pdca 2025-11-22-UTC-1500.iteration-01.6.4b-protocol-less-registry.pdca.md
     */
    getRegisteredServers(): any[] {  // Returns Scenario[] instead of ONCEServerModel[]
        if (!this.serverModel.isPrimaryServer) {
            return [];
        }
        return Array.from(this.serverRegistry.values()).map(entry => entry.scenario);
    }

    /**
     * Broadcast scenario message to all registered clients
     * ⚠️ DEPRECATED: Protocol-based messaging violates Web4 protocol-less communication
     * @pdca 2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md - Iteration 1.6.2
     * @deprecated Will be replaced with scenario replication in Iteration 1.6.3
     */
    broadcastScenario(scenario: any): void {
        if (!this.serverModel.isPrimaryServer) {
            console.log('⚠️  Only primary server can broadcast');
            return;
        }

        console.log(`📡 Broadcasting scenario ${scenario.uuid} to ${this.serverRegistry.size} clients`);
        logBroadcast(this.serverModel.uuid, this.serverRegistry.size, 'client servers', `scenario ${shortUUID(scenario.uuid)}`);
        
        for (const [uuid, entry] of this.serverRegistry.entries()) {
            if (entry.websocket && entry.websocket.readyState === WebSocket.OPEN) {
                entry.websocket.send(JSON.stringify({
                    type: 'scenario-message',
                    scenario: scenario,
                    fromPrimary: true
                }));
            }
        }
    }

    /**
     * Broadcast scenario message to all connected browser clients (on this server)
     * ⚠️ DEPRECATED: Protocol-based messaging violates Web4 protocol-less communication
     * @pdca 2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md - Iteration 1.6.2
     * @deprecated Will be replaced with scenario replication in Iteration 1.6.3
     */
    /**
     * Broadcast scenario to browser peers (protocol-less)
     * ✅ Web4 Principle 11: Protocol-Less Communication
     * ✅ Sends pure scenario JSON (NO message envelope)
     * @pdca 2025-11-26-UTC-0215.iteration-01.14-websocket-state-transfer-completion.pdca.md
     */
    private broadcastToBrowserClients(scenario: any): void {
        const clientCount = this.browserClients.size;
        logBroadcast(this.serverModel.uuid, clientCount, 'browsers', `scenario ${shortUUID(scenario.uuid)}`);
        
        if (clientCount === 0) {
            console.log('ℹ️  No browser peers connected');
            return;
        }
        
        // ✅ Protocol-less: Send scenario directly (NO envelope)
        this.browserClients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(scenario));  // ✅ Pure state transfer
            }
        });
    }

    /**
     * Broadcast server lifecycle events to all connected browser clients
     * Used for real-time updates in demo hub UI
     */
    private broadcastServerEvent(eventType: string, data: any): void {
        const clientCount = this.browserClients.size;
        logBroadcast(this.serverModel.uuid, clientCount, 'browsers', eventType);
        
        if (clientCount === 0) {
            console.log('ℹ️  No browser clients connected');
            return;
        }
        
        this.browserClients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: eventType,
                    data: data,
                    timestamp: new Date().toISOString()
                }));
            }
        });
    }

    /**
     * Relay scenario message from one client through primary to another client
     * ⚠️ DEPRECATED: Protocol-based messaging violates Web4 protocol-less communication
     * @pdca 2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md - Iteration 1.6.2
     * @deprecated Will be replaced with scenario replication in Iteration 1.6.3
     */
    relayScenario(scenario: any, targetUUID: string): void {
        if (!this.serverModel.isPrimaryServer) {
            // Client sends to primary for relay
            if (this.primaryServerConnection && this.primaryServerConnection.readyState === WebSocket.OPEN) {
                console.log(`🔄 Relaying scenario ${scenario.uuid} via primary to ${targetUUID}`);
                this.primaryServerConnection.send(JSON.stringify({
                    type: 'scenario-relay',
                    scenario: scenario,
                    targetUUID: targetUUID
                }));
            }
            return;
        }

        // Primary relays to target
        const target = this.serverRegistry.get(targetUUID);
        if (target && target.websocket && target.websocket.readyState === WebSocket.OPEN) {
            console.log(`🔄 Primary relaying scenario ${scenario.uuid} to ${targetUUID}`);
            target.websocket.send(JSON.stringify({
                type: 'scenario-message',
                scenario: scenario
            }));
        } else {
            console.log(`⚠️  Target ${targetUUID} not found or not connected`);
        }
    }

    /**
     * Send scenario directly to peer (P2P)
     * ⚠️ DEPRECATED: Protocol-based messaging violates Web4 protocol-less communication
     * @pdca 2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md - Iteration 1.6.2
     * @deprecated Will be replaced with scenario replication in Iteration 1.6.3
     */
    sendScenarioToPeer(scenario: any, peerPort: number): void {
        try {
            // ✅ Use WSS (all servers are HTTPS now)
            const wsUrl = `wss://localhost:${peerPort}`;
            const peerConnection = new WebSocket(wsUrl, {
                rejectUnauthorized: false  // Accept self-signed certs
            });

            peerConnection.on('open', () => {
                console.log(`🔗 P2P connection established to port ${peerPort}`);
                peerConnection.send(JSON.stringify({
                    type: 'scenario-message',
                    scenario: scenario
                }));
                peerConnection.close();
            });

            peerConnection.on('error', (error) => {
                console.log(`⚠️  P2P connection to ${peerPort} failed:`, error.message);
            });
        } catch (error) {
            console.log(`⚠️  Failed to create P2P connection to ${peerPort}`);
        }
    }

    /**
     * Perform housekeeping at primary server startup (infrastructure method)
     * - Load existing scenarios from filesystem
     * - Delete scenarios with state=shutdown
     * - Discover and re-register running client servers
     * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
     */
    async performHousekeeping(): Promise<{ deleted: number; discovered: number }> {
        console.log('🧹 Performing primary server housekeeping...');
        
        try {
            const domainParts = this.getDetectDomainPath();
            const hostname = this.serverModel.hostname;
            const onceBaseDir = path.join(
                this.projectRoot,
                'scenarios',
                'domain',           // ✅ Added domain/ prefix
                ...domainParts,
                hostname,
                'ONCE'
            );
            
            if (!fs.existsSync(onceBaseDir)) {
                console.log('📂 No existing scenarios found');
                return { deleted: 0, discovered: 0 };
            }
            
            // ✅ FIX: Scan ALL version directories, not just current version
            const versionDirs = fs.readdirSync(onceBaseDir).filter(item => {
                const fullPath = path.join(onceBaseDir, item);
                return fs.statSync(fullPath).isDirectory();
            });
            
            let totalDeleted = 0;
            let totalDiscovered = 0;
            
            for (const versionDir of versionDirs) {
                const scenarioBaseDir = path.join(onceBaseDir, versionDir);
                console.log(`🔍 Checking version ${versionDir}...`);
            
            // Find all scenario files
            const findScenarios = (dir: string): string[] => {
                const results: string[] = [];
                const items = fs.readdirSync(dir);
                
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    
                    try {
                        // Use lstatSync to detect symlinks without following them
                        const stat = fs.lstatSync(fullPath);
                        
                        if (stat.isDirectory()) {
                            results.push(...findScenarios(fullPath));
                        } else if (item.endsWith('.scenario.json')) {
                            // Include all .scenario.json files (symlinks will be filtered later)
                            results.push(fullPath);
                        }
                    } catch (err: any) {
                        // Skip files we can't stat (broken symlinks, permission issues, etc.)
                        if (err.code === 'ENOENT') {
                            console.log(`⚠️ Skipping inaccessible file: ${fullPath}`);
                        } else {
                            console.warn(`⚠️ Error accessing ${fullPath}:`, err.message);
                        }
                        continue;
                    }
                }
                
                return results;
            };
            
            const scenarioFiles = findScenarios(scenarioBaseDir);
            console.log(`📂 Found ${scenarioFiles.length} scenario(s) in ${versionDir}`);
            
            let deletedCount = 0;
            let discoveredCount = 0;
            
            for (const scenarioPath of scenarioFiles) {
                try {
                    // Skip symlinks - we only process main files (symlinks will be cleaned up separately)
                    const stats = fs.lstatSync(scenarioPath);
                    if (stats.isSymbolicLink()) {
                        // Check if symlink target exists
                        if (!fs.existsSync(scenarioPath)) {
                            // Broken symlink - delete it
                            fs.unlinkSync(scenarioPath);
                            console.log(`🗑️  Deleted broken symlink: ${path.basename(scenarioPath)}`);
                        }
                        continue;
                    }
                    
                    const scenarioData = JSON.parse(fs.readFileSync(scenarioPath, 'utf8')) as Scenario<ONCEPeerModel>;
                    
                    // Direct access to ONCEPeerModel
                    const model = scenarioData.model;
                    
                    const state = model.state;
                    const uuid = model.uuid;
                    const port = model.capabilities?.find((c: any) => c.capability === 'httpPort')?.port || model.port;
                    
                    if (state === LifecycleState.SHUTDOWN || state === LifecycleState.STOPPED) {
                        // Delete shutdown/stopped server scenarios (both main file and symlink)
                        fs.unlinkSync(scenarioPath);
                        
                        // Delete corresponding symlink if it exists
                        if (port) {
                            const symlinkPath = path.join(scenarioBaseDir, `capability/httpPort/${port}/${uuid}.scenario.json`);
                            if (fs.existsSync(symlinkPath)) {
                                fs.unlinkSync(symlinkPath);
                            }
                        }
                        
                        deletedCount++;
                        console.log(`🗑️  Deleted shutdown server scenario: ${uuid} (port ${port})`);
                    } else if (state === LifecycleState.RUNNING || state === LifecycleState.CLIENT_SERVER) {
                        // Check if this is a different server (not ourself)
                        if (uuid === this.serverModel.uuid) {
                            // Skip our own scenario
                            continue;
                        }
                        
                        // Discover running server (client or old primary)
                        if (port) {
                            // Try to connect to the server to see if it's reachable
                            try {
                                const http = await import('http');
                                await new Promise<void>((resolve, reject) => {
                                    const req = http.request({
                                        hostname: 'localhost',
                                        port: port,
                                        path: '/health',
                                        method: 'GET',
                                        timeout: 1000
                                    }, (res) => {
                                        if (res.statusCode === 200) {
                                            resolve();
                                        } else {
                                            reject(new Error('Server not healthy'));
                                        }
                                    });
                                    
                                    req.on('error', reject);
                                    req.on('timeout', () => {
                                        req.destroy();
                                        reject(new Error('Timeout'));
                                    });
                                    req.end();
                                });
                                
                                // Server is reachable
                                if (port === 42777) {
                                    // Found another primary server - this is a conflict!
                                    // Delete this scenario and let the current primary take over
                                    fs.unlinkSync(scenarioPath);
                                    deletedCount++;
                                    console.log(`⚠️  Deleted conflicting primary scenario: ${uuid} (port ${port})`);
                                } else {
                                    // Client server is running - register it
                                    discoveredCount++;
                                    console.log(`🔍 Discovered running client server: ${uuid} on port ${port}`);
                                    
                                    // ✅ PROTOCOL-LESS: Store full scenario (not just model)
                                    // @pdca 2025-11-22-UTC-1500.iteration-01.6.4b-protocol-less-registry.pdca.md
                                    this.serverRegistry.set(uuid, {
                                        scenario: scenarioData,  // Store full scenario object
                                        lastSeen: new Date().toISOString(),
                                        websocket: undefined // Will connect later if needed
                                    });
                                }
                            } catch (error) {
                                // Server not reachable, delete stale scenario (both main file and symlink)
                                fs.unlinkSync(scenarioPath);
                                
                                // Delete corresponding symlink if it exists
                                const symlinkPath = path.join(scenarioBaseDir, `capability/httpPort/${port}/${uuid}.scenario.json`);
                                if (fs.existsSync(symlinkPath)) {
                                    fs.unlinkSync(symlinkPath);
                                }
                                
                                deletedCount++;
                                console.log(`🗑️  Deleted stale server scenario: ${uuid} (port ${port} not reachable)`);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`⚠️  Error processing scenario ${scenarioPath}:`, error);
                }
            }
            
            // Aggregate counts for this version
            totalDeleted += deletedCount;
            totalDiscovered += discoveredCount;
            
            // ✅ CLEANUP PHASE 1: Remove ALL broken symlinks in capability directory
            const capabilityDir = path.join(scenarioBaseDir, 'capability');
            if (fs.existsSync(capabilityDir)) {
                const cleanupBrokenSymlinks = (dir: string): number => {
                    let cleaned = 0;
                    const items = fs.readdirSync(dir);
                    
                    for (const item of items) {
                        const fullPath = path.join(dir, item);
                        const stats = fs.lstatSync(fullPath);
                        
                        if (stats.isDirectory()) {
                            cleaned += cleanupBrokenSymlinks(fullPath);
                        } else if (stats.isSymbolicLink()) {
                            // Check if symlink target exists
                            if (!fs.existsSync(fullPath)) {
                                fs.unlinkSync(fullPath);
                                cleaned++;
                                console.log(`🗑️  Deleted broken symlink: ${path.relative(scenarioBaseDir, fullPath)}`);
                            }
                        }
                    }
                    return cleaned;
                };
                
                const brokenSymlinksRemoved = cleanupBrokenSymlinks(capabilityDir);
                if (brokenSymlinksRemoved > 0) {
                    console.log(`🗑️  Removed ${brokenSymlinksRemoved} broken symlink(s) in capability directory`);
                }
            }
            
            // ✅ CLEANUP PHASE 2: Remove empty directories after housekeeping
            const cleanupEmptyDirs = (dir: string): boolean => {
                if (!fs.existsSync(dir)) return true;
                
                const items = fs.readdirSync(dir);
                
                // Recursively clean subdirectories first
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    if (fs.statSync(fullPath).isDirectory()) {
                        cleanupEmptyDirs(fullPath);
                    }
                }
                
                // Check if directory is now empty
                const remainingItems = fs.readdirSync(dir);
                if (remainingItems.length === 0) {
                    fs.rmdirSync(dir);
                    console.log(`🗑️  Removed empty directory: ${path.relative(scenarioBaseDir, dir)}`);
                    return true;
                }
                return false;
            };
            
            // Clean up capability directories
            if (fs.existsSync(capabilityDir)) {
                cleanupEmptyDirs(capabilityDir);
            }
            
            }  // END for each version directory
            
            console.log(`✅ Housekeeping complete: ${totalDeleted} deleted, ${totalDiscovered} discovered`);
            
            return { deleted: totalDeleted, discovered: totalDiscovered };
            
        } catch (error) {
            console.error('❌ Housekeeping error:', error);
            return { deleted: 0, discovered: 0 };
        }
    }

    /**
     * Stop server gracefully
     * ✅ Sends scenario state update to primary
     * ✅ Stops HTTP redirect server (primary only)
     * @pdca 2025-11-22-UTC-1600.iteration-01.6.4d-scenario-state-transfer.pdca.md
     * @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
     */
    async stopServer(): Promise<void> {
        this.serverModel.state = LifecycleState.STOPPING;
        
        // Update scenario to reflect stopping state
        await this.updateScenarioState(LifecycleState.STOPPING);

        // ✅ NEW: Notify primary via scenario state transfer
        this.notifyPrimaryOfStateChange();  // Send scenario with state=stopping

        if (this.primaryServerConnection) {
            // Give primary time to process state change
            await new Promise(resolve => setTimeout(resolve, 100));
            this.primaryServerConnection.close();
        }

        // Close all WebSocket connections first
        if (this.wsServer) {
            // Force close all WebSocket client connections
            this.wsServer.clients.forEach(client => {
                client.close();
            });
            this.wsServer.close();
        }
        
        // ✅ H.2: Stop HTTP redirect server (primary only)
        if (this.httpRedirectServer) {
            await new Promise<void>((resolve) => {
                this.httpRedirectServer!.close(() => {
                    console.log('🛑 HTTP redirect server stopped');
                    resolve();
                });
            });
        }

        if (this.httpServer) {
            try {
                await this.httpServer.stop();
                console.log('🛑 HTTPS server stopped');
                this.serverModel.state = LifecycleState.SHUTDOWN;
                
                // Update scenario to SHUTDOWN state for housekeeping
                await this.updateScenarioState(LifecycleState.SHUTDOWN);
                
                // Exit process after cleanup (for client servers)
                // Don't exit in test environment
                if (!this.serverModel.isPrimaryServer && process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
                    setTimeout(() => process.exit(0), 100);
                }
            } catch (error) {
                console.error('❌ Error stopping HTTPS server:', error);
                this.serverModel.state = LifecycleState.SHUTDOWN;
            }
        }
    }
    
    /**
     * Update scenario state for graceful shutdown tracking
     * Updates main scenario file (symlinks will automatically reflect changes)
     * ✅ Supports both legacy and Web4 Standard formats
     * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
     */
    private async updateScenarioState(state: LifecycleState): Promise<void> {
        try {
            const httpCapability = this.serverModel.capabilities.find(c => c.capability === 'httpPort');
            if (!httpCapability) return;
            
            const domainParts = this.getDetectDomainPath();
            const hostname = this.serverModel.hostname;
            
            // Update main scenario file (not the symlink)
            const mainScenarioPath = path.join(
                this.projectRoot,
                'scenarios',
                'domain',           // ✅ Added domain/ prefix
                ...domainParts,
                hostname,
                'ONCE',
                this.versionFromComponent,
                `${this.serverModel.uuid}.scenario.json`
            );
            
            if (fs.existsSync(mainScenarioPath)) {
                const scenarioData = JSON.parse(fs.readFileSync(mainScenarioPath, 'utf8')) as Scenario<ONCEPeerModel>;
                
                // Update state in ONCEPeerModel
                scenarioData.model.state = state;
                
                fs.writeFileSync(mainScenarioPath, JSON.stringify(scenarioData, null, 2));
                console.log(`💾 Updated scenario state to: ${state}`);
            }
        } catch (error) {
            console.error('⚠️  Failed to update scenario state:', error);
        }
    }

    /**
     * Shutdown all servers gracefully (infrastructure method)
     * Called by DefaultONCE.shutdownAll()
     * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
     */
    async shutdownAllServers(): Promise<void> {
        console.log('🛑 Initiating graceful shutdown of all peers...');
        
        // ✅ Web4 Principle 11: Use IOR calls, NOT protocol messages!
        // Send peerStop IOR to each registered client server
        const shutdownPromises: Promise<void>[] = [];
        
        for (const [uuid, entry] of this.serverRegistry.entries()) {
            // Extract port from scenario - MC.3: ONCEPeerModel has capabilities at model level
            const model = entry.scenario?.model;
            const capabilities = model?.capabilities || [];
            const portCap = capabilities.find(function(c: any) { return c.capability === 'httpPort'; });
            const port = portCap?.port || model?.port;
            if (!port) {
                console.log(`⚠️  No port found for client ${uuid.substring(0, 8)}, skipping`);
                continue;
            }
            
            console.log(`🛑 Sending peerStop IOR to client: ${uuid.substring(0, 8)} on port ${port}`);
            
            // Fire-and-forget IOR call with timeout
            const shutdownPromise = this.sendPeerStopIOR(uuid, port).catch(function(error) {
                console.log(`⚠️  Client ${uuid.substring(0, 8)} may already be stopped: ${error.message}`);
            });
            
            shutdownPromises.push(shutdownPromise);
        }
        
        // Wait for all shutdown requests (with overall timeout)
        await Promise.race([
            Promise.allSettled(shutdownPromises),
            this.sleep(3000)  // Max 3s for all clients
        ]);
        
        console.log('🛑 All client shutdown requests sent, stopping primary...');
        
        // Shutdown self
        await this.stopServer();
    }
    
    /**
     * Send peerStop IOR to a client server
     * 
     * ✅ Uses HTTPS by default (all servers are HTTPS now)
     * 
     * @param uuid Client server UUID
     * @param port Client server port
     * @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
     */
    private async sendPeerStopIOR(uuid: string, port: number): Promise<void> {
        const version = this.component?.model?.version || '0.3.21.9';
        // ✅ Use HTTPS (all servers are HTTPS by default now)
        const iorUrl = `https://localhost:${port}/ONCE/${version}/${uuid}/peerStop`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(function() { controller.abort(); }, 2000);
        
        try {
            // ✅ For self-signed certs, we need to use https module with rejectUnauthorized: false
            const https = await import('https');
            const url = new URL(iorUrl);
            
            await new Promise<void>((resolve, reject) => {
                const req = https.request({
                    hostname: url.hostname,
                    port: url.port,
                    path: url.pathname,
                    method: 'POST',
                    rejectUnauthorized: false,  // ✅ Accept self-signed certs
                    timeout: 2000
                }, (res) => {
                    res.on('data', () => {}); // Consume response
                    res.on('end', () => resolve());
                });
                
                req.on('error', reject);
                req.on('timeout', () => {
                    req.destroy();
                    reject(new Error('Timeout'));
                });
                
                controller.signal.addEventListener('abort', () => {
                    req.destroy();
                    reject(new Error('Aborted'));
                });
                
                req.end();
            });
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Helper method for async sleep
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
