/**
 * EnvironmentScenario Interface - Data transfer object
 * Web4 EAM Layer 3 - Scenario serialization contract
 * 
 * @pdca 2025-11-19-UTC-1100.user-migration-layer1.pdca.md
 */

export interface EnvironmentScenario {
  hostname: string;
  fqdn: string;
  primaryIP: string;
  domain: string;
}

