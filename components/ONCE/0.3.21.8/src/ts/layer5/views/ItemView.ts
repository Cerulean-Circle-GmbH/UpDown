/**
 * ItemView.ts - Compact list/tree item view
 * 
 * Displays a peer as a compact list item with status and actions.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P16: TypeScript accessors
 * - P19: CSS in separate file (ItemView.css)
 * 
 * @ior ior:esm:/ONCE/{version}/ItemView
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 */

import { html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AbstractWebBean } from './AbstractWebBean.js';
import { Action } from '../../layer3/Action.interface.js';
import { ActionStyle } from '../../layer3/ActionStyle.enum.js';
import { Reference } from '../../layer3/Reference.interface.js';
import { Collection } from '../../layer3/Collection.interface.js';

/**
 * ItemView - Compact peer item for list/grid display
 * 
 * Shows:
 * - Status indicator (running/stopped)
 * - Peer UUID (truncated)
 * - Port
 * - Stop action button (for non-primary peers)
 * 
 * Web4 Principle 19: CSS in external file (css/ItemView.css)
 */
@customElement('once-item-view')
export class ItemView extends AbstractWebBean<any> {
  
  /** CSS path for adoptedStyleSheets */
  static cssPath = 'ItemView.css'; // CSSLoader caches by filename
  
  /** HTML template path */
  static templatePath = '/dist/ts/layer5/views/webBeans/ItemView.html';
  
  /** Touch/drag support enabled */
  @property({ type: Boolean }) touchEnabled = true;
  
  /** View name for CSS/template paths */
  get viewName(): string {
    return 'ItemView';
  }
  
  /**
   * Render the item view
   */
  render(): TemplateResult {
    if (!this.hasModel) {
      return html`<div class="loading">Loading...</div>`;
    }
    
    const model = this.model;
    const state = model.state?.state || 'UNKNOWN';
    const uuid = model.uuid || model.state?.uuid || '???';
    const shortUuid = uuid.substring(0, 8);
    const portCap = model.state?.capabilities?.find(
      function(c: any) { return c.capability === 'httpPort'; }
    );
    const port = portCap?.port || 'N/A';
    const isPrimary = model.isPrimaryServer || false;
    
    return html`
      <div class="status-dot ${state.toLowerCase()}"></div>
      <div class="item-info">
        <div class="item-title">Peer ${shortUuid}${isPrimary ? ' (Primary)' : ''}</div>
        <div class="item-subtitle">Port ${port} · ${state}</div>
      </div>
      <div class="action-zone">
        ${this.actionsRender(isPrimary)}
      </div>
    `;
  }
  
  /**
   * Render action buttons
   * @param isPrimary Whether this is the primary server
   */
  private actionsRender(isPrimary: boolean): TemplateResult {
    if (isPrimary) {
      return html``;  // No stop button for primary
    }
    
    const actions = this.actionsDiscover();
    
    // Iterate with for...of (Collection<T> extends Iterable<T>)
    const buttons: TemplateResult[] = [];
    for (const action of actions) {
      this.actionButtonCreate(buttons, action);
    }
    
    return html`${buttons}`;
  }
  
  /**
   * Create action button - called via method reference
   * @param buttons Array to push button into
   * @param action Action to create button for
   */
  private actionButtonCreate(buttons: TemplateResult[], action: Action): void {
    buttons.push(html`
      <button @click=${this.actionInvokeHandler.bind(this, action)}>
        ${action.icon} ${action.label}
      </button>
    `);
  }
  
  /**
   * Discover available actions
   * Returns actions with no required parameters
   */
  actionsDiscover(): Collection<Action> {
    return [{
      component: 'ONCE',
      action: 'PEER_STOP',
      method: 'peerStop',
      label: 'Stop',
      icon: '🛑',
      style: ActionStyle.DANGER,
      shortcut: null,
      confirmRequired: false,
      confirmMessage: null
    }];
  }
  
  /**
   * Handle action button click
   * @param action Action to invoke
   */
  private async actionInvokeHandler(action: Action): Promise<void> {
    const uuid = this.model?.uuid || this.model?.state?.uuid;
    if (!uuid) {
      console.error('No UUID available for action');
      return;
    }
    
    // Dispatch custom event for parent to handle
    this.dispatchEvent(new CustomEvent('action-invoke', {
      detail: { action, uuid },
      bubbles: true,
      composed: true
    }));
  }
}

