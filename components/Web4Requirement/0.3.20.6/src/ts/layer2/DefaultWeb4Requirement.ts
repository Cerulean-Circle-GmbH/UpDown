/**
 * DefaultWeb4Requirement - Web4Requirement Component Implementation
 * 
 * ✅ Radical OOP: Requirements are objects with acceptance criteria
 * ✅ Replaces arrow function assertions with OOP validation
 * ✅ Web4 pattern: Empty constructor + scenario initialization
 * 
 * @pdca 2025-12-02-UTC-2115.web4requirement-integration.pdca.md
 */

import { Web4Requirement } from '../layer3/Web4Requirement.interface.js';
import { Scenario } from '../layer3/Scenario.interface.js';
import { Web4RequirementModel } from '../layer3/Web4RequirementModel.interface.js';
import { AcceptanceCriterion } from '../layer3/AcceptanceCriterion.interface.js';
import { User } from '../layer3/User.interface.js';
import { MethodSignature } from '../layer3/MethodSignature.interface.js';
import { existsSync, lstatSync, readlinkSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

export class DefaultWeb4Requirement implements Web4Requirement {
  // @pdca 2025-11-03-1105-component-template-bugs.pdca.md - Changed to public for Component interface compliance
  model: Web4RequirementModel;
  private web4ts?: any; // Lazy-initialized Web4TSComponent for delegation (dynamic import, no static dependency)
  private user?: User; // Optional User service (lazy initialization) - @pdca 2025-11-03-1135.pdca.md
  private methods: Map<string, MethodSignature> = new Map(); // @pdca 2025-11-05-UTC-2301 - Match Web4TSComponent type

  constructor() {
    // Empty constructor - Web4 pattern
    // @pdca 2025-11-03-1105-component-template-bugs.pdca.md - Initialize with component name for CLI display
    // @pdca 2025-12-02-UTC-2145.fix-web4-principle-violations.pdca.md - Use Reference<T> (null) for nullable
    this.model = {
      uuid: crypto.randomUUID(),
      name: '',
      description: '',
      origin: '',
      definition: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      component: 'Web4Requirement',  // For CLI display
      version: '0.3.20.6',           // Component version
      acceptanceCriteria: [],        // ✅ Radical OOP: Acceptance criteria as objects
      status: 'pending',
      testCaseIORs: [],
      traceabilityChain: [],
      // Reference<T> pattern for nullable fields (Principle 5)
      componentRoot: null,
      projectRoot: null,
      targetDirectory: null,
      targetComponentRoot: null,
      context: null,
      isTestIsolation: null
    };
  }

  /**
   * Check if method exists (Component interface)
   * @pdca 2025-11-05-UTC-2301.dry-shell-libraries.pdca.md - Method discovery for tab completion
   * @cliHide
   */
  hasMethod(name: string): boolean {
    return this.methods.has(name);
  }
  
  /**
   * Get method signature (Component interface)
   * @pdca 2025-11-05-UTC-2301.dry-shell-libraries.pdca.md - Method discovery for tab completion
   * @cliHide
   */
  getMethodSignature(name: string): MethodSignature | null {
    return this.methods.get(name) || null;
  }
  
  /**
   * List all method names (Component interface)
   * @pdca 2025-11-05-UTC-2301.dry-shell-libraries.pdca.md - Method discovery for tab completion
   * @cliHide
   */
  listMethods(): string[] {
    return Array.from(this.methods.keys());
  }

  /**
   * Discover public methods for CLI completion
   * @pdca 2025-11-05-UTC-2301.dry-shell-libraries.pdca.md - Method discovery for tab completion
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
   * Lazy initialization of User service for owner data generation
   * NOT a build dependency - warns if unavailable, continues with fallback
   * @pdca 2025-11-03-1135.pdca.md - User service integration pattern
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
      
      return this.user!; // Non-null assertion: we just assigned it
    } catch (error) {
      // User service not available - throw for caller to handle fallback
      throw new Error('User service not available');
    }
  }

  /**
   * Lazy initialization of Web4TSComponent for delegation (DRY principle)
   * Dynamic imports resolve paths at runtime, enabling location-independent operation
   * @cliHide
   */
  private async getWeb4TSComponent(): Promise<any> {
    if (this.web4ts) return this.web4ts;

    const path = await import('path');
    const url = new URL(import.meta.url);
    const __filename = url.pathname;
    const componentRoot = path.resolve(path.dirname(__filename), '../../..');

    // @pdca 2025-11-10-UTC-1230.test-isolation-path-pollution-analysis.pdca.md
    // Web4 Principle: Detect project root correctly for test isolation
    // Component path: .../test/data/components/ComponentName/0.1.0.0
    // OR: .../components/ComponentName/0.1.0.0
    // Project root is 2 levels up from component directory
    // (ComponentName/ and components/)
    const componentsDir = path.dirname(path.dirname(componentRoot)); // Go up 2: version → component → components
    const projectRoot = path.dirname(componentsDir); // Go up 1 more: components → project root
    
    // @pdca 2025-11-10-UTC-1230.test-isolation-path-pollution-analysis.pdca.md
    // Web4 Principle: Detect test isolation from model paths, NOT environment variables
    // Test isolation: projectRoot contains '/test/data'
    const isTestIsolation = projectRoot.includes('/test/data');
    
    // @pdca 2025-11-10-UTC-1010.pdca.md - Set THIS component's paths for delegation
    // When Web4TSComponent reads context, it needs to know THIS component's paths
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
    // @pdca 2025-11-03-UTC-1237.pdca.md - Full delegation initialization
    // @pdca 2025-11-04-UTC-1630.pdca.md - Added projectRoot for version display fix
    // @pdca 2025-11-10-UTC-1010.pdca.md - DO NOT override component identity!
    // Web4TSComponent must retain its own identity ('Web4TSComponent')
    // The delegating component's identity will be set via context in delegateToWeb4TS()
    this.web4ts = new DefaultWeb4TSComponent().init({
      model: {
        // DO NOT set 'component' here - let Web4TSComponent keep its own identity
        version: await SemanticVersion.fromString(this.model.version || '0.0.0.0'), // THIS component's version
        componentRoot: componentRoot,              // THIS component's root directory
        projectRoot: projectRoot,                  // Project root for Path Authority (version display needs this)
        targetDirectory: projectRoot               // Project root for path authority
      }
    });

    return this.web4ts;
  }

  /**
   * ✅ REMOVED: delegateToWeb4TS() helper method
   * 
   * @pdca 2025-11-10-UTC-1845.eliminate-delegation-dry-violation.pdca.md
   * 
   * This method is NO LONGER NEEDED! DelegationProxy automatically intercepts
   * missing method calls and delegates them to Web4TSComponent with proper context.
   * 
   * The old pattern was:
   *   private async delegateToWeb4TS(method, ...args) { ... }
   * 
   * The new pattern is:
   *   DelegationProxy.start(component) wraps the component in a Proxy
   *   that automatically delegates missing methods.
   * 
   * Benefits:
   *   - Zero boilerplate in generated components
   *   - Automatic delegation of ALL Web4TSComponent methods
   *   - DRY: delegation logic is in ONE place (DelegationProxy)
   */

  /**
   * @cliHide
   * @pdca 2025-11-10-UTC-2200.fix-delegated-method-completion-radical-oop.pdca.md
   * ✅ RADICAL OOP: Component knows ONLY its own methods
   */
  async init(scenario?: Scenario<Web4RequirementModel>): Promise<this> {
    if (scenario?.model) {
      this.model = { ...this.model, ...scenario.model };
    }
    
    // Discover OWN methods only (Radical OOP)
    this.discoverMethods();
    
    // @pdca 2025-11-10-UTC-2200.fix-delegated-method-completion-radical-oop.pdca.md
    // ❌ REMOVED: Component should NOT discover delegated methods
    // ✅ RADICAL OOP: CLI discovers delegated methods separately via getDelegationTarget()
    // Component knows ONLY its own methods (create, process, completion)
    
    return this;
  }

  /**
   * @cliHide
   * @pdca 2025-11-03-1135.pdca.md - Use User service with fallback pattern
   */
  async toScenario(name?: string): Promise<Scenario<Web4RequirementModel>> {
    // ✅ RADICAL OOP: Generate owner data using User.toScenario() (Web4 component interface)
    let ownerData: string;
    try {
      // Try to use User service if available (NOT a build dependency)
      const user = await this.getUser();
      
      // ✅ Use User component's toScenario() - universal Web4 interface
      const userScenario = await user.toScenario();
      
      // ✅ Owner data IS the entire User scenario serialized
      const ownerJson = JSON.stringify(userScenario);
      
      ownerData = Buffer.from(ownerJson).toString('base64');
    } catch (error) {
      // ✅ Fallback: Generate minimal User-like scenario without User service
      const fallbackJson = JSON.stringify({
        ior: {
          uuid: this.model.uuid,
          component: 'User',
          version: '0.0.0.0',
          timestamp: new Date().toISOString()
        },
        owner: '',  // No nested owner in fallback
        model: {
          user: process.env.USER || 'system',
          hostname: process.env.HOSTNAME || 'localhost',
          uuid: this.model.uuid,
          component: 'Web4Requirement',
          version: '0.3.20.6'
        }
      });
      ownerData = Buffer.from(fallbackJson).toString('base64');
    }

    return {
      ior: {
        uuid: this.model.uuid,
        component: 'Web4Requirement',
        version: '0.3.20.6'
      },
      owner: ownerData,
      model: this.model
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // ✅ ACCEPTANCE CRITERIA METHODS (Radical OOP)
  // Replaces arrow function assertions with OOP validation
  // ═══════════════════════════════════════════════════════════════

  /**
   * Add an acceptance criterion to this requirement
   * @param id Unique ID (e.g., "AC-01")
   * @param description Human-readable description
   */
  addCriterion(id: string, description: string): this {
    // @pdca 2025-12-02-UTC-2145.fix-web4-principle-violations.pdca.md - Use Reference<T> (null) for nullable
    const criterion: AcceptanceCriterion = {
      id,
      description,
      status: 'pending',
      validatedAt: null,
      evidence: null,
      errorMessage: null
    };
    this.model.acceptanceCriteria.push(criterion);
    this.model.updatedAt = new Date().toISOString();
    console.log(`📋 [REQUIREMENT] Added criterion: ${id} - ${description}`);
    return this;
  }

  /**
   * Validate an acceptance criterion with actual value
   * @param id Criterion ID to validate
   * @param condition Boolean condition (true = passed, false = failed)
   * @param evidence Optional evidence data
   */
  validateCriterion(id: string, condition: boolean, evidence?: any): this {
    const criterion = this.model.acceptanceCriteria.find(c => c.id === id);
    if (!criterion) {
      throw new Error(`Criterion not found: ${id}`);
    }
    
    criterion.status = condition ? 'passed' : 'failed';
    criterion.validatedAt = new Date().toISOString();
    criterion.evidence = evidence;
    
    if (condition) {
      console.log(`✅ [REQUIREMENT] ${id}: ${criterion.description}`);
    } else {
      console.log(`❌ [REQUIREMENT] ${id}: ${criterion.description}`);
      criterion.errorMessage = `Validation failed: expected true, got false`;
    }
    
    // Update requirement status
    this.updateStatus();
    this.model.updatedAt = new Date().toISOString();
    
    return this;
  }

  /**
   * Get all acceptance criteria
   */
  getCriteria(): AcceptanceCriterion[] {
    return this.model.acceptanceCriteria;
  }

  /**
   * Check if all acceptance criteria passed
   */
  allCriteriaPassed(): boolean {
    if (this.model.acceptanceCriteria.length === 0) return false;
    return this.model.acceptanceCriteria.every(c => c.status === 'passed');
  }

  /**
   * Get failed criteria
   */
  getFailedCriteria(): AcceptanceCriterion[] {
    return this.model.acceptanceCriteria.filter(c => c.status === 'failed');
  }

  /**
   * Generate markdown report of requirement status
   */
  generateReport(): string {
    const statusIcon = this.model.status === 'completed' ? '✅' :
                       this.model.status === 'failed' ? '❌' :
                       this.model.status === 'in-progress' ? '🔄' : '📋';
    
    let report = `## ${statusIcon} ${this.model.name}\n\n`;
    report += `**UUID:** \`${this.model.uuid}\`\n`;
    report += `**Status:** ${this.model.status}\n`;
    report += `**Description:** ${this.model.description}\n\n`;
    
    if (this.model.acceptanceCriteria.length > 0) {
      report += `### Acceptance Criteria\n\n`;
      for (const criterion of this.model.acceptanceCriteria) {
        const icon = criterion.status === 'passed' ? '✅' :
                     criterion.status === 'failed' ? '❌' : '⏳';
        report += `- ${icon} **${criterion.id}**: ${criterion.description}\n`;
        if (criterion.errorMessage) {
          report += `  - Error: ${criterion.errorMessage}\n`;
        }
      }
      report += '\n';
    }
    
    return report;
  }

  /**
   * Update requirement status based on criteria
   * @cliHide
   */
  private updateStatus(): void {
    const criteria = this.model.acceptanceCriteria;
    if (criteria.length === 0) {
      this.model.status = 'pending';
      return;
    }
    
    const allValidated = criteria.every(c => c.status !== 'pending');
    const allPassed = criteria.every(c => c.status === 'passed');
    const anyFailed = criteria.some(c => c.status === 'failed');
    
    if (anyFailed) {
      this.model.status = 'failed';
    } else if (allPassed) {
      this.model.status = 'completed';
    } else if (allValidated) {
      this.model.status = 'in-progress';
    } else {
      this.model.status = 'in-progress';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // LEGACY METHODS (for backward compatibility)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create example operation for Web4Requirement
   * @param input Input data to process
   * @param format Output format (json, text, xml)
   * @cliSyntax input format
   * @cliDefault format json
   */
  async create(input: string, format: string = 'json'): Promise<this> {
    console.log(`🚀 Creating ${input} in ${format} format`);
    this.model.name = input;
    this.model.updatedAt = new Date().toISOString();
    console.log(`✅ Web4Requirement operation completed`);
    return this;
  }

  /**
   * Process data through Web4Requirement logic
   * @param data Data to process
   * @cliSyntax data
   */
  async process(data: string): Promise<this> {
    console.log(`🔧 Processing: ${data}`);
    this.model.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * ✅ REMOVED: Explicit delegation methods (info, test, build, clean, tree, links)
   * 
   * @pdca 2025-11-10-UTC-1845.eliminate-delegation-dry-violation.pdca.md
   * 
   * These methods are now automatically delegated via DelegationProxy.
   * No need for explicit boilerplate!
   * 
   * Proxy pattern intercepts missing methods and delegates them to Web4TSComponent
   * with proper context, display properties, and test isolation awareness.
   * 
   * Methods automatically delegated:
   * - info(topic)           - Show component information
   * - test(scope, ...refs)  - Run tests with auto-promotion
   * - build()               - Build component
   * - clean()               - Clean build artifacts
   * - tree(depth, hidden)   - Show directory structure
   * - links(action)         - Show/manage version links
   * - upgrade(version)      - Upgrade component version
   * - ... and any future Web4TSComponent methods!
   */

  /**
   * Test and discover tab completions for debugging and development
   * @param what Type of completion to test: "method" or "parameter"
   * @param filter Optional prefix to filter results (e.g., "v" shows only validate*, verify*, etc.)
   * @cliSyntax what filter
   * @cliDefault filter ""
   */
  async completion(what: string, filter?: string): Promise<this> {
    const context = this.getComponentContext();
    
    // OOP: Instantiate own CLI and call completeParameter directly (no shell!)
    const { Web4RequirementCLI } = await import('../layer5/Web4RequirementCLI.js');
    const cli = new Web4RequirementCLI();
    
    if (!context) {
      // No context - test completions on Web4Requirement itself
      console.log(`🔍 Discovering ${what === 'method' ? 'methods' : 'parameter completions'} on Web4Requirement${filter ? ` (filter: ${filter})` : ''}`);
      console.log(`---`);
      
      // Call completeParameter directly via OOP (completeParameter is on DefaultCLI)
      await cli.completeParameter('completionNameParameterCompletion', 'completion', what, filter || '');
    } else {
      // Context loaded - delegate to web4tscomponent for target component discovery
      const web4ts = await this.getWeb4TSComponent();
      await web4ts.completion(what, filter);
    }
    
    return this;
  }

  /**
   * @cliHide
   */
  protected getComponentContext(): { component: string; version: string; path: string } | null {
    const context = this.model as any;
    if (context.contextComponent && context.contextVersion && context.contextPath) {
      return {
        component: context.contextComponent,
        version: context.contextVersion,
        path: context.contextPath
      };
    }
    return null;
  }
}
