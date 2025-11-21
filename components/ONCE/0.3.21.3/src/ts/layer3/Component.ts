/**
 * Component v0.2.0.0 - Basic component interface
 * Minimal interface for Web4 component pattern
 * 
 * ⚠️ **DEPRECATED**: This file is outdated and duplicates Component.interface.ts
 * 
 * **Migration Path**:
 * - Use `Component.interface.ts` instead (proper `.interface.ts` naming)
 * - New interface includes `ior: IOR` property (not `getIOR()` method)
 * - New interface includes `model: TModel` property
 * - New interface includes method discovery (`hasMethod`, `getMethodSignature`, `listMethods`)
 * 
 * **Why Deprecated**:
 * 1. Wrong file naming (should be `.interface.ts`)
 * 2. Missing modern Web4 patterns (model property, IOR property)
 * 3. Violates "one type per file" (this is a duplicate)
 * 
 * **To be removed**: After confirming no imports reference this file
 * 
 * @deprecated Use Component.interface.ts instead
 * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md
 * @see Component.interface.ts - Use this file instead
 */

import { LegacyONCEScenario } from './LegacyONCEScenario.interface.js';
import { Scenario } from './Scenario.interface.js';
import { IOR } from './IOR.js';

/**
 * Basic Web4 component interface
 * @deprecated Use Component from Component.interface.ts instead
 */
export interface Component {
    /**
     * Component UUID
     * @deprecated Use ior.uuid from Component.interface.ts instead
     */
    uuid: string;

    /**
     * Component type/name
     * @deprecated Use ior.component from Component.interface.ts instead
     */
    type: string;

    /**
     * Component version
     * @deprecated Use ior.version from Component.interface.ts instead
     */
    version: string;

    /**
     * Initialize component from scenario
     * @deprecated Use init() from Component.interface.ts (returns this, not Promise<Component>)
     */
    init(scenario?: LegacyONCEScenario): Promise<Component>;

    /**
     * Convert component to scenario for hibernation
     * @returns Web4 Standard format scenario
     * @deprecated Use toScenario() from Component.interface.ts (accepts name parameter)
     * 
     * ⚠️ **ARCHITECTURAL DEBT**: Async in Layer 2 (Implementation)
     * ⚠️ Web4 principle: "Only Layer 4 should be async"
     * @see ../session/2025-11-19-UTC-1545.refactor-async-to-layer4.pdca.md
     * @pdca ../session/2025-11-19-UTC-1600.pragmatic-async-interface-fix.pdca.md
     */
    toScenario(): Promise<Scenario<LegacyONCEScenario>>;

    /**
     * Get component's Internet Object Reference
     * @deprecated Use ior property directly from Component.interface.ts instead
     */
    getIOR(): IOR;

    /**
     * Check if component is initialized
     * @deprecated Implement as method in concrete class if needed
     */
    isInitialized(): boolean;
}

