/**
 * AbstractView - Base class for all Web4 Views
 * 
 * Framework-independent view base class that extends JsInterface.
 * Views read DIRECTLY from scenario.model (readonly).
 * Writing to model triggers rerender via ModelProxy.
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario - views work on scenario.model
 * ✅ Web4 Principle 19: One File One Type
 * ✅ JsInterface: Runtime-existing abstract class
 * 
 * Event Naming: Pascal case like browser events (onClick, onContextMenu)
 * Rendering: Framework handles DOM - no abstract render() here!
 * 
 * @pdca 2025-12-09-UTC-1800.ucpview-framework-independence.pdca.md
 */

import { JsInterface } from './JsInterface.js';
import type { Scenario } from './Scenario.interface.js';
import type { Model } from './Model.interface.js';
import type { Reference } from './Reference.interface.js';

/**
 * AbstractView - Base class for all Web4 views
 * 
 * Views read from scenario.model (readonly).
 * Writing to model triggers rerender via ModelProxy.
 * 
 * Framework adapters (Lit, Vanilla) handle actual DOM rendering.
 */
export abstract class AbstractView<TModel extends Model> extends JsInterface {
  
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════
  
  /** Scenario is the source of truth */
  protected scenarioField: Reference<Scenario<TModel>> = null;
  
  /** Child views */
  protected childViews: AbstractView<Model>[] = [];
  
  // ═══════════════════════════════════════════════════════════════
  // SCENARIO ACCESS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get scenario
   */
  get scenario(): Reference<Scenario<TModel>> {
    return this.scenarioField;
  }
  
  /**
   * Set scenario
   */
  set scenario(s: Reference<Scenario<TModel>>) {
    this.scenarioField = s;
    this.refresh();
  }
  
  /**
   * Get model (readonly access to scenario.model)
   */
  get model(): TModel {
    if (!this.scenarioField) {
      throw new Error('AbstractView: scenario not set');
    }
    return this.scenarioField.model;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Initialize view with scenario
   * @param scenario The scenario containing the model
   * @returns this for chaining
   */
  init(scenario: Scenario<TModel>): this {
    this.scenarioField = scenario;
    return this;
  }
  
  /**
   * Refresh view - called when model changes
   * Framework adapters override this to trigger re-render
   */
  abstract refresh(): void;
  
  // ═══════════════════════════════════════════════════════════════
  // CHILD VIEWS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Add child view
   */
  childAdd(child: AbstractView<Model>): void {
    this.childViews.push(child);
  }
  
  /**
   * Remove child view
   */
  childRemove(child: AbstractView<Model>): void {
    const index = this.childViews.indexOf(child);
    if (index >= 0) {
      this.childViews.splice(index, 1);
    }
  }
  
  /**
   * Get all child views
   */
  get children(): AbstractView<Model>[] {
    return [...this.childViews];
  }
  
  // ═══════════════════════════════════════════════════════════════
  // EVENT HANDLERS (Pascal case like browser)
  // Override in subclass as needed
  // ═══════════════════════════════════════════════════════════════
  
  // onClick(): void { }
  // onContextMenu(): void { }
  // onDragStart(): void { }
  // etc.
}










