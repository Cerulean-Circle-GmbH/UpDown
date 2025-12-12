/**
 * Enhanced ONCE Server Model for v0.2.0.0
 * Contains all server instance information including process, network, and capabilities
 * 
 * @layer3
 * @pattern Interface Contract
 * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md
 */

import { LifecycleState } from './LifecycleState.enum.js';
import { EnvironmentInfo } from './EnvironmentInfo.interface.js';
import { ServerCapability } from './ServerCapability.interface.js';

export interface ONCEServerModel {
    /** Process ID of the server */
    pid: number;
    
    /** Current lifecycle state */
    state: LifecycleState;
    
    /** Platform/environment information */
    platform: EnvironmentInfo;
    
    /** Reverse internet domain (default: "local.once") */
    domain: string;
    
    /** Extracted hostname (first part of FQDN, e.g., "McDonges-3") */
    hostname: string;
    
    /** Fully qualified hostname (e.g., "McDonges-3.fritz.box") */
    host: string;
    
    /** IP address (fallback: "127.0.0.1") */
    ip: string;
    
    /** Server capabilities with their assigned ports */
    capabilities: ServerCapability[];
    
    /** Server UUID for unique identification */
    uuid: string;
    
    /** Whether this server is the primary name server (port 42777) */
    isPrimaryServer: boolean;
    
    /** Primary server connection info (for client servers) */
    primaryServer?: {
        host: string;
        port: number;
    };
    
    /** If not primary, the IOR of the primary server this one registered with */
    primaryServerIOR?: string;
}

