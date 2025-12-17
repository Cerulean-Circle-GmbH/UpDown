/**
 * IORProfile.interface.ts
 * 
 * IOR Profile - Multiple host:port pairs for failover
 * Used by loaders to support CORBA 2.3+ style failover patterns
 * 
 * @layer3
 * @pattern Interface Contract
 * Web4 P19: One File One Type
 * @pdca session/2025-12-17-UTC-1613.web4-principles-review.pdca.md Fix 1
 */

/**
 * IOR Profile
 * Represents a single endpoint for an Internet Object Reference
 */
export interface IORProfile {
    host: string;
    port: number;
}

