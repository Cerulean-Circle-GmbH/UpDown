/**
 * DefaultIOR - Internet Object Reference Implementation
 * Web4 Radical OOP: Empty constructor, all state in model
 * 
 * @layer2
 * @version 0.3.21.6
 * @pdca session/2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md
 */

import { IOR, IORModel, IORProfile } from '../layer3/IOR.interface.js';

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
}

