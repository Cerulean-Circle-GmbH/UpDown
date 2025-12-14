/**
 * BrowserOnceModel - Browser/PWA ONCE Kernel Model
 * 
 * Extends OnceKernelModel with browser-specific state
 * 
 * @layer3
 * @pattern Interface Contract
 * @pdca session/2025-11-25-UTC-1930.iteration-01.10-once-naming-convention-standardization.pdca.md
 */

import type { ONCEKernelModel } from './ONCEKernelModel.interface.js';
import type { Reference } from './Reference.interface.js';

export interface BrowserOnceModel extends ONCEKernelModel {
    // P2P connection info (browser-specific)
    peerHost: string;
    peerUUID: Reference<string>;
    peerVersion: string;
    isConnected: boolean;
    
    // Primary peer reference
    primaryPeer: Reference<{
        host: string;
        port: number;
        uuid: string;
    }>;
    
    // WebSocket connection
    ws: Reference<WebSocket>;
    
    // Statistics (browser-specific)
    stats: {
        messagesSent: number;
        messagesReceived: number;
        acknowledgmentsSent: number;
        errorsCount: number;
    };
    
    // UI Elements (DOM references)
    elements: {
        connectionStatus: HTMLElement | null;
        primaryConnection: HTMLElement | null;
        connectedPeers: HTMLElement | null;
        messageLog: HTMLElement | null;
        messagesSent: HTMLElement | null;
        messagesReceived: HTMLElement | null;
        acknowledgmentsSent: HTMLElement | null;
        connectionTime: HTMLElement | null;
    };
    
    // Messages cache
    messages: any[];
}

