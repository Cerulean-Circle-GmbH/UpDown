/**
 * ParameterDescriptor.interface.ts - Descriptor for method parameters
 * 
 * Web4 Principle P28: DRY + Code-First
 * Web4 Principle P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/ParameterDescriptor.interface
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import type { FeatureDescriptor } from './FeatureDescriptor.interface.js';
import type { Reference } from './Reference.interface.js';

/**
 * ParameterDescriptor - Describes method parameters
 * 
 * Used by MethodDescriptor to describe the signature of methods.
 */
export interface ParameterDescriptor extends FeatureDescriptor {
  /**
   * Name of the parameter
   */
  name: string;
  
  /**
   * TypeScript type as string
   */
  type: string;
  
  /**
   * Whether the parameter is optional (has ?)
   */
  optional: boolean;
  
  /**
   * Default value if specified
   * null if no default
   */
  defaultValue: Reference<unknown>;
}




