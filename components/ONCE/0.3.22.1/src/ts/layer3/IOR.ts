/**
 * IOR.ts - Simple IOR interface (deprecated)
 * 
 * @deprecated Use IOR class from layer4/IOR.ts instead
 * This simple interface is kept for backwards compatibility only
 */

import { IOR } from '../layer4/IOR.js';

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

/**
 * @deprecated Use new IOR().init(model).toUrl() instead
 */
export function iorToUrl(ior: SimpleIOR): string {
    return IOR.simpleToUrl(ior);
}

/**
 * @deprecated Use new IOR().init(url) instead
 */
export function urlToIor(url: string): SimpleIOR {
    return IOR.simpleFromUrl(url);
}

