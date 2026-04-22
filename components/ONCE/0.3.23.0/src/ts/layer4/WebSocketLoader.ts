/**
 * WebSocketLoader.ts
 * 
 * Web4 WebSocket Loader - Real-time bidirectional communication
 * Handles WebSocket connections for IOR protocol chain
 * 
 * Protocol: 'wss' or 'ws'
 * Purpose: Real-time bidirectional communication
 * Chain: IOR → ScenarioLoader → WebSocketLoader → Network
 * 
 * Web4 Principles:
 * - P6: Empty Constructor + init()
 * - P7: Async Only in Layer 4
 * - P4a: No arrow functions
 * 
 * @layer4
 * @pdca 2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md
 */

import type { Loader } from '../layer3/Loader.interface.js';
import type { LoaderModel } from '../layer3/LoaderModel.interface.js';
import type { Scenario } from '../layer3/Scenario.interface.js';

/**
 * WebSocket connection state
 */
export enum WebSocketState {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    ERROR = 'ERROR'
}

/**
 * WebSocketLoader
 * 
 * Manages WebSocket connections for real-time IOR resolution.
 * Supports both browser WebSocket and Node.js ws module.
 */
export class WebSocketLoader implements Loader {
    public protocol = 'wss';
    public model: LoaderModel;
    
    /** Active WebSocket connections by URL */
    private connections: Map<string, WebSocket> = new Map();
    
    /** Connection state by URL */
    private states: Map<string, WebSocketState> = new Map();
    
    /** Pending message promises (for request/response pattern) */
    private pendingRequests: Map<string, { resolve: Function; reject: Function; timeout: any }> = new Map();
    
    /**
     * Empty constructor (P6 compliance)
     */
    constructor() {
        const now = new Date().toISOString();
        this.model = {
            uuid: '',
            name: 'WebSocketLoader',
            protocol: 'wss',
            iorComponent: 'WebSocketLoader',
            iorVersion: '',
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
     * Initialize loader
     * @param scenario Optional scenario to restore state
     * @returns this for chaining
     */
    public init(scenario?: Scenario<LoaderModel>): this {
        if (scenario?.model) {
            this.model = { ...this.model, ...scenario.model };
        }
        return this;
    }
    
    /**
     * Load data via WebSocket
     * 
     * Opens connection if needed, sends request, waits for response.
     * 
     * @param ior WebSocket URL (wss://host:port/path)
     * @param options Optional loader options
     * @returns Response data
     */
    public async load(ior: string, options?: any): Promise<any> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            // Ensure connection is open
            const ws = await this.ensureConnection(ior);
            
            // Generate request ID for correlation
            const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Create promise for response
            const responsePromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(
                    this.handleRequestTimeout.bind(this, requestId, reject),
                    options?.timeout || 30000
                );
                
                this.pendingRequests.set(requestId, { resolve, reject, timeout });
            });
            
            // Send request
            const request = {
                id: requestId,
                type: 'load',
                ior: ior,
                ...options?.data
            };
            
            ws.send(JSON.stringify(request));
            console.log(`📡 WebSocketLoader: Sent request ${requestId}`);
            
            // Wait for response
            const response = await responsePromise;
            
            this.model.statistics.successCount++;
            console.log(`✅ WebSocketLoader: Received response for ${requestId}`);
            
            return response;
            
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            console.error(`❌ WebSocketLoader: Load failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Save data via WebSocket
     * 
     * @param data Data to send
     * @param ior WebSocket URL
     * @param options Optional loader options
     */
    public async save(data: any, ior: string, options?: any): Promise<void> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            const ws = await this.ensureConnection(ior);
            
            const message = {
                type: 'save',
                ior: ior,
                data: data,
                ...options?.meta
            };
            
            ws.send(JSON.stringify(message));
            
            this.model.statistics.successCount++;
            console.log(`💾 WebSocketLoader: Sent data to ${ior}`);
            
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            console.error(`❌ WebSocketLoader: Save failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Ensure WebSocket connection is open
     * 
     * @param url WebSocket URL
     * @returns Connected WebSocket
     */
    private async ensureConnection(url: string): Promise<WebSocket> {
        // Check for existing connection
        const existing = this.connections.get(url);
        if (existing && existing.readyState === WebSocket.OPEN) {
            return existing;
        }
        
        // Create new connection
        return this.connect(url);
    }
    
    /**
     * Connect to WebSocket server
     * 
     * @param url WebSocket URL
     * @returns Connected WebSocket
     */
    private async connect(url: string): Promise<WebSocket> {
        this.states.set(url, WebSocketState.CONNECTING);
        
        return new Promise((resolve, reject) => {
            try {
                const ws = new WebSocket(url);
                
                ws.onopen = this.handleOpen.bind(this, url, ws, resolve);
                ws.onerror = this.handleError.bind(this, url, reject);
                ws.onclose = this.handleClose.bind(this, url);
                ws.onmessage = this.handleMessage.bind(this, url);
                
            } catch (error: any) {
                this.states.set(url, WebSocketState.ERROR);
                reject(error);
            }
        });
    }
    
    /**
     * Handle WebSocket open event
     */
    private handleOpen(url: string, ws: WebSocket, resolve: Function): void {
        this.states.set(url, WebSocketState.CONNECTED);
        this.connections.set(url, ws);
        console.log(`🔌 WebSocketLoader: Connected to ${url}`);
        resolve(ws);
    }
    
    /**
     * Handle WebSocket error event
     */
    private handleError(url: string, reject: Function, event: Event): void {
        this.states.set(url, WebSocketState.ERROR);
        console.error(`❌ WebSocketLoader: Connection error for ${url}`);
        reject(new Error(`WebSocket connection failed: ${url}`));
    }
    
    /**
     * Handle WebSocket close event
     */
    private handleClose(url: string): void {
        this.states.set(url, WebSocketState.DISCONNECTED);
        this.connections.delete(url);
        console.log(`🔌 WebSocketLoader: Disconnected from ${url}`);
    }
    
    /**
     * Handle incoming WebSocket message
     */
    private handleMessage(url: string, event: MessageEvent): void {
        try {
            const message = JSON.parse(event.data);
            
            // Check if this is a response to a pending request
            if (message.id && this.pendingRequests.has(message.id)) {
                const pending = this.pendingRequests.get(message.id)!;
                clearTimeout(pending.timeout);
                this.pendingRequests.delete(message.id);
                
                if (message.error) {
                    pending.reject(new Error(message.error));
                } else {
                    pending.resolve(message.data);
                }
            }
            
        } catch (error) {
            console.warn(`⚠️ WebSocketLoader: Failed to parse message: ${error}`);
        }
    }
    
    /**
     * Handle request timeout
     */
    private handleRequestTimeout(requestId: string, reject: Function): void {
        if (this.pendingRequests.has(requestId)) {
            this.pendingRequests.delete(requestId);
            reject(new Error(`WebSocket request timeout: ${requestId}`));
        }
    }
    
    /**
     * Close all connections
     */
    public closeAll(): void {
        for (const [url, ws] of this.connections) {
            ws.close();
            console.log(`🔌 WebSocketLoader: Closed connection to ${url}`);
        }
        this.connections.clear();
        this.states.clear();
    }
    
    /**
     * Get connection state for URL
     */
    public getState(url: string): WebSocketState {
        return this.states.get(url) || WebSocketState.DISCONNECTED;
    }
    
    /**
     * Convert loader state to scenario (Web4 pattern)
     */
    public async toScenario(): Promise<Scenario<LoaderModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: this.model.iorComponent,
                version: this.model.iorVersion,
                // CPA.5: Use iorString instead of protocol/host/port
                iorString: `ior:${this.model.protocol}://localhost/${this.model.iorComponent}/${this.model.iorVersion}/${this.model.uuid}`
            },
            model: this.model,
            owner: ''
        };
    }
}

