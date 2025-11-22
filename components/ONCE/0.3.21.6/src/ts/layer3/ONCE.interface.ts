/**
 * ONCE Interface - Core kernel interface for Object Network Communication Engine
 * Methods available in ALL environments (Browser, Node.js, Worker, PWA)
 * Enhanced with server hierarchy and scenario-based configuration
 * 
 * @layer3
 * @pattern Interface Contract
 * @pdca session/2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md
 */

import { LegacyONCEScenario } from './LegacyONCEScenario.interface.js';
import { Scenario } from './Scenario.interface.js';
import { Component } from './Component.js';
import { IOR } from './IOR.js';
import { LifecycleObserver } from './LifecycleObserver.interface.js';
import { ONCEServerModel } from './ONCEServerModel.interface.js';
import { EnvironmentInfo } from './EnvironmentInfo.interface.js';
import { ComponentQuery } from './ComponentQuery.interface.js';
import { PerformanceMetrics } from './PerformanceMetrics.interface.js';

/**
 * ONCE - Core kernel functionality for Web4 component system
 * (Renamed from ONCEDomain - this is the primary ONCE interface)
 */
export interface ONCE {
    /**
     * Initialize ONCE kernel with scenario
     * Web4 pattern: Objects initialize from scenarios, not constructors
     */
    init(scenario?: LegacyONCEScenario): Promise<ONCE>;

    /**
     * Start a component by loading and initializing it
     * @param componentIOR - Internet Object Reference to component
     * @param scenario - Initial scenario for component
     */
    startComponent(componentIOR: IOR, scenario?: LegacyONCEScenario): Promise<Component>;

    /**
     * Save component state as scenario
     * @param component - Component to hibernate
     * @returns Web4 Standard format scenario
     * 
     * ⚠️ **ARCHITECTURAL DEBT**: Async in Layer 2 (Implementation)
     * ⚠️ Web4 principle: "Only Layer 4 should be async"
     * @see session/2025-11-19-UTC-1545.refactor-async-to-layer4.pdca.md - Future migration plan
     * @pdca session/2025-11-19-UTC-1600.pragmatic-async-interface-fix.pdca.md
     */
    saveAsScenario(component: Component): Promise<Scenario<LegacyONCEScenario>>;

    /**
     * Load component from scenario
     * @param scenario - LegacyONCEScenario containing component state
     * @returns Restored component instance
     */
    loadScenario(scenario: LegacyONCEScenario): Promise<Component>;

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
     * @param scenario - LegacyONCEScenario to send
     */
    exchangeScenario(peerIOR: IOR, scenario: LegacyONCEScenario): Promise<void>;

    /**
     * Hibernate ONCE kernel state
     * @returns Complete kernel state as Web4 Standard scenario
     * 
     * ⚠️ **ARCHITECTURAL DEBT**: Async in Layer 2 (generates User scenario)
     * ⚠️ Web4 principle: "Only Layer 4 should be async"
     * ⚠️ Should be synchronous with pre-injected owner data
     * @see session/2025-11-19-UTC-1545.refactor-async-to-layer4.pdca.md - Future migration plan
     * @pdca session/2025-11-19-UTC-1600.pragmatic-async-interface-fix.pdca.md
     */
    toScenario(): Promise<Scenario<LegacyONCEScenario>>;

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
     */
    getServerModel(): ONCEServerModel;

    /**
     * Start server with automatic port management (42777 → 8080+)
     */
    startServer(scenario?: LegacyONCEScenario): Promise<void>;

    /**
     * Register with primary server if this is a client server
     */
    registerWithPrimaryServer(): Promise<void>;

    /**
     * Check if this instance is the primary server (port 42777)
     */
    isPrimaryServer(): boolean;

    /**
     * Get all registered server instances (only available on primary server)
     */
    getRegisteredServers(): ONCEServerModel[];
}

