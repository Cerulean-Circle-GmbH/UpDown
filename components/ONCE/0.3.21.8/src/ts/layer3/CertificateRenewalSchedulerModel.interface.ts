/**
 * CertificateRenewalSchedulerModel.interface.ts
 * 
 * Model for CertificateRenewalScheduler.
 * 
 * @component ONCE
 * @layer 3
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 * Web4 P19: One file, one type
 * Web4 P8 (DRY): Uses StatisticsModel
 */

import { StatisticsModel } from './StatisticsModel.interface.js';

/**
 * RenewalTask - A scheduled certificate renewal
 */
export interface RenewalTask {
    /** Domain to renew */
    domain: string;
    
    /** Certificate expiry date */
    expiresAt: string;
    
    /** Scheduled renewal date */
    renewAt: string;
    
    /** Days before expiry to renew */
    renewBeforeExpiryDays: number;
}

/**
 * CertificateRenewalSchedulerModel
 * 
 * DRY: Uses StatisticsModel for operation tracking:
 * - successCount = successful renewals
 * - errorCount = failed renewals
 * - totalOperations = all renewal checks
 */
export interface CertificateRenewalSchedulerModel {
    /** UUID for this scheduler instance */
    uuid: string;
    
    /** Scheduler name */
    name: string;
    
    /** IOR component name for toScenario() */
    iorComponent?: string;
    
    /** IOR version - NEVER hardcode! Set by init() */
    iorVersion?: string;
    
    /** Check interval in milliseconds */
    checkIntervalMs: number;
    
    /** Is scheduler running? */
    isRunning: boolean;
    
    /** Pending renewal tasks */
    pendingTasks: RenewalTask[];
    
    /** Statistics - reuses StatisticsModel (DRY) */
    statistics: StatisticsModel;
}







