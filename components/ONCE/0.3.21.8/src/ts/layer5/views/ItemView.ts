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

import { html, TemplateResult, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AbstractWebBean } from './AbstractWebBean.js';
import { Action } from '../../layer3/Action.interface.js';
import { ActionStyle } from '../../layer3/ActionStyle.enum.js';
import { Reference } from '../../layer3/Reference.interface.js';

/**
 * ItemView - Compact peer item for list/grid display
 * 
 * Shows:
 * - Status indicator (running/stopped)
 * - Peer UUID (truncated)
 * - Port
 * - Stop action button (for non-primary peers)
 */
@customElement('once-item-view')
export class ItemView extends AbstractWebBean<any> {
  
  /** Touch/drag support enabled */
  @property({ type: Boolean }) touchEnabled = true;
  
  /** View name for CSS/template paths */
  get viewName(): string {
    return 'ItemView';
  }
  
  /**
   * Static styles - inline for now, will load from CSS file
   * TODO: Load from ItemView.css via AbstractWebBean
   */
  static styles = css`
    :host {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border: 1px solid var(--border-color, #0f0);
      background: var(--item-bg, rgba(0, 255, 0, 0.05));
      margin-bottom: 8px;
      cursor: grab;
      touch-action: pan-y;
      user-select: none;
    }
    
    :host(:active) {
      cursor: grabbing;
      background: var(--highlight-bg, rgba(0, 255, 0, 0.15));
    }
    
    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 12px;
    }
    
    .status-dot.running { background: var(--color-running, #0f0); }
    .status-dot.stopped { background: var(--color-stopped, #666); }
    .status-dot.starting { background: var(--color-starting, #ff0); }
    
    .item-info { flex: 1; }
    .item-title { font-weight: bold; color: var(--text-primary, #0f0); }
    .item-subtitle { font-size: 0.85em; color: var(--text-secondary, #888); }
    
    .action-zone { display: flex; gap: 8px; }
    
    button {
      background: var(--btn-danger-bg, #a00);
      color: var(--btn-danger-color, #fff);
      border: 1px solid var(--btn-danger-border, #f00);
      padding: 4px 12px;
      cursor: pointer;
      font-family: inherit;
    }
    
    button:hover {
      background: var(--btn-danger-hover, #f00);
    }
  `;
  
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
    
    // Use method reference binding for forEach
    const buttons: TemplateResult[] = [];
    actions.forEach(this.actionButtonCreate.bind(this, buttons));
    
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
  actionsDiscover(): Action[] {
    return [{
      method: 'peerStop',
      label: 'Stop',
      icon: '🛑',
      style: ActionStyle.DANGER,
      shortcut: null,
      confirmRequired: null,
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

