/**
 * Discovery Result - Housekeeping outcome data
 * @layer3
 * @pattern Interface Contract
 * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
 */

/**
 * Discovery Result - Outcome of server discovery/housekeeping
 * Used by DefaultONCE.discoverServers() method
 */
export interface DiscoveryResult {
    /** Number of stale scenarios deleted */
    deleted: number;
    
    /** Number of new servers discovered */
    discovered: number;
}




