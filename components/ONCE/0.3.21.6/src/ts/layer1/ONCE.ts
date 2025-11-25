/**
 * ONCE - Universal Kernel Entry Point (Layer 1)
 * 
 * Environment-agnostic entry point for ONCE kernel.
 * Detects environment (Node.js, Browser, Worker, Service Worker, PWA)
 * and loads the appropriate kernel implementation.
 * 
 * Usage (identical everywhere):
 * ```typescript
 * import { ONCE } from '@web4x/once';
 * const kernel = await ONCE.start(scenario);
 * const health = await kernel.getHealth();
 * ```
 * 
 * @layer1
 * @pattern Singleton Factory
 * @pdca session/2025-11-22-UTC-2200.iteration-01.8-unified-kernel-architecture.pdca.md
 */

import type { ONCEKernel } from '../layer3/ONCE.interface.js';
import type { EnvironmentInfo } from '../layer3/EnvironmentInfo.interface.js';

export class ONCE {
    // Singleton instance
    private static instance: ONCEKernel | null = null;
    private static environment: EnvironmentInfo | null = null;
    
    /**
     * Start ONCE kernel (auto-detects environment)
     * 
     * @param scenario - Optional scenario for initialization
     * @returns Promise<ONCEKernel> - Initialized kernel instance
     */
    static async start(scenario?: any): Promise<ONCEKernel> {
        if (this.instance) {
            console.warn('ONCE kernel already started, returning existing instance');
            return this.instance;
        }
        
        // Detect environment
        this.environment = this.detectEnvironment();
        console.log(`[ONCE] Detected environment: ${this.environment.type}`);
        
        // Load appropriate kernel implementation
        const kernel = await this.loadKernel(this.environment.type);
        
        // Initialize kernel with scenario
        await kernel.init(scenario);
        
        // Store instance
        this.instance = kernel;
        
        return kernel;
    }
    
    /**
     * Get current kernel instance
     * 
     * @returns ONCEKernel | null
     */
    static getInstance(): ONCEKernel | null {
        return this.instance;
    }
    
    /**
     * Get detected environment info
     * 
     * @returns EnvironmentInfo | null
     */
    static getEnvironment(): EnvironmentInfo | null {
        return this.environment;
    }
    
    /**
     * Stop kernel and clear instance
     */
    static async stop(): Promise<void> {
        if (this.instance) {
            await this.instance.stop();
            this.instance = null;
            this.environment = null;
        }
    }
    
    /**
     * Detect current execution environment
     * 
     * @returns EnvironmentInfo
     */
    private static detectEnvironment(): EnvironmentInfo {
        // Check for Node.js
        if (typeof process !== 'undefined' && 
            process.versions && 
            process.versions.node) {
            return {
                type: 'nodejs',
                isNode: true,
                isBrowser: false,
                isWorker: false,
                isServiceWorker: false,
                isPWA: false,
                isIframe: false,
                version: process.versions.node,
                capabilities: ['fs', 'http', 'crypto', 'net'],
                isOnline: true,
                hostname: process.env.HOSTNAME,
                ip: undefined // Will be set during init
            };
        }
        
        // Check for Service Worker
        if (typeof self !== 'undefined' && 
            (self as any).constructor.name === 'ServiceWorkerGlobalScope') {
            return {
                type: 'service-worker',
                isNode: false,
                isBrowser: false,
                isWorker: false,
                isServiceWorker: true,
                isPWA: false,
                isIframe: false,
                version: (self as any).navigator.userAgent,
                capabilities: ['cache', 'fetch', 'push', 'sync'],
                isOnline: (self as any).navigator.onLine
            };
        }
        
        // Check for Web Worker
        if (typeof self !== 'undefined' && 
            (self as any).constructor.name === 'DedicatedWorkerGlobalScope') {
            return {
                type: 'worker',
                isNode: false,
                isBrowser: false,
                isWorker: true,
                isServiceWorker: false,
                isPWA: false,
                isIframe: false,
                version: (self as any).navigator.userAgent,
                capabilities: ['postMessage', 'importScripts'],
                isOnline: (self as any).navigator.onLine
            };
        }
        
        // Check for Browser (window context)
        if (typeof window !== 'undefined') {
            const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
            
            const isIframe = window !== window.parent;
            
            return {
                type: isPWA ? 'pwa' : (isIframe ? 'iframe' : 'browser'),
                isNode: false,
                isBrowser: true,
                isWorker: false,
                isServiceWorker: false,
                isPWA: isPWA,
                isIframe: isIframe,
                version: window.navigator.userAgent,
                capabilities: ['dom', 'fetch', 'localstorage', 'websocket'],
                isOnline: window.navigator.onLine
            };
        }
        
        // Fallback (unknown environment)
        console.warn('[ONCE] Unknown environment detected');
        return {
            type: 'browser', // Default fallback
            isNode: false,
            isBrowser: true,
            isWorker: false,
            isServiceWorker: false,
            isPWA: false,
            isIframe: false,
            version: 'unknown',
            capabilities: [],
            isOnline: true
        };
    }
    
    /**
     * Load kernel implementation based on environment
     * 
     * @param envType - Environment type
     * @returns Promise<ONCEKernel>
     */
    private static async loadKernel(envType: string): Promise<ONCEKernel> {
        switch (envType) {
            case 'nodejs': {
                const { DefaultONCE } = await import('../layer2/DefaultONCE.js');
                return new DefaultONCE();
            }
            
            case 'browser':
            case 'pwa':
            case 'iframe': {
                const { BrowserONCEKernel } = await import('../layer2/BrowserONCEKernel.js');
                return new BrowserONCEKernel();
            }
            
            case 'worker': {
                // Future: WorkerONCEKernel
                console.warn('[ONCE] Worker kernel not yet implemented, using Browser kernel');
                const { BrowserONCEKernel } = await import('../layer2/BrowserONCEKernel.js');
                return new BrowserONCEKernel();
            }
            
            case 'service-worker': {
                // Future: ServiceWorkerONCEKernel
                console.warn('[ONCE] Service Worker kernel not yet implemented, using Browser kernel');
                const { BrowserONCEKernel } = await import('../layer2/BrowserONCEKernel.js');
                return new BrowserONCEKernel();
            }
            
            default:
                throw new Error(`[ONCE] Unsupported environment type: ${envType}`);
        }
    }
}

// Re-export types for convenience
export type { ONCEKernel } from '../layer3/ONCE.interface.js';
export type { EnvironmentInfo } from '../layer3/EnvironmentInfo.interface.js';

