/**
 * LitItemView - Lit adapter for ItemView
 * 
 * Base class for Lit-based item views.
 * Reads directly from scenario.model (via property).
 * 
 * Naming: @customElement('lit-xxx-item-view')
 * 
 * ✅ Web4 Principle 19: CSS in separate file
 * ✅ Web4 Principle 27: Web Components ARE Radical OOP
 * ✅ Event naming: Pascal case (onClick, onContextMenu)
 * 
 * @pdca 2025-12-09-UTC-1800.ucpview-framework-independence.pdca.md
 */

import { LitElement, html, css, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import type { Scenario } from '../../layer3/Scenario.interface.js';
import type { ItemViewModel } from '../../layer3/ItemViewModel.interface.js';

/**
 * LitItemView - Base Lit adapter for item views
 * 
 * Subclasses:
 * - Override render() to provide item UI
 * - Use this.model for data access
 * - Define onClick(), onContextMenu() as needed
 */
export abstract class LitItemView<TModel extends ItemViewModel = ItemViewModel> extends LitElement {
  
  // ═══════════════════════════════════════════════════════════════
  // PROPERTIES
  // ═══════════════════════════════════════════════════════════════
  
  /** Scenario containing the model - source of truth */
  @property({ type: Object })
  scenario: Scenario<TModel> | null = null;
  
  /** Kernel reference (for actions) */
  @property({ type: Object })
  kernel: unknown = null;
  
  // ═══════════════════════════════════════════════════════════════
  // MODEL ACCESS (readonly from scenario)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get model from scenario
   */
  protected get model(): TModel {
    if (!this.scenario) {
      throw new Error('LitItemView: scenario not set');
    }
    return this.scenario.model;
  }
  
  /**
   * Get name from model
   */
  protected get name(): string {
    return this.model.name;
  }
  
  /**
   * Get description from model
   */
  protected get description(): string {
    return this.model.description ?? '';
  }
  
  /**
   * Get icon from model
   */
  protected get icon(): string {
    return this.model.icon ?? 'fa-cube';
  }
  
  /**
   * Get badge from model
   */
  protected get badge(): string | number | null {
    return this.model.badge ?? null;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // STYLES (default)
  // ═══════════════════════════════════════════════════════════════
  
  static styles: CSSResult = css`
    :host {
      display: block;
    }
  `;
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER (abstract - subclass provides)
  // ═══════════════════════════════════════════════════════════════
  
  abstract render(): TemplateResult;
  
  // ═══════════════════════════════════════════════════════════════
  // EVENT HANDLERS (Pascal case, override in subclass)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Click handler
   */
  onClick(): void {
    console.log(`[LitItemView] Clicked: ${this.name}`);
    this.dispatchEvent(new CustomEvent('item-click', { 
      detail: { model: this.model },
      bubbles: true,
      composed: true
    }));
  }
  
  /**
   * Context menu handler
   */
  onContextMenu(): void {
    console.log(`[LitItemView] Context menu: ${this.name}`);
    this.dispatchEvent(new CustomEvent('item-contextmenu', { 
      detail: { model: this.model },
      bubbles: true,
      composed: true
    }));
  }
}











