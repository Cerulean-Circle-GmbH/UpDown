/**
 * JsInterface - Base class for runtime-existing interfaces
 * 
 * Web4 Principle: Interfaces as first-class citizens
 * 
 * TypeScript interfaces are erased at runtime. JsInterface solves this by:
 * - Creating a class that represents the interface
 * - Storing type metadata in static typeDescriptor
 * - Tracking all implementations (service registry pattern)
 * 
 * Usage:
 * ```typescript
 * // Define interface as abstract class extending JsInterface
 * export abstract class PersistenceManager extends JsInterface {
 *   abstract scenarioSave(uuid: string, scenario: Scenario): Promise<void>;
 *   abstract scenarioLoad(uuid: string): Promise<Scenario>;
 * }
 * 
 * // Implementation registers automatically via static start()
 * export class UcpStorage extends UcpComponent implements PersistenceManager {
 *   static start(): void {
 *     super.start();
 *     PersistenceManager.implementationRegister(UcpStorage);
 *   }
 * }
 * 
 * // Lookup implementations
 * const implementations = PersistenceManager.implementationsGet();
 * ```
 * 
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import { TypeDescriptor } from './TypeDescriptor.js';
import type { InterfaceConstructor } from './InterfaceConstructor.type.js';

/**
 * JsInterface - Abstract base class for all Web4 interfaces
 * 
 * Extends this class to make TypeScript interfaces exist at runtime.
 */
export abstract class JsInterface {
  // ═══════════════════════════════════════════════════════════════
  // Static Type Descriptor
  // ═══════════════════════════════════════════════════════════════
  
  /** 
   * Type descriptor - runtime metadata about this interface
   * Initialized lazily on first access
   */
  static type: TypeDescriptor;
  
  /**
   * Get or create the type descriptor for this interface
   */
  static typeGet(): TypeDescriptor {
    if (!this.type) {
      this.type = new TypeDescriptor().init({ name: this.name });
    }
    return this.type;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // Implementation Registry
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Register a class as implementing this interface
   */
  static implementationRegister(implementingClass: InterfaceConstructor): void {
    this.typeGet().implementationAdd(implementingClass);
  }
  
  /**
   * Get all classes implementing this interface
   */
  static implementationsGet(): InterfaceConstructor[] {
    return this.typeGet().implementationsGet();
  }
  
  /**
   * Check if a class implements this interface
   */
  static implementationCheck(implementingClass: InterfaceConstructor): boolean {
    return this.typeGet().implementationCheck(implementingClass);
  }
}

