/**
 * NodeJsOnce v0.3.21.6 - Node.js ONCE Kernel Implementation
 * Extended from DefaultOnceKernel for unified architecture
 * Domain logic preserved: peer hierarchy, scenario management, lifecycle events
 * 
 * @pdca session/2025-11-25-UTC-1930.iteration-01.10-once-naming-convention-standardization.pdca.md
 */

import { DefaultOnceKernel } from './DefaultOnceKernel.js';
import type { ONCEKernel } from '../layer3/ONCE.interface.js';
import type { ONCE as ONCEInterface } from '../layer3/ONCE.interface.js';
import type { EnvironmentInfo } from '../layer3/EnvironmentInfo.interface.js';
import { DefaultEnvironmentInfo } from './DefaultEnvironmentInfo.js';
import type { ComponentQuery } from '../layer3/ComponentQuery.interface.js';
import type { PerformanceMetrics } from '../layer3/PerformanceMetrics.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { Component } from '../layer3/Component.interface.js';
import { IOR } from '../layer4/IOR.js';
import { LifecycleEventType, LifecycleState } from '../layer3/LifecycleEvents.js';
import { LifecycleObserver } from '../layer3/LifecycleObserver.interface.js';
// ⚠️ DEPRECATED imports (functional pattern, will be removed):
type LifecycleEventHandler = (event: any) => void | Promise<void>;
type LifecycleHooks = Record<string, LifecycleEventHandler>;
// ONCEServerModel removed - using ONCEPeerModel (MC.1 complete)
import type { ServerCapability } from '../layer3/ServerCapability.interface.js';
import { ServerHierarchyManager } from './ServerHierarchyManager.js';
import { ScenarioManager } from './ScenarioManager.js';
import { ONCEModel } from '../layer3/ONCEModel.interface.js';
import { SemanticVersion } from './SemanticVersion.js';
import type { ONCEPeerModel } from '../layer3/ONCEPeerModel.interface.js';
import { User } from '../layer3/User.interface.js';
import { MethodSignature } from '../layer3/MethodSignature.interface.js';
import { DefaultUser } from './DefaultUser.js';
import { NodeOSInfrastructure } from '../layer1/NodeOSInfrastructure.js';
import { IDProvider } from '../layer3/IDProvider.interface.js';
import { UUIDProvider } from './UUIDProvider.js';
import { UcpStorage } from './UcpStorage.js';
import { ScenarioService } from './ScenarioService.js';
import { PersistenceManager } from '../layer3/PersistenceManager.interface.js';
import type { StorageScenario } from '../layer3/StorageScenario.interface.js';
import * as path from 'path';  // For version extraction from directory path
import * as crypto from 'crypto';  // For UUID generation
import * as fs from 'fs';  // For file system operations
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
export class NodeJsOnce extends DefaultOnceKernel<ONCEModel> implements ONCEInterface {
  // Model type is ONCEModel via generic inheritance
  // Access via this.model getter from UcpComponent
  
  /**
   * Default model for NodeJsOnce
   * Required by UcpComponent (abstract in DefaultOnceKernel)
   */
  protected modelDefault(): ONCEModel {
    return {
      uuid: crypto.randomUUID(),
      name: '',
      origin: '',
      definition: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      component: 'ONCE',
      version: '0.0.0.0',     // Will be discovered in discoverPathsFromFilesystem()
      state: LifecycleState.CREATED,
      initialized: false,
      initializationTime: 0,
      eventHandlers: new Map(),
      // Paths discovered in discoverPathsFromFilesystem()
      componentRoot: '',
      projectRoot: '',
      targetDirectory: '',
      targetComponentRoot: '',
      isTestIsolation: false,
      // Primary Server IOR with Failover
      primaryServerIor: 'ior:https://localhost:42777/ONCE/0.0.0.0/primary-server-uuid'
    };
  }
  private web4ts?: any; // Lazy-initialized Web4TSComponent for delegation (dynamic import, no static dependency)
  private user?: User; // Optional User service (lazy initialization)
  private methods: Map<string, MethodSignature> = new Map();
  private idProvider: IDProvider; // ✅ Web4 Principle 20: Radical OOP ID generation
  
  // ✅ Web4 Principle 24: PersistenceManager for RelatedObjects lookup
  private scenarioStorage: UcpStorage | null = null;
  
  // ✅ ScenarioService: Single point of truth for scenario operations
  private scenarioServiceInstance: ScenarioService | null = null;
  
  // Enhanced managers for v0.2.0.0+ domain logic
  private serverHierarchyManager: ServerHierarchyManager;
  private scenarioManager: ScenarioManager;

  /**
   * ✅ Extends AbstractONCEKernel (unified architecture v0.3.21.6)
   * Constructor has minimal initialization for backward compatibility
   * Full refactoring to empty constructor + init() pattern in future iteration
   * 
   * @pdca session/2025-11-22-UTC-2200.iteration-01.8-unified-kernel-architecture.pdca.md
   * @pdca 2025-12-12-UTC-2300.i9-1-ucpmodel-class.pdca.md - Uses UcpModel
   */
  constructor() {
    super(); // AbstractONCEKernel (unified architecture)
    
    // ✅ Web4 Pattern: Minimal constructor
    
    // ✅ Web4 Principle 20: Initialize ID provider (testable, replaceable)
    this.idProvider = new UUIDProvider();
    
    // ✅ Initialize UcpModel synchronously for constructor-based initialization
    // Note: This is a legacy pattern; prefer async init() for new code
    this.initSync();
    
    // ✅ Synchronous path discovery (needed for CLI to work)
    this.discoverPathsFromFilesystem();
    
    // Initialize managers (domain logic from 0.2.0.0)
    // ✅ Web4 Principle 20: Inject IDProvider into managers
    this.serverHierarchyManager = new ServerHierarchyManager(this.idProvider);
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
  static start(scenario?: any): NodeJsOnce {
    // Create instance
    const once = new NodeJsOnce();
    
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
      const componentRoot = currentVersionDir;
      
      // ✅ Derive projectRoot from componentRoot
      // Path: /path/to/project/components/ONCE/0.3.21.6
      // projectRoot: /path/to/project
      const componentsDir = path.resolve(componentRoot, '..', '..'); // up to components/
      const projectRoot = path.resolve(componentsDir, '..'); // up to project root
      
      // Set component's own discovered paths
      this.model.componentRoot = componentRoot;
      this.model.projectRoot = projectRoot;
      this.model.version = versionString;
      
      // Detect test isolation: check if we're running from test/data
      const isTestIsolation = componentRoot.includes('/test/data/');
      this.model.isTestIsolation = isTestIsolation;
      
      console.log(`🔍 [PATH DISCOVERY] componentRoot=${componentRoot} projectRoot=${projectRoot} isTestIsolation=${isTestIsolation}`);
    } catch (error) {
      // Fallback: if path discovery fails, keep defaults
      console.warn('⚠️  Path discovery failed, using defaults:', error);
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

    // WM.3: Use ONCE's inline DefaultWeb4TSComponent (no external dependency)
    // @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
    const { DefaultWeb4TSComponent } = await import('./DefaultWeb4TSComponent.js');

    // ✅ CRITICAL: Initialize Web4TSComponent for delegation
    const web4ts = new DefaultWeb4TSComponent();
    await web4ts.init();
    web4ts.model!.componentRoot = componentRoot;
    web4ts.model!.projectRoot = projectRoot;
    web4ts.model!.targetDirectory = projectRoot;
    web4ts.model!.targetComponentRoot = componentRoot;
    web4ts.model!.componentsDirectory = path.dirname(path.dirname(componentRoot));
    // WM.3 Fix: Set version to match ONCE component version
    if (this.model.version) {
      const semVer = new SemanticVersion().init();
      semVer.parse(this.model.version);
      web4ts.model!.version = semVer;
      web4ts.model!.displayVersion = this.model.version;
    }
    web4ts.model!.displayName = this.model.component || 'ONCE';
    web4ts.model!.component = this.model.component || 'ONCE';
    this.web4ts = web4ts;

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
   * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md - B.6 UcpComponent base
   * @cliHide
   */
  async init(scenario?: Scenario<ONCEPeerModel>): Promise<this> {
    // Paths already discovered in constructor via _discoverPaths()
    
    // ✅ Always transition to INITIALIZING (even without scenario)
    if (this.getLifecycleState() === LifecycleState.CREATED) {
      this.transitionTo(LifecycleState.INITIALIZING, LifecycleEventType.BEFORE_INIT);
    }
    
    // Process scenario (Scenario<ONCEPeerModel> format)
    if (scenario && typeof scenario === 'object' && 'model' in scenario) {
      console.log(`🔍 [PATH] DefaultONCE.init() BEFORE: projectRoot=${this.model.projectRoot} componentRoot=${this.model.componentRoot}`);
      // Store the scenario and merge model data
      this.model.scenario = scenario;
      if (scenario.model) {
        Object.assign(this.model, scenario.model);
      }
      console.log(`🔍 [PATH] DefaultONCE.init() AFTER: projectRoot=${this.model.projectRoot} componentRoot=${this.model.componentRoot} isTestIsolation=${this.model.isTestIsolation}`);
    }
    
    // Discover methods for CLI completion (redundant if called in constructor, but safe)
    this.discoverMethods();
    
    // Update model paths (TRUE Radical OOP)
    await this.updateModelPaths();

    // ✅ Web4 Principle 24: Initialize PersistenceManager and register in RelatedObjects
    await this.storageInitialize();

    // Initialize ONCE kernel if scenario provided
    if (this.model.scenario && !this.model.initialized) {
      const startTime = Date.now();
      console.log(`🚀 Initializing ONCE v${this.model.version}...`);

      try {
        const scenarioUuid = this.model.scenario.ior?.uuid || this.model.scenario.model?.uuid;
        console.log(`📂 Loading from scenario: ${scenarioUuid}`);
        
        await this.loadFromScenario(this.model.scenario);

        this.model.initialized = true;
        this.model.initializationTime = Date.now() - startTime;

        console.log(`✅ ONCE v${this.model.version} initialized in ${this.model.initializationTime}ms`);
      } catch (error) {
        console.error('❌ ONCE initialization failed:', error);
        // ✅ Transition to ERROR state
        this.transitionTo(LifecycleState.ERROR, LifecycleEventType.ERROR, { error });
        throw error;
      }
    }
    
    // ✅ Always transition to INITIALIZED (even without scenario)
    if (this.getLifecycleState() === LifecycleState.INITIALIZING) {
      this.transitionTo(LifecycleState.INITIALIZED, LifecycleEventType.AFTER_INIT, {
        initializationTime: this.model.initializationTime || 0
      });
      this.model.initialized = true;
    }
    
    return this;
  }

  /**
   * ✅ TRUE Radical OOP: toScenario() - Return Web4 Standard format with ONCEPeerModel
   * ✅ Uses insourced DefaultUser for owner generation
   * ✅ Async to support User.toScenario()
   * @pdca 2025-12-17-UTC-1750.browseronce-oncekernel-interface.pdca.md
   * @cliHide
   */
  async toScenario(): Promise<Scenario<ONCEPeerModel>> {
    // 1️⃣ Get unified peer model
    const peerModel = this.getPeerModel();
    
    // 2️⃣ Generate owner using insourced DefaultUser (Web4 pattern)
    let ownerData: string;
    try {
      const infrastructure = new NodeOSInfrastructure();
      await infrastructure.init();
      const username = 'system';
      
      const projectRoot = this.serverHierarchyManager.getProjectRoot();
      const scenarioService = this.scenarioServiceGet();
      const user = await DefaultUser.create(username, infrastructure, projectRoot, scenarioService || undefined);
      
      const userScenario = await user.toScenario();
      const ownerJson = JSON.stringify(userScenario);
      ownerData = Buffer.from(ownerJson).toString('base64');
    } catch (error) {
      // ✅ Fallback: Generate minimal User-like scenario
      const fallbackJson = JSON.stringify({
        ior: { uuid: peerModel.uuid, component: 'User', version: '0.3.21.1' },
        owner: '',
        model: { user: 'system', hostname: peerModel.host, uuid: peerModel.uuid }
      });
      ownerData = Buffer.from(fallbackJson).toString('base64');
    }
    
    // 3️⃣ Return Web4 Standard format with ONCEPeerModel
    return {
      ior: {
        uuid: peerModel.uuid,
        component: 'ONCE',
        version: peerModel.version
      },
      owner: ownerData,
      model: peerModel
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📦 STORAGE & PERSISTENCE - Web4 Principle 24: RelatedObjects Registry
  // @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize UcpStorage and register in RelatedObjects
   * 
   * ✅ Web4 Principle 24: PersistenceManager lookup via RelatedObjects
   * ✅ Web4 Principle 6: Empty constructor + init()
   * 
   * @cliHide
   */
  private async storageInitialize(): Promise<void> {
    const projectRoot = this.model.projectRoot;
    if (!projectRoot) {
      console.warn('[NodeJsOnce] Cannot initialize storage: projectRoot not set');
      return;
    }

    const indexBaseDir = path.join(projectRoot, 'scenarios', 'index');
    
    // Create storage scenario
    const storageScenario: StorageScenario = {
      ior: {
        uuid: crypto.randomUUID(),
        component: 'UcpStorage',
        version: this.model.version || '0.3.21.9'
      },
      owner: 'system',
      model: {
        uuid: crypto.randomUUID(),
        projectRoot,
        indexBaseDir,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    // Initialize storage
    this.scenarioStorage = new UcpStorage().init(storageScenario);
    
    // ✅ Register in RelatedObjects for lookup
    if (this.controller) {
      this.controller.relatedObjectRegister(PersistenceManager, this.scenarioStorage);
      console.log('[NodeJsOnce] ✅ PersistenceManager registered in RelatedObjects');
    }
    
    // ✅ Initialize ScenarioService (single point of truth)
    this.scenarioServiceInstance = new ScenarioService().init({
      persistenceManager: this.scenarioStorage,
      component: this as any,
      componentName: 'ONCE',
      componentVersion: this.model.version || '0.3.21.9',
    });
    console.log('[NodeJsOnce] ✅ ScenarioService initialized');
  }

  /**
   * Get PersistenceManager from RelatedObjects
   * 
   * @returns UcpStorage instance or null
   */
  persistenceManagerGet(): UcpStorage | null {
    if (this.controller) {
      return this.controller.relatedObjectLookupFirst(PersistenceManager) as UcpStorage | null;
    }
    return this.scenarioStorage;
  }
  
  /**
   * Get ScenarioService (single point of truth for scenario operations)
   * 
   * @returns ScenarioService instance or null
   */
  scenarioServiceGet(): ScenarioService | null {
    return this.scenarioServiceInstance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔌 ONCE Domain Methods - Preserved from v0.2.0.0 (lines 114-319)
  // @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md - Domain logic unchanged
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Load ONCE from scenario (domain logic from 0.2.0.0)
   * ✅ MC.3: Now accepts Scenario<ONCEPeerModel>
   * @cliHide
   */
  private async loadFromScenario(scenario: Scenario<ONCEPeerModel>): Promise<void> {
    if (scenario.ior.component !== 'ONCE') {
      throw new Error(`Invalid scenario type: ${scenario.ior.component}`);
    }

    // Load server model from scenario
    const serverModel = this.scenarioManager.createServerModelFromScenario(scenario);
    console.log(`🔄 Loaded server model from scenario: ${serverModel.uuid}`);
    this.model.serverModel = serverModel;
  }

  /**
   * Start peer with automatic port detection (42777 → 8080+)
   * Web4 Principle 16: {noun}{verb} naming pattern
   * 
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/peerStart
   * @cliSyntax peerStart [scenario]
   */
  async peerStart(scenario?: string | Scenario<ONCEPeerModel>): Promise<void> {
    console.log('🚀 Starting ONCE peer...');
    return this._startPeerInternal(scenario);
  }

  /**
   * @deprecated Use peerStart() instead - Web4 Principle 16 naming convention
   * Start server with automatic port management (domain logic from 0.2.0.0)
   * @cliSyntax scenario
   */
  async startServer(scenario?: string | Scenario<ONCEPeerModel>): Promise<void> {
    console.warn('⚠️  startServer() is deprecated, use peerStart() instead');
    console.log('🚀 Starting ONCE server...');
    return this._startPeerInternal(scenario);
  }

  /**
   * Internal peer start implementation
   * @internal
   */
  private async _startPeerInternal(scenario?: string | Scenario<ONCEPeerModel>): Promise<void> {
    
    try {
      // Initialize if not already initialized
      if (!this.model.initialized) {
        // ✅ Filter out CLI keywords that are not scenarios
        // "primary" and "client" are command keywords, not scenario paths
        const isKeyword = typeof scenario === 'string' && ['primary', 'client'].includes(scenario.toLowerCase());
        const initScenario = (scenario && typeof scenario !== 'string' && !isKeyword) ? scenario : undefined;
        await this.init(initScenario);
      }
      
      // ✅ Transition to STARTING state (after init if needed)
      this.transitionTo(LifecycleState.STARTING, LifecycleEventType.BEFORE_START);

      // ✅ Detect environment using Layer 1 infrastructure (TRUE Radical OOP)
      await this.serverHierarchyManager.detectAndSetEnvironment();
      
      // Start server hierarchy
      await this.serverHierarchyManager.startServer();
      
      // Store server model in our model
      this.model.serverModel = this.serverHierarchyManager.getServerModel();
      
      // ✅ CRITICAL: Sync kernel UUID with server UUID for IOR routing
      // IOR URLs use the server's UUID, so the kernel must have the same UUID
      // for IORMethodRouter.lookupComponent() to match correctly
      this.model.uuid = this.model.serverModel.uuid;
      
      // Save current state as scenario (Web4 Standard format)
      const web4Scenario = await this.toScenario();
      await this.scenarioManager.saveScenario(web4Scenario);
      
      // ✅ Transition to RUNNING state
      this.transitionTo(LifecycleState.RUNNING, LifecycleEventType.AFTER_START);
      
      // ✅ Broadcast scenario update to all peers (protocol-less)
      await this.sendScenarioUpdate();
      
    } catch (error) {
      // ✅ Transition to ERROR state
      this.transitionTo(LifecycleState.ERROR, LifecycleEventType.ERROR, { error });
      throw error;
    }
  }

  /**
   * Send scenario update to all connected peers (protocol-less state transfer)
   * ✅ Web4 Principle 11: Protocol-Less Communication
   * ✅ Broadcasts full scenario to primary server and browser peers
   * @pdca 2025-11-26-UTC-0215.iteration-01.14-websocket-state-transfer-completion.pdca.md
   */
  async sendScenarioUpdate(): Promise<void> {
    try {
      // Generate current scenario
      const scenario = await this.toScenario();
      
      // Broadcast to all connected peers via ServerHierarchyManager
      this.serverHierarchyManager.broadcastScenario(scenario);
      
      console.log(`📡 Scenario update broadcast: ${scenario.ior?.uuid || 'unknown'}`);
    } catch (error) {
      console.error('❌ Failed to send scenario update:', error);
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
  isPrimary(): boolean {
    return this.serverHierarchyManager.isPrimary();
  }

  /**
   * Get all registered server instances (domain logic from 0.2.0.0)
   */
  getRegisteredServers(): any[] {
    return this.serverHierarchyManager.getRegisteredServers();
  }

  /**
   * Get current server model (domain logic from 0.2.0.0)
   * @deprecated Use getPeerModel() for unified access
   */
  getServerModel(): ONCEPeerModel {
    return this.serverHierarchyManager.getServerModel();
  }

  /**
   * Get unified peer model
   * Returns unified ONCEPeerModel from current state
   * @pdca session/2025-12-17-UTC-1750.browseronce-oncekernel-interface.pdca.md
   */
  getPeerModel(): ONCEPeerModel {
    const serverModel = this.serverHierarchyManager?.getServerModel();
    
    // Handle case where server model not yet initialized
    if (!serverModel) {
      return {
        uuid: this.model.uuid || 'uninitialized',
        name: this.model.name || 'NodeJsONCEKernel',
        version: this.model.version || '0.0.0.0',
        environment: new DefaultEnvironmentInfo(),
        state: this.model.state || LifecycleState.CREATED,
        startTime: new Date(),
        connectionTime: null,
        host: 'localhost',
        port: 42777,
        isPrimary: false,
        primaryPeerUuid: null,
        peers: []
      };
    }
    
    return {
      // Identity
      uuid: this.model.uuid,
      name: this.model.name || 'NodeJsONCEKernel',
      
      // Version
      version: this.model.version || '0.0.0.0',
      
      // Environment
      environment: serverModel.environment,
      
      // Lifecycle
      state: this.model.state || LifecycleState.CREATED,
      startTime: new Date(),
      connectionTime: null,
      
      // Network
      host: serverModel.host,
      port: serverModel.capabilities?.find(c => c.capability === 'httpPort')?.port || 42777,
      isPrimary: serverModel.isPrimary,
      primaryPeerUuid: serverModel.primaryPeerUuid || null,
      
      // P2P
      peers: this.serverHierarchyManager.getRegisteredServers().map(s => ({
        uuid: s.uuid || s.model?.uuid,
        name: s.hostname || s.model?.hostname,
        version: s.version || s.model?.version || '0.0.0.0',
        environment: s.environment || s.model?.environment || s.platform,
        state: s.state || s.model?.state,
        startTime: new Date(),
        connectionTime: null,
        host: s.host || s.model?.host,
        port: s.capabilities?.find((c: ServerCapability) => c.capability === 'httpPort')?.port 
              || s.model?.capabilities?.find((c: ServerCapability) => c.capability === 'httpPort')?.port || 0,
        isPrimary: s.isPrimary ?? s.model?.isPrimary,
        primaryPeerUuid: null,
        peers: []
      })),
      
      // Node-specific
      pid: serverModel.pid,
      capabilities: serverModel.capabilities
    };
  }

  /**
   * Create scenario from current state
   * @cliHide
   */
  private createCurrentScenario(): Scenario<ONCEPeerModel> {
    const serverModel = this.serverHierarchyManager.getServerModel();
    return this.scenarioManager.createScenarioFromServerModel(serverModel);
  }

  // ========================================
  // ONCE INTERFACE PLACEHOLDER IMPLEMENTATIONS
  // ========================================
  
  // Placeholder implementations for ONCE interface methods (domain logic from 0.2.0.0)

  async startComponent(componentIOR: IOR, scenario?: Scenario<ONCEPeerModel>): Promise<Component> {
    throw new Error(`startComponent not implemented in v${this.model.version}`);
  }

  async saveAsScenario(component: Component): Promise<Scenario<ONCEPeerModel>> {
    throw new Error(`saveAsScenario not implemented in v${this.model.version}`);
  }

  async loadScenario(scenario: Scenario<ONCEPeerModel>): Promise<Component> {
    throw new Error(`loadScenario not implemented in v${this.model.version}`);
  }

  getEnvironment(): EnvironmentInfo {
    return DefaultEnvironmentInfo.createNodeEnvironment(
      process.version,
      this.detectHostname(),
      '127.0.0.1'
    ).getModel();
  }

  async registerComponent(component: Component, ior: IOR): Promise<void> {
    console.log(`📋 Component registration: ${ior.toString()}`);
  }

  async discoverComponents(query?: ComponentQuery): Promise<IOR[]> {
    return [];
  }

  async connectPeer(peerIOR: IOR): Promise<void> {
    console.log(`🤝 Peer connection: ${peerIOR.model.uuid}`);
  }

  async exchangeScenario(peerIOR: IOR, scenario: Scenario<ONCEPeerModel>): Promise<void> {
    console.log(`🔄 Scenario exchange with ${peerIOR.model.uuid}`);
  }

  isInitialized(): boolean {
    return this.model.initialized || false;
  }

  getVersion(): string {
    // ✅ Web4: Version from semantic versioning (directory structure), not hardcoded
    return this.model.version || '0.0.0.0'; // Fallback only if discovery failed
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
   * Stop peer gracefully
   * Web4 Principle 16: {noun}{verb} naming pattern
   * 
   * WITHOUT scenario: Stops the current peer (self)
   * WITH scenario: Loads scenario and sends graceful shutdown message to that peer
   * 
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/peerStop
   * @param scenario Optional scenario UUID or path to stop a specific peer
   * @cliSyntax peerStop [scenario]
   */
  async peerStop(scenario?: string): Promise<void> {
    return this._stopPeerInternal(scenario);
  }

  /**
   * @deprecated Use peerStop() instead - Web4 Principle 16 naming convention
   * Stop server gracefully (domain logic from 0.2.0.0)
   * WITHOUT scenario: Stops the current server (self)
   * WITH scenario: Loads scenario and sends graceful shutdown message to that server
   * 
   * @param scenario Optional scenario UUID or path to stop a specific server
   * @cliSyntax scenario
   */
  async stopServer(scenario?: string): Promise<void> {
    console.warn('⚠️  stopServer() is deprecated, use peerStop() instead');
    return this._stopPeerInternal(scenario);
  }

  /**
   * Internal peer stop implementation
   * @internal
   */
  private async _stopPeerInternal(scenario?: string): Promise<void> {
    // Only process if scenario is a non-empty string
    if (scenario && typeof scenario === 'string' && scenario.trim().length > 0) {
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
      
      // Extract server info from scenario (MC.3: ONCEPeerModel fields)
      const serverUUID = loadedScenario.model.uuid;
      const port = loadedScenario.model.capabilities?.find((c: any) => c.capability === 'httpPort')?.port || loadedScenario.model.port;
      const isPrimary = loadedScenario.model.isPrimary === true;
      
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
    // ✅ Transition to STOPPING state
    this.transitionTo(LifecycleState.STOPPING, LifecycleEventType.BEFORE_STOP);
    
    // ✅ Broadcast STOPPING state to peers
    await this.sendScenarioUpdate();
    
    await this.serverHierarchyManager.stopServer();
    
    // ✅ Transition to STOPPED state
    this.transitionTo(LifecycleState.STOPPED, LifecycleEventType.AFTER_STOP);
    
    // ✅ Broadcast STOPPED state to peers
    await this.sendScenarioUpdate();
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
    
    console.log(`🎭 ONCE v${this.model.version} Demo Starting...`);
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
      console.log('🌐 Server hierarchy: Port 42777 → 8080+');
      console.log('');
      
      console.log('ℹ️  Demo initialized - Server hierarchy with P2P communication');
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
    const httpCapability = serverModel.capabilities?.find(c => c.capability === 'httpPort');
    
    if (httpCapability) {
      const port = httpCapability.port;
      const url = `http://localhost:${port}`;
      
      console.log('');
      console.log('✅ ONCE Server Running:');
      console.log(`   🌐 URL: ${url}`);
      console.log(`   🏠 Domain: ${serverModel.domain}`);
      console.log(`   📋 UUID: ${serverModel.uuid}`);
      console.log(`   ⚡ Type: ${serverModel.isPrimary ? '🟢 Primary Server (42777)' : '🔵 Client Server'}`);
      console.log('');
      
      if (serverModel.isPrimary) {
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
      if (serverModel.isPrimary) {
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
    console.log(`🧪 ONCE v${this.model.version} Test Sequence: "${sequence}"`);
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
              const httpCapability = serverModel.capabilities?.find(c => c.capability === 'httpPort');
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
            const httpCapability = serverModel.capabilities?.find(c => c.capability === 'httpPort');
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
              const clientOnce = new NodeJsOnce();
              await clientOnce.init();
              await clientOnce.startServer();
              clientServers.push(clientOnce);
              const clientModel = clientOnce.getServerModel();
              const clientCapability = clientModel.capabilities?.find(c => c.capability === 'httpPort');
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
            if (this.isPrimary()) {
              const registeredServers = this.getRegisteredServers();
              console.log(`   📋 Registered servers: ${registeredServers.length}`);
              for (const server of registeredServers) {
                console.log(`      • ${server.uuid} on ${server.capabilities?.find((c: ServerCapability) => c.capability === 'httpPort')?.port}`);
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
   * ✅ TRUE Radical OOP: Simple promise-based delay (inherited from AbstractONCEKernel)
   * @cliHide
   */
  // Removed: sleep() is now inherited from AbstractONCEKernel as protected method

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
    console.log(`${bold}${cyan}║    ONCE Interactive Demo Controller v${this.model.version}  ║${reset}`);
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
            const httpCapability = serverModel.capabilities?.find(c => c.capability === 'httpPort');
            if (httpCapability) {
              console.log(`✅ Server started on port ${httpCapability.port}`);
              console.log(`   ${serverModel.isPrimary ? '🟢 Primary Server' : '🔵 Client Server'}`);
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
          const httpCapability = serverModel.capabilities?.find(c => c.capability === 'httpPort');
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
            
            const clientOnce = new NodeJsOnce();
            await clientOnce.init();
            await clientOnce.startServer();
            const clientModel = clientOnce.getServerModel();
            const clientCapability = clientModel.capabilities?.find(c => c.capability === 'httpPort');
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
            const port = sm.isPrimary ? 42777 : sm.capabilities?.find(c => c.capability === 'httpPort')?.port;
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
          console.log(`📋 ONCE v${this.model.version} - P2P Server Hierarchy`);
          console.log('🏠 Domain: local.once');
          console.log('🔧 Status: Interactive demo active');
          if (this.model.serverModel) {
            const sm = this.serverHierarchyManager.getServerModel();
            console.log(`🌐 Server: ${sm.isPrimary ? 'Primary (42777)' : 'Client'}`);
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
    const primaryInfo = serverModel.isPrimary ? null : {
      host: serverModel.primaryPeer?.host || 'localhost',
      port: serverModel.primaryPeer?.port || 42777,
      connected: !!(this.serverHierarchyManager as any).primaryServerConnection,
      domain: serverModel.domain
    };

    return {
      status: 'running',
      uuid: serverModel.uuid,
      isPrimary: serverModel.isPrimary,
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
   * Clear all browser caches and trigger server shutdown
   * 
   * For debugging: completely resets browser state and restarts server.
   * Browser must execute the returned instructions to clear:
   * - Cache Storage (all caches)
   * - IndexedDB (all databases)
   * - Service Worker (unregister)
   * 
   * Server shuts down after response is sent (caller must restart).
   * 
   * @returns Instructions for browser cache clearing + shutdown confirmation
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/cacheClear
   * @pdca 2025-12-20-UTC-2100.css-loading-verification.pdca.md
   */
  async cacheClear(): Promise<any> {
    console.log('🧹 [cacheClear] Clearing all caches and shutting down server...');
    
    // Schedule server shutdown after response is sent
    setTimeout(async () => {
      console.log('🛑 [cacheClear] Shutting down server...');
      if (this.serverHierarchyManager) {
        await this.serverHierarchyManager.stopServer();
      }
      // Force exit after graceful shutdown attempt
      setTimeout(() => {
        console.log('👋 [cacheClear] Server shutdown complete. Restart manually.');
        process.exit(0);
      }, 500);
    }, 100);
    
    // Return instructions for browser to execute
    return {
      action: 'cache-clear',
      instructions: {
        clearCacheStorage: true,
        clearIndexedDB: true,
        unregisterServiceWorker: true,
        serverShutdown: true
      },
      // JavaScript code for browser to execute (convenience)
      browserScript: `
        (async function() {
          console.log('🧹 Clearing all browser caches...');
          
          // 1. Clear Cache Storage
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('✅ Cache Storage cleared:', cacheNames.length, 'caches');
          }
          
          // 2. Clear IndexedDB
          if ('indexedDB' in window) {
            const databases = await indexedDB.databases();
            for (const db of databases) {
              if (db.name) {
                indexedDB.deleteDatabase(db.name);
                console.log('✅ IndexedDB deleted:', db.name);
              }
            }
          }
          
          // 3. Unregister Service Worker
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
              console.log('✅ Service Worker unregistered:', registration.scope);
            }
          }
          
          console.log('🧹 All caches cleared! Server is shutting down. Restart manually.');
          alert('Caches cleared! Server is shutting down. Restart with: ./once peerStart');
        })();
      `,
      message: 'Cache clear initiated. Server will shutdown after this response.'
    };
  }

  /**
   * Get asset manifest for CSS and HTML template preloading
   * Returns list of CSS files and HTML templates in layer5/views/
   * @returns Asset manifest with css and templates arrays
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/getAssetManifest
   * @pdca 2025-12-03-UTC-1400.lit-css-preload.pdca.md
   */
  async getAssetManifest(): Promise<{ css: string[]; templates: string[] }> {
    const componentRoot = this.model.componentRoot;
    const version = this.model.version;
    if (!componentRoot || !version) {
      return { css: [], templates: [] };
    }
    
    // URL Pattern: /{Component}/{version}/src/ts/layer5/views/css/*.css
    // Served by StaticFileRoute which resolves to: {projectRoot}/components/{Component}/{version}/...
    // @pdca 2025-12-03-UTC-1400.lit-css-preload.pdca.md
    const cssDir = path.join(componentRoot, 'src/ts/layer5/views/css');
    const templatesDir = path.join(componentRoot, 'src/ts/layer5/views/webBeans');
    
    const css: string[] = [];
    const templates: string[] = [];
    
    // Scan CSS directory
    try {
      const cssFiles = fs.readdirSync(cssDir);
      cssFiles.forEach(function(file: string) {
        if (file.endsWith('.css')) {
          // URL: /ONCE/0.3.21.9/src/ts/layer5/views/css/ItemView.css
          css.push(`/ONCE/${version}/src/ts/layer5/views/css/${file}`);
        }
      });
    } catch (e) {
      // Directory may not exist yet
      console.log('[AssetManifest] No CSS directory found');
    }
    
    // Scan templates directory
    try {
      const templateFiles = fs.readdirSync(templatesDir);
      templateFiles.forEach(function(file: string) {
        if (file.endsWith('.html')) {
          // URL: /ONCE/0.3.21.9/src/ts/layer5/views/webBeans/ItemView.html
          templates.push(`/ONCE/${version}/src/ts/layer5/views/webBeans/${file}`);
        }
      });
    } catch (e) {
      // Directory may not exist yet
      console.log('[AssetManifest] No templates directory found');
    }
    
    console.log(`[AssetManifest] Found ${css.length} CSS files, ${templates.length} templates`);
    
    return { css, templates };
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
    
    if (!serverModel.isPrimary) {
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
   * Serve ONCE P2P Communication Log HTML (demo page with full UI)
   * @returns Rendered HTML for P2P communication demo
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/serveOnceCommunicationLog
   * @pdca 2025-11-25-UTC-2030.iteration-01.11-once-route-refactoring.pdca.md
   */
  serveOnceCommunicationLog(): string {
    if (!this.serverHierarchyManager) {
      throw new Error('Server not initialized. Call startServer() first.');
    }
    
    return this.serverHierarchyManager.getOnceCommunicationLogHTML();
  }

  /**
   * Serve minimal ONCE bootstrap HTML (just loads BrowserOnce kernel)
   * @returns Minimal HTML for ONCE kernel bootstrap
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/serveOnceMinimal
   * @pdca 2025-11-25-UTC-2030.iteration-01.11-once-route-refactoring.pdca.md
   */
  serveOnceMinimal(): string {
    if (!this.serverHierarchyManager) {
      throw new Error('Server not initialized. Call startServer() first.');
    }
    
    return this.serverHierarchyManager.getOnceMinimalHTML();
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
   * Serve demo Lit MVC page (Web4 MVC Architecture)
   * @returns Rendered HTML for Lit-based demo page
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/serveDemoLit
   * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
   */
  serveDemoLit(): string {
    if (!this.serverHierarchyManager) {
      throw new Error('Server not initialized. Call startServer() first.');
    }
    
    return this.serverHierarchyManager.getDemoLitHTML();
  }

  /**
   * Serve ONCE App - Minimal SPA entry point
   * ALL logic in classes, NO floating functional code
   * @returns Rendered HTML for minimal SPA bootstrap
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/serveOnceApp
   * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
   */
  serveOnceApp(): string {
    if (!this.serverHierarchyManager) {
      throw new Error('Server not initialized. Call startServer() first.');
    }
    
    return this.serverHierarchyManager.getOnceAppHTML();
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
   * Serve default view HTML (Lit-based OncePeerDefaultView + RouteOverView)
   * @returns HTML page with Web4 Lit components
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/serveDefaultView
   * @pdca 2025-11-19-UTC-1800.iteration-tracking.pdca.md
   */
  serveDefaultView(): string {
    if (!this.serverHierarchyManager) {
      throw new Error('Server not initialized. Call startServer() first.');
    }
    
    const version = this.model.version || '0.3.21.9';
    const uuid = this.serverHierarchyManager.getServerModel().uuid;
    const hostname = this.serverHierarchyManager.getServerModel().hostname || 'localhost';
    const domain = this.serverHierarchyManager.getServerModel().domain || 'local.once';
    const isPrimary = this.serverHierarchyManager.isPrimary();
    const capabilities = this.serverHierarchyManager.getServerModel().capabilities || [];
    const httpCap = capabilities.find((c: any) => c.capability === 'httpPort');
    const peerHost = `${hostname}:${httpCap?.port || 42777}`;
    const peerCount = this.serverHierarchyManager.getRegisteredServers()?.length || 0;
    
    // Build capabilities JSON
    const capsJson = JSON.stringify(capabilities);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ONCE Server v${version}</title>
  <script type="importmap">
  {
    "imports": {
      "lit": "https://cdn.jsdelivr.net/gh/nickmessing/cdn@main/lit.js",
      "lit/": "https://cdn.jsdelivr.net/npm/lit@3.2.0/",
      "lit-html": "https://cdn.jsdelivr.net/npm/lit-html@3.2.0/lit-html.js",
      "lit-html/": "https://cdn.jsdelivr.net/npm/lit-html@3.2.0/",
      "@lit/reactive-element": "https://cdn.jsdelivr.net/npm/@lit/reactive-element@2.0.4/reactive-element.js",
      "lit-element/lit-element.js": "https://cdn.jsdelivr.net/npm/lit-element@4.1.0/lit-element.js"
    }
  }
  </script>
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <once-peer-default-view id="defaultView"></once-peer-default-view>
  
  <script type="module">
    // Import components via EAMD.ucp virtual root
    await import('/EAMD.ucp/components/ONCE/${version}/dist/ts/layer5/views/UcpView.js');
    await import('/EAMD.ucp/components/ONCE/${version}/dist/ts/layer5/views/OncePeerDefaultView.js');
    await import('/EAMD.ucp/components/ONCE/${version}/dist/ts/layer5/views/RouteOverView.js');
    
    // Set model on the default view
    const view = document.getElementById('defaultView');
    view.model = {
      uuid: '${uuid}',
      name: 'ONCE Server',
      version: '${version}',
      hostname: '${hostname}',
      domain: '${domain}',
      lifecycleState: 'running',
      isPrimary: ${isPrimary},
      capabilities: ${capsJson},
      peerCount: ${peerCount},
      peerHost: '${peerHost}'
    };
  </script>
</body>
</html>`;
  }

  /**
   * Start a new client server dynamically
   * @throws Error if component not initialized
   * @returns Scenario with pending state (actual status via WebSocket later)
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/startClientServer
   * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
   */
  async startClientServer(): Promise<Scenario<any>> {
    const { spawn } = await import('child_process');
    const componentDir = this.model.componentRoot;

    if (!componentDir) {
      throw new Error('Component not initialized');
    }

    // Generate UUID for new client server
    const newUUID = this.idProvider.create();
    
    console.log(`🚀 Spawning new client server (UUID: ${newUUID.substring(0, 8)}...)...`);
    
    // Fire and forget - spawn process without waiting
    // Use spawn with detached:true so it survives parent exit
    const child = spawn('./once', ['peerStart'], {
      cwd: componentDir,
      detached: true,
      stdio: 'ignore'  // Don't wait for output
    });
    
    // Unref so parent doesn't wait for child
    child.unref();
    
    console.log(`✅ Client server process spawned (PID: ${child.pid})`);
    
    // Return a scenario indicating server is starting
    // Real status will come via WebSocket scenario replication (Phase 2)
    const pendingScenario: Scenario<any> = {
      ior: {
        uuid: newUUID,
        component: 'ONCE',
        version: this.model.version || '0.3.21.9'
      },
      owner: 'system',
      model: {
        state: {
          state: 'STARTING',
          capabilities: []
        },
        isPrimary: false,
        spawnedAt: new Date().toISOString(),
        spawnedBy: this.model.uuid
      }
    };
    
    return pendingScenario;
  }

  /**
   * Discover peers via housekeeping
   * Web4 Principle 16: {noun}{verb} naming pattern
   * 
   * @returns Discovery result with deleted and discovered counts
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/peersDiscover
   * @cliSyntax peersDiscover
   */
  async peersDiscover(): Promise<import('../layer3/DiscoveryResult.interface.js').DiscoveryResult> {
    if (!this.serverHierarchyManager) {
      throw new Error('Peer not initialized. Call peerStart() first.');
    }

    console.log('🔍 Peer discovery triggered');
    const result = await this.serverHierarchyManager.performHousekeeping();
    
    return {
      deleted: result?.deleted || 0,
      discovered: result?.discovered || 0
    };
  }

  /**
   * @deprecated Use peersDiscover() instead - Web4 Principle 16 naming convention
   * Discover servers via housekeeping
   * @returns Discovery result with deleted and discovered counts
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/discoverServers
   * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
   */
  async discoverServers(): Promise<import('../layer3/DiscoveryResult.interface.js').DiscoveryResult> {
    console.warn('⚠️  discoverServers() is deprecated, use peersDiscover() instead');
    return this.peersDiscover();
  }

  /**
   * Stop all peers gracefully (Primary only)
   * Web4 Principle 16: {noun}{verb} naming pattern
   * 
   * When called from CLI without a running server, this method:
   * 1. Discovers the primary peer from scenarios
   * 2. Sends an IOR HTTP request to shut it down
   * 
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/peerStopAll
   * @cliSyntax peerStopAll
   */
  async peerStopAll(): Promise<void> {
    // If we have a running server (started via peerStart), use direct shutdown
    const serverModel = this.serverHierarchyManager?.getServerModel?.();
    const isServerRunning = serverModel?.state === LifecycleState.RUNNING || 
                            serverModel?.state === LifecycleState.PRIMARY_SERVER ||
                            serverModel?.state === LifecycleState.CLIENT_SERVER;
    
    if (isServerRunning) {
      console.log('🛑 Graceful shutdown of all peers initiated (direct)');
      await this.serverHierarchyManager!.shutdownAllServers();
      return;
    }

    // CLI mode: Find primary peer and send IOR request
    console.log('🔍 Looking for primary peer...');
    const primaryPeer = await this.discoverPrimaryPeer();
    
    if (!primaryPeer) {
      console.log('ℹ️  No primary peer found - nothing to stop');
      // Exit cleanly when called from CLI
      setTimeout(() => process.exit(0), 100);
      return;
    }

    console.log(`📡 Found primary peer: ${primaryPeer.uuid} on port ${primaryPeer.port}`);
    console.log('🛑 Sending shutdown request via IOR...');
    
    // Send IOR request to primary peer with abort controller for timeout
    const iorUrl = `http://localhost:${primaryPeer.port}/ONCE/${this.model.version}/${primaryPeer.uuid}/peerStopAll`;
    
    try {
      // Use AbortController for timeout - the server may close connection during shutdown
      const controller = new AbortController();
      const timeoutId = setTimeout(function abortTimeout() { controller.abort(); }, 3000); // 3s timeout
      
      const ior = await new IOR().init(iorUrl);
      await ior.load({ signal: controller.signal });
      
      clearTimeout(timeoutId);
      console.log('✅ Shutdown request sent successfully');
      console.log('🛑 All peers should be shutting down...');
    } catch (error: any) {
      // Connection refused likely means server already stopped
      // Abort errors are expected - server may close connection during shutdown
      if (error.code === 'ECONNREFUSED') {
        console.log('ℹ️  Primary peer is not responding (may already be stopped)');
      } else if (error.name === 'AbortError') {
        // Timeout - but shutdown was likely triggered
        console.log('✅ Shutdown request sent (server may be shutting down)');
      } else if (error.cause?.code === 'ECONNRESET') {
        // Connection reset - server closed during request (expected during shutdown)
        console.log('✅ Shutdown request sent (server is shutting down)');
      } else {
        console.error(`❌ Failed to send shutdown request: ${error.message}`);
      }
    }
    
    // Exit cleanly when called from CLI (no server running)
    process.exit(0);
  }

  /**
   * Discover the primary peer from scenario files
   * Looks for a peer on port 42777 that is in RUNNING state
   * 
   * @returns Primary peer info or null if not found
   * @internal
   */
  private async discoverPrimaryPeer(): Promise<{ uuid: string; port: number } | null> {
    const fs = await import('fs');
    const path = await import('path');
    
    const projectRoot = this.model.projectRoot || process.cwd();
    const scenariosDir = path.join(projectRoot, 'scenarios');
    
    if (!fs.existsSync(scenariosDir)) {
      return null;
    }
    
    // Walk through scenarios directory looking for ONCE scenarios with port 42777
    const walkDir = (dir: string): { uuid: string; port: number } | null => {
      if (!fs.existsSync(dir)) return null;
      
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const result = walkDir(fullPath);
          if (result) return result;
        } else if (entry.name.endsWith('.scenario.json')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const scenario = JSON.parse(content);
            
            // Check if this is a primary server (port 42777, not shutdown)
            // Scenario format: { ior, owner, model: { state: { capabilities, state } } }
            const serverState = scenario.model?.state || scenario.state;
            const httpCapability = serverState?.capabilities?.find(
              (c: any) => c.capability === 'httpPort'
            );
            const port = httpCapability?.port;
            const state = serverState?.state;
            
            // Only match running servers (not shutdown, stopped, stopping, error)
            const isRunning = state === 'running' || 
                              state === LifecycleState.RUNNING ||
                              state === LifecycleState.PRIMARY_SERVER ||
                              state === LifecycleState.CLIENT_SERVER;
            
            if (port === 42777 && isRunning) {
              const uuid = scenario.ior?.uuid || scenario.model?.uuid || scenario.uuid || entry.name.replace('.scenario.json', '');
              return { uuid, port };
            }
          } catch (error) {
            // Skip invalid scenario files
          }
        }
      }
      return null;
    };
    
    return walkDir(scenariosDir);
  }

  /**
   * @deprecated Use peerStopAll() instead - Web4 Principle 16 naming convention
   * Shutdown all servers gracefully (Primary only)
   * @ior ior:https://{host}:{port}/ONCE/{version}/{uuid}/shutdownAll
   * @pdca 2025-11-22-UTC-1200.iteration-01.6.3-defaultonce-microkernel.pdca.md
   */
  async shutdownAll(): Promise<void> {
    console.warn('⚠️  shutdownAll() is deprecated, use peerStopAll() instead');
    return this.peerStopAll();
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
      const client = new NodeJsOnce();
      await client.init();
      await client.startServer();
      clients.push(client);
      const clientModel = client.getServerModel();
      const port = clientModel.capabilities?.find(c => c.capability === 'httpPort')?.port;
      console.log(`   ✅ Client ${i + 1}: ${clientModel.uuid} on port ${port}`);
    }
    console.log('');

    await this.sleep(2000); // Let clients register

    // Pattern 1: Broadcast (Primary → All Clients)
    console.log('📡 Pattern 1: Broadcast (Primary → All Clients)');
    const { v4: uuidv4 } = await import('uuid');
    const broadcastScenario: any = {
      uuid: this.idProvider.create(), // ✅ Web4 Principle 20
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
        uuid: this.idProvider.create(), // ✅ Web4 Principle 20
        objectType: 'ONCEMessage',
        version: this.model.version || 'unknown', // ✅ Use dynamic version
        state: {
          type: 'relay',
          from: { 
            uuid: client1Model.uuid, 
            port: client1Model.capabilities?.find((c: any) => c.capability === 'httpPort')?.port || 0,
            host: client1Model.host // ✅ Add host field
          },
          to: { uuid: client2Model.uuid, port: client2Model.capabilities?.find((c: any) => c.capability === 'httpPort')?.port || 0 },
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
      const p2pPort = client2Model.capabilities?.find((c: any) => c.capability === 'httpPort')?.port || 0;
      const p2pScenario: any = {
        uuid: this.idProvider.create(), // ✅ Web4 Principle 20
        objectType: 'ONCEMessage',
        version: this.model.version || 'unknown', // ✅ Use dynamic version
        state: {
          type: 'p2p',
          from: { uuid: client1Model.uuid, port: client1Model.capabilities?.find((c: any) => c.capability === 'httpPort')?.port || 0 },
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
          return { uuid: m.uuid, port: m.capabilities?.find((cap: any) => cap.capability === 'httpPort')?.port };
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
    // FsM.7: Save report via IOR (P2P pattern)
    const saveIor = new IOR<string>().initRemote(`ior:fs:file://${reportPath}`);
    await saveIor.save(report);
    console.log(`💾 JSON report saved via IOR: ${reportPath}`);
    console.log('');

    console.log('🔒 Demo complete! Servers running. Press [q] or Ctrl+C to stop.');
    console.log('💡 Open browsers to see live message logs:');
    console.log(`   Primary: http://localhost:42777/once`);
    for (let i = 0; i < clients.length; i++) {
      const clientModel = clients[i].getServerModel();
      const port = clientModel.capabilities?.find((c: any) => c.capability === 'httpPort')?.port || 0;
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎯 Component Loading & Dynamic Import (Web4 Principle 17)
  // @pdca 2025-12-01-UTC-1400.iteration-05-phase8.3-route-component-pattern-unit-integration.pdca.md
  // ═══════════════════════════════════════════════════════════════════════════

  // Cache for loaded components (avoid redundant builds/imports)
  private loadedComponents: Map<string, any> = new Map();

  /**
   * Load a component (builds if needed, then imports class)
   * After this, you can: const unit = new Unit().init()
   * 
   * Web4 Pattern: Delegates to Web4TSComponent for build/descriptor logic (DRY)
   * ONCE's responsibility: Dynamic import and instance caching
   * 
   * @pdca 2025-12-01-UTC-1400.iteration-05-phase8.3-route-component-pattern-unit-integration.pdca.md
   * @pdca 2025-12-01-UTC-1500.iteration-01.21-component-start-and-descriptor-read.pdca.md (Web4TSComponent)
   * 
   * @param componentName Component name (e.g., "Unit", "GameDemoSystem")
   * @param version Component version (e.g., "0.3.19.1")
   * @returns Component class (ready for new ComponentClass().init())
   * @cliSyntax componentName version
   */
  async componentLoad(componentName: string, version: string): Promise<any> {
    const componentKey = `${componentName}/${version}`;
    
    // Check cache first
    if (this.loadedComponents.has(componentKey)) {
      console.log(`✅ ${componentKey} already loaded (cached)`);
      return this.loadedComponents.get(componentKey);
    }
    
    // ✅ DELEGATE to Web4TSComponent (DRY pattern, like info())
    const web4ts = await this.getWeb4TSComponent();
    web4ts.model.context = this;  // Set delegation context
    
    // 1. Ensure component is built and ready for import
    // Delegates to web4tscomponent.componentStart()
    console.log(`🔨 Ensuring ${componentKey} is built...`);
    await web4ts.componentStart(componentName, version);
    
    // 2. Read component descriptor to get implementationClassName
    // Delegates to web4tscomponent.componentDescriptorRead()
    const descriptor = await web4ts.componentDescriptorRead(componentName, version);
    const implementationClassName = descriptor?.model?.implementationClassName || componentName;
    
    console.log(`📋 Loading ${componentKey} (implementation: ${implementationClassName})`);
    
    // 3. Dynamic import (ONCE's unique responsibility)
    if (!this.model.projectRoot) {
      throw new Error('projectRoot not set in ONCE model. Call init() first.');
    }
    
    const componentPath = path.join(this.model.projectRoot, 'components', componentName, version);
    const possiblePaths = [
      path.join(componentPath, 'dist/ts/layer2', `${implementationClassName}.js`),
      path.join(componentPath, 'dist/ts/layer1', `${implementationClassName}.js`),
      path.join(componentPath, 'dist/ts/layer3', `${implementationClassName}.js`)
    ];
    
    let mainFile: string | null = null;
    for (const filePath of possiblePaths) {
      const fs = await import('fs');
      if (fs.existsSync(filePath)) {
        mainFile = filePath;
        break;
      }
    }
    
    if (!mainFile) {
      throw new Error(
        `Implementation class file not found for ${implementationClassName}. ` +
        `Tried: ${possiblePaths.join(', ')}`
      );
    }
    
    // Convert to file:// URL for dynamic import
    const fileUrl = `file://${mainFile}`;
    const componentModule = await import(fileUrl);
    const ComponentClass = componentModule[implementationClassName];
    
    if (!ComponentClass) {
      throw new Error(
        `Class ${implementationClassName} not exported from ${mainFile}. ` +
        `Available exports: ${Object.keys(componentModule).join(', ')}`
      );
    }
    
    // 4. Cache and return
    this.loadedComponents.set(componentKey, ComponentClass);
    console.log(`✅ ${componentKey} loaded and ready for instantiation`);
    
    return ComponentClass;
  }
}
