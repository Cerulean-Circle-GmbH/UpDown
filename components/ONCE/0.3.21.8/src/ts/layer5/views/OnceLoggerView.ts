/**
 * OnceLoggerView.ts - P2P Communication Logger
 * 
 * Displays WebSocket message history for debugging P2P communication.
 * Shows: broadcasts, relays, direct messages, scenario syncs.
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
import { customElement, state } from 'lit/decorators.js';
import { UcpView } from './UcpView.js';

interface LogEntry {
    timestamp: Date;
    type: 'broadcast' | 'relay' | 'direct' | 'scenario' | 'info';
    direction: 'in' | 'out' | 'none';
    from?: string;
    to?: string;
    message: string;
}

@customElement('once-logger-view')
export class OnceLoggerView extends UcpView<any> {
    
    static override cssPath = 'OnceLoggerView.css';
    
    @state() private logs: LogEntry[] = [];
    
    // ═══════════════════════════════════════════════════════════════
    // LIFECYCLE
    // ═══════════════════════════════════════════════════════════════
    
    override connectedCallback(): void {
        super.connectedCallback();
        // Add initial welcome log
        this.logEntryAdd({
            timestamp: new Date(),
            type: 'info',
            direction: 'none',
            message: 'Logger connected. WebSocket messages will appear here.'
        });
    }
    
    // ═══════════════════════════════════════════════════════════════
    // LOG MANAGEMENT (Web4 P4: Methods, not arrow functions)
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Add log entry
     * Web4 P4: Method, not arrow function
     */
    logEntryAdd(entry: LogEntry): void {
        this.logs = [...this.logs, entry];
    }
    
    /**
     * Clear all logs
     */
    logsClear(): void {
        this.logs = [];
    }
    
    /**
     * Get direction icon
     */
    private directionIconGet(direction: LogEntry['direction']): string {
        switch (direction) {
            case 'in': return '📥';
            case 'out': return '📤';
            default: return 'ℹ️';
        }
    }
    
    /**
     * Render single log entry
     * Web4 P4: Method for map callback
     */
    private logEntryRender(entry: LogEntry, index: number): TemplateResult {
        const directionIcon = this.directionIconGet(entry.direction);
        const typeClass = `log-${entry.type}`;
        const timeStr = entry.timestamp.toLocaleTimeString();
        
        return html`
            <div class="log-entry ${typeClass}">
                <span class="log-time">${timeStr}</span>
                <span class="log-direction">${directionIcon}</span>
                <span class="log-type">${entry.type}</span>
                <span class="log-message">${entry.message}</span>
            </div>
        `;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════
    
    override render(): TemplateResult {
        return html`
            <div class="logger-container">
                <header class="logger-header">
                    <h2>📡 P2P Communication Log</h2>
                    <button class="clear-btn" @click=${this.logsClear.bind(this)}>Clear</button>
                </header>
                
                <div class="log-list">
                    ${this.logs.length === 0 
                        ? html`<p class="no-logs">No messages yet. WebSocket activity will appear here.</p>`
                        : this.logs.map(this.logEntryRender.bind(this))
                    }
                </div>
            </div>
        `;
    }
}





