/**
 * DefaultItemView.ts - Generic item view implementation
 * 
 * Base Lit component implementing ItemView interface.
 * Specific components (OncePeerItemView) extend this.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P5: Reference<T> for nullable badge
 * - P16: TypeScript accessors for attribute mapping
 * - P19: CSS in separate file
 * - P22: Collection<T> for actions
 * - P24: Registered via RelatedObjects
 * 
 * @ior ior:esm:/ONCE/{version}/DefaultItemView
 * @pdca 2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md
 */

import { html, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { AbstractWebBean } from './AbstractWebBean.js';
import { ItemView as ItemViewInterface } from '../../layer3/ItemView.interface.js';
import { ItemViewModel } from '../../layer3/ItemViewModel.interface.js';
import { ActionMetadata } from '../../layer3/ActionMetadata.interface.js';
import { ActionStyle } from '../../layer3/ActionStyle.enum.js';
import { Reference } from '../../layer3/Reference.interface.js';
import { Collection } from '../../layer3/Collection.interface.js';

/**
 * DefaultItemView - Generic item view implementing ItemView interface
 * 
 * Shows:
 * - Icon
 * - Name (primary text)
 * - Description (secondary text)
 * - Badge (optional count/status)
 * - Action buttons
 * 
 * Extend this for specific item types (OncePeerItemView, etc.)
 */
export class DefaultItemView<TModel extends ItemViewModel = ItemViewModel> 
  extends AbstractWebBean<TModel> 
  implements ItemViewInterface<TModel> {
  
  /** CSS path for adoptedStyleSheets */
  static cssPath = 'DefaultItemView.css';
  
  /** Touch/drag support enabled */
  @property({ type: Boolean }) touchEnabled = true;
  
  // ═══════════════════════════════════════════════════════════════
  // ITEMVIEW INTERFACE: Enforced Attributes (model mapping)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Display name - mapped to model.name
   */
  get name(): string {
    return this.model?.name ?? '';
  }
  
  set name(value: string) {
    if (this.model) {
      this.model.name = value;
      this.requestUpdate();
    }
  }
  
  /**
   * Short description - mapped to model.description
   */
  get description(): string {
    return this.model?.description ?? '';
  }
  
  set description(value: string) {
    if (this.model) {
      this.model.description = value;
      this.requestUpdate();
    }
  }
  
  /**
   * Badge - mapped to model.badge
   */
  get badge(): Reference<string | number> {
    return this.model?.badge ?? null;
  }
  
  set badge(value: Reference<string | number>) {
    if (this.model) {
      this.model.badge = value;
      this.requestUpdate();
    }
  }
  
  /**
   * Icon identifier - mapped to model.icon
   */
  get icon(): string {
    return this.model?.icon ?? 'fa-circle';
  }
  
  set icon(value: string) {
    if (this.model) {
      this.model.icon = value;
      this.requestUpdate();
    }
  }
  
  /**
   * View name for CSS/template paths
   */
  get viewName(): string {
    return 'DefaultItemView';
  }
  
  // ═══════════════════════════════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Render the item view
   */
  render(): TemplateResult {
    if (!this.hasModel) {
      return html`<div class="loading">Loading...</div>`;
    }
    
    return html`
      <div class="item-icon">
        <i class="${this.icon}"></i>
      </div>
      <div class="item-content">
        <div class="item-name">${this.name}</div>
        <div class="item-description">${this.description}</div>
      </div>
      ${this.badgeRender()}
      <div class="action-zone">
        ${this.actionsRender()}
      </div>
    `;
  }
  
  /**
   * Render badge if present
   */
  protected badgeRender(): TemplateResult {
    if (this.badge === null) {
      return html``;
    }
    return html`<div class="item-badge">${this.badge}</div>`;
  }
  
  /**
   * Render action buttons
   * Override in subclasses to customize
   */
  protected actionsRender(): TemplateResult {
    const actions = this.actionsDiscover();
    
    const buttons: TemplateResult[] = [];
    for (const action of actions) {
      this.actionButtonCreate(buttons, action);
    }
    
    return html`${buttons}`;
  }
  
  /**
   * Create action button
   */
  protected actionButtonCreate(buttons: TemplateResult[], action: ActionMetadata): void {
    const styleClass = this.actionStyleToClass(action.style);
    buttons.push(html`
      <button 
        class="action-btn ${styleClass}"
        @click=${this.actionInvokeHandler.bind(this, action)}
        title="${action.shortcut || action.label}"
      >
        <i class="${action.icon}"></i>
        <span>${action.label}</span>
      </button>
    `);
  }
  
  /**
   * Convert ActionStyle to CSS class
   */
  protected actionStyleToClass(style: ActionStyle): string {
    switch (style) {
      case ActionStyle.PRIMARY: return 'btn-primary';
      case ActionStyle.SECONDARY: return 'btn-secondary';
      case ActionStyle.DANGER: return 'btn-danger';
      case ActionStyle.WARNING: return 'btn-warning';
      default: return 'btn-secondary';
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Discover available actions
   * Override in subclasses to provide specific actions
   */
  actionsDiscover(): Collection<ActionMetadata> {
    return [];  // No default actions
  }
  
  /**
   * Handle action button click
   */
  protected async actionInvokeHandler(action: ActionMetadata): Promise<void> {
    // Check for confirmation
    if (action.confirmRequired && action.confirmMessage) {
      const confirmed = window.confirm(action.confirmMessage);
      if (!confirmed) {
        return;
      }
    }
    
    // Dispatch custom event for parent to handle
    this.dispatchEvent(new CustomEvent('action-invoke', {
      detail: { action, model: this.model },
      bubbles: true,
      composed: true
    }));
  }
}











