/**
 * HTTPServerModel.interface.ts
 * 
 * Web4 HTTP Server Model Interface
 * Defines the state model for HTTP server component
 * 
 * @layer3
 * @pattern Radical OOP - All state in model
 * @pdca session/2025-12-01-UTC-0950.iteration-05-phase5-7-httpserver-router-refactoring.pdca.md
 */

import { Model } from './Model.interface.js';
import { StatisticsModel } from './StatisticsModel.interface.js';
import { LifecycleState } from './LifecycleState.enum.js';

/**
 * HTTP Server Model
 * 
 * State for HTTP server with routing
 * Web4 Pattern: Server is a component with state
 * 
 * @property port - Port number server is listening on
 * @property host - Hostname/IP address
 * @property state - Server lifecycle state (use LifecycleState enum)
 * @property routerUuid - UUID of associated HTTPRouter
 * @property statistics - DRY statistics for request handling
 */
export interface HTTPServerModel extends Model {
    port: number;
    host: string;
    state: LifecycleState;
    routerUuid: string;
    statistics: StatisticsModel;
}

