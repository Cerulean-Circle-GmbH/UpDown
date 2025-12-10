/**
 * TypeDescriptorModel.interface.ts - Model for TypeDescriptor scenarios
 * 
 * Web4 Principle P1: Everything is a Scenario
 * TypeDescriptor data is stored as scenarios, not separate .type.json files.
 * 
 * Web4 Principle P19: One File One Type
 * Web4 Principle P28: DRY + Code-First (AST is single point of truth)
 * 
 * @ior ior:esm:/ONCE/{version}/TypeDescriptorModel.interface
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import type { Model } from './Model.interface.js';
import type { AttributeDescriptor } from './AttributeDescriptor.interface.js';
import type { PropertyDescriptor } from './PropertyDescriptor.interface.js';
import type { ReferenceDescriptor } from './ReferenceDescriptor.interface.js';
import type { CollectionDescriptor } from './CollectionDescriptor.interface.js';
import type { MethodDescriptor } from './MethodDescriptor.interface.js';
import type { Reference } from './Reference.interface.js';

/**
 * TypeDescriptorModel - Model for type metadata scenarios
 * 
 * Stored as a scenario in scenarios/type/{className}.type.scenario.json
 * Built from TypeScript AST during component build.
 */
export interface TypeDescriptorModel extends Model {
  /**
   * UUID from base Model
   */
  uuid: string;
  
  /**
   * Class/interface name
   */
  name: string;
  
  /**
   * Parent class IOR (nullable reference)
   * e.g., "ior:esm:/ONCE/0.3.21.8/UcpComponent"
   */
  extends: Reference<string>;
  
  /**
   * Implemented interface IORs
   * e.g., ["ior:esm:/ONCE/0.3.21.8/PersistenceManager"]
   */
  implements: string[];
  
  /**
   * Source file path (relative to component root)
   */
  sourcePath: string;
  
  /**
   * Index path for scenario storage
   * e.g., "scenarios/index/{uuid}.type.scenario.json"
   */
  indexPath: string;
  
  /**
   * Symlink paths for lookups
   */
  symlinkPaths: string[];
  
  // ═══════════════════════════════════════════════════════════════
  // Structure - MDA M2 Level (from AST)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Model attributes (data fields without getters/setters)
   */
  attributes: AttributeDescriptor[];
  
  /**
   * Properties (TypeScript getters/setters)
   */
  properties: PropertyDescriptor[];
  
  /**
   * References to other objects (Reference<T>)
   */
  references: ReferenceDescriptor[];
  
  /**
   * Collections (Collection<T>)
   */
  collections: CollectionDescriptor[];
  
  /**
   * Methods
   */
  methods: MethodDescriptor[];
  
  // ═══════════════════════════════════════════════════════════════
  // Metadata
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Component name
   */
  component: string;
  
  /**
   * Component version
   */
  version: string;
  
  /**
   * Created timestamp
   */
  createdAt: string;
  
  /**
   * Updated timestamp
   */
  updatedAt: string;
  
  /**
   * Is this an interface (abstract) or a class?
   */
  isInterface: boolean;
  
  /**
   * Is this an abstract class?
   */
  isAbstract: boolean;
}



