/**
 * MethodSignature - Simple method metadata for CLI routing
 * 
 * Web4 Principle 19: One File One Type
 * Migrated from Web4TSComponent/0.3.20.6
 * 
 * @pdca 2025-12-08-UTC-1400.web4tscomponent-migration.pdca.md
 */

/**
 * Simple method signature metadata for CLI routing
 */
export interface MethodSignature {
  /** Method name */
  name: string;
  
  /** Number of parameters (for validation) */
  paramCount: number;
  
  /** Whether method is async (for await handling) */
  isAsync: boolean;
}
