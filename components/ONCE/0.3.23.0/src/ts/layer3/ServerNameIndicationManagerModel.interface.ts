/**
 * ServerNameIndicationManagerModel.interface.ts
 * 
 * Model for ServerNameIndicationManager.
 * 
 * @component ONCE
 * @layer 3
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 * Web4 P19: One file, one type
 * Web4 P8 (DRY): Reuses StatisticsModel
 */

import { StatisticsModel } from './StatisticsModel.interface.js';

/**
 * ServerNameIndicationManagerModel - Model for Server Name Indication manager
 * 
 * DRY: Uses StatisticsModel for operation tracking:
 * - successCount = context switches (matched domain)
 * - errorCount = fallbacks to default
 * - totalOperations = all SNI lookups
 */
export interface ServerNameIndicationManagerModel {
    /** UUID for this manager instance */
    uuid: string;
    
    /** Manager name */
    name: string;
    
    /** IOR component name for toScenario() */
    iorComponent?: string;
    
    /** IOR version for toScenario() - NEVER hardcode! */
    iorVersion?: string;
    
    /** List of configured domains */
    configuredDomains: string[];
    
    /** Default domain (fallback) */
    defaultDomain: string;
    
    /** Statistics - reuses StatisticsModel (DRY) */
    statistics: StatisticsModel;
}
