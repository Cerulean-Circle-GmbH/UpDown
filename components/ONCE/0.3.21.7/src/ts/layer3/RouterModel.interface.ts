/**
 * RouterModel.interface.ts
 * 
 * Web4 Router Model Interface
 * Defines the state model for HTTP routing
 * 
 * Principle: State in Model, Logic in Class
 */

import { Model } from './Model.interface.js';
import { RouteModel } from './RouteModel.interface.js';
import { RouteStatisticsModel } from './RouteStatisticsModel.interface.js';

/**
 * Router Model
 * 
 * State for HTTP router with dynamic route registration
 * 
 * @property routes - Registered routes (sorted by priority)
 * @property defaultRoute - Fallback route (404 handler)
 * @property statistics - Router-level statistics
 */
export interface RouterModel extends Model {
    routes: RouteModel[];
    defaultRoute?: RouteModel;
    statistics: RouteStatisticsModel;
}

