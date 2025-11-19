/**
 * Component v0.2.0.0 - Basic component interface
 * Minimal interface for Web4 component pattern
 */

import { LegacyONCEScenario } from './LegacyONCEScenario.interface.js';
import { IOR } from './IOR.js';

/**
 * Basic Web4 component interface
 */
export interface Component {
    /**
     * Component UUID
     */
    uuid: string;

    /**
     * Component type/name
     */
    type: string;

    /**
     * Component version
     */
    version: string;

    /**
     * Initialize component from scenario
     */
    init(scenario?: LegacyONCEScenario): Promise<Component>;

    /**
     * Convert component to scenario for hibernation
     */
    toScenario(): LegacyONCEScenario;

    /**
     * Get component's Internet Object Reference
     */
    getIOR(): IOR;

    /**
     * Check if component is initialized
     */
    isInitialized(): boolean;
}

