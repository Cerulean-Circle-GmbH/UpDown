/**
 * IORModel.interface.ts
 * 
 * IOR Model - All state for Internet Object Reference
 * Represents a Web4 object's network location(s) and identity
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - Radical OOP: All state in model
 * 
 * @layer3
 * @version 0.3.22.1
 */

import { IORProfile } from './IORProfile.interface.js';

/**
 * IOR Model - All state for Internet Object Reference
 */
export interface IORModel {
    /** Component name (e.g., "ONCE", "User") */
    component: string;
    
    /** Component version (e.g., "0.3.21.6") */
    version: string;
    
    /** Instance UUID (unique identifier for this object instance) */
    uuid: string;
    
    /** Primary protocol (e.g., "https", "wss", "ior:https:ssl:udp") */
    protocol?: string;
    
    /** Primary host (domain or IP) */
    host?: string;
    
    /** Primary port number */
    port?: number;
    
    /** URL path (e.g., "/ONCE/0.3.21.6/uuid-here") */
    path?: string;
    
    /** Failover profiles for high availability (CORBA 2.3+ pattern) */
    profiles?: IORProfile[];
    
    /** Precomputed IOR string (cached URL representation) */
    iorString?: string;
    
    /** Query parameters for method invocation */
    params?: Record<string, string>;
}

