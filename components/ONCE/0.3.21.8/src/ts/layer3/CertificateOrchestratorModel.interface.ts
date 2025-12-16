/**
 * CertificateOrchestratorModel.interface.ts
 * 
 * Model for CertificateOrchestrator.
 * 
 * @component ONCE
 * @layer 3
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 * Web4 P19: One file, one type
 * Web4 P8 (DRY): Uses StatisticsModel
 */

import { DomainConfigurationModel } from './DomainConfigurationModel.interface.js';
import { StatisticsModel } from './StatisticsModel.interface.js';

/**
 * CertificateOrchestratorModel
 * 
 * DRY: Uses StatisticsModel for operation tracking:
 * - successCount = renewals completed
 * - errorCount = renewal failures
 * - totalOperations = all orchestrator operations
 */
export interface CertificateOrchestratorModel {
    /** UUID for this orchestrator instance */
    uuid: string;
    
    /** Orchestrator name */
    name: string;
    
    /** IOR component name for toScenario() */
    iorComponent?: string;
    
    /** IOR version - NEVER hardcode! Set by init() */
    iorVersion?: string;
    
    /** Domain configurations managed by this orchestrator */
    domainConfigurations: DomainConfigurationModel[];
    
    /** Root path for scenarios */
    scenariosRootPath: string;
    
    /** Renewal check interval in milliseconds */
    renewalCheckIntervalMs: number;
    
    /** Days before expiry to trigger renewal */
    renewBeforeExpiryDays: number;
    
    /** Statistics - reuses StatisticsModel (DRY) */
    statistics: StatisticsModel;
}

















