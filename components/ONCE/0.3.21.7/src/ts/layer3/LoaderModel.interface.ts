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
 * @property statistics - DRY statistics for load/save operations
 */
export interface LoaderModel extends Model {
    protocol: string;
    statistics: StatisticsModel;
}


