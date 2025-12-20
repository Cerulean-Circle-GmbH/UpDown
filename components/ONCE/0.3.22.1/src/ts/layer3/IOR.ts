/**
 * IOR.ts - Simple IOR interface (deprecated)
 * 
 * @deprecated Use IOR class from layer4/IOR.ts instead
 * This file is kept for backwards compatibility only
 * 
 * Migration:
 * - iorToUrl(ior) → IOR.simpleToUrl(ior)
 * - urlToIor(url) → IOR.simpleFromUrl(url)
 */

/**
 * @deprecated Use IOR class from layer4/IOR.ts instead
 */
export interface SimpleIOR {
    protocol: string;
    host: string;
    port: number;
    path: string;
    uuid: string;
    objectType: string;
    version: string;
    params?: Record<string, string>;
}

// Re-export static methods from IOR class for backwards compatibility
// NO FUNCTIONS - use IOR.simpleToUrl() and IOR.simpleFromUrl() directly
export { IOR } from '../layer4/IOR.js';
