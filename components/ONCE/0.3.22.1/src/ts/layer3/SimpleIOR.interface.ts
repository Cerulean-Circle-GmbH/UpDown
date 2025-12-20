/**
 * SimpleIOR.interface.ts
 * 
 * @deprecated Use IOR class from layer4/IOR.ts instead
 * This interface is kept for backwards compatibility only
 * 
 * Migration: Replace SimpleIOR with IOR class
 * - SimpleIOR → new IOR().init(model)
 * - iorToUrl() → IOR.simpleToUrl() or new IOR().toUrl()
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * 
 * @layer3
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

