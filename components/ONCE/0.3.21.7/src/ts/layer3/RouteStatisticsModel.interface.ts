/**
 * RouteStatisticsModel.interface.ts
 * 
 * Web4 Route Statistics Model Interface
 * Defines the state model for routing statistics
 * 
 * Principle: Separation of Concerns - Statistics in separate model
 */

import { Model } from './Model.interface.js';

/**
 * Route Statistics Model
 * 
 * Aggregated statistics for router
 * 
 * @property totalRequests - Total HTTP requests received
 * @property totalHits - Routes that matched
 * @property totalMisses - Routes that didn't match (404s)
 * @property iorMethodCalls - IOR method invocations
 * @property staticFileServes - Static file serves
 * @property errorCount - Total errors (500s)
 * @property createdAt - Statistics start timestamp
 * @property updatedAt - Last update timestamp
 */
export interface RouteStatisticsModel extends Model {
    totalRequests: number;
    totalHits: number;
    totalMisses: number;
    iorMethodCalls: number;
    staticFileServes: number;
    errorCount: number;
    createdAt: string;
    updatedAt: string;
}

