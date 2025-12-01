/**
 * HTTPServer.ts
 * 
 * Web4 HTTP Server Component
 * Radical OOP HTTP server with router delegation
 * 
 * @layer2
 * @pattern Radical OOP - Empty constructor, model-first, scenario-based
 * @pdca session/2025-12-01-UTC-0950.iteration-05-phase5-7-httpserver-router-refactoring.pdca.md
 */

import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
import { HTTPServerModel } from '../layer3/HTTPServerModel.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { LifecycleState } from '../layer3/LifecycleState.enum.js';
import { Reference } from '../layer3/Reference.interface.js';

/**
 * HTTPServer
 * 
 * Web4 Radical OOP HTTP Server
 * 
 * Key Principles:
 * - Empty constructor (Web4 Principle 6)
 * - All state in model (Radical OOP)
 * - Router delegation (ONE LINE handleRequest)
 * - Scenario-based lifecycle
 * - Direct model updates (no helper functions)
 * 
 * Architecture:
 * HTTPServer owns HTTPRouter
 * HTTPRouter owns Route[]
 * Routes handle specific patterns
 */
export class HTTPServer {
    public model: HTTPServerModel;
    public server: Reference<Server>; // ✅ Web4 Pattern: Reference<T> for nullable references
    public router: any; // HTTPRouter (to be injected)
    
    constructor() {
        // Empty constructor - Web4 Principle 6
        const now = new Date().toISOString();
        this.server = null; // ✅ Web4 Pattern: Initialize Reference<T> to null
        this.model = {
            uuid: '', // Set by init()
            name: 'HTTPServer',
            port: 0, // Set by init()
            host: 'localhost',
            state: LifecycleState.CREATED,
            routerUuid: '',
            statistics: {
                totalOperations: 0,
                successCount: 0,
                errorCount: 0,
                lastOperationAt: '',
                lastErrorAt: '',
                createdAt: now,
                updatedAt: now
            }
        };
    }
    
    /**
     * Initialize server with scenario
     * Web4 Pattern: Empty constructor + init()
     * 
     * @param scenario - Optional scenario to restore state
     * @param router - HTTPRouter instance to delegate requests to
     * @returns this (method chaining)
     */
    public init(scenario: Scenario<HTTPServerModel> | undefined, router: any): this {
        if (scenario?.model) {
            Object.assign(this.model, scenario.model);
        }
        this.router = router;
        return this;
    }
    
    /**
     * Start HTTP server
     * 
     * @param port - Port to listen on
     * @param host - Host to bind to (default: 'localhost')
     * @returns this (method chaining)
     */
    public async start(port: number, host: string = 'localhost'): Promise<this> {
        this.model.state = LifecycleState.STARTING;
        this.model.port = port;
        this.model.host = host;
        
        return new Promise((resolve, reject) => {
            this.server = createServer((req, res) => {
                this.handleRequest(req, res);
            });
            
            this.server.listen(port, host, () => {
                this.model.state = LifecycleState.RUNNING;
                console.log(`✅ HTTPServer listening on ${host}:${port}`);
                resolve(this);
            });
            
            this.server.on('error', (error) => {
                const now = new Date().toISOString();
                this.model.state = LifecycleState.ERROR;
                this.model.statistics.errorCount++;
                this.model.statistics.lastErrorAt = now;
                this.model.statistics.updatedAt = now;
                reject(error);
            });
        });
    }
    
    /**
     * Stop HTTP server
     * 
     * @returns this (method chaining)
     */
    public async stop(): Promise<this> {
        if (!this.server) {
            return this;
        }
        
        return new Promise((resolve) => {
            this.server!.close(() => {
                this.model.state = LifecycleState.STOPPED;
                console.log(`🛑 HTTPServer stopped on port ${this.model.port}`);
                resolve(this);
            });
        });
    }
    
    /**
     * Handle HTTP request
     * 
     * ✅ ONE LINE DELEGATION (Radical OOP)
     * No if/else, no switch, no functional logic
     * Router handles ALL routing concerns
     * ✅ Direct model.statistics updates (no helpers)
     */
    private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            await this.router.route(req, res); // ← ONE LINE!
            this.model.statistics.successCount++;
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            console.error('[HTTPServer] Request handling failed:', error);
            
            // Fallback error response
            if (!res.headersSent) {
                res.writeHead(500, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ 
                    error: 'Internal Server Error',
                    message: error.message 
                }));
            }
        }
    }
    
    /**
     * Convert to scenario
     * Web4 Pattern: All components can hibernate to scenarios
     * 
     * @returns Scenario representation
     */
    public async toScenario(): Promise<Scenario<HTTPServerModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: 'HTTPServer',
                version: '0.3.21.7'
            },
            owner: '',
            model: { ...this.model }
        };
    }
}

