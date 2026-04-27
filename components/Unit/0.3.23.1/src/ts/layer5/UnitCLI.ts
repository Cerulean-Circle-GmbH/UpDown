#!/usr/bin/env node
/**
 * UnitCLI - Thin CLI wrapper using @web4x/cli infrastructure
 * Extends DefaultCLI, wraps DefaultUnit in DelegationProxy
 */

import { DefaultCLI } from '@web4x/cli/dist/ts/layer2/DefaultCLI.js';
import { DelegationProxy } from '@web4x/cli/dist/ts/layer2/DelegationProxy.js';
import { DefaultUnit } from '../layer2/DefaultUnit.js';

export class UnitCLI extends DefaultCLI {
  protected declare component: any;

  constructor() {
    super();
    this.init();
  }

  async initComponent(): Promise<void> {
    const component = new DefaultUnit();
    if (typeof component.init === 'function') {
      component.init();
    }
    this.component = await DelegationProxy.start(component as any) as any;
    this.discoverMethods();
    if (this.component) {
      const ownMethods = this.component.listMethods?.() || [];
      for (const methodName of ownMethods) {
        const signature = this.component.getMethodSignature?.(methodName);
        if (signature) {
          (this as any).methodSignatures?.set(methodName, signature);
        }
      }
    }
  }

  static async start(args: string[]): Promise<void> {
    const cli = new UnitCLI();
    await cli.initComponent();
    await cli.execute(args);
  }

  showUsage(): void {
    console.log(this.generateStructuredUsage());
  }

  async execute(args: string[]): Promise<void> {
    if (args.length === 0) {
      this.showUsage();
      return;
    }
    const command = args[0];
    const commandArgs = args.slice(1);
    try {
      if (await this.executeDynamicCommand(command, commandArgs)) return;
      if (command === 'help') { this.showUsage(); return; }
      throw new Error('Unknown command: ' + command);
    } catch (error) {
      console.error(this.formatError((error as Error).message));
      process.exit(1);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  UnitCLI.start(process.argv.slice(2));
}
