/**
 * Colors - Terminal ANSI color codes interface
 * 
 * Web4 Principle 19: One File One Type
 * Migrated from Web4TSComponent/0.3.20.6
 * 
 * @pdca 2025-12-08-UTC-1400.web4tscomponent-migration.pdca.md
 */

export interface Colors {
  // Basic colors
  reset: string;
  bold: string;
  dim: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  orange: string;
  
  // Semantic colors for CLI
  toolName: string;
  version: string;
  commands: string;
  parameters: string;
  descriptions: string;
  examples: string;
  sections: string;
}
