/**
 * ServerNameIndicationManager.ts
 * 
 * Manages TLS SecureContext per domain using Server Name Indication (SNI).
 * Enables one HTTPS server to serve multiple domains with different certificates.
 * 
 * Web4 Radical OOP:
 * - P4: No arrow functions - use method references with .bind(this)
 * - P6: Empty constructor + init(scenario)
 * - P16: Object-Action naming (contextGet, certificateSet)
 * - P19: One file, one type - Model in separate interface file
 * 
 * @component ONCE
 * @layer 2
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 */

import * as tls from 'tls';
import { DomainCertificateModel } from '../layer3/DomainCertificateModel.interface.js';
import { ServerNameIndicationManagerModel } from '../layer3/ServerNameIndicationManagerModel.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';

/**
 * ServerNameIndicationManager
 * 
 * Radical OOP: This class knows how to manage TLS contexts per domain.
 * Uses Server Name Indication callback for dynamic certificate selection.
 */
export class ServerNameIndicationManager {
    public model: ServerNameIndicationManagerModel;
    
    private secureContexts: Map<string, tls.SecureContext>;
    private defaultSecureContext: tls.SecureContext | null;
    
    /**
     * Empty constructor - Web4 P6
     */
    constructor() {
        const now = new Date().toISOString();
        this.model = {
            uuid: '',
            name: 'ServerNameIndicationManager',
            iorComponent: 'ServerNameIndicationManager',
            iorVersion: '',  // Set by init() - NEVER hardcode!
            configuredDomains: [],
            defaultDomain: '',
            statistics: {
                totalOperations: 0,
                successCount: 0,  // context switches (matched domain)
                errorCount: 0,    // fallbacks to default
                lastOperationAt: '',
                lastErrorAt: '',
                createdAt: now,
                updatedAt: now
            }
        };
        this.secureContexts = new Map();
        this.defaultSecureContext = null;
    }
    
    /**
     * Initialize with scenario
     * Web4 P6: Empty constructor + init()
     */
    public init(scenario?: Scenario<ServerNameIndicationManagerModel>): this {
        if (scenario?.model) {
            Object.assign(this.model, scenario.model);
        }
        return this;
    }
    
    /**
     * Set certificate for domain
     * Supports hot-reload without server restart
     * 
     * Web4 P16: certificateSet (object + action)
     */
    public certificateSet(domain: string, certificate: DomainCertificateModel): void {
        const domainLower = domain.toLowerCase();
        
        const secureContext = tls.createSecureContext({
            cert: certificate.certificatePem,
            key: certificate.privateKeyPem,
            ca: certificate.certificateAuthorityChainPem || undefined,
            minVersion: 'TLSv1.2'
        });
        
        this.secureContexts.set(domainLower, secureContext);
        
        if (!this.model.configuredDomains.includes(domainLower)) {
            this.model.configuredDomains.push(domainLower);
        }
        
        this.model.statistics.updatedAt = new Date().toISOString();
        console.log(`[ServerNameIndicationManager] Certificate set for: ${domain}`);
    }
    
    /**
     * Set default (fallback) certificate
     * Web4 P16: defaultCertificateSet
     */
    public defaultCertificateSet(certificate: DomainCertificateModel): void {
        this.defaultSecureContext = tls.createSecureContext({
            cert: certificate.certificatePem,
            key: certificate.privateKeyPem,
            ca: certificate.certificateAuthorityChainPem || undefined,
            minVersion: 'TLSv1.2'
        });
        
        this.model.defaultDomain = certificate.domain;
        this.model.statistics.updatedAt = new Date().toISOString();
        console.log(`[ServerNameIndicationManager] Default certificate set: ${certificate.domain}`);
    }
    
    /**
     * Server Name Indication callback for https.createServer()
     * 
     * Web4 P4: Use as bound method reference
     * Usage: https.createServer({ SNICallback: this.serverNameIndicationCallbackGet() })
     * 
     * @param serverName - Hostname from TLS ClientHello
     * @param callback - Node.js TLS callback
     */
    public serverNameIndicationCallback(
        serverName: string,
        callback: (error: Error | null, context?: tls.SecureContext) => void
    ): void {
        const domainLower = serverName.toLowerCase();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = new Date().toISOString();
        
        // Try exact match
        let secureContext = this.secureContexts.get(domainLower);
        
        // Try wildcard match
        if (!secureContext) {
            secureContext = this.wildcardSecureContextFind(domainLower);
        }
        
        // Fallback to default
        if (!secureContext) {
            secureContext = this.defaultSecureContext ?? undefined;
            if (secureContext) {
                this.model.statistics.errorCount++;  // fallback counts as "error"
                this.model.statistics.lastErrorAt = new Date().toISOString();
            }
        } else {
            this.model.statistics.successCount++;  // matched domain
        }
        
        this.model.statistics.updatedAt = new Date().toISOString();
        
        if (secureContext) {
            callback(null, secureContext);
        } else {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = new Date().toISOString();
            callback(new Error(`No certificate configured for: ${serverName}`));
        }
    }
    
    /**
     * Get bound SNI callback for use in https.createServer()
     * 
     * Web4 P4: Returns bound method reference
     */
    public serverNameIndicationCallbackGet(): (
        serverName: string,
        callback: (error: Error | null, context?: tls.SecureContext) => void
    ) => void {
        return this.serverNameIndicationCallback.bind(this);
    }
    
    /**
     * Find wildcard certificate for domain
     * Web4 P4: Method, not arrow function
     */
    private wildcardSecureContextFind(domain: string): tls.SecureContext | undefined {
        const parts = domain.split('.');
        if (parts.length < 2) {
            return undefined;
        }
        
        // Try *.example.com for sub.example.com
        const wildcardDomain = '*.' + parts.slice(1).join('.');
        return this.secureContexts.get(wildcardDomain);
    }
    
    /**
     * Remove certificate for domain
     * Web4 P16: certificateRemove
     */
    public certificateRemove(domain: string): void {
        const domainLower = domain.toLowerCase();
        this.secureContexts.delete(domainLower);
        
        const index = this.model.configuredDomains.indexOf(domainLower);
        if (index !== -1) {
            this.model.configuredDomains.splice(index, 1);
        }
        
        this.model.statistics.updatedAt = new Date().toISOString();
        console.log(`[ServerNameIndicationManager] Certificate removed: ${domain}`);
    }
    
    /**
     * Get all configured domains
     * Web4 P16: domainsGet
     */
    public domainsGet(): string[] {
        return [...this.model.configuredDomains];
    }
    
    /**
     * Check if domain has certificate
     * Web4 P16: certificateHas
     */
    public certificateHas(domain: string): boolean {
        return this.secureContexts.has(domain.toLowerCase());
    }
    
    /**
     * Get secure context for domain (for testing)
     * Web4 P16: secureContextGet
     */
    public secureContextGet(domain: string): tls.SecureContext | undefined {
        return this.secureContexts.get(domain.toLowerCase());
    }
    
    /**
     * Convert to scenario
     * 
     * DRY: Uses model.iorComponent and model.iorVersion
     */
    public async toScenario(): Promise<Scenario<ServerNameIndicationManagerModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: this.model.iorComponent || 'ServerNameIndicationManager',
                version: this.model.iorVersion || ''
            },
            owner: '',
            model: { ...this.model }
        };
    }
}




