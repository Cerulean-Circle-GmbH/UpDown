/**
 * DomainCertificateStoreModel.interface.ts
 * 
 * Model for DomainCertificateStore.
 * 
 * @component ONCE
 * @layer 3
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 * Web4 P19: One file, one type
 * Web4 P8 (DRY): Uses StatisticsModel
 */

import { StatisticsModel } from './StatisticsModel.interface.js';

/**
 * DomainCertificateStoreModel
 * 
 * Model for certificate persistence to scenario hierarchy.
 */
export interface DomainCertificateStoreModel {
    /** UUID for this store instance */
    uuid: string;
    
    /** Store name */
    name: string;
    
    /** IOR component name for toScenario() */
    iorComponent?: string;
    
    /** IOR version - NEVER hardcode! Set by init() */
    iorVersion?: string;
    
    /** Root path for scenarios (e.g., scenarios/domain/box/...) */
    scenariosRootPath: string;
    
    /** Provider name (e.g., 'LetsEncryptCertificateProvider') */
    providerName: string;
    
    /** Provider version - derived from iorVersion */
    providerVersion: string;
    
    /** Statistics - reuses StatisticsModel (DRY) */
    statistics: StatisticsModel;
}









