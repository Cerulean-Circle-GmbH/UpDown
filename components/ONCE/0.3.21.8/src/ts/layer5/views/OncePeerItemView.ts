/**
 * OncePeerItemView.ts - ONCE peer item view
 * 
 * Specific implementation of DefaultItemView for displaying ONCE peers.
 * Shows peer status, port, and lifecycle actions.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P16: TypeScript accessors
 * - P19: CSS in separate file (OncePeerItemView.css)
 * - P22: Collection<T> for actions
 * - P24: Registered via RelatedObjects as ItemView
 * 
 * @ior ior:esm:/ONCE/{version}/OncePeerItemView
 * @pdca 2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md
 */

import { html, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DefaultItemView } from './DefaultItemView.js';
import { ActionMetadata } from '../../layer3/ActionMetadata.interface.js';
import { ActionStyle } from '../../layer3/ActionStyle.enum.js';
import { Reference } from '../../layer3/Reference.interface.js';
import { Collection } from '../../layer3/Collection.interface.js';

/**
 * OncePeerModel - Model for ONCE peer items
 * Extends ItemViewModel with peer-specific fields
 */
export interface OncePeerModel {
  // ItemViewModel fields
  name?: string;
  description?: string;
  badge?: Reference<string | number>;
  icon?: string;
  
  // Peer-specific fields
  uuid?: string;
  state?: {
    uuid?: string;
    state?: string;
    capabilities?: Array<{
      capability: string;
      port?: number;
    }>;
  };
  isPrimaryServer?: boolean;
}

/**
 * OncePeerItemView - Item view for ONCE peer servers
 * 
 * Shows:
 * - Status indicator (STARTING, RUNNING, STOPPING, STOPPED)
 * - Peer UUID (truncated)
 * - Port number
 * - Primary badge if applicable
 * - Stop action (for non-primary peers)
 * 
 * Web Component: <once-peer-item-view>
 */
@customElement('once-peer-item-view')
export class OncePeerItemView extends DefaultItemView<OncePeerModel> {
  
  /** CSS path for adoptedStyleSheets */
  static cssPath = 'OncePeerItemView.css';
  
  /**
   * View name for CSS/template paths
   */
  get viewName(): string {
    return 'OncePeerItemView';
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COMPUTED PROPERTIES (from peer model)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Display name - derived from UUID
   */
  get name(): string {
    const uuid = this.peerUuid;
    return `Peer ${uuid.substring(0, 8)}`;
  }
  
  /**
   * Description - derived from port and state
   */
  get description(): string {
    return `Port ${this.peerPort} · ${this.peerState}`;
  }
  
  /**
   * Badge - shows "Primary" for primary server
   */
  get badge(): Reference<string | number> {
    return this.isPrimary ? 'Primary' : null;
  }
  
  /**
   * Icon - server icon
   */
  get icon(): string {
    return 'fa-server';
  }
  
  // ═══════════════════════════════════════════════════════════════
  // PEER-SPECIFIC GETTERS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Get peer UUID
   */
  protected get peerUuid(): string {
    return this.model?.uuid || this.model?.state?.uuid || '???';
  }
  
  /**
   * Get peer state
   */
  protected get peerState(): string {
    return this.model?.state?.state || 'UNKNOWN';
  }
  
  /**
   * Get peer port
   */
  protected get peerPort(): string {
    const portCap = this.model?.state?.capabilities?.find(
      function(c) { return c.capability === 'httpPort'; }
    );
    return portCap?.port?.toString() || 'N/A';
  }
  
  /**
   * Check if this is the primary server
   */
  protected get isPrimary(): boolean {
    return this.model?.isPrimaryServer || false;
  }
  
  // ═══════════════════════════════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Render the peer item view
   */
  render(): TemplateResult {
    if (!this.hasModel) {
      return html`<div class="loading">Loading...</div>`;
    }
    
    const stateClass = this.peerState.toLowerCase();
    
    return html`
      <div class="status-dot ${stateClass}"></div>
      <div class="peer-icon">
        <i class="${this.icon}"></i>
      </div>
      <div class="peer-content">
        <div class="peer-name">${this.name}</div>
        <div class="peer-description">${this.description}</div>
      </div>
      ${this.badgeRender()}
      <div class="action-zone">
        ${this.actionsRender()}
      </div>
    `;
  }
  
  /**
   * Render badge for primary server
   */
  protected badgeRender(): TemplateResult {
    if (!this.isPrimary) {
      return html``;
    }
    return html`<div class="peer-badge primary">Primary</div>`;
  }
  
  /**
   * Render actions - different for primary vs client
   */
  protected actionsRender(): TemplateResult {
    // Both primary and client get their own actions
    return super.actionsRender();
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Discover peer actions
   * Returns different actions for primary vs client servers
   */
  actionsDiscover(): Collection<ActionMetadata> {
    if (this.isPrimary) {
      // Primary server actions
      return [
        {
          component: 'ONCE',
          action: 'PEER_DISCOVER',
          method: 'peersDiscover',
          label: 'Discover',
          icon: 'fa-search',
          style: ActionStyle.SECONDARY,
          shortcut: null,
          confirmRequired: false,
          confirmMessage: null
        },
        {
          component: 'ONCE',
          action: 'PEER_STOP_ALL',
          method: 'peerStopAll',
          label: 'End All',
          icon: 'fa-power-off',
          style: ActionStyle.DANGER,
          shortcut: null,
          confirmRequired: true,
          confirmMessage: 'Shutdown ALL servers?'
        }
      ];
    }
    
    // Client server actions
    return [
      {
        component: 'ONCE',
        action: 'HEALTH_CHECK',
        method: 'healthCheck',
        label: 'Health',
        icon: 'fa-heartbeat',
        style: ActionStyle.SECONDARY,
        shortcut: null,
        confirmRequired: false,
        confirmMessage: null
      },
      {
        component: 'ONCE',
        action: 'PEER_STOP',
        method: 'peerStop',
        label: 'Stop',
        icon: 'fa-stop',
        style: ActionStyle.DANGER,
        shortcut: null,
        confirmRequired: false,
        confirmMessage: null
      }
    ];
  }
  
  /**
   * Handle action - includes peer UUID
   */
  protected async actionInvokeHandler(action: ActionMetadata): Promise<void> {
    // Check for confirmation
    if (action.confirmRequired && action.confirmMessage) {
      const confirmed = window.confirm(action.confirmMessage);
      if (!confirmed) {
        return;
      }
    }
    
    // Dispatch with peer UUID
    this.dispatchEvent(new CustomEvent('action-invoke', {
      detail: { 
        action, 
        model: this.model,
        uuid: this.peerUuid
      },
      bubbles: true,
      composed: true
    }));
  }
}

