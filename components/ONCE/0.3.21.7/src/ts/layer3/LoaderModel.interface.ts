/**
 * LoaderModel.interface.ts
 * 
 * Web4 Loader Model Interface
 * Defines the state model for IOR protocol loaders
 * 
 * Principle: Loaders are Web4 Components
 */

import { Model } from './Model.interface.js';

/**
 * Loader Model
 * 
 * State for protocol loaders (scenario, REST, HTTPS, WSS, etc.)
 * 
 * @property protocol - Protocol handled by this loader (e.g., "scenario", "REST", "https")
 * @property loadCount - Number of successful loads
 * @property saveCount - Number of successful saves
 * @property errorCount - Number of failed operations
 * @property createdAt - Loader creation timestamp
 * @property updatedAt - Last operation timestamp
 */
export interface LoaderModel extends Model {
    protocol: string;
    loadCount: number;
    saveCount: number;
    errorCount: number;
    createdAt: string;
    updatedAt: string;
}

