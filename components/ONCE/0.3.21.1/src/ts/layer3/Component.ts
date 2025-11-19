/**
 * Component v0.2.0.0 - Basic component interface
 * Minimal interface for Web4 component pattern
 */

import { LegacyONCEScenario } from './LegacyONCEScenario.interface.js';
import { Scenario } from './Scenario.interface.js';
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
     * @returns Web4 Standard format scenario
     * 
     * ⚠️ **ARCHITECTURAL DEBT**: Async in Layer 2 (Implementation)
     * ⚠️ Web4 principle: "Only Layer 4 should be async"
     * @see ../session/2025-11-19-UTC-1545.refactor-async-to-layer4.pdca.md
     * @pdca ../session/2025-11-19-UTC-1600.pragmatic-async-interface-fix.pdca.md
     */
    toScenario(): Promise<Scenario<LegacyONCEScenario>>;

    /**
     * Get component's Internet Object Reference
     */
    getIOR(): IOR;

    /**
     * Check if component is initialized
     */
    isInitialized(): boolean;
}

