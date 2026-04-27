/**
 * IORRoute.interface.ts
 * 
 * Web4 IOR Route Model Interface
 * Extends RouteModel for IOR-based method invocation
 * 
 * Principle 12: IOR-based Method Invocation
 */

import { RouteModel } from './RouteModel.interface.js';

/**
 * IOR Route Model
 * 
 * Extended route for IOR method invocation pattern
 * Pattern: /{component}/{version}/{uuid}/{method}
 * 
 * @property componentName - Component extracted from IOR (e.g., "ONCE")
 * @property version - Version extracted from IOR (e.g., "0.3.21.7")
 * @property instanceUuid - FULL UUIDv4 extracted from IOR
 * @property methodName - Method name extracted from IOR (e.g., "healthGet")
 */
export interface IORRoute extends RouteModel {
    componentName?: string;
    version?: string;
    instanceUuid?: string;
    methodName?: string;
}

