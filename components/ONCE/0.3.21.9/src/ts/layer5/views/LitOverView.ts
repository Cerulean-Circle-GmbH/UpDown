/**
 * LitOverView - Lit adapter for OverView (grid/list of items)
 * 
 * Base class for Lit-based overview views.
 * Reads directly from scenario.model (via property).
 * 
 * Naming: @customElement('lit-xxx-over-view')
 * 
 * ✅ Web4 Principle 19: CSS in separate file
 * ✅ Web4 Principle 27: Web Components ARE Radical OOP
 * 
 * @pdca 2025-12-09-UTC-1800.ucpview-framework-independence.pdca.md
 */

import { LitElement, html, css, TemplateResult, CSSResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { Scenario } from '../../layer3/Scenario.interface.js';
import type { OverViewModel } from '../../layer3/AbstractOverView.js';
import type { ItemViewModel } from '../../layer3/ItemViewModel.interface.js';

/**
 * LitOverView - Base Lit adapter for overview/grid views
 * 
 * Subclasses:
 * - Override render() to provide grid/list UI
 * - Use this.model for data access
 * - Use this.items for item list
 */
export abstract class LitOverView<TModel extends OverViewModel = OverViewModel> extends LitElement {
  
  // ═══════════════════════════════════════════════════════════════
  // PROPERTIES
  // ═══════════════════════════════════════════════════════════════
  
  /** Scenario containing the model - source of truth */
  @property({ type: Object })
  scenario: Scenario<TModel> | null = null;
  
  /** Kernel reference (for actions) */
  @property({ type: Object })
  kernel: unknown = null;
  
  /** Local items list (for dynamic updates) */
  @state()
  protected itemsLocal: ItemViewModel[] = [];
  
  // ═══════════════════════════════════════════════════════════════
  // MODEL ACCESS (readonly from scenario)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get model from scenario
   */
  protected get model(): TModel {
    if (!this.scenario) {
      throw new Error('LitOverView: scenario not set');
    }
    return this.scenario.model;
  }
  
  /**
   * Get view title from model
   */
  protected get viewTitle(): string {
    return this.model.title ?? 'Overview';
  }
  
  /**
   * Get items from model or local state
   */
  protected get items(): ItemViewModel[] {
    return this.itemsLocal.length > 0 ? this.itemsLocal : (this.model.items ?? []);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // STYLES (default)
  // ═══════════════════════════════════════════════════════════════
  
  static styles: CSSResult = css`
    :host {
      display: block;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1rem;
    }
  `;
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER (abstract - subclass provides)
  // ═══════════════════════════════════════════════════════════════
  
  abstract render(): TemplateResult;
  
  // ═══════════════════════════════════════════════════════════════
  // ITEM MANAGEMENT
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Add item to local list (triggers render)
   */
  itemAdd(item: ItemViewModel): void {
    this.itemsLocal = [...this.itemsLocal, item];
  }
  
  /**
   * Remove item from local list (triggers render)
   */
  itemRemove(item: ItemViewModel): void {
    this.itemsLocal = this.itemsLocal.filter(function(i) {
      return i.uuid !== item.uuid;
    });
  }
  
  /**
   * Update item in local list (triggers render)
   */
  itemUpdate(item: ItemViewModel): void {
    this.itemsLocal = this.itemsLocal.map(function(i) {
      return i.uuid === item.uuid ? item : i;
    });
  }
  
  /**
   * Clear all items
   */
  itemsClear(): void {
    this.itemsLocal = [];
  }
}

