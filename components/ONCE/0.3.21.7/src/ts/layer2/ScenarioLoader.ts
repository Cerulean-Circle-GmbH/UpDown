/**
 * ScenarioLoader.ts
 * 
 * Web4 Scenario Loader
 * Loads/saves scenarios in JSON format
 * 
 * Protocol: 'scenario'
 * Purpose: JSON ↔ Scenario<T> conversion
 * Chain: ScenarioLoader → RESTLoader → HTTPSLoader
 */

import { Loader } from '../layer3/Loader.interface.js';
import { LoaderModel } from '../layer3/LoaderModel.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';

/**
 * ScenarioLoader
 * 
 * Top-level loader in the protocol stack
 * Handles JSON ↔ Scenario<T> conversion
 * Delegates to next loader in chain (REST)
 */
export class ScenarioLoader implements Loader {
    public protocol = 'scenario';
    public model: LoaderModel;
    
    private nextLoaderRegistry: Map<string, Loader>;
    
    constructor() {
        // Empty constructor - UUID provided by ONCE kernel
        const now = new Date().toISOString();
        this.model = {
            uuid: '',  // Set by init()
            name: 'ScenarioLoader',
            protocol: 'scenario',
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
     * Load scenario via IOR
     * 
     * Parses: ior:scenario:REST:https://...
     * Delegates to: RESTLoader
     * Returns: Scenario<T>
     */
    public async load(ior: string, options?: any): Promise<Scenario<any>> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            // Extract next protocol from IOR
            const nextProtocol = this.extractNextProtocol(ior);
            const nextLoader = this.nextLoaderRegistry.get(nextProtocol);
            
            if (!nextLoader) {
                throw new Error(`No loader registered for protocol: ${nextProtocol}`);
            }
            
            // Delegate to next loader (returns JSON string)
            const jsonString = await nextLoader.load(ior, options);
            
            // Parse JSON to Scenario<T>
            const scenario = JSON.parse(jsonString) as Scenario<any>;
            
            // Record success
            this.model.statistics.successCount++;
            
            return scenario;
        } catch (error: any) {
            // Record error
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            throw new Error(`ScenarioLoader.load() failed: ${error.message}`);
        }
    }
    
    /**
     * Save scenario via IOR
     * 
     * Converts: Scenario<T> → JSON string
     * Delegates to: RESTLoader
     */
    public async save(scenario: Scenario<any>, ior: string, options?: any): Promise<void> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            // Convert scenario to JSON string
            const jsonString = JSON.stringify(scenario, null, 2);
            
            // Extract next protocol
            const nextProtocol = this.extractNextProtocol(ior);
            const nextLoader = this.nextLoaderRegistry.get(nextProtocol);
            
            if (!nextLoader) {
                throw new Error(`No loader registered for protocol: ${nextProtocol}`);
            }
            
            // Delegate to next loader
            await nextLoader.save(jsonString, ior, options);

            // Record success
            this.model.statistics.successCount++;
        } catch (error: any) {
            // Record error
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            throw new Error(`ScenarioLoader.save() failed: ${error.message}`);
        }
    }
    
    /**
     * Extract next protocol from IOR
     * 
     * @example
     * ior:scenario:REST:https://... → "REST"
     * ior:scenario:https://... → "https"
     */
    private extractNextProtocol(ior: string): string {
        // Parse: ior:scenario:REST:https://...
        const parts = ior.split(':');
        
        if (parts[0] !== 'ior') {
            throw new Error(`Invalid IOR format: ${ior}`);
        }
        
        // Find 'scenario' in parts
        const scenarioIndex = parts.indexOf('scenario');
        if (scenarioIndex === -1 || scenarioIndex >= parts.length - 1) {
            throw new Error(`No next protocol after 'scenario' in IOR: ${ior}`);
        }
        
        // Next protocol is after 'scenario'
        return parts[scenarioIndex + 1];
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
    public async toScenario(): Promise<Scenario<LoaderModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: 'ScenarioLoader',
                version: '0.3.21.7'
            },
            owner: '',
            model: this.model
        };
    }
}

