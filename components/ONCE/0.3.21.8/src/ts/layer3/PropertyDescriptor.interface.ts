/**
 * PropertyDescriptor.interface.ts - Descriptor for TypeScript getters/setters
 * 
 * Web4 Principle P16: TypeScript Accessors
 * Web4 Principle P28: DRY + Code-First
 * Web4 Principle P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/PropertyDescriptor.interface
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import type { FeatureDescriptor } from './FeatureDescriptor.interface.js';

/**
 * PropertyDescriptor - Describes TypeScript getter/setter properties
 * 
 * Properties have get/set accessors and map to model attributes.
 * Web4 enforces TypeScript accessors (P16) for encapsulation.
 */
export interface PropertyDescriptor extends FeatureDescriptor {
  /**
   * Name of the property
   */
  name: string;
  
  /**
   * TypeScript type as string
   */
  type: string;
  
  /**
   * Whether property has a getter
   */
  hasGetter: boolean;
  
  /**
   * Whether property has a setter
   */
  hasSetter: boolean;
  
  /**
   * Whether property is readonly (getter only)
   */
  isReadonly: boolean;
}



