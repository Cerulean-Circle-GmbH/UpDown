/**
 * CertificateOrchestrator.ts
 * 
 * High-level certificate lifecycle management.
 * 
 * Coordinates:
 * - Certificate providers (LetsEncrypt, manual)
 * - Server Name Indication manager (hot-reload)
 * - Renewal scheduler
 * - Persistence (scenario storage)
 * 
 * Web4 Radical OOP:
 * - P4: No arrow functions
 * - P6: Empty constructor + init()
 * - P7: async ONLY in Layer 4 ✅
 * - P16: Object-Action naming
 * - P19: One file, one type - Model in separate interface file
 * 
 * @component ONCE
 * @layer 4 (async allowed here!)
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 */

import { ServerNameIndicationManager } from '../layer2/ServerNameIndicationManager.js';
import { LetsEncryptCertificateProvider } from '../layer2/LetsEncryptCertificateProvider.js';
import { DomainCertificateStore } from '../layer2/DomainCertificateStore.js';
import { CertificateRenewalScheduler, RenewalTask } from '../layer2/CertificateRenewalScheduler.js';
import { CertificateOrchestratorModel } from '../layer3/CertificateOrchestratorModel.interface.js';
import { DomainConfigurationModel } from '../layer3/DomainConfigurationModel.interface.js';
import { DomainCertificateModel } from '../layer3/DomainCertificateModel.interface.js';
import { CertificateSource } from '../layer3/CertificateSource.enum.js';
import { Scenario } from '../layer3/Scenario.interface.js';

/**
 * CertificateOrchestrator
 * 
 * Layer 4: This is where async methods are allowed (Web4 P7)
 * 
 * Orchestrates the complete certificate lifecycle:
 * 1. Domain configuration management
 * 2. Certificate request/renewal via providers
 * 3. Hot-reload into SNI manager
 * 4. Persistence to scenario store
 * 5. Automatic renewal scheduling
 */
export class CertificateOrchestrator {
    public model: CertificateOrchestratorModel;
    
    private serverNameIndicationManager: ServerNameIndicationManager;
    private letsEncryptCertificateProvider: LetsEncryptCertificateProvider;
    private domainCertificateStore: DomainCertificateStore;
    private certificateRenewalScheduler: CertificateRenewalScheduler;
    
    /**
     * Empty constructor - Web4 P6
     */
    constructor() {
        const now = new Date().toISOString();
        this.model = {
            uuid: '',
            name: 'CertificateOrchestrator',
            iorComponent: 'CertificateOrchestrator',
            iorVersion: '',  // Set by init() - NEVER hardcode!
            domainConfigurations: [],
            scenariosRootPath: '',
            renewalCheckIntervalMs: 24 * 60 * 60 * 1000,  // 24 hours
            renewBeforeExpiryDays: 30,
            statistics: {
                totalOperations: 0,
                successCount: 0,  // renewals completed
                errorCount: 0,    // renewal failures
                lastOperationAt: '',
                lastErrorAt: '',
                createdAt: now,
                updatedAt: now
            }
        };
        
        this.serverNameIndicationManager = new ServerNameIndicationManager();
        this.letsEncryptCertificateProvider = new LetsEncryptCertificateProvider();
        this.domainCertificateStore = new DomainCertificateStore();
        this.certificateRenewalScheduler = new CertificateRenewalScheduler();
    }
    
    /**
     * Initialize with scenario
     * Web4 P7: async in Layer 4 ✅
     */
    public async init(scenario?: Scenario<CertificateOrchestratorModel>): Promise<this> {
        if (scenario?.model) {
            Object.assign(this.model, scenario.model);
        }
        
        // Initialize sub-components
        this.serverNameIndicationManager.init();
        this.letsEncryptCertificateProvider.init();
        this.domainCertificateStore.init();
        this.certificateRenewalScheduler.init();
        
        // Configure certificate store
        this.domainCertificateStore.scenariosRootPathSet(this.model.scenariosRootPath);
        
        // Set iorVersion on sub-components
        if (this.model.iorVersion) {
            this.domainCertificateStore.model.iorVersion = this.model.iorVersion;
            this.domainCertificateStore.model.providerVersion = this.model.iorVersion;
        }
        
        // Wire up renewal callback
        this.certificateRenewalScheduler.renewalCallbackSet(
            this.renewalHandle.bind(this)
        );
        
        // Load existing certificates
        await this.existingCertificatesLoad();
        
        return this;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // COMPONENT GETTERS
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Get Server Name Indication callback for HTTPSServer
     * Web4 P16: serverNameIndicationCallbackGet
     */
    public serverNameIndicationCallbackGet(): (
        serverName: string,
        callback: (error: Error | null, context?: any) => void
    ) => void {
        return this.serverNameIndicationManager.serverNameIndicationCallbackGet();
    }
    
    /**
     * Get Server Name Indication manager
     * Web4 P16: serverNameIndicationManagerGet
     */
    public serverNameIndicationManagerGet(): ServerNameIndicationManager {
        return this.serverNameIndicationManager;
    }
    
    /**
     * Get ACME challenge provider for route registration
     * Web4 P16: letsEncryptCertificateProviderGet
     */
    public letsEncryptCertificateProviderGet(): LetsEncryptCertificateProvider {
        return this.letsEncryptCertificateProvider;
    }
    
    /**
     * Get certificate store
     * Web4 P16: domainCertificateStoreGet
     */
    public domainCertificateStoreGet(): DomainCertificateStore {
        return this.domainCertificateStore;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // IOR Methods (exposed via IORRoute)
    // Web4 P7: async ONLY in Layer 4 ✅
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * IOR: Request certificate for domain
     * ior:esm:/ONCE/{version}/{uuid}/certificateRequest
     */
    public async certificateRequest(
        configuration: DomainConfigurationModel
    ): Promise<DomainCertificateModel> {
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = new Date().toISOString();
        
        console.log(`[CertificateOrchestrator] Requesting certificate: ${configuration.domain}`);
        
        try {
            const certificate = await this.letsEncryptCertificateProvider.certificateRequest(
                configuration
            );
            
            // Hot-reload into Server Name Indication manager
            this.serverNameIndicationManager.certificateSet(configuration.domain, certificate);
            
            // Persist to scenario store
            this.domainCertificateStore.certificateSave(certificate);
            
            // Register for renewal
            this.certificateRenewalScheduler.certificateRegister(configuration, certificate);
            
            // Update model
            this.domainConfigurationAdd(configuration);
            
            this.model.statistics.successCount++;
            this.model.statistics.updatedAt = new Date().toISOString();
            
            console.log(`[CertificateOrchestrator] Certificate issued: ${configuration.domain}`);
            return certificate;
            
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = new Date().toISOString();
            console.error(`[CertificateOrchestrator] Certificate request failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Add domain configuration to model (if not exists)
     * Web4 P4: Method, not arrow function
     */
    private domainConfigurationAdd(configuration: DomainConfigurationModel): void {
        const exists = this.model.domainConfigurations.find(
            this.domainConfigurationMatch.bind(this, configuration.domain)
        );
        if (!exists) {
            this.model.domainConfigurations.push(configuration);
        }
    }
    
    /**
     * Domain configuration matcher
     * Web4 P4: Method for find callback
     */
    private domainConfigurationMatch(domain: string, config: DomainConfigurationModel): boolean {
        return config.domain === domain;
    }
    
    /**
     * IOR: Add domain configuration
     * ior:esm:/ONCE/{version}/{uuid}/domainAdd
     */
    public async domainAdd(configuration: DomainConfigurationModel): Promise<DomainCertificateModel | null> {
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = new Date().toISOString();
        
        this.domainConfigurationAdd(configuration);
        
        if (configuration.certificateSource === CertificateSource.LetsEncrypt) {
            return this.certificateRequest(configuration);
        }
        
        return null;
    }
    
    /**
     * IOR: Remove domain
     * ior:esm:/ONCE/{version}/{uuid}/domainRemove
     */
    public async domainRemove(domain: string): Promise<boolean> {
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = new Date().toISOString();
        
        // Remove from configurations
        this.model.domainConfigurations = this.model.domainConfigurations.filter(
            this.domainConfigurationFilterOut.bind(this, domain)
        );
        
        // Remove from SNI manager
        this.serverNameIndicationManager.certificateRemove(domain);
        
        // Remove from renewal scheduler
        this.certificateRenewalScheduler.certificateUnregister(domain);
        
        // Remove from store
        this.domainCertificateStore.certificateDelete(domain);
        
        this.model.statistics.updatedAt = new Date().toISOString();
        console.log(`[CertificateOrchestrator] Domain removed: ${domain}`);
        return true;
    }
    
    /**
     * Filter out domain configuration
     * Web4 P4: Method for filter callback
     */
    private domainConfigurationFilterOut(domain: string, config: DomainConfigurationModel): boolean {
        return config.domain !== domain;
    }
    
    /**
     * IOR: List all domains
     * ior:esm:/ONCE/{version}/{uuid}/domainsGet
     */
    public async domainsGet(): Promise<DomainConfigurationModel[]> {
        return [...this.model.domainConfigurations];
    }
    
    /**
     * IOR: Get certificate status
     * ior:esm:/ONCE/{version}/{uuid}/certificateStatusGet
     */
    public async certificateStatusGet(domain: string): Promise<{
        domain: string;
        expiresAt: string;
        daysRemaining: number;
        issuer: string;
        isActive: boolean;
    } | null> {
        const certificate = this.domainCertificateStore.certificateLoad(domain);
        if (!certificate) {
            return null;
        }
        
        const expiresAt = new Date(certificate.expiresAt);
        const now = new Date();
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        const daysRemaining = Math.floor(
            (expiresAt.getTime() - now.getTime()) / millisecondsPerDay
        );
        
        return {
            domain,
            expiresAt: certificate.expiresAt,
            daysRemaining,
            issuer: certificate.issuer,
            isActive: this.serverNameIndicationManager.certificateHas(domain)
        };
    }
    
    /**
     * IOR: Get all certificate statuses
     * ior:esm:/ONCE/{version}/{uuid}/certificateStatusesGet
     */
    public async certificateStatusesGet(): Promise<Array<{
        domain: string;
        expiresAt: string;
        daysRemaining: number;
        issuer: string;
        isActive: boolean;
    }>> {
        const statuses: Array<{
            domain: string;
            expiresAt: string;
            daysRemaining: number;
            issuer: string;
            isActive: boolean;
        }> = [];
        
        for (const config of this.model.domainConfigurations) {
            const status = await this.certificateStatusGet(config.domain);
            if (status) {
                statuses.push(status);
            }
        }
        
        return statuses;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // LIFECYCLE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Start lifecycle management
     * Web4 P7: async in Layer 4
     */
    public async start(): Promise<void> {
        this.certificateRenewalScheduler.model.checkIntervalMs = this.model.renewalCheckIntervalMs;
        this.certificateRenewalScheduler.start();
        console.log('[CertificateOrchestrator] Started');
    }
    
    /**
     * Stop lifecycle management
     */
    public async stop(): Promise<void> {
        this.certificateRenewalScheduler.stop();
        console.log('[CertificateOrchestrator] Stopped');
    }
    
    /**
     * Force renewal check
     * ior:esm:/ONCE/{version}/{uuid}/renewalCheckTrigger
     */
    public async renewalCheckTrigger(): Promise<number> {
        const expiringCerts = this.domainCertificateStore.expiringCertificatesGet(
            this.model.renewBeforeExpiryDays
        );
        
        console.log(`[CertificateOrchestrator] Found ${expiringCerts.length} certificates needing renewal`);
        
        for (const cert of expiringCerts) {
            const config = this.model.domainConfigurations.find(
                this.domainConfigurationMatch.bind(this, cert.domain)
            );
            if (config) {
                await this.certificateRequest(config);
            }
        }
        
        return expiringCerts.length;
    }
    
    /**
     * Load existing certificates from store
     * Web4 P4: Bound method
     */
    private async existingCertificatesLoad(): Promise<void> {
        const domains = this.domainCertificateStore.domainsListGet();
        
        for (const domain of domains) {
            const certificate = this.domainCertificateStore.certificateLoad(domain);
            if (certificate) {
                // Load into SNI manager
                this.serverNameIndicationManager.certificateSet(domain, certificate);
                
                // Find configuration and register for renewal
                const configuration = this.model.domainConfigurations.find(
                    this.domainConfigurationMatch.bind(this, domain)
                );
                if (configuration) {
                    this.certificateRenewalScheduler.certificateRegister(
                        configuration,
                        certificate
                    );
                }
            }
        }
        
        console.log(`[CertificateOrchestrator] Loaded ${domains.length} existing certificates`);
    }
    
    /**
     * Handle renewal request
     * Web4 P4: Bound method for callback
     */
    private async renewalHandle(task: RenewalTask, configuration: DomainConfigurationModel): Promise<void> {
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = new Date().toISOString();
        
        console.log(`[CertificateOrchestrator] Renewing: ${task.domain}`);
        
        try {
            const newCertificate = await this.letsEncryptCertificateProvider.certificateRequest(
                configuration
            );
            
            // Hot-reload
            this.serverNameIndicationManager.certificateSet(
                task.domain,
                newCertificate
            );
            
            // Persist
            this.domainCertificateStore.certificateSave(newCertificate);
            
            // Re-register with new expiry
            this.certificateRenewalScheduler.certificateRegister(
                configuration,
                newCertificate
            );
            
            this.model.statistics.successCount++;
            this.model.statistics.updatedAt = new Date().toISOString();
            
            console.log(`[CertificateOrchestrator] Renewed: ${task.domain}`);
            
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = new Date().toISOString();
            console.error(
                `[CertificateOrchestrator] Renewal failed: ${task.domain}`,
                error.message
            );
            throw error;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // SCENARIO PERSISTENCE
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Convert to scenario
     * 
     * DRY: Uses model.iorComponent and model.iorVersion
     */
    public async toScenario(): Promise<Scenario<CertificateOrchestratorModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: this.model.iorComponent || 'CertificateOrchestrator',
                version: this.model.iorVersion || ''
            },
            owner: '',
            model: { ...this.model }
        };
    }
}



