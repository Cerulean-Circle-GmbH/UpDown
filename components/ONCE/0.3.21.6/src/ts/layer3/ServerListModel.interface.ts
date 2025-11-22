/**
 * Server List Model - All registered servers data
 * @layer3
 * @pattern Interface Contract
 * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
 */

import type { ONCEServerModel } from './ONCEServerModel.interface.js';

/**
 * Server List Model - Registry of all servers
 * Used by DefaultONCE.getServers() method (Primary only)
 */
export interface ServerListModel {
    /** Is this the primary server? */
    primary: boolean;
    
    /** Primary server model (full details) */
    primaryServer: ONCEServerModel;
    
    /** All registered client servers */
    servers: ONCEServerModel[];
}

