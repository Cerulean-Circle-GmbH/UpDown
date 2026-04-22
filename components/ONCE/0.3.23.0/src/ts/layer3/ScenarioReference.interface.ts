/**
 * ScenarioReference - Reference to another scenario via IOR
 * Web4 Standard - One type per file
 * @pdca 2025-11-19-UTC-1342.migrate-scenarios-to-ior-owner-format.pdca.md
 */

/**
 * Reference to another scenario via IOR
 */
export interface ScenarioReference {
  name: string;
  ior: string;
  type: string;
  optional?: boolean;
}

