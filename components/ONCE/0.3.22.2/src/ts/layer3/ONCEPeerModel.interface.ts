/**
 * ONCEPeerModel.interface.ts - Unified model for ALL ONCE peers
 * 
 * Occam's Razor: One model to rule them all.
 * Works for: Browser, Node.js, Worker, Service Worker
 * 
 * Replaces/consolidates:
 * - ONCEModel (deprecated)
 * - ONCEKernelModel (deprecated)
 * - ONCEServerModel (DELETED - migrated to ONCEPeerModel)
 * - BrowserOnceModel (migrated)
 * 
 * @layer3
 * @pattern Interface Contract
 * Web4 P19: One File One Type
 * @pdca session/2025-12-17-UTC-1750.browseronce-oncekernel-interface.pdca.md
 */

import type { Model } from './Model.interface.js';
import type { Reference } from './Reference.interface.js';
import type { EnvironmentInfo } from './EnvironmentInfo.interface.js';
import type { LifecycleState } from './LifecycleState.enum.js';
import type { Component } from './Component.interface.js';
import type { ServerCapability } from './ServerCapability.interface.js';

/**
 * ONCEPeerModel - Unified model for all ONCE peers
 * 
 * Every ONCE instance (browser, node, worker) is a "peer" in the network.
 * This model captures the essential state of any peer.
 */
export interface ONCEPeerModel extends Model {
    // === IDENTITY (from Model) ===
    // uuid: string;   // inherited
    // name: string;   // inherited
    
    // === VERSION ===
    /** Component version (e.g., "0.3.22.1") */
    version: string;
    
    // === ENVIRONMENT ===
    /** Environment information (browser, node, worker, etc.) */
    environment: EnvironmentInfo;
    
    // === LIFECYCLE ===
    /** Current lifecycle state */
    state: LifecycleState;
    
    /** When the peer started */
    startTime: Reference<Date>;
    
    /** When connected to primary (browser) or started listening (server) */
    connectionTime: Reference<Date>;
    
    /** 
     * When the peer was shutdown (ISO 8601 format)
     * Used for housekeeping: scenarios with shutdownTime > 24h can be cleaned up
     * @pdca 2026-01-02-UTC-1700.scenario-housekeeping-migration.pdca.md
     */
    shutdownTime?: string;
    
    // === NETWORK ===
    /** Fully qualified hostname (e.g., "McDonges-3.fritz.box") */
    host: string;
    
    /** Primary port number */
    port: number;
    
    /** Reverse internet domain (e.g., "local.once") - Node.js only */
    domain?: string;
    
    /** Extracted hostname - first part of FQDN (e.g., "McDonges-3") - Node.js only */
    hostname?: string;
    
    /** IP address (e.g., "127.0.0.1") - Node.js only */
    ip?: string;
    
    /** Is this the primary peer in the network? */
    isPrimary: boolean;
    
    /** UUID of the primary peer's scenario (for non-primary peers) */
    primaryPeerUuid: Reference<string>;
    
    // === P2P ===
    /** 
     * Connected peers
     * Note: Currently stores Scenario<ONCEPeerModel>[] for backwards compatibility
     * with WebSocket scenario exchange. Future versions should normalize to ONCEPeerModel[]
     */
    peers: any[];
    
    // === COMPONENTS ===
    /** Registered components (component IOR → Component instance) */
    components?: Map<string, Component>;
    
    // === BROWSER-ONLY (optional) ===
    /** WebSocket connection to primary peer */
    ws?: Reference<WebSocket>;
    
    /** Is currently connected to network? (Browser) */
    isConnected?: boolean;
    
    /** 
     * @deprecated Use host instead
     * Alias for backwards compatibility 
     */
    peerHost?: string;
    
    /** 
     * @deprecated Use uuid instead
     * Peer UUID as discovered from server (Browser)
     */
    peerUUID?: Reference<string>;
    
    /**
     * @deprecated Use version instead
     * Server version as discovered (Browser)
     */
    peerVersion?: string;
    
    /**
     * Primary peer connection info (Browser)
     * @deprecated Use primaryPeerUuid to reference full ONCEPeerModel
     */
    primaryPeer?: Reference<{
        host: string;
        port: number;
        uuid: string;
    }>;
    
    // === NODE-ONLY (optional) ===
    /** Process ID (Node.js only) */
    pid?: number;
    
    /** Server capabilities with assigned ports (Node.js only) */
    capabilities?: ServerCapability[];
    
    // ═══════════════════════════════════════════════════════════════
    // BACKWARD COMPATIBILITY (deprecated, will be removed)
    // @pdca 2026-01-04-UTC-1121.model-consolidation-dry-cleanup.pdca.md MC.1
    // These properties are for gradual migration from ONCEModel
    // Path properties should come from CLI accessor (MC.2.6)
    // ═══════════════════════════════════════════════════════════════
    
    // --- PATH PROPERTIES (migrate to CLI accessor) ---
    /** @deprecated Use CLI accessor: this.projectRoot instead of this.model.projectRoot */
    projectRoot?: string;
    /** @deprecated Use CLI accessor: this.componentRoot */
    componentRoot?: string;
    /** @deprecated Use CLI accessor */
    targetDirectory?: string;
    /** @deprecated Use CLI accessor */
    targetComponentRoot?: string;
    /** @deprecated Use CLI accessor: this.componentsDirectory */
    componentsDirectory?: string;
    /** @deprecated Use CLI accessor: this.testDataDirectory */
    testDataDirectory?: string;
    /** @deprecated Derive from projectRoot containing '/test/data/' */
    isTestIsolation?: boolean;
    
    // --- DISPLAY PROPERTIES (CLI context) ---
    /** @deprecated Use name property */
    component?: string;
    /** @deprecated Compute from context */
    displayName?: string;
    /** @deprecated Compute from context */
    displayVersion?: string;
    /** @deprecated Check context !== null */
    isDelegation?: boolean;
    /** @deprecated Compute from context */
    delegationInfo?: string;
    /** @deprecated */
    testIsolationContext?: string;
    /** @deprecated Will be removed */
    context?: any;
    
    // --- LIFECYCLE PROPERTIES ---
    /** @deprecated Use state === LifecycleState.RUNNING */
    initialized?: boolean;
    /** @deprecated Compute from startTime */
    initializationTime?: number;
    /** @deprecated Use toScenario() instead */
    scenario?: any;
    /** @deprecated ONCEPeerModel IS the server model */
    serverModel?: ONCEPeerModel;
    
    // --- EVENT HANDLING (migrate to LifecycleObserver pattern) ---
    /** @deprecated Use RelatedObjects to get LifecycleObserver instances */
    observers?: import('./LifecycleObserver.interface.js').LifecycleObserver[];
    /** @deprecated Use observers instead */
    eventHandlers?: Map<any, any>;
    
    // --- MESSAGE TRACKING (deprecated protocol-based messaging) ---
    /** @deprecated Protocol-based messaging violates Web4 protocol-less communication */
    messageTracker?: {
        sent: any[];
        received: any[];
        acknowledged: string[];
        patterns: { broadcast: number; relay: number; p2p: number; };
    };
}

