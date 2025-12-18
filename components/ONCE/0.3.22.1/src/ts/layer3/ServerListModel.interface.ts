/**
 * Server List Model - All registered servers data
 * ✅ PROTOCOL-LESS: Returns scenarios (not models)
 * @layer3
 * @pattern Interface Contract
 * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
 * @pdca 2025-11-22-UTC-1500.iteration-01.6.4b-protocol-less-registry.pdca.md
 * @pdca 2025-12-17-UTC-1830.model-consolidation.pdca.md - MC.3
 */

import type { ONCEServerModel } from './ONCEServerModel.interface.js';
import type { Scenario } from './Scenario.interface.js';
import type { ONCEPeerModel } from './ONCEPeerModel.interface.js';

/**
 * Server List Model - Registry of all servers
 * Used by DefaultONCE.getServers() method (Primary only)
 */
export interface ServerListModel {
    /** Is this the primary server? */
    primary: boolean;
    
    /** Primary server model (full details) */
    primaryServer: ONCEServerModel;
    
    /** All registered client servers (as scenarios for protocol-less communication) */
    servers: Scenario<ONCEPeerModel>[];
}

