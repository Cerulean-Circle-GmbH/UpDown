/**
 * AbstractItemView - Base class for compact item views
 * 
 * Extends AbstractView with enforced attributes for list/grid items.
 * ItemViewModel is a GETTER INTERFACE - delegates to scenario.model.
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 5: Reference<T> for nullable
 * ✅ Web4 Principle 16: TypeScript accessors
 * ✅ Web4 Principle 19: One File One Type
 * ✅ JsInterface: Runtime-existing abstract class
 * 
 * @pdca 2025-12-09-UTC-1800.ucpview-framework-independence.pdca.md
 */

import { AbstractView } from './AbstractView.js';
import type { ItemViewModel } from './ItemViewModel.interface.js';
import type { Reference } from './Reference.interface.js';

/**
 * AbstractItemView - Base class for item views
 * 
 * Provides enforced attributes (name, description, icon, badge)
 * that delegate to scenario.model.
 */
export abstract class AbstractItemView<TModel extends ItemViewModel> extends AbstractView<TModel> {
  
  // ═══════════════════════════════════════════════════════════════
  // ENFORCED ATTRIBUTES (delegate to scenario.model)
  // ItemViewModel is a GETTER INTERFACE - not storage!
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Display name (inherited from Model, required)
   */
  get name(): string {
    return this.model.name;
  }
  
  set name(value: string) {
    this.model.name = value;  // Triggers ModelProxy → rerender
  }
  
  /**
   * Short description
   */
  get description(): string {
    return this.model.description ?? '';
  }
  
  set description(value: string) {
    this.model.description = value;
  }
  
  /**
   * Icon identifier (FontAwesome)
   */
  get icon(): string {
    return this.model.icon ?? 'fa-cube';
  }
  
  set icon(value: string) {
    this.model.icon = value;
  }
  
  /**
   * Badge - count or status indicator
   */
  get badge(): Reference<string | number> {
    return this.model.badge ?? null;
  }
  
  set badge(value: Reference<string | number>) {
    this.model.badge = value;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // EVENT HANDLERS (Pascal case)
  // Override in subclass
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Click handler - override in subclass
   */
  onClick(): void {
    console.log(`[AbstractItemView] Clicked: ${this.name}`);
  }
  
  /**
   * Context menu handler - override in subclass
   */
  onContextMenu(): void {
    console.log(`[AbstractItemView] Context menu: ${this.name}`);
  }
}

