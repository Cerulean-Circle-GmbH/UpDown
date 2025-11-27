/**
 * DefaultEnvironmentModel - JavaBean implementation
 * Web4 EAM Layer 1 - Infrastructure model with encapsulation
 * 
 * @pdca 2025-11-19-UTC-1100.user-migration-layer1.pdca.md
 */

import { EnvironmentModel } from '../layer3/EnvironmentModel.interface.js';
import { EnvironmentScenario } from '../layer3/EnvironmentScenario.interface.js';

export class DefaultEnvironmentModel implements EnvironmentModel {
  private hostname: string;
  private fqdn: string;
  private primaryIP: string;
  private domain: string;
  
  constructor() {
    this.hostname = '';
    this.fqdn = '';
    this.primaryIP = '';
    this.domain = '';
  }
  
  public getHostname(): string {
    return this.hostname;
  }
  
  public setHostname(hostname: string): void {
    this.hostname = hostname;
  }
  
  public getFqdn(): string {
    return this.fqdn;
  }
  
  public setFqdn(fqdn: string): void {
    this.fqdn = fqdn;
  }
  
  public getPrimaryIP(): string {
    return this.primaryIP;
  }
  
  public setPrimaryIP(ip: string): void {
    this.primaryIP = ip;
  }
  
  public getDomain(): string {
    return this.domain;
  }
  
  public setDomain(domain: string): void {
    this.domain = domain;
  }
  
  public toScenario(): EnvironmentScenario {
    return {
      hostname: this.hostname,
      fqdn: this.fqdn,
      primaryIP: this.primaryIP,
      domain: this.domain
    };
  }
  
  public init(scenario?: EnvironmentScenario): this {
    if (scenario) {
      this.hostname = scenario.hostname;
      this.fqdn = scenario.fqdn;
      this.primaryIP = scenario.primaryIP;
      this.domain = scenario.domain;
    }
    return this;
  }
}

