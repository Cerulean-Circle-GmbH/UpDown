/**
 * ONCEPeerModel.interface.ts - Unified model for ALL ONCE peers
 * 
 * Occam's Razor: One model to rule them all.
 * Works for: Browser, Node.js, Worker, Service Worker
 * 
 * Replaces/consolidates:
 * - ONCEModel (deprecated)
 * - ONCEKernelModel (deprecated)
 * - ONCEServerModel (kept as subset for server-specific data)
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
}

