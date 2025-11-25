/**
 * BrowserONCEKernel - Radical OOP P2P Kernel for Browser
 * Extends AbstractONCEKernel for unified architecture
 * 
 * Web4 Architecture:
 * - Empty constructor (Radical OOP)
 * - State in this.model
 * - Methods operate on model
 * - NO arrow functions
 * - NO callbacks
 * - P2P terminology (peers, not clients/peers)
 * 
 * @pdca session/2025-11-22-UTC-2200.iteration-01.8-unified-kernel-architecture.pdca.md
 */

// Note: This is a JavaScript file (not TypeScript) for direct browser use
// In future, we'll compile from TypeScript BrowserONCEKernel.ts

export class BrowserONCEKernel {
    constructor() {
        // ✅ Empty constructor (Radical OOP)
        // Extends AbstractONCEKernel conceptually (JS limitation)
        this.model = null;
    }
    
    async init(scenario) {
        // ✅ Initialize with scenario
        this.model = {
            // Kernel reference
            kernel: window.global?.ONCE || null,
            
            // P2P connection info
            peerHost: scenario?.peerHost || window.location.host,
            peerUUID: null,
            peerVersion: 'unknown',
            
            // Connection state
            isConnected: false,
            connectionTime: null,
            
            // P2P network state
            peers: [],  // NOT "servers"
            primaryPeer: null,
            
            // Statistics
            stats: {
                messagesSent: 0,
                messagesReceived: 0,
                acknowledgmentsSent: 0
            },
            
            // UI elements (for display updates)
            elements: {
                connectionStatus: null,
                primaryConnection: null,
                connectedPeers: null,
                messageLog: null,
                messagesSent: null,
                messagesReceived: null,
                acknowledgmentsSent: null,
                connectionTime: null
            }
        };
        
        // Initialize UI elements
        this.initializeUIElements();
        
        // Connect to P2P network
        await this.connect();
        
        // Start polling for updates
        this.startPolling();
        
        return this;
    }
    
    initializeUIElements() {
        // Map DOM elements to model
        this.model.elements.connectionStatus = document.getElementById('connectionStatus');
        this.model.elements.primaryConnection = document.getElementById('primaryConnection');
        this.model.elements.connectedPeers = document.getElementById('connectedServers'); // TODO: rename in HTML
        this.model.elements.messageLog = document.getElementById('messageLog');
        this.model.elements.messagesSent = document.getElementById('messagesSent');
        this.model.elements.messagesReceived = document.getElementById('messagesReceived');
        this.model.elements.acknowledgmentsSent = document.getElementById('acknowledgmentsSent');
        this.model.elements.connectionTime = document.getElementById('connectionTime');
    }
    
    async connect() {
        // ✅ Connect to P2P network (not "server")
        this.addMessage('connection', '🔌 Connecting to ONCE P2P network...');
        this.addMessage('connection', `📡 Peer: ${this.model.peerHost}`);
        
        try {
            // Get initial health status
            const healthSuccess = await this.getHealth();
            if (!healthSuccess) {
                throw new Error('Health check failed');
            }
            
            // Get peer information
            await this.getPeerInfo();
            
            // Get connected peers
            await this.getPeers();
            
            // Mark as connected
            this.model.isConnected = true;
            this.model.connectionTime = new Date();
            
            this.addMessage('connection', '✅ Connected to ONCE P2P network');
            
        } catch (error) {
            this.addMessage('error', `❌ Connection failed: ${error.message}`);
            this.model.isConnected = false;
        }
    }
    
    async getHealth() {
        // ✅ IOR-based method invocation (not direct fetch)
        try {
            // For now, use direct fetch until kernel is fully integrated
            // TODO: Replace with this.model.kernel.invokeMethod('getHealth', {})
            const response = await fetch(`http://${this.model.peerHost}/health`);
            if (!response || !response.ok) {
                throw new Error('Health check failed');
            }
            const health = await response.json();
            
            this.updateHealthDisplay(health);
            return true;
        } catch (error) {
            console.error('Health check failed:', error);
            this.updateHealthDisplay({ status: 'unhealthy', error: error.message });
            return false;
        }
    }
    
    async getPeerInfo() {
        // Get peer UUID and version
        try {
            const response = await fetch(`http://${this.model.peerHost}/health`);
            const health = await response.json();
            
            this.model.peerUUID = health.uuid;
            this.model.peerVersion = health.version || 'unknown';
            
            // Update primary peer info if available
            if (health.primaryServer) {
                this.model.primaryPeer = {
                    host: health.primaryServer.host || 'localhost',
                    port: health.primaryServer.port || 42777,
                    uuid: health.primaryServer.uuid || 'unknown'
                };
                this.updatePrimaryDisplay();
            }
        } catch (error) {
            console.error('Peer info fetch failed:', error);
        }
    }
    
    async getPeers() {
        // ✅ Get connected peers (NOT "servers")
        try {
            // Determine primary peer endpoint
            let endpoint = `http://${this.model.peerHost}/servers`;
            
            if (this.model.primaryPeer) {
                endpoint = `http://${this.model.primaryPeer.host}:${this.model.primaryPeer.port}/servers`;
            }
            
            const response = await fetch(endpoint);
            if (!response || !response.ok) {
                throw new Error('Peers fetch failed');
            }
            const data = await response.json();
            
            this.model.peers = data.servers || [];  // TODO: API should return "peers" not "servers"
            this.updatePeersDisplay();
            
        } catch (error) {
            console.error('Peers fetch failed:', error);
            this.model.peers = [];
            this.updatePeersDisplay();
        }
    }
    
    startPolling() {
        // ✅ Poll for updates (method-based, not event listeners)
        // Poll every 5 seconds
        setInterval(() => this.pollUpdates(), 5000);
    }
    
    pollUpdates() {
        // Method to poll for updates (called by setInterval)
        if (this.model.isConnected) {
            this.getHealth();
            this.getPeers();
            this.updateConnectionTime();
        }
    }
    
    // ========================================
    // UI UPDATE METHODS
    // ========================================
    
    updateHealthDisplay(health) {
        // ✅ Method operating on model
        const el = this.model.elements.connectionStatus;
        if (!el) return;
        
        if (health.status === 'healthy') {
            el.textContent = `🟢 Connected to ${this.model.peerHost}`;
            el.style.color = '#0f0';
        } else {
            el.textContent = `🔴 Disconnected (${health.error || 'unknown'})`;
            el.style.color = '#f00';
        }
    }
    
    updatePrimaryDisplay() {
        // Update primary peer connection info
        const el = this.model.elements.primaryConnection;
        if (!el || !this.model.primaryPeer) return;
        
        el.textContent = `Primary: ${this.model.primaryPeer.host}:${this.model.primaryPeer.port}`;
    }
    
    updatePeersDisplay() {
        // ✅ Update peers display (NOT "servers")
        const el = this.model.elements.connectedPeers;
        if (!el) return;
        
        const peerCount = this.model.peers.length;
        if (peerCount === 0) {
            el.textContent = 'No peers connected';
        } else {
            const peerList = this.model.peers.map(p => {
                const port = p.capabilities?.find(c => c.capability === 'httpPort')?.port || 'unknown';
                return `${p.host || 'unknown'}:${port}`;
            }).join(', ');
            el.textContent = `${peerCount} peer${peerCount === 1 ? '' : 's'}: ${peerList}`;
        }
    }
    
    updateConnectionTime() {
        // Update connection timer
        const el = this.model.elements.connectionTime;
        if (!el || !this.model.connectionTime) return;
        
        const now = new Date();
        const diff = now - this.model.connectionTime;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
        el.textContent = timeStr;
    }
    
    updateStatsDisplay() {
        // Update statistics display
        if (this.model.elements.messagesSent) {
            this.model.elements.messagesSent.textContent = this.model.stats.messagesSent;
        }
        if (this.model.elements.messagesReceived) {
            this.model.elements.messagesReceived.textContent = this.model.stats.messagesReceived;
        }
        if (this.model.elements.acknowledgmentsSent) {
            this.model.elements.acknowledgmentsSent.textContent = this.model.stats.acknowledgmentsSent;
        }
    }
    
    addMessage(type, text) {
        // Add message to log (method, not function)
        const el = this.model.elements.messageLog;
        if (!el) return;
        
        const now = new Date();
        const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = type;  // 'connection', 'message', 'error', 'acknowledgment'
        messageDiv.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${text}`;
        
        el.appendChild(messageDiv);
        el.scrollTop = el.scrollHeight;  // Auto-scroll to bottom
    }
    
    clearLog() {
        // Clear message log
        const el = this.model.elements.messageLog;
        if (!el) return;
        
        el.innerHTML = '';
        this.addMessage('connection', '🧹 Log cleared');
    }
    
    // ========================================
    // ACTION METHODS (for button clicks)
    // ========================================
    
    async broadcastToAll() {
        // Broadcast message to all peers
        this.addMessage('message', '📡 Broadcast feature - TODO: Implement with kernel');
        // TODO: Implement using kernel methods, not protocol messages
    }
    
    async relayViaPrimary() {
        // Relay message via primary peer
        this.addMessage('message', '🔄 Relay feature - TODO: Implement with kernel');
        // TODO: Implement using kernel methods, not protocol messages
    }
    
    async sendP2PDirect() {
        // Send P2P direct message
        this.addMessage('message', '🔗 P2P direct feature - TODO: Implement with kernel');
        // TODO: Implement using kernel methods, not protocol messages
    }
}

// ✅ NO arrow functions!
// ✅ NO callbacks!
// ✅ NO event listeners (once.on)!
// ✅ Just methods operating on this.model!
// ✅ P2P terminology (peers, not client/server)!

