/**
 * DomainCertificateStore.ts
 * 
 * Persists certificates to scenario hierarchy.
 * 
 * Storage Path:
 * scenarios/domain/box/fritz/McDonges/ONCE/{version}/certificates/
 *   └── LetsEncryptCertificateProvider/{version}/domains/{domain}/
 *       ├── certificate.scenario.json
 *       ├── certificate.pem
 *       ├── privatekey.pem
 *       └── chain.pem
 * 
 * Web4 Radical OOP:
 * - P4: No arrow functions
 * - P6: Empty constructor + init()
 * - P16: Object-Action naming
 * - P19: One file, one type - Model in separate interface file
 * - P23: EAMD.ucp virtual root
 * 
 * @component ONCE
 * @layer 2
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { DomainCertificateModel } from '../layer3/DomainCertificateModel.interface.js';
import { DomainCertificateStoreModel } from '../layer3/DomainCertificateStoreModel.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';

/**
 * DomainCertificateStore
 * 
 * Radical OOP: This class knows how to persist certificates.
 */
export class DomainCertificateStore {
    public model: DomainCertificateStoreModel;
    
    /**
     * Empty constructor - Web4 P6
     */
    constructor() {
        const now = new Date().toISOString();
        this.model = {
            uuid: '',
            name: 'DomainCertificateStore',
            iorComponent: 'DomainCertificateStore',
            iorVersion: '',  // Set by init() - NEVER hardcode!
            scenariosRootPath: '',
            providerName: 'LetsEncryptCertificateProvider',
            providerVersion: '',  // Set by init() - derived from iorVersion
            statistics: {
                totalOperations: 0,
                successCount: 0,
                errorCount: 0,
                lastOperationAt: '',
                lastErrorAt: '',
                createdAt: now,
                updatedAt: now
            }
        };
    }
    
    /**
     * Initialize with scenario
     * Web4 P6: Empty constructor + init()
     */
    public init(scenario?: Scenario<DomainCertificateStoreModel>): this {
        if (scenario?.model) {
            Object.assign(this.model, scenario.model);
        }
        // If providerVersion not set, use iorVersion
        if (!this.model.providerVersion && this.model.iorVersion) {
            this.model.providerVersion = this.model.iorVersion;
        }
        return this;
    }
    
    /**
     * Set scenarios root path
     * Web4 P16: scenariosRootPathSet
     */
    public scenariosRootPathSet(rootPath: string): this {
        this.model.scenariosRootPath = rootPath;
        return this;
    }
    
    /**
     * Get storage path for domain
     * Web4 P16: domainStoragePathGet
     */
    public domainStoragePathGet(domain: string): string {
        const safeDomain = this.domainSanitize(domain);
        return path.join(
            this.model.scenariosRootPath,
            'certificates',
            this.model.providerName,
            this.model.providerVersion || 'unknown',
            'domains',
            safeDomain
        );
    }
    
    /**
     * Sanitize domain for filesystem
     * Web4 P4: Method, not arrow function
     */
    private domainSanitize(domain: string): string {
        return domain.replace(/[^a-zA-Z0-9.-]/g, '_');
    }
    
    /**
     * Save certificate for domain
     * Web4 P16: certificateSave
     */
    public certificateSave(certificate: DomainCertificateModel): void {
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = new Date().toISOString();
        
        try {
            const storagePath = this.domainStoragePathGet(certificate.domain);
            
            // Ensure directory exists
            this.directoryEnsure(storagePath);
            
            // Save scenario
            const scenario: Scenario<DomainCertificateModel> = {
                ior: {
                    uuid: certificate.domain,
                    component: 'DomainCertificate',
                    version: this.model.iorVersion || ''
                },
                owner: '',
                model: certificate
            };
            
            const scenarioPath = path.join(storagePath, 'certificate.scenario.json');
            fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));
            
            // Save PEM files separately (for direct TLS use)
            fs.writeFileSync(
                path.join(storagePath, 'certificate.pem'),
                certificate.certificatePem
            );
            fs.writeFileSync(
                path.join(storagePath, 'privatekey.pem'),
                certificate.privateKeyPem
            );
            if (certificate.certificateAuthorityChainPem) {
                fs.writeFileSync(
                    path.join(storagePath, 'chain.pem'),
                    certificate.certificateAuthorityChainPem
                );
            }
            
            this.model.statistics.successCount++;
            this.model.statistics.updatedAt = new Date().toISOString();
            console.log(`[DomainCertificateStore] Certificate saved: ${certificate.domain}`);
            
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = new Date().toISOString();
            console.error(`[DomainCertificateStore] Save failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Load certificate for domain
     * Web4 P16: certificateLoad
     */
    public certificateLoad(domain: string): DomainCertificateModel | null {
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = new Date().toISOString();
        
        const storagePath = this.domainStoragePathGet(domain);
        const scenarioPath = path.join(storagePath, 'certificate.scenario.json');
        
        if (!fs.existsSync(scenarioPath)) {
            return null;
        }
        
        try {
            const content = fs.readFileSync(scenarioPath, 'utf-8');
            const scenario = JSON.parse(content) as Scenario<DomainCertificateModel>;
            this.model.statistics.successCount++;
            return scenario.model;
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = new Date().toISOString();
            console.error(`[DomainCertificateStore] Load failed: ${domain} - ${error.message}`);
            return null;
        }
    }
    
    /**
     * Check if certificate exists for domain
     * Web4 P16: certificateHas
     */
    public certificateHas(domain: string): boolean {
        const storagePath = this.domainStoragePathGet(domain);
        const scenarioPath = path.join(storagePath, 'certificate.scenario.json');
        return fs.existsSync(scenarioPath);
    }
    
    /**
     * Delete certificate for domain
     * Web4 P16: certificateDelete
     */
    public certificateDelete(domain: string): boolean {
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = new Date().toISOString();
        
        const storagePath = this.domainStoragePathGet(domain);
        
        if (!fs.existsSync(storagePath)) {
            return false;
        }
        
        try {
            fs.rmSync(storagePath, { recursive: true });
            this.model.statistics.successCount++;
            console.log(`[DomainCertificateStore] Certificate deleted: ${domain}`);
            return true;
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = new Date().toISOString();
            console.error(`[DomainCertificateStore] Delete failed: ${domain} - ${error.message}`);
            return false;
        }
    }
    
    /**
     * List all stored domains
     * Web4 P16: domainsListGet
     */
    public domainsListGet(): string[] {
        const domainsPath = path.join(
            this.model.scenariosRootPath,
            'certificates',
            this.model.providerName,
            this.model.providerVersion || 'unknown',
            'domains'
        );
        
        if (!fs.existsSync(domainsPath)) {
            return [];
        }
        
        return fs.readdirSync(domainsPath);
    }
    
    /**
     * Get certificates expiring soon
     * Web4 P16: expiringCertificatesGet
     * 
     * @param days - Number of days before expiry to check
     */
    public expiringCertificatesGet(days: number): DomainCertificateModel[] {
        const domains = this.domainsListGet();
        const expiringCerts: DomainCertificateModel[] = [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + days);
        
        for (const domain of domains) {
            const cert = this.certificateLoad(domain);
            if (cert && cert.expiresAt) {
                const expiryDate = new Date(cert.expiresAt);
                if (expiryDate <= cutoffDate) {
                    expiringCerts.push(cert);
                }
            }
        }
        
        return expiringCerts;
    }
    
    /**
     * Ensure directory exists
     * Web4 P4: Method, not arrow function
     */
    private directoryEnsure(directoryPath: string): void {
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }
    }
    
    /**
     * Convert to scenario
     * 
     * DRY: Uses model.iorComponent and model.iorVersion
     */
    public async toScenario(): Promise<Scenario<DomainCertificateStoreModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: this.model.iorComponent || 'DomainCertificateStore',
                version: this.model.iorVersion || ''
            },
            owner: '',
            model: { ...this.model }
        };
    }
}





