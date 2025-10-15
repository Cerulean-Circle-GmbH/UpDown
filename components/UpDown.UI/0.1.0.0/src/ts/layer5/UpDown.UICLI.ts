#!/usr/bin/env node

/**
 * UpDown.UICLI - UpDown.UI CLI implementation with auto-discovery
 * Web4 pattern: Auto-discovery CLI with chaining support
 */

import { DefaultCLI } from '../layer2/DefaultCLI.js';
import { DefaultUpDown.UI } from '../layer2/DefaultUpDown.UI.js';

export class UpDown.UICLI extends DefaultCLI {
  private component: DefaultUpDown.UI | null;

  constructor() {
    super();
    this.component = null;
    this.initWithComponentClass(DefaultUpDown.UI, 'UpDown.UI', '0.1.0.0');
  }

  /**
   * Static start method - Web4 radical OOP entry point
   */
  static async start(args: string[]): Promise<void> {
    const cli = new UpDown.UICLI();
    await cli.execute(args);
  }

  private getOrCreateComponent(): DefaultUpDown.UI {
    if (!this.component) {
      this.component = this.getComponentInstance() as DefaultUpDown.UI;
    }
    return this.component;
  }

  /**
   * UpDown.UI-specific usage display using DefaultCLI dynamic generation
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
  UpDown.UICLI.start(process.argv.slice(2));
}
