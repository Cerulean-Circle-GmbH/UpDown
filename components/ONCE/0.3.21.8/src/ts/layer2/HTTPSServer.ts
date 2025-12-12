/**
 * HTTPSServer.ts
 * 
 * HTTPS Server with TLS support
 * 
 * Extends HTTPServer, adds TLS layer via composition.
 * 
 * Web4 Radical OOP:
 * - Extends HTTPServer (reuse, not duplicate)
 * - No arrow functions (P4) - all callbacks use bound methods
 * - Empty constructor + init() (P6)
 * 
 * @component HTTPSServer
 * @layer 2
 */

import * as https from 'https';
import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { HTTPServer } from './HTTPServer.js';
import { TLSCertificateLoader } from './TLSCertificateLoader.js';
import { HTTPSServerModel } from '../layer3/HTTPSServerModel.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { LifecycleState } from '../layer3/LifecycleState.enum.js';
import { Reference } from '../layer3/Reference.interface.js';

/**
 * HTTPSServer
 * 
 * HTTPS Server extending HTTPServer with TLS support
 * 
 * Features:
 * - TLS certificate loading
 * - HTTP→HTTPS redirect (optional)
 * - ONE LINE delegation to router (Radical OOP)
 */
/**
 * SNI Callback type for Server Name Indication
 */
type SNICallback = (
    serverName: string,
    callback: (error: Error | null, context?: any) => void
) => void;

export class HTTPSServer extends HTTPServer {
    // Override model type
    public override model!: HTTPSServerModel;
    
    // HTTPS-specific
    private httpsServer: Reference<https.Server> = null;
    private httpRedirectServer: Reference<http.Server> = null;
    private certificateLoader: TLSCertificateLoader;
    
    /** SNI callback for multi-domain certificate selection */
    private sniCallback: SNICallback | null = null;
    
    constructor() {
        super();
        this.certificateLoader = new TLSCertificateLoader();
    }
    
    /**
     * Set SNI callback for multi-domain TLS
     * 
     * Web4 P16: serverNameIndicationCallbackSet
     * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
     * 
     * @param callback - SNI callback from CertificateOrchestrator
     * @returns this (method chaining)
     */
    public serverNameIndicationCallbackSet(callback: SNICallback): this {
        this.sniCallback = callback;
        this.model.sniEnabled = true;
        return this;
    }
    
    /**
     * Initialize with HTTPSServerModel
     * Web4 P6: Empty constructor + init()
     */
    public override init(scenario: Scenario<HTTPSServerModel> | undefined, router: any): this {
        // Initialize base HTTPServer model
        super.init(scenario, router);
        
        // Initialize TLS loader with options from model
        if (scenario?.model?.tls) {
            this.certificateLoader.init({
                ior: { uuid: '', component: '', version: '' },
                owner: '',
                model: {
                    uuid: this.model.uuid + '-tls',
                    name: 'TLSLoader',
                    options: scenario.model.tls,
                    loaded: false
                }
            });
        }
        
        return this;
    }
    
    /**
     * Start HTTPS server (overrides HTTPServer.start)
     * 
     * Web4 P4: Bound method references in callbacks
     */
    public override async start(port: number, bindInterface: string = '0.0.0.0'): Promise<this> {
        this.model.state = LifecycleState.STARTING;
        this.model.port = port;
        this.model.bindInterface = bindInterface;
        
        // Load TLS certificates
        this.certificateLoader.load();
        this.model.certificateExpiry = this.certificateLoader.model.certificateExpiry;
        this.model.isSelfSigned = this.certificateLoader.model.isSelfSigned;
        
        const tlsOptions = this.certificateLoader.secureContextOptionsGet();
        
        return new Promise(this.startExecutor.bind(this, port, bindInterface, tlsOptions));
    }
    
    /**
     * Promise executor for start - bound method
     * Web4 P4: No arrow functions
     */
    private startExecutor(
        port: number,
        bindInterface: string,
        tlsOptions: any,
        resolve: (value: this) => void,
        reject: (error: Error) => void
    ): void {
        // Add SNI callback if set (multi-domain TLS)
        if (this.sniCallback) {
            tlsOptions.SNICallback = this.sniCallback;
            console.log('🔐 HTTPSServer: SNI enabled for multi-domain TLS');
        }
        
        // Create HTTPS server with bound request handler
        this.httpsServer = https.createServer(tlsOptions, this.requestHandle.bind(this));
        
        this.httpsServer.listen(port, bindInterface, this.listenCallback.bind(this, port, resolve));
        this.httpsServer.on('error', this.errorCallback.bind(this, reject));
        
        // Start HTTP redirect server if enabled
        if (this.model.httpRedirect?.enabled) {
            this.httpRedirectServerStart();
        }
    }
    
    /**
     * Listen callback - bound method
     */
    private listenCallback(port: number, resolve: (value: this) => void): void {
        this.model.state = LifecycleState.RUNNING;
        console.log(`✅ HTTPSServer listening on https://${this.model.bindInterface}:${port}`);
        
        if (this.model.isSelfSigned) {
            console.warn(`⚠️  Self-signed certificate - browser will show warning`);
        }
        
        resolve(this);
    }
    
    /**
     * Error callback - bound method
     */
    private errorCallback(reject: (error: Error) => void, error: Error): void {
        const now = new Date().toISOString();
        this.model.state = LifecycleState.ERROR;
        this.model.statistics.errorCount++;
        this.model.statistics.lastErrorAt = now;
        this.model.statistics.updatedAt = now;
        reject(error);
    }
    
    /**
     * Handle HTTPS request - bound method
     * 
     * ✅ ONE LINE DELEGATION (Radical OOP)
     * Server delegates EVERYTHING to router - including errors!
     * The ErrorRoute handles error responses, not the server.
     */
    private async requestHandle(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            await this.router.route(req, res);  // ← ONE LINE!
            this.model.statistics.successCount++;
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            
            // ✅ Delegate error handling to ErrorRoute via router
            if (this.router.errorHandle) {
                await this.router.errorHandle(req, res, error);
            } else {
                // Fallback if router doesn't have errorHandle yet
                console.error('[HTTPSServer] Request handling failed:', error);
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
    }
    
    /**
     * Start HTTP redirect server (301 → HTTPS)
     */
    private httpRedirectServerStart(): void {
        const httpPort = this.model.httpRedirect!.httpPort;
        
        this.httpRedirectServer = http.createServer(this.redirectHandle.bind(this));
        this.httpRedirectServer.listen(httpPort, this.model.bindInterface);
        
        console.log(`🔀 HTTP→HTTPS redirect server on port ${httpPort}`);
    }
    
    /**
     * Handle HTTP→HTTPS redirect
     */
    private redirectHandle(req: IncomingMessage, res: ServerResponse): void {
        const httpsUrl = `https://${this.model.urlHost}:${this.model.port}${req.url}`;
        res.writeHead(301, { 'Location': httpsUrl });
        res.end();
    }
    
    /**
     * Stop HTTPS server (overrides HTTPServer.stop)
     */
    public override async stop(): Promise<this> {
        const promises: Promise<void>[] = [];
        
        if (this.httpsServer) {
            promises.push(new Promise(this.httpsServerCloseExecutor.bind(this)));
        }
        
        if (this.httpRedirectServer) {
            promises.push(new Promise(this.httpRedirectCloseExecutor.bind(this)));
        }
        
        await Promise.all(promises);
        this.model.state = LifecycleState.STOPPED;
        console.log(`🛑 HTTPSServer stopped on port ${this.model.port}`);
        
        return this;
    }
    
    /**
     * HTTPS server close executor - bound method
     */
    private httpsServerCloseExecutor(resolve: () => void): void {
        this.httpsServer!.close(resolve);
    }
    
    /**
     * HTTP redirect server close executor - bound method
     */
    private httpRedirectCloseExecutor(resolve: () => void): void {
        this.httpRedirectServer!.close(resolve);
    }
    
    /**
     * Convert to scenario
     */
    public override async toScenario(): Promise<Scenario<HTTPSServerModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: this.model.iorComponent || 'HTTPSServer',  // DRY
                version: this.model.iorVersion || ''  // DRY: from init()
            },
            owner: '',
            model: { ...this.model }
        };
    }
}
