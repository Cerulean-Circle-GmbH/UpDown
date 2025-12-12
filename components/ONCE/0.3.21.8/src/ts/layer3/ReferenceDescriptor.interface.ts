/**
 * ReferenceDescriptor.interface.ts - Descriptor for nullable references to instances
 * 
 * Web4 Principle P5: Reference<T>
 * References are nullable by definition (T | null).
 * When serialized to scenarios, they become IOR strings.
 * 
 * Web4 Principle P28: DRY + Code-First
 * Web4 Principle P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/ReferenceDescriptor.interface
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import type { FeatureDescriptor } from './FeatureDescriptor.interface.js';

/**
 * ReferenceDescriptor - Describes nullable references to instances
 * 
 * Reference<T> = T | null
 * 
 * References point to other objects and are:
 * - Always nullable (Web4 P5)
 * - Serialized as IOR strings in scenarios
 * - Resolved via TypeRegistry at runtime
 */
export interface ReferenceDescriptor extends FeatureDescriptor {
  /**
   * Name of the reference property
   */
  name: string;
  
  /**
   * Target type name (the T in Reference<T>)
   * e.g., 'PersistenceManager', 'UcpComponent'
   */
  targetType: string;
  
  // Note: References are ALWAYS nullable by definition (Reference<T> pattern)
  // When serialized: becomes IOR string in scenario
}





