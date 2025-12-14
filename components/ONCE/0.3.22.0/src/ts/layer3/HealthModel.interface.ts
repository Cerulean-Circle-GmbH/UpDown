/**
 * Health Model - Server health status data
 * @layer3
 * @pattern Interface Contract
 * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
 */

import type { ServerCapability } from './ServerCapability.interface.js';

/**
 * Health Model - Complete server health status
 * Used by DefaultONCE.getHealth() method
 */
export interface HealthModel {
    /** Server running status */
    status: 'running' | 'stopping' | 'stopped';
    
    /** Unique server identifier */
    uuid: string;
    
    /** Is this the primary server (port 42777)? */
    isPrimaryServer: boolean;
    
    /** Current lifecycle state */
    state: string;
    
    /** Server capabilities (ports, protocols) */
    capabilities: ServerCapability[];
    
    /** Domain (e.g., 'box.fritz') */
    domain: string;
    
    /** Hostname (e.g., 'McDonges-3') */
    hostname: string;
    
    /** ONCE component version */
    version: string;
    
    /** Primary server connection info (client servers only) */
    primaryServer: PrimaryServerInfo | null;
    
    /** Human-readable status message */
    message: string;
}

/**
 * Primary Server Connection Info
 * Included in client server health responses
 */
export interface PrimaryServerInfo {
    /** Primary server host */
    host: string;
    
    /** Primary server port (typically 42777) */
    port: number;
    
    /** Is WebSocket connection active? */
    connected: boolean;
    
    /** Primary server domain */
    domain: string;
}





