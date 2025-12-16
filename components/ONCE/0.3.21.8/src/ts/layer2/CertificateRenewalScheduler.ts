/**
 * CertificateRenewalScheduler.ts
 * 
 * Schedules and triggers certificate renewals.
 * 
 * Web4 Radical OOP:
 * - P4: No arrow functions
 * - P6: Empty constructor + init()
 * - P16: Object-Action naming
 * - P19: One file, one type - Model in separate interface file
 * 
 * @component ONCE
 * @layer 2
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 */

import { 
    CertificateRenewalSchedulerModel, 
    RenewalTask 
} from '../layer3/CertificateRenewalSchedulerModel.interface.js';
import { DomainConfigurationModel } from '../layer3/DomainConfigurationModel.interface.js';
import { DomainCertificateModel } from '../layer3/DomainCertificateModel.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';

// Re-export RenewalTask for convenience
export type { RenewalTask };

/**
 * Renewal callback type
 */
export type RenewalCallback = (task: RenewalTask, configuration: DomainConfigurationModel) => Promise<void>;

/**
 * CertificateRenewalScheduler
 * 
 * Monitors certificate expiry and triggers renewal callbacks.
 */
export class CertificateRenewalScheduler {
    public model: CertificateRenewalSchedulerModel;
    
    private checkIntervalHandle: ReturnType<typeof setInterval> | null;
    private renewalCallback: RenewalCallback | null;
    private configurations: Map<string, DomainConfigurationModel>;
    
    /**
     * Empty constructor - Web4 P6
     */
    constructor() {
        const now = new Date().toISOString();
        this.model = {
            uuid: '',
            name: 'CertificateRenewalScheduler',
            iorComponent: 'CertificateRenewalScheduler',
            iorVersion: '',  // Set by init() - NEVER hardcode!
            checkIntervalMs: 24 * 60 * 60 * 1000,  // Default: 24 hours
            isRunning: false,
            pendingTasks: [],
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
        this.checkIntervalHandle = null;
        this.renewalCallback = null;
        this.configurations = new Map();
    }
    
    /**
     * Initialize with scenario
     * Web4 P6: Empty constructor + init()
     */
    public init(scenario?: Scenario<CertificateRenewalSchedulerModel>): this {
        if (scenario?.model) {
            Object.assign(this.model, scenario.model);
        }
        return this;
    }
    
    /**
     * Set renewal callback
     * Web4 P16: renewalCallbackSet
     */
    public renewalCallbackSet(callback: RenewalCallback): this {
        this.renewalCallback = callback;
        return this;
    }
    
    /**
     * Register certificate for renewal monitoring
     * Web4 P16: certificateRegister
     */
    public certificateRegister(
        configuration: DomainConfigurationModel,
        certificate: DomainCertificateModel
    ): void {
        const renewBeforeDays = configuration.renewBeforeExpiryDays || 30;
        const expiresAt = new Date(certificate.expiresAt);
        const renewAt = new Date(expiresAt);
        renewAt.setDate(renewAt.getDate() - renewBeforeDays);
        
        const task: RenewalTask = {
            domain: configuration.domain,
            expiresAt: certificate.expiresAt,
            renewAt: renewAt.toISOString(),
            renewBeforeExpiryDays: renewBeforeDays
        };
        
        // Remove existing task for this domain
        this.model.pendingTasks = this.model.pendingTasks.filter(
            this.taskDomainFilter.bind(this, configuration.domain)
        );
        
        // Add new task
        this.model.pendingTasks.push(task);
        this.configurations.set(configuration.domain, configuration);
        
        this.model.statistics.updatedAt = new Date().toISOString();
        console.log(`[CertificateRenewalScheduler] Registered: ${configuration.domain} (renews at ${renewAt.toISOString()})`);
    }
    
    /**
     * Filter tasks by domain (for removal)
     * Web4 P4: Method for filter callback
     */
    private taskDomainFilter(domainToExclude: string, task: RenewalTask): boolean {
        return task.domain !== domainToExclude;
    }
    
    /**
     * Unregister certificate
     * Web4 P16: certificateUnregister
     */
    public certificateUnregister(domain: string): void {
        this.model.pendingTasks = this.model.pendingTasks.filter(
            this.taskDomainFilter.bind(this, domain)
        );
        this.configurations.delete(domain);
        this.model.statistics.updatedAt = new Date().toISOString();
        console.log(`[CertificateRenewalScheduler] Unregistered: ${domain}`);
    }
    
    /**
     * Start scheduler
     * Web4 P16: start
     */
    public start(): void {
        if (this.model.isRunning) {
            return;
        }
        
        this.checkIntervalHandle = setInterval(
            this.renewalCheck.bind(this),
            this.model.checkIntervalMs
        );
        
        this.model.isRunning = true;
        this.model.statistics.updatedAt = new Date().toISOString();
        console.log(`[CertificateRenewalScheduler] Started (interval: ${this.model.checkIntervalMs}ms)`);
        
        // Run initial check
        this.renewalCheck();
    }
    
    /**
     * Stop scheduler
     * Web4 P16: stop
     */
    public stop(): void {
        if (!this.model.isRunning) {
            return;
        }
        
        if (this.checkIntervalHandle) {
            clearInterval(this.checkIntervalHandle);
            this.checkIntervalHandle = null;
        }
        
        this.model.isRunning = false;
        this.model.statistics.updatedAt = new Date().toISOString();
        console.log('[CertificateRenewalScheduler] Stopped');
    }
    
    /**
     * Check for pending renewals
     * Web4 P4: Bound method for setInterval
     */
    private renewalCheck(): void {
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = new Date().toISOString();
        
        const now = new Date();
        const tasksToRenew: RenewalTask[] = [];
        
        for (const task of this.model.pendingTasks) {
            const renewAt = new Date(task.renewAt);
            if (now >= renewAt) {
                tasksToRenew.push(task);
            }
        }
        
        if (tasksToRenew.length > 0) {
            console.log(`[CertificateRenewalScheduler] Found ${tasksToRenew.length} certificates to renew`);
            
            for (const task of tasksToRenew) {
                this.renewalTrigger(task);
            }
        }
    }
    
    /**
     * Trigger renewal for a task
     * Web4 P4: Method, not arrow function
     */
    private renewalTrigger(task: RenewalTask): void {
        if (!this.renewalCallback) {
            console.warn(`[CertificateRenewalScheduler] No renewal callback set for: ${task.domain}`);
            return;
        }
        
        const configuration = this.configurations.get(task.domain);
        if (!configuration) {
            console.warn(`[CertificateRenewalScheduler] No configuration for: ${task.domain}`);
            return;
        }
        
        console.log(`[CertificateRenewalScheduler] Triggering renewal: ${task.domain}`);
        
        this.renewalCallback(task, configuration)
            .then(this.renewalSuccess.bind(this, task))
            .catch(this.renewalError.bind(this, task));
    }
    
    /**
     * Handle successful renewal
     * Web4 P4: Bound method for Promise.then
     */
    private renewalSuccess(task: RenewalTask): void {
        this.model.statistics.successCount++;
        this.model.statistics.updatedAt = new Date().toISOString();
        console.log(`[CertificateRenewalScheduler] Renewal complete: ${task.domain}`);
    }
    
    /**
     * Handle renewal error
     * Web4 P4: Bound method for Promise.catch
     */
    private renewalError(task: RenewalTask, error: Error): void {
        this.model.statistics.errorCount++;
        this.model.statistics.lastErrorAt = new Date().toISOString();
        console.error(`[CertificateRenewalScheduler] Renewal failed: ${task.domain} - ${error.message}`);
    }
    
    /**
     * Get pending tasks
     * Web4 P16: pendingTasksGet
     */
    public pendingTasksGet(): RenewalTask[] {
        return [...this.model.pendingTasks];
    }
    
    /**
     * Convert to scenario
     * 
     * DRY: Uses model.iorComponent and model.iorVersion
     */
    public async toScenario(): Promise<Scenario<CertificateRenewalSchedulerModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: this.model.iorComponent || 'CertificateRenewalScheduler',
                version: this.model.iorVersion || ''
            },
            owner: '',
            model: { ...this.model }
        };
    }
}

















