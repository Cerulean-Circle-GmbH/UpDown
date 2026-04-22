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
 * @property bindInterface - Interface to bind to (e.g., '0.0.0.0', '127.0.0.1')
 * @property urlHost - Host for URLs/IORs (FQDN like 'mcdonges-3.fritz.box')
 * @property state - Server lifecycle state (use LifecycleState enum)
 * @property routerUuid - UUID of associated HTTPRouter
 * @property defaultHeaders - Default headers applied to all responses
 * @property statistics - DRY statistics for request handling
 * 
 * Web4 Principle 19: Separate "bind interface" from "URL host"
 * - bindInterface: Where server.listen() binds (0.0.0.0, IP address)
 * - urlHost: What appears in URLs/IORs (FQDN, hostname)
 */
export interface HTTPServerModel extends Model {
    port: number;
    bindInterface: string;
    urlHost: string;
    state: LifecycleState;
    routerUuid: string;
    defaultHeaders: Record<string, string>;
    statistics: StatisticsModel;
}

