/**
 * View.ts - Runtime JsInterface for Views
 * 
 * ✅ Web4 Principle 35: JsInterface for Runtime Interfaces
 * 
 * This is the RUNTIME representation of View.interface.ts.
 * TypeScript interfaces are erased at runtime. View extends JsInterface
 * to exist at runtime for:
 * - TypeRegistry: runtime type introspection
 * - Implementation lookup: `View.implementations` → all view classes
 * - RelatedObjects: interface-based lookup
 * 
 * Pattern:
 * - View.interface.ts: Compile-time contract (kept for documentation)
 * - View.ts (this file): Abstract class extends JsInterface
 * - UcpView.ts (layer3): Framework-independent base
 * - LitUcpView.ts (layer5): Lit-specific adapter
 * 
 * @ior ior:esm:/ONCE/{version}/View
 * @pdca session/2026-01-08-UTC-1200.view-jsinterface-pattern.pdca.md
 */

import { JsInterface } from './JsInterface.js';
import type { Model } from './Model.interface.js';
import type { Component } from './Component.js';

/**
 * View - Runtime interface for all Web4 views
 * 
 * Extends JsInterface for runtime type introspection.
 * Framework adapters (Lit, React, Vue, Vanilla) implement this.
 * 
 * Layer 5 - All methods are SYNCHRONOUS (Web4 P7)
 */
export abstract class View<TModel extends Model> extends JsInterface {
  
  // ═══════════════════════════════════════════════════════════════
  // CLASS LEVEL (static, from JsInterface)
  // ═══════════════════════════════════════════════════════════════
  
  // Inherited from JsInterface:
  // static get type(): TypeDescriptor
  // static get implementations(): InterfaceConstructor[]
  // static implementationRegister(impl): void
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENT BACK-REFERENCE
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get owning component - back-reference to Component
   * Enables view to access component methods and model
   */
  abstract get component(): Component<TModel>;
  
  /**
   * Set owning component
   */
  abstract set component(c: Component<TModel>);
  
  // ═══════════════════════════════════════════════════════════════
  // MODEL ACCESS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Model getter - TypeScript accessor (P16)
   */
  abstract get model(): TModel;
  
  /**
   * Model setter - triggers view refresh
   */
  abstract set model(m: TModel);
  
  // ═══════════════════════════════════════════════════════════════
  // VIEW LIFECYCLE
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Refresh view when model changes - SYNCHRONOUS! (P7)
   * Called by UcpModel.viewsNotify()
   */
  abstract refresh(): void;
  
  /**
   * Add child view (P22: Collection<T>)
   */
  abstract add(childView: View<Model>): void;
  
  /**
   * Remove child view
   * Named childRemove to avoid conflict with DOM Element.remove()
   */
  abstract childRemove(childView: View<Model>): void;
  
  /**
   * Render the view
   * Lit: returns TemplateResult
   * Vanilla: manipulates DOM directly
   */
  abstract render(): unknown;
}

