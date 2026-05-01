/**
 * AbstractDefaultView - Base class for full-page detail views
 * 
 * Extends AbstractView for single-entity detail pages.
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 19: One File One Type
 * ✅ JsInterface: Runtime-existing abstract class
 * 
 * @pdca 2025-12-09-UTC-1800.ucpview-framework-independence.pdca.md
 */

import { AbstractView } from './AbstractView.js';
import type { Model } from './Model.interface.js';

/**
 * DefaultViewModel - Model for default/detail views
 */
export interface DefaultViewModel extends Model {
  /** Title of the detail view */
  title?: string;
  
  /** Subtitle or description */
  subtitle?: string;
  
  /** Actions available */
  actions?: string[];
}

/**
 * AbstractDefaultView - Base class for detail views
 */
export abstract class AbstractDefaultView<TModel extends DefaultViewModel = DefaultViewModel> extends AbstractView<TModel> {
  
  // ═══════════════════════════════════════════════════════════════
  // CONVENIENCE GETTERS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get view title
   */
  get title(): string {
    return this.model.title ?? 'Details';
  }
  
  /**
   * Get subtitle
   */
  get subtitle(): string {
    return this.model.subtitle ?? '';
  }
  
  /**
   * Get available actions
   */
  get actions(): string[] {
    return this.model.actions ?? [];
  }
}





