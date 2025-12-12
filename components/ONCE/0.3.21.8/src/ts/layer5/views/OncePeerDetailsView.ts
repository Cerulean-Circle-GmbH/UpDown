/**
 * OncePeerDetailsView.ts - Single Peer Details
 * 
 * Shows detailed information for one peer, identified by UUID in route params.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P16: TypeScript accessors
 * - P19: CSS in separate file
 * - P27: Web Components ARE Radical OOP
 * 
 * @component ONCE
 * @layer 5
 * @pdca 2025-12-12-UTC-1055.spa-route-registration-extension.pdca.md
 */

import { html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UcpView } from './UcpView.js';
import type { Reference } from '../../layer3/Reference.interface.js';

interface PeerModel {
    uuid: string;
    name: string;
    state: string;
    version: string;
    host: string;
    capabilities: Array<{ capability: string; port?: number }>;
    isPrimaryServer: boolean;
}

@customElement('once-peer-details-view')
export class OncePeerDetailsView extends UcpView<PeerModel> {
    
    static override cssPath = 'OncePeerDetailsView.css';
    
    @property({ attribute: false }) router: Reference<HTMLElement> = null;
    @property({ type: String }) peerUuid: string = '';
    @state() private loading: boolean = false;
    @state() private error: string = '';
    
    // ═══════════════════════════════════════════════════════════════
    // LIFECYCLE
    // ═══════════════════════════════════════════════════════════════
    
    override connectedCallback(): void {
        super.connectedCallback();
        // Extract UUID from URL if not set via property
        if (!this.peerUuid) {
            const pathParts = window.location.pathname.split('/');
            const uuidIndex = pathParts.indexOf('peer') + 1;
            if (uuidIndex > 0 && uuidIndex < pathParts.length) {
                this.peerUuid = pathParts[uuidIndex];
            }
        }
        if (this.peerUuid) {
            this.peerFetch();
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // DATA FETCHING
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Fetch peer details from /health endpoint
     * (In future, this could be a dedicated /peer/:uuid endpoint)
     */
    peerFetch(): void {
        this.loading = true;
        this.error = '';
        
        // For now, use /health as it contains peer info
        // Future: use IOR like /ONCE/{version}/{uuid}/toScenario
        fetch('/health')
            .then(this.peerResponseHandle.bind(this))
            .catch(this.peerErrorHandle.bind(this));
    }
    
    private peerResponseHandle(response: Response): void {
        if (!response.ok) {
            this.error = `HTTP ${response.status}`;
            this.loading = false;
            return;
        }
        response.json()
            .then(this.peerDataHandle.bind(this))
            .catch(this.peerErrorHandle.bind(this));
    }
    
    private peerDataHandle(data: any): void {
        const model = data.model || data;
        this.model = {
            uuid: this.peerUuid || model.uuid || 'unknown',
            name: model.name || 'ONCE Server',
            state: model.lifecycleState || model.state || 'unknown',
            version: model.version || 'unknown',
            host: model.host || 'localhost',
            capabilities: model.capabilities || [],
            isPrimaryServer: model.isPrimaryServer ?? false
        };
        this.loading = false;
        this.requestUpdate();
    }
    
    private peerErrorHandle(error: Error): void {
        console.error('[OncePeerDetailsView] Fetch error:', error);
        this.error = error.message;
        this.loading = false;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // COMPUTED ACCESSORS (Web4 P16)
    // ═══════════════════════════════════════════════════════════════
    
    get peerName(): string {
        return this.model?.name ?? 'Unknown Peer';
    }
    
    get peerState(): string {
        return this.model?.state ?? 'unknown';
    }
    
    get peerPort(): number {
        const httpCap = this.model?.capabilities?.find(
            (c: any) => c.capability === 'httpPort'
        );
        return httpCap?.port ?? 0;
    }
    
    get shortUuid(): string {
        const uuid = this.peerUuid || this.model?.uuid || '';
        return uuid.length > 8 ? uuid.substring(0, 8) + '...' : uuid;
    }
    
    get serverType(): string {
        return this.model?.isPrimaryServer ? '🟢 Primary Server' : '🔵 Client Server';
    }
    
    /**
     * Render capability item
     * Web4 P4: Method for map callback
     */
    private capabilityRender(cap: { capability: string; port?: number }): TemplateResult {
        return html`
            <div class="capability">
                <span class="cap-name">${cap.capability}</span>
                ${cap.port ? html`<span class="cap-port">:${cap.port}</span>` : ''}
            </div>
        `;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════
    
    override render(): TemplateResult {
        if (this.loading) {
            return html`<div class="loading">Loading peer details...</div>`;
        }
        
        if (this.error) {
            return html`
                <div class="error">
                    <h2>❌ Error</h2>
                    <p>${this.error}</p>
                    <a href="/" class="back-link">← Back to Overview</a>
                </div>
            `;
        }
        
        return html`
            <div class="peer-details-container">
                <header>
                    <h2>👤 Peer Details</h2>
                    <code class="peer-uuid">${this.shortUuid}</code>
                </header>
                
                <section class="peer-info">
                    <div class="info-row">
                        <span class="label">Type:</span>
                        <span class="value">${this.serverType}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Name:</span>
                        <span class="value">${this.peerName}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">State:</span>
                        <span class="value state-${this.peerState.toLowerCase()}">${this.peerState}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Host:</span>
                        <span class="value">${this.model?.host ?? 'localhost'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Port:</span>
                        <span class="value">${this.peerPort}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Version:</span>
                        <span class="value">${this.model?.version ?? 'unknown'}</span>
                    </div>
                </section>
                
                <section class="capabilities">
                    <h3>Capabilities</h3>
                    ${this.model?.capabilities?.length 
                        ? this.model.capabilities.map(this.capabilityRender.bind(this))
                        : html`<p class="no-caps">No capabilities</p>`
                    }
                </section>
                
                <nav class="peer-actions">
                    <a href="/" class="back-link">← Back to Overview</a>
                </nav>
            </div>
        `;
    }
}



