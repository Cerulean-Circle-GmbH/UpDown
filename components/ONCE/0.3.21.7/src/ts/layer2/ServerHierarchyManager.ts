/**
 * Server Hierarchy Manager v0.2.0.0 - Implements server hierarchy with name server model
 * Implements requirement 9beee86b-09c2-43c8-b449-b9a7b8f2b338
 */

import { createServer, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { exec } from 'child_process';
import { PortManager } from './PortManager.js';
import { ONCEServerModel } from '../layer3/ONCEServerModel.interface.js';
import { LifecycleState } from '../layer3/LifecycleEvents.js';
import { IOR, iorToUrl } from '../layer3/IOR.js';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { realpathSync } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { logAction, logBroadcast, logRegistration, logConnection, logDisconnection, shortUUID, serverIdentity } from '../layer1/LoggingUtils.js';
// ⚠️ DELETED: ONCEScenarioMessage - Protocol violation (Web4 is protocol-less)
// @pdca 2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md - Iteration 1.6.2
import { NodeOSInfrastructure } from '../layer1/NodeOSInfrastructure.js';
import { EnvironmentModel } from '../layer3/EnvironmentModel.interface.js';
import { ScenarioTypeGuard } from '../layer1/ScenarioTypeGuard.js';
import { LegacyONCEScenario } from '../layer3/LegacyONCEScenario.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { HostnameParser } from '../layer1/HostnameParser.js';
import { IORMethodRouter } from './IORMethodRouter.js';
import { HTTPServer } from './HTTPServer.js';
import { HTTPRouter } from './HTTPRouter.js';
import { HTMLRoute } from './HTMLRoute.js';
import { ScenarioRoute } from './ScenarioRoute.js';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';

/**
 * Server registry entry for primary server
 * ✅ Protocol-Less: Stores scenarios, not message data
 * @pdca 2025-11-22-UTC-1500.iteration-01.6.4b-protocol-less-registry.pdca.md
 */
export interface ServerRegistryEntry {
    scenario: any;  // Scenario<LegacyONCEScenario> - full scenario object
    lastSeen: string;
    websocket?: WebSocket;  // KEEP for browser peers (NOT for peer kernel registration)
}

/**
 * Server Hierarchy Manager - manages ONCE v0.2.0.0 server hierarchy
 * Handles primary server (42777) and client server registration
 */
export class ServerHierarchyManager {
    private serverModel: ONCEServerModel;
    private httpServer?: HTTPServer; // ✅ Web4 Radical OOP HTTPServer
    private httpRouter: HTTPRouter; // ✅ Web4 Radical OOP HTTPRouter
    private wsServer?: WebSocketServer;
    private portManager: PortManager;
    private serverRegistry: Map<string, ServerRegistryEntry> = new Map();
    private primaryServerConnection?: WebSocket;
    private browserClients: Set<WebSocket> = new Set(); // Track browser WebSocket connections
    private infrastructure: NodeOSInfrastructure; // ✅ Layer 1 infrastructure injection
    private iorRouter: IORMethodRouter; // ✅ IOR method router for Web4 routing
    component?: any; // Backward link to DefaultONCE for path authority
    version: string; // ✅ Self-discovered version (ALWAYS set, never undefined)

    constructor() {
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
            uuid: uuidv4(),
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
        // ✅ Route 1: Home page ("/")
        const homeRoute = new HTMLRoute();
        homeRoute.model.uuid = uuidv4();
        homeRoute.setPattern('/', HttpMethod.GET);
        homeRoute.setProvider(() => this.component!.serveStatus());
        homeRoute.model.priority = 50;
        this.httpRouter.registerRoute(homeRoute);
        
        // ✅ Route 2: Demo Hub ("/demo")
        const demoRoute = new HTMLRoute();
        demoRoute.model.uuid = uuidv4();
        demoRoute.setPattern('/demo', HttpMethod.GET);
        demoRoute.setProvider(() => this.component!.serveDemoHub());
        demoRoute.model.priority = 50;
        this.httpRouter.registerRoute(demoRoute);
        
        // ✅ Route 3: Demo Hub with trailing slash ("/demo/")
        const demoRoute2 = new HTMLRoute();
        demoRoute2.model.uuid = uuidv4();
        demoRoute2.setPattern('/demo/', HttpMethod.GET);
        demoRoute2.setProvider(() => this.component!.serveDemoHub());
        demoRoute2.model.priority = 50;
        this.httpRouter.registerRoute(demoRoute2);
        
        // ✅ Route 4: ONCE Minimal ("/once")
        const onceRoute = new HTMLRoute();
        onceRoute.model.uuid = uuidv4();
        onceRoute.setPattern('/once', HttpMethod.GET);
        onceRoute.setProvider(() => this.component!.serveOnceMinimal());
        onceRoute.model.priority = 50;
        this.httpRouter.registerRoute(onceRoute);
        
        // ✅ Route 5: ONCE Minimal with trailing slash ("/once/")
        const onceRoute2 = new HTMLRoute();
        onceRoute2.model.uuid = uuidv4();
        onceRoute2.setPattern('/once/', HttpMethod.GET);
        onceRoute2.setProvider(() => this.component!.serveOnceMinimal());
        onceRoute2.model.priority = 50;
        this.httpRouter.registerRoute(onceRoute2);
        
        // ✅ Route 6: Communication Log ("/onceCommunicationLog")
        const logRoute = new HTMLRoute();
        logRoute.model.uuid = uuidv4();
        logRoute.setPattern('/onceCommunicationLog', HttpMethod.GET);
        logRoute.setProvider(() => this.component!.serveOnceCommunicationLog());
        logRoute.model.priority = 50;
        this.httpRouter.registerRoute(logRoute);
        
        // ✅ Route 7: Communication Log with trailing slash ("/onceCommunicationLog/")
        const logRoute2 = new HTMLRoute();
        logRoute2.model.uuid = uuidv4();
        logRoute2.setPattern('/onceCommunicationLog/', HttpMethod.GET);
        logRoute2.setProvider(() => this.component!.serveOnceCommunicationLog());
        logRoute2.model.priority = 50;
        this.httpRouter.registerRoute(logRoute2);
        
        // ✅ Route 8: Health endpoint ("/health") - Returns Scenario
        const healthRoute = new ScenarioRoute();
        healthRoute.model.uuid = uuidv4();
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
        this.httpRouter.registerRoute(healthRoute);
        
        // ✅ Route 9: Servers list ("/servers") - Returns Scenario (Primary only)
        if (this.serverModel.isPrimaryServer) {
            const serversRoute = new ScenarioRoute();
            serversRoute.model.uuid = uuidv4();
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
        }
        
        console.log(`📍 Registered ${this.httpRouter.model.routes.length} routes in HTTPRouter`);
    }

    /**
     * Start server with automatic port management and hierarchy
     */
    async startServer(): Promise<void> {
        this.serverModel.state = LifecycleState.STARTING;

        try {
            // ✅ FIX: Detect hostname/domain/IP before starting peer kernel
            await this.detectAndSetEnvironment();
            
            // Get next available port (42777 or 8080+)
            const portResult = await this.portManager.getNextAvailablePort();
            
            this.serverModel.isPrimaryServer = portResult.isPrimary;
            
            // Add HTTP capability
            this.serverModel.capabilities.push({
                capability: 'httpPort',
                port: portResult.port
            });

            // Start HTTP peer endpoint
            await this.startHttpServer(portResult.port);
            
            // Start WebSocket peer communication
            await this.startWebSocketServer();
            
            if (this.serverModel.isPrimaryServer) {
                console.log(`🟢 Started as PRIMARY SERVER on port ${portResult.port}`);
                console.log(`📋 Server UUID: ${this.serverModel.uuid}`);
                console.log(`🏠 Domain: ${this.serverModel.domain}`);
                this.serverModel.state = LifecycleState.PRIMARY_SERVER;
                
                // Perform housekeeping: discover existing peers, cleanup shutdown scenarios
                await this.performHousekeeping();
            } else {
                console.log(`🔵 Started as CLIENT SERVER on port ${portResult.port}`);
                console.log(`📋 Server UUID: ${this.serverModel.uuid}`);
                
                // Register with primary peer
                await this.registerWithPrimaryServer();
                this.serverModel.state = LifecycleState.CLIENT_SERVER;
            }

            this.serverModel.state = LifecycleState.RUNNING;
            
            // Try to load existing scenario first, then save if needed
            await this.loadOrCreateScenario();
            
        } catch (error) {
            this.serverModel.state = LifecycleState.ERROR;
            console.error('❌ Failed to start server:', error);
            throw error;
        }
    }

    /**
     * Start HTTP server on specified port
     * 
     * ✅ Web4 Radical OOP: Uses HTTPServer + HTTPRouter classes
     * @pdca 2025-12-01-UTC-0950.iteration-05-phase5-7-httpserver-router-refactoring.pdca.md
     */
    private async startHttpServer(port: number): Promise<void> {
        // Register all routes
        this.registerRoutes();
        
        // Create HTTPServer instance
        this.httpServer = new HTTPServer();
        this.httpServer.model.uuid = uuidv4();
        this.httpServer.model.port = port;
        this.httpServer.model.host = this.serverModel.host;
        this.httpServer.router = this.httpRouter;
        
        // Start the server
        await this.httpServer.start(port, this.serverModel.host);
        
        console.log(`🌐 HTTP server started on ${this.serverModel.host}:${port}`);
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
     * Handle HTTP requests
     */
    private async handleHttpRequest(req: any, res: any): Promise<void> {
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        // ✅ **Phase 1: IOR Method Invocation Routing (Web4 Principle 12)**
        // Check if URL matches IOR pattern: /{component}/{version}/{uuid}/{method}
        // @pdca 2025-11-30-UTC-1724.iteration-05-httprouter-ior-routing.pdca.md
        const iorMethodCall = this.iorRouter.parseIorUrl(url.pathname);
        if (iorMethodCall) {
            console.log(`[ServerHierarchyManager] IOR method invocation: ${iorMethodCall.componentName}.${iorMethodCall.methodName}()`);
            
            // Initialize IOR router with ONCE kernel if not already done
            if (!this.iorRouter.model.uuid) {
                this.iorRouter.init(undefined, this.component);
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
                const result = await this.iorRouter.route(url.pathname, body);
                res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(result));
                return; // Exit early - IOR routing handled
            } catch (error: any) {
                res.writeHead(500, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ 
                    error: error.message,
                    ior: url.pathname 
                }));
                return; // Exit early - error handled
            }
        }
        
        // ✅ **Phase 2: Static Route Handling (Legacy/HTML pages)**
        if (url.pathname === '/') {
            // ✅ RADICAL OOP: Delegate to DefaultONCE.serveStatus()
            // @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(this.component!.serveStatus());
        } else if (url.pathname === '/health') {
            // ✅ RADICAL OOP: Delegate to DefaultONCE.getHealth()
            // @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            
            try {
                const health = this.component!.getHealth();
                res.end(JSON.stringify(health));
            } catch (error: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        } else if (url.pathname === '/onceCommunicationLog' || url.pathname === '/onceCommunicationLog/') {
            // ✅ RADICAL OOP: Delegate to NodeJsOnce.serveOnceCommunicationLog()
            // @pdca 2025-11-25-UTC-2030.iteration-01.11-once-route-refactoring.pdca.md
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(this.component!.serveOnceCommunicationLog());
        } else if (url.pathname === '/once' || url.pathname === '/once/') {
            // ✅ RADICAL OOP: Delegate to NodeJsOnce.serveOnceMinimal()
            // @pdca 2025-11-25-UTC-2030.iteration-01.11-once-route-refactoring.pdca.md
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(this.component!.serveOnceMinimal());
        } else if (url.pathname === '/demo' || url.pathname === '/demo/') {
            // ✅ RADICAL OOP: Delegate to DefaultONCE.serveDemoHub()
            // @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(this.component!.serveDemoHub());
        } else if (url.pathname === '/servers' && this.serverModel.isPrimaryServer) {
            // ✅ RADICAL OOP: Delegate to DefaultONCE.getServers()
            // @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            
            try {
                const serverList = this.component!.getServers();
                res.end(JSON.stringify(serverList));
            } catch (error: any) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        } else if (url.pathname === '/start-server' && req.method === 'POST' && this.serverModel.isPrimaryServer) {
            // ✅ RADICAL OOP: Delegate to DefaultONCE.startClientServer()
            // @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            
            try {
                await this.component!.startClientServer();
                res.end(JSON.stringify({ success: true, message: 'Server starting...' }));
            } catch (error: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        } else if (url.pathname === '/discover-servers' && req.method === 'POST' && this.serverModel.isPrimaryServer) {
            // ✅ RADICAL OOP: Delegate to DefaultONCE.discoverServers()
            // @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            
            try {
                const result = await this.component!.discoverServers();
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Discovery complete',
                    deleted: result.deleted,
                    discovered: result.discovered
                }));
            } catch (error: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        } else if (url.pathname === '/shutdown-all' && req.method === 'POST' && this.serverModel.isPrimaryServer) {
            // ✅ RADICAL OOP: Delegate to DefaultONCE.shutdownAll()
            // @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ success: true, message: 'Shutting down all servers...' }));
            
            // Await in background (don't block response)
            this.component!.shutdownAll().then(() => {
                // Exit process after shutdown complete
                process.exit(0);
            }).catch(console.error);
        } else if (url.pathname === '/shutdown-primary' && req.method === 'POST') {
            // Allow ANY client (or test) to trigger cascading shutdown of primary + all clients
            // This enables tests to clean up existing server hierarchy before starting fresh
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ success: true, message: 'Primary shutdown initiated...' }));
            
            if (this.serverModel.isPrimaryServer) {
                // We ARE the primary - cascade shutdown
                console.log('🛑 Client-triggered cascading shutdown initiated');
                
                // Shutdown all client servers first
                for (const [uuid, entry] of this.serverRegistry.entries()) {
                    if (entry.websocket && entry.websocket.readyState === WebSocket.OPEN) {
                        console.log(`🛑 Sending shutdown to client: ${uuid}`);
                        entry.websocket.send(JSON.stringify({ type: 'shutdown-command' }));
                    }
                }
                
                // Wait for clients to shutdown
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Shutdown primary server
                console.log('🛑 Shutting down primary server');
                await this.stopServer();
                
                // Exit process
                process.exit(0);
            } else {
                // We are a CLIENT - forward request to primary
                console.log('🛑 Forwarding shutdown request to primary server');
                const primaryUrl = this.serverModel.primaryServerIOR;
                if (primaryUrl) {
                    // Extract port from IOR (format: web4://localhost:PORT/once?...)
                    const portMatch = primaryUrl.match(/:(\d+)\//);
                    if (portMatch) {
                        const primaryPort = portMatch[1];
                        const http = await import('http');
                        
                        const options = {
                            hostname: 'localhost',
                            port: primaryPort,
                            path: '/shutdown-primary',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        };
                        
                        const req = http.request(options, () => {
                            console.log('✅ Shutdown request forwarded to primary');
                        });
                        
                        req.on('error', (error) => {
                            console.error('❌ Failed to forward shutdown request:', error);
                        });
                        
                        req.end();
                    }
                }
            }
        } else if (url.pathname === '/stop-server' && req.method === 'POST' && this.serverModel.isPrimaryServer) {
            // Stop a client server dynamically
            let body = '';
            req.on('data', (chunk: any) => { body += chunk.toString(); });
            req.on('end', async () => {
                try {
                    const { port, uuid } = JSON.parse(body);
                    
                    // Find the registered server
                    const registryEntry = this.serverRegistry.get(uuid);
                    if (registryEntry && registryEntry.websocket) {
                        // Send shutdown command via WebSocket
                        registryEntry.websocket.send(JSON.stringify({
                            type: 'shutdown-command'
                        }));
                        
                        // Wait for the scenario to be updated to SHUTDOWN state
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // Delete the client's scenario file (use new path structure)
                        const domainPath = this.getDetectDomainPath();
                        const hostname = this.serverModel.hostname;
                        const scenarioDir = path.join(
                            this.projectRoot,
                            'scenarios',
                            ...domainPath,
                            hostname,
                            'ONCE',
                            this.versionFromComponent,
                            'capability',
                            'httpPort',
                            port.toString()
                        );
                        const scenarioPath = path.join(scenarioDir, `${uuid}.scenario.json`);
                        
                        if (fs.existsSync(scenarioPath)) {
                            fs.unlinkSync(scenarioPath);
                            console.log(`🗑️  Deleted client scenario: ${uuid} (port ${port})`);
                        }
                        
                        // Remove from registry
                        this.serverRegistry.delete(uuid);
                        
                        // ✅ Broadcast server stopped event to all browser clients
                        this.broadcastServerEvent('server-stopped', { uuid, port });
                        
                        res.writeHead(200, { 
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        });
                        res.end(JSON.stringify({ success: true, message: 'Server stopped' }));
                    } else {
                        res.writeHead(404, { 
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        });
                        res.end(JSON.stringify({ success: false, message: 'Server not found' }));
                    }
                } catch (error) {
                    res.writeHead(500, { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: false, message: 'Failed to stop server' }));
                }
            });
        } else if (url.pathname.startsWith('/dist/') || url.pathname.startsWith('/src/')) {
            // Serve static files from component directory
            this.serveStaticFile(url.pathname, res);
        } else {
            // ============================================================================
            // ✅ GENERIC METHOD INVOCATION ENDPOINT - IOR-based Method Calls
            // @pdca 2025-11-22-UTC-1730.iteration-01.6.5-ior-method-invocation.pdca.md
            // 
            // Pattern: /ONCE/{method} or /ONCE/{version}/{uuid}/{method}
            // Like CLI: "once info" → GET /ONCE/info
            // Query params: ?param1=value1 → set on model temporarily
            // 
            // Examples:
            // GET /ONCE/getHealth → DefaultONCE.getHealth()
            // GET /ONCE/getServers → DefaultONCE.getServers()
            // GET /ONCE/info → DefaultONCE.info()
            // ============================================================================
            const methodMatch = url.pathname.match(/^\/ONCE\/(?:[\d.]+\/[\w-]+\/)?([\w]+)$/);
            if (methodMatch) {
                const methodName = methodMatch[1];
                
                // Parse query parameters
                const params: Record<string, any> = {};
                url.searchParams.forEach((value, key) => {
                    params[key] = value;
                });
                
                try {
                    // Delegate to DefaultONCE.invokeMethod()
                    const result = await (this.component as any).invokeMethod(methodName, params);
                    
                    res.writeHead(200, { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify(result));
                } catch (error: any) {
                    res.writeHead(404, { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ 
                        error: error.message,
                        method: methodName,
                        availableMethods: this.getAvailableMethods()
                    }));
                }
            } else {
                // 404 Not Found
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        }
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
     */
    private renderTemplate(templatePath: string): string {
        const componentRoot = this.component?.model.componentRoot;
        if (!componentRoot) {
            throw new Error('Component not initialized');
        }
        const fullPath = path.join(componentRoot, 'src/view/html', templatePath);
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
        if (!this.component?.model.componentRoot) {
            throw new Error('ServerHierarchyManager: component backlink not set. component.model.componentRoot is undefined.');
        }
        const fullPath = path.join(this.component.model.componentRoot, 'src/view/html/once-client.html');
        const html = fs.readFileSync(fullPath, 'utf-8');
        
        // Replace all hardcoded version strings with dynamic version
        return html.replace(/0\.3\.20\.[0-9]/g, this.versionFromComponent);
    }

    /**
     * Get minimal ONCE bootstrap HTML (for /once endpoint)
     * @pdca 2025-11-25-UTC-2030.iteration-01.11-once-route-refactoring.pdca.md
     */
    getOnceMinimalHTML(): string {
        if (!this.component?.model.componentRoot) {
            throw new Error('ServerHierarchyManager: component backlink not set. component.model.componentRoot is undefined.');
        }
        const fullPath = path.join(this.component.model.componentRoot, 'src/view/html/once-minimal.html');
        const html = fs.readFileSync(fullPath, 'utf-8');
        
        // Replace all hardcoded version strings with dynamic version
        return html.replace(/0\.3\.20\.[0-9]/g, this.versionFromComponent);
    }

    /**
     * Get demo hub HTML (for /demo endpoint)
     * ✅ TRUE Radical OOP: Dynamically inject version instead of hardcoding
     * ✅ Path Authority: component.model.componentRoot set in DefaultONCE constructor
     * @deprecated Use DefaultONCE.serveDemoHub() instead (delegates to this method)
     * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
     */
    getDemoHubHTML(): string {
        if (!this.component?.model.componentRoot) {
            throw new Error('ServerHierarchyManager: component backlink not set. component.model.componentRoot is undefined.');
        }
        const fullPath = path.join(this.component.model.componentRoot, 'src/view/html/demo-hub.html');
        const html = fs.readFileSync(fullPath, 'utf-8');
        
        // Replace all hardcoded version strings with dynamic version
        return html.replace(/0\.3\.20\.[0-9]/g, this.versionFromComponent);
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
                    // Extract capabilities from scenario
                    const guard = new ScenarioTypeGuard();
                    guard.init(firstClient.scenario);
                    const capabilities = guard.isLegacy() 
                        ? guard.asLegacy()!.state?.capabilities
                        : guard.asWeb4<LegacyONCEScenario>()!.model.state?.capabilities;
                    const port = capabilities?.find((c: any) => c.capability === 'httpPort')?.port;
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
            uuid: uuidv4(),
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
                const ackConnection = new WebSocket(`ws://localhost:${scenarioModel.state.from.port}`);
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
     * Get HTTP port from server model
     */
    private getHttpPort(): number {
        const httpCapability = this.serverModel.capabilities.find(c => c.capability === 'httpPort');
        return httpCapability?.port || 0;
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
    private handleScenarioStateUpdate(ws: WebSocket, scenario: any): void {
        const guard = new ScenarioTypeGuard();
        guard.init(scenario);
        
        const state = guard.isLegacy() 
            ? guard.asLegacy()!.state?.state
            : guard.asWeb4<LegacyONCEScenario>()!.model.state?.state;
        
        const uuid = guard.isLegacy()
            ? guard.asLegacy()!.uuid
            : guard.asWeb4<LegacyONCEScenario>()!.model.uuid;
        
        const capabilities = guard.isLegacy()
            ? guard.asLegacy()!.state?.capabilities
            : guard.asWeb4<LegacyONCEScenario>()!.model.state?.capabilities;
        
        const port = capabilities?.find((c: any) => c.capability === 'httpPort')?.port;
        
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
            
            // ✅ Protocol-less: Broadcast scenario (browser detects from state)
            this.broadcastToBrowserClients(scenario);
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
            const wsUrl = `ws://localhost:${primaryPort}`;
            
            this.primaryServerConnection = new WebSocket(wsUrl);
            
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
     * Load existing scenario or create new one with organized directory structure
     */
    private async loadOrCreateScenario(): Promise<void> {
        const httpCapability = this.serverModel.capabilities.find(c => c.capability === 'httpPort');
        if (!httpCapability) return;

        // Use detected domain/hostname for scenario path
        // New structure: scenarios/{domain-parts}/{hostname}/ONCE/{version}
        const domainPath = this.getDetectDomainPath(); // e.g., ['box', 'fritz']
        const hostname = this.serverModel.hostname; // e.g., "McDonges-3"
        
        // Main scenario file location
        const mainScenarioDir = path.join(
            this.projectRoot, 
            'scenarios',
            ...domainPath,      // Spread domain parts as separate directories
            hostname,
            'ONCE',
            this.versionFromComponent
        );
        const mainScenarioPath = path.join(mainScenarioDir, `${this.serverModel.uuid}.scenario.json`);
        
        // Capability symlink location (for discovery by port)
        const capabilityDir = path.join(
            this.projectRoot,
            'scenarios',
            ...domainPath,
            hostname,
            'ONCE',
            this.versionFromComponent,
            'capability',
            'httpPort',
            httpCapability.port.toString()
        );
        const capabilitySymlink = path.join(capabilityDir, `${this.serverModel.uuid}.scenario.json`);
        
        console.log(`🔍 [PATH] ServerHierarchyManager.loadOrCreateScenario() projectRoot=${this.projectRoot} scenario=${mainScenarioPath}`);
        
        try {
            // Try to load existing scenario first
            const fs = await import('fs');
            const path = await import('path');
            
            if (fs.existsSync(mainScenarioPath)) {
                console.log(`📂 Loading existing scenario: ${mainScenarioPath}`);
                const scenarioData = JSON.parse(fs.readFileSync(mainScenarioPath, 'utf8'));
                
                // Restore configuration from scenario
                if (scenarioData.state) {
                    console.log(`✅ Scenario restored from ${mainScenarioPath}`);
                    
                    // Ensure capability symlink exists
                    this.ensureCapabilitySymlink(capabilityDir, capabilitySymlink, mainScenarioPath);
                    return;
                }
            }
        } catch (error) {
            console.log(`⚠️ Could not load existing scenario: ${error instanceof Error ? error.message : String(error)}`);
        }

        // Create new scenario if none exists or loading failed
        await this.saveScenario(mainScenarioDir, mainScenarioPath, capabilityDir, capabilitySymlink);
    }

    /**
     * Ensure capability symlink exists pointing to main scenario file (DRY principle)
     */
    private async ensureCapabilitySymlink(capabilityDir: string, symlinkPath: string, targetPath: string): Promise<void> {
        try {
            const fs = await import('fs');
            const path = await import('path');
            
            // Ensure capability directory exists
            if (!fs.existsSync(capabilityDir)) {
                fs.mkdirSync(capabilityDir, { recursive: true });
            }
            
            // Remove existing file/symlink if it exists
            if (fs.existsSync(symlinkPath)) {
                const stats = fs.lstatSync(symlinkPath);
                if (!stats.isSymbolicLink()) {
                    // It's a regular file - remove it (we'll replace with symlink)
                    fs.unlinkSync(symlinkPath);
                    console.log(`🔄 Removed duplicate file, creating symlink: ${symlinkPath}`);
                } else {
                    // Already a symlink - no action needed
                    return;
                }
            }
            
            // Create relative symlink from capability dir to main file
            const relativePath = path.relative(capabilityDir, targetPath);
            fs.symlinkSync(relativePath, symlinkPath);
            console.log(`🔗 Created capability symlink: ${symlinkPath} -> ${relativePath}`);
        } catch (error) {
            console.error(`⚠️  Failed to create capability symlink: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Save server scenario to organized directory structure
     */
    private async saveScenario(mainScenarioDir: string, mainScenarioPath: string, capabilityDir: string, capabilitySymlink: string): Promise<void> {
        try {
            const fs = await import('fs');
            const path = await import('path');
            
            // Ensure main directory exists
            fs.mkdirSync(mainScenarioDir, { recursive: true });
            
            const httpCapability = this.serverModel.capabilities.find(c => c.capability === 'httpPort');
            
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

            // Save main scenario file
            fs.writeFileSync(mainScenarioPath, JSON.stringify(scenario, null, 2));
            console.log(`📝 [WRITE] ServerHierarchyManager.saveScenario() → ${mainScenarioPath}`);
            
            // Create capability symlink pointing to main file
            this.ensureCapabilitySymlink(capabilityDir, capabilitySymlink, mainScenarioPath);
        } catch (error) {
            console.error(`❌ Failed to save scenario: ${error instanceof Error ? error.message : String(error)}`);
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
            const wsUrl = `ws://localhost:${peerPort}`;
            const peerConnection = new WebSocket(wsUrl);

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
            const domainPath = this.getDetectDomainPath();
            const hostname = this.serverModel.hostname;
            const onceBaseDir = path.join(
                this.projectRoot,
                'scenarios',
                ...domainPath,
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
                    
                    const scenarioData = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
                    
                    // Use type guard to handle both formats
                    // @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
                    const guard = new ScenarioTypeGuard();
                    guard.init(scenarioData);
                    
                    let state: string;
                    let uuid: string;
                    let port: number | undefined;
                    
                    if (guard.isLegacy()) {
                        const legacy = guard.asLegacy()!;
                        state = legacy.state?.state;
                        uuid = legacy.uuid;
                        port = legacy.state?.capabilities?.find((c: any) => c.capability === 'httpPort')?.port;
                    } else {
                        const web4 = guard.asWeb4<LegacyONCEScenario>()!;
                        state = web4.model.state?.state;
                        uuid = web4.model.uuid;
                        port = web4.model.state?.capabilities?.find((c: any) => c.capability === 'httpPort')?.port;
                    }
                    
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
     * @pdca 2025-11-22-UTC-1600.iteration-01.6.4d-scenario-state-transfer.pdca.md
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

        if (this.httpServer) {
            try {
                await this.httpServer.stop();
                console.log('🛑 HTTP server stopped');
                this.serverModel.state = LifecycleState.SHUTDOWN;
                
                // Update scenario to SHUTDOWN state for housekeeping
                await this.updateScenarioState(LifecycleState.SHUTDOWN);
                
                // Exit process after cleanup (for client servers)
                // Don't exit in test environment
                if (!this.serverModel.isPrimaryServer && process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
                    setTimeout(() => process.exit(0), 100);
                }
            } catch (error) {
                console.error('❌ Error stopping HTTP server:', error);
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
            
            const domainPath = this.getDetectDomainPath();
            const hostname = this.serverModel.hostname;
            
            // Update main scenario file (not the symlink)
            const mainScenarioPath = path.join(
                this.projectRoot,
                'scenarios',
                ...domainPath,
                hostname,
                'ONCE',
                this.versionFromComponent,
                `${this.serverModel.uuid}.scenario.json`
            );
            
            if (fs.existsSync(mainScenarioPath)) {
                const scenarioData = JSON.parse(fs.readFileSync(mainScenarioPath, 'utf8'));
                
                // Use type guard to handle both formats
                const guard = new ScenarioTypeGuard();
                guard.init(scenarioData);
                
                if (guard.isLegacy()) {
                    // Legacy format
                    const legacy = guard.asLegacy()!;
                    legacy.state.state = state;
                    legacy.metadata.modified = new Date().toISOString();
                    fs.writeFileSync(mainScenarioPath, JSON.stringify(legacy, null, 2));
                } else {
                    // Web4 Standard format
                    const web4 = guard.asWeb4<LegacyONCEScenario>()!;
                    web4.model.state.state = state;
                    web4.model.metadata.modified = new Date().toISOString();
                    fs.writeFileSync(mainScenarioPath, JSON.stringify(web4, null, 2));
                }
                
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
        // Shutdown all client servers first
        for (const [uuid, entry] of this.serverRegistry.entries()) {
            if (entry.websocket && entry.websocket.readyState === WebSocket.OPEN) {
                console.log(`🛑 Sending shutdown to client: ${uuid}`);
                entry.websocket.send(JSON.stringify({ type: 'shutdown-command' }));
            }
        }
        
        // Give clients time to shutdown
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Shutdown self
        await this.stopServer();
    }

    /**
     * Helper method for async sleep
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
