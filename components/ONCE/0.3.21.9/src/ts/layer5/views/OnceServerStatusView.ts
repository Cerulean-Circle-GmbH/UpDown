/**
 * OnceServerStatusView.ts - Server Status Dashboard
 * 
 * Shows detailed server metrics: memory, uptime, connections, routes.
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

interface ServerMetrics {
    uptime: number;
    memoryUsage: number;
    activeConnections: number;
    registeredRoutes: number;
    scenarioCount: number;
    version: string;
    isPrimary: boolean;
}

@customElement('once-server-status-view')
export class OnceServerStatusView extends UcpView<ServerMetrics> {
    
    static override cssPath = 'OnceServerStatusView.css';
    
    @property({ attribute: false }) router: Reference<HTMLElement> = null;
    @state() private refreshing: boolean = false;
    
    // ═══════════════════════════════════════════════════════════════
    // LIFECYCLE
    // ═══════════════════════════════════════════════════════════════
    
    override connectedCallback(): void {
        super.connectedCallback();
        this.statusFetch();
    }
    
    // ═══════════════════════════════════════════════════════════════
    // DATA FETCHING (Web4 P7: async in Layer 4 wrapper, but UcpView allows)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Fetch server status from /health endpoint
     */
    statusFetch(): void {
        this.refreshing = true;
        
        fetch('/health')
            .then(this.healthResponseHandle.bind(this))
            .catch(this.healthErrorHandle.bind(this));
    }
    
    private healthResponseHandle(response: Response): void {
        response.json()
            .then(this.healthDataHandle.bind(this))
            .catch(this.healthErrorHandle.bind(this));
    }
    
    private healthDataHandle(data: any): void {
        const model = data.model || data;
        this.model = {
            uptime: model.uptime || 0,
            memoryUsage: model.memoryUsage || process?.memoryUsage?.()?.heapUsed || 0,
            activeConnections: model.activeConnections || 0,
            registeredRoutes: model.registeredRoutes || 0,
            scenarioCount: model.scenarioCount || 0,
            version: model.version || 'unknown',
            isPrimary: model.isPrimary ?? false
        };
        this.refreshing = false;
        this.requestUpdate();
    }
    
    private healthErrorHandle(error: Error): void {
        console.error('[OnceServerStatusView] Health fetch error:', error);
        this.refreshing = false;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // COMPUTED ACCESSORS (Web4 P16)
    // ═══════════════════════════════════════════════════════════════
    
    get uptimeFormatted(): string {
        const seconds = this.model?.uptime ?? 0;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hours}h ${minutes}m ${secs}s`;
    }
    
    get memoryFormatted(): string {
        const bytes = this.model?.memoryUsage ?? 0;
        const mb = bytes / 1024 / 1024;
        return `${mb.toFixed(1)} MB`;
    }
    
    get serverType(): string {
        return this.model?.isPrimary ? '🟢 Primary' : '🔵 Client';
    }
    
    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════
    
    override render(): TemplateResult {
        return html`
            <div class="status-container">
                <header class="status-header">
                    <h2>🔧 Server Status</h2>
                    <button 
                        class="refresh-btn" 
                        @click=${this.statusFetch.bind(this)}
                        ?disabled=${this.refreshing}
                    >
                        ${this.refreshing ? '⟳' : '↻'} Refresh
                    </button>
                </header>
                
                <div class="server-info">
                    <span class="server-type">${this.serverType}</span>
                    <span class="server-version">v${this.model?.version ?? 'unknown'}</span>
                </div>
                
                <div class="metrics-grid">
                    <div class="metric">
                        <span class="metric-label">⏱️ Uptime</span>
                        <span class="metric-value">${this.uptimeFormatted}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">💾 Memory</span>
                        <span class="metric-value">${this.memoryFormatted}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">🔗 Connections</span>
                        <span class="metric-value">${this.model?.activeConnections ?? 0}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">🛤️ Routes</span>
                        <span class="metric-value">${this.model?.registeredRoutes ?? 0}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">📋 Scenarios</span>
                        <span class="metric-value">${this.model?.scenarioCount ?? 0}</span>
                    </div>
                </div>
                
                <nav class="nav-back">
                    <a href="/" class="back-link">← Back to Overview</a>
                </nav>
            </div>
        `;
    }
}
