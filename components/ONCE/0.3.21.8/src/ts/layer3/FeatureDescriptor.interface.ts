/**
 * FeatureDescriptor.interface.ts - Base interface for all descriptor types
 * 
 * Web4 Principle P28: DRY + Code-First
 * All descriptors' single point of truth is the code and the component's TypeScript AST.
 * 
 * Web4 Principle P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/FeatureDescriptor.interface
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

/**
 * FeatureDescriptor - Base for all descriptor types
 * 
 * Every feature in a class/interface has at minimum a name.
 * This is the common base for attributes, properties, methods, references, collections.
 */
export interface FeatureDescriptor {
  /**
   * Name of the feature
   * Required - every feature has a name
   */
  name: string;
}














