/**
 * IOR Interface - Internet Object Reference
 * Web4 Radical OOP: All state in model, methods operate on model
 * 
 * Enhanced from CORBA IOR with failover profiles support
 * 
 * @layer3
 * @version 0.3.21.6
 * @pdca session/2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md
 */

/**
 * IOR Profile - Network location for object access (CORBA 2.3+ pattern)
 * Enables failover and load balancing across multiple endpoints
 */
export interface IORProfile {
    /** Host address (domain or IP) */
    host: string;
    
    /** Port number */
    port: number;
    
    /** Optional protocol override for this profile */
    protocol?: string;
}

/**
 * IOR Model - All state for Internet Object Reference
 * Represents a Web4 object's network location(s) and identity
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

/**
 * IOR Interface - Internet Object Reference Component
 * 
 * Web4 Radical OOP Pattern:
 * - Empty constructor
 * - All state in model (IORModel)
 * - All methods operate on model
 * - Stateless operations
 */
export interface IOR {
    /** Object state (Radical OOP: ALL state in model) */
    model: IORModel;
    
    /**
     * Initialize IOR from model or IOR string
     * @param modelOrString IOR model or IOR string to parse
     * @returns this for chaining
     */
    init(modelOrString: IORModel | string): Promise<this>;
    
    /**
     * Compute full IOR string from model
     * Format: ior:protocol://host:port,failover:port/component/version/uuid
     * Caches result in model.iorString
     * 
     * @returns Complete IOR string with all profiles
     */
    computeIorString(): string;
    
    /**
     * Parse IOR string and update model
     * Extracts all profiles for failover support
     * 
     * @param iorString Complete IOR string
     * @returns this for chaining
     */
    parseIorString(iorString: string): this;
    
    /**
     * Enrich IOR with network location from current context
     * Updates host, port, protocol in model
     * 
     * @param location Network location (host, port, protocol)
     * @returns this for chaining
     */
    enrichWithLocation(location: { host: string; port: number; protocol?: string }): this;
    
    /**
     * Get all profiles (primary + failover) for failover resolution
     * @returns Array of profile objects {host, port, protocol?}
     */
    getProfiles(): IORProfile[];
    
    /**
     * Convert IOR to standard URL format
     * @returns URL string representation
     */
    toUrl(): string;
    
    /**
     * Parse standard URL and update model
     * @param url URL string
     * @returns this for chaining
     */
    fromUrl(url: string): this;
}




