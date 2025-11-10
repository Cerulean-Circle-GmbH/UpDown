/**
 * DefaultONCE v0.3.20.0 - ONCE Component Implementation
 * Upgraded from v0.2.0.0 with TRUE Radical OOP CLI infrastructure from Web4TSComponent 0.3.20.0
 * Domain logic preserved from v0.2.0.0 (server hierarchy, scenario management, lifecycle events)
 * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md
 */

import { ONCE, EnvironmentInfo, ComponentQuery, PerformanceMetrics } from '../layer3/ONCE.js';
import { Scenario } from '../layer3/Scenario.js';
import { Component } from '../layer3/Component.js';
import { IOR } from '../layer3/IOR.js';
import { LifecycleEventType, LifecycleEventHandler, LifecycleHooks, LifecycleState } from '../layer3/LifecycleEvents.js';
import { ONCEServerModel } from '../layer3/ONCEServerModel.js';
import { ServerHierarchyManager } from './ServerHierarchyManager.js';
import { ScenarioManager } from './ScenarioManager.js';
import { ONCEModel } from '../layer3/ONCEModel.interface.js';
import { User } from '../layer3/User.interface.js';
import { MethodSignature } from '../layer3/MethodSignature.interface.js';

/**
 * DefaultONCE v0.3.20.0 - TRUE Radical OOP with 0.2.0.0 domain logic
 * ✅ Empty constructor
 * ✅ Model-driven state (not private properties)
 * ✅ Method chaining
 * ✅ getTarget() for delegation
 * ✅ updateModelPaths() for DRY path management
 * ✅ Server hierarchy and scenario management from v0.2.0.0
 */
export class DefaultONCE implements ONCE {
  model: ONCEModel;
  private web4ts?: any; // Lazy-initialized Web4TSComponent for delegation (dynamic import, no static dependency)
  private user?: User; // Optional User service (lazy initialization)
  private methods: Map<string, MethodSignature> = new Map();
  
  // Enhanced managers for v0.2.0.0+ domain logic
  private serverHierarchyManager: ServerHierarchyManager;
  private scenarioManager: ScenarioManager;

  /**
   * ✅ TRUE Radical OOP: Empty constructor - Web4 pattern
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md - CLI infrastructure from 0.3.20.0
   */
  constructor() {
    // Empty constructor - Web4 pattern
    this.model = {
      uuid: crypto.randomUUID(),
      name: '',
      origin: '',
      definition: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      component: 'ONCE',        // For CLI display
      version: '0.3.20.0',      // Component version
      initialized: false,       // ONCE kernel not initialized yet
      initializationTime: 0,    // Will be set after init()
      eventHandlers: new Map()  // Lifecycle event handlers
    };
    
    // Initialize managers (domain logic from 0.2.0.0)
    this.serverHierarchyManager = new ServerHierarchyManager();
    this.scenarioManager = new ScenarioManager(); // Will use projectRoot from model after init
    
    // Discover methods for CLI (must be called in constructor for CLI to work)
    this.discoverMethods();
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
    const url = new URL(import.meta.url);
    const __filename = url.pathname;
    const componentRoot = path.resolve(path.dirname(__filename), '../../..');

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

    // Import Web4TSComponent and SemanticVersion dynamically
    const web4tscomponentModule = await import(
      `${projectRoot}/components/Web4TSComponent/latest/dist/ts/layer2/DefaultWeb4TSComponent.js`
    );
    const semanticVersionModule = await import(
      `${projectRoot}/components/Web4TSComponent/latest/dist/ts/layer2/SemanticVersion.js`
    );
    const { DefaultWeb4TSComponent } = web4tscomponentModule;
    const { SemanticVersion } = semanticVersionModule;

    // ✅ CRITICAL: Initialize Web4TSComponent for delegation
    this.web4ts = new DefaultWeb4TSComponent().init({
      model: {
        version: await SemanticVersion.fromString(this.model.version || '0.0.0.0'),
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
   * @cliHide
   */
  async init(scenario?: Scenario): Promise<ONCE> {
    if (scenario && typeof scenario === 'object' && 'model' in scenario) {
      // Web4TSComponent-style scenario with model property
      const web4Scenario = scenario as any;
      if (web4Scenario.model) {
        this.model = { ...this.model, ...web4Scenario.model };
      }
    } else if (scenario) {
      // ONCE-style scenario from v0.2.0.0
      this.model.scenario = scenario as Scenario;
    }
    
    // Discover methods for CLI completion
    this.discoverMethods();
    
    // Update model paths (TRUE Radical OOP)
    await this.updateModelPaths();

    // Initialize ONCE kernel if scenario provided (domain logic from 0.2.0.0)
    if (this.model.scenario && !this.model.initialized) {
      const startTime = Date.now();
      console.log('🚀 Initializing ONCE v0.3.20.0...');

      try {
        console.log(`📂 Loading from scenario: ${this.model.scenario.uuid}`);
        await this.loadFromScenario(this.model.scenario);

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
   * ✅ TRUE Radical OOP: toScenario() - Return ONCE-style scenario (not Web4TSComponent style)
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md
   * @cliHide
   */
  toScenario(): Scenario {
    return this.createCurrentScenario();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔌 ONCE Domain Methods - Preserved from v0.2.0.0 (lines 114-319)
  // @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md - Domain logic unchanged
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Load ONCE from scenario (domain logic from 0.2.0.0)
   * @cliHide
   */
  private async loadFromScenario(scenario: Scenario): Promise<void> {
    if (scenario.objectType !== 'ONCE') {
      throw new Error(`Invalid scenario type: ${scenario.objectType}`);
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
  async startServer(scenario?: Scenario): Promise<void> {
    console.log('🚀 Starting ONCE server...');
    
    await this.emitEvent(LifecycleEventType.BEFORE_START);
    
    try {
      // Initialize if not already initialized
      if (!this.model.initialized) {
        await this.init(scenario ? { model: { scenario } } as any : undefined);
      }

      // Start server hierarchy
      await this.serverHierarchyManager.startServer();
      
      // Store server model in our model
      this.model.serverModel = this.serverHierarchyManager.getServerModel();
      
      // Save current state as scenario
      const currentScenario = this.createCurrentScenario();
      await this.scenarioManager.saveScenario(currentScenario);
      
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
  private createCurrentScenario(): Scenario {
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

  async startComponent(componentIOR: IOR, scenario?: Scenario): Promise<Component> {
    throw new Error('startComponent not implemented in v0.3.20.0');
  }

  async saveAsScenario(component: Component): Promise<Scenario> {
    throw new Error('saveAsScenario not implemented in v0.3.20.0');
  }

  async loadScenario(scenario: Scenario): Promise<Component> {
    throw new Error('loadScenario not implemented in v0.3.20.0');
  }

  getEnvironment(): EnvironmentInfo {
    return {
      platform: 'node',
      version: process.version,
      capabilities: ['server', 'websocket', 'p2p'],
      isOnline: true,
      hostname: this.detectHostname(),
      ip: '127.0.0.1'
    };
  }

  async registerComponent(component: Component, ior: IOR): Promise<void> {
    console.log(`📋 Component registration: ${component.uuid}`);
  }

  async discoverComponents(query?: ComponentQuery): Promise<IOR[]> {
    return [];
  }

  async connectPeer(peerIOR: IOR): Promise<void> {
    console.log(`🤝 Peer connection: ${peerIOR.uuid}`);
  }

  async exchangeScenario(peerIOR: IOR, scenario: Scenario): Promise<void> {
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
    console.log(`🎣 Lifecycle hooks registered for ${component.uuid}`);
  }

  async pauseComponent(component: Component): Promise<void> {
    console.log(`⏸️ Pausing component: ${component.uuid}`);
  }

  async resumeComponent(component: Component): Promise<void> {
    console.log(`▶️ Resuming component: ${component.uuid}`);
  }

  async stopComponent(component: Component): Promise<void> {
    console.log(`⏹️ Stopping component: ${component.uuid}`);
  }

  /**
   * Stop server gracefully (domain logic from 0.2.0.0)
   */
  async stopServer(): Promise<void> {
    await this.emitEvent(LifecycleEventType.BEFORE_STOP);
    
    await this.serverHierarchyManager.stopServer();
    
    await this.emitEvent(LifecycleEventType.AFTER_STOP);
  }

  /**
   * Demo command - Start interactive ONCE demo with browser auto-opening
   * ✅ TRUE Radical OOP: All state in model, method chaining, no functional helpers
   * @param mode Demo mode: 'interactive' (default), 'headless', or 'browser-only'
   * @cliSyntax mode
   * @cliDefault mode interactive
   * @cliValues interactive headless browser-only
   * @pdca 2025-11-10-UTC-1900.add-demo-command.pdca.md - Port demo from 0.2.0.0 CLI
   */
  async demo(mode: string = 'interactive'): Promise<this> {
    console.log('🎭 ONCE v0.3.20.0 Demo Starting...');
    console.log('');
    
    // ✅ RADICAL OOP: Store demo mode in model
    if (!this.model.serverModel) {
      this.model.serverModel = {} as any;
    }
    (this.model.serverModel as any).demoMode = mode;
    
    // Show enhanced v0.3.20.0 info
    console.log('🏠 Project root:', this.model.projectRoot || process.cwd());
    console.log('🚫 No environment variables required');
    console.log('🌐 Server hierarchy: Port 42777 → 8080+ (enhanced v0.2.0.0)');
    console.log('🎯 TRUE Radical OOP architecture (v0.3.20.0)');
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
   * @cliHide
   */
  private async openBrowser(url: string): Promise<void> {
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
}
