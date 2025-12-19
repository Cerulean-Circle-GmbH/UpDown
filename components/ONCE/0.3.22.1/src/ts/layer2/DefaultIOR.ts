/**
 * DefaultIOR - Internet Object Reference Implementation
 * Web4 Radical OOP: Empty constructor, all state in model
 * 
 * IOR is THE unified entry point for all remote operations:
 * - new DefaultIOR().init(urlOrIorString).load()
 * - Internally chains loaders based on protocol stack
 * 
 * @layer2
 * @version 0.3.22.1
 * @pdca session/2025-12-17-UTC-1740.fetch-centralization-dry.pdca.md
 */

import { IOR, IORModel, IORProfile, IOROptions } from '../layer3/IOR.interface.js';
import { Loader } from '../layer3/Loader.interface.js';
import { HTTPSLoader } from '../layer4/HTTPSLoader.js';

/**
 * DefaultIOR - Web4 Compliant IOR Implementation
 * 
 * Pattern:
 * - Empty constructor (Radical OOP)
 * - All state in this.model
 * - All methods operate on this.model
 * - No private properties (except model)
 */
export class DefaultIOR implements IOR {
    /** Object state (Radical OOP: ALL state in model) */
    model: IORModel;
    
    /** 
     * Static loader registry (shared across all IOR instances)
     * F.1.3: Internal loader registry
     */
    private static loaders: Map<string, Loader> = new Map();
    
    /** Flag to track if default loaders have been registered */
    private static loadersInitialized = false;
    
    /**
     * Empty constructor (Radical OOP pattern)
     * State initialization happens in init()
     */
    constructor() {
        // ✅ RADICAL OOP: Empty constructor
        this.model = {
            component: '',
            version: '',
            uuid: ''
        };
        
        // F.1.7: Register default loaders on first use
        if (!DefaultIOR.loadersInitialized) {
            this.initDefaultLoaders();
        }
    }
    
    /**
     * Initialize default loaders (F.1.7)
     * Called once on first IOR instantiation
     */
    private initDefaultLoaders(): void {
        DefaultIOR.loadersInitialized = true;
        
        // Register HTTPSLoader for 'https' protocol
        const httpsLoader = new HTTPSLoader();
        httpsLoader.init();
        DefaultIOR.loaders.set('https', httpsLoader);
        
        // Register for 'http' as well (same loader, different protocol name)
        DefaultIOR.loaders.set('http', httpsLoader);
        
        console.log('🔗 [IOR] Default loaders registered: https, http');
    }
    
    /**
     * Initialize IOR from model or IOR string
     * @param modelOrString IOR model or IOR string to parse
     * @returns this for chaining
     */
    async init(modelOrString: IORModel | string): Promise<this> {
        if (typeof modelOrString === 'string') {
            this.parseIorString(modelOrString);
        } else {
            this.model = { ...modelOrString };
        }
        return this;
    }
    
    /**
     * Compute full IOR string from model
     * Format: ior:protocol://host:port,failover:port/component/version/uuid
     * Caches result in model.iorString
     * 
     * @returns Complete IOR string with all profiles
     */
    computeIorString(): string {
        // ✅ Return cached if available
        if (this.model.iorString) return this.model.iorString;
        
        // ✅ Use defaults if network attributes missing
        const protocol = this.model.protocol || 'https';
        const host = this.model.host || 'localhost';
        const port = this.model.port || (protocol.includes('https') ? 443 : 80);
        const path = this.model.path || `/${this.model.component}/${this.model.version}/${this.model.uuid}`;
        
        // ✅ Build profiles string (host:port,host:port,...)
        let profilesStr = `${host}:${port}`;
        if (this.model.profiles && this.model.profiles.length > 0) {
            const failoverProfiles = this.model.profiles
                .map(p => `${p.host}:${p.port}`)
                .join(',');
            profilesStr = `${profilesStr},${failoverProfiles}`;
        }
        
        const iorString = `ior:${protocol}://${profilesStr}${path}`;
        
        // ✅ Cache in model
        this.model.iorString = iorString;
        
        return iorString;
    }
    
    /**
     * Parse IOR string and update model
     * Extracts all profiles for failover support
     * 
     * @param iorString Complete IOR string
     * @returns this for chaining
     */
    parseIorString(iorString: string): this {
        // Remove 'ior:' prefix
        const withoutPrefix = iorString.replace(/^ior:/, '');
        
        // Extract protocol (everything before ://)
        const protocolMatch = withoutPrefix.match(/^([^:]+):\/\//);
        const protocol = protocolMatch ? protocolMatch[1] : 'https';
        
        // Remove protocol://
        const withoutProtocol = withoutPrefix.replace(/^[^:]+:\/\//, '');
        
        // Split by first / to separate hosts from path
        const firstSlash = withoutProtocol.indexOf('/');
        const hostsStr = firstSlash > 0 ? withoutProtocol.substring(0, firstSlash) : withoutProtocol;
        const path = firstSlash > 0 ? withoutProtocol.substring(firstSlash) : '';
        
        // Parse multiple profiles (host1:port1,host2:port2,...)
        const hostParts = hostsStr.split(',');
        const primaryHost = hostParts[0].split(':');
        const failoverProfiles = hostParts.slice(1).map(hp => {
            const [host, portStr] = hp.split(':');
            return { host, port: parseInt(portStr) || 443 };
        });
        
        // Parse path (component/version/uuid/method)
        const pathParts = path.split('/').filter(p => p);
        
        // ✅ Update model
        this.model.protocol = protocol;
        this.model.host = primaryHost[0];
        this.model.port = parseInt(primaryHost[1]) || 443;
        this.model.path = path;
        this.model.component = pathParts[0] || '';
        this.model.version = pathParts[1] || '';
        this.model.uuid = pathParts[2] || '';
        this.model.profiles = failoverProfiles.length > 0 ? failoverProfiles : undefined;
        this.model.iorString = iorString;
        
        return this;
    }
    
    /**
     * Enrich IOR with network location from current context
     * Updates host, port, protocol in model
     * 
     * @param location Network location (host, port, protocol)
     * @returns this for chaining
     */
    enrichWithLocation(location: { host: string; port: number; protocol?: string }): this {
        this.model.protocol = location.protocol || this.model.protocol || 'https';
        this.model.host = location.host;
        this.model.port = location.port;
        this.model.path = `/${this.model.component}/${this.model.version}/${this.model.uuid}`;
        this.model.iorString = undefined;  // Clear cache (will be recomputed)
        
        return this;
    }
    
    /**
     * Get all profiles (primary + failover) for failover resolution
     * @returns Array of profile objects {host, port, protocol?}
     */
    getProfiles(): IORProfile[] {
        const profiles: IORProfile[] = [];
        
        // Add primary profile
        if (this.model.host && this.model.port) {
            profiles.push({ 
                host: this.model.host, 
                port: this.model.port,
                protocol: this.model.protocol 
            });
        }
        
        // Add failover profiles
        if (this.model.profiles) {
            profiles.push(...this.model.profiles);
        }
        
        return profiles;
    }
    
    /**
     * Resolve IOR with automatic failover
     * Tries each profile in sequence until one succeeds
     * 
     * @param iorString IOR string with profiles (e.g., 'ior:https://host1:42777,host2:42778/...')
     * @param timeout Timeout per profile attempt (ms) - default 5000ms
     * @returns Resolved scenario from first successful profile
     * @throws Error if all profiles fail
     * @pdca 2025-11-22-UTC-1430.iteration-01.6.4a-ior-failover.pdca.md
     */
    async resolveWithFailover(iorString: string, timeout: number = 5000): Promise<any> {
        // Parse IOR string into profiles
        this.parseIorString(iorString);
        
        const allProfiles = this.getProfiles();
        
        if (allProfiles.length === 0) {
            throw new Error('No IOR profiles found for failover resolution');
        }
        
        // Try each profile in sequence
        const errors: Error[] = [];
        for (let i = 0; i < allProfiles.length; i++) {
            const profile = allProfiles[i];
            const profileUrl = `${profile.protocol || 'https'}://${profile.host}:${profile.port}${this.model.path || ''}`;
            
            try {
                console.log(`🔄 [IOR] Trying profile ${i + 1}/${allProfiles.length}: ${profile.host}:${profile.port}`);
                
                // Use dynamic import for Node.js compatibility
                if (typeof fetch === 'undefined') {
                    // Node.js environment - use http/https modules
                    const https = await import('https');
                    const http = await import('http');
                    const module = profile.protocol === 'https' ? https : http;
                    
                    return await new Promise((resolve, reject) => {
                        const timeoutId = setTimeout(() => {
                            reject(new Error(`Timeout after ${timeout}ms`));
                        }, timeout);
                        
                        module.get(profileUrl, (res) => {
                            clearTimeout(timeoutId);
                            let data = '';
                            res.on('data', chunk => data += chunk);
                            res.on('end', () => {
                                if (res.statusCode === 200) {
                                    console.log(`✅ [IOR] Resolved via profile ${i + 1}: ${profile.host}:${profile.port}`);
                                    resolve(JSON.parse(data));
                                } else {
                                    reject(new Error(`HTTP ${res.statusCode}`));
                                }
                            });
                        }).on('error', reject);
                    });
                } else {
                    // Browser environment - use fetch with AbortController
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeout);
                    
                    const response = await fetch(profileUrl, {
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (response.ok) {
                        console.log(`✅ [IOR] Resolved via profile ${i + 1}: ${profile.host}:${profile.port}`);
                        return await response.json();
                    }
                    
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error: any) {
                console.warn(`⚠️  [IOR] Profile ${i + 1} failed: ${profile.host}:${profile.port} - ${error.message}`);
                errors.push(error);
                // Continue to next profile
            }
        }
        
        // All profiles failed
        throw new Error(
            `IOR resolution failed for all ${allProfiles.length} profile(s). ` +
            `Errors: ${errors.map(e => e.message).join('; ')}`
        );
    }
    
    /**
     * Convert IOR to standard URL format
     * @returns URL string representation
     */
    toUrl(): string {
        const protocol = this.model.protocol || 'https';
        const host = this.model.host || 'localhost';
        const port = this.model.port || (protocol.includes('https') ? 443 : 80);
        const path = this.model.path || `/${this.model.component}/${this.model.version}/${this.model.uuid}`;
        
        let url = `${protocol}://${host}:${port}${path}`;
        
        // Add query parameters
        if (this.model.params && Object.keys(this.model.params).length > 0) {
            const params = new URLSearchParams(this.model.params);
            url += `?${params.toString()}`;
        }
        
        return url;
    }
    
    /**
     * Parse standard URL and update model
     * @param url URL string
     * @returns this for chaining
     */
    fromUrl(url: string): this {
        const parsed = new URL(url);
        
        // ✅ Update model from URL
        this.model.protocol = parsed.protocol.replace(':', '');
        this.model.host = parsed.hostname;
        this.model.port = parseInt(parsed.port) || (this.model.protocol.includes('https') ? 443 : 80);
        this.model.path = parsed.pathname;
        
        // Parse path (component/version/uuid)
        const pathParts = parsed.pathname.split('/').filter(p => p);
        this.model.component = pathParts[0] || '';
        this.model.version = pathParts[1] || '';
        this.model.uuid = pathParts[2] || '';
        
        // Parse query parameters
        const params = Object.fromEntries(parsed.searchParams);
        this.model.params = Object.keys(params).length > 0 ? params : undefined;
        
        this.model.iorString = undefined;  // Clear cache
        
        return this;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // F.1: IOR as Unified Entry Point (fetch centralization)
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Register a loader for a protocol (F.1.3)
     * 
     * @param protocol - Protocol name (e.g., 'https', 'scenario', 'REST')
     * @param loader - Loader instance
     */
    registerLoader(protocol: string, loader: Loader): void {
        DefaultIOR.loaders.set(protocol, loader);
        console.log(`🔗 [IOR] Loader registered: ${protocol}`);
    }
    
    /**
     * Get registered loader for a protocol
     * 
     * @param protocol - Protocol name
     * @returns Loader instance or undefined if not registered
     */
    getLoader(protocol: string): Loader | undefined {
        return DefaultIOR.loaders.get(protocol);
    }
    
    /**
     * Parse protocol chain from IOR string (F.1.4)
     * 
     * @example
     * 'ior:scenario:REST:https://host/path' → ['scenario', 'REST', 'https']
     * 'https://host/path' → ['https']
     * 
     * @returns Array of protocol names in order (outermost to innermost)
     */
    private parseProtocolChain(): string[] {
        const iorString = this.model.iorString || this.computeIorString();
        
        // Check for protocol chain: ior:proto1:proto2:proto3://host/path
        const chainMatch = iorString.match(/^(?:ior:)?([a-zA-Z:]+):\/\//);
        if (!chainMatch) {
            // Fallback to simple protocol
            return [this.model.protocol || 'https'];
        }
        
        const chainStr = chainMatch[1];
        const protocols = chainStr.split(':').filter(function filterEmptyStrings(p: string): boolean { 
            return p.length > 0; 
        });
        
        return protocols;
    }
    
    /**
     * Load data via IOR with automatic protocol chain resolution (F.1.5)
     * 
     * THE entry point for all remote data loading in Web4.
     * Parses protocol chain and delegates to appropriate loaders.
     * 
     * @param options - Optional load options (headers, timeout, etc.)
     * @returns Loaded data (type depends on protocol chain)
     */
    async load<T = any>(options?: IOROptions): Promise<T> {
        const protocols = this.parseProtocolChain();
        const skipProtocols = options?.skipProtocols || [];
        
        // Filter out skipped protocols
        const activeProtocols = protocols.filter(function filterSkipped(p: string): boolean {
            return !skipProtocols.includes(p);
        });
        
        if (activeProtocols.length === 0) {
            throw new Error('[IOR] No active protocols in chain after filtering');
        }
        
        // Get the transport protocol (last in chain, e.g., 'https')
        const transportProtocol = activeProtocols[activeProtocols.length - 1];
        const loader = this.getLoader(transportProtocol);
        
        if (!loader) {
            throw new Error(`[IOR] No loader registered for protocol: ${transportProtocol}`);
        }
        
        console.log(`📡 [IOR] Loading via chain: ${activeProtocols.join(' → ')}`);
        
        // Build the URL for transport layer
        const url = this.toUrl();
        
        // Load via transport loader
        const rawData = await loader.load(url, {
            method: options?.method || 'GET',
            headers: options?.headers,
            timeout: options?.timeout
        });
        
        // Process through higher-level loaders (in reverse order, excluding transport)
        let result: any = rawData;
        
        // If we have higher-level protocols, process them
        for (let i = activeProtocols.length - 2; i >= 0; i--) {
            const protocol = activeProtocols[i];
            const protocolLoader = this.getLoader(protocol);
            
            if (protocolLoader) {
                // Each loader transforms the data
                result = await protocolLoader.load(result, options);
            } else {
                // No loader for this protocol - try built-in transforms
                result = this.applyBuiltInTransform(protocol, result, 'load');
            }
        }
        
        return result as T;
    }
    
    /**
     * Save data via IOR with automatic protocol chain resolution (F.1.6)
     * 
     * THE entry point for all remote data saving in Web4.
     * 
     * @param data - Data to save
     * @param options - Optional save options (headers, method, etc.)
     */
    async save(data: any, options?: IOROptions): Promise<void> {
        const protocols = this.parseProtocolChain();
        const skipProtocols = options?.skipProtocols || [];
        
        // Filter out skipped protocols
        const activeProtocols = protocols.filter(function filterSkipped(p: string): boolean {
            return !skipProtocols.includes(p);
        });
        
        if (activeProtocols.length === 0) {
            throw new Error('[IOR] No active protocols in chain after filtering');
        }
        
        // Get the transport protocol (last in chain)
        const transportProtocol = activeProtocols[activeProtocols.length - 1];
        const loader = this.getLoader(transportProtocol);
        
        if (!loader) {
            throw new Error(`[IOR] No loader registered for protocol: ${transportProtocol}`);
        }
        
        console.log(`📤 [IOR] Saving via chain: ${activeProtocols.join(' → ')}`);
        
        // Process through higher-level loaders (in forward order, excluding transport)
        let processedData: any = data;
        
        for (let i = 0; i < activeProtocols.length - 1; i++) {
            const protocol = activeProtocols[i];
            const protocolLoader = this.getLoader(protocol);
            
            if (protocolLoader) {
                // Each loader transforms the data for saving
                processedData = await protocolLoader.save(processedData, '', options);
            } else {
                // No loader for this protocol - try built-in transforms
                processedData = this.applyBuiltInTransform(protocol, processedData, 'save');
            }
        }
        
        // Ensure data is string for transport
        const stringData = typeof processedData === 'string' 
            ? processedData 
            : JSON.stringify(processedData);
        
        // Save via transport loader
        const url = this.toUrl();
        await loader.save(stringData, url, {
            method: options?.method || 'POST',
            headers: options?.headers || { 'Content-Type': 'application/json' },
            timeout: options?.timeout
        });
    }
    
    /**
     * Apply built-in transform for common protocols
     * Used when no explicit loader is registered
     * 
     * @param protocol - Protocol name
     * @param data - Data to transform
     * @param direction - 'load' or 'save'
     * @returns Transformed data
     */
    private applyBuiltInTransform(protocol: string, data: any, direction: 'load' | 'save'): any {
        switch (protocol) {
            case 'scenario':
                // Parse/stringify JSON for scenario protocol
                if (direction === 'load') {
                    return typeof data === 'string' ? JSON.parse(data) : data;
                } else {
                    return typeof data === 'string' ? data : JSON.stringify(data);
                }
                
            case 'REST':
                // REST is just a marker for HTTP verbs, no transform needed
                return data;
                
            case 'json':
                // Explicit JSON transform
                if (direction === 'load') {
                    return typeof data === 'string' ? JSON.parse(data) : data;
                } else {
                    return typeof data === 'string' ? data : JSON.stringify(data);
                }
                
            default:
                // Unknown protocol - pass through
                console.warn(`[IOR] Unknown protocol '${protocol}' - passing data through`);
                return data;
        }
    }
}

