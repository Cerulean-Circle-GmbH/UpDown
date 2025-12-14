/**
 * LitDefaultView - Lit adapter for DefaultView (full-page detail)
 * 
 * Base class for Lit-based detail views.
 * Reads directly from scenario.model (via property).
 * 
 * Naming: @customElement('lit-xxx-default-view')
 * 
 * ✅ Web4 Principle 19: CSS in separate file
 * ✅ Web4 Principle 27: Web Components ARE Radical OOP
 * 
 * @pdca 2025-12-09-UTC-1800.ucpview-framework-independence.pdca.md
 */

import { LitElement, html, css, TemplateResult, CSSResult } from 'lit';
import { property } from 'lit/decorators.js';
import type { Scenario } from '../../layer3/Scenario.interface.js';
import type { DefaultViewModel } from '../../layer3/AbstractDefaultView.js';

/**
 * LitDefaultView - Base Lit adapter for detail views
 * 
 * Subclasses:
 * - Override render() to provide detail UI
 * - Use this.model for data access
 */
export abstract class LitDefaultView<TModel extends DefaultViewModel = DefaultViewModel> extends LitElement {
  
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
      throw new Error('LitDefaultView: scenario not set');
    }
    return this.scenario.model;
  }
  
  /**
   * Get view title from model
   */
  protected get viewTitle(): string {
    return this.model.title ?? 'Details';
  }
  
  /**
   * Get subtitle from model
   */
  protected get subtitle(): string {
    return this.model.subtitle ?? '';
  }
  
  /**
   * Get available actions
   */
  protected get actions(): string[] {
    return this.model.actions ?? [];
  }
  
  // ═══════════════════════════════════════════════════════════════
  // STYLES (default)
  // ═══════════════════════════════════════════════════════════════
  
  static styles: CSSResult = css`
    :host {
      display: block;
    }
    
    .page {
      padding: 2rem;
    }
    
    .header {
      margin-bottom: 2rem;
    }
    
    h1 {
      margin: 0 0 0.5rem;
    }
    
    .subtitle {
      color: var(--text-secondary, #666);
      font-size: 1.1rem;
    }
  `;
  
  // ═══════════════════════════════════════════════════════════════
  // RENDER (abstract - subclass provides)
  // ═══════════════════════════════════════════════════════════════
  
  abstract render(): TemplateResult;
}

