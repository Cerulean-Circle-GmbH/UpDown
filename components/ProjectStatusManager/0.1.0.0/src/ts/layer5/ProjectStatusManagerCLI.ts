#!/usr/bin/env node

/**
 * ProjectStatusManagerCLI - ProjectStatusManager CLI implementation with auto-discovery
 * Web4 pattern: Auto-discovery CLI with chaining support
 */

import { DefaultCLI } from '../layer2/DefaultCLI.js';
import { DefaultProjectStatusManager } from '../layer2/DefaultProjectStatusManager.js';

export class ProjectStatusManagerCLI extends DefaultCLI {
  private component: DefaultProjectStatusManager | null;

  constructor() {
    super();
    this.component = null;
    this.initWithComponentClass(DefaultProjectStatusManager, 'ProjectStatusManager', '0.1.0.0');
  }

  /**
   * Static start method - Web4 radical OOP entry point
   */
  static async start(args: string[]): Promise<void> {
    const cli = new ProjectStatusManagerCLI();
    await cli.execute(args);
  }

  private getOrCreateComponent(): DefaultProjectStatusManager {
    if (!this.component) {
      this.component = this.getComponentInstance() as DefaultProjectStatusManager;
    }
    return this.component;
  }

  /**
   * ProjectStatusManager-specific usage display using DefaultCLI dynamic generation
   */
  showUsage(): void {
    // Use DefaultCLI's auto-discovery which respects @cliHide annotations
    if (typeof super.generateStructuredUsage === 'function') {
      console.log(super.generateStructuredUsage());
    } else {
      // Implement showUsage directly since it's abstract
      console.log('ProjectStatusManager CLI - Run without arguments to see all available methods');
    }
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
  ProjectStatusManagerCLI.start(process.argv.slice(2));
}
