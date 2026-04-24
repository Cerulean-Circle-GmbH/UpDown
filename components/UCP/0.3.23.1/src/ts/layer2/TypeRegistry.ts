/**
 * TypeRegistry.ts - Central registry for runtime type information
 * 
 * INTEGRAL TO ONCE KERNEL - responsible for:
 * - Loading/unloading classes and units
 * - Starting/stopping classes
 * - Initializing types from AST
 * - Tracking interface implementations
 * 
 * Web4 Principle P28: DRY + Code-First
 * Single point of truth is the TypeScript AST.
 * TypeDescriptors are built from AST data loaded from .type.json files.
 * 
 * @ior ior:esm:/ONCE/{version}/TypeRegistry
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import { TypeDescriptor, TypeDescriptorJSON } from '../layer3/TypeDescriptor.js';
import type { Reference } from '../layer3/Reference.interface.js';
import type { InterfaceConstructor } from '../layer3/InterfaceConstructor.type.js';

/**
 * TypeRegistry - Singleton registry for all loaded types
 * 
 * Part of ONCE kernel responsible for full object lifecycle:
 * - LOAD: Import module, load .type.json
 * - START: Build TypeDescriptor, register implementations
 * - INIT: Resolve references from IORs
 * - HIBERNATE: Convert references to IORs
 * - STOP: Unregister, cleanup
 */
export class TypeRegistry {
  // ═══════════════════════════════════════════════════════════════
  // Singleton Instance
  // ═══════════════════════════════════════════════════════════════
  
  private static instanceField: Reference<TypeRegistry> = null;
  
  /**
   * Get singleton instance (TypeScript getter - Web4 P16)
   */
  static get instance(): TypeRegistry {
    if (!TypeRegistry.instanceField) {
      TypeRegistry.instanceField = new TypeRegistry();
    }
    return TypeRegistry.instanceField;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Registry Storage
  // ═══════════════════════════════════════════════════════════════
  
  /** Map of class constructor to TypeDescriptor */
  private typeMap: Map<InterfaceConstructor, TypeDescriptor> = new Map();
  
  /** Map of type name to class constructor */
  private nameMap: Map<string, InterfaceConstructor> = new Map();
  
  /** Map of IOR to class constructor */
  private iorMap: Map<string, InterfaceConstructor> = new Map();
  
  // ═══════════════════════════════════════════════════════════════
  // Lifecycle
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Private constructor (singleton)
   */
  private constructor() {}
  
  // ═══════════════════════════════════════════════════════════════
  // Registration (called from static start())
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Register a class with its AST-derived type data
   * Called from UcpComponent.start() or JsInterface registration
   * 
   * @param classConstructor The class to register
   * @param astData Optional AST data from .type.json (if not provided, minimal descriptor created)
   */
  register(classConstructor: InterfaceConstructor, astData?: TypeDescriptorJSON): void {
    // Build TypeDescriptor from AST data or create minimal
    let descriptor: TypeDescriptor;
    if (astData) {
      descriptor = TypeDescriptor.fromASTData(astData);
    } else {
      descriptor = new TypeDescriptor();
      descriptor.name = classConstructor.name;
    }
    
    // Store in maps
    this.typeMap.set(classConstructor, descriptor);
    this.nameMap.set(descriptor.name, classConstructor);
    
    // Attach to class
    (classConstructor as unknown as { type: TypeDescriptor }).type = descriptor;
    
    // Auto-discover implements from AST data and register with interfaces
    if (astData?.implements) {
      const self = this;
      astData.implements.forEach(function(interfaceName: string) {
        const interfaceConstructor = self.nameMap.get(interfaceName);
        if (interfaceConstructor) {
          const interfaceDescriptor = self.typeMap.get(interfaceConstructor);
          if (interfaceDescriptor) {
            interfaceDescriptor.implementationAdd(classConstructor);
            descriptor.implementsAdd(interfaceConstructor);
          }
        }
      });
    }
  }
  
  /**
   * Register with IOR for lookup
   */
  registerIOR(ior: string, classConstructor: InterfaceConstructor): void {
    this.iorMap.set(ior, classConstructor);
  }
  
  /**
   * Unregister a class (called from static stop())
   */
  unregister(classConstructor: InterfaceConstructor): void {
    const descriptor = this.typeMap.get(classConstructor);
    if (descriptor) {
      this.nameMap.delete(descriptor.name);
      this.typeMap.delete(classConstructor);
      
      // Clean up from interface implementations
      const self = this;
      descriptor.implements.forEach(function(interfaceType: InterfaceConstructor) {
        const interfaceDescriptor = self.typeMap.get(interfaceType);
        if (interfaceDescriptor) {
          interfaceDescriptor.implementingClasses.delete(classConstructor);
        }
      });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Lookup
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Lookup TypeDescriptor for a class
   * Web4 P16: parameterized lookup uses xyzLookup/xyzFrom naming
   */
  typeLookup(classConstructor: InterfaceConstructor): Reference<TypeDescriptor> {
    return this.typeMap.get(classConstructor) ?? null;
  }
  
  /**
   * Lookup class constructor by name
   */
  classFromName(name: string): Reference<InterfaceConstructor> {
    return this.nameMap.get(name) ?? null;
  }
  
  /**
   * Lookup class constructor by IOR
   */
  classFromIOR(ior: string): Reference<InterfaceConstructor> {
    return this.iorMap.get(ior) ?? null;
  }
  
  /**
   * Lookup all implementations of an interface
   */
  implementationsLookup(interfaceType: InterfaceConstructor): InterfaceConstructor[] {
    const descriptor = this.typeMap.get(interfaceType);
    if (descriptor) {
      return descriptor.implementations;
    }
    return [];
  }
  
  // ═══════════════════════════════════════════════════════════════
  // IOR Resolution (for Reference<T> and Collection<T>)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Resolve an IOR to a class constructor
   * Used when deserializing scenarios with Reference<T> fields
   */
  resolveIOR(ior: string): Reference<InterfaceConstructor> {
    return this.iorMap.get(ior) ?? null;
  }
  
  /**
   * Convert a class to its IOR
   * Used when serializing scenarios with Reference<T> fields
   */
  toIOR(classConstructor: InterfaceConstructor): Reference<string> {
    // Find IOR by reverse lookup
    for (const [ior, cls] of this.iorMap.entries()) {
      if (cls === classConstructor) {
        return ior;
      }
    }
    return null;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Enumeration
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get all registered classes
   */
  allClasses(): InterfaceConstructor[] {
    return Array.from(this.typeMap.keys());
  }
  
  /**
   * Get all registered type names
   */
  allNames(): string[] {
    return Array.from(this.nameMap.keys());
  }
  
  /**
   * Get count of registered types
   */
  get size(): number {
    return this.typeMap.size;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Reset (for testing)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Clear all registrations (for testing only)
   */
  clear(): void {
    this.typeMap.clear();
    this.nameMap.clear();
    this.iorMap.clear();
  }
}

