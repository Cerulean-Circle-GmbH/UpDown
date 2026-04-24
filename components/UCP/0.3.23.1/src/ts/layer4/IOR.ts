/**
 * IOR<T> - Internet Object Reference Implementation
 *
 * IOR = Reference (consolidated - they are the SAME concept)
 * - Both can be local OR remote
 * - Artificial separation was confusing → now consolidated
 *
 * @web4x/ucp version: PLUGGABLE LOADER REGISTRY
 * - FileLoader ships built-in (Node.js fs — no external deps)
 * - All other loaders (HTTPS, WS, Scenario) register at runtime via IOR.loaderRegister()
 * - @web4x/once registers its loaders in kernel start()
 * - No functionality loss vs ONCE 0.3.22.2 — just decoupled initialization
 *
 * Web4 Principles:
 * - P6: Empty Constructor + init()
 * - P7: Async Only in Layer 4 (this is layer4!)
 * - P34: IOR as Unified Entry Point
 *
 * @layer4
 * @ior ior:esm:/UCP/{version}/IOR
 * @pdca 2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md
 */

import { ReferenceState } from '../layer3/ReferenceState.enum.js';
import type { Loader } from '../layer3/Loader.interface.js';
import type { IORInterface } from '../layer3/IOR.interface.js';
import type { IORModel } from '../layer3/IORModel.interface.js';
import type { IORProfile } from '../layer3/IORProfile.interface.js';
import type { IOROptions } from '../layer3/IOROptions.interface.js';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';
import type { Scenario } from '../layer3/Scenario.interface.js';
import type { Model } from '../layer3/Model.interface.js';
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
    // ISR: Parent-Aware Self-Replacement (Option D)
    // ═══════════════════════════════════════════════════════════════

    /** Parent model that holds this IOR (for self-replacement) */
    private parentModel: object | null = null;

    /** Property key in parent */
    private parentKey: string | null = null;

    /** Index in parent array (for Collection<IOR>) */
    private parentIndex: number | null = null;

    // ═══════════════════════════════════════════════════════════════
    // Static Loader Registry (PLUGGABLE)
    // ═══════════════════════════════════════════════════════════════

    /** Static loader registry (shared across all IOR instances) */
    private static loaders: Map<string, Loader> = new Map();

    /** Flag to track if default loaders have been registered */
    private static loadersInitialized = false;

    /**
     * Pluggable instantiation factory
     * Set by @web4x/once to enable IOR → Scenario → Instance resolution
     * Default: null (instantiation not available without kernel)
     */
    private static instantiateFactory: ((scenario: Scenario<any>) => Promise<any>) | null = null;

    /**
     * Pluggable browser storage factory
     * Set by @web4x/once to enable PWA caching
     * Default: null (no browser caching without kernel)
     */
    private static browserStorageFactory: (() => Promise<any>) | null = null;

    // ═══════════════════════════════════════════════════════════════
    // Constructor (P6: Empty)
    // ═══════════════════════════════════════════════════════════════

    constructor() {
        this.model = undefined as unknown as IORModel;
    }

    // ═══════════════════════════════════════════════════════════════
    // Static Loader Initialization (called on first use)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Ensure default loaders are registered (lazy initialization)
     * Only registers FileLoader built-in. Other loaders register via loaderRegister().
     */
    private static ensureLoadersInitialized(): void {
        if (IOR.loadersInitialized) return;
        IOR.loadersInitialized = true;

        // FileLoader ships built-in (Node.js fs — no external deps)
        const fileLoader = new FileLoader();
        fileLoader.init();
        IOR.loaders.set('file', fileLoader);
        IOR.loaders.set('fs', fileLoader);  // P2P alias for Web4 chain
    }

    /**
     * Register a loader for a protocol (PUBLIC API)
     * Called by @web4x/once and other components to register their loaders.
     *
     * @example
     * ```typescript
     * // In @web4x/once kernel start:
     * IOR.loaderRegister('https', new HTTPSLoader().init());
     * IOR.loaderRegister('http', httpsLoader);
     * IOR.loaderRegister('scenario', new ScenarioLoader().init());
     * IOR.loaderRegister('wss', new WebSocketLoader().init());
     * IOR.loaderRegister('ws', wsLoader);
     * ```
     */
    static loaderRegister(protocol: string, loader: Loader): void {
        IOR.ensureLoadersInitialized();
        IOR.loaders.set(protocol, loader);
    }

    /**
     * Get registered loader for a protocol
     */
    static loaderGet(protocol: string): Loader | undefined {
        return IOR.loaders.get(protocol);
    }

    /**
     * List all registered protocols
     */
    static loaderList(): string[] {
        return Array.from(IOR.loaders.keys());
    }

    /**
     * Set the instantiation factory (called by @web4x/once)
     * Enables IOR → Scenario → Instance resolution
     */
    static instantiateFactorySet(factory: (scenario: Scenario<any>) => Promise<any>): void {
        IOR.instantiateFactory = factory;
    }

    /**
     * Set the browser storage factory (called by @web4x/once)
     * Enables PWA caching in browser environment
     */
    static browserStorageFactorySet(factory: () => Promise<any>): void {
        IOR.browserStorageFactory = factory;
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

    initLocal(value: T): this {
        IOR.ensureLoadersInitialized();
        this.model = { component: '', version: '', uuid: '' };
        this.resolvedValue = value;
        this.referenceState = ReferenceState.LOCAL;
        this.resolutionPromise = null;
        return this;
    }

    initRemote(iorString: string): this {
        IOR.ensureLoadersInitialized();
        this.model = { component: '', version: '', uuid: '' };
        this.parseIorString(iorString);
        this.referenceState = ReferenceState.REMOTE;
        this.resolvedValue = null;
        this.resolutionPromise = null;
        return this;
    }

    async init(valueOrIor: T | IORModel | string | null): Promise<this> {
        IOR.ensureLoadersInitialized();
        this.model = { component: '', version: '', uuid: '' };

        if (valueOrIor === null) {
            this.referenceState = ReferenceState.NULL;
            this.resolvedValue = null;
            this.resolutionPromise = null;
        } else if (typeof valueOrIor === 'string') {
            if (this.isIorStringFormat(valueOrIor)) {
                this.initRemote(valueOrIor);
            } else {
                this.initLocal(valueOrIor as T);
            }
        } else if (this.isIORModel(valueOrIor)) {
            this.model = { ...valueOrIor };
            this.referenceState = ReferenceState.REMOTE;
            this.resolvedValue = null;
        } else {
            this.initLocal(valueOrIor as T);
        }
        return this;
    }

    // ═══════════════════════════════════════════════════════════════
    // ISR: Parent-Aware Initialization (Option D)
    // ═══════════════════════════════════════════════════════════════

    initWithParent(parent: object, key: string, index?: number): this {
        this.parentModel = parent;
        this.parentKey = key;
        this.parentIndex = index ?? null;
        return this;
    }

    async resolveAndReplace<C = T>(): Promise<C | null> {
        try {
            const instance = await this.resolveInstance<C>();

            if (instance === null) {
                console.warn('[IOR.resolveAndReplace] Resolution returned null for:', this.model);
                return null;
            }

            if (this.parentModel && this.parentKey) {
                const parent = this.parentModel as Record<string, unknown>;

                if (this.parentIndex !== null) {
                    const arr = parent[this.parentKey] as unknown[];
                    if (arr && Array.isArray(arr)) {
                        arr[this.parentIndex] = instance;
                    }
                } else {
                    parent[this.parentKey] = instance;
                }
            }

            return instance;
        } catch (error) {
            console.warn(`[IOR.resolveAndReplace] Fire-and-forget resolution failed:`, (error as Error).message);
            return null;
        }
    }

    get hasParent(): boolean {
        return this.parentModel !== null && this.parentKey !== null;
    }

    // ═══════════════════════════════════════════════════════════════
    // Reference Interface: Resolution
    // ═══════════════════════════════════════════════════════════════

    async resolve(options?: IOROptions): Promise<T | null> {
        if (this.isLocal || this.isResolved) {
            return this.resolvedValue;
        }

        if (this.isNull) {
            return null;
        }

        if (this.isResolving && this.resolutionPromise) {
            return this.resolutionPromise;
        }

        this.referenceState = ReferenceState.RESOLVING;
        this.resolutionPromise = this.performResolution(options);

        try {
            const result = await this.resolutionPromise;
            this.resolvedValue = result;
            this.referenceState = ReferenceState.RESOLVED;
            return result;
        } catch (error) {
            this.referenceState = ReferenceState.REMOTE;
            this.resolutionPromise = null;
            throw error;
        }
    }

    private async performResolution(options?: IOROptions): Promise<T | null> {
        let protocols = this.parseProtocolChain();

        if (protocols.length === 0) {
            throw new Error('[IOR] No protocols in chain');
        }

        // I.7.1: Check PWA cache first (browser only, if factory registered)
        const cached = await this.cacheCheck();
        if (cached !== undefined) {
            return cached;
        }

        // FsM.1: ENVIRONMENT-AWARE PROTOCOL FALLBACK
        const isNodeJs = typeof process !== 'undefined' && process.versions?.node;

        if (protocols[0] === 'fs' && !isNodeJs) {
            protocols = protocols.slice(1);
        }

        if (protocols.length === 0) {
            throw new Error('[IOR] No available protocols after fallback');
        }

        const transportProtocol = protocols[protocols.length - 1];
        const loader = IOR.loaders.get(transportProtocol);

        if (!loader) {
            throw new Error(`[IOR] No loader registered for protocol: ${transportProtocol}. Registered: [${IOR.loaderList().join(', ')}]`);
        }

        const url = this.toUrl();

        const rawData = await loader.load(url, {
            method: options?.method || HttpMethod.GET,
            headers: options?.headers,
            signal: options?.signal
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

        // I.7.2: Cache result in PWA storage (if factory registered)
        await this.cacheStore(result);

        return result as T;
    }

    // ═══════════════════════════════════════════════════════════════
    // KD.2-KD.4: Instance Resolution (Reference<T> → UcpComponent)
    // Uses pluggable instantiation factory
    // ═══════════════════════════════════════════════════════════════

    async resolveInstance<C = T>(): Promise<C | null> {
        const scenario = await this.resolve() as Scenario<any> | null;
        if (!scenario) {
            console.warn('[IOR.resolveInstance] Failed to resolve scenario');
            return null;
        }

        if (!scenario.ior || !scenario.ior.component) {
            console.warn('[IOR.resolveInstance] Scenario missing ior.component info');
            return null;
        }

        return await IOR.instantiate<C, any>(scenario);
    }

    static async instantiate<C, M extends Model = Model>(scenario: Scenario<M>): Promise<C> {
        const componentName = scenario.ior?.component;

        if (!componentName) {
            throw new Error('[IOR.instantiate] Scenario missing ior.component');
        }

        // Use pluggable factory (registered by @web4x/once)
        if (IOR.instantiateFactory) {
            return await IOR.instantiateFactory(scenario) as C;
        }

        throw new Error(`[IOR.instantiate] No instantiation factory registered. Call IOR.instantiateFactorySet() from kernel.`);
    }

    static async dereference<C, M extends Model = Model>(reference: C | Scenario<M> | string | null): Promise<C | null> {
        if (reference === null || reference === undefined) {
            return null;
        }

        if (typeof reference === 'object' &&
            'model' in reference &&
            'init' in reference &&
            typeof (reference as any).init === 'function') {
            return reference as C;
        }

        if (typeof reference === 'string') {
            return await new IOR<C>().initRemote(reference).resolveInstance<C>();
        }

        if (typeof reference === 'object' &&
            'ior' in reference &&
            'model' in reference &&
            !('init' in reference && typeof (reference as any).init === 'function')) {
            return await IOR.instantiate<C, M>(reference as Scenario<M>);
        }

        console.warn('[IOR.dereference] Unknown reference format:', typeof reference);
        return null;
    }

    // ═══════════════════════════════════════════════════════════════
    // I.7: PWA Cache Integration (pluggable via browserStorageFactory)
    // ═══════════════════════════════════════════════════════════════

    private static browserStorage: any = null;
    private static browserStorageInitialized = false;

    private async cacheCheck(): Promise<T | undefined> {
        if (typeof indexedDB === 'undefined') {
            return undefined;
        }

        try {
            const storage = await this.browserStorageGet();
            if (!storage) {
                return undefined;
            }

            if (this.model.uuid) {
                try {
                    const scenario = await storage.scenarioLoad(this.model.uuid);
                    if (scenario?.model) {
                        return scenario.model as T;
                    }
                } catch {
                    // Not found by UUID
                }
            }

            const url = this.toUrl();
            if (url) {
                const linkLocation = `ior:url:${url}`;
                const unit = await this.unitFindByReference(storage, linkLocation);
                if (unit?.model?._cachedData) {
                    return unit.model._cachedData as T;
                }
            }

            return undefined;
        } catch {
            return undefined;
        }
    }

    private async unitFindByReference(storage: any, linkLocation: string): Promise<any | null> {
        try {
            const units = await storage.scenarioFind({ component: 'Unit' });

            for (const unit of units) {
                const references = unit.model?.references || [];
                for (const ref of references) {
                    if (ref.linkLocation === linkLocation) {
                        return unit;
                    }
                }
            }

            return null;
        } catch {
            return null;
        }
    }

    private async cacheStore(result: T): Promise<void> {
        if (typeof indexedDB === 'undefined') return;
        if (!result) return;

        try {
            const storage = await this.browserStorageGet();
            if (!storage) return;

            const unitUuid = this.model.uuid || crypto.randomUUID();
            const url = this.toUrl();
            const now = Date.now();

            const unitScenario = {
                ior: {
                    uuid: unitUuid,
                    component: 'Unit',
                    version: '0.3.23.0'
                },
                owner: 'browser-cache',
                model: {
                    uuid: unitUuid,
                    componentType: this.model.component || 'IOR',
                    componentIor: url || '',
                    artefactUuid: null,
                    fileUuid: null,
                    createdAt: now,
                    modifiedAt: now,
                    storagePath: null,
                    indexPath: null,
                    references: [
                        {
                            linkLocation: `ior:url:${url}`,
                            linkTarget: `ior:unit:${unitUuid}`,
                            syncStatus: 'SYNCED'
                        }
                    ],
                    _cachedData: result
                }
            } as Scenario<any>;

            const symlinkPaths = [`type/Unit/0.3.23.0`];
            await storage.scenarioSave(unitUuid, unitScenario, symlinkPaths);
        } catch (error) {
            console.warn(`[IOR] Cache store failed:`, error);
        }
    }

    blobUrlCreate(blob: Blob): string {
        const blobUrl = URL.createObjectURL(blob);

        if (this.resolvedValue && typeof this.resolvedValue === 'object') {
            const model = this.resolvedValue as any;
            if (Array.isArray(model.references)) {
                model.references.push({
                    linkLocation: `ior:blob:${blobUrl}`,
                    linkTarget: `ior:unit:${this.model.uuid || 'unknown'}`,
                    syncStatus: 'RUNTIME'
                });
            }
        }

        return blobUrl;
    }

    blobUrlRevoke(blobUrl: string): void {
        URL.revokeObjectURL(blobUrl);

        if (this.resolvedValue && typeof this.resolvedValue === 'object') {
            const model = this.resolvedValue as any;
            if (Array.isArray(model.references)) {
                const idx = model.references.findIndex(
                    (ref: any) => ref.linkLocation === `ior:blob:${blobUrl}`
                );
                if (idx >= 0) {
                    model.references.splice(idx, 1);
                }
            }
        }
    }

    private async browserStorageGet(): Promise<any> {
        if (IOR.browserStorageInitialized) {
            return IOR.browserStorage;
        }

        IOR.browserStorageInitialized = true;

        // Use pluggable factory (registered by @web4x/once)
        if (IOR.browserStorageFactory) {
            try {
                IOR.browserStorage = await IOR.browserStorageFactory();
                return IOR.browserStorage;
            } catch (error) {
                console.warn('[IOR] Browser storage factory failed:', error);
                return null;
            }
        }

        return null;
    }

    // ═══════════════════════════════════════════════════════════════
    // IOR-Specific Methods
    // ═══════════════════════════════════════════════════════════════

    /** @deprecated Use static IOR.loaderRegister() instead */
    registerLoader(protocol: string, loader: Loader): void {
        IOR.loaders.set(protocol, loader);
    }

    /** @deprecated Use static IOR.loaderGet() instead */
    getLoader(protocol: string): Loader | undefined {
        return IOR.loaders.get(protocol);
    }

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

    parseIorString(iorString: string): this {
        if (iorString.startsWith('/') && !iorString.startsWith('//')) {
            return this.parseRelativeUrl(iorString);
        }

        const withoutPrefix = iorString.replace(/^ior:/, '');
        const protocolMatch = withoutPrefix.match(/^([^:]+):\/\//);
        const protocol = protocolMatch ? protocolMatch[1] : 'https';
        const withoutProtocol = withoutPrefix.replace(/^[^:]+:\/\//, '');

        if (protocol === 'file' || protocol === 'fs') {
            const path = withoutProtocol.startsWith('/') ? withoutProtocol : '/' + withoutProtocol;
            this.model.protocol = protocol;
            this.model.host = 'localhost';
            this.model.port = 0;
            this.model.path = path;
            this.model.component = '';
            this.model.version = '';
            this.model.uuid = '';
            this.model.iorString = iorString;
            return this;
        }

        const firstSlash = withoutProtocol.indexOf('/');
        const hostsStr = firstSlash > 0 ? withoutProtocol.substring(0, firstSlash) : withoutProtocol;
        const path = firstSlash > 0 ? withoutProtocol.substring(firstSlash) : '';

        const hostParts = hostsStr.split(',');
        const primaryHost = hostParts[0].split(':');
        const failoverProfiles = hostParts.slice(1).map(function parseHostPort(hp: string): IORProfile {
            const [host, portStr] = hp.split(':');
            return { host, port: parseInt(portStr) || 443 };
        });

        const pathParts = path.split('/').filter(function filterEmpty(p: string): boolean { return p.length > 0; });

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

    private parseRelativeUrl(path: string): this {
        const isBrowser = typeof window !== 'undefined' && window.location;

        let protocol = 'https';
        let host = 'localhost';
        let port = 443;

        if (isBrowser) {
            protocol = window.location.protocol.replace(':', '');
            host = window.location.hostname;
            const locationPort = window.location.port;
            port = locationPort ? parseInt(locationPort) : (protocol === 'https' ? 443 : 80);
        }

        const pathParts = path.split('/').filter(function filterEmpty(p: string): boolean { return p.length > 0; });

        this.model.protocol = protocol;
        this.model.host = host;
        this.model.port = port;
        this.model.path = path;

        const looksLikeComponentIOR = pathParts.length >= 3 &&
            !pathParts[0].includes('.') &&
            /^\d+\.\d+\.\d+/.test(pathParts[1]) &&
            pathParts[2].length > 0 &&
            !pathParts[2].includes('.');

        if (looksLikeComponentIOR) {
            this.model.component = pathParts[0] || '';
            this.model.version = pathParts[1] || '';
            this.model.uuid = pathParts[2] || '';
        } else {
            this.model.component = '';
            this.model.version = '';
            this.model.uuid = '';
        }

        this.model.iorString = `${protocol}://${host}:${port}${path}`;

        return this;
    }

    enrichWithLocation(location: { host: string; port: number; protocol?: string }): this {
        this.model.protocol = location.protocol || this.model.protocol || 'https';
        this.model.host = location.host;
        this.model.port = location.port;
        this.model.path = `/${this.model.component}/${this.model.version}/${this.model.uuid}`;
        this.model.iorString = undefined;
        return this;
    }

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

    toUrl(): string {
        const protocol = this.model.protocol || 'https';
        const path = this.model.path || `/${this.model.component}/${this.model.version}/${this.model.uuid}`;

        if (protocol === 'file' || protocol === 'fs') {
            return path;
        }

        const host = this.model.host || 'localhost';
        const port = this.model.port || (protocol.includes('https') ? 443 : 80);

        let url = `${protocol}://${host}:${port}${path}`;

        if (this.model.params && Object.keys(this.model.params).length > 0) {
            const params = new URLSearchParams(this.model.params);
            url += `?${params.toString()}`;
        }

        return url;
    }

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

    async load<R = T>(options?: IOROptions): Promise<R> {
        const result = await this.resolve(options);
        return result as unknown as R;
    }

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
            throw new Error(`[IOR] No loader registered for protocol: ${transportProtocol}. Registered: [${IOR.loaderList().join(', ')}]`);
        }

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
            : JSON.stringify(processedData, null, 2);

        const url = this.toUrl();
        await loader.save(stringData, url, {
            method: options?.method || HttpMethod.POST,
            headers: options?.headers || { 'Content-Type': 'application/json' },
            timeout: options?.timeout
        });

        this.resolvedValue = data;
        this.referenceState = ReferenceState.RESOLVED;

        // I.7.3: Save to browser storage (if factory registered)
        await this.cacheStoreSave(data);

        // I.7.4: Notify via WebSocket (if loader registered)
        await this.webSocketNotifySave();
    }

    private async cacheStoreSave(data: any): Promise<void> {
        if (typeof indexedDB === 'undefined') { return; }
        if (!this.model.uuid) { return; }

        try {
            const storage = await this.browserStorageGet();
            if (!storage) { return; }

            const scenario: Scenario<any> = {
                ior: {
                    uuid: this.model.uuid,
                    component: this.model.component || 'IOR',
                    version: this.model.version || '0.3.23.0'
                },
                owner: 'browser-cache',
                model: data
            };

            await storage.scenarioSave(this.model.uuid, scenario, [`type/${this.model.component}/${this.model.version}`]);
        } catch (error: any) {
            console.warn(`[IOR] Browser cache save failed: ${error.message}`);
        }
    }

    private async webSocketNotifySave(): Promise<void> {
        if (typeof WebSocket === 'undefined') { return; }
        if (!this.model.uuid) { return; }

        try {
            const wsLoader = IOR.loaders.get('wss') as any;
            if (!wsLoader) { return; }

            const wsUrl = `wss://${this.model.host || 'localhost'}:${this.model.port || 443}/ws`;
            const state = wsLoader.getState ? wsLoader.getState(wsUrl) : 'DISCONNECTED';

            if (state !== 'CONNECTED') { return; }

            await wsLoader.save({
                type: 'scenario-update',
                uuid: this.model.uuid,
                version: this.model.version,
                component: this.model.component,
                timestamp: new Date().toISOString()
            }, wsUrl, {});
        } catch (error: any) {
            console.warn(`[IOR] WebSocket notify failed: ${error.message}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // Private Helpers
    // ═══════════════════════════════════════════════════════════════

    private isIorStringFormat(str: string): boolean {
        return str.startsWith('ior:') ||
               str.startsWith('http://') ||
               str.startsWith('https://') ||
               str.startsWith('wss://') ||
               str.startsWith('ws://') ||
               str.startsWith('/');
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
        const jsonTransform = this.transformJson.bind(this, data, direction);
        const passthrough = function passthroughTransform(): any { return data; };

        const transforms: Record<string, () => any> = {
            'scenario': jsonTransform,
            'json': jsonTransform,
            'REST': passthrough
        };

        const transform = transforms[protocol];
        if (transform) {
            return transform();
        }

        console.warn(`[IOR] Unknown protocol '${protocol}' - passing data through`);
        return data;
    }

    private transformJson(data: any, direction: 'load' | 'save'): any {
        if (direction === 'load') {
            return typeof data === 'string' ? JSON.parse(data) : data;
        } else {
            return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
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
