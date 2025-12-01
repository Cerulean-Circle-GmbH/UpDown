/**
 * RouteModel.interface.ts
 * 
 * Web4 Route Model Interface
 * Defines the state model for individual HTTP routes
 * 
 * Principle: Every route is an object with state
 */

import { Model } from './Model.interface.js';
import { HttpMethod } from './HttpMethod.enum.js';
import { StatisticsModel } from './StatisticsModel.interface.js';
import { IncomingMessage, ServerResponse } from 'http';

/**
 * Route Handler Function Type
 * 
 * Async function that handles HTTP requests
 */
export type RouteHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

/**
 * Route Model
 * 
 * State for a single HTTP route with pattern matching
 * 
 * @property pattern - URL pattern (e.g., "/", "/demo", "/{component}/{version}/{uuid}/{method}")
 * @property method - HTTP method (GET, POST, etc.)
 * @property handler - Async function to handle requests
 * @property priority - Route priority (higher = checked first, default: 50)
 * @property statistics - DRY statistics for route hits/errors
 */
export interface RouteModel extends Model {
    pattern: string;
    method: HttpMethod;
    handler: RouteHandler;
    priority: number;
    statistics: StatisticsModel;
}


