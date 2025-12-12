/**
 * RESTLoader.ts
 * 
 * Web4 REST Loader
 * Handles REST protocol (HTTP verbs, method mapping)
 * 
 * Protocol: 'REST'
 * Purpose: HTTP verbs (GET, POST, etc.)
 * Chain: ScenarioLoader → RESTLoader → HTTPSLoader
 */

import { Loader } from '../layer3/Loader.interface.js';
import { LoaderModel } from '../layer3/LoaderModel.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';

/**
 * RESTLoader
 * 
 * Mid-level loader in the protocol stack
 * Handles HTTP verbs and REST patterns
 * Delegates to HTTPSLoader for transport
 */
export class RESTLoader implements Loader {
    public protocol = 'REST';
    public model: LoaderModel;
    
    private nextLoaderRegistry: Map<string, Loader>;
    
    constructor() {
        // Empty constructor - UUID and version provided by ONCE kernel via init()
        const now = new Date().toISOString();
        this.model = {
            uuid: '',  // Set by init()
            name: 'RESTLoader',
            protocol: 'REST',
            component: 'RESTLoader',  // DRY: Used by toScenario()
            version: '',  // Set by init() - NEVER hardcode!
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
        
        this.nextLoaderRegistry = new Map();
    }
    
    /**
     * Register next loader in chain
     */
    public registerLoader(loader: Loader): void {
        this.nextLoaderRegistry.set(loader.protocol, loader);
    }
    
    /**
     * Load via REST
     * 
     * Parses: ior:scenario:REST:https://...
     * Extracts: HTTP method (GET for load)
     * Delegates to: HTTPSLoader
     * Returns: Response body (JSON string)
     */
    public async load(ior: string, options?: any): Promise<string> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            // Extract next protocol (https, wss, etc.)
            const nextProtocol = this.extractNextProtocol(ior);
            const nextLoader = this.nextLoaderRegistry.get(nextProtocol);
            
            if (!nextLoader) {
                throw new Error(`No loader registered for protocol: ${nextProtocol}`);
            }
            
            // Prepare REST options (GET by default for load)
            const restOptions = {
                ...options,
                method: options?.method || HttpMethod.GET,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers
                }
            };
            
            // Delegate to transport loader (HTTPS, WSS, etc.)
            const responseBody = await nextLoader.load(ior, restOptions);
            
            this.model.statistics.successCount++;
            
            return responseBody;
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            throw new Error(`RESTLoader.load() failed: ${error.message}`);
        }
    }
    
    /**
     * Save via REST
     * 
     * HTTP method: POST (for save operations)
     * Delegates to: HTTPSLoader
     */
    public async save(data: string, ior: string, options?: any): Promise<void> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            // Extract next protocol
            const nextProtocol = this.extractNextProtocol(ior);
            const nextLoader = this.nextLoaderRegistry.get(nextProtocol);
            
            if (!nextLoader) {
                throw new Error(`No loader registered for protocol: ${nextProtocol}`);
            }
            
            // Prepare REST options (POST for save)
            const restOptions = {
                ...options,
                method: HttpMethod.POST,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers
                },
                body: data
            };
            
            // Delegate to transport loader
            await nextLoader.save(data, ior, restOptions);
            
            this.model.statistics.successCount++;
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            throw new Error(`RESTLoader.save() failed: ${error.message}`);
        }
    }
    
    /**
     * Extract next protocol from IOR
     * 
     * @example
     * ior:scenario:REST:https://... → "https"
     * ior:scenario:REST:wss://... → "wss"
     */
    private extractNextProtocol(ior: string): string {
        // Parse: ior:scenario:REST:https://...
        const parts = ior.split(':');
        
        // Find 'REST' in parts
        const restIndex = parts.indexOf('REST');
        if (restIndex === -1 || restIndex >= parts.length - 1) {
            throw new Error(`No next protocol after 'REST' in IOR: ${ior}`);
        }
        
        // Next protocol is after 'REST'
        // Extract protocol before '://'
        const nextPart = parts[restIndex + 1];
        return nextPart.split('//')[0];
    }
    
    /**
     * Empty constructor pattern - init with scenario
     */
    public init(scenario?: Scenario<LoaderModel>): this {
        if (scenario?.model) {
            Object.assign(this.model, scenario.model);
        }
        return this;
    }
    
    /**
     * Convert to scenario (async to match Component interface)
     */
    /**
     * Convert to scenario
     * 
     * DRY: Uses model.component and model.version instead of hardcoded strings
     */
    public async toScenario(): Promise<Scenario<LoaderModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: this.model.component,  // DRY: from model
                version: this.model.version       // DRY: from model (set by init)
            },
            owner: '',
            model: this.model
        };
    }
}

