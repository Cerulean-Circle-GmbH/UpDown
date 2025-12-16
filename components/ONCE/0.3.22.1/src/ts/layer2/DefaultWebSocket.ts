/**
 * DefaultWebSocket.ts - WebSocket connection as UcpComponent
 * 
 * Demonstrates UcpModel reactive updates:
 * - this.model.state = X triggers immediate view updates
 * - Connection status visible in real-time
 * 
 * Web4 Principles:
 * - P4: Radical OOP (no arrow functions)
 * - P5: Reference<T> for nullable
 * - P6: Empty constructor
 * - P7: Layer 2 is SYNCHRONOUS
 * 
 * @layer2
 * @pdca 2025-12-12-UTC-2300.i13-websocket-component.pdca.md
 */

import { UcpComponent } from './UcpComponent.js';
import { WebSocketModel, WebSocketState } from '../layer3/WebSocketModel.interface.js';
import type { Reference } from '../layer3/Reference.interface.js';

/**
 * DefaultWebSocket - WebSocket connection as UcpComponent
 * 
 * Demonstrates UcpModel reactive updates:
 * - this.model.state = X triggers immediate view updates
 * - Connection status visible in real-time
 */
export class DefaultWebSocket extends UcpComponent<WebSocketModel> {
  
  /** Native WebSocket instance */
  private ws: Reference<WebSocket> = null;
  
  /** Reconnect timer */
  private reconnectTimer: Reference<ReturnType<typeof setTimeout>> = null;
  
  /**
   * Empty constructor - Web4 Principle 6
   */
  constructor() {
    super();
  }
  
  /**
   * Default model for WebSocket component
   */
  protected modelDefault(): WebSocketModel {
    return {
      uuid: crypto.randomUUID(),
      name: 'WebSocket',
      url: '',
      state: WebSocketState.DISCONNECTED,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      lastError: null,
      lastMessageTime: null,
      connectedAt: null
    };
  }
  
  /**
   * Connect to WebSocket endpoint
   * State changes trigger immediate view updates via UcpModel
   */
  connect(): void {
    if (this.ws) {
      this.disconnect();
    }
    
    // State change → view updates automatically via UcpModel proxy
    this.model.state = WebSocketState.CONNECTING;
    this.model.lastError = null;
    
    try {
      this.ws = new WebSocket(this.model.url);
      
      // Bind handlers (no arrow functions - Web4 P4)
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      
    } catch (error) {
      this.model.state = WebSocketState.DISCONNECTED;
      this.model.lastError = error instanceof Error ? error.message : String(error);
    }
  }
  
  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.model.state = WebSocketState.CLOSING;
      this.ws.close();
      this.ws = null;
    }
  }
  
  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('✅ WebSocket connected');
    
    // All these trigger immediate view updates via UcpModel proxy
    this.model.state = WebSocketState.OPEN;
    this.model.reconnectAttempts = 0;
    this.model.connectedAt = new Date();
    this.model.lastError = null;
  }
  
  /** Message callback (set via onMessage) */
  private messageCallback: Reference<(data: string) => void> = null;
  
  /**
   * Set message handler callback
   */
  onMessage(callback: (data: string) => void): void {
    this.messageCallback = callback;
  }
  
  /**
   * Handle incoming message
   */
  private handleMessage(event: MessageEvent): void {
    this.model.lastMessageTime = new Date();
    
    // Call message handler if registered
    if (this.messageCallback) {
      this.messageCallback(event.data);
    }
  }
  
  /**
   * Handle WebSocket error
   */
  private handleError(_event: Event): void {
    console.error('❌ WebSocket error');
    this.model.lastError = 'Connection error';
  }
  
  /**
   * Handle WebSocket close - attempt reconnect
   */
  private handleClose(): void {
    console.log('📡 WebSocket connection closed');
    
    this.ws = null;
    this.model.state = WebSocketState.DISCONNECTED;
    this.model.connectedAt = null;
    
    // Attempt reconnect if not at max attempts
    this.attemptReconnect();
  }
  
  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.model.reconnectAttempts < this.model.maxReconnectAttempts) {
      this.model.reconnectAttempts++;
      
      const delay = 2000 * this.model.reconnectAttempts;
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.model.reconnectAttempts}/${this.model.maxReconnectAttempts})`);
      
      this.reconnectTimer = setTimeout(
        this.connect.bind(this),
        delay
      );
    }
  }
  
  /**
   * Send message through WebSocket
   * @returns true if message was sent, false otherwise
   */
  send(data: string | object): boolean {
    if (this.ws && this.model.state === WebSocketState.OPEN) {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(message);
      return true;
    }
    return false;
  }
  
  /**
   * Get native WebSocket (for advanced use)
   */
  get socket(): Reference<WebSocket> {
    return this.ws;
  }
}







