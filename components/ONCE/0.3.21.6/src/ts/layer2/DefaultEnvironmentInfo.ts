/**
 * DefaultEnvironmentInfo - Concrete implementation of EnvironmentInfo
 * 
 * Web4 Principle: No naked JSON objects - use proper classes
 * 
 * Radical OOP Pattern:
 * - Empty constructor
 * - State in this.model
 * - Static factory method for creation
 * 
 * @layer2
 * @pattern Concrete Implementation
 * @pdca session/2025-11-22-UTC-2200.iteration-01.8-unified-kernel-architecture.pdca.md
 */

import { EnvironmentInfo } from '../layer3/EnvironmentInfo.interface.js';
import { EnvironmentType } from '../layer3/EnvironmentType.enum.js';

export class DefaultEnvironmentInfo implements EnvironmentInfo {
    private model: EnvironmentInfo;
    
    /**
     * Empty constructor (Web4 Radical OOP)
     */
    constructor() {
        this.model = {
            type: EnvironmentType.NODE,
            isNode: false,
            isBrowser: false,
            isWorker: false,
            isServiceWorker: false,
            isPWA: false,
            isIframe: false,
            version: '',
            capabilities: [],
            isOnline: false
        };
    }
    
    /**
     * Static factory: Create for Node.js environment
     */
    static createNodeEnvironment(version: string, hostname?: string, ip?: string): DefaultEnvironmentInfo {
        const env = new DefaultEnvironmentInfo();
        env.model = {
            type: EnvironmentType.NODE,
            isNode: true,
            isBrowser: false,
            isWorker: false,
            isServiceWorker: false,
            isPWA: false,
            isIframe: false,
            version,
            capabilities: ['server', 'websocket', 'p2p'],
            isOnline: true,
            hostname,
            ip
        };
        return env;
    }
    
    /**
     * Static factory: Create for Browser environment
     */
    static createBrowserEnvironment(version: string): DefaultEnvironmentInfo {
        const env = new DefaultEnvironmentInfo();
        env.model = {
            type: EnvironmentType.BROWSER,
            isNode: false,
            isBrowser: true,
            isWorker: false,
            isServiceWorker: false,
            isPWA: false,
            isIframe: false,
            version,
            capabilities: ['websocket', 'p2p', 'dom'],
            isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
        };
        return env;
    }
    
    /**
     * Get environment info (EnvironmentInfo interface implementation)
     */
    get type(): EnvironmentType { return this.model.type; }
    get isNode(): boolean { return this.model.isNode; }
    get isBrowser(): boolean { return this.model.isBrowser; }
    get isWorker(): boolean { return this.model.isWorker; }
    get isServiceWorker(): boolean { return this.model.isServiceWorker; }
    get isPWA(): boolean { return this.model.isPWA; }
    get isIframe(): boolean { return this.model.isIframe; }
    get version(): string { return this.model.version; }
    get capabilities(): string[] { return this.model.capabilities; }
    get isOnline(): boolean { return this.model.isOnline; }
    get hostname(): string | undefined { return this.model.hostname; }
    get ip(): string | undefined { return this.model.ip; }
    
    /**
     * Get model (Radical OOP accessor)
     */
    getModel(): EnvironmentInfo {
        return { ...this.model };
    }
}

