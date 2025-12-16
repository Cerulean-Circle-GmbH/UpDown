/**
 * CertificateProviderModel.interface.ts
 * 
 * Base model for certificate providers.
 * 
 * Web4 P28: JsInterface Pattern - LetsEncryptCertificateProvider,
 * ManualCertificateProvider extend this base.
 * 
 * @component ONCE
 * @layer 3
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 * Web4 P19: One file, one type
 * Web4 P8 (DRY): Reuses StatisticsModel
 */

import { StatisticsModel } from './StatisticsModel.interface.js';

/**
 * CertificateProviderModel - Base model for certificate providers
 * 
 * DRY: Uses StatisticsModel for operation tracking:
 * - successCount = certificates issued + renewed
 * - errorCount = certificates failed
 * - totalOperations = all certificate operations
 */
export interface CertificateProviderModel {
    /** Provider UUID */
    uuid: string;
    
    /** Provider name */
    name: string;
    
    /** Provider type (class name - JsInterface) */
    providerType: string;
    
    /** Scenarios root path for certificate storage */
    scenariosRootPath: string;
    
    /** Statistics - reuses StatisticsModel (DRY) */
    statistics: StatisticsModel;
}

















