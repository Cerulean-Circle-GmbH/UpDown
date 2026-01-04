#!/usr/bin/env node

/**
 * ONCECLI - ONCE CLI implementation
 * 
 * Entry point: ONCECLI.start(args)
 * Pattern: Static async start() handles all async work (Layer 5 is allowed async)
 * 
 * @pdca 2026-01-04-UTC-1121.model-consolidation-dry-cleanup.pdca.md MC.4
 */

import { DefaultCLI } from '../layer2/DefaultCLI.js';
import { NodeJsOnce } from '../layer2/NodeJsOnce.js';
import { DelegationProxy } from '../layer2/DelegationProxy.js';
import { MethodSignature } from '../layer3/MethodSignature.interface.js';

export class ONCECLI extends DefaultCLI {
  /** Method signatures for CLI help and completion */
  protected methodSignatures: Map<string, MethodSignature> = new Map();

  /**
   * Empty constructor (Web4 P6)
   */
  constructor() {
    super();
  }
  
  /**
   * Initialize CLI (sync)
   * @param scenario Optional scenario with model overrides
   * @returns this for chaining
   */
  init(scenario?: any): this {
    super.init(scenario);
    return this;
  }

  /**
   * Static CLI entry — ONLY entry point for CLI
   * All async work happens here (Layer 5 allows async)
   * 
   * Note: Named 'cliStart' to avoid conflict with UcpComponent.start()
   * @pdca 2026-01-04-UTC-1121.model-consolidation-dry-cleanup.pdca.md MC.4, MC.2.1
   */
  static async cliStart(args: string[]): Promise<void> {
    const cli = new ONCECLI().init();
    
    // Create and wrap component (async work)
    const component = new NodeJsOnce();
    
    // MC.2.5: Set CLI reference for path access (P16: setter)
    // @pdca 2026-01-04-UTC-1121.model-consolidation-dry-cleanup.pdca.md MC.2.5
    component.cli = cli;
    
    // Legacy: Also set model properties for backward compatibility during migration
    (component as any).model.projectRoot = cli.model.projectRoot;
    (component as any).model.targetDirectory = cli.model.projectRoot;
    (component as any).model.isTestIsolation = cli.model.projectRoot?.includes('/test/data') || false;
    
    await (component as any).getWeb4TSComponent();
    cli.component = await DelegationProxy.start(component as any) as any;
    
    // Discover methods
    cli.discoverMethods();
    cli.discoverComponentMethods();
    
    await cli.execute(args);
  }

  /**
   * Discover component and delegated methods for CLI completion
   */
  private discoverComponentMethods(): void {
    if (this.component) {
      const ownMethods = this.component.listMethods();
      for (const methodName of ownMethods) {
        const signature = this.component.getMethodSignature(methodName);
        if (signature) {
          this.methodSignatures.set(methodName, signature);
        }
      }
    }
    
    if (this.component && (this.component as any).hasDelegation?.()) {
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

  showUsage(): void {
    console.log(this.generateStructuredUsage());
  }

  async shCompletion(cword: string, ...words: string[]): Promise<void> {
    // Ensure component is ready for completion
    if (!this.component) {
      // Re-run start logic for completion context
      const component = new NodeJsOnce();
      (component as any).model.projectRoot = this.model.projectRoot;
      await (component as any).getWeb4TSComponent();
      this.component = await DelegationProxy.start(component as any) as any;
      this.discoverComponentMethods();
    }
    await super.shCompletion(cword, ...words);
  }

  listMethods(): string[] {
    const methods = new Set<string>();
    if (this.component?.listMethods) {
      this.component.listMethods().forEach((m: string) => methods.add(m));
    }
    for (const methodName of this.methodSignatures.keys()) {
      methods.add(methodName);
    }
    return Array.from(methods).sort();
  }

  protected async getValidCompletionValues(): Promise<string[]> {
    const values = await super.getValidCompletionValues();
    if (this.model.completionIsCompletingMethod) {
      const filterPrefix = this.model.completionCurrentWord || "";
      for (const [methodName, signature] of this.methodSignatures) {
        if ((signature as any).isDelegated && 
            !values.includes(methodName) &&
            methodName.startsWith(filterPrefix) &&
            !methodName.endsWith("ParameterCompletion")) {
          values.push(methodName);
        }
      }
      values.sort();
    }
    return values;
  }

  async execute(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.showUsage();
      return;
    }

    const command = args[0];
    const commandArgs = args.slice(1);

    try {
      if (await this.executeDynamicCommand(command, commandArgs)) {
        return;
      }

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
  ONCECLI.cliStart(process.argv.slice(2));
}
