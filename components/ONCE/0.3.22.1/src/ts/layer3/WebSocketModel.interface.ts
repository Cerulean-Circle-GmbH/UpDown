/**
 * WebSocketModel.interface.ts - WebSocket Component Model
 * 
 * Defines the model for WebSocket connection state.
 * Used as UcpModel demonstrator for real-time reactive updates.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable
 * - P16: TypeScript interfaces
 * 
 * @layer3
 * @pdca 2025-12-12-UTC-2300.i13-websocket-component.pdca.md
 */

import type { Model } from './Model.interface.js';
import type { Reference } from './Reference.interface.js';

/**
 * WebSocket connection states
 */
export enum WebSocketState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  OPEN = 'OPEN',
  CLOSING = 'CLOSING',
  CLOSED = 'CLOSED'
}

/**
 * WebSocket component model
 */
export interface WebSocketModel extends Model {
  /** Unique identifier */
  uuid: string;
  
  /** WebSocket endpoint URL (e.g., "wss://host:port/") */
  url: string;
  
  /** Current connection state */
  state: WebSocketState;
  
  /** Number of reconnection attempts made */
  reconnectAttempts: number;
  
  /** Maximum reconnection attempts before giving up */
  maxReconnectAttempts: number;
  
  /** Last error message (null if no error) */
  lastError: Reference<string>;
  
  /** Timestamp of last received message */
  lastMessageTime: Reference<Date>;
  
  /** Timestamp when connection was established */
  connectedAt: Reference<Date>;
}





