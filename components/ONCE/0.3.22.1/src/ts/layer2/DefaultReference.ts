/**
 * DefaultReference<T> - Web4 Reference Implementation
 * 
 * A Reference can hold either a local value OR a remote IOR.
 * This enables transparent access to data regardless of location.
 * 
 * Web4 Principles:
 * - P6: Empty Constructor + init()
 * - P34: IOR as Unified Entry Point - Reference can be remote
 * - P5: Reference<T> for Nullable References
 * 
 * Usage:
 * ```typescript
 * // Local reference
 * const localRef = new DefaultReference<User>().initLocal(user);
 * const user = localRef.value;
 * 
 * // Remote reference
 * const remoteRef = new DefaultReference<User>().initRemote('ior:https://host/User/1.0.0/uuid');
 * const user = await remoteRef.resolve();
 * 
 * // Transparent access
 * const user = await ref.resolve(); // Works for both local and remote
 * ```
 * 
 * @layer2
 * @pdca 2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md
 */

import type { IOR } from '../layer3/IOR.interface.js';

/**
 * ReferenceState - Enum for reference state tracking
 */
export enum ReferenceState {
    /** No value set */
    NULL = 'NULL',
    /** Local value set */
    LOCAL = 'LOCAL',
    /** Remote IOR set */
    REMOTE = 'REMOTE'
}

/**
 * DefaultReference<T> - Reference that can be local or remote
 * 
 * Supports:
 * - Local values (immediate access via `value`)
 * - Remote IOR references (async access via `resolve()`)
 * - Null state (no value)
 */
export class DefaultReference<T> {
    
    /** Local value (if state is LOCAL) */
    private localValue: T | null = null;
    
    /** Remote IOR string (if state is REMOTE) */
    private iorString: string | null = null;
    
    /** Current state */
    private referenceState: ReferenceState = ReferenceState.NULL;
    
    /**
     * Empty constructor (P6 compliance)
     */
    constructor() {
        // P6: Empty constructor - all initialization via init methods
    }
    
    // ═══════════════════════════════════════════════════════════════
    // Initialization Methods
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Initialize with a local value
     * @param value The local value
     * @returns this for chaining
     */
    initLocal(value: T): this {
        this.localValue = value;
        this.iorString = null;
        this.referenceState = ReferenceState.LOCAL;
        return this;
    }
    
    /**
     * Initialize with a remote IOR string
     * @param iorString The IOR string (e.g., 'ior:https://host/Component/1.0.0/uuid')
     * @returns this for chaining
     */
    initRemote(iorString: string): this {
        this.iorString = iorString;
        this.localValue = null;
        this.referenceState = ReferenceState.REMOTE;
        return this;
    }
    
    /**
     * Initialize from either local value or IOR string
     * Auto-detects based on input type
     * @param valueOrIor Local value or IOR string
     * @returns this for chaining
     */
    init(valueOrIor: T | string | null): this {
        if (valueOrIor === null) {
            this.referenceState = ReferenceState.NULL;
            this.localValue = null;
            this.iorString = null;
        } else if (typeof valueOrIor === 'string' && this.isIorString(valueOrIor)) {
            return this.initRemote(valueOrIor);
        } else {
            return this.initLocal(valueOrIor as T);
        }
        return this;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // State Accessors (P16: TypeScript Accessors)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Check if reference is local
     */
    get isLocal(): boolean {
        return this.referenceState === ReferenceState.LOCAL;
    }
    
    /**
     * Check if reference is remote (IOR)
     */
    get isRemote(): boolean {
        return this.referenceState === ReferenceState.REMOTE;
    }
    
    /**
     * Check if reference is null (no value)
     */
    get isNull(): boolean {
        return this.referenceState === ReferenceState.NULL;
    }
    
    /**
     * Get current state
     */
    get state(): ReferenceState {
        return this.referenceState;
    }
    
    /**
     * Get local value (immediate, no async)
     * Returns null if remote or null state
     */
    get value(): T | null {
        return this.localValue;
    }
    
    /**
     * Get IOR string (if remote)
     * Returns null if local or null state
     */
    get ior(): string | null {
        return this.iorString;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // Resolution (Async)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Resolve reference to its value
     * - If local: returns value immediately
     * - If remote: loads via IOR and returns resolved value
     * - If null: returns null
     * 
     * @returns Resolved value (async for remote, sync-wrapped for local)
     */
    async resolve(): Promise<T | null> {
        if (this.isNull) {
            return null;
        }
        
        if (this.isLocal) {
            return this.localValue;
        }
        
        // Remote: load via IOR
        if (this.iorString) {
            // Dynamic import to avoid circular dependency
            const { DefaultIOR } = await import('./DefaultIOR.js');
            const ior = await new DefaultIOR().init(this.iorString);
            return await ior.load<T>();
        }
        
        return null;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // Utility Methods
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Check if a string looks like an IOR string
     * @param str String to check
     * @returns true if it's an IOR string
     */
    private isIorString(str: string): boolean {
        // IOR strings start with 'ior:' or are URLs
        return str.startsWith('ior:') || 
               str.startsWith('http://') || 
               str.startsWith('https://') ||
               str.startsWith('wss://') ||
               str.startsWith('ws://');
    }
    
    /**
     * Convert to JSON-serializable format
     * Used for scenario persistence
     */
    toJSON(): { type: ReferenceState; value: T | null; ior: string | null } {
        return {
            type: this.referenceState,
            value: this.localValue,
            ior: this.iorString
        };
    }
    
    /**
     * Initialize from JSON (scenario restoration)
     * @param json JSON representation
     * @returns this for chaining
     */
    fromJSON(json: { type: ReferenceState; value?: T | null; ior?: string | null }): this {
        this.referenceState = json.type || ReferenceState.NULL;
        this.localValue = json.value ?? null;
        this.iorString = json.ior ?? null;
        return this;
    }
}

