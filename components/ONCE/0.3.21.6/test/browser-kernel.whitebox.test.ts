/**
 * Whitebox Tests for BrowserONCEKernel
 * 
 * Tests the internal implementation of BrowserONCEKernel with knowledge of internals.
 * Focus: How the kernel WORKS (developer perspective)
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
// Suite 1: Model Initialization
// ========================================

describe('BrowserONCEKernel - Model Initialization (Whitebox)', () => {
    
    test('should initialize model with all required properties', async () => {
        // GIVEN: Kernel instance
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        // WHEN: init() called
        await kernel.init();
        
        // THEN: model contains all required properties
        expect(kernel.model).toMatchObject({
            kernel: null,  // window.global.ONCE
            peerHost: expect.any(String),
            peerUUID: expect.any(String),
            peerVersion: expect.any(String),
            isConnected: expect.any(Boolean),
            connectionTime: expect.any(Date),
            peers: expect.any(Array),
            primaryPeer: null,
            stats: {
                messagesSent: expect.any(Number),
                messagesReceived: expect.any(Number),
                acknowledgmentsSent: expect.any(Number)
            },
            elements: expect.any(Object)
        });
    });
    
    test('should set connectionTime during init', async () => {
        // GIVEN: Kernel instance
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        const beforeTime = new Date();
        
        // WHEN: init() called
        await kernel.init();
        
        const afterTime = new Date();
        
        // THEN: model.connectionTime is Date object within time range
        expect(kernel.model.connectionTime).toBeInstanceOf(Date);
        expect(kernel.model.connectionTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
        expect(kernel.model.connectionTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
    
    test('should initialize empty array for peers', async () => {
        // GIVEN: Kernel instance
        const kernel = new BrowserONCEKernel();
        
        // Mock responses - no peers
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ servers: [] })
        });
        
        // WHEN: init() called
        await kernel.init();
        
        // THEN: model.peers = []
        expect(kernel.model.peers).toEqual([]);
    });
    
    test('should initialize stats counters to 0', async () => {
        // GIVEN: Kernel instance
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        // WHEN: init() called
        await kernel.init();
        
        // THEN: model.stats = { sent: 0, received: 0, acknowledgments: 0 }
        expect(kernel.model.stats).toEqual({
            messagesSent: 0,
            messagesReceived: 0,
            acknowledgmentsSent: 0
        });
    });
    
    test('should initialize UI elements references', async () => {
        // GIVEN: Kernel instance
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        // WHEN: init() called
        await kernel.init();
        
        // THEN: model.elements contains DOM references
        expect(kernel.model.elements.connectionStatus).toBe(document.getElementById('connectionStatus'));
        expect(kernel.model.elements.primaryConnection).toBe(document.getElementById('primaryConnection'));
        expect(kernel.model.elements.messageLog).toBe(document.getElementById('messageLog'));
    });
});

// ========================================
// Suite 2: Internal State Transitions
// ========================================

describe('BrowserONCEKernel - State Transitions (Whitebox)', () => {
    
    test('should transition from null model to initialized model', async () => {
        // GIVEN: kernel.model === null
        const kernel = new BrowserONCEKernel();
        expect(kernel.model).toBeNull();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        // WHEN: init() called
        await kernel.init();
        
        // THEN: kernel.model !== null && has all properties
        expect(kernel.model).not.toBeNull();
        expect(kernel.model.peerHost).toBeDefined();
        expect(kernel.model.peers).toBeDefined();
    });
    
    test('should transition isConnected from false to true on success', async () => {
        // GIVEN: Uninitialized kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock successful connection
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        // WHEN: init() completes successfully
        await kernel.init();
        
        // THEN: isConnected transitions to true
        expect(kernel.model.isConnected).toBe(true);
    });
    
    test('should keep isConnected false on connection failure', async () => {
        // GIVEN: Kernel instance
        const kernel = new BrowserONCEKernel();
        
        // Mock connection failure
        (global.fetch as any).mockRejectedValue(new Error('Connection failed'));
        
        // WHEN: init() fails
        await kernel.init();
        
        // THEN: isConnected remains false
        expect(kernel.model.isConnected).toBe(false);
    });
    
    test('should update model.peers when getPeers() succeeds', async () => {
        // GIVEN: Initialized kernel with empty peers
        const kernel = new BrowserONCEKernel();
        
        // Mock init responses
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ servers: [] })
        });
        
        await kernel.init();
        expect(kernel.model.peers).toHaveLength(0);
        
        // Mock new peers data
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({
                servers: [
                    { host: 'peer1', capabilities: [{ capability: 'httpPort', port: 8080 }] }
                ]
            })
        });
        
        // WHEN: getPeers() returns data
        await kernel.getPeers();
        
        // THEN: model.peers array updated
        expect(kernel.model.peers).toHaveLength(1);
        expect(kernel.model.peers[0].host).toBe('peer1');
    });
    
    test('should not crash if getPeers() fails', async () => {
        // GIVEN: Initialized kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock init responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // Mock getPeers failure
        (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
        
        // WHEN: getPeers() throws error
        // THEN: No exception thrown
        await expect(kernel.getPeers()).resolves.not.toThrow();
        
        // AND: model.peers reset to empty array
        expect(kernel.model.peers).toEqual([]);
    });
});

// ========================================
// Suite 3: DOM Manipulation Logic
// ========================================

describe('BrowserONCEKernel - DOM Updates (Whitebox)', () => {
    
    test('should update connectionStatus element with correct text for healthy', async () => {
        // GIVEN: Initialized kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // WHEN: updateHealthDisplay({ status: 'healthy' }) called
        kernel.updateHealthDisplay({ status: 'healthy' });
        
        // THEN: Element text contains 🟢 and Connected
        const el = document.getElementById('connectionStatus');
        expect(el.textContent).toContain('🟢');
        expect(el.textContent).toContain('Connected');
        expect(el.style.color).toBe('#0f0');
    });
    
    test('should update connectionStatus element for unhealthy', async () => {
        // GIVEN: Initialized kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // WHEN: updateHealthDisplay({ status: 'unhealthy' }) called
        kernel.updateHealthDisplay({ status: 'unhealthy', error: 'Connection lost' });
        
        // THEN: Element text contains 🔴 and Disconnected
        const el = document.getElementById('connectionStatus');
        expect(el.textContent).toContain('🔴');
        expect(el.textContent).toContain('Disconnected');
        expect(el.style.color).toBe('#f00');
    });
    
    test('should update peersDisplay with peer count', async () => {
        // GIVEN: Initialized kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // Set peers data
        kernel.model.peers = [
            { host: 'peer1', capabilities: [{ capability: 'httpPort', port: 8080 }] },
            { host: 'peer2', capabilities: [{ capability: 'httpPort', port: 8081 }] }
        ];
        
        // WHEN: updatePeersDisplay() called
        kernel.updatePeersDisplay();
        
        // THEN: DOM shows '2 peers: peer1:8080, peer2:8081'
        const el = document.getElementById('connectedServers');
        expect(el.textContent).toContain('2 peers');
        expect(el.textContent).toContain('peer1:8080');
        expect(el.textContent).toContain('peer2:8081');
    });
    
    test('should show singular "peer" when count is 1', async () => {
        // GIVEN: Initialized kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // Set single peer
        kernel.model.peers = [
            { host: 'peer1', capabilities: [{ capability: 'httpPort', port: 8080 }] }
        ];
        
        // WHEN: updatePeersDisplay() called
        kernel.updatePeersDisplay();
        
        // THEN: Shows "1 peer" (singular)
        const el = document.getElementById('connectedServers');
        expect(el.textContent).toMatch(/1 peer:/);  // Not "1 peers"
    });
    
    test('should handle missing DOM elements gracefully', async () => {
        // GIVEN: Kernel initialized without DOM element
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // Remove DOM element
        document.getElementById('connectionStatus')?.remove();
        kernel.model.elements.connectionStatus = null;
        
        // WHEN: updateHealthDisplay() called
        // THEN: No error thrown
        expect(() => kernel.updateHealthDisplay({ status: 'healthy' })).not.toThrow();
    });
    
    test('should update primaryPeer display when data available', async () => {
        // GIVEN: Initialized kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // Set primary peer
        kernel.model.primaryPeer = {
            host: 'primary.local',
            port: 42777,
            uuid: 'primary-uuid'
        };
        
        // WHEN: updatePrimaryDisplay() called
        kernel.updatePrimaryDisplay();
        
        // THEN: DOM shows primary peer info
        const el = document.getElementById('primaryConnection');
        expect(el.textContent).toContain('Primary: primary.local:42777');
    });
});

// ========================================
// Suite 4: Polling Interval Management
// ========================================

describe('BrowserONCEKernel - Polling Logic (Whitebox)', () => {
    
    test('should set interval timer on startPolling()', async () => {
        // GIVEN: Initialized kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        // Spy on setInterval
        const setIntervalSpy = vi.spyOn(global, 'setInterval');
        
        // Note: startPolling() is called during init()
        await kernel.init();
        
        // WHEN: startPolling() called (already called in init)
        // THEN: setInterval() called with 5000ms
        expect(setIntervalSpy).toHaveBeenCalledWith(
            expect.any(Function),
            5000
        );
    });
    
    test('should call pollUpdates method from interval', async () => {
        // GIVEN: Kernel with mocked methods
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // Spy on pollUpdates
        const pollSpy = vi.spyOn(kernel, 'pollUpdates');
        
        // Extract interval callback
        const setIntervalCall = vi.mocked(global.setInterval).mock.calls[0];
        const callback = setIntervalCall[0] as () => void;
        
        // WHEN: Interval callback fires
        callback();
        
        // THEN: pollUpdates() called
        expect(pollSpy).toHaveBeenCalledTimes(1);
    });
    
    test('should call getHealth() and getPeers() in pollUpdates', async () => {
        // GIVEN: Connected kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // Spy on methods
        const healthSpy = vi.spyOn(kernel, 'getHealth');
        const peersSpy = vi.spyOn(kernel, 'getPeers');
        
        // WHEN: pollUpdates() called
        kernel.pollUpdates();
        
        // THEN: Both methods called
        expect(healthSpy).toHaveBeenCalledTimes(1);
        expect(peersSpy).toHaveBeenCalledTimes(1);
    });
    
    test('should not poll if not connected', async () => {
        // GIVEN: Disconnected kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock connection failure
        (global.fetch as any).mockRejectedValue(new Error('Failed'));
        
        await kernel.init();
        expect(kernel.model.isConnected).toBe(false);
        
        // Spy on methods
        const healthSpy = vi.spyOn(kernel, 'getHealth');
        const peersSpy = vi.spyOn(kernel, 'getPeers');
        
        // WHEN: pollUpdates() called
        kernel.pollUpdates();
        
        // THEN: Methods NOT called (not connected)
        expect(healthSpy).not.toHaveBeenCalled();
        expect(peersSpy).not.toHaveBeenCalled();
    });
});

// ========================================
// Suite 5: Error Handling Paths
// ========================================

describe('BrowserONCEKernel - Error Handling (Whitebox)', () => {
    
    test('should catch and log connection errors', async () => {
        // GIVEN: Network unreachable
        const kernel = new BrowserONCEKernel();
        
        // Mock network error
        (global.fetch as any).mockRejectedValue(new Error('Network unreachable'));
        
        // WHEN: connect() called
        await kernel.connect();
        
        // THEN: Error logged, no exception thrown
        expect(kernel.model.isConnected).toBe(false);
        
        // Check message log contains error
        const logEl = document.getElementById('messageLog');
        expect(logEl.innerHTML).toContain('Connection failed');
    });
    
    test('should handle missing window.global.ONCE', async () => {
        // GIVEN: Kernel without global.ONCE
        const kernel = new BrowserONCEKernel();
        
        // Clear window.global.ONCE
        (window as any).global.ONCE = undefined;
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        // WHEN: init() called
        await kernel.init();
        
        // THEN: kernel.model.kernel is null
        expect(kernel.model.kernel).toBeNull();
    });
    
    test('should handle empty peers response', async () => {
        // GIVEN: Initialized kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ servers: [] })
        });
        
        await kernel.init();
        
        // WHEN: getPeers() returns empty array
        await kernel.getPeers();
        
        // THEN: Handled gracefully
        expect(kernel.model.peers).toEqual([]);
        
        const el = document.getElementById('connectedServers');
        expect(el.textContent).toContain('No peers connected');
    });
});

// ========================================
// Suite 6: Code Coverage Targets
// ========================================

describe('BrowserONCEKernel - Code Coverage (Whitebox)', () => {
    
    test('should cover init() with scenario parameter', async () => {
        // Test with custom scenario
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init({ peerHost: 'custom.local:9999' });
        
        expect(kernel.model.peerHost).toBe('custom.local:9999');
    });
    
    test('should cover init() without scenario parameter', async () => {
        // Test default scenario
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        expect(kernel.model.peerHost).toBe('localhost:42777');  // from JSDOM url
    });
    
    test('should cover addMessage() with different types', async () => {
        // Test all message types
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // Test different message types
        kernel.addMessage('connection', 'Connection message');
        kernel.addMessage('message', 'User message');
        kernel.addMessage('error', 'Error message');
        kernel.addMessage('acknowledgment', 'Ack message');
        
        const logEl = document.getElementById('messageLog');
        expect(logEl.innerHTML).toContain('Connection message');
        expect(logEl.innerHTML).toContain('User message');
        expect(logEl.innerHTML).toContain('Error message');
        expect(logEl.innerHTML).toContain('Ack message');
    });
});

// ========================================
// Suite 7: Connection Time Tracking
// ========================================

describe('BrowserONCEKernel - Connection Time (Whitebox)', () => {
    
    test('should format connection time correctly', async () => {
        // GIVEN: Connected kernel
        const kernel = new BrowserONCEKernel();
        
        // Mock responses
        (global.fetch as any).mockResolvedValue({
            json: async () => ({ status: 'healthy', uuid: 'test-uuid' })
        });
        
        await kernel.init();
        
        // Set connection time to 1 hour, 2 minutes, 3 seconds ago
        const pastTime = new Date();
        pastTime.setHours(pastTime.getHours() - 1);
        pastTime.setMinutes(pastTime.getMinutes() - 2);
        pastTime.setSeconds(pastTime.getSeconds() - 3);
        kernel.model.connectionTime = pastTime;
        
        // WHEN: updateConnectionTime() called
        kernel.updateConnectionTime();
        
        // THEN: Shows formatted time HH:MM:SS
        const el = document.getElementById('connectionTime');
        expect(el.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);  // Format: 01:02:03
    });
});

