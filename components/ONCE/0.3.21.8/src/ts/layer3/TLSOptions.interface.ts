/**
 * TLSOptions.interface.ts
 * 
 * TLS/SSL certificate configuration for HTTPS servers
 * 
 * @component HTTPSServer
 * @layer 3
 * Web4 P19: One file, one type
 */

export interface TLSOptions {
    /** Path to certificate file (PEM format) */
    certPath: string;
    
    /** Path to private key file (PEM format) */
    keyPath: string;
    
    /** Optional: Path to CA certificate chain */
    caPath?: string;
    
    /** Optional: Passphrase for encrypted key */
    passphrase?: string;
    
    /** Minimum TLS version (default: TLSv1.2) */
    minVersion?: 'TLSv1.2' | 'TLSv1.3';
}








