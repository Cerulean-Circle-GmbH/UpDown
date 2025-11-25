/**
 * DefaultONCE v0.3.21.6 - Node.js ONCE Kernel Implementation
 * Extended from AbstractONCEKernel for unified architecture
 * Domain logic preserved: peer hierarchy, scenario management, lifecycle events
 * 
 * @pdca session/2025-11-22-UTC-2200.iteration-01.8-unified-kernel-architecture.pdca.md
 */

import { AbstractONCEKernel } from './AbstractONCEKernel.js';
import type { ONCEKernel } from '../layer3/ONCE.interface.js';
import type { ONCE as ONCEInterface } from '../layer3/ONCE.interface.js';
import type { EnvironmentInfo } from '../layer3/EnvironmentInfo.interface.js';
import type { ComponentQuery } from '../layer3/ComponentQuery.interface.js';
import type { PerformanceMetrics } from '../layer3/PerformanceMetrics.interface.js';
import { LegacyONCEScenario } from '../layer3/LegacyONCEScenario.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { Component } from '../layer3/Component.interface.js';
import { IOR } from '../layer3/IOR.js';
import { LifecycleEventType, LifecycleState } from '../layer3/LifecycleEvents.js';
import { LifecycleObserver } from '../layer3/LifecycleObserver.interface.js';
// ⚠️ DEPRECATED imports (functional pattern, will be removed):
type LifecycleEventHandler = (event: any) => void | Promise<void>;
type LifecycleHooks = Record<string, LifecycleEventHandler>;
import { ONCEServerModel } from '../layer3/ONCEServerModel.interface.js';
import { ServerHierarchyManager } from './ServerHierarchyManager.js';
import { ScenarioManager } from './ScenarioManager.js';
import { ONCEModel } from '../layer3/ONCEModel.interface.js';
import { User } from '../layer3/User.interface.js';
import { MethodSignature } from '../layer3/MethodSignature.interface.js';
import { DefaultUser } from './DefaultUser.js';
import { NodeOSInfrastructure } from '../layer1/NodeOSInfrastructure.js';
import * as path from 'path';  // For version extraction from directory path
import * as crypto from 'crypto';  // For UUID generation
import { realpathSync } from 'fs';  // For symlink resolution

/**
 * DefaultONCE v0.3.21.6 - Node.js Peer Kernel
 * 
 * ✅ Extends AbstractONCEKernel (unified architecture)
 * ✅ Empty constructor (Radical OOP)
 * ✅ Model-driven state
 * ✅ Peer hierarchy and scenario management
 * ✅ IOR-based method invocation
 */
export class DefaultONCE extends AbstractONCEKernel implements ONCEInterface {
  // Override model with specific type
  protected model: ONCEModel;
  private web4ts?: any; // Lazy-initialized Web4TSComponent for delegation (dynamic import, no static dependency)
  private user?: User; // Optional User service (lazy initialization)
  private methods: Map<string, MethodSignature> = new Map();
  
  // Enhanced managers for v0.2.0.0+ domain logic
  private serverHierarchyManager: ServerHierarchyManager;
  private scenarioManager: ScenarioManager;

  /**
   * ✅ Extends AbstractONCEKernel (unified architecture v0.3.21.6)
   * Constructor has minimal initialization for backward compatibility
   * Full refactoring to empty constructor + init() pattern in future iteration
   * 
   * @pdca session/2025-11-22-UTC-2200.iteration-01.8-unified-kernel-architecture.pdca.md
   */
  constructor() {
    super(); // AbstractONCEKernel (unified architecture)
    
    // ✅ Web4 Pattern: Minimal constructor
    
    // Minimal model initialization
    this.model = {
      uuid: crypto.randomUUID(),
      name: '',
      origin: '',
      definition: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      component: 'ONCE',
      version: '0.0.0.0',     // Will be discovered in discoverPathsFromFilesystem()
      initialized: false,
      initializationTime: 0,
      eventHandlers: new Map(),
      // Paths discovered in discoverPathsFromFilesystem()
      componentRoot: '',
      projectRoot: '',
      targetDirectory: '',
      targetComponentRoot: '',
      isTestIsolation: false,
      // Primary Server IOR with Failover (configurable via environment)
      // @pdca 2025-11-22-UTC-1430.iteration-01.6.4a-ior-failover.pdca.md
      // Default: localhost for development
      // Production: Set ONCE_PRIMARY_IOR environment variable
      // Example multi-region: 'ior:https://primary.once.network:42777,europe:42778,asia:42779/ONCE/0.3.21.6/registry-uuid'
      primaryServerIor: process.env.ONCE_PRIMARY_IOR || 'ior:https://localhost:42777/ONCE/0.0.0.0/primary-server-uuid'
    };
    
    // ✅ Synchronous path discovery (needed for CLI to work)
    this.discoverPathsFromFilesystem();
    
    // Initialize managers (domain logic from 0.2.0.0)
    this.serverHierarchyManager = new ServerHierarchyManager();
    this.serverHierarchyManager.component = this; // Backward link for path authority
    this.scenarioManager = new ScenarioManager();
    this.scenarioManager.component = this; // Backward link for path authority
    
    // Discover methods for CLI (must be called in constructor for CLI to work)
    this.discoverMethods();
  }

  /**
   * ✅ Static factory method - Web4 Component Pattern
   * Creates ONCE instance and registers as global singleton
   * @param scenario Optional scenario for initialization
   * @returns ONCE instance registered globally
   * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md - Phase 2
   */
  static start(scenario?: any): DefaultONCE {
    // Create instance
    const once = new DefaultONCE();
    
    // Initialize with scenario if provided
    if (scenario) {
      once.init(scenario);
    }
    
    // Register as global singleton
    once.registerGlobalSingleton();
    
    return once;
  }

  /**
   * Register ONCE as global singleton in all environments
   * - Browser: window.global.ONCE
   * - Node.js: global.ONCE
   * - Workers/PWA: self.global.ONCE
   * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md - Phase 2
   * @cliHide
   */
  private registerGlobalSingleton(): void {
    try {
      // Detect environment and register appropriately
      if (typeof window !== 'undefined') {
        // Browser environment
        if (!window.global) {
          (window as any).global = {};
        }
        window.global!.ONCE = this;
        console.log('🌐 ONCE registered as window.global.ONCE');
      } else if (typeof global !== 'undefined') {
        // Node.js environment
        (global as any).ONCE = this;
        console.log('🌐 ONCE registered as global.ONCE');
      } else if (typeof self !== 'undefined') {
        // Worker/PWA environment
        if (!(self as any).global) {
          (self as any).global = {};
        }
        (self as any).global.ONCE = this;
        console.log('🌐 ONCE registered as self.global.ONCE');
      }
    } catch (error) {
      console.warn('⚠️ Failed to register global singleton:', error);
    }
  }

  /**
   * ✅ Synchronous path discovery - called in constructor
   * Discovers componentRoot and version from import.meta.url (with realpathSync)
   * @pdca 2025-11-21-UTC-1630.test-isolation-path-violation.pdca.md
   * @cliHide
   */
  private discoverPathsFromFilesystem(): void {
    try {
      const currentFilePath = path.dirname(new URL(import.meta.url).pathname);
      const currentVersionDir = realpathSync(path.resolve(currentFilePath, '..', '..', '..'));
      const componentDirName = path.basename(currentVersionDir);
      const isVersionDir = /^\d+\.\d+\.\d+\.\d+$/.test(componentDirName);
      
      const versionString = isVersionDir ? componentDirName : '0.0.0.0';
      
      // Set component's own discovered paths
      this.model.componentRoot = currentVersionDir;
      this.model.version = versionString;
    } catch (error) {
      // Fallback: if path discovery fails, keep defaults
      console.warn('⚠️ Path discovery failed, using defaults:', error);
    }
  }

  /**
   * ✅ TRUE Radical OOP: Check if method exists (Component interface)
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md
   * @cliHide
   */
  hasMethod(name: string): boolean {
    return this.methods.has(name);
  }
  
  /**
   * ✅ TRUE Radical OOP: Get method signature (Component interface)
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md
   * @cliHide
   */
  getMethodSignature(name: string): MethodSignature | null {
    return this.methods.get(name) || null;
  }
  
  /**
   * ✅ TRUE Radical OOP: List all method names (Component interface)
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md
   * @cliHide
   */
  listMethods(): string[] {
    return Array.from(this.methods.keys());
  }

  /**
   * ✅ TRUE Radical OOP: Discover public methods for CLI completion
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md
   * @cliHide
   */
  private discoverMethods(): void {
    const prototype = Object.getPrototypeOf(this);
    const methodNames = Object.getOwnPropertyNames(prototype)
      .filter((name) => typeof prototype[name] === "function")
      .filter((name) => !name.startsWith("_") && name !== "constructor")
      .filter((name) => !["init", "toScenario", "hasMethod", "getMethodSignature", "listMethods", "discoverMethods"].includes(name));

    for (const methodName of methodNames) {
      const method = prototype[methodName];
      this.methods.set(methodName, {
        name: methodName,
        paramCount: method.length,
        isAsync: method.constructor.name === "AsyncFunction",
      });
    }
  }

  /**
   * ✅ TRUE Radical OOP: Lazy initialization of User service for owner data generation
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md
   * @cliHide
   */
  private async getUser(): Promise<User> {
    if (this.user) return this.user;
    
    try {
      // Dynamic ESM import - fails gracefully if User not available
      // @ts-ignore - Optional dependency, path resolved at runtime
      const userModule = await import('../../User/latest/dist/ts/layer2/DefaultUser.js');
      const { DefaultUser } = userModule;
      
      // Initialize User with empty constructor (uses system/localhost defaults)
      this.user = new DefaultUser();
      
      return this.user!;
    } catch (error) {
      throw new Error('User service not available');
    }
  }

  /**
   * ✅ TRUE Radical OOP: Lazy initialization of Web4TSComponent for delegation (DRY principle)
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md
   * @cliHide
   */
  private async getWeb4TSComponent(): Promise<any> {
    if (this.web4ts) return this.web4ts;

    const path = await import('path');
    const componentRoot = path.resolve(
      path.dirname(new URL(import.meta.url).pathname),
      '../../..'
    );

    // Web4 Principle: Detect project root correctly for test isolation
    const componentsDir = path.dirname(path.dirname(componentRoot));
    const projectRoot = path.dirname(componentsDir);
    
    // Web4 Principle: Detect test isolation from model paths, NOT environment variables
    const isTestIsolation = projectRoot.includes('/test/data');
    
    // Set THIS component's paths for delegation
    this.model.componentRoot = componentRoot;
    this.model.projectRoot = projectRoot;
    this.model.targetDirectory = projectRoot;
    this.model.targetComponentRoot = componentRoot;
    this.model.isTestIsolation = isTestIsolation;

    // Import Web4TSComponent dynamically
    const web4tscomponentModule = await import(
      `${projectRoot}/components/Web4TSComponent/latest/dist/ts/layer2/DefaultWeb4TSComponent.js`
    );
    const { DefaultWeb4TSComponent } = web4tscomponentModule;

    // ✅ CRITICAL: Initialize Web4TSComponent for delegation
    // ✅ Single Source of Truth: Let Web4TSComponent discover its OWN version
    // @pdca 2025-11-21-UTC-1600.version-discovery-symlink-resolution.pdca.md
    this.web4ts = new DefaultWeb4TSComponent().init({
      model: {
        componentRoot: componentRoot,
        projectRoot: projectRoot,
        targetDirectory: projectRoot
      }
    });

    return this.web4ts;
  }

  /**
   * ✅ TRUE Radical OOP: DRY helper for delegating methods to Web4TSComponent with correct context
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md
   * @cliHide
   */
  private async delegateToWeb4TS<T extends (...args: any[]) => any>(
    method: string,
    ...args: Parameters<T>
  ): Promise<this> {
    const web4ts = await this.getWeb4TSComponent();
    web4ts.model.context = this;
    
    // ✅ RADICAL OOP: Set display properties in Web4TSComponent's model
    web4ts.model.displayName = this.model.component;
    web4ts.model.displayVersion = this.model.version || '0.0.0.0';
    web4ts.model.isDelegation = true;
    web4ts.model.delegationInfo = `via Web4TSComponent v${web4ts.model.version.toString()}`;
    
    // ✅ CRITICAL: Set component name and paths for infrastructure methods
    // These are needed by test(), build(), and other delegated methods
    web4ts.model.component = this.model.component;
    web4ts.model.version = this.model.version;
    web4ts.model.componentRoot = this.model.componentRoot;
    web4ts.model.targetComponentRoot = this.model.componentRoot;
    web4ts.model.projectRoot = this.model.projectRoot;
    
    // Test isolation context (if applicable)
    if (this.model.isTestIsolation && this.model.projectRoot) {
      const match = this.model.projectRoot.match(/components\/([^/]+)\/([^/]+)\/test\/data/);
      if (match) {
        web4ts.model.testIsolationContext = `${match[1]} v${match[2]}`;
      } else {
        web4ts.model.testIsolationContext = 'test/data environment';
      }
    }
    
    await (web4ts as any)[method](...args);
    return this;
  }

  /**
   * ✅ TRUE Radical OOP: getTarget() - Centralize delegation logic (DRY)
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md
   * @cliHide
   */
  private getTarget(): this {
    return this.model.context || this;
  }

  /**
   * ✅ TRUE Radical OOP: updateModelPaths() - Calculate ALL paths ONCE at init()
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md
   * @cliHide
   */
  private async updateModelPaths(): Promise<void> {
    // Defensive check: Only proceed if componentRoot is available
    if (!this.model.componentRoot) return;

    const path = await import('path');
    
    // Calculate display properties
    this.model.displayName = this.model.component;
    this.model.displayVersion = this.model.version;
    this.model.isDelegation = !!this.model.context;
    
    if (this.model.context) {
      this.model.delegationInfo = `via ${this.model.context.model?.component || 'Component'}`;
    }
    
    // Calculate test isolation context
    if (this.model.isTestIsolation && this.model.componentRoot) {
      const match = this.model.componentRoot.match(/components\/([^/]+)\/([^/]+)/);
      if (match) {
        this.model.testIsolationContext = `${match[1]} v${match[2]}`;
      }
    }
    
    // Calculate components directory
    if (this.model.componentRoot) {
      this.model.componentsDirectory = path.dirname(path.dirname(this.model.componentRoot));
    }
  }

  /**
   * ✅ TRUE Radical OOP: init() - Scenario-based initialization + updateModelPaths()
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md - CLI infrastructure from 0.3.20.0
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md - Domain logic from 0.2.0.0
   * @pdca 2025-11-21-UTC-1630.test-isolation-path-violation.pdca.md - Paths already discovered in constructor
   * @cliHide
   */
  async init(scenario?: Scenario<any> | LegacyONCEScenario): Promise<DefaultONCE> {
    // Paths already discovered in constructor via _discoverPaths()
    
    // Process scenario (may override paths from CLI)
    if (scenario && typeof scenario === 'object' && 'model' in scenario) {
      // Web4TSComponent-style scenario with model property
      const web4Scenario = scenario as any;
      if (web4Scenario.model) {
        console.log(`🔍 [PATH] DefaultONCE.init() BEFORE: projectRoot=${this.model.projectRoot} componentRoot=${this.model.componentRoot}`);
        this.model = { ...this.model, ...web4Scenario.model };
        console.log(`🔍 [PATH] DefaultONCE.init() AFTER: projectRoot=${this.model.projectRoot} componentRoot=${this.model.componentRoot} isTestIsolation=${this.model.isTestIsolation}`);
      }
    } else if (scenario) {
      // ONCE-style scenario from v0.2.0.0 (legacy format)
      this.model.scenario = scenario as LegacyONCEScenario;
    }
    
    // Discover methods for CLI completion (redundant if called in constructor, but safe)
    this.discoverMethods();
    
    // Update model paths (TRUE Radical OOP)
    await this.updateModelPaths();

    // Initialize ONCE kernel if scenario provided (domain logic from 0.2.0.0)
    if (this.model.scenario && !this.model.initialized) {
      const startTime = Date.now();
      console.log('🚀 Initializing ONCE v0.3.20.0...');

      try {
        console.log(`📂 Loading from scenario: ${this.model.scenario.uuid}`);
        
        // Wrap legacy scenario in Web4 format for loadFromScenario
        const web4Scenario: Scenario<LegacyONCEScenario> = {
          ior: {
            uuid: this.model.scenario.uuid,
            component: this.model.scenario.objectType,
            version: this.model.scenario.version
          },
          owner: '', // Empty for legacy scenarios
          model: this.model.scenario
        };
        
        await this.loadFromScenario(web4Scenario);

        this.model.initialized = true;
        this.model.initializationTime = Date.now() - startTime;

        // Emit after-init event
        await this.emitEvent(LifecycleEventType.AFTER_INIT, {
          initializationTime: this.model.initializationTime
        });

        console.log(`✅ ONCE v0.3.20.0 initialized in ${this.model.initializationTime}ms`);
      } catch (error) {
        console.error('❌ ONCE initialization failed:', error);
        await this.emitEvent(LifecycleEventType.ERROR, { error });
        throw error;
      }
    }
    
    return this;
  }

  /**
   * ✅ TRUE Radical OOP: toScenario() - Return Web4 Standard format wrapping legacy
   * ✅ Uses insourced DefaultUser for owner generation
   * ✅ Async to support User.toScenario()
   * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
   * @cliHide
   */
  async toScenario(): Promise<Scenario<LegacyONCEScenario>> {
    // 1️⃣ Generate legacy scenario (current format)
    const legacyScenario: LegacyONCEScenario = this.createCurrentScenario();
    
    // 2️⃣ Generate owner using insourced DefaultUser (Web4 pattern)
    let ownerData: string;
    try {
      const infrastructure = new NodeOSInfrastructure();
      await infrastructure.init();
      const env = await infrastructure.detectEnvironment();
      const username = 'system';  // ✅ Fallback - no process.env in production code
      
      // ✅ Pass projectRoot to ensure User saves in correct location
      const projectRoot = this.serverHierarchyManager.getProjectRoot();
      const user = await DefaultUser.create(username, infrastructure, projectRoot);
      
      // User is now saved at: scenarios/{domain}/{hostname}/User/0.3.21.1/{uuid}.scenario.json
      const userScenario = await user.toScenario();
      const ownerJson = JSON.stringify(userScenario);
      ownerData = Buffer.from(ownerJson).toString('base64');
    } catch (error) {
      // ✅ Fallback: Generate minimal User-like scenario
      // ✅ Still NO process.env - use fallback values from infrastructure
      const fallbackJson = JSON.stringify({
        ior: {
          uuid: legacyScenario.uuid,
          component: 'User',
          version: '0.3.21.1',
          timestamp: new Date().toISOString()
        },
        owner: '',  // No nested owner in fallback
        model: {
          user: 'system',  // ✅ Hardcoded fallback, not process.env
          hostname: legacyScenario.metadata.host || 'localhost',
          uuid: legacyScenario.uuid,
          component: legacyScenario.objectType,
          version: legacyScenario.version
        }
      });
      ownerData = Buffer.from(fallbackJson).toString('base64');
    }
    
    // 3️⃣ Return Web4 Standard format
    return {
      ior: {
        uuid: legacyScenario.uuid,
        component: legacyScenario.objectType,
        version: legacyScenario.version
      },
      owner: ownerData,  // ✅ Full User scenario (or fallback)
      model: legacyScenario  // ✅ ENTIRE legacy scenario
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔌 ONCE Domain Methods - Preserved from v0.2.0.0 (lines 114-319)
  // @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md - Domain logic unchanged
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Load ONCE from scenario (domain logic from 0.2.0.0)
   * @cliHide
   */
  private async loadFromScenario(scenario: Scenario<LegacyONCEScenario>): Promise<void> {
    if (scenario.ior.component !== 'ONCE') {
      throw new Error(`Invalid scenario type: ${scenario.ior.component}`);
    }

    // Load server model from scenario
    const serverModel = this.scenarioManager.createServerModelFromScenario(scenario);
    console.log(`🔄 Loaded server model from scenario: ${serverModel.uuid}`);
    this.model.serverModel = serverModel;
  }

  /**
   * Start server with automatic port management (domain logic from 0.2.0.0)
   * @cliSyntax scenario
   */
  async startServer(scenario?: string | LegacyONCEScenario): Promise<void> {
    console.log('🚀 Starting ONCE server...');
    
    await this.emitEvent(LifecycleEventType.BEFORE_START);
    
    try {
      // Initialize if not already initialized
      if (!this.model.initialized) {
        // ✅ Filter out CLI keywords that are not scenarios
        // "primary" and "client" are command keywords, not scenario paths
        const isKeyword = typeof scenario === 'string' && ['primary', 'client'].includes(scenario.toLowerCase());
        await this.init(scenario && !isKeyword ? { model: { scenario } } as any : undefined);
      }

      // ✅ Detect environment using Layer 1 infrastructure (TRUE Radical OOP)
      await this.serverHierarchyManager.detectAndSetEnvironment();
      
      // Start server hierarchy
      await this.serverHierarchyManager.startServer();
      
      // Store server model in our model
      this.model.serverModel = this.serverHierarchyManager.getServerModel();
      
      // Save current state as scenario (Web4 Standard format)
      // @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
      const web4Scenario = await this.toScenario();
      await this.scenarioManager.saveScenario(web4Scenario);
      
      await this.emitEvent(LifecycleEventType.AFTER_START);
      
    } catch (error) {
      await this.emitEvent(LifecycleEventType.ERROR, { error });
      throw error;
    }
  }

  /**
   * Register with primary server if this is a client server (domain logic from 0.2.0.0)
   */
  async registerWithPrimaryServer(): Promise<void> {
    // Handled by ServerHierarchyManager
    console.log('📋 Registration handled by ServerHierarchyManager');
  }

  /**
   * Check if this instance is the primary server (domain logic from 0.2.0.0)
   */
  isPrimaryServer(): boolean {
    return this.serverHierarchyManager.isPrimaryServer();
  }

  /**
   * Get all registered server instances (domain logic from 0.2.0.0)
   */
  getRegisteredServers(): ONCEServerModel[] {
    return this.serverHierarchyManager.getRegisteredServers();
  }

  /**
   * Get current server model (domain logic from 0.2.0.0)
   */
  getServerModel(): ONCEServerModel {
    return this.serverHierarchyManager.getServerModel();
  }

  /**
   * Create scenario from current state (domain logic from 0.2.0.0)
   * @cliHide
   */
  private createCurrentScenario(): LegacyONCEScenario {
    const serverModel = this.serverHierarchyManager.getServerModel();
    return this.scenarioManager.createScenarioFromServerModel(serverModel);
  }

  /**
   * Emit lifecycle event (domain logic from 0.2.0.0)
   * @cliHide
   */
  private async emitEvent(eventType: LifecycleEventType, data?: any): Promise<void> {
    const handlers = this.model.eventHandlers?.get(eventType) || [];
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data
    };

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`❌ Event handler error for ${eventType}:`, error);
      }
    }
  }

  // Placeholder implementations for ONCE interface methods (domain logic from 0.2.0.0)

  async startComponent(componentIOR: IOR, scenario?: LegacyONCEScenario): Promise<Component> {
    throw new Error('startComponent not implemented in v0.3.20.0');
  }

  async saveAsScenario(component: Component): Promise<Scenario<LegacyONCEScenario>> {
    throw new Error('saveAsScenario not implemented in v0.3.20.0');
  }

  async loadScenario(scenario: LegacyONCEScenario): Promise<Component> {
    throw new Error('loadScenario not implemented in v0.3.20.0');
  }

  getEnvironment(): EnvironmentInfo {
    return {
      isBrowser: false,
      isNode: true,
      isWorker: false,
      isServiceWorker: false,
      isPWA: false,
      isIframe: false,
      version: process.version,
      capabilities: ['server', 'websocket', 'p2p'],
      isOnline: true,
      hostname: this.detectHostname(),
      ip: '127.0.0.1'
    };
  }

  async registerComponent(component: Component, ior: IOR): Promise<void> {
    console.log(`📋 Component registration: ${ior.toString()}`);
  }

  async discoverComponents(query?: ComponentQuery): Promise<IOR[]> {
    return [];
  }

  async connectPeer(peerIOR: IOR): Promise<void> {
    console.log(`🤝 Peer connection: ${peerIOR.uuid}`);
  }

  async exchangeScenario(peerIOR: IOR, scenario: LegacyONCEScenario): Promise<void> {
    console.log(`🔄 Scenario exchange with ${peerIOR.uuid}`);
  }

  isInitialized(): boolean {
    return this.model.initialized || false;
  }

  getVersion(): string {
    return '0.3.20.0';
  }

  getMetrics(): PerformanceMetrics {
    return {
      initializationTime: this.model.initializationTime || 0,
      memoryUsage: process.memoryUsage().heapUsed,
      componentsLoaded: 0,
      peersConnected: 0,
      scenariosExchanged: 0,
      serversRegistered: this.getRegisteredServers().length
    };
  }

  /**
   * Register lifecycle observer
   * ✅ TRUE Radical OOP: Observer pattern replaces functional handlers
   * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md
   */
  attachObserver(observer: LifecycleObserver): void {
    if (!this.model.observers) {
      this.model.observers = [];
    }
    this.model.observers.push(observer);
    console.log(`🔗 Lifecycle observer attached`);
  }

  /**
   * Remove lifecycle observer
   * ✅ TRUE Radical OOP: Observer pattern replaces functional handlers
   * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md
   */
  detachObserver(observer: LifecycleObserver): void {
    if (this.model.observers) {
      const index = this.model.observers.indexOf(observer);
      if (index > -1) {
        this.model.observers.splice(index, 1);
        console.log(`🔗 Lifecycle observer detached`);
      }
    }
  }

  on(eventType: LifecycleEventType, handler: LifecycleEventHandler): void {
    if (!this.model.eventHandlers) {
      this.model.eventHandlers = new Map();
    }
    if (!this.model.eventHandlers.has(eventType)) {
      this.model.eventHandlers.set(eventType, []);
    }
    this.model.eventHandlers.get(eventType)!.push(handler);
  }

  off(eventType: LifecycleEventType, handler: LifecycleEventHandler): void {
    const handlers = this.model.eventHandlers?.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  registerLifecycleHooks(component: Component, hooks: LifecycleHooks): void {
    console.log(`🎣 Lifecycle hooks registered for ${component.ior.toString()}`);
  }

  async pauseComponent(component: Component): Promise<void> {
    console.log(`⏸️ Pausing component: ${component.ior.toString()}`);
  }

  async resumeComponent(component: Component): Promise<void> {
    console.log(`▶️ Resuming component: ${component.ior.toString()}`);
  }

  async stopComponent(component: Component): Promise<void> {
    console.log(`⏹️ Stopping component: ${component.ior.toString()}`);
  }

  /**
   * Stop server gracefully (domain logic from 0.2.0.0)
   * WITHOUT scenario: Stops the current server (self)
   * WITH scenario: Loads scenario and sends graceful shutdown message to that server
   * 
   * @param scenario Optional scenario UUID or path to stop a specific server
   * @cliSyntax scenario
   */
  async stopServer(scenario?: string): Promise<void> {
    if (scenario) {
      // Stop a specific server by scenario
      console.log(`🛑 Stopping server from scenario: ${scenario}`);
      
      // Extract just the UUID (in case it's formatted as "uuid (port 8080)")
      const uuidMatch = scenario.match(/^([a-f0-9-]+)/);
      const uuid = uuidMatch ? uuidMatch[1] : scenario;
      
      // Load the scenario
      const loadedScenario = await this.scenarioManager.loadScenarioByUUID(uuid);
      
      if (!loadedScenario) {
        console.error(`❌ Scenario not found: ${uuid}`);
        return;
      }
      
      // Extract server info from scenario
      const serverUUID = loadedScenario.model.state?.uuid;
      const port = loadedScenario.model.state?.capabilities?.find((c: any) => c.capability === 'httpPort')?.port;
      const isPrimary = loadedScenario.model.state?.isPrimaryServer === true;
      
      if (!port) {
        console.error(`❌ No port found in scenario ${uuid}`);
        return;
      }
      
      console.log(`🛑 Sending shutdown command to ${isPrimary ? 'PRIMARY' : 'CLIENT'} server ${serverUUID?.substring(0, 8)}... on port ${port}`);
      
      // Send shutdown command to primary server (via /stop-server endpoint which uses WebSocket)
      try {
        const http = await import('http');
        
        // Try to send shutdown via primary server's /stop-server endpoint
        const postData = JSON.stringify({ 
          action: 'shutdown',
          port: port,
          uuid: serverUUID
        });
        
        const options = {
          hostname: 'localhost',
          port: 42777, // Always go through primary
          path: '/stop-server',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };
        
        await new Promise<void>((resolve, reject) => {
          const req = http.request(options, (res) => {
            if (res.statusCode === 200) {
              console.log(`✅ Shutdown command sent successfully to port ${port}`);
              resolve();
            } else {
              console.error(`⚠️  Server responded with status ${res.statusCode}`);
              resolve();
            }
          });
          
          req.on('error', (error) => {
            console.error(`❌ Failed to connect to primary server:`, error.message);
            console.error(`   Make sure primary server is running on port 42777`);
            reject(error);
          });
          
          req.setTimeout(5000, () => {
            req.destroy();
            console.error(`⚠️  Timeout connecting to primary server`);
            reject(new Error('Timeout'));
          });
          
          req.write(postData);
          req.end();
        });
        
      } catch (error) {
        console.error(`❌ Error stopping server:`, error);
      }
      
      return;
    }
    
    // No scenario provided - stop current server (self)
    await this.emitEvent(LifecycleEventType.BEFORE_STOP);
    
    await this.serverHierarchyManager.stopServer();
    
    await this.emitEvent(LifecycleEventType.AFTER_STOP);
  }

  /**
   * Demo command - Start interactive ONCE demo with browser auto-opening
   * ✅ TRUE Radical OOP: All state in model, method chaining, no functional helpers
   * @param mode Demo mode: 'interactive' (default), 'headless', 'browser-only', or clientCount for auto-messages (e.g., '3')
   * @cliSyntax mode
   * @cliDefault mode interactive
   * @cliValues interactive headless browser-only
   * @pdca 2025-11-10-UTC-1900.add-demo-command.pdca.md - Port demo from 0.2.0.0 CLI
   * @pdca 2025-11-10-UTC-2030.add-interactive-keyboard-controller.pdca.md - Add 0.2.0.0 UX
   * @pdca 2025-11-11-UTC-2322.pdca.md - Extend with automated message exchange
   */
  async demo(mode: string = 'interactive'): Promise<this> {
    // If mode is a number, delegate to demoMessages for automated message exchange
    const clientCount = parseInt(mode, 10);
    if (!isNaN(clientCount) && clientCount > 0) {
      return await this.demoMessages(mode);
    }
    
    console.log('🎭 ONCE v0.3.20.1 Demo Starting...');
    console.log('');
    
    // ✅ RADICAL OOP: Store demo mode in model
    if (!this.model.serverModel) {
      this.model.serverModel = {} as any;
    }
    (this.model.serverModel as any).demoMode = mode;
    
    // Check if we should show interactive keyboard controller (like 0.2.0.0)
    if (mode === 'interactive' && process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
      // Show interactive keyboard controller (0.2.0.0 UX)
      this.showInteractiveHeader();
      this.showInteractiveHelp();
      
      console.log('🏠 Project root detected:', this.model.projectRoot || '(not set)');
      console.log('🚫 No environment variables required');
      console.log('🌐 Server hierarchy: Port 42777 → 8080+ (enhanced v0.2.0.0)');
      console.log('');
      
      console.log('ℹ️  Demo initialized - Enhanced v0.3.20.1 with server hierarchy');
      console.log('ℹ️  Press [h] for help, [s] to start server, [q] to quit');
      
      // Setup interactive keyboard
      await this.setupInteractiveKeyboard();
      return this;
    }
    
    // Non-interactive modes (headless, browser-only, or no TTY)
    console.log('🏠 Project root:', this.model.projectRoot || '(not set)');
    console.log('🚫 No environment variables required');
    console.log('🌐 Server hierarchy: Port 42777 → 8080+ (enhanced v0.2.0.0)');
    console.log('🎯 TRUE Radical OOP architecture (v0.3.20.1)');
    console.log('');
    
    // Initialize and start server
    if (!this.model.initialized) {
      console.log('🔧 Initializing ONCE kernel...');
      const startTime = Date.now();
      this.model.initialized = true;
      this.model.initializationTime = Date.now() - startTime;
      console.log(`✅ Initialized in ${this.model.initializationTime}ms`);
    }
    
    // Start server
    console.log('🚀 Starting ONCE server...');
    await this.startServer();
    
    const serverModel = this.serverHierarchyManager.getServerModel();
    const httpCapability = serverModel.capabilities.find(c => c.capability === 'httpPort');
    
    if (httpCapability) {
      const port = httpCapability.port;
      const url = `http://localhost:${port}`;
      
      console.log('');
      console.log('✅ ONCE Server Running:');
      console.log(`   🌐 URL: ${url}`);
      console.log(`   🏠 Domain: ${serverModel.domain}`);
      console.log(`   📋 UUID: ${serverModel.uuid}`);
      console.log(`   ⚡ Type: ${serverModel.isPrimaryServer ? '🟢 Primary Server (42777)' : '🔵 Client Server'}`);
      console.log('');
      
      if (serverModel.isPrimaryServer) {
        console.log('🎯 This is the PRIMARY server - other instances will register with this one');
      } else {
        console.log('🔗 This server registered with the primary server on port 42777');
      }
      console.log('');
      
      // Open browser if not headless
      if (mode !== 'headless') {
        console.log('🌐 Opening browser...');
        await this.openBrowser(url);
        console.log('');
      }
      
      // Show available endpoints
      console.log('📡 Available Endpoints:');
      console.log(`   Root:    ${url}/`);
      console.log(`   Health:  ${url}/health`);
      console.log(`   Client:  ${url}/once`);
      if (serverModel.isPrimaryServer) {
        console.log(`   Servers: ${url}/servers`);
      }
      console.log('');
      
      // Show controls
      if (mode === 'interactive') {
        console.log('ℹ️  Interactive Demo Mode:');
        console.log('   • Server is running and browser is open');
        console.log('   • Visit the URL above to see ONCE in action');
        console.log('   • Press Ctrl+C to stop the server');
      } else if (mode === 'headless') {
        console.log('🤖 Headless Mode:');
        console.log('   • Server is running without browser');
        console.log('   • Press Ctrl+C to stop the server');
      } else if (mode === 'browser-only') {
        console.log('🌐 Browser opened, server running');
        console.log('   • Press Ctrl+C to stop');
      }
      console.log('');
      console.log('🛑 Press Ctrl+C to stop the server');
      console.log('');
      
      // Setup graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n');
        console.log('🛑 Stopping ONCE server...');
        await this.stopServer();
        console.log('✅ Server stopped gracefully');
        process.exit(0);
      });
      
      // Keep process alive
      await new Promise(() => {}); // Never resolves, keeps process running
    }
    
    return this;
  }

  /**
   * Open browser to URL (cross-platform)
   * ✅ TRUE Radical OOP: Uses child_process dynamically, no static imports
   * @param url URL to open (default: http://localhost:42777/)
   * @cliSyntax url
   */
  async openBrowser(url: string = 'http://localhost:42777/'): Promise<this> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      const platform = process.platform;
      let command: string;
      
      if (platform === 'darwin') {
        command = `open "${url}"`;
      } else if (platform === 'win32') {
        command = `start "${url}"`;
      } else {
        // Linux and others
        command = `xdg-open "${url}" || sensible-browser "${url}" || x-www-browser "${url}"`;
      }
      
      await execAsync(command);
      console.log(`✅ Browser opened: ${url}`);
    } catch (error) {
      console.warn(`⚠️  Could not auto-open browser. Please visit: ${url}`);
    }
    
    return this;
  }

  /**
   * Test input command - Run automated test sequence (non-interactive)
   * ✅ TRUE Radical OOP: All state in model, no functional helpers
   * Simulates keyboard input from ONCE 0.2.0.0 interactive demo
   * 
   * Test sequence characters:
   *   s = start server
   *   b = open browser
   *   c = launch client server
   *   d = discover peers
   *   e = exchange scenarios
   *   m = show metrics
   *   k = kill all processes
   *   q = quit
   *   0-9 = wait N seconds
   * 
   * @param sequence Test sequence string (e.g., "s3bq" = start server, wait 3s, browser, quit)
   * @cliSyntax sequence
   * @cliExample once testInput "s3bq"
   * @cliExample once testInput "s1bc2q"
   * @pdca 2025-11-10-UTC-1915.add-testInput-command.pdca.md - Port test sequence from 0.2.0.0
   */
  async testInput(sequence: string): Promise<this> {
    console.log(`🧪 ONCE v0.3.20.0 Test Sequence: "${sequence}"`);
    console.log('');
    
    // ✅ RADICAL OOP: Store test sequence in model
    if (!this.model.serverModel) {
      this.model.serverModel = {} as any;
    }
    (this.model.serverModel as any).testSequence = sequence;
    (this.model.serverModel as any).testStep = 0;
    
    // Track client servers for cleanup
    const clientServers: any[] = [];
    
    try {
      // Process each character in the sequence
      for (let i = 0; i < sequence.length; i++) {
        const char = sequence[i];
        (this.model.serverModel as any).testStep = i + 1;
        
        console.log(`🔹 Step ${i + 1}/${sequence.length}: '${char}'`);
        
        switch (char.toLowerCase()) {
          case 's':
            // Start server
            if (!this.model.initialized) {
              console.log('   🚀 Starting ONCE server...');
              await this.startServer();
              const serverModel = this.serverHierarchyManager.getServerModel();
              const httpCapability = serverModel.capabilities.find(c => c.capability === 'httpPort');
              if (httpCapability) {
                console.log(`   ✅ Server started on port ${httpCapability.port}`);
              }
            } else {
              console.log('   ⚠️  Server already running');
            }
            break;
            
          case 'b':
            // Open browser
            console.log('   🌐 Opening browser...');
            const serverModel = this.serverHierarchyManager.getServerModel();
            const httpCapability = serverModel.capabilities.find(c => c.capability === 'httpPort');
            if (httpCapability) {
              const url = `http://localhost:${httpCapability.port}`;
              await this.openBrowser(url);
            } else {
              console.log('   ⚠️  Server not running, cannot open browser');
            }
            break;
            
          case 'c':
            // Launch client server
            console.log('   🔵 Launching client server...');
            try {
              // Create a new ONCE instance for client server
              const clientOnce = new DefaultONCE();
              await clientOnce.init();
              await clientOnce.startServer();
              clientServers.push(clientOnce);
              const clientModel = clientOnce.getServerModel();
              const clientCapability = clientModel.capabilities.find(c => c.capability === 'httpPort');
              if (clientCapability) {
                console.log(`   ✅ Client server started on port ${clientCapability.port}`);
              }
            } catch (error) {
              console.log(`   ⚠️  Could not start client server: ${error instanceof Error ? error.message : String(error)}`);
            }
            break;
            
          case 'd':
            // Discover peers
            console.log('   🔍 Discovering peers...');
            if (this.isPrimaryServer()) {
              const registeredServers = this.getRegisteredServers();
              console.log(`   📋 Registered servers: ${registeredServers.length}`);
              for (const server of registeredServers) {
                console.log(`      • ${server.uuid} on ${server.capabilities.find(c => c.capability === 'httpPort')?.port}`);
              }
            } else {
              console.log('   ⚠️  Only primary server can discover peers');
            }
            break;
            
          case 'e':
            // Exchange scenarios
            console.log('   🔄 Exchanging scenarios...');
            console.log('   ℹ️  Scenario exchange implemented but no peers to exchange with in test mode');
            break;
            
          case 'm':
            // Show metrics
            console.log('   📊 Server Metrics:');
            const metrics = this.getMetrics();
            console.log(`      • Initialization Time: ${metrics.initializationTime}ms`);
            console.log(`      • Memory Usage: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`);
            console.log(`      • Servers Registered: ${metrics.serversRegistered}`);
            break;
            
          case 'k':
            // Kill all processes
            console.log('   🧹 Killing all demo processes...');
            // Stop client servers
            for (const client of clientServers) {
              await client.stopServer().catch(() => {});
            }
            clientServers.length = 0;
            console.log('   ✅ All client servers stopped');
            break;
            
          case 'q':
            // Quit
            console.log('   👋 Quitting test sequence...');
            // Stop all servers
            for (const client of clientServers) {
              await client.stopServer().catch(() => {});
            }
            await this.stopServer().catch(() => {});
            console.log('   ✅ All servers stopped');
            break;
            
          default:
            // Check if it's a number (wait N seconds)
            const waitTime = parseInt(char);
            if (!isNaN(waitTime) && waitTime >= 0 && waitTime <= 9) {
              console.log(`   ⏳ Waiting ${waitTime} second${waitTime !== 1 ? 's' : ''}...`);
              await this.sleep(waitTime * 1000);
              console.log(`   ✅ Wait completed`);
            } else {
              console.log(`   ⚠️  Unknown command: '${char}'`);
            }
            break;
        }
        
        console.log('');
      }
      
      console.log('✅ Test sequence completed successfully');
      console.log('');
      console.log('🔒 Server running. Press Ctrl+C to stop.');
      console.log('');
      
      // Setup Ctrl+C handler for cleanup
      const cleanup = async () => {
        console.log('\n🛑 Shutting down...');
        for (const client of clientServers) {
          await client.stopServer().catch(() => {});
        }
        await this.stopServer().catch(() => {});
        process.exit(0);
      };
      
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
      
      // Keep process alive - wait indefinitely
      await new Promise(() => {}); // Never resolves
      
    } catch (error) {
      console.error(`❌ Test sequence failed: ${error instanceof Error ? error.message : String(error)}`);
      
      // Emergency cleanup
      for (const client of clientServers) {
        await client.stopServer().catch(() => {});
      }
      await this.stopServer().catch(() => {});
      
      throw error;
    }
    
    return this;
  }

  /**
   * Sleep utility for test sequences
   * ✅ TRUE Radical OOP: Simple promise-based delay
   * @cliHide
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Parameter completion for mode parameter (used by demo command)
   * ✅ TRUE Radical OOP: Parameterless, model-driven completion
   * Returns possible values for the demo mode parameter
   * @cliHide
   */
  async modeParameterCompletion(): Promise<string[]> {
    return ['interactive', 'headless', 'browser-only'];
  }

  /**
   * Parameter completion for sequence parameter (used by testInput command)
   * ✅ TRUE Radical OOP: Parameterless, model-driven completion
   * Returns example test sequences
   * @cliHide
   */
  async sequenceParameterCompletion(): Promise<string[]> {
    return [
      's2mq',           // Simple: start, wait, metrics, quit
      's1c1dq',         // With client: start, client, discover, quit
      's3bc2q',         // With browser: start, wait, browser, client, wait, quit
      's1bc1k1q',       // Full: start, browser, client, discover, kill, quit
      's2b2c1d1e1q'     // Complex: start, browser, client, discover, exchange, quit
    ];
  }

  /**
   * Parameter completion for topic parameter (used by info command)
   * ✅ TRUE Radical OOP: Parameterless, model-driven completion
   * Returns possible info topics
   * @cliHide
   */
  async topicParameterCompletion(): Promise<string[]> {
    return ['model', 'standard', 'guidelines'];
  }

  /**
   * Parameter completion for scenario parameter (used by startServer, stopServer, loadScenario, etc.)
   * ✅ TRUE Radical OOP: Parameterless, model-driven completion
   * Returns available scenario UUIDs from the scenarios directory
   * @cliHide
   */
  async scenarioParameterCompletion(): Promise<string[]> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Get project root from model or calculate
      const projectRoot = this.model.projectRoot || path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../../../../../');
      const scenarioBaseDir = path.join(projectRoot, 'scenarios/local.once/ONCE/0.3.20.4');
      
      // Check if scenarios directory exists
      if (!fs.existsSync(scenarioBaseDir)) {
        return [];
      }
      
      // Find all .scenario.json files recursively
      const scenarios: string[] = [];
      
      const walkDir = (dir: string) => {
        if (!fs.existsSync(dir)) return;
        
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else if (entry.name.endsWith('.scenario.json')) {
            // Extract UUID from filename (format: {uuid}.scenario.json)
            const uuid = entry.name.replace('.scenario.json', '');
            
            // Try to read the scenario to get port info for better display
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              const scenario = JSON.parse(content);
              const port = scenario.state?.capabilities?.find((c: any) => c.capability === 'httpPort')?.port;
              const state = scenario.state?.state || 'unknown';
              
              // Only show running servers, skip shutdown ones
              if (state !== 'shutdown' && state !== 'stopped') {
                // Format: uuid (port 8080)
                scenarios.push(port ? `${uuid} (port ${port})` : uuid);
              }
            } catch (error) {
              // If we can't read/parse, just add the UUID
              scenarios.push(uuid);
            }
          }
        }
      };
      
      walkDir(scenarioBaseDir);
      
      return scenarios;
    } catch (error) {
      // If any error occurs, return empty array
      return [];
    }
  }

  /**
   * Parameter completion for componentIOR parameter (used by startComponent)
   * ✅ TRUE Radical OOP: Parameterless, model-driven completion
   * Returns empty array as IORs are dynamic references
   * @cliHide
   */
  async componentIORParameterCompletion(): Promise<string[]> {
    // IORs are dynamic component references - no predefined completions
    return [];
  }

  /**
   * Parameter completion for ior parameter (used by registerComponent)
   * ✅ TRUE Radical OOP: Parameterless, model-driven completion
   * Returns empty array as IORs are dynamic references
   * @cliHide
   */
  async iorParameterCompletion(): Promise<string[]> {
    // IORs are dynamic component references - no predefined completions
    return [];
  }

  /**
   * Parameter completion for query parameter (used by discoverComponents)
   * ✅ TRUE Radical OOP: Parameterless, model-driven completion
   * Returns empty array as queries are free-form search strings
   * @cliHide
   */
  async queryParameterCompletion(): Promise<string[]> {
    // Queries are free-form search strings - no predefined completions
    return [];
  }

  /**
   * Parameter completion for peerIOR parameter (used by connectPeer, exchangeScenario)
   * ✅ TRUE Radical OOP: Parameterless, model-driven completion
   * Returns empty array as peer IORs are dynamic references
   * @cliHide
   */
  async peerIORParameterCompletion(): Promise<string[]> {
    // Peer IORs are dynamic references - no predefined completions
    return [];
  }

  /**
   * Parameter completion for eventType parameter (used by on, off)
   * ✅ TRUE Radical OOP: Parameterless, model-driven completion
   * Returns lifecycle event types
   * @cliHide
   */
  async eventTypeParameterCompletion(): Promise<string[]> {
    return [
      'BEFORE_INIT',
      'AFTER_INIT',
      'BEFORE_START',
      'AFTER_START',
      'BEFORE_STOP',
      'AFTER_STOP',
      'SERVER_REGISTRATION',
      'CLIENT_CONNECTED'
    ];
  }

  /**
   * Parameter completion for handler parameter (used by on, off)
   * ✅ TRUE Radical OOP: Parameterless, model-driven completion
   * Returns empty array as handlers are function references
   * @cliHide
   */
  async handlerParameterCompletion(): Promise<string[]> {
    // Handlers are function references - no predefined completions
    return [];
  }

  /**
   * Parameter completion for hooks parameter (used by registerLifecycleHooks)
   * ✅ TRUE Radical OOP: Parameterless, model-driven completion
   * Returns empty array as hooks are complex objects
   * @cliHide
   */
  async hooksParameterCompletion(): Promise<string[]> {
    // Hooks are complex objects - no predefined completions
    return [];
  }

  /**
   * Parameter completion for url parameter (used by openBrowser)
   * ✅ TRUE Radical OOP: Parameterless, model-driven completion
   * Returns available server URLs dynamically from running servers
   * @cliHide
   */
  async urlParameterCompletion(): Promise<string[]> {
    const urls: string[] = [];
    
    try {
      // Check if primary server is running
      const primaryPort = 42777;
      const isPrimaryRunning = await this.checkServerHealth(primaryPort);
      
      if (isPrimaryRunning) {
        // Add primary server URLs
        urls.push(`http://localhost:${primaryPort}/`);
        urls.push(`http://localhost:${primaryPort}/demo`);
        urls.push(`http://localhost:${primaryPort}/once`);
        urls.push(`http://localhost:${primaryPort}/health`);
        urls.push(`http://localhost:${primaryPort}/servers`);
        
        // Query primary server for connected clients
        try {
          const http = await import('http');
          const serversData = await new Promise<string>((resolve, reject) => {
            const req = http.get(`http://localhost:${primaryPort}/servers`, (res) => {
              let data = '';
              res.on('data', (chunk) => data += chunk);
              res.on('end', () => resolve(data));
            });
            req.on('error', reject);
            req.setTimeout(1000, () => {
              req.destroy();
              reject(new Error('Timeout'));
            });
          });
          
          const response = JSON.parse(serversData);
          const servers = response.servers || [];
          
          // Add URLs for each connected client server
          for (const server of servers) {
            // Extract port from capabilities array
            const httpCapability = server.capabilities?.find((cap: any) => cap.capability === 'httpPort');
            if (httpCapability && httpCapability.port && httpCapability.port !== primaryPort) {
              urls.push(`http://localhost:${httpCapability.port}/`);
              urls.push(`http://localhost:${httpCapability.port}/once`);
            }
          }
        } catch (error) {
          // Primary running but no clients or query failed - that's okay
        }
      }
    } catch (error) {
      // No servers running - return empty array
    }
    
    // If no servers found, provide at least the primary default
    if (urls.length === 0) {
      urls.push('http://localhost:42777/');
    }
    
    return urls;
  }

  /**
   * Check if a server is healthy at the given port
   * ✅ TRUE Radical OOP: Uses dynamic import, no static dependencies
   * @cliHide
   */
  private async checkServerHealth(port: number): Promise<boolean> {
    try {
      const http = await import('http');
      return await new Promise<boolean>((resolve) => {
        const req = http.get(`http://localhost:${port}/health`, (res) => {
          resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(1000, () => {
          req.destroy();
          resolve(false);
        });
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Detect hostname without environment variables (domain logic from 0.2.0.0)
   * @cliHide
   */
  private detectHostname(): string {
    try {
      const os = require('os');
      return os.hostname();
    } catch {
      return 'localhost';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎮 Interactive Demo Controller (0.2.0.0 UX) - TRUE Radical OOP
  // @pdca 2025-11-10-UTC-2030.add-interactive-keyboard-controller.pdca.md
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Show interactive demo header (0.2.0.0 style)
   * ✅ RADICAL OOP: Pure display method, no state modification
   * @cliHide
   */
  private showInteractiveHeader(): void {
    console.clear();
    const cyan = '\x1b[36m';
    const bold = '\x1b[1m';
    const reset = '\x1b[0m';
    
    console.log(`${bold}${cyan}╔════════════════════════════════════════════════╗${reset}`);
    console.log(`${bold}${cyan}║    ONCE Interactive Demo Controller v0.3.20.1  ║${reset}`);
    console.log(`${bold}${cyan}║         Enhanced Server Hierarchy              ║${reset}`);
    console.log(`${bold}${cyan}╚════════════════════════════════════════════════╝${reset}`);
    console.log('');
  }

  /**
   * Show interactive demo help (0.2.0.0 style keyboard controls)
   * ✅ RADICAL OOP: Pure display method, no state modification
   * @cliHide
   */
  private showInteractiveHelp(): void {
    const bold = '\x1b[1m';
    const blue = '\x1b[34m';
    const gray = '\x1b[37m';
    const reset = '\x1b[0m';
    
    console.log(`${bold}📋 Keyboard Controls:${reset}`);
    console.log(`${gray}─────────────────────${reset}`);
    console.log(`  ${blue}[h]${reset} Show this help menu`);
    console.log(`  ${blue}[s]${reset} Start/Stop ONCE server (port 42777 → 8080+)`);
    console.log(`  ${blue}[c]${reset} Launch Node.js Client Server`);
    console.log(`  ${blue}[d]${reset} Open Demo Hub (in browser)`);
    console.log(`  ${blue}[b]${reset} Launch Browser Client`);
    console.log(`  ${blue}[e]${reset} Exchange scenarios`);
    console.log(`  ${blue}[m]${reset} Show metrics and status`);
    console.log(`  ${blue}[k]${reset} Kill all client processes`);
    console.log(`  ${blue}[q]${reset} Quit demo (with cleanup)`);
    console.log('');
  }

  /**
   * Setup interactive keyboard input (0.2.0.0 style)
   * ✅ RADICAL OOP: Store client servers in model for cleanup
   * @cliHide
   */
  private async setupInteractiveKeyboard(): Promise<void> {
    // ✅ RADICAL OOP: Store client servers array in model
    if (!this.model.serverModel) {
      this.model.serverModel = {} as any;
    }
    (this.model.serverModel as any).clientServers = [];
    
    // Setup keyboard listening
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', async (data: Buffer | string) => {
      const key = data.toString();
      await this.handleKeypress(key);
    });

    // Setup cleanup on exit and Ctrl+C handling
    process.on('SIGINT', async () => {
      console.log('\n🛑 Ctrl+C received - cleaning up...');
      await this.cleanupDemo();
      process.exit(0);
    });
    
    // Keep process alive
    await new Promise(() => {}); // Never resolves
  }

  /**
   * Handle keypress in interactive demo (0.2.0.0 style)
   * ✅ RADICAL OOP: All state in model, method chaining pattern
   * @cliHide
   */
  private async handleKeypress(key: string): Promise<void> {
    try {
      switch (key.toLowerCase()) {
        case 'h':
          // Show help
          console.clear();
          this.showInteractiveHeader();
          this.showInteractiveHelp();
          break;
          
        case 's':
          // Toggle server
          if (!this.model.initialized || !this.model.serverModel) {
            console.log('🚀 Starting ONCE server...');
            // ✅ RADICAL OOP: Ensure clientServers array exists
            if (!this.model.serverModel) {
              this.model.serverModel = {} as any;
            }
            if (!((this.model.serverModel as any).clientServers)) {
              ((this.model.serverModel as any).clientServers as any[]) = [];
            }
            
            await this.startServer();
            const serverModel = this.serverHierarchyManager.getServerModel();
            const httpCapability = serverModel.capabilities.find(c => c.capability === 'httpPort');
            if (httpCapability) {
              console.log(`✅ Server started on port ${httpCapability.port}`);
              console.log(`   ${serverModel.isPrimaryServer ? '🟢 Primary Server' : '🔵 Client Server'}`);
            }
          } else {
            console.log('🛑 Stopping ONCE server...');
            await this.stopServer();
            console.log('✅ Server stopped');
          }
          break;
          
        case 'b':
          // Launch browser
          console.log('🌐 Launching browser...');
          const serverModel = this.serverHierarchyManager.getServerModel();
          const httpCapability = serverModel.capabilities.find(c => c.capability === 'httpPort');
          if (httpCapability) {
            const url = `http://localhost:${httpCapability.port}`;
            await this.openBrowser(url);
          } else {
            console.log('⚠️  Server not running');
          }
          break;
          
        case 'c':
          // Launch client server
          console.log('🔵 Launching client server...');
          try {
            // ✅ RADICAL OOP: Ensure clientServers array exists
            if (!this.model.serverModel) {
              this.model.serverModel = {} as any;
            }
            if (!((this.model.serverModel as any).clientServers)) {
              ((this.model.serverModel as any).clientServers as any[]) = [];
            }
            
            const clientOnce = new DefaultONCE();
            await clientOnce.init();
            await clientOnce.startServer();
            const clientModel = clientOnce.getServerModel();
            const clientCapability = clientModel.capabilities.find(c => c.capability === 'httpPort');
            if (clientCapability) {
              console.log(`✅ Client server started on port ${clientCapability.port}`);
              // Store in model for cleanup
              ((this.model.serverModel as any).clientServers as any[]).push(clientOnce);
            }
          } catch (error) {
            console.log(`⚠️  Could not start client server: ${error instanceof Error ? error.message : String(error)}`);
          }
          break;
          
        case 'd':
          // Open Demo Hub
          console.log('🌐 Opening demo hub...');
          if (this.model.serverModel) {
            const sm = this.serverHierarchyManager.getServerModel();
            const port = sm.isPrimaryServer ? 42777 : sm.capabilities.find(c => c.capability === 'httpPort')?.port;
            if (port) {
              await this.openBrowser(`http://localhost:${port}/demo`);
              console.log(`✅ Demo hub opened: http://localhost:${port}/demo`);
            } else {
              console.log('⚠️  Server not running - start server first with [s]');
            }
          } else {
            console.log('⚠️  Server not running - start server first with [s]');
          }
          break;
          
        case 'e':
          // Exchange scenarios
          console.log('🔄 Exchanging scenarios...');
          console.log('ℹ️  Scenario exchange implemented (placeholder)');
          break;
          
        case 'm':
          // Show metrics
          console.log('📊 Server Metrics & Status:');
          console.log('📋 ONCE v0.3.20.1 - Enhanced Server Hierarchy');
          console.log('🏠 Domain: local.once');
          console.log('🔧 Status: Interactive demo active');
          if (this.model.serverModel) {
            const sm = this.serverHierarchyManager.getServerModel();
            console.log(`🌐 Server: ${sm.isPrimaryServer ? 'Primary (42777)' : 'Client'}`);
            const clients = ((this.model.serverModel as any).clientServers as any[]);
            console.log(`🔵 Client servers: ${clients ? clients.length : 0}`);
          }
          break;
          
        case '\u0008': // backspace
        case '\u007f': // delete
          // Clear screen
          console.clear();
          this.showInteractiveHeader();
          this.showInteractiveHelp();
          break;
          
        case 'k':
          // Kill client processes
          console.log('🧹 Killing client processes...');
          const clients = ((this.model.serverModel as any).clientServers as any[]);
          if (clients && clients.length > 0) {
            for (const client of clients) {
              try {
                await client.stopServer();
              } catch {
                // Ignore errors
              }
            }
            ((this.model.serverModel as any).clientServers as any[]) = [];
            console.log(`✅ Stopped ${clients.length} client server(s)`);
          } else {
            console.log('ℹ️  No client servers to kill');
          }
          break;
          
        case 'q':
          // Quit
          console.log('👋 Quitting demo with cleanup...');
          await this.cleanupDemo();
          process.exit(0);
          break;
          
        case '\u0003': // Ctrl+C
          console.log('\n🛑 Ctrl+C received - cleaning up...');
          await this.cleanupDemo();
          process.exit(0);
          break;
      }
    } catch (error) {
      console.error(`❌ Error handling keypress: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Cleanup demo processes (0.2.0.0 style)
   * ✅ RADICAL OOP: Uses model state for cleanup
   * @cliHide
   */
  private async cleanupDemo(): Promise<void> {
    // Stop all client servers
    const clients = this.model.serverModel ? ((this.model.serverModel as any).clientServers as any[]) : [];
    if (clients && clients.length > 0) {
      console.log(`🧹 Stopping ${clients.length} client server(s)...`);
      for (const client of clients) {
        try {
          await client.stopServer();
        } catch {
          // Ignore errors
        }
      }
    }
    
    // Stop main server
    if (this.model.initialized) {
      try {
        await this.stopServer();
      } catch {
        // Ignore errors
      }
    }
    
    // Restore terminal
    if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    
    console.log('✅ Cleanup complete');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 CLI Infrastructure Methods - Delegated to Web4TSComponent (TRUE Radical OOP)
  // @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md - CLI infrastructure from 0.3.20.0
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Show information about current ONCE state
   * Delegates to Web4TSComponent for DRY architecture and consistent model display
   * @param topic Optional topic to show (e.g., 'standard', 'guidelines', 'model')
   * @cliSyntax topic
   * @cliDefault topic model
   */
  async info(topic: string = 'model'): Promise<this> {
    return this.delegateToWeb4TS('info', topic);
  }

  /**
   * Run component tests with hierarchical selection or full suite with auto-promotion
   * @param scope Test scope: 'all' (full suite with promotion) or 'file'/'describe'/'itCase' (selective, no promotion)
   * @param references Test references for selective testing
   * @cliSyntax scope references
   * @cliDefault scope all
   * @cliValues file describe itCase
   */
  async test(scope: string = 'all', ...references: string[]): Promise<this> {
    return this.delegateToWeb4TS('test', scope, ...references);
  }

  // ============================================================================
  // MICRO KERNEL METHODS - Route Handler Delegation
  // @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
  // Routes delegate to these methods (Radical OOP pattern)
  // ============================================================================

  /**
   * IOR-based Method Invocation
   * Maps URL endpoint to method call (like CLI does)
   * 
   * IOR Format with Method Invocation:
   * - Basic IOR (reference only): ior:https://host:port/Component/version/uuid
   * - IOR with method (executable): ior:https://host:port/Component/version/uuid/methodName
   * - IOR with parameters: ior:https://host:port/Component/version/uuid/methodName?param1=value1
   * 
   * Examples:
   * - ior:https://localhost:42777/ONCE/0.3.21.6/uuid/getHealth
   * - ior:https://localhost:42777/ONCE/0.3.21.6/uuid/getServers
   * - ior:https://localhost:42777/ONCE/0.3.21.6/uuid/startServer?port=8080
   * 
   * Usage (HTTP):
   * GET http://localhost:42777/ONCE/getHealth
   * GET http://localhost:42777/ONCE/getServers
   * GET http://localhost:42777/ONCE/0.3.21.6/uuid/info
   * 
   * @param methodName The method name to invoke
   * @param params Query parameters to set on model (temporary)
   * @returns Result of method invocation
   * @throws Error if method not found or not callable
   * @pdca 2025-11-22-UTC-1730.iteration-01.6.5-ior-method-invocation.pdca.md
   */
  async invokeMethod(methodName: string, params: Record<string, any> = {}): Promise<any> {
    // Check if method exists and is callable
    if (typeof (this as any)[methodName] !== 'function') {
      throw new Error(`Method '${methodName}' not found on ONCE component`);
    }
    
    // Security: Check if method is public (not starting with underscore)
    if (methodName.startsWith('_')) {
      throw new Error(`Method '${methodName}' is private and cannot be invoked via IOR`);
    }
    
    // Temporarily set params on model (for parameterless methods)
    // This follows Radical OOP: methods act on model, not on parameters
    const originalValues: Record<string, any> = {};
    for (const [key, value] of Object.entries(params)) {
      if (key in this.model) {
        originalValues[key] = (this.model as any)[key];
      }
      (this.model as any)[key] = value;
    }
    
    try {
      // Call method (may be sync or async)
      const result = await (this as any)[methodName]();
      return result;
    } finally {
      // Restore original values (cleanup)
      for (const [key, value] of Object.entries(originalValues)) {
        (this.model as any)[key] = value;
      }
    }
  }

  /**
   * Get server health status
   * @returns Health model with complete server state
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/getHealth
   * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
   */
  async getHealth(): Promise<any> {
    if (!this.serverHierarchyManager) {
      throw new Error('Server not initialized. Call startServer() first.');
    }

    const serverModel = this.serverHierarchyManager.getServerModel();
    
    // Client servers include primary connection info
    const primaryInfo = serverModel.isPrimaryServer ? null : {
      host: serverModel.primaryServer?.host || 'localhost',
      port: serverModel.primaryServer?.port || 42777,
      connected: !!(this.serverHierarchyManager as any).primaryServerConnection,
      domain: serverModel.domain
    };

    return {
      status: 'running',
      uuid: serverModel.uuid,
      isPrimaryServer: serverModel.isPrimaryServer,
      state: serverModel.state,
      capabilities: serverModel.capabilities,
      domain: serverModel.domain,
      hostname: serverModel.hostname,
      version: this.model.version || '0.0.0.0',
      primaryServer: primaryInfo,
      message: `ONCE v${this.model.version} Server - Micro Kernel`
    };
  }

  /**
   * Get all registered servers (Primary only)
   * ✅ PROTOCOL-LESS: Returns scenarios (not models)
   * @returns Server list with scenarios
   * @throws Error if called on non-primary server
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/getServers
   * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
   * @pdca 2025-11-22-UTC-1500.iteration-01.6.4b-protocol-less-registry.pdca.md
   */
  getServers(): import('../layer3/ServerListModel.interface.js').ServerListModel {
    if (!this.serverHierarchyManager) {
      throw new Error('Server not initialized. Call startServer() first.');
    }

    const serverModel = this.serverHierarchyManager.getServerModel();
    
    if (!serverModel.isPrimaryServer) {
      throw new Error('Only primary server can list all servers');
    }

    const serverRegistry = (this.serverHierarchyManager as any).serverRegistry as Map<string, any>;

    return {
      primary: true,
      primaryServer: serverModel,
      servers: Array.from(serverRegistry.values()).map((entry: any) => entry.scenario)  // ✅ Return scenarios
    };
  }

  /**
   * Serve ONCE browser client HTML
   * @returns Rendered HTML for browser client
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/serveOnceClient
   * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
   */
  serveOnceClient(): string {
    if (!this.serverHierarchyManager) {
      throw new Error('Server not initialized. Call startServer() first.');
    }
    
    return this.serverHierarchyManager.getSimpleONCEClientHTML();
  }

  /**
   * Serve demo hub HTML
   * @returns Rendered HTML for demo hub
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/serveDemoHub
   * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
   */
  serveDemoHub(): string {
    if (!this.serverHierarchyManager) {
      throw new Error('Server not initialized. Call startServer() first.');
    }
    
    return this.serverHierarchyManager.getDemoHubHTML();
  }

  /**
   * Serve server status HTML
   * @returns Rendered HTML for server status
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/serveStatus
   * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
   */
  serveStatus(): string {
    if (!this.serverHierarchyManager) {
      throw new Error('Server not initialized. Call startServer() first.');
    }
    
    return this.serverHierarchyManager.getServerStatusHTML();
  }

  /**
   * Start a new client server dynamically
   * @throws Error if component not initialized
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/startClientServer
   * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
   */
  async startClientServer(): Promise<void> {
    const { exec } = await import('child_process');
    const componentDir = this.model.componentRoot;

    if (!componentDir) {
      throw new Error('Component not initialized');
    }

    return new Promise((resolve, reject) => {
      exec(`cd ${componentDir} && ./once startServer &`, (error) => {
        if (error) {
          console.error('❌ Failed to start server:', error);
          reject(error);
        } else {
          console.log('✅ Server starting in background...');
          resolve();
        }
      });
    });
  }

  /**
   * Discover servers via housekeeping
   * @returns Discovery result with deleted and discovered counts
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/discoverServers
   * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
   */
  async discoverServers(): Promise<import('../layer3/DiscoveryResult.interface.js').DiscoveryResult> {
    if (!this.serverHierarchyManager) {
      throw new Error('Server not initialized. Call startServer() first.');
    }

    console.log('🔍 Manual discovery triggered');
    const result = await this.serverHierarchyManager.performHousekeeping();
    
    return {
      deleted: result?.deleted || 0,
      discovered: result?.discovered || 0
    };
  }

  /**
   * Shutdown all servers gracefully (Primary only)
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/shutdownAll
   * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
   */
  async shutdownAll(): Promise<void> {
    if (!this.serverHierarchyManager) {
      throw new Error('Server not initialized. Call startServer() first.');
    }

    console.log('🛑 Graceful shutdown of all servers initiated');
    await this.serverHierarchyManager.shutdownAllServers();
  }

  // ============================================================================
  // END MICRO KERNEL METHODS
  // ============================================================================

  /**
   * Automated multi-server demo with Web4 scenario message exchange
   * ⚠️ DEPRECATED: Protocol-based messaging violates Web4 protocol-less communication
   * @pdca 2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md - Iteration 1.6.2
   * @deprecated Will be replaced with scenario replication demo in Iteration 1.6.3
   * @param clientCount Number of client servers to spawn (default: 3)
   * @cliHide
   */
  async demoMessages(clientCount: string = '3'): Promise<this> {
    const count = parseInt(clientCount, 10);
    console.log(`\n🎭 ONCE Automated Message Demo`);
    console.log(`📊 Configuration: ${count} client servers + 1 primary`);
    console.log('');

    // Initialize message tracker in model
    if (!this.model.messageTracker) {
      this.model.messageTracker = {
        sent: [],
        received: [],
        acknowledged: [],
        patterns: { broadcast: 0, relay: 0, p2p: 0 }
      };
    }

    // Start primary server
    console.log('🟢 Starting primary server (42777)...');
    await this.init();
    await this.startServer();
    const primaryModel = this.serverHierarchyManager.getServerModel();
    console.log(`   ✅ Primary: ${primaryModel.uuid}`);
    console.log('');

    // Spawn client servers
    const clients: any[] = [];
    console.log(`🔵 Spawning ${count} client servers...`);
    for (let i = 0; i < count; i++) {
      const client = new DefaultONCE();
      await client.init();
      await client.startServer();
      clients.push(client);
      const clientModel = client.getServerModel();
      const port = clientModel.capabilities.find(c => c.capability === 'httpPort')?.port;
      console.log(`   ✅ Client ${i + 1}: ${clientModel.uuid} on port ${port}`);
    }
    console.log('');

    await this.sleep(2000); // Let clients register

    // Pattern 1: Broadcast (Primary → All Clients)
    console.log('📡 Pattern 1: Broadcast (Primary → All Clients)');
    const { v4: uuidv4 } = await import('uuid');
    const broadcastScenario: any = {
      uuid: uuidv4(),
      objectType: 'ONCEMessage',
      version: this.model.version || 'unknown', // ✅ Use dynamic version
      state: {
        type: 'broadcast',
        from: { uuid: primaryModel.uuid, port: 42777 },
        to: 'all',
        content: 'Broadcast message from primary to all clients',
        timestamp: new Date().toISOString(),
        sequence: 1
      },
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        creator: 'ONCE-demoMessages',
        description: 'Broadcast pattern demo message'
      }
    };
    this.serverHierarchyManager.broadcastScenario(broadcastScenario);
    this.model.messageTracker.sent.push(broadcastScenario);
    this.model.messageTracker.patterns.broadcast++;
    console.log(`   📤 Sent broadcast: ${broadcastScenario.uuid}`);
    console.log('');

    await this.sleep(1000);

    // Pattern 2: Relay (Client → Primary → Client)
    if (clients.length >= 2) {
      console.log('🔄 Pattern 2: Relay (Client → Primary → Client)');
      const client1Model = clients[0].getServerModel();
      const client2Model = clients[1].getServerModel();
      const relayScenario: any = {
        uuid: uuidv4(),
        objectType: 'ONCEMessage',
        version: this.model.version || 'unknown', // ✅ Use dynamic version
        state: {
          type: 'relay',
          from: { 
            uuid: client1Model.uuid, 
            port: client1Model.capabilities.find((c: any) => c.capability === 'httpPort')?.port || 0,
            host: client1Model.host // ✅ Add host field
          },
          to: { uuid: client2Model.uuid, port: client2Model.capabilities.find((c: any) => c.capability === 'httpPort')?.port || 0 },
          content: `Relay message from client 1 to client 2 via primary`,
          timestamp: new Date().toISOString(),
          sequence: 2
        },
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          creator: 'ONCE-demoMessages',
          description: 'Relay pattern demo message'
        }
      };
      clients[0].serverHierarchyManager.relayScenario(relayScenario, client2Model.uuid);
      this.model.messageTracker.sent.push(relayScenario);
      this.model.messageTracker.patterns.relay++;
      console.log(`   🔄 Sent relay: ${relayScenario.uuid}`);
      console.log(`   📍 Route: ${client1Model.uuid} → Primary → ${client2Model.uuid}`);
      console.log('');
    }

    await this.sleep(1000);

    // Pattern 3: P2P (Client → Client Direct)
    if (clients.length >= 2) {
      console.log('🔗 Pattern 3: P2P (Client → Client Direct)');
      const client1Model = clients[0].getServerModel();
      const client2Model = clients[1].getServerModel();
      const p2pPort = client2Model.capabilities.find((c: any) => c.capability === 'httpPort')?.port || 0;
      const p2pScenario: any = {
        uuid: uuidv4(),
        objectType: 'ONCEMessage',
        version: this.model.version || 'unknown', // ✅ Use dynamic version
        state: {
          type: 'p2p',
          from: { uuid: client1Model.uuid, port: client1Model.capabilities.find((c: any) => c.capability === 'httpPort')?.port || 0 },
          to: { uuid: client2Model.uuid, port: p2pPort },
          content: `Direct P2P message from client 1 to client 2`,
          timestamp: new Date().toISOString(),
          sequence: 3
        },
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          creator: 'ONCE-demoMessages',
          description: 'P2P pattern demo message'
        }
      };
      clients[0].serverHierarchyManager.sendScenarioToPeer(p2pScenario, p2pPort);
      this.model.messageTracker.sent.push(p2pScenario);
      this.model.messageTracker.patterns.p2p++;
      console.log(`   🔗 Sent P2P: ${p2pScenario.uuid}`);
      console.log(`   📍 Direct: ${client1Model.uuid} → ${client2Model.uuid}`);
      console.log('');
    }

    await this.sleep(2000);

    // Summary
    console.log('📊 Message Exchange Summary:');
    console.log(`   📤 Messages sent: ${this.model.messageTracker.sent.length}`);
    console.log(`   📡 Broadcasts: ${this.model.messageTracker.patterns.broadcast}`);
    console.log(`   🔄 Relays: ${this.model.messageTracker.patterns.relay}`);
    console.log(`   🔗 P2P: ${this.model.messageTracker.patterns.p2p}`);
    console.log('');

    // Export JSON report
    const report = {
      timestamp: new Date().toISOString(),
      configuration: {
        primary: { uuid: primaryModel.uuid, port: 42777 },
        clients: clients.map(c => {
          const m = c.getServerModel();
          return { uuid: m.uuid, port: m.capabilities.find((cap: any) => cap.capability === 'httpPort')?.port };
        })
      },
      messages: this.model.messageTracker.sent,
      patterns: this.model.messageTracker.patterns
    };

    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const reportPath = path.join(dirname, '../../../scenarios/message-exchange-report.json');
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`💾 JSON report saved: ${reportPath}`);
    console.log('');

    console.log('🔒 Demo complete! Servers running. Press [q] or Ctrl+C to stop.');
    console.log('💡 Open browsers to see live message logs:');
    console.log(`   Primary: http://localhost:42777/once`);
    for (let i = 0; i < clients.length; i++) {
      const clientModel = clients[i].getServerModel();
      const port = clientModel.capabilities.find((c: any) => c.capability === 'httpPort')?.port || 0;
      console.log(`   Client ${i + 1}: http://localhost:${port}/once`);
    }
    console.log('');
    console.log('🌐 Opening demo hub...');
    await this.openBrowser(`http://localhost:42777/demo`);
    console.log('');

    // Setup cleanup
    const cleanup = async () => {
      console.log('\n🛑 Shutting down...');
      // Restore stdin
      if (process.stdin.isTTY && process.stdin.setRawMode) {
        process.stdin.setRawMode(false);
      }
      for (const client of clients) {
        await client.stopServer().catch(() => {});
      }
      await this.stopServer().catch(() => {});
      process.exit(0);
    };

    // Setup 'q' key handler
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      
      const keyHandler = async (key: string) => {
        if (key === 'q' || key === 'Q' || key === '\u0003') { // 'q', 'Q', or Ctrl+C
          process.stdin.removeListener('data', keyHandler);
          await cleanup();
        }
      };
      
      process.stdin.on('data', keyHandler);
    }

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Keep alive - but allow process to exit naturally if stdin closes
    return new Promise((resolve) => {
      // Resolve on stdin end (e.g., piped input or CI environment)
      process.stdin.on('end', () => {
        cleanup().then(() => resolve(this));
      });
    });
  }

  /**
   * Build component (TypeScript compilation)
   * Delegates to Web4TSComponent for DRY architecture
   * @cliHide
   */
  async build(): Promise<this> {
    return this.delegateToWeb4TS('build');
  }

  /**
   * Clean component build artifacts
   * Delegates to Web4TSComponent for DRY architecture
   * @cliHide
   */
  async clean(): Promise<this> {
    return this.delegateToWeb4TS('clean');
  }

  /**
   * Show component directory tree structure
   * Delegates to Web4TSComponent for DRY architecture
   * @param depth Maximum depth to show (default: 4)
   * @param showHidden Whether to show hidden files (default: false)
   * @cliHide
   */
  async tree(depth: string = '4', showHidden: string = 'false'): Promise<this> {
    return this.delegateToWeb4TS('tree', depth, showHidden);
  }

  /**
   * Show semantic version links (dev, test, prod, latest)
   * Delegates to Web4TSComponent for DRY architecture
   * @param action Optional action (e.g., 'repair' to fix broken links)
   * @cliHide
   */
  async links(action: string = ''): Promise<this> {
    return this.delegateToWeb4TS('links', action);
  }

  /**
   * Set CI/CD semantic links for a component version
   * Delegates to Web4TSComponent for DRY architecture
   * @param targetVersion Semantic link to set: 'dev', 'latest', 'prod', 'test'
   * @param version Version to point to (default: 'current')
   * @cliSyntax targetVersion version
   * @cliDefault version current
   * @cliValues targetVersion dev latest prod test
   */
  async setCICDVersion(targetVersion: string, version: string = 'current'): Promise<this> {
    return this.delegateToWeb4TS('setCICDVersion', targetVersion, version);
  }
}
