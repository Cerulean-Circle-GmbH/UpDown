/**
 * Server Hierarchy Manager v0.2.0.0 - Implements server hierarchy with name server model
 * Implements requirement 9beee86b-09c2-43c8-b449-b9a7b8f2b338
 */

import { createServer, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { exec } from 'child_process';
import { PortManager } from './PortManager.js';
import { ONCEServerModel, ONCE_DEFAULT_CONFIG, createDefaultServerModel } from '../layer3/ONCEServerModel.js';
import { LifecycleState } from '../layer3/LifecycleEvents.js';
import { IOR, iorToUrl } from '../layer3/IOR.js';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ONCEScenarioMessage } from '../layer3/ONCEModel.interface.js';

/**
 * Server registry entry for primary server
 */
export interface ServerRegistryEntry {
    model: ONCEServerModel;
    lastSeen: string;
    websocket?: WebSocket;
}

/**
 * Server Hierarchy Manager - manages ONCE v0.2.0.0 server hierarchy
 * Handles primary server (42777) and client server registration
 */
export class ServerHierarchyManager {
    private serverModel: ONCEServerModel;
    private httpServer?: Server;
    private wsServer?: WebSocketServer;
    private portManager: PortManager;
    private serverRegistry: Map<string, ServerRegistryEntry> = new Map();
    private primaryServerConnection?: WebSocket;

    constructor() {
        this.portManager = PortManager.getInstance();
        
        // Initialize server model with defaults
        const defaultModel = createDefaultServerModel();
        this.serverModel = {
            ...defaultModel,
            uuid: uuidv4(),
            pid: process.pid,
            state: LifecycleState.CREATED,
            platform: this.detectEnvironment(),
            domain: ONCE_DEFAULT_CONFIG.DEFAULT_DOMAIN,
            host: this.detectHostname(),
            ip: ONCE_DEFAULT_CONFIG.DEFAULT_IP,
            capabilities: [],
            isPrimaryServer: false
        } as ONCEServerModel;
    }

    /**
     * Start server with automatic port management and hierarchy
     */
    async startServer(): Promise<void> {
        this.serverModel.state = LifecycleState.STARTING;

        try {
            // Get next available port (42777 or 8080+)
            const portResult = await this.portManager.getNextAvailablePort();
            
            this.serverModel.isPrimaryServer = portResult.isPrimary;
            
            // Add HTTP capability
            this.serverModel.capabilities.push({
                capability: 'httpPort',
                port: portResult.port
            });

            // Start HTTP server
            await this.startHttpServer(portResult.port);
            
            // Start WebSocket server
            await this.startWebSocketServer();
            
            if (this.serverModel.isPrimaryServer) {
                console.log(`🟢 Started as PRIMARY SERVER on port ${portResult.port}`);
                console.log(`📋 Server UUID: ${this.serverModel.uuid}`);
                console.log(`🏠 Domain: ${this.serverModel.domain}`);
                this.serverModel.state = LifecycleState.PRIMARY_SERVER;
                
                // Perform housekeeping: discover existing servers, cleanup shutdown scenarios
                await this.performHousekeeping();
            } else {
                console.log(`🔵 Started as CLIENT SERVER on port ${portResult.port}`);
                console.log(`📋 Server UUID: ${this.serverModel.uuid}`);
                
                // Register with primary server
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
     * Start HTTP server
     */
    private async startHttpServer(port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.httpServer = createServer((req, res) => {
                this.handleHttpRequest(req, res);
            });

            this.httpServer.listen(port, () => {
                console.log(`🌐 HTTP server listening on port ${port}`);
                resolve();
            });

            this.httpServer.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Start WebSocket server
     */
    private async startWebSocketServer(): Promise<void> {
        if (!this.httpServer) {
            throw new Error('HTTP server must be started first');
        }

        this.wsServer = new WebSocketServer({ server: this.httpServer });
        
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
    private handleHttpRequest(req: any, res: any): void {
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        if (url.pathname === '/') {
            // Root path - serve comprehensive server status page (like v0.1.0.2 view/html/index.html)
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(this.getServerStatusHTML());
        } else if (url.pathname === '/health') {
            // Health endpoint - JSON status
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({
                status: 'running',
                uuid: this.serverModel.uuid,
                isPrimaryServer: this.serverModel.isPrimaryServer,
                state: this.serverModel.state,
                capabilities: this.serverModel.capabilities,
                domain: this.serverModel.domain,
                version: '0.2.0.0',
                message: 'ONCE v0.2.0.0 Server - Enhanced Hierarchy'
            }));
        } else if (url.pathname === '/once' || url.pathname === '/once/') {
            // Simple browser client endpoint - just ONCE import and heading
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(this.getSimpleONCEClientHTML());
        } else if (url.pathname === '/demo' || url.pathname === '/demo/') {
            // Demo hub - landing page with all server links
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(this.getDemoHubHTML());
        } else if (url.pathname === '/servers' && this.serverModel.isPrimaryServer) {
            // Only primary server can list all servers
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({
                servers: Array.from(this.serverRegistry.values()).map(entry => entry.model)
            }));
        } else if (url.pathname === '/start-server' && req.method === 'POST' && this.serverModel.isPrimaryServer) {
            // Start a new client server dynamically
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            
            // Spawn new server process
            const componentDir = process.cwd();
            
            exec(`cd ${componentDir} && ./once startServer &`, (error) => {
                if (error) {
                    console.error('Failed to start server:', error);
                }
            });
            
            res.end(JSON.stringify({ success: true, message: 'Server starting...' }));
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
                        
                        // Remove from registry
                        this.serverRegistry.delete(uuid);
                        
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
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    }

    /**
     * Serve static files from component directory
     */
    private serveStaticFile(pathname: string, res: any): void {
        try {
            const dirname = path.dirname(fileURLToPath(import.meta.url));
            const componentRoot = path.join(dirname, '../../..');
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
        const dirname = path.dirname(fileURLToPath(import.meta.url));
        const fullPath = path.join(dirname, '../../../src/view/html', templatePath);
        const template = fs.readFileSync(fullPath, 'utf-8');
        // Escape backticks in template to prevent breaking the Function constructor
        const escapedTemplate = template.replace(/`/g, '\\`');
        return new Function('return `' + escapedTemplate + '`;').call(this);
    }

    /**
     * Get comprehensive server status HTML (for root path /)
     */
    private getServerStatusHTML(): string {
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

    private get version(): string {
        // Path authority: derive version from component directory path
        const dirname = path.dirname(fileURLToPath(import.meta.url));
        const match = dirname.match(/ONCE\/(\d+\.\d+\.\d+\.\d+)/);
        return match ? match[1] : '0.3.20.3';
    }

    /**
     * Get simple ONCE client HTML (for /once endpoint)
     */
    private getSimpleONCEClientHTML(): string {
        // Client HTML contains JavaScript - serve as static file, don't render with this context
        const dirname = path.dirname(fileURLToPath(import.meta.url));
        const fullPath = path.join(dirname, '../../../src/view/html/once-client.html');
        return fs.readFileSync(fullPath, 'utf-8');
    }

    /**
     * Get demo hub HTML (for /demo endpoint)
     */
    private getDemoHubHTML(): string {
        const dirname = path.dirname(fileURLToPath(import.meta.url));
        const fullPath = path.join(dirname, '../../../src/view/html/demo-hub.html');
        return fs.readFileSync(fullPath, 'utf-8');
    }

    /**
     * Handle WebSocket connections
     */
    private handleWebSocketConnection(ws: WebSocket, request: any): void {
        console.log('📡 WebSocket connection established');

    ws.on('message', async (data: any) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleWebSocketMessage(ws, message);
      } catch (error) {
        console.error('❌ WebSocket message error:', error);
      }
    });

        ws.on('close', () => {
            console.log('📡 WebSocket connection closed');
        });
    }

    /**
     * Handle WebSocket messages (server registration, discovery, etc.)
     */
    private async handleWebSocketMessage(ws: WebSocket, message: any): Promise<void> {
        switch (message.type) {
            case 'server-registration':
                if (this.serverModel.isPrimaryServer) {
                    await this.handleServerRegistration(ws, message.serverModel);
                }
                break;
            case 'server-discovery':
                if (this.serverModel.isPrimaryServer) {
                    await this.handleServerDiscovery(ws, message.query);
                }
                break;
            case 'scenario-message':
                // @pdca 2025-11-11-UTC-2322.pdca.md - Handle incoming scenario messages
                if (message.scenario.state.type === 'broadcast') {
                    if (this.serverModel.isPrimaryServer) {
                        // Primary received broadcast (from browser or client) - broadcast to all registered clients
                        console.log(`📡 Primary broadcasting scenario ${message.scenario.uuid}`);
                        this.broadcastScenario(message.scenario);
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
                    const port = firstClient.model.capabilities.find(c => c.capability === 'httpPort')?.port;
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
            default:
                console.log('🔄 Unknown WebSocket message type:', message.type);
        }
    }

    /**
     * Handle incoming scenario message
     * @pdca 2025-11-11-UTC-2322.pdca.md - Process and track received scenarios
     */
    private async handleScenarioMessage(scenario: ONCEScenarioMessage): Promise<void> {
        console.log(`📥 Received scenario ${scenario.uuid} from ${scenario.state.from.uuid}`);
        console.log(`   Type: ${scenario.state.type}`);
        console.log(`   Content: ${scenario.state.content}`);
        console.log(`   Sequence: ${scenario.state.sequence}`);
        
        // Do NOT ACK an ACK (prevents infinite loop)
        if (scenario.state.content.startsWith('ACK:')) {
            return;
        }
        
        // Send acknowledgment as proper Scenario
        const ackScenario: ONCEScenarioMessage = {
            uuid: uuidv4(),
            objectType: 'ONCEMessage',
            version: '0.3.20.3',
            state: {
                type: scenario.state.type,
                from: { uuid: this.serverModel.uuid, port: this.getHttpPort() },
                to: scenario.state.from,
                content: `ACK: ${scenario.uuid}`,
                timestamp: new Date().toISOString(),
                sequence: 0
            },
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                creator: 'ONCE-auto-ack',
                description: `Acknowledgment for ${scenario.uuid}`
            }
        };

        // Send ack back to sender
        if (scenario.state.from.port) {
            try {
                const ackConnection = new WebSocket(`ws://localhost:${scenario.state.from.port}`);
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
     */
    private async handleServerRegistration(ws: WebSocket, clientServerModel: ONCEServerModel): Promise<void> {
        console.log(`📋 Registering client server: ${clientServerModel.uuid}`);
        
        this.serverRegistry.set(clientServerModel.uuid, {
            model: clientServerModel,
            lastSeen: new Date().toISOString(),
            websocket: ws
        });

        // Send registration confirmation
        ws.send(JSON.stringify({
            type: 'registration-confirmed',
            primaryServerModel: this.serverModel
        }));
    }

    /**
     * Handle server discovery requests (primary server only)
     */
    private async handleServerDiscovery(ws: WebSocket, query: any): Promise<void> {
        const servers = Array.from(this.serverRegistry.values()).map(entry => entry.model);
        
        ws.send(JSON.stringify({
            type: 'discovery-response',
            servers: servers
        }));
    }

    /**
     * Register with primary server (client servers only)
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
                    
                    // Send registration message
                    this.primaryServerConnection!.send(JSON.stringify({
                        type: 'server-registration',
                        serverModel: this.serverModel
                    }));
                });

        this.primaryServerConnection.on('message', async (data: any) => {
          try {
            const message = JSON.parse(data.toString());
            if (message.type === 'registration-confirmed') {
              console.log('✅ Registration confirmed with primary server');
              this.serverModel.primaryServerIOR = this.createPrimaryServerIOR(message.primaryServerModel);
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
            version: '0.2.0.0'
        };

        return iorToUrl(ior);
    }

    /**
     * Load existing scenario or create new one with organized directory structure
     */
    private async loadOrCreateScenario(): Promise<void> {
        const httpCapability = this.serverModel.capabilities.find(c => c.capability === 'httpPort');
        if (!httpCapability) return;

        // Use organized folder structure: scenarios/local.once/ONCE/0.2.0.0/capability/httpPort/{port}/uuid.scenario.json
        const scenarioDir = `scenarios/local.once/ONCE/0.2.0.0/capability/httpPort/${httpCapability.port}`;
        const scenarioPath = `${scenarioDir}/${this.serverModel.uuid}.scenario.json`;
        
        try {
            // Try to load existing scenario first
            const fs = await import('fs');
            const path = await import('path');
            
            if (fs.existsSync(scenarioPath)) {
                console.log(`📂 Loading existing scenario: ${scenarioPath}`);
                const scenarioData = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
                
                // Restore configuration from scenario
                if (scenarioData.state) {
                    console.log(`✅ Scenario restored from ${scenarioPath}`);
                    return;
                }
            }
        } catch (error) {
            console.log(`⚠️ Could not load existing scenario: ${error instanceof Error ? error.message : String(error)}`);
        }

        // Create new scenario if none exists or loading failed
        await this.saveScenario(scenarioDir, scenarioPath);
    }

    /**
     * Save server scenario to organized directory structure
     */
    private async saveScenario(scenarioDir: string, scenarioPath: string): Promise<void> {
        try {
            const fs = await import('fs');
            const path = await import('path');
            
            // Ensure directory exists
            fs.mkdirSync(scenarioDir, { recursive: true });
            
            const httpCapability = this.serverModel.capabilities.find(c => c.capability === 'httpPort');
            
            const scenario = {
                uuid: this.serverModel.uuid,
                objectType: 'ONCE',
                version: '0.2.0.0',
                state: {
                    ...this.serverModel,
                    created: new Date().toISOString()
                },
                metadata: {
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    creator: 'ONCE-v0.2.0.0',
                    description: `ONCE server scenario - ${this.serverModel.isPrimaryServer ? 'Primary' : 'Client'} server`,
                    domain: this.serverModel.domain,
                    host: this.serverModel.host,
                    port: httpCapability?.port,
                    isPrimaryServer: this.serverModel.isPrimaryServer,
                    capabilities: this.serverModel.capabilities
                }
            };

            fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));
            console.log(`💾 Scenario saved to: ${scenarioPath}`);
        } catch (error) {
            console.error(`❌ Failed to save scenario: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Detect current environment
     */
    private detectEnvironment(): any {
        return {
            platform: 'node',
            version: process.version,
            capabilities: ['server', 'websocket', 'p2p'],
            isOnline: true,
            hostname: this.detectHostname(),
            ip: ONCE_DEFAULT_CONFIG.DEFAULT_IP
        };
    }

    /**
     * Detect hostname
     */
    private detectHostname(): string {
        try {
            const os = require('os');
            return os.hostname();
        } catch {
            return 'localhost';
        }
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
     */
    getRegisteredServers(): ONCEServerModel[] {
        if (!this.serverModel.isPrimaryServer) {
            return [];
        }
        return Array.from(this.serverRegistry.values()).map(entry => entry.model);
    }

    /**
     * Broadcast scenario message to all registered clients
     * @pdca 2025-11-11-UTC-2322.pdca.md - Automated multi-server demo
     */
    broadcastScenario(scenario: ONCEScenarioMessage): void {
        if (!this.serverModel.isPrimaryServer) {
            console.log('⚠️  Only primary server can broadcast');
            return;
        }

        console.log(`📡 Broadcasting scenario ${scenario.uuid} to ${this.serverRegistry.size} clients`);
        
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
     * @pdca 2025-11-11-UTC-2322.pdca.md - Client server forwards primary broadcasts to browsers
     */
    private broadcastToBrowserClients(scenario: ONCEScenarioMessage): void {
        console.log(`📡 Broadcasting scenario ${scenario.uuid} to browser clients`);
        
        if (!this.wsServer) {
            console.log('⚠️  No WebSocket server available');
            return;
        }
        
        this.wsServer.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'scenario-message',
                    scenario: scenario
                }));
            }
        });
    }

    /**
     * Relay scenario message from one client through primary to another client
     * @pdca 2025-11-11-UTC-2322.pdca.md - Hub-and-spoke pattern
     */
    relayScenario(scenario: ONCEScenarioMessage, targetUUID: string): void {
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
     * @pdca 2025-11-11-UTC-2322.pdca.md - Direct peer-to-peer
     */
    sendScenarioToPeer(scenario: ONCEScenarioMessage, peerPort: number): void {
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
     * Perform housekeeping at primary server startup
     * - Load existing scenarios from filesystem
     * - Delete scenarios with state=shutdown
     * - Discover and re-register running client servers
     */
    private async performHousekeeping(): Promise<void> {
        console.log('🧹 Performing primary server housekeeping...');
        
        try {
            const scenarioBaseDir = 'scenarios/local.once/ONCE/0.2.0.0';
            
            if (!fs.existsSync(scenarioBaseDir)) {
                console.log('📂 No existing scenarios found');
                return;
            }
            
            // Find all scenario files
            const findScenarios = (dir: string): string[] => {
                const results: string[] = [];
                const items = fs.readdirSync(dir);
                
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        results.push(...findScenarios(fullPath));
                    } else if (item.endsWith('.scenario.json')) {
                        results.push(fullPath);
                    }
                }
                
                return results;
            };
            
            const scenarioFiles = findScenarios(scenarioBaseDir);
            console.log(`📂 Found ${scenarioFiles.length} existing scenario(s)`);
            
            let deletedCount = 0;
            let discoveredCount = 0;
            
            for (const scenarioPath of scenarioFiles) {
                try {
                    const scenarioData = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
                    const state = scenarioData.state?.state;
                    const uuid = scenarioData.uuid;
                    const port = scenarioData.state?.capabilities?.find((c: any) => c.capability === 'httpPort')?.port;
                    
                    if (state === LifecycleState.SHUTDOWN || state === LifecycleState.STOPPED) {
                        // Delete shutdown/stopped server scenarios
                        fs.unlinkSync(scenarioPath);
                        deletedCount++;
                        console.log(`🗑️  Deleted shutdown server scenario: ${uuid} (port ${port})`);
                    } else if (state === LifecycleState.RUNNING || state === LifecycleState.CLIENT_SERVER) {
                        // Discover running client server
                        if (port && port !== 42777) {
                            // Try to connect to the server
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
                                            discoveredCount++;
                                            console.log(`🔍 Discovered running client server: ${uuid} on port ${port}`);
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
                            } catch (error) {
                                // Server not reachable, delete stale scenario
                                fs.unlinkSync(scenarioPath);
                                deletedCount++;
                                console.log(`🗑️  Deleted stale server scenario: ${uuid} (port ${port} not reachable)`);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`⚠️  Error processing scenario ${scenarioPath}:`, error);
                }
            }
            
            console.log(`✅ Housekeeping complete: ${deletedCount} deleted, ${discoveredCount} discovered`);
            
        } catch (error) {
            console.error('❌ Housekeeping error:', error);
        }
    }

    /**
     * Stop server gracefully
     */
    async stopServer(): Promise<void> {
        this.serverModel.state = LifecycleState.STOPPING;
        
        // Update scenario to reflect stopping state
        await this.updateScenarioState(LifecycleState.STOPPING);

        if (this.primaryServerConnection) {
            this.primaryServerConnection.close();
        }

        if (this.wsServer) {
            this.wsServer.close();
        }

        if (this.httpServer) {
            return new Promise((resolve) => {
                this.httpServer!.close(async () => {
                    console.log('🛑 Server stopped');
                    this.serverModel.state = LifecycleState.SHUTDOWN;
                    
                    // Update scenario to SHUTDOWN state for housekeeping
                    await this.updateScenarioState(LifecycleState.SHUTDOWN);
                    
                    resolve();
                });
            });
        }
    }
    
    /**
     * Update scenario state for graceful shutdown tracking
     */
    private async updateScenarioState(state: LifecycleState): Promise<void> {
        try {
            const httpCapability = this.serverModel.capabilities.find(c => c.capability === 'httpPort');
            if (!httpCapability) return;
            
            const scenarioDir = `scenarios/local.once/ONCE/0.2.0.0/capability/httpPort/${httpCapability.port}`;
            const scenarioPath = `${scenarioDir}/${this.serverModel.uuid}.scenario.json`;
            
            if (fs.existsSync(scenarioPath)) {
                const scenarioData = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
                scenarioData.state.state = state;
                scenarioData.metadata.modified = new Date().toISOString();
                
                fs.writeFileSync(scenarioPath, JSON.stringify(scenarioData, null, 2));
                console.log(`💾 Updated scenario state to: ${state}`);
            }
        } catch (error) {
            console.error('⚠️  Failed to update scenario state:', error);
        }
    }
}
