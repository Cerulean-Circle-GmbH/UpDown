/**
 * ONCE Interface - Core kernel interface for Object Network Communication Engine
 * Methods available in ALL environments (Browser, Node.js, Worker, PWA)
 * Enhanced with server hierarchy and scenario-based configuration
 * 
 * @layer3
 * @pattern Interface Contract
 * @pdca session/2025-12-17-UTC-1750.browseronce-oncekernel-interface.pdca.md
 */

import { Scenario } from './Scenario.interface.js';
import { Component } from './Component.interface.js';
import type { IOR } from '../layer4/IOR.js';
import { LifecycleObserver } from './LifecycleObserver.interface.js';
import { ONCEPeerModel } from './ONCEPeerModel.interface.js';
import { EnvironmentInfo } from './EnvironmentInfo.interface.js';
import { ComponentQuery } from './ComponentQuery.interface.js';
import { PerformanceMetrics } from './PerformanceMetrics.interface.js';

// ONCEServerModel removed - using ONCEPeerModel (MC.1 complete)

/**
 * ONCE - Core kernel functionality for Web4 component system
 * (Renamed from ONCEDomain - this is the primary ONCE interface)
 */
export interface ONCE {
    /**
     * Initialize ONCE kernel with scenario (SYNC — Web4 P6)
     * Web4 pattern: Objects initialize from scenarios, not constructors
     * @pdca 2026-01-04-UTC-1630.cli-path-authority-full-migration.pdca.md CPA.4
     */
    init(scenario?: Scenario<ONCEPeerModel>): this;
    
    /**
     * Async initialization — contains async logic moved out of init()
     * Per Web4 P7: async logic belongs in Layer 4 or separate async method
     * @pdca 2026-01-04-UTC-1630.cli-path-authority-full-migration.pdca.md CPA.4
     */
    initAsync(scenario?: Scenario<ONCEPeerModel>): Promise<ONCE>;

    /**
     * Start a component by loading and initializing it
     * @param componentIOR - Internet Object Reference to component
     * @param scenario - Initial scenario for component
     */
    startComponent(componentIOR: IOR, scenario?: Scenario<ONCEPeerModel>): Promise<Component>;

    /**
     * Save component state as scenario
     * @param component - Component to hibernate
     * @returns Web4 Standard format scenario
     * 
     * ✅ **RESOLVED**: Async implementations moved to Layer 4 (Orchestrators)
     * @see session/2025-12-17-UTC-1613.web4-principles-review.pdca.md - Decision 1c
     */
    saveAsScenario(component: Component): Promise<Scenario<ONCEPeerModel>>;

    /**
     * Load component from scenario
     * @param scenario - Scenario containing component state
     * @returns Restored component instance
     */
    loadScenario(scenario: Scenario<ONCEPeerModel>): Promise<Component>;

    /**
     * Get current environment information
     * Detects: Browser, Node.js, Worker, ServiceWorker, PWA, iframe
     */
    getEnvironment(): EnvironmentInfo;

    /**
     * Register component for discovery
     * @param component - Component to register
     * @param ior - Internet Object Reference for component
     */
    registerComponent(component: Component, ior: IOR): Promise<void>;

    /**
     * Discover components in the network
     * @param query - Discovery query parameters
     */
    discoverComponents(query?: ComponentQuery): Promise<IOR[]>;

    /**
     * Enable P2P communication with other ONCE kernels
     * @param peerIOR - IOR of peer ONCE kernel
     */
    connectPeer(peerIOR: IOR): Promise<void>;

    /**
     * Exchange scenarios with peer
     * @param peerIOR - Target peer
     * @param scenario - Scenario to send
     */
    exchangeScenario(peerIOR: IOR, scenario: Scenario<ONCEPeerModel>): Promise<void>;

    /**
     * Hibernate ONCE kernel state
     * @returns Complete kernel state as Web4 Standard scenario
     * 
     * ✅ **RESOLVED**: Now sync per Web4 Principle (UcpComponent.toScenario())
     * @pdca 2026-01-04-UTC-1800.scenario-only-init-violations.pdca.md SOI.1
     */
    toScenario(): Scenario<ONCEPeerModel>;

    /**
     * Check if ONCE is initialized
     */
    isInitialized(): boolean;

    /**
     * Get ONCE kernel version
     */
    getVersion(): string;

    /**
     * Get performance metrics
     */
    getMetrics(): PerformanceMetrics;

    /**
     * Register lifecycle observer
     * @param observer - Lifecycle observer to attach
     */
    attachObserver(observer: LifecycleObserver): void;

    /**
     * Remove lifecycle observer
     * @param observer - Lifecycle observer to detach
     */
    detachObserver(observer: LifecycleObserver): void;

    /**
     * Pause a running component
     * @param component - Component to pause
     */
    pauseComponent(component: Component): Promise<void>;

    /**
     * Resume a paused component
     * @param component - Component to resume
     */
    resumeComponent(component: Component): Promise<void>;

    /**
     * Stop a component
     * @param component - Component to stop
     */
    stopComponent(component: Component): Promise<void>;

    // New in v0.2.0.0: Server hierarchy methods

    /**
     * Get current server model with all server instance information
     * @deprecated Use getPeerModel() for unified access
     * @web4 Returns ONCEPeerModel (unified model)
     */
    getServerModel(): ONCEPeerModel;

    /**
     * Start server with automatic port management (42777 → 8080+)
     */
    startServer(scenario?: Scenario<ONCEPeerModel>): Promise<void>;

    /**
     * Register with primary server if this is a client server
     */
    registerWithPrimaryServer(): Promise<void>;

    /**
     * Check if this instance is the primary server (port 42777)
     * @web4 Renamed from isPrimaryServer() to isPrimary() for ONCEPeerModel consistency
     */
    isPrimary(): boolean;

    /**
     * Get all registered peer instances (only available on primary peer)
     * @deprecated Use getPeerModel().peers instead
     */
    getRegisteredServers(): ONCEPeerModel[];
    
    /**
     * Get unified peer model
     * Replaces getServerModel() for unified Browser/Node access
     */
    getPeerModel(): ONCEPeerModel;
}

/**
 * ONCEKernel - Type alias for ONCE interface
 * Used by AbstractONCEKernel and unified architecture
 * 
 * @pdca session/2025-11-22-UTC-2200.iteration-01.8-unified-kernel-architecture.pdca.md
 */
export type ONCEKernel = ONCE;

// Re-export commonly used types
export type { EnvironmentInfo, ComponentQuery, PerformanceMetrics };

