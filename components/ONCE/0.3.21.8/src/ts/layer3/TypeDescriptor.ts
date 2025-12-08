/**
 * TypeDescriptor - MDA MOF-inspired runtime type metadata
 * 
 * Web4 Principle: Interfaces as first-class citizens
 * 
 * Contains code-first information about a class:
 * - Identity (name, extends, implements)
 * - Registry (implementations for interfaces)
 * 
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import type { Reference } from './Reference.interface.js';
import type { InterfaceConstructor } from './InterfaceConstructor.type.js';

/**
 * TypeDescriptor - Minimal implementation for unit storage integration
 * 
 * Full MDA MOF features (attributes, properties, methods) deferred to Phase G
 */
export class TypeDescriptor {
  // ═══════════════════════════════════════════════════════════════
  // Identity
  // ═══════════════════════════════════════════════════════════════
  
  /** Class/interface name */
  name: string = '';
  
  /** Parent class descriptor (nullable reference) */
  extends: Reference<TypeDescriptor> = null;
  
  /** Implemented interfaces */
  implements: Set<InterfaceConstructor> = new Set();
  
  // ═══════════════════════════════════════════════════════════════
  // Registry (for interfaces)
  // ═══════════════════════════════════════════════════════════════
  
  /** Classes that implement this type */
  implementingClasses: Set<InterfaceConstructor> = new Set();
  
  // ═══════════════════════════════════════════════════════════════
  // Lifecycle
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Empty constructor (Web4 Principle 6)
   */
  constructor() {}
  
  /**
   * Initialize with values
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
  // Interface Registration
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
}

