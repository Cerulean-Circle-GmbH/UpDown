/**
 * AttributeDescriptor.interface.ts - Descriptor for model attributes (data fields)
 * 
 * Web4 Principle P28: DRY + Code-First
 * Web4 Principle P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/AttributeDescriptor.interface
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import type { FeatureDescriptor } from './FeatureDescriptor.interface.js';
import type { Reference } from './Reference.interface.js';

/**
 * AttributeDescriptor - Describes model properties (data fields)
 * 
 * Attributes are simple data properties on a class model.
 * They do not have getters/setters (those are PropertyDescriptor).
 */
export interface AttributeDescriptor extends FeatureDescriptor {
  /**
   * Name of the attribute
   */
  name: string;
  
  /**
   * TypeScript type as string
   * e.g., 'string', 'number', 'boolean', 'MyInterface'
   */
  type: string;
  
  /**
   * Whether the attribute is optional (has ?)
   */
  optional: boolean;
  
  /**
   * Default value if specified
   * null if no default
   */
  defaultValue: Reference<unknown>;
}





