/**
 * IOR.ts - Simple IOR utilities (deprecated)
 * 
 * @deprecated Use IOR class from layer4/IOR.ts instead
 * This simple interface is kept for backwards compatibility
 * 
 * Web4 Principles:
 * - P4a: No standalone functions - use static methods
 * - P19: One File One Type (SimpleIOR + SimpleIORUtils)
 */

/**
 * @deprecated Use IOR class from layer4/IOR.ts instead
 */
export interface SimpleIOR {
    /** Protocol (web4, http, https, ws, wss) */
    protocol: string;

    /** Host (domain name or IP) */
    host: string;

    /** Port number */
    port: number;

    /** Path to object */
    path: string;

    /** Object UUID */
    uuid: string;

    /** Object type */
    objectType: string;

    /** Object version */
    version: string;

    /** Additional parameters */
    params?: Record<string, string>;
}

/**
 * SimpleIOR Utilities
 * 
 * @deprecated Use IOR class from layer4/IOR.ts instead
 * 
 * Web4 P4a: Static methods instead of standalone functions
 */
export class SimpleIORUtils {
    
    /**
     * Convert IOR to URL string
     * @deprecated Use new IOR().init(model).toUrl() instead
     */
    static toUrl(ior: SimpleIOR): string {
        const baseUrl = `${ior.protocol}://${ior.host}:${ior.port}${ior.path}`;
        const params = new URLSearchParams({
            uuid: ior.uuid,
            type: ior.objectType,
            version: ior.version,
            ...ior.params
        });
        return `${baseUrl}?${params.toString()}`;
    }
    
    /**
     * Parse URL string to IOR
     * @deprecated Use new IOR().init(url) instead
     */
    static fromUrl(url: string): SimpleIOR {
        const parsed = new URL(url);
        const params = Object.fromEntries(parsed.searchParams);
        
        return {
            protocol: parsed.protocol.replace(':', ''),
            host: parsed.hostname,
            port: parseInt(parsed.port) || 80,
            path: parsed.pathname,
            uuid: params.uuid || '',
            objectType: params.type || '',
            version: params.version || '',
            params: SimpleIORUtils.filterReservedParams(params)
        };
    }
    
    /**
     * Filter out reserved params (uuid, type, version)
     * P4a: Named function instead of arrow
     */
    private static filterReservedParams(params: Record<string, string>): Record<string, string> {
        const reserved = ['uuid', 'type', 'version'];
        const result: Record<string, string> = {};
        
        for (const key of Object.keys(params)) {
            if (!reserved.includes(key)) {
                result[key] = params[key];
            }
        }
        
        return result;
    }
}

/**
 * @deprecated Use SimpleIORUtils.toUrl() instead
 */
export function iorToUrl(ior: SimpleIOR): string {
    return SimpleIORUtils.toUrl(ior);
}

/**
 * @deprecated Use SimpleIORUtils.fromUrl() instead
 */
export function urlToIor(url: string): SimpleIOR {
    return SimpleIORUtils.fromUrl(url);
}
