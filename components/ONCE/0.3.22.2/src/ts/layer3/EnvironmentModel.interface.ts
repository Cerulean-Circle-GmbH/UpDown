/**
 * EnvironmentModel Interface - JavaBean-style contract with TypeScript accessors
 * Web4 EAM Layer 3 - Pure interface, no implementation
 * 
 * @pdca 2025-11-19-UTC-1100.user-migration-layer1.pdca.md
 * @web4 P16 - TypeScript Accessors
 */

import { EnvironmentScenario } from './EnvironmentScenario.interface.js';

export interface EnvironmentModel {
  hostname: string;
  fqdn: string;
  primaryIP: string;
  domain: string;
  
  toScenario(): EnvironmentScenario;
  init(scenario?: EnvironmentScenario): this;
}

