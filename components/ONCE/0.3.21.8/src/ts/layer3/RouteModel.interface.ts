/**
 * RouteModel.interface.ts
 * 
 * Web4 Route Model Interface
 * Defines the state model for individual HTTP routes
 * 
 * Principle: Every route is an object with state
 * Web4 Pattern: Handler is now a METHOD in the Route class (Radical OOP)
 */

import { Model } from './Model.interface.js';
import { HttpMethod } from './HttpMethod.enum.js';
import { StatisticsModel } from './StatisticsModel.interface.js';

/**
 * Route Model
 * 
 * State for a single HTTP route with pattern matching
 * 
 * ✅ Web4 Radical OOP: Handler is a METHOD, not a property!
 * 
 * @property pattern - URL pattern (e.g., "/", "/demo", "/{component}/{version}/{uuid}/{method}")
 * @property method - HTTP method (GET, POST, etc.)
 * @property priority - Route priority (lower = higher priority, default: 100)
 * @property statistics - DRY statistics for route hits/errors
 */
export interface RouteModel extends Model {
    pattern: string;
    method: HttpMethod;
    priority: number;
    statistics: StatisticsModel;
}


