/**
 * EnvironmentModel Interface - JavaBean-style contract
 * Web4 EAM Layer 3 - Pure interface, no implementation
 * 
 * @pdca 2025-11-19-UTC-1100.user-migration-layer1.pdca.md
 */

import { EnvironmentScenario } from './EnvironmentScenario.interface.js';

export interface EnvironmentModel {
  getHostname(): string;
  setHostname(hostname: string): void;
  
  getFqdn(): string;
  setFqdn(fqdn: string): void;
  
  getPrimaryIP(): string;
  setPrimaryIP(ip: string): void;
  
  getDomain(): string;
  setDomain(domain: string): void;
  
  toScenario(): EnvironmentScenario;
  init(scenario?: EnvironmentScenario): this;
}

