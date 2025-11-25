/**
 * Blackbox Tests for BrowserONCEKernel
 * 
 * Tests the public API of BrowserONCEKernel without knowledge of implementation.
 * Focus: What the kernel DOES (user perspective)
 * 
 * @pdca session/2025-11-22-UTC-2000.iteration-01.7-browser-client-kernel.pdca.md
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock browser environment
let dom: JSDOM;
let window: any;
let document: any;
let BrowserONCEKernel: any;

beforeEach(async () => {
    // Create minimal DOM
    dom = new JSDOM(`<!DOCTYPE html>
        <html>
        <body>
            <div id="connectionStatus"></div>
            <div id="primaryConnection"></div>
            <div id="connectedServers"></div>
            <div id="messageLog"></div>
            <div id="messagesSent">0</div>
            <div id="messagesReceived">0</div>
            <div id="acknowledgmentsSent">0</div>
            <div id="connectionTime">00:00:00</div>
        </body>
        </html>`, {
        url: 'http://localhost:42777',
        pretendToBeVisual: true
    });

    window = dom.window;
    document = window.document;
    
    // Setup global
    (global as any).window = window;
    (global as any).document = document;
    (window as any).global = { ONCE: null };
    
    // Mock fetch
    global.fetch = vi.fn();
    
    // Import kernel after DOM setup
    const module = await import('../src/view/js/once-browser-kernel.js');
    BrowserONCEKernel = module.BrowserONCEKernel;
});

afterEach(() => {
    vi.restoreAllMocks();
    dom.window.close();
});

// ========================================
// Suite 1: Kernel Initialization
// ========================================

describe('BrowserONCEKernel - Initialization (Blackbox)', () => {
    
    test('should create kernel with empty constructor', () => {
        // GIVEN: Nothing
        // WHEN: new BrowserONCEKernel() called
        const kernel = new BrowserONCEKernel();
        
        // THEN: Kernel instance exists with null model
        expect(kernel).toBeDefined();
        expect(kernel.model).toBeNull();
    });
    
    test('should initialize kernel with default scenario', async () => {
        // GIVEN: Kernel instance
        const kernel = new BrowserONCEKernel();
        
        // Mock successful health check
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ servers: [] })
        });
        
        // WHEN: kernel.init() called without scenario
        await kernel.init();
        
        // THEN: Kernel initializes with default peerHost (window.location.host)
        expect(kernel.model).not.toBeNull();
        expect(kernel.model.peerHost).toBe('localhost:42777');  // from JSDOM url
    });
    
    test('should initialize kernel with custom scenario', async () => {
        // GIVEN: Kernel instance and custom scenario
        const kernel = new BrowserONCEKernel();
        
        // Mock successful health check
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ servers: [] })
        });
        
        // WHEN: kernel.init({ peerHost: 'peer1.local:8080' })
        await kernel.init({ peerHost: 'peer1.local:8080' });
        
        // THEN: Kernel initializes with custom peerHost
        expect(kernel.model.peerHost).toBe('peer1.local:8080');
    });
    
    test('should return initialized kernel from init()', async () => {
        // GIVEN: Kernel instance
        const kernel = new BrowserONCEKernel();
        
        // Mock successful health check
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ servers: [] })
        });
        
        // WHEN: await kernel.init()
        const result = await kernel.init();
        
        // THEN: Returns same kernel instance (fluent API)
        expect(result).toBe(kernel);
    });
});

// ========================================
// Suite 2: P2P Network Connection
// ========================================

describe('BrowserONCEKernel - P2P Connection (Blackbox)', () => {
    
    test('should connect to P2P network on init', async () => {
        // GIVEN: Kernel with valid peerHost
        const kernel = new BrowserONCEKernel();
        
        // Mock successful connection
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ servers: [] })
        });
        
        // WHEN: kernel.init() called
        await kernel.init();
        
        // THEN: Connection established (isConnected = true)
        expect(kernel.model.isConnected).toBe(true);
    });
    
    test('should handle connection failure gracefully', async () => {
        // GIVEN: Kernel with invalid peerHost
        const kernel = new BrowserONCEKernel();
        
        // Mock connection failure
        (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
        
        // WHEN: kernel.init({ peerHost: 'invalid:99999' })
        // THEN: Does not throw
        await expect(kernel.init({ peerHost: 'invalid:99999' })).resolves.toBeDefined();
        
        // AND: isConnected = false
        expect(kernel.model.isConnected).toBe(false);
    });
});

// ========================================
// Suite 3: Health Monitoring
// ========================================

describe('BrowserONCEKernel - Health Monitoring (Blackbox)', () => {
    
    test('should fetch health status from peer', async () => {
        // GIVEN: Connected kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock health responses
        const healthResponse = { status: 'healthy', uuid: 'test-uuid', version: '0.3.21.6' };
        (global.fetch as any).mockResolvedValue({
            json: async () => healthResponse
        });
        
        await kernel.init();
        
        // WHEN: kernel.getHealth() called
        await kernel.getHealth();
        
        // THEN: Health fetch was called
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/health')
        );
    });
    
    test('should update health display when health changes', async () => {
        // GIVEN: Connected kernel with DOM elements
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // WHEN: kernel.getHealth() called
        await kernel.getHealth();
        
        // THEN: DOM element #connectionStatus updated
        const statusEl = document.getElementById('connectionStatus');
        expect(statusEl.textContent).toContain('🟢');
        expect(statusEl.textContent).toContain('Connected');
    });
});

// ========================================
// Suite 4: Peer Discovery
// ========================================

describe('BrowserONCEKernel - Peer Discovery (Blackbox)', () => {
    
    test('should fetch list of network peers', async () => {
        // GIVEN: Connected kernel in multi-peer network
        const kernel = new BrowserONCEKernel();
        
        // Mock health check
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        // Mock servers/peers response
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({
                servers: [
                    { host: 'peer1', capabilities: [{ capability: 'httpPort', port: 8080 }] },
                    { host: 'peer2', capabilities: [{ capability: 'httpPort', port: 8081 }] }
                ]
            })
        });
        
        await kernel.init();
        
        // WHEN: kernel.getPeers() called
        await kernel.getPeers();
        
        // THEN: Returns array of peer objects
        expect(kernel.model.peers).toHaveLength(2);
        expect(kernel.model.peers[0].host).toBe('peer1');
    });
    
    test('should update peers display when peers change', async () => {
        // GIVEN: Connected kernel with DOM elements
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({
                servers: [
                    { host: 'peer1', capabilities: [{ capability: 'httpPort', port: 8080 }] }
                ]
            })
        });
        
        await kernel.init();
        
        // WHEN: kernel.getPeers() called
        await kernel.getPeers();
        
        // THEN: DOM element #connectedServers updated
        const peersEl = document.getElementById('connectedServers');
        expect(peersEl.textContent).toContain('1 peer');
        expect(peersEl.textContent).toContain('peer1:8080');
    });
    
    test('should update model.peers array', async () => {
        // GIVEN: Connected kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({
                servers: [
                    { host: 'peer1', capabilities: [{ capability: 'httpPort', port: 8080 }] }
                ]
            })
        });
        
        await kernel.init();
        
        // Clear previous calls
        (global.fetch as any).mockClear();
        
        // Mock new peers response
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({
                servers: [
                    { host: 'peer1', capabilities: [{ capability: 'httpPort', port: 8080 }] },
                    { host: 'peer2', capabilities: [{ capability: 'httpPort', port: 8081 }] }
                ]
            })
        });
        
        // WHEN: kernel.getPeers() called
        await kernel.getPeers();
        
        // THEN: kernel.model.peers contains peer data
        expect(kernel.model.peers).toHaveLength(2);
    });
});

// ========================================
// Suite 5: Polling Mechanism
// ========================================

describe('BrowserONCEKernel - Polling (Blackbox)', () => {
    
    test('should start polling on init', async () => {
        // GIVEN: Kernel initialized
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        // Spy on setInterval
        const setIntervalSpy = vi.spyOn(global, 'setInterval');
        
        // WHEN: init() called
        await kernel.init();
        
        // THEN: setInterval called (polling started)
        expect(setIntervalSpy).toHaveBeenCalledWith(
            expect.any(Function),
            5000  // 5 second interval
        );
    });
});

// ========================================
// Suite 6: Message Tracking
// ========================================

describe('BrowserONCEKernel - Message Tracking (Blackbox)', () => {
    
    test('should add informational message to log', async () => {
        // GIVEN: Initialized kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // WHEN: kernel.addMessage('info', 'Test message')
        kernel.addMessage('connection', 'Test message from blackbox test');
        
        // THEN: Message appears in DOM
        const logEl = document.getElementById('messageLog');
        expect(logEl.innerHTML).toContain('Test message from blackbox test');
    });
    
    test('should display message with timestamp', async () => {
        // GIVEN: Initialized kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // WHEN: Message added
        kernel.addMessage('connection', 'Timestamped message');
        
        // THEN: Message has timestamp
        const logEl = document.getElementById('messageLog');
        expect(logEl.innerHTML).toMatch(/\[\d{2}:\d{2}:\d{2}\]/);  // [HH:MM:SS]
    });
});

// ========================================
// Suite 7: Radical OOP Compliance
// ========================================

describe('BrowserONCEKernel - Radical OOP (Blackbox)', () => {
    
    test('should have empty constructor', () => {
        // GIVEN: BrowserONCEKernel class
        // WHEN: constructor() examined
        const kernel = new BrowserONCEKernel();
        
        // THEN: Only sets this.model = null (no logic)
        expect(kernel.model).toBeNull();
    });
    
    test('should store all state in model property', async () => {
        // GIVEN: Initialized kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        // WHEN: kernel.model inspected
        await kernel.init();
        
        // THEN: All state present (kernel, peerHost, peers, etc.)
        expect(kernel.model).toBeDefined();
        expect(kernel.model.kernel).toBeDefined();
        expect(kernel.model.peerHost).toBeDefined();
        expect(kernel.model.peers).toBeDefined();
        expect(kernel.model.stats).toBeDefined();
        expect(kernel.model.elements).toBeDefined();
        expect(kernel.model.isConnected).toBeDefined();
    });
    
    test('should expose only methods (no arrow functions)', () => {
        // GIVEN: BrowserONCEKernel class
        const kernel = new BrowserONCEKernel();
        
        // WHEN: prototype inspected
        const proto = Object.getPrototypeOf(kernel);
        const methods = Object.getOwnPropertyNames(proto).filter(
            name => name !== 'constructor' && typeof proto[name] === 'function'
        );
        
        // THEN: All members are proper methods
        expect(methods.length).toBeGreaterThan(0);
        expect(methods).toContain('init');
        expect(methods).toContain('connect');
        expect(methods).toContain('getHealth');
        expect(methods).toContain('getPeers');
    });
    
    test('should not have arrow function properties', () => {
        // GIVEN: BrowserONCEKernel instance
        const kernel = new BrowserONCEKernel();
        
        // WHEN: Own properties inspected
        const ownProps = Object.getOwnPropertyNames(kernel);
        
        // THEN: No arrow functions (only 'model' property)
        expect(ownProps).toHaveLength(1);
        expect(ownProps[0]).toBe('model');
    });
});

// ========================================
// Suite 8: Clear Log Function
// ========================================

describe('BrowserONCEKernel - Log Management (Blackbox)', () => {
    
    test('should clear message log', async () => {
        // GIVEN: Kernel with messages in log
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        kernel.addMessage('connection', 'Message 1');
        kernel.addMessage('connection', 'Message 2');
        
        const logEl = document.getElementById('messageLog');
        const messageCountBefore = logEl.children.length;
        expect(messageCountBefore).toBeGreaterThan(2);
        
        // WHEN: clearLog() called
        kernel.clearLog();
        
        // THEN: Log is cleared (only "Log cleared" message remains)
        const messageCountAfter = logEl.children.length;
        expect(messageCountAfter).toBe(1);
        expect(logEl.innerHTML).toContain('Log cleared');
    });
});

