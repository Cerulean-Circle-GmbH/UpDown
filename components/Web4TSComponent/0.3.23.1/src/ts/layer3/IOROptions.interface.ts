/**
 * IOROptions.interface.ts
 * 
 * Options for IOR.load() and IOR.save() operations
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P3: Uses HttpMethod enum (not string)
 * 
 * @layer3
 * @version 0.3.22.1
 */

import { HttpMethod } from './HttpMethod.enum.js';

/**
 * IOR Load/Save Options
 */
export interface IOROptions {
    /** HTTP method - default: GET for load, POST for save */
    method?: HttpMethod;
    
    /** HTTP headers */
    headers?: Record<string, string>;
    
    /** Request timeout in milliseconds - default: 5000 */
    timeout?: number;
    
    /** AbortSignal for request cancellation */
    signal?: AbortSignal;
    
    /** Skip specific protocols in chain (e.g., ['scenario'] to get raw JSON) */
    skipProtocols?: string[];
}

