/**
 * TypeDescriptor.ts - MDA MOF-inspired runtime type metadata
 * 
 * Web4 Principle P28: DRY + Code-First
 * Single point of truth is the TypeScript AST.
 * TypeDescriptors are built from AST data, never runtime reflection.
 * 
 * Web4 Principle P19: One File One Type (implements FeatureDescriptor)
 * 
 * Contains code-first information about a class:
 * - Identity (name, extends, implements)
 * - Structure (attributes, properties, references, collections, methods)
 * - Registry (implementations for interfaces)
 * 
 * @ior ior:esm:/ONCE/{version}/TypeDescriptor
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import type { Reference } from './Reference.interface.js';
import type { InterfaceConstructor } from './InterfaceConstructor.type.js';
import type { FeatureDescriptor } from './FeatureDescriptor.interface.js';
import type { AttributeDescriptor } from './AttributeDescriptor.interface.js';
import type { PropertyDescriptor } from './PropertyDescriptor.interface.js';
import type { ReferenceDescriptor } from './ReferenceDescriptor.interface.js';
import type { CollectionDescriptor } from './CollectionDescriptor.interface.js';
import type { MethodDescriptor } from './MethodDescriptor.interface.js';

/**
 * TypeDescriptorJSON - JSON representation stored in .type.json files
 * Generated at build time from TypeScript AST
 */
export interface TypeDescriptorJSON {
  name: string;
  extends: Reference<string>;  // IOR of parent type
  implements: string[];        // IORs of implemented interfaces
  attributes: AttributeDescriptor[];
  properties: PropertyDescriptor[];
  references: ReferenceDescriptor[];
  collections: CollectionDescriptor[];
  methods: MethodDescriptor[];
}

/**
 * TypeDescriptor - Runtime type metadata
 * 
 * Implements FeatureDescriptor (name is required).
 * Built from TypeScript AST data (never runtime reflection).
 */
export class TypeDescriptor implements FeatureDescriptor {
  // ═══════════════════════════════════════════════════════════════
  // Identity (FeatureDescriptor: name required)
  // ═══════════════════════════════════════════════════════════════
  
  /** Class/interface name (FeatureDescriptor) */
  name: string = '';
  
  /** Parent class descriptor (nullable reference - Web4 P5) */
  extends: Reference<TypeDescriptor> = null;
  
  /** Implemented interfaces */
  implements: Set<InterfaceConstructor> = new Set();
  
  // ═══════════════════════════════════════════════════════════════
  // Structure - MDA M2 Level (Class Definition)
  // ═══════════════════════════════════════════════════════════════
  
  /** Model attributes (data fields without getters/setters) */
  attributes: Map<string, AttributeDescriptor> = new Map();
  
  /** Properties (TypeScript getters/setters) */
  properties: Map<string, PropertyDescriptor> = new Map();
  
  /** References to other objects (Reference<T> - nullable, serialize as IOR) */
  references: Map<string, ReferenceDescriptor> = new Map();
  
  /** Collections (Collection<T> - array of references, serialize as IOR[]) */
  collections: Map<string, CollectionDescriptor> = new Map();
  
  /** Methods */
  methods: Map<string, MethodDescriptor> = new Map();
  
  // ═══════════════════════════════════════════════════════════════
  // Registry (for interfaces - populated during static start())
  // ═══════════════════════════════════════════════════════════════
  
  /** Classes that implement this type */
  implementingClasses: Set<InterfaceConstructor> = new Set();
  
  // ═══════════════════════════════════════════════════════════════
  // Lifecycle (Web4 P6: Empty Constructor)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Empty constructor (Web4 Principle 6)
   */
  constructor() {}
  
  /**
   * Initialize with config
   */
  init(config: {
    name: string;
    extends?: Reference<TypeDescriptor>;
  }): this {
    this.name = config.name;
    this.extends = config.extends ?? null;
    return this;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Factory Methods (AST-First, Code-First Principle)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Build from TypeScript AST data (.type.json) - PREFERRED
   * @param astData JSON data from .type.json file
   */
  static fromASTData(astData: TypeDescriptorJSON): TypeDescriptor {
    const descriptor = new TypeDescriptor();
    descriptor.name = astData.name;
    
    // Add attributes
    astData.attributes.forEach(function(attr) {
      descriptor.attributes.set(attr.name, attr);
    });
    
    // Add properties
    astData.properties.forEach(function(prop) {
      descriptor.properties.set(prop.name, prop);
    });
    
    // Add references
    astData.references.forEach(function(ref) {
      descriptor.references.set(ref.name, ref);
    });
    
    // Add collections
    astData.collections.forEach(function(col) {
      descriptor.collections.set(col.name, col);
    });
    
    // Add methods
    astData.methods.forEach(function(method) {
      descriptor.methods.set(method.name, method);
    });
    
    // Note: extends and implements are resolved later via TypeRegistry
    // since they require class references, not just IOR strings
    
    return descriptor;
  }
  
  // ❌ NO fromClass() - runtime reflection violates DRY principle
  
  // ═══════════════════════════════════════════════════════════════
  // Feature Getters (return Reference<T> - nullable)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get attribute by name
   */
  attributeGet(name: string): Reference<AttributeDescriptor> {
    return this.attributes.get(name) ?? null;
  }
  
  /**
   * Get property by name
   */
  propertyGet(name: string): Reference<PropertyDescriptor> {
    return this.properties.get(name) ?? null;
  }
  
  /**
   * Get reference by name
   */
  referenceGet(name: string): Reference<ReferenceDescriptor> {
    return this.references.get(name) ?? null;
  }
  
  /**
   * Get collection by name
   */
  collectionGet(name: string): Reference<CollectionDescriptor> {
    return this.collections.get(name) ?? null;
  }
  
  /**
   * Get method by name
   */
  methodGet(name: string): Reference<MethodDescriptor> {
    return this.methods.get(name) ?? null;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Interface Registration (for interfaces)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Add an implementing class to this interface's registry
   */
  implementationAdd(implementingClass: InterfaceConstructor): void {
    this.implementingClasses.add(implementingClass);
  }
  
  /**
   * Check if a class implements this interface
   */
  implementationCheck(implementingClass: InterfaceConstructor): boolean {
    return this.implementingClasses.has(implementingClass);
  }
  
  /**
   * Get all implementing classes
   */
  implementationsGet(): InterfaceConstructor[] {
    return Array.from(this.implementingClasses);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Implements Registration (for class descriptors)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Record that this class implements an interface
   */
  implementsAdd(interfaceType: InterfaceConstructor): void {
    this.implements.add(interfaceType);
  }
  
  /**
   * Check if this class implements an interface
   */
  implementsCheck(interfaceType: InterfaceConstructor): boolean {
    return this.implements.has(interfaceType);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Serialization (toScenario pattern)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Convert to JSON format for .type.json file
   */
  toJSON(): TypeDescriptorJSON {
    return {
      name: this.name,
      extends: this.extends?.name ?? null,
      implements: Array.from(this.implements).map(function(i) { 
        return (i as unknown as { name: string }).name; 
      }),
      attributes: Array.from(this.attributes.values()),
      properties: Array.from(this.properties.values()),
      references: Array.from(this.references.values()),
      collections: Array.from(this.collections.values()),
      methods: Array.from(this.methods.values())
    };
  }
}
