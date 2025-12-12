/**
 * LoaderModel.interface.ts
 * 
 * Web4 Loader Model Interface
 * Defines the state model for IOR protocol loaders
 * 
 * Principle: Loaders are Web4 Components
 */

import { Model } from './Model.interface.js';
import { StatisticsModel } from './StatisticsModel.interface.js';

/**
 * Loader Model
 * 
 * State for protocol loaders (scenario, REST, HTTPS, WSS, etc.)
 * 
 * @property protocol - Protocol handled by this loader (e.g., "scenario", "REST", "https")
 * @property component - Component name (class name for JsInterface)
 * @property version - Component version (from directory, not hardcoded!)
 * @property statistics - DRY statistics for load/save operations
 */
export interface LoaderModel extends Model {
    protocol: string;
    /** Component name (class name - DRY with toScenario) */
    component: string;
    /** Version from directory - NEVER hardcode! */
    version: string;
    statistics: StatisticsModel;
}


