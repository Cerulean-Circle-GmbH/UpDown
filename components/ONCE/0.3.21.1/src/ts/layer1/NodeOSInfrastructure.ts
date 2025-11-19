/**
 * NodeOSInfrastructure - TRUE Radical OOP Infrastructure
 * Web4 EAM Layer 1 - ONLY place where 'os' module is imported
 * 
 * @pdca 2025-11-19-UTC-1100.user-migration-layer1.pdca.md
 */

import { EnvironmentModel } from '../layer3/EnvironmentModel.interface.js';
import { EnvironmentScenario } from '../layer3/EnvironmentScenario.interface.js';
import { DefaultEnvironmentModel } from './DefaultEnvironmentModel.js';

export class NodeOSInfrastructure {
  private model: EnvironmentModel;
  
  constructor() {
    this.model = new DefaultEnvironmentModel();
  }
  
  public getModel(): EnvironmentModel {
    return this.model;
  }
  
  public setModel(model: EnvironmentModel): void {
    this.model = model;
  }
  
  public async detectEnvironment(): Promise<EnvironmentModel> {
    const os = await import('os');  // ✅ ONLY import here
    
    const fqdn: string = os.hostname();
    const hostname: string = this.extractHostname(fqdn);
    const primaryIP: string = this.detectPrimaryIP(os);
    const domain: string = this.extractDomain(fqdn);
    
    this.model.setHostname(hostname);
    this.model.setFqdn(fqdn);
    this.model.setPrimaryIP(primaryIP);
    this.model.setDomain(domain);
    
    return this.model;
  }
  
  public init(scenario?: EnvironmentScenario): this {
    if (scenario) {
      this.model.init(scenario);
    }
    return this;
  }
  
  public toScenario(): EnvironmentScenario {
    return this.model.toScenario();
  }
  
  private extractHostname(fqdn: string): string {
    if (fqdn.includes('.')) {
      const parts: string[] = fqdn.split('.');
      return parts[0];
    }
    return fqdn;
  }
  
  private extractDomain(fqdn: string): string {
    if (fqdn === 'localhost') {
      return 'local.once';
    }
    if (fqdn.includes('.')) {
      const parts: string[] = fqdn.split('.');
      parts.shift(); // Remove hostname
      return parts.reverse().join('.');
    }
    return 'local.once';
  }
  
  private detectPrimaryIP(os: any): string {
    try {
      const interfaces = os.networkInterfaces();
      const interfaceNames: string[] = Object.keys(interfaces);
      
      for (const name of interfaceNames) {
        const ifaces = interfaces[name];
        if (!ifaces) continue;
        
        for (const iface of ifaces) {
          if (iface.family === 'IPv4' && !iface.internal) {
            return iface.address;
          }
        }
      }
    } catch (error) {
      console.warn('⚠️  Failed to detect primary IP:', error);
    }
    return '127.0.0.1';
  }
}

