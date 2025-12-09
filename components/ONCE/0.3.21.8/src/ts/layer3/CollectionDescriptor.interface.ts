/**
 * CollectionDescriptor.interface.ts - Descriptor for arrays of references
 * 
 * Web4 Principle P22: Collection<T>
 * Collections are typed arrays of references.
 * When serialized to scenarios, they become arrays of IOR strings.
 * 
 * Web4 Principle P28: DRY + Code-First
 * Web4 Principle P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/CollectionDescriptor.interface
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import type { FeatureDescriptor } from './FeatureDescriptor.interface.js';

/**
 * CollectionDescriptor - Describes arrays of references
 * 
 * Collection<T> = Reference<T>[]
 * 
 * Collections are arrays where each element is a reference and:
 * - Elements can be null (Reference<T>)
 * - Serialized as IOR string arrays in scenarios
 * - Resolved via TypeRegistry at runtime
 */
export interface CollectionDescriptor extends FeatureDescriptor {
  /**
   * Name of the collection property
   */
  name: string;
  
  /**
   * Element type name (the T in Collection<T>)
   * e.g., 'View', 'PersistenceManager'
   */
  elementType: string;
  
  // Note: Collection elements are references, serialized as IOR array
}

