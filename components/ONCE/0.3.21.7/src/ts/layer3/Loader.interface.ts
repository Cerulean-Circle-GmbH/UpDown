/**
 * Loader.interface.ts
 * 
 * Web4 Loader Interface
 * Base interface for IOR protocol loaders
 * 
 * Principle: Loaders are lightweight Web4 components (model + toScenario pattern)
 * Protocol Stack: ior:scenario:REST:https:// → ScenarioLoader → RESTLoader → HTTPSLoader
 */

import { LoaderModel } from './LoaderModel.interface.js';
import { Scenario } from './Scenario.interface.js';

/**
 * Loader Interface
 * 
 * Lightweight Web4 component for protocol handling
 * Follows: model + init() + toScenario() pattern
 * 
 * Protocol examples:
 * - 'scenario' - JSON ↔ Scenario<T> conversion
 * - 'REST' - HTTP verbs (GET, POST, etc.)
 * - 'https' - HTTPS transport with TLS
 * - 'wss' - WebSocket Secure
 * 
 * Loader Chain:
 * IOR → ScenarioLoader → RESTLoader → HTTPSLoader → Network
 */
export interface Loader {
    /**
     * Loader state model (Radical OOP pattern)
     */
    model: LoaderModel;
    
    /**
     * Protocol handled by this loader
     * e.g., "scenario", "REST", "https", "wss"
     */
    protocol: string;
    
    /**
     * Initialize loader with scenario (empty constructor pattern)
     * 
     * @param scenario - Optional scenario to restore state
     * @returns this (for method chaining)
     */
    init(scenario?: Scenario<LoaderModel>): this;
    
    /**
     * Load scenario via IOR
     * 
     * @param ior - IOR string (may contain multiple protocols)
     * @param options - Optional loader-specific options
     * @returns Loaded scenario or data (format depends on loader)
     */
    load(ior: string, options?: any): Promise<any>;
    
    /**
     * Save scenario via IOR
     * 
     * @param data - Data to save (scenario, JSON, etc.)
     * @param ior - IOR string (may contain multiple protocols)
     * @param options - Optional loader-specific options
     */
    save(data: any, ior: string, options?: any): Promise<void>;
    
    /**
     * Convert loader state to scenario (Radical OOP pattern)
     * 
     * @returns Scenario representation of this loader
     */
    toScenario(): Promise<Scenario<LoaderModel>>;
}


