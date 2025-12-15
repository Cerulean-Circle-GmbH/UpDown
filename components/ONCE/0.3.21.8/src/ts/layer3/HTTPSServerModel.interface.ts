/**
 * HTTPSServerModel.interface.ts
 * 
 * Model for HTTPSServer component
 * Extends HTTPServerModel with TLS configuration
 * 
 * @component HTTPSServer
 * @layer 3
 * Web4 P19: One file, one type
 */

import { HTTPServerModel } from './HTTPServerModel.interface.js';
import { TLSOptions } from './TLSOptions.interface.js';

export interface HTTPSServerModel extends HTTPServerModel {
    /** TLS certificate options */
    tls: TLSOptions;
    
    /** Enable HTTP→HTTPS redirect on separate port? */
    httpRedirect?: {
        enabled: boolean;
        httpPort: number;  // Port for HTTP redirect server
    };
    
    /** Certificate expiry date (for monitoring) */
    certificateExpiry?: string;
    
    /** Is certificate self-signed? (for dev warning) */
    isSelfSigned?: boolean;
    
    /**
     * Enable Server Name Indication (SNI) for multi-domain TLS?
     * When enabled, uses SNI callback for dynamic certificate selection.
     * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
     */
    sniEnabled?: boolean;
}




