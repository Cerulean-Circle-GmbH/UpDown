/**
 * UcpView.ts - Framework-independent View base class
 * 
 * Abstract base for views that don't need DOM rendering.
 * Use cases: server-side rendering, testing, non-DOM environments.
 * 
 * For Lit/browser views, use LitUcpView instead.
 * 
 * ✅ Web4 Principle 35: JsInterface for Runtime Interfaces
 * ✅ Web4 Principle 7: Layer 5 is SYNCHRONOUS
 * ✅ Web4 Principle 16: TypeScript accessors
 * 
 * @ior ior:esm:/ONCE/{version}/UcpView
 * @pdca session/2026-01-08-UTC-1200.view-jsinterface-pattern.pdca.md
 */

import { View } from './View.js';
import type { Component } from './Component.js';
import type { Model } from './Model.interface.js';
import type { Reference } from './Reference.interface.js';

/**
 * UcpView - Framework-independent View implementation
 * 
 * Provides shared Web4 view logic without framework dependencies.
 */
export abstract class UcpView<TModel extends Model> implements View<TModel> {
  
  // NOTE: Abstract classes don't register as implementations.
  // Only concrete subclasses should register via:
  //   static { View.implementationRegister(ConcreteViewClass); }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPONENT BACK-REFERENCE
  // ═══════════════════════════════════════════════════════════════
  
  protected componentRef: Reference<Component<TModel>> = null;
  
  get component(): Component<TModel> {
    if (!this.componentRef) {
      throw new Error('UcpView: component not set');
    }
    return this.componentRef;
  }
  
  set component(c: Component<TModel>) {
    this.componentRef = c;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // MODEL ACCESS
  // ═══════════════════════════════════════════════════════════════
  
  protected modelRef: Reference<TModel> = null;
  
  get model(): TModel {
    if (!this.modelRef) {
      throw new Error('UcpView: model not set');
    }
    return this.modelRef;
  }
  
  set model(m: TModel) {
    this.modelRef = m;
    this.refresh();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // CHILD VIEWS
  // ═══════════════════════════════════════════════════════════════
  
  protected childViews: View<Model>[] = [];
  
  add(childView: View<Model>): void {
    this.childViews.push(childView);
  }
  
  childRemove(childView: View<Model>): void {
    const index = this.childViews.indexOf(childView);
    if (index >= 0) {
      this.childViews.splice(index, 1);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ABSTRACT (subclass provides)
  // ═══════════════════════════════════════════════════════════════
  
  abstract refresh(): void;
  abstract render(): unknown;
}

