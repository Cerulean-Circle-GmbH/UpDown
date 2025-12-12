#!/usr/bin/env node

/**
 * ONCECLI - ONCE CLI implementation with chaining support
 * Web4 pattern: Dependency-free CLI with component creation and chaining
 * 
 * @pdca 2025-12-02-UTC-1115.iteration-10.4-tootsie-cli-delegation-pattern.pdca.md
 * Upgraded to use DelegationProxy for automatic method delegation (modern Web4 pattern)
 */

import { DefaultCLI } from '../layer2/DefaultCLI.js';
import { NodeJsOnce } from '../layer2/NodeJsOnce.js';
import { DelegationProxy } from '../layer2/DelegationProxy.js';
import { MethodSignature } from '../layer3/MethodSignature.interface.js';

export class ONCECLI extends DefaultCLI {
  // Component is initialized asynchronously in initComponent()
  // Type is handled by base DefaultCLI
  // @pdca 2025-12-02-UTC-1115.iteration-10.4-tootsie-cli-delegation-pattern.pdca.md
  protected methodSignatures: Map<string, MethodSignature> = new Map();

  /**
   * Empty constructor (Web4 radical OOP pattern)
   * @pdca 2025-10-30-UTC-1011.pdca.md - Path Authority architecture
   * @pdca 2025-12-02-UTC-1115.iteration-10.4-tootsie-cli-delegation-pattern.pdca.md - Wrap in DelegationProxy
   */
  constructor() {
    super(); // Call empty parent constructor
    
    // Initialize CLI (Path Authority - calculates projectRoot, sets paths)
    this.init();
    
    // Component will be initialized asynchronously in initComponent()
    // (because init() now needs to await Web4TSComponent method discovery)
  }
  
  /**
   * Initialize component asynchronously (Radical OOP)
   * Called by start() before executing commands
   * @pdca 2025-12-02-UTC-1115.iteration-10.4-tootsie-cli-delegation-pattern.pdca.md
   * ✅ RADICAL OOP: Separate discovery of own methods vs delegated methods
   */
  async initComponent(): Promise<void> {
    // ✅ STEP 1: Create component (knows its OWN methods)
    const component = new NodeJsOnce();
    
    // ✅ STEP 2: Set Path Authority (CLI provides these paths)
    (component as any).model.projectRoot = this.model.projectRoot;
    (component as any).model.targetDirectory = this.model.projectRoot;
    (component as any).model.isTestIsolation = this.model.projectRoot?.includes('/test/data') || false;
    
    // ✅ STEP 3: Pre-load Web4TSComponent (for delegation to work at call-time)
    await (component as any).getWeb4TSComponent();
    
    // ✅ STEP 4: Wrap with DelegationProxy (transparent delegation)
    // @pdca 2025-12-02-UTC-1115.iteration-10.4-tootsie-cli-delegation-pattern.pdca.md
    // Proxy intercepts missing methods and delegates them to Web4TSComponent
    // CRITICAL: await start() to ensure Web4TSComponent is loaded before getDelegationTarget()
    this.component = await DelegationProxy.start(component as any) as any;
    
    // ✅ STEP 5: Discover CLI's own methods
    this.discoverMethods();
    
    // ✅ STEP 6: Discover component's OWN methods
    // @pdca 2025-12-02-UTC-1115.iteration-10.4-tootsie-cli-delegation-pattern.pdca.md
    // RADICAL OOP: Component knows ONLY its own methods
    if (this.component) {
      const ownMethods = this.component.listMethods();
      for (const methodName of ownMethods) {
        const signature = this.component.getMethodSignature(methodName);
        if (signature) {
          this.methodSignatures.set(methodName, signature);
        }
      }
    }
    
    // ✅ STEP 7: Discover DELEGATED methods (if delegation exists)
    // @pdca 2025-12-02-UTC-1115.iteration-10.4-tootsie-cli-delegation-pattern.pdca.md
    // RADICAL OOP: Query delegation target separately via metadata
    if (this.component && (this.component as any).hasDelegation && (this.component as any).hasDelegation()) {
      const delegationTarget = (this.component as any).getDelegationTarget();
      if (delegationTarget) {
        const delegatedMethods = delegationTarget.listMethods();
        for (const methodName of delegatedMethods) {
          const signature = delegationTarget.getMethodSignature(methodName);
          if (signature) {
            // Mark as delegated for help display
            signature.isDelegated = true;
            this.methodSignatures.set(methodName, signature);
          }
        }
      }
    }
  }

  /**
   * Override init() to support test scenarios
   * @pdca 2025-11-21-UTC-1630.test-isolation-path-violation.pdca.md
   * @pdca 2025-12-02-UTC-1115.iteration-10.4-tootsie-cli-delegation-pattern.pdca.md
   */
  init(scenario?: any): this {
    // Call parent init
    super.init(scenario);
    
    // ✅ Path Authority: Update component with CLI-specific paths (if already initialized)
    if (this.component) {
      (this.component as any).model.projectRoot = this.model.projectRoot;
      (this.component as any).model.targetDirectory = this.model.projectRoot;
      (this.component as any).model.isTestIsolation = scenario?.model?.isTestIsolation || 
                                             this.model.projectRoot?.includes('/test/data') || 
                                             false;
    }
    
    return this;
  }

  /**
   * Static start method - Web4 radical OOP entry point
   * @pdca 2025-12-02-UTC-1115.iteration-10.4-tootsie-cli-delegation-pattern.pdca.md
   */
  static async start(args: string[]): Promise<void> {
    const cli = new ONCECLI();
    await cli.initComponent(); // Initialize component asynchronously
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
      await this.initComponent();
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
