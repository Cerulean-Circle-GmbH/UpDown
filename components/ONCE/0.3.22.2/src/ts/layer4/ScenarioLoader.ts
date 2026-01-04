/**
 * ScenarioLoader.ts
 * 
 * Web4 Scenario Loader - JSON ↔ Scenario<T> conversion
 * Top of the loader chain, converts raw JSON to Web4 Scenarios
 * 
 * Protocol: 'scenario'
 * Purpose: Parse/serialize Scenario objects
 * Chain: IOR → ScenarioLoader → RESTLoader → HTTPSLoader → Network
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
 * ScenarioLoader
 * 
 * Transforms raw JSON (from transport) into typed Scenario<T> objects.
 * When loading: JSON string → Scenario object
 * When saving: Scenario object → JSON string
 */
export class ScenarioLoader implements Loader {
    public protocol = 'scenario';
    public model: LoaderModel;
    
    /**
     * Empty constructor (P6 compliance)
     */
    constructor() {
        const now = new Date().toISOString();
        this.model = {
            uuid: '',
            name: 'ScenarioLoader',
            protocol: 'scenario',
            iorComponent: 'ScenarioLoader',
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
     * Load: Convert JSON string to Scenario object
     * 
     * @param data Input data - can be string (JSON) or already parsed object
     * @param options Optional loader options
     * @returns Parsed Scenario<T> object
     */
    public async load(data: string | object, options?: any): Promise<any> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            let scenario: any;
            
            if (typeof data === 'string') {
                // Parse JSON string
                scenario = JSON.parse(data);
            } else if (typeof data === 'object') {
                // Already an object - use directly
                scenario = data;
            } else {
                throw new Error(`ScenarioLoader: Invalid input type: ${typeof data}`);
            }
            
            // Validate basic Scenario structure
            if (!scenario.ior && !scenario.model) {
                console.warn('[ScenarioLoader] Warning: Scenario missing ior and model fields');
            }
            
            this.model.statistics.successCount++;
            console.log(`📋 ScenarioLoader: Loaded scenario ${scenario.ior?.uuid || 'unknown'}`);
            
            return scenario;
            
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            console.error(`❌ ScenarioLoader: Failed to parse scenario: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Save: Convert Scenario object to JSON string
     * 
     * @param data Scenario object to serialize
     * @param ior IOR string (unused for this loader)
     * @param options Optional loader options
     * @returns JSON string
     */
    public async save(data: any, ior: string, options?: any): Promise<void> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            let jsonString: string;
            
            if (typeof data === 'string') {
                // Already a string - validate it's JSON
                JSON.parse(data); // Will throw if invalid
                jsonString = data;
            } else {
                // Serialize to JSON
                jsonString = JSON.stringify(data, null, 2);
            }
            
            this.model.statistics.successCount++;
            console.log(`💾 ScenarioLoader: Serialized scenario`);
            
            // Store result for chaining (via options or cache)
            // Note: Loader.save() returns void per interface
            return;
            
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            console.error(`❌ ScenarioLoader: Failed to serialize scenario: ${error.message}`);
            throw error;
        }
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
                protocol: this.model.protocol
            },
            model: this.model,
            owner: ''
        };
    }
}

