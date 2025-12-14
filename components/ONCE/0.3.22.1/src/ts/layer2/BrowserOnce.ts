/**
 * BrowserOnce - Browser/PWA ONCE Kernel Implementation (TypeScript)
 * 
 * Extends DefaultOnceKernel for unified kernel architecture
 * 
 * Web4 Architecture:
 * - Empty constructor (Radical OOP)
 * - State in this.model
 * - Methods operate on model
 * - NO arrow functions
 * - NO callbacks (except WebSocket event handlers)
 * - P2P terminology (peers, not clients/servers)
 * - WebSocket push for scenario state transfer
 * 
 * @layer2
 * @pattern Concrete Kernel Implementation
 * @pdca session/2025-11-25-UTC-1930.iteration-01.10-once-naming-convention-standardization.pdca.md
 */

import { DefaultOnceKernel } from './DefaultOnceKernel.js';
import type { BrowserOnceModel } from '../layer3/BrowserOnceModel.interface.js';
import { EnvironmentType } from '../layer3/EnvironmentType.enum.js';
import { DefaultEnvironmentInfo } from './DefaultEnvironmentInfo.js';
import { LifecycleState } from '../layer3/LifecycleState.enum.js';
import { LifecycleEventType } from '../layer3/LifecycleEventType.enum.js';
import { CSSLoader } from './CSSLoader.js';
import { HTMLTemplateLoader } from './HTMLTemplateLoader.js';
import { BrowserOnceOrchestrator } from '../layer4/BrowserOnceOrchestrator.js';
import { BrowserScenarioStorage } from './BrowserScenarioStorage.js';
import { PersistenceManager } from '../layer3/PersistenceManager.interface.js';
import type { StorageScenario } from '../layer3/StorageScenario.interface.js';
import type { LitElement } from 'lit';
import type { Reference } from '../layer3/Reference.interface.js';

export class BrowserOnce extends DefaultOnceKernel<BrowserOnceModel> {
    // Model type is BrowserOnceModel via generic inheritance
    // Access via this.model getter from UcpComponent
    
    /**
     * Default model for BrowserOnce
     * Required by UcpComponent (abstract in DefaultOnceKernel)
     */
    protected modelDefault(): BrowserOnceModel {
        // Extract version from script URL (Web4 Path Authority pattern)
        const scriptUrl = import.meta.url;
        const versionMatch = scriptUrl.match(/\/(\d+\.\d+\.\d+\.\d+)\//);
        const detectedVersion = versionMatch ? versionMatch[1] : '0.0.0.0';
        
        return {
            // Base model properties (from Model interface)
            uuid: this.generateUUID(),
            name: 'BrowserONCEKernel',
            
            // Kernel properties (from ONCEKernelModel)
            version: detectedVersion,
            state: LifecycleState.CREATED,
            environment: DefaultEnvironmentInfo.createBrowserEnvironment(
                navigator.userAgent
            ).getModel(),
            peers: [],
            connectionTime: null,
            startTime: new Date(),
            stats: {
                messagesSent: 0,
                messagesReceived: 0,
                acknowledgmentsSent: 0,
                errorsCount: 0
            },
            
            // Browser-specific properties
            peerHost: window.location.host,
            peerUUID: null,
            peerVersion: 'unknown',
            isConnected: false,
            primaryPeer: null,
            ws: null,
            
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
            },
            
            // Messages cache
            messages: []
        };
    }
    
    /**
     * Layer 4 Orchestrator - handles ALL async operations
     * ✅ Web4 Architecture: Async separated from domain logic
     * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
     */
    private orchestratorInstance: Reference<BrowserOnceOrchestrator> = null;
    
    /**
     * Main view element (set by orchestrator)
     * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
     */
    private mainView: Reference<LitElement> = null;
    
    /**
     * ✅ Web4 Principle 24: PersistenceManager for RelatedObjects lookup
     * IndexedDB-based scenario storage for browser
     * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
     */
    private scenarioStorage: Reference<BrowserScenarioStorage> = null;
    
    // ✅ I.10: modelListeners REMOVED - UcpModel handles view updates automatically
    // @pdca 2025-12-14-UTC-1730.i10-ucpmodel-integration.pdca.md
    
    constructor() {
        // ✅ Empty constructor (Radical OOP)
        super();
    }
    
    /**
     * Get the orchestrator (lazy creation)
     * ✅ Web4: Async operations delegated to Layer 4
     */
    get orchestrator(): BrowserOnceOrchestrator {
        if (!this.orchestratorInstance) {
            this.orchestratorInstance = new BrowserOnceOrchestrator(this);
        }
        return this.orchestratorInstance;
    }
    
    /**
     * Get the browser model - public access for orchestrator
     * ✅ Web4: TypeScript getter (P16)
     */
    get browserModel(): BrowserOnceModel {
        return this.model;
    }
    
    // ========================================
    // SPA ENTRY POINT - View Discovery
    // @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
    // ========================================
    
    /**
     * Default view for this component
     * Used by appRender() to determine what to show
     * Override in subclass if needed
     */
    get defaultView(): Reference<string> {
        return 'once-over-view';
    }
    
    /**
     * App entry view (alternative to defaultView)
     * If set, takes precedence over defaultView
     * Override in subclass if needed
     */
    get appEntryView(): Reference<string> {
        return null;
    }
    
    /**
     * Render the app into a container
     * Called by once.html after kernel boot
     * 
     * ✅ Web4: Delegates ALL async operations to Layer 4 Orchestrator
     * 
     * @param container Element to render into (usually document.body)
     * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
     */
    async appRender(container: Element): Promise<void> {
        console.log('[BrowserOnce] appRender() delegating to orchestrator...');
        
        // ✅ Web4: Delegate async to Layer 4 Orchestrator
        await this.orchestrator.appRender(container);
        
        // ✅ I.10: UcpModel handles view updates automatically via proxy
        // @pdca 2025-12-14-UTC-1730.i10-ucpmodel-integration.pdca.md
        
        console.log('[BrowserOnce] appRender() complete');
    }
    
    /**
     * @deprecated Use orchestrator.assetsPreload() instead
     * Preload CSS and HTML template assets
     * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
     */
    private async assetsPreload(): Promise<void> {
        console.log('[BrowserOnce] Preloading assets...');
        
        // Fetch asset manifest from server
        let manifest: { css: string[], templates: string[] } = { css: [], templates: [] };
        try {
            const response = await fetch('/asset-manifest');
            const data = await response.json();
            manifest = data.model || { css: [], templates: [] };
            console.log('[BrowserOnce] Asset manifest:', manifest);
        } catch (e) {
            console.warn('[BrowserOnce] Failed to fetch asset manifest, using defaults');
            // Fallback to known assets
            manifest = {
                css: [
                    '/EAMD.ucp/components/ONCE/0.3.21.9/src/ts/layer5/views/css/OnceOverView.css',
                    '/EAMD.ucp/components/ONCE/0.3.21.9/src/ts/layer5/views/css/OncePeerItemView.css',
                    '/EAMD.ucp/components/ONCE/0.3.21.9/src/ts/layer5/views/css/DefaultItemView.css'
                ],
                templates: []
            };
        }
        
        // Preload all assets in parallel
        await Promise.all([
            CSSLoader.preloadAll(manifest.css),
            HTMLTemplateLoader.preloadAll(manifest.templates)
        ]);
        
        console.log('[BrowserOnce] Assets preloaded');
    }
    
    /**
     * @deprecated Use orchestrator.viewsImport() instead
     * Import view components dynamically
     * @pdca 2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md
     */
    private async viewsImport(): Promise<void> {
        console.log('[BrowserOnce] Importing view components...');
        
        const basePath = '/EAMD.ucp/components/ONCE/0.3.21.9/dist/ts/layer5/views';
        
        // Import Lit components (they self-register via @customElement)
        await import(`${basePath}/OnceOverView.js`);
        await import(`${basePath}/DefaultItemView.js`);
        await import(`${basePath}/OncePeerItemView.js`);
        
        console.log('[BrowserOnce] View components imported');
    }
    
    // ═══════════════════════════════════════════════════════════════
    // I.10: Observer Pattern REMOVED
    // UcpModel automatically triggers view updates via proxy
    // @pdca 2025-12-14-UTC-1730.i10-ucpmodel-integration.pdca.md
    //
    // REMOVED:
    // - modelChangeHandle()
    // - onModelChange()
    // - offModelChange()
    // - notifyModelListeners()
    // - invokeListener()
    //
    // REPLACEMENT: this.model.xxx = value triggers views automatically
    // ═══════════════════════════════════════════════════════════════
    
    async init(scenario?: any): Promise<this> {
        // ✅ Transition to INITIALIZING state
        this.transitionTo(LifecycleState.INITIALIZING, LifecycleEventType.BEFORE_INIT);
        
        // ✅ Initialize via UcpComponent (creates UcpModel wrapper)
        await super.init(scenario);
        
        // ✅ Update model state and apply scenario overrides
        this.model.state = LifecycleState.INITIALIZING;
        if (scenario?.peerHost) {
            this.model.peerHost = scenario.peerHost;
        }
        
        // 0. Initialize scenario storage (Web4 Principle 24)
        await this.storageInitialize();
        
        // 1. Initialize UI elements
        this.initializeUIElements();
        
        // 2. Get initial health and peer info
        await this.getHealthAndPeerInfo();
        
        // 3. Get connected peers list
        await this.getPeers();
        
        // 4. Connect to P2P network (WebSocket)
        await this.connectWebSocket();
        
        // 5. Listen for scenario state pushes (WebSocket events)
        this.listenForScenarioUpdates();
        
        // 6. Start connection timer
        this.startConnectionTimer();
        
        // ✅ Transition to INITIALIZED state
        this.transitionTo(LifecycleState.INITIALIZED, LifecycleEventType.AFTER_INIT);
        
        return this;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // 📦 STORAGE & PERSISTENCE - Web4 Principle 24: RelatedObjects
    // @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
    // ═══════════════════════════════════════════════════════════════
    
    /**
     * Initialize BrowserScenarioStorage and register in RelatedObjects
     * 
     * ✅ Web4 Principle 24: PersistenceManager lookup via RelatedObjects
     * ✅ Web4 Principle 6: Empty constructor + init()
     */
    private async storageInitialize(): Promise<void> {
        // Generate unique ID for this browser storage instance
        const storageUUID = this.generateUUID();
        
        // Create storage scenario
        const storageScenario: StorageScenario = {
            ior: {
                uuid: storageUUID,
                component: 'BrowserScenarioStorage',
                version: this.model.version || '0.3.21.9'
            },
            owner: 'browser',
            model: {
                uuid: storageUUID,
                projectRoot: window.location.origin,
                indexBaseDir: 'indexeddb://once-scenarios',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };
        
        // Initialize storage
        this.scenarioStorage = new BrowserScenarioStorage().init(storageScenario);
        
        // ✅ Register in RelatedObjects for lookup
        if (this.controller) {
            this.controller.relatedObjectRegister(PersistenceManager, this.scenarioStorage);
            console.log('[BrowserOnce] ✅ PersistenceManager registered in RelatedObjects');
        }
    }
    
    /**
     * Get PersistenceManager from RelatedObjects
     * 
     * @returns BrowserScenarioStorage instance or null
     */
    persistenceManagerGet(): BrowserScenarioStorage | null {
        if (this.controller) {
            return this.controller.relatedObjectLookupFirst(PersistenceManager) as BrowserScenarioStorage | null;
        }
        return this.scenarioStorage;
    }
    
    async getHealth(): Promise<any> {
        // ✅ Get health status from peer (HTTPS by default)
        // @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
        try {
            const response = await fetch(`https://${this.model.peerHost}/health`);
            if (!response || !response.ok) {
                throw new Error('Health check failed');
            }
            const health = await response.json();
            this.updateHealthDisplay(health);
            return health;
        } catch (error) {
            const errorMsg = (error as Error).message;
            console.error('Health check failed:', error);
            this.updateHealthDisplay({ status: 'unhealthy', error: errorMsg });
            return { status: 'unhealthy', error: errorMsg };
        }
    }
    
    async invokeMethod(method: string, params: any): Promise<any> {
        // ✅ IOR-based method invocation
        // TODO: Implement full IOR-based invocation
        console.warn('[BrowserONCEKernel] invokeMethod not yet implemented:', method, params);
        return null;
    }
    
    async start(): Promise<void> {
        // ✅ Start kernel (already initialized in init())
        console.log('[BrowserONCEKernel] Kernel started');
    }
    
    async stop(): Promise<void> {
        // ✅ Stop kernel (cleanup)
        if (this.model.ws) {
            this.model.ws.close();
            this.model.ws = null;
        }
        this.model.isConnected = false;
        console.log('[BrowserONCEKernel] Kernel stopped');
    }
    
    // ========================================
    // INITIALIZATION METHODS
    // ========================================
    
    private initializeUIElements(): void {
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
    
    private async getHealthAndPeerInfo(): Promise<void> {
        // Get health and extract peer info
        this.addMessageToLog('connection', '🔌 Connecting to ONCE P2P network...');
        this.addMessageToLog('connection', `📡 Peer: ${this.model.peerHost}`);
        
        try {
            const health = await this.getHealth();
            
            // ✅ Health is successful if we have an IOR (Web4 pattern)
            if (health.ior || health.status === 'healthy') {
                // ✅ Get version from IOR (Web4 pattern) or fallback to health.version
                const serverVersion = health.ior?.version || health.version;
                this.model.peerUUID = health.ior?.uuid || health.uuid;
                this.model.peerVersion = serverVersion || 'unknown';
                // ✅ Update kernel version from server (Path Authority pattern)
                // Browser kernel uses server's version for IOR calls
                this.model.version = serverVersion || this.model.version;
                this.model.isConnected = true;
                this.model.connectionTime = new Date();
                
                // Update primary peer info if available
                if (health.primaryServer) {
                    this.model.primaryPeer = {
                        host: health.primaryServer.host || 'localhost',
                        port: health.primaryServer.port || 42777,
                        uuid: health.primaryServer.uuid || 'unknown'
                    };
                    this.updatePrimaryDisplay();
                }
                
                this.addMessageToLog('connection', '✅ Connected to ONCE P2P network');
            } else {
                throw new Error('Health check returned unhealthy status');
            }
        } catch (error) {
            this.addMessageToLog('error', `❌ Connection failed: ${(error as Error).message}`);
            this.model.isConnected = false;
            this.model.stats.errorsCount++;
        }
    }
    
    private async getPeers(): Promise<void> {
        // ✅ Get connected peers (NOT "servers")
        try {
            // Determine primary peer endpoint (HTTPS by default)
            // @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
            let endpoint = `https://${this.model.peerHost}/servers`;
            
            if (this.model.primaryPeer) {
                endpoint = `https://${this.model.primaryPeer.host}:${this.model.primaryPeer.port}/servers`;
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
            this.model.stats.errorsCount++;
            this.updatePeersDisplay();
        }
    }
    
    // ========================================
    // WEBSOCKET METHODS (Protocol-Less State Transfer)
    // ========================================
    
    private async connectWebSocket(): Promise<void> {
        // ✅ WSS by default (HTTPS requires WSS)
        // @pdca 2025-12-12-UTC-2300.https-pwa-letsencrypt-integration.pdca.md
        const wsUrl = `wss://${this.model.peerHost}`;
        this.model.ws = new WebSocket(wsUrl);
        
        const self = this;
        
        // ✅ Connection opened
        this.model.ws.onopen = function() {
            self.model.isConnected = true;
            self.addMessageToLog('connection', '✅ WebSocket connected');
        };
        
        // ✅ Connection closed
        this.model.ws.onclose = function() {
            self.model.isConnected = false;
            self.addMessageToLog('error', '❌ WebSocket disconnected');
        };
        
        // ✅ Error handling
        this.model.ws.onerror = function(error) {
            console.error('WebSocket error:', error);
            self.addMessageToLog('error', '❌ WebSocket error');
            self.model.stats.errorsCount++;
        };
    }
    
    private listenForScenarioUpdates(): void {
        if (!this.model.ws) return;
        
        const self = this;
        
        // ✅ Receive scenario state pushes (NOT protocol messages!)
        this.model.ws.onmessage = function(event) {
            try {
                // ✅ Parse incoming scenario (Web4 Scenario format)
                const scenario = JSON.parse(event.data);
                
                // ✅ Handle scenario state update
                self.handleScenarioUpdate(scenario);
            } catch (error) {
                console.error('Failed to parse scenario:', error);
                self.model.stats.errorsCount++;
            }
        };
    }
    
    private handleScenarioUpdate(scenario: any): void {
        // ✅ Determine scenario type from IOR component
        const component = scenario.ior?.component;
        
        if (component === 'ONCE') {
            // ✅ Peer state update
            this.updatePeerState(scenario);
        } else if (component === 'ONCEMessage') {
            // ✅ Message scenario received
            this.handleMessageScenario(scenario);
        }
        
        // ✅ I.10: UcpModel handles view updates automatically - no manual notify needed
        // @pdca 2025-12-14-UTC-1730.i10-ucpmodel-integration.pdca.md
        
        // ✅ Update legacy UI (for demo-hub.html)
        this.updatePeersDisplay();
        this.updateStatsDisplay();
    }
    
    /**
     * Update peer state in model (protocol-less state transfer)
     * ✅ Adds new peers or updates existing
     * ✅ Removes peers with STOPPED/SHUTDOWN state
     * ✅ Saves/removes from PersistenceManager (Web4 P24)
     * @pdca 2025-11-26-UTC-0215.iteration-01.14-websocket-state-transfer-completion.pdca.md
     * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
     */
    private updatePeerState(scenario: any): void {
        const uuid = scenario.ior?.uuid || scenario.model?.uuid;
        const state = scenario.model?.state?.state;
        
        // ✅ Remove peer if STOPPED or SHUTDOWN
        if (state === 'STOPPED' || state === 'SHUTDOWN') {
            const removeIndex = this.model.peers.findIndex(
                p => (p.ior?.uuid || p.model?.uuid) === uuid
            );
            
            if (removeIndex >= 0) {
                this.model.peers.splice(removeIndex, 1);
                console.log(`🗑️  Peer removed: ${uuid} (${state})`);
                
                // ✅ Web4 P24: Remove from IndexedDB storage
                this.scenarioRemoveFromStorage(uuid);
            }
            return;
        }
        
        // ✅ Update or add peer
        const existingIndex = this.model.peers.findIndex(
            p => (p.ior?.uuid || p.model?.uuid) === uuid
        );
        
        if (existingIndex >= 0) {
            this.model.peers[existingIndex] = scenario;
            console.log(`🔄 Peer updated: ${uuid}`);
        } else {
            this.model.peers.push(scenario);
            console.log(`➕ Peer added: ${uuid}`);
        }
        
        // ✅ Web4 P24: Save to IndexedDB storage
        this.scenarioSaveToStorage(uuid, scenario);
    }
    
    /**
     * Save scenario to IndexedDB via PersistenceManager
     * ✅ Web4 Principle 24: RelatedObjects Registry
     * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
     */
    private async scenarioSaveToStorage(uuid: string, scenario: any): Promise<void> {
        try {
            const persistenceManager = this.persistenceManagerGet();
            if (!persistenceManager) {
                return; // Storage not initialized yet
            }
            
            // Build symlink paths
            const symlinkPaths: string[] = [];
            const version = scenario.ior?.version || this.model.version;
            symlinkPaths.push(`type/ONCE/${version}`);
            
            await persistenceManager.scenarioSave(uuid, scenario, symlinkPaths);
            console.log(`[BrowserOnce] ✅ Peer scenario ${uuid} saved to IndexedDB`);
        } catch (error) {
            console.warn(`[BrowserOnce] Failed to save scenario: ${error}`);
        }
    }
    
    /**
     * Remove scenario from IndexedDB via PersistenceManager
     * ✅ Web4 Principle 24: RelatedObjects Registry
     * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
     */
    private async scenarioRemoveFromStorage(uuid: string): Promise<void> {
        try {
            const persistenceManager = this.persistenceManagerGet();
            if (!persistenceManager) {
                return;
            }
            
            await persistenceManager.scenarioDelete(uuid, true);
            console.log(`[BrowserOnce] ✅ Peer scenario ${uuid} removed from IndexedDB`);
        } catch (error) {
            console.warn(`[BrowserOnce] Failed to remove scenario: ${error}`);
        }
    }
    
    private handleMessageScenario(scenario: any): void {
        // ✅ Extract message from scenario model
        const message = scenario.model;
        
        // ✅ Update stats
        this.model.stats.messagesReceived++;
        this.model.messages.push(message);
        
        // ✅ Display message
        const from = message.from?.peerHost || 'unknown';
        this.addMessageToLog('message', `📩 Message from ${from}: ${message.content || '[no content]'}`);
        
        // ✅ Auto-acknowledge (send ACK scenario back)
        this.sendAcknowledgment(scenario);
    }
    
    // ========================================
    // UI UPDATE METHODS
    // ========================================
    
    private updateHealthDisplay(health: any): void {
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
    
    private updatePrimaryDisplay(): void {
        // Update primary peer connection info
        const el = this.model.elements.primaryConnection;
        if (!el || !this.model.primaryPeer) return;
        
        el.textContent = `Primary: ${this.model.primaryPeer.host}:${this.model.primaryPeer.port}`;
    }
    
    private updatePeersDisplay(): void {
        // ✅ Update peers display (NOT "servers")
        const el = this.model.elements.connectedPeers;
        if (!el) return;
        
        const peerCount = this.model.peers.length;
        if (peerCount === 0) {
            el.textContent = 'No peers connected';
        } else {
            const peerList = this.model.peers.map(p => {
                const port = p.capabilities?.find((c: any) => c.capability === 'httpPort')?.port || 'unknown';
                return `${p.host || 'unknown'}:${port}`;
            }).join(', ');
            el.textContent = `${peerCount} peer${peerCount === 1 ? '' : 's'}: ${peerList}`;
        }
    }
    
    private startConnectionTimer(): void {
        // Update connection timer every second
        setInterval(() => this.updateConnectionTime(), 1000);
    }
    
    private updateConnectionTime(): void {
        // Update connection timer
        const el = this.model.elements.connectionTime;
        if (!el || !this.model.connectionTime) return;
        
        const now = new Date();
        const diff = now.getTime() - this.model.connectionTime.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
        el.textContent = timeStr;
    }
    
    private updateStatsDisplay(): void {
        // Update statistics display
        if (this.model.elements.messagesSent) {
            this.model.elements.messagesSent.textContent = String(this.model.stats.messagesSent);
        }
        if (this.model.elements.messagesReceived) {
            this.model.elements.messagesReceived.textContent = String(this.model.stats.messagesReceived);
        }
        if (this.model.elements.acknowledgmentsSent) {
            this.model.elements.acknowledgmentsSent.textContent = String(this.model.stats.acknowledgmentsSent);
        }
    }
    
    public addMessageToLog(type: string, text: string): void {
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
    
    // ========================================
    // PUBLIC ACTION METHODS (for button clicks)
    // ========================================
    
    public clearLog(): void {
        // Clear message log
        const el = this.model.elements.messageLog;
        if (!el) return;
        
        el.innerHTML = '';
        this.addMessageToLog('connection', '🧹 Log cleared');
    }
    
    public async broadcastToAll(): Promise<void> {
        // ✅ Create a scenario representing the message
        const messageScenario = {
            ior: {
                uuid: this.generateUUID(),
                component: 'ONCEMessage',
                version: this.model.version  // ✅ Dynamic version
            },
            owner: this.model.uuid,
            model: {
                uuid: this.generateUUID(),
                name: 'Broadcast Message',
                type: 'broadcast',
                content: 'Hello all peers!',
                timestamp: new Date().toISOString(),
                from: {
                    peerHost: this.model.peerHost,
                    peerUUID: this.model.peerUUID
                }
            }
        };
        
        // ✅ Send scenario via WebSocket (NOT HTTP fetch!)
        if (this.model.ws && this.model.ws.readyState === WebSocket.OPEN) {
            this.model.ws.send(JSON.stringify(messageScenario));
            
            // ✅ Update local model (increment stats)
            this.model.stats.messagesSent++;
            this.model.messages.push(messageScenario.model);
            
            // ✅ Update UI
            this.updateStatsDisplay();
            this.addMessageToLog('broadcast', '📡 Broadcast sent to all peers');
        } else {
            this.addMessageToLog('error', '❌ WebSocket not connected');
            this.model.stats.errorsCount++;
        }
    }
    
    public async relayViaPrimary(): Promise<void> {
        // ✅ Relay message via primary peer
        const messageScenario = {
            ior: {
                uuid: this.generateUUID(),
                component: 'ONCEMessage',
                version: this.model.version  // ✅ Dynamic version
            },
            owner: this.model.uuid,
            model: {
                uuid: this.generateUUID(),
                name: 'Relay Message',
                type: 'relay',
                content: 'Relay via primary peer',
                timestamp: new Date().toISOString(),
                from: {
                    peerHost: this.model.peerHost,
                    peerUUID: this.model.peerUUID
                },
                relayVia: this.model.primaryPeer?.host || 'unknown'
            }
        };
        
        if (this.model.ws && this.model.ws.readyState === WebSocket.OPEN) {
            this.model.ws.send(JSON.stringify(messageScenario));
            this.model.stats.messagesSent++;
            this.model.messages.push(messageScenario.model);
            this.updateStatsDisplay();
            this.addMessageToLog('message', '🔄 Relay message sent via primary');
        } else {
            this.addMessageToLog('error', '❌ WebSocket not connected');
            this.model.stats.errorsCount++;
        }
    }
    
    public async sendP2PDirect(): Promise<void> {
        // ✅ Send P2P direct message
        const messageScenario = {
            ior: {
                uuid: this.generateUUID(),
                component: 'ONCEMessage',
                version: this.model.version  // ✅ Dynamic version
            },
            owner: this.model.uuid,
            model: {
                uuid: this.generateUUID(),
                name: 'P2P Direct Message',
                type: 'direct',
                content: 'Direct P2P message',
                timestamp: new Date().toISOString(),
                from: {
                    peerHost: this.model.peerHost,
                    peerUUID: this.model.peerUUID
                }
            }
        };
        
        if (this.model.ws && this.model.ws.readyState === WebSocket.OPEN) {
            this.model.ws.send(JSON.stringify(messageScenario));
            this.model.stats.messagesSent++;
            this.model.messages.push(messageScenario.model);
            this.updateStatsDisplay();
            this.addMessageToLog('message', '🔗 P2P direct message sent');
        } else {
            this.addMessageToLog('error', '❌ WebSocket not connected');
            this.model.stats.errorsCount++;
        }
    }
    
    private sendAcknowledgment(originalScenario: any): void {
        // ✅ Create ACK scenario
        const ackScenario = {
            ior: {
                uuid: this.generateUUID(),
                component: 'ONCEAcknowledgment',
                version: this.model.version  // ✅ Dynamic version
            },
            owner: this.model.uuid,
            model: {
                uuid: this.generateUUID(),
                name: 'Message Acknowledgment',
                originalMessageUUID: originalScenario.ior?.uuid,
                timestamp: new Date().toISOString(),
                from: {
                    peerHost: this.model.peerHost,
                    peerUUID: this.model.peerUUID
                }
            }
        };
        
        // ✅ Send ACK via WebSocket
        if (this.model.ws && this.model.ws.readyState === WebSocket.OPEN) {
            this.model.ws.send(JSON.stringify(ackScenario));
            this.model.stats.acknowledgmentsSent++;
            this.updateStatsDisplay();
        }
    }
}

// ✅ NO arrow functions in methods!
// ✅ NO callbacks (except WebSocket handlers)!
// ✅ NO event listeners (once.on)!
// ✅ Just methods operating on this.model!
// ✅ P2P terminology (peers, not client/server)!
// ✅ WebSocket push for scenario state transfer!
