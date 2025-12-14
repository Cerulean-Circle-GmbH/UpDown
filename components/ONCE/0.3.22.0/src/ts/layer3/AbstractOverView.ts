/**
 * AbstractOverView - Base class for overview/grid views
 * 
 * Extends AbstractView for views that display collections of items.
 * Manages a collection of AbstractItemView children.
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 19: One File One Type
 * ✅ Web4 Principle 22: Collection<T>
 * ✅ JsInterface: Runtime-existing abstract class
 * 
 * @pdca 2025-12-09-UTC-1800.ucpview-framework-independence.pdca.md
 */

import { AbstractView } from './AbstractView.js';
import { AbstractItemView } from './AbstractItemView.js';
import type { Model } from './Model.interface.js';
import type { ItemViewModel } from './ItemViewModel.interface.js';

/**
 * OverViewModel - Model for overview views
 */
export interface OverViewModel extends Model {
  /** Title of the overview */
  title?: string;
  
  /** Items to display */
  items?: ItemViewModel[];
}

/**
 * AbstractOverView - Base class for overview/grid views
 */
export abstract class AbstractOverView<TModel extends OverViewModel = OverViewModel> extends AbstractView<TModel> {
  
  // ═══════════════════════════════════════════════════════════════
  // ITEM VIEWS
  // ═══════════════════════════════════════════════════════════════
  
  /** Item views (typed accessor to childViews) */
  get itemViews(): AbstractItemView<ItemViewModel>[] {
    return this.childViews as unknown as AbstractItemView<ItemViewModel>[];
  }
  
  /**
   * Add item view
   */
  itemViewAdd(itemView: AbstractItemView<ItemViewModel>): void {
    this.childViews.push(itemView as unknown as AbstractView<Model>);
  }
  
  /**
   * Remove item view
   */
  itemViewRemove(itemView: AbstractItemView<ItemViewModel>): void {
    const index = this.childViews.indexOf(itemView as unknown as AbstractView<Model>);
    if (index >= 0) {
      this.childViews.splice(index, 1);
    }
  }
  
  /**
   * Clear all item views
   */
  itemViewsClear(): void {
    this.childViews = [];
  }
  
  // ═══════════════════════════════════════════════════════════════
  // CONVENIENCE GETTERS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get overview title
   */
  get title(): string {
    return this.model.title ?? 'Overview';
  }
  
  /**
   * Get items from model
   */
  get items(): ItemViewModel[] {
    return this.model.items ?? [];
  }
}

