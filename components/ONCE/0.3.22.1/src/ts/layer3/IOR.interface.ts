/**
 * IOR Interface - Internet Object Reference
 * Web4 Radical OOP: All state in model, methods operate on model
 * 
 * Enhanced from CORBA IOR with failover profiles support
 * 
 * IOR is THE unified entry point for all remote operations:
 * - new IOR().init(urlOrIorString).load()
 * - Internally chains loaders based on protocol stack
 * - Protocol chain: ior:scenario:REST:https:// → ScenarioLoader → RESTLoader → HTTPSLoader
 * 
 * @layer3
 * @version 0.3.22.1
 * @pdca session/2025-12-17-UTC-1740.fetch-centralization-dry.pdca.md
 */

import { Loader } from './Loader.interface.js';

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
 * IOR Load/Save Options
 * Options for IOR.load() and IOR.save() operations
 */
export interface IOROptions {
    /** HTTP method (GET, POST, PUT, DELETE) - default: GET for load, POST for save */
    method?: string;
    
    /** HTTP headers */
    headers?: Record<string, string>;
    
    /** Request timeout in milliseconds - default: 5000 */
    timeout?: number;
    
    /** Skip specific protocols in chain (e.g., ['scenario'] to get raw JSON) */
    skipProtocols?: string[];
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
export interface IORInterface {
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
    
    // ═══════════════════════════════════════════════════════════════════════════
    // F.1: IOR as Unified Entry Point (fetch centralization)
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Load data via IOR with automatic protocol chain resolution
     * 
     * THE entry point for all remote data loading in Web4.
     * Parses protocol chain and delegates to appropriate loaders.
     * 
     * @example
     * // Simple URL
     * const data = await new IOR().init('https://host/path').load();
     * 
     * // Full IOR with protocol chain
     * const scenario = await new IOR().init('ior:scenario:REST:https://host/Component/1.0.0/uuid').load();
     * 
     * @param options - Optional load options (headers, timeout, etc.)
     * @returns Loaded data (type depends on protocol chain - string, JSON, or Scenario<T>)
     */
    load<T = any>(options?: IOROptions): Promise<T>;
    
    /**
     * Save data via IOR with automatic protocol chain resolution
     * 
     * THE entry point for all remote data saving in Web4.
     * Parses protocol chain and delegates to appropriate loaders.
     * 
     * @example
     * // Save scenario
     * await new IOR().init('ior:scenario:REST:https://host/Component/1.0.0/uuid').save(scenario);
     * 
     * @param data - Data to save
     * @param options - Optional save options (headers, method, etc.)
     */
    save(data: any, options?: IOROptions): Promise<void>;
    
    /**
     * Register a loader for a protocol
     * 
     * @param protocol - Protocol name (e.g., 'https', 'scenario', 'REST')
     * @param loader - Loader instance
     */
    registerLoader(protocol: string, loader: Loader): void;
    
    /**
     * Get registered loader for a protocol
     * 
     * @param protocol - Protocol name
     * @returns Loader instance or undefined if not registered
     */
    getLoader(protocol: string): Loader | undefined;
}

