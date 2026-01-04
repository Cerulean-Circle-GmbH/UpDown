#!/usr/bin/env node

/**
 * ONCECLI - ONCE CLI implementation with chaining support
 * Web4 pattern: Dependency-free CLI with component creation and chaining
 * 
 * @pdca 2025-12-02-UTC-1115.iteration-10.4-tootsie-cli-delegation-pattern.pdca.md
 * @pdca 2026-01-04-UTC-1121.model-consolidation-dry-cleanup.pdca.md MC.4.2 - Init consolidation
 * 
 * Flow: new ONCECLI().init(scenario) → componentInit() → execute(args)
 * - init(): Sync CLI initialization (P6 compliant)
 * - componentInit(): Async component + delegation setup (called by static start())
 */

import { DefaultCLI } from '../layer2/DefaultCLI.js';
import { NodeJsOnce } from '../layer2/NodeJsOnce.js';
import { DelegationProxy } from '../layer2/DelegationProxy.js';
import { MethodSignature } from '../layer3/MethodSignature.interface.js';

export class ONCECLI extends DefaultCLI {
  /** Method signatures for CLI help and completion */
  protected methodSignatures: Map<string, MethodSignature> = new Map();

  /**
   * Empty constructor (Web4 Radical OOP P6)
   * ✅ NO init() call in constructor!
   * @pdca 2026-01-04-UTC-1121.model-consolidation-dry-cleanup.pdca.md MC.4.2
   */
  constructor() {
    super();
    // ✅ P6: Empty constructor - all init in init() method
  }
  
  /**
   * Initialize CLI (sync) - Web4 Radical OOP P6
   * 
   * Usage: new ONCECLI().init(scenario)
   * 
   * @param scenario Optional scenario with model overrides
   * @returns this for chaining
   * @pdca 2026-01-04-UTC-1121.model-consolidation-dry-cleanup.pdca.md MC.4.2
   */
  init(scenario?: any): this {
    // Call parent init (CLI path discovery, model setup)
    super.init(scenario);
    return this;
  }

  /**
   * Initialize component asynchronously
   * 
   * ✅ This is the ONLY async init - called by static start() before execute()
   * Creates NodeJsOnce wrapped in DelegationProxy for method delegation.
   * 
   * @pdca 2025-12-02-UTC-1115.iteration-10.4-tootsie-cli-delegation-pattern.pdca.md
   * @pdca 2026-01-04-UTC-1121.model-consolidation-dry-cleanup.pdca.md MC.4.2
   */
  async componentInit(): Promise<void> {
    // STEP 1: Create component
    const component = new NodeJsOnce();
    
    // STEP 2: Set Path Authority (CLI provides these paths)
    (component as any).model.projectRoot = this.model.projectRoot;
    (component as any).model.targetDirectory = this.model.projectRoot;
    (component as any).model.isTestIsolation = this.model.projectRoot?.includes('/test/data') || false;
    
    // STEP 3: Pre-load Web4TSComponent (for delegation to work at call-time)
    await (component as any).getWeb4TSComponent();
    
    // STEP 4: Wrap with DelegationProxy (transparent delegation)
    this.component = await DelegationProxy.start(component as any) as any;
    
    // STEP 5: Discover CLI's own methods
    this.discoverMethods();
    
    // STEP 6: Discover component's OWN methods
    if (this.component) {
      const ownMethods = this.component.listMethods();
      for (const methodName of ownMethods) {
        const signature = this.component.getMethodSignature(methodName);
        if (signature) {
          this.methodSignatures.set(methodName, signature);
        }
      }
    }
    
    // STEP 7: Discover DELEGATED methods (if delegation exists)
    if (this.component && (this.component as any).hasDelegation && (this.component as any).hasDelegation()) {
      const delegationTarget = (this.component as any).getDelegationTarget();
      if (delegationTarget) {
        const delegatedMethods = delegationTarget.listMethods();
        for (const methodName of delegatedMethods) {
          const signature = delegationTarget.getMethodSignature(methodName);
          if (signature) {
            signature.isDelegated = true;
            this.methodSignatures.set(methodName, signature);
          }
        }
      }
    }
  }

  /**
   * Static start method - Web4 radical OOP entry point
   * 
   * Flow: new ONCECLI().init() → componentInit() → execute(args)
   * 
   * @pdca 2026-01-04-UTC-1121.model-consolidation-dry-cleanup.pdca.md MC.4.2
   */
  static async start(args: string[]): Promise<void> {
    const cli = new ONCECLI().init();  // ✅ Sync init
    await cli.componentInit();          // ✅ Async component setup
    await cli.execute(args);
  }

  /**
   * ONCE-specific usage display using DefaultCLI dynamic generation
   */
  showUsage(): void {
    console.log(this.generateStructuredUsage());
  }

  /**
   * Override shCompletion to ensure component is initialized for method discovery
   * @pdca 2025-12-02-UTC-1830.pdca.md - Fix: Component needs initialization before listing methods
   */
  async shCompletion(cword: string, ...words: string[]): Promise<void> {
    // CRITICAL: Initialize component before completion (dynamic method discovery)
    if (!this.component) {
      await this.componentInit();
    }
    
    // Call parent implementation
    await super.shCompletion(cword, ...words);
  }

  /**
   * Override listMethods to include delegated methods for completion
   * @pdca 2025-12-02-UTC-1830.pdca.md - ROOT CAUSE FIX
   * Parent's getValidCompletionValues() calls this.component.listMethods() which only returns
   * NodeJsOnce methods, NOT delegated Web4TSComponent methods like 'tootsie', 'test', etc.
   * Solution: Override listMethods() at CLI level to aggregate ALL methods
   */
  listMethods(): string[] {
    const methods = new Set<string>();
    
    // Add component's own methods (if component exists)
    if (this.component && typeof this.component.listMethods === 'function') {
      this.component.listMethods().forEach((m: string) => methods.add(m));
    }
    
    // Add ALL discovered methods from our methodSignatures Map
    // This includes both own methods AND delegated methods
    for (const methodName of this.methodSignatures.keys()) {
      methods.add(methodName);
    }
    
    return Array.from(methods).sort();
  }

  /**
   * Override to include delegated methods in completion
   * @pdca 2025-12-02-UTC-1830.pdca.md - FIX: Delegated methods weren't showing in completion
   */
  protected async getValidCompletionValues(): Promise<string[]> {
    // Get base completion values (includes CLI, context, and component methods)
    const values = await super.getValidCompletionValues();
    
    // If completing methods, add delegated method names from our discovered signatures
    if (this.model.completionIsCompletingMethod) {
      const filterPrefix = this.model.completionCurrentWord || "";
      
      // Add delegated methods that aren't already in the list
      for (const [methodName, signature] of this.methodSignatures) {
        if ((signature as any).isDelegated && 
            !values.includes(methodName) &&
            methodName.startsWith(filterPrefix) &&
            !methodName.endsWith("ParameterCompletion")) {
          values.push(methodName);
        }
      }
      
      // Re-sort after adding delegated methods
      values.sort();
    }
    
    return values;
  }

  /**
   * Execute CLI commands with auto-discovery
   */
  async execute(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.showUsage();
      return;
    }

    const command = args[0];
    const commandArgs = args.slice(1);

    try {
      // Try dynamic command execution
      if (await this.executeDynamicCommand(command, commandArgs)) {
        return;
      }

      // Special cases
      switch (command) {
        case 'help':
          this.showUsage();
          break;
          
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    } catch (error) {
      console.error(this.formatError((error as Error).message));
      process.exit(1);
    }
  }
}

// Static entry point for shell execution
if (import.meta.url === `file://${process.argv[1]}`) {
  ONCECLI.start(process.argv.slice(2));
}
