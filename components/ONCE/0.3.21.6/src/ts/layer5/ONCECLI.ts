#!/usr/bin/env node

/**
 * ONCECLI - ONCE CLI implementation with chaining support
 * Web4 pattern: Dependency-free CLI with component creation and chaining
 */

import { DefaultCLI } from '../layer2/DefaultCLI.js';
import { NodeJsOnce } from '../layer2/NodeJsOnce.js';
import { MethodSignature } from '../layer3/MethodSignature.interface.js';

export class ONCECLI extends DefaultCLI {
  // @pdca 2025-11-03-1105-component-template-bugs.pdca.md - Use declare to override component type
  // @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md - Cast to any to avoid Scenario type conflicts
  protected declare component: any;
  protected methodSignatures: Map<string, MethodSignature> = new Map();

  /**
   * Empty constructor (Web4 radical OOP pattern)
   * @pdca 2025-10-30-UTC-1011.pdca.md - Path Authority architecture
   * @pdca 2025-10-31-UTC-1230.test-isolation-violation-fix.pdca.md - Pass targetDirectory
   * @pdca 2025-10-31-UTC-1208.cli-model-duplication-cleanup.pdca.md - Remove useless tempComponent
   * @pdca 2025-11-03-1105-component-template-bugs.pdca.md - Create component immediately for discovery
   * @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md - init() is now async
   */
  constructor() {
    super(); // Call empty parent constructor
    
    // Initialize CLI (Path Authority - calculates projectRoot, sets paths)
    this.init();
    
    // Create component - it discovers its own componentRoot and version in constructor
    // @pdca 2025-11-21-UTC-1630.test-isolation-path-violation.pdca.md - Follow Web4TSComponent pattern
    this.component = new DefaultONCE();
    
    // ✅ Path Authority: CLI overrides projectRoot and other CLI-specific paths
    // Component already set: componentRoot, version (from its own constructor via discoverPathsFromFilesystem())
    // CLI provides: projectRoot, targetDirectory, isTestIsolation
    this.component.model.projectRoot = this.model.projectRoot;
    this.component.model.targetDirectory = this.model.projectRoot;
    this.component.model.isTestIsolation = this.model.projectRoot?.includes('/test/data') || false;
    
    // Discover methods from CLI (walks CLI prototype chain)
    this.discoverMethods();
    
    // Copy component methods to methodSignatures for test/completion discovery
    // @pdca 2025-11-05-UTC-2301.dry-shell-libraries.pdca.md - Populate methodSignatures from component
    const componentMethods = this.component.listMethods();
    for (const methodName of componentMethods) {
      const signature = this.component.getMethodSignature(methodName);
      if (signature) {
        this.methodSignatures.set(methodName, signature);
      }
    }
  }

  /**
   * Override init() to support test scenarios
   * @pdca 2025-11-21-UTC-1630.test-isolation-path-violation.pdca.md
   */
  init(scenario?: any): this {
    // Call parent init
    super.init(scenario);
    
    // ✅ Path Authority: Update component with CLI-specific paths
    if (this.component) {
      // Component already has componentRoot and version from its own init()
      // CLI only overrides projectRoot and isTestIsolation
      this.component.model.projectRoot = this.model.projectRoot;
      this.component.model.targetDirectory = this.model.projectRoot;
      this.component.model.isTestIsolation = scenario?.model?.isTestIsolation || 
                                             this.model.projectRoot?.includes('/test/data') || 
                                             false;
    }
    
    return this;
  }

  /**
   * Static start method - Web4 radical OOP entry point
   */
  static async start(args: string[]): Promise<void> {
    const cli = new ONCECLI();
    await cli.execute(args);
  }

  /**
   * ONCE-specific usage display using DefaultCLI dynamic generation
   */
  showUsage(): void {
    console.log(this.generateStructuredUsage());
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
