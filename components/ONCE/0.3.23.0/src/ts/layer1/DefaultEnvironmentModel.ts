/**
 * DefaultEnvironmentModel - Implementation with TypeScript accessors
 * Web4 EAM Layer 1 - Infrastructure model with encapsulation
 * 
 * @pdca 2025-11-19-UTC-1100.user-migration-layer1.pdca.md
 * @web4 P16 - TypeScript Accessors
 */

import { EnvironmentModel } from '../layer3/EnvironmentModel.interface.js';
import { EnvironmentScenario } from '../layer3/EnvironmentScenario.interface.js';

export class DefaultEnvironmentModel implements EnvironmentModel {
  private hostnameField: string;
  private fqdnField: string;
  private primaryIPField: string;
  private domainField: string;
  
  constructor() {
    this.hostnameField = '';
    this.fqdnField = '';
    this.primaryIPField = '';
    this.domainField = '';
  }
  
  public get hostname(): string {
    return this.hostnameField;
  }
  
  public set hostname(value: string) {
    this.hostnameField = value;
  }
  
  public get fqdn(): string {
    return this.fqdnField;
  }
  
  public set fqdn(value: string) {
    this.fqdnField = value;
  }
  
  public get primaryIP(): string {
    return this.primaryIPField;
  }
  
  public set primaryIP(value: string) {
    this.primaryIPField = value;
  }
  
  public get domain(): string {
    return this.domainField;
  }
  
  public set domain(value: string) {
    this.domainField = value;
  }
  
  public toScenario(): EnvironmentScenario {
    return {
      hostname: this.hostnameField,
      fqdn: this.fqdnField,
      primaryIP: this.primaryIPField,
      domain: this.domainField
    };
  }
  
  public init(scenario?: EnvironmentScenario): this {
    if (scenario) {
      this.hostnameField = scenario.hostname;
      this.fqdnField = scenario.fqdn;
      this.primaryIPField = scenario.primaryIP;
      this.domainField = scenario.domain;
    }
    return this;
  }
}

