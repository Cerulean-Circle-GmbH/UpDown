/**
 * TLSCertificateLoader.ts
 * 
 * Loads TLS certificates for HTTPS servers
 * 
 * Web4 Radical OOP:
 * - Empty constructor + init() (P6)
 * - No arrow functions (P4)
 * - One file, one type (P19)
 * 
 * @component HTTPSServer
 * @layer 2
 */

import * as fs from 'fs';
import * as tls from 'tls';
import { TLSOptions } from '../layer3/TLSOptions.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';

import { Model } from '../layer3/Model.interface.js';

export interface TLSCertificateLoaderModel extends Model {
    // uuid, name, iorComponent, iorVersion inherited from Model
    options: TLSOptions;
    loaded: boolean;
    certificateExpiry?: string;
    isSelfSigned?: boolean;
}

/**
 * TLSCertificateLoader
 * 
 * Loads and manages TLS certificates for HTTPSServer
 */
export class TLSCertificateLoader {
    public model: TLSCertificateLoaderModel;
    
    private cert: Buffer | null = null;
    private key: Buffer | null = null;
    private ca: Buffer | null = null;
    
    constructor() {
        // Empty constructor - Web4 P6
        this.model = {
            uuid: '',
            name: 'TLSCertificateLoader',
            options: { certPath: '', keyPath: '' },
            loaded: false
        };
    }
    
    /**
     * Initialize with TLS options
     */
    public init(scenario: Scenario<TLSCertificateLoaderModel>): this {
        if (scenario?.model) {
            Object.assign(this.model, scenario.model);
        }
        return this;
    }
    
    /**
     * Load certificates from file system
     * Web4 P4: Method reference, not arrow function
     */
    public load(): this {
        try {
            this.cert = fs.readFileSync(this.model.options.certPath);
            this.key = fs.readFileSync(this.model.options.keyPath);
            
            if (this.model.options.caPath) {
                this.ca = fs.readFileSync(this.model.options.caPath);
            }
            
            // Parse certificate to extract expiry
            this.certificateInfoExtract();
            
            this.model.loaded = true;
            console.log('[TLSCertificateLoader] Certificates loaded successfully');
            
            return this;
        } catch (error: any) {
            console.error('[TLSCertificateLoader] Failed to load certificates:', error.message);
            throw new Error(`TLS certificate loading failed: ${error.message}`);
        }
    }
    
    /**
     * Extract certificate info (expiry, self-signed check)
     */
    private certificateInfoExtract(): void {
        try {
            const certPem = this.cert!.toString();
            
            // Check for self-signed indicators (simplified heuristic)
            this.model.isSelfSigned = certPem.includes('CN=localhost') || 
                                       certPem.includes('O=Development');
            
            // Note: Full certificate parsing would require x509 library
            // For now, we mark expiry as unknown
            this.model.certificateExpiry = 'unknown';
            
            if (this.model.isSelfSigned) {
                console.warn('[TLSCertificateLoader] ⚠️ Using self-signed certificate (OK for dev)');
            }
        } catch (err) {
            // Non-fatal - continue without expiry info
            this.model.certificateExpiry = 'parse-error';
        }
    }
    
    /**
     * Get TLS secure context options for https.createServer()
     */
    public secureContextOptionsGet(): tls.SecureContextOptions {
        if (!this.model.loaded) {
            throw new Error('Certificates not loaded. Call load() first.');
        }
        
        const options: tls.SecureContextOptions = {
            cert: this.cert!,
            key: this.key!,
            passphrase: this.model.options.passphrase,
            minVersion: this.model.options.minVersion || 'TLSv1.2'
        };
        
        if (this.ca) {
            options.ca = this.ca;
        }
        
        return options;
    }
    
    /**
     * Convert to scenario
     */
    public async toScenario(): Promise<Scenario<TLSCertificateLoaderModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: this.model.iorComponent || 'TLSCertificateLoader',  // DRY
                version: this.model.iorVersion || ''  // DRY: from init()
            },
            owner: '',
            model: { ...this.model }
        };
    }
}








