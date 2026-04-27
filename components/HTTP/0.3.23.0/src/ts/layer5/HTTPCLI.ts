#!/usr/bin/env node
/**
 * HTTPCLI - Thin CLI wrapper using @web4x/cli infrastructure
 * Extends DefaultCLI, wraps HTTPServer in DelegationProxy
 */

import { DefaultCLI } from '@web4x/cli/dist/ts/layer2/DefaultCLI.js';
import { DelegationProxy } from '@web4x/cli/dist/ts/layer2/DelegationProxy.js';
import { HTTPServer } from '../layer2/HTTPServer.js';

export class HTTPCLI extends DefaultCLI {
  protected declare component: any;

  constructor() {
    super();
    this.init();
  }

  async initComponent(): Promise<void> {
    const component = new HTTPServer();
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
    const cli = new HTTPCLI();
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
  HTTPCLI.start(process.argv.slice(2));
}
