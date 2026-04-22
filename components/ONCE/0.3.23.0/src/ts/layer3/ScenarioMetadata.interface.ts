/**
 * ScenarioMetadata - Scenario metadata
 * Web4 Standard - One type per file
 * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
 */

/**
 * Scenario metadata - enhanced for v0.2.0.0
 */
export interface ScenarioMetadata {
  created: string;
  modified: string;
  creator?: string;
  description?: string;
  tags?: string[];
  
  // Server hierarchy metadata (new in v0.2.0.0)
  domain?: string;
  host?: string;
  port?: number;
  isPrimaryServer?: boolean;
}

