/**
 * DefaultOnceKernel - Base class for all ONCE kernel implementations
 * 
 * Provides common functionality for:
 * - Node.js (NodeJsOnce)
 * - Browser (BrowserOnce)
 * - Web Worker (WorkerOnce)
 * - Service Worker (ServiceWorkerOnce)
 * 
 * Radical OOP Pattern:
 * - Empty constructor
 * - State in this.model
 * - Methods operate on model
 * - No arrow functions, no callbacks
 * 
 * Note: Does NOT implement full OnceKernel interface - that's environment-specific
 * Only provides shared helper methods
 * 
 * @layer2
 * @pattern Abstract Base Class
 * @pdca session/2025-11-25-UTC-1930.iteration-01.10-once-naming-convention-standardization.pdca.md
 */

import type { Reference } from '../layer3/Reference.interface.js';
import type { Model } from '../layer3/Model.interface.js';

export abstract class DefaultOnceKernel {
    /**
     * Model storage (Radical OOP)
     * Each subclass defines its own model type
     */
    protected model: Reference<Model> = null;
    
    /**
     * Empty constructor (Radical OOP)
     * All initialization happens in init()
     */
    constructor() {
        // ✅ Empty constructor - no logic here
    }
    
    /**
     * Initialize kernel with scenario
     * Subclasses should implement this
     * 
     * @param scenario - Initialization scenario
     * @returns Promise<this> - Fluent API
     */
    abstract init(scenario?: any): Promise<any>;
    
    /**
     * Get kernel health status
     * Subclasses should implement this
     * 
     * @returns Promise<any> - Health status object
     */
    abstract getHealth(): Promise<any>;
    
    // ========================================
    // SHARED HELPER METHODS
    // ========================================
    
    /**
     * Generate UUID v4
     * 
     * @returns string - UUID
     */
    protected generateUUID(): string {
        // RFC 4122 version 4 UUID
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * Format timestamp for logs
     * 
     * @param date - Optional date (defaults to now)
     * @returns string - Formatted timestamp
     */
    protected formatTimestamp(date?: Date): string {
        const d = date || new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
               `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    
    /**
     * Format duration in milliseconds to human-readable string
     * 
     * @param ms - Duration in milliseconds
     * @returns string - Formatted duration
     */
    protected formatDuration(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    /**
     * Deep clone object (simple implementation)
     * 
     * @param obj - Object to clone
     * @returns any - Cloned object
     */
    protected deepClone(obj: any): any {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }
        
        const cloned: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }
    
    /**
     * Sleep/delay helper
     * 
     * @param ms - Milliseconds to sleep
     * @returns Promise<void>
     */
    protected sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Safe JSON stringify with error handling
     * 
     * @param obj - Object to stringify
     * @param pretty - Pretty print (default: false)
     * @returns string - JSON string or error message
     */
    protected safeStringify(obj: any, pretty: boolean = false): string {
        try {
            return JSON.stringify(obj, null, pretty ? 2 : 0);
        } catch (error) {
            return `[JSON stringify error: ${(error as Error).message}]`;
        }
    }
    
    /**
     * Safe JSON parse with error handling
     * 
     * @param json - JSON string
     * @returns any - Parsed object or null
     */
    protected safeParse(json: string): any {
        try {
            return JSON.parse(json);
        } catch (error) {
            console.error(`[AbstractONCEKernel] JSON parse error: ${(error as Error).message}`);
            return null;
        }
    }
    
    /**
     * Get model (accessor for subclasses)
     * 
     * @returns any - Current model
     */
    protected getModel(): any {
        return this.model;
    }
    
    /**
     * Check if kernel is initialized
     * 
     * @returns boolean
     */
    protected isInitialized(): boolean {
        return this.model !== null;
    }
}

