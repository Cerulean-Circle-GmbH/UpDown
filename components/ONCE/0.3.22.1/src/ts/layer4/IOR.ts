/**
 * IOR<T> - Internet Object Reference Implementation
 * 
 * IOR = Reference (consolidated - they are the SAME concept)
 * - Both can be local OR remote
 * - Artificial separation was confusing → now consolidated
 * 
 * Web4 Principles:
 * - P6: Empty Constructor + init()
 * - P7: Async Only in Layer 4 (this is layer4!)
 * - P34: IOR as Unified Entry Point
 * 
 * Usage:
 * ```typescript
 * // Local reference
 * const userRef = new IOR<User>().initLocal(user);
 * const user = userRef.value;
 * 
 * // Remote reference
 * const userRef = await new IOR<User>().init('ior:https://host/User/1.0.0/uuid');
 * const user = await userRef.resolve();
 * 
 * // Resolution states
 * if (userRef.isResolving) { showSpinner(); }
 * if (userRef.isResolved) { useValue(); }
 * ```
 * 
 * @layer4
 * @pdca 2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md
 */

import { ReferenceState } from '../layer3/ReferenceState.enum.js';
import type { Loader } from '../layer3/Loader.interface.js';
import type { IORInterface, IORModel, IORProfile, IOROptions } from '../layer3/IOR.interface.js';
import { HTTPSLoader } from './HTTPSLoader.js';
import { ScenarioLoader } from './ScenarioLoader.js';
import { WebSocketLoader } from './WebSocketLoader.js';
import { FileLoader } from './FileLoader.js';

/**
 * IOR<T> - Unified Reference/IOR Implementation
 * 
 * Implements Reference<T> interface.
 * All async resolution happens here (layer4).
 */
export class IOR<T = any> implements IORInterface {
    
    // ═══════════════════════════════════════════════════════════════
    // State (Radical OOP: all state in model)
    // ═══════════════════════════════════════════════════════════════
    
    /** IOR model (network location, identity) */
    model: IORModel;
    
    /** Resolved value (cached after resolution) */
    private resolvedValue: T | null = null;
    
    /** Current reference state */
    private referenceState: ReferenceState = ReferenceState.NULL;
    
    /** Promise for in-flight resolution (prevents duplicate fetches) */
    private resolutionPromise: Promise<T | null> | null = null;
    
    // ═══════════════════════════════════════════════════════════════
    // Static Loader Registry
    // ═══════════════════════════════════════════════════════════════
    
    /** Static loader registry (shared across all IOR instances) */
    private static loaders: Map<string, Loader> = new Map();
    
    /** Flag to track if default loaders have been registered */
    private static loadersInitialized = false;
    
    // ═══════════════════════════════════════════════════════════════
    // Constructor (P6: Empty)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Empty constructor (Radical OOP pattern)
     * State initialization happens in init() methods
     */
    constructor() {
        this.model = {
            component: '',
            version: '',
            uuid: ''
        };
        
        // Register default loaders on first use
        if (!IOR.loadersInitialized) {
            this.initDefaultLoaders();
        }
    }
    
    /**
     * Initialize default loaders
     * Called once on first IOR instantiation
     */
    private initDefaultLoaders(): void {
        IOR.loadersInitialized = true;
        
        // Register HTTPSLoader for 'https' and 'http' protocols
        const httpsLoader = new HTTPSLoader();
        httpsLoader.init();
        IOR.loaders.set('https', httpsLoader);
        IOR.loaders.set('http', httpsLoader);
        
        // Register ScenarioLoader for 'scenario' protocol
        const scenarioLoader = new ScenarioLoader();
        scenarioLoader.init();
        IOR.loaders.set('scenario', scenarioLoader);
        
        // Register WebSocketLoader for 'wss' and 'ws' protocols
        const wsLoader = new WebSocketLoader();
        wsLoader.init();
        IOR.loaders.set('wss', wsLoader);
        IOR.loaders.set('ws', wsLoader);
        
        // Register FileLoader for 'file' protocol (Node.js only)
        const fileLoader = new FileLoader();
        fileLoader.init();
        IOR.loaders.set('file', fileLoader);
        
        console.log('🔗 [IOR] Default loaders registered: https, http, scenario, wss, ws, file');
    }
    
    // ═══════════════════════════════════════════════════════════════
    // Reference Interface: State Accessors
    // ═══════════════════════════════════════════════════════════════
    
    get isLocal(): boolean {
        return this.referenceState === ReferenceState.LOCAL;
    }
    
    get isRemote(): boolean {
        return this.referenceState === ReferenceState.REMOTE;
    }
    
    get isNull(): boolean {
        return this.referenceState === ReferenceState.NULL;
    }
    
    get isResolving(): boolean {
        return this.referenceState === ReferenceState.RESOLVING;
    }
    
    get isResolved(): boolean {
        return this.referenceState === ReferenceState.RESOLVED;
    }
    
    get state(): ReferenceState {
        return this.referenceState;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // Reference Interface: Value Access
    // ═══════════════════════════════════════════════════════════════
    
    get value(): T | null {
        return this.resolvedValue;
    }
    
    get iorString(): string | null {
        return this.model.iorString || null;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // Reference Interface: Initialization
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Initialize with local value
     * @param value Local value
     * @returns this for chaining
     */
    initLocal(value: T): this {
        this.resolvedValue = value;
        this.referenceState = ReferenceState.LOCAL;
        this.resolutionPromise = null;
        return this;
    }
    
    /**
     * Initialize with remote IOR string
     * @param iorString IOR string
     * @returns this for chaining
     */
    initRemote(iorString: string): this {
        this.parseIorString(iorString);
        this.referenceState = ReferenceState.REMOTE;
        this.resolvedValue = null;
        this.resolutionPromise = null;
        return this;
    }
    
    /**
     * Initialize from either local value or IOR string
     * Auto-detects based on input
     * @param valueOrIor Local value or IOR string or IORModel
     * @returns this for chaining (async for IOR parsing)
     */
    async init(valueOrIor: T | IORModel | string | null): Promise<this> {
        if (valueOrIor === null) {
            this.referenceState = ReferenceState.NULL;
            this.resolvedValue = null;
            this.resolutionPromise = null;
        } else if (typeof valueOrIor === 'string') {
            if (this.isIorStringFormat(valueOrIor)) {
                this.initRemote(valueOrIor);
            } else {
                // It's a string but not an IOR - treat as local value
                this.initLocal(valueOrIor as T);
            }
        } else if (this.isIORModel(valueOrIor)) {
            // It's an IORModel
            this.model = { ...valueOrIor };
            this.referenceState = ReferenceState.REMOTE;
            this.resolvedValue = null;
        } else {
            // It's a local value of type T
            this.initLocal(valueOrIor as T);
        }
        return this;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // Reference Interface: Resolution
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Resolve reference to its value (async, non-blocking)
     * 
     * - If local/resolved: returns value immediately (wrapped in Promise)
     * - If remote: loads via loader chain
     * - If already resolving: returns existing promise (no duplicate fetch)
     * 
     * When resolution completes:
     * 1. State → RESOLVED
     * 2. Value cached
     * 3. (Future: nested refs → local, next level prefetched)
     */
    async resolve(): Promise<T | null> {
        // Already resolved or local - return cached value
        if (this.isLocal || this.isResolved) {
            return this.resolvedValue;
        }
        
        // Null reference
        if (this.isNull) {
            return null;
        }
        
        // Already resolving - return existing promise (prevents duplicate fetch)
        if (this.isResolving && this.resolutionPromise) {
            return this.resolutionPromise;
        }
        
        // Start resolution
        this.referenceState = ReferenceState.RESOLVING;
        this.resolutionPromise = this.performResolution();
        
        try {
            const result = await this.resolutionPromise;
            this.resolvedValue = result;
            this.referenceState = ReferenceState.RESOLVED;
            
            // TODO I.1.6: Prefetch nested references
            // this.prefetchNestedReferences(result);
            
            return result;
        } catch (error) {
            // Resolution failed - revert to REMOTE state
            this.referenceState = ReferenceState.REMOTE;
            this.resolutionPromise = null;
            throw error;
        }
    }
    
    /**
     * Perform the actual resolution via loader chain
     */
    private async performResolution(): Promise<T | null> {
        const protocols = this.parseProtocolChain();
        
        if (protocols.length === 0) {
            throw new Error('[IOR] No protocols in chain');
        }
        
        // Get the transport protocol (last in chain, e.g., 'https')
        const transportProtocol = protocols[protocols.length - 1];
        const loader = IOR.loaders.get(transportProtocol);
        
        if (!loader) {
            throw new Error(`[IOR] No loader registered for protocol: ${transportProtocol}`);
        }
        
        console.log(`📡 [IOR] Resolving via chain: ${protocols.join(' → ')}`);
        
        // Build the URL for transport layer
        const url = this.toUrl();
        
        // Load via transport loader
        const rawData = await loader.load(url, {
            method: 'GET'
        });
        
        // Process through higher-level loaders (in reverse order, excluding transport)
        let result: any = rawData;
        
        for (let i = protocols.length - 2; i >= 0; i--) {
            const protocol = protocols[i];
            const protocolLoader = IOR.loaders.get(protocol);
            
            if (protocolLoader) {
                result = await protocolLoader.load(result, {});
            } else {
                result = this.applyBuiltInTransform(protocol, result, 'load');
            }
        }
        
        return result as T;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // IOR-Specific Methods (from DefaultIOR)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Register a loader for a protocol
     */
    registerLoader(protocol: string, loader: Loader): void {
        IOR.loaders.set(protocol, loader);
        console.log(`🔗 [IOR] Loader registered: ${protocol}`);
    }
    
    /**
     * Get registered loader for a protocol
     */
    getLoader(protocol: string): Loader | undefined {
        return IOR.loaders.get(protocol);
    }
    
    /**
     * Compute full IOR string from model
     */
    computeIorString(): string {
        if (this.model.iorString) return this.model.iorString;
        
        const protocol = this.model.protocol || 'https';
        const host = this.model.host || 'localhost';
        const port = this.model.port || (protocol.includes('https') ? 443 : 80);
        const path = this.model.path || `/${this.model.component}/${this.model.version}/${this.model.uuid}`;
        
        let profilesStr = `${host}:${port}`;
        if (this.model.profiles && this.model.profiles.length > 0) {
            const failoverProfiles = this.model.profiles
                .map(function mapProfile(p: IORProfile): string { return `${p.host}:${p.port}`; })
                .join(',');
            profilesStr = `${profilesStr},${failoverProfiles}`;
        }
        
        const iorString = `ior:${protocol}://${profilesStr}${path}`;
        this.model.iorString = iorString;
        
        return iorString;
    }
    
    /**
     * Parse IOR string and update model
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
        const failoverProfiles = hostParts.slice(1).map(function parseHostPort(hp: string): IORProfile {
            const [host, portStr] = hp.split(':');
            return { host, port: parseInt(portStr) || 443 };
        });
        
        // Parse path (component/version/uuid/method)
        const pathParts = path.split('/').filter(function filterEmpty(p: string): boolean { return p.length > 0; });
        
        // Update model
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
     * Enrich IOR with network location
     */
    enrichWithLocation(location: { host: string; port: number; protocol?: string }): this {
        this.model.protocol = location.protocol || this.model.protocol || 'https';
        this.model.host = location.host;
        this.model.port = location.port;
        this.model.path = `/${this.model.component}/${this.model.version}/${this.model.uuid}`;
        this.model.iorString = undefined;
        return this;
    }
    
    /**
     * Get all profiles for failover
     */
    getProfiles(): IORProfile[] {
        const profiles: IORProfile[] = [];
        
        if (this.model.host && this.model.port) {
            profiles.push({ 
                host: this.model.host, 
                port: this.model.port,
                protocol: this.model.protocol 
            });
        }
        
        if (this.model.profiles) {
            profiles.push(...this.model.profiles);
        }
        
        return profiles;
    }
    
    /**
     * Convert IOR to URL
     */
    toUrl(): string {
        const protocol = this.model.protocol || 'https';
        const host = this.model.host || 'localhost';
        const port = this.model.port || (protocol.includes('https') ? 443 : 80);
        const path = this.model.path || `/${this.model.component}/${this.model.version}/${this.model.uuid}`;
        
        let url = `${protocol}://${host}:${port}${path}`;
        
        if (this.model.params && Object.keys(this.model.params).length > 0) {
            const params = new URLSearchParams(this.model.params);
            url += `?${params.toString()}`;
        }
        
        return url;
    }
    
    /**
     * Parse URL and update model
     */
    fromUrl(url: string): this {
        const parsed = new URL(url);
        
        this.model.protocol = parsed.protocol.replace(':', '');
        this.model.host = parsed.hostname;
        this.model.port = parseInt(parsed.port) || (this.model.protocol.includes('https') ? 443 : 80);
        this.model.path = parsed.pathname;
        
        const pathParts = parsed.pathname.split('/').filter(function filterEmpty(p: string): boolean { return p.length > 0; });
        this.model.component = pathParts[0] || '';
        this.model.version = pathParts[1] || '';
        this.model.uuid = pathParts[2] || '';
        
        const params = Object.fromEntries(parsed.searchParams);
        this.model.params = Object.keys(params).length > 0 ? params : undefined;
        
        this.model.iorString = undefined;
        
        return this;
    }
    
    /**
     * Load data via IOR (alias for resolve)
     * @deprecated Use resolve() instead
     */
    async load<R = T>(options?: IOROptions): Promise<R> {
        const result = await this.resolve();
        return result as unknown as R;
    }
    
    /**
     * Save data via IOR
     */
    async save(data: any, options?: IOROptions): Promise<void> {
        const protocols = this.parseProtocolChain();
        const skipProtocols = options?.skipProtocols || [];
        
        const activeProtocols = protocols.filter(function filterSkipped(p: string): boolean {
            return !skipProtocols.includes(p);
        });
        
        if (activeProtocols.length === 0) {
            throw new Error('[IOR] No active protocols in chain after filtering');
        }
        
        const transportProtocol = activeProtocols[activeProtocols.length - 1];
        const loader = IOR.loaders.get(transportProtocol);
        
        if (!loader) {
            throw new Error(`[IOR] No loader registered for protocol: ${transportProtocol}`);
        }
        
        console.log(`📤 [IOR] Saving via chain: ${activeProtocols.join(' → ')}`);
        
        let processedData: any = data;
        
        for (let i = 0; i < activeProtocols.length - 1; i++) {
            const protocol = activeProtocols[i];
            const protocolLoader = IOR.loaders.get(protocol);
            
            if (protocolLoader) {
                processedData = await protocolLoader.save(processedData, '', options);
            } else {
                processedData = this.applyBuiltInTransform(protocol, processedData, 'save');
            }
        }
        
        const stringData = typeof processedData === 'string' 
            ? processedData 
            : JSON.stringify(processedData);
        
        const url = this.toUrl();
        await loader.save(stringData, url, {
            method: options?.method || 'POST',
            headers: options?.headers || { 'Content-Type': 'application/json' },
            timeout: options?.timeout
        });
        
        // Update local cached value
        this.resolvedValue = data;
        this.referenceState = ReferenceState.RESOLVED;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // Private Helpers
    // ═══════════════════════════════════════════════════════════════
    
    private isIorStringFormat(str: string): boolean {
        return str.startsWith('ior:') || 
               str.startsWith('http://') || 
               str.startsWith('https://') ||
               str.startsWith('wss://') ||
               str.startsWith('ws://');
    }
    
    private isIORModel(value: any): value is IORModel {
        return value && typeof value === 'object' && 
               ('component' in value || 'uuid' in value || 'iorString' in value);
    }
    
    private parseProtocolChain(): string[] {
        const iorString = this.model.iorString || this.computeIorString();
        
        const chainMatch = iorString.match(/^(?:ior:)?([a-zA-Z:]+):\/\//);
        if (!chainMatch) {
            return [this.model.protocol || 'https'];
        }
        
        const chainStr = chainMatch[1];
        const protocols = chainStr.split(':').filter(function filterEmpty(p: string): boolean { 
            return p.length > 0; 
        });
        
        return protocols;
    }
    
    private applyBuiltInTransform(protocol: string, data: any, direction: 'load' | 'save'): any {
        switch (protocol) {
            case 'scenario':
            case 'json':
                if (direction === 'load') {
                    return typeof data === 'string' ? JSON.parse(data) : data;
                } else {
                    return typeof data === 'string' ? data : JSON.stringify(data);
                }
            case 'REST':
                return data;
            default:
                console.warn(`[IOR] Unknown protocol '${protocol}' - passing data through`);
                return data;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // JSON Serialization
    // ═══════════════════════════════════════════════════════════════
    
    toJSON(): { state: ReferenceState; value: T | null; ior: string | null; model: IORModel } {
        return {
            state: this.referenceState,
            value: this.resolvedValue,
            ior: this.model.iorString || null,
            model: this.model
        };
    }
    
    fromJSON(json: { state?: ReferenceState; value?: T | null; ior?: string | null; model?: Partial<IORModel> }): this {
        this.referenceState = json.state || ReferenceState.NULL;
        this.resolvedValue = json.value ?? null;
        if (json.model) {
            this.model = { ...this.model, ...json.model };
        }
        if (json.ior) {
            this.model.iorString = json.ior;
        }
        return this;
    }
}

