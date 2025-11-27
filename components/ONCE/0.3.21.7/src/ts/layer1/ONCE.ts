/**
 * Once - Universal Kernel Entry Point (Layer 1)
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
 * Note: Class name is "Once", but exported as "ONCE" (global singleton accessor)
 * 
 * @layer1
 * @pattern Singleton Factory
 * @pdca session/2025-11-22-UTC-2200.iteration-01.8-unified-kernel-architecture.pdca.md
 */

import type { ONCEKernel } from '../layer3/ONCE.interface.js';
import type { EnvironmentInfo } from '../layer3/EnvironmentInfo.interface.js';
import { EnvironmentType } from '../layer3/EnvironmentType.enum.js';
import { DefaultEnvironmentInfo } from '../layer2/DefaultEnvironmentInfo.js';

export class Once {
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
            // Note: ONCE interface doesn't have stop(), but implementations might
            // For now, just clear the instance
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
            return DefaultEnvironmentInfo.createNodeEnvironment(
                process.versions.node,
                process.env.HOSTNAME,
                undefined
            ).getModel();
        }
        
        // Check for Service Worker
        if (typeof self !== 'undefined' && 
            (self as any).constructor.name === 'ServiceWorkerGlobalScope') {
            return DefaultEnvironmentInfo.createServiceWorkerEnvironment(
                (self as any).navigator.userAgent
            ).getModel();
        }
        
        // Check for Web Worker
        if (typeof self !== 'undefined' && 
            (self as any).constructor.name === 'DedicatedWorkerGlobalScope') {
            return DefaultEnvironmentInfo.createWorkerEnvironment(
                (self as any).navigator.userAgent
            ).getModel();
        }
        
        // Check for Browser (window context)
        if (typeof window !== 'undefined') {
            const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
            
            const isIframe = window !== window.parent;
            
            if (isPWA) {
                return DefaultEnvironmentInfo.createPWAEnvironment(
                    window.navigator.userAgent
                ).getModel();
            } else if (isIframe) {
                return DefaultEnvironmentInfo.createIFrameEnvironment(
                    window.navigator.userAgent
                ).getModel();
            } else {
                return DefaultEnvironmentInfo.createBrowserEnvironment(
                    window.navigator.userAgent
                ).getModel();
            }
        }
        
        // Fallback (unknown environment)
        console.warn('[ONCE] Unknown environment detected');
        return DefaultEnvironmentInfo.createUnknownEnvironment().getModel();
    }
    
    /**
     * Load kernel implementation based on environment
     * 
     * @param envType - Environment type
     * @returns Promise<ONCEKernel>
     */
    private static async loadKernel(envType: EnvironmentType): Promise<any> {
        switch (envType) {
            case EnvironmentType.NODE: {
                const { NodeJsOnce } = await import('../layer2/NodeJsOnce.js');
                return new NodeJsOnce();
            }
            
            case EnvironmentType.BROWSER:
            case EnvironmentType.PWA:
            case EnvironmentType.IFRAME: {
                const { BrowserOnce } = await import('../layer2/BrowserOnce.js');
                const kernel = new BrowserOnce();
                // Register global singleton for browser (both window.ONCE and window.global.ONCE)
                if (typeof window !== 'undefined') {
                    (window as any).global = (window as any).global || {};
                    (window as any).global.ONCE = kernel;
                    (window as any).ONCE = kernel;  // Direct window.ONCE access
                }
                return kernel;
            }
            
            case EnvironmentType.WORKER: {
                // Future: WorkerOnce
                console.warn('[Once] Worker kernel not yet implemented, using Browser kernel');
                const { BrowserOnce } = await import('../layer2/BrowserOnce.js');
                return new BrowserOnce();
            }
            
            case EnvironmentType.SERVICE_WORKER: {
                // Future: ServiceWorkerOnce
                console.warn('[Once] Service Worker kernel not yet implemented, using Browser kernel');
                const { BrowserOnce } = await import('../layer2/BrowserOnce.js');
                return new BrowserOnce();
            }
            
            default:
                throw new Error(`[Once] Unsupported environment type: ${envType}`);
        }
    }
}

// Export as ONCE singleton (global accessor)
export const ONCE = Once;

// Re-export types for convenience
export type { ONCEKernel } from '../layer3/ONCE.interface.js';
export type { EnvironmentInfo } from '../layer3/EnvironmentInfo.interface.js';

