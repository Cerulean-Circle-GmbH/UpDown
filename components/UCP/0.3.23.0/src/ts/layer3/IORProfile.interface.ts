/**
 * IORProfile.interface.ts
 * 
 * IOR Profile - Network location for object access (CORBA 2.3+ pattern)
 * Enables failover and load balancing across multiple endpoints
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * 
 * @layer3
 * @version 0.3.22.1
 */

/**
 * IOR Profile - Network location for failover support
 */
export interface IORProfile {
    /** Host address (domain or IP) */
    host: string;
    
    /** Port number */
    port: number;
    
    /** Optional protocol override for this profile */
    protocol?: string;
    
    /** Optional priority for load balancing (higher = preferred) */
    priority?: number;
}
