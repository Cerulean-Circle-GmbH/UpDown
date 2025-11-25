/**
 * BrowserONCEKernelModel - Browser/PWA ONCE Kernel Model
 * 
 * Extends ONCEKernelModel with browser-specific state
 * 
 * @layer3
 * @pattern Interface Contract
 * @pdca session/2025-11-25-UTC-1750.iteration-01.9-browser-html-uses-once-ts.pdca.md
 */

import type { ONCEKernelModel } from './ONCEKernelModel.interface.js';

export interface BrowserONCEKernelModel extends ONCEKernelModel {
    // P2P connection info (browser-specific)
    peerHost: string;
    peerUUID: string | null;
    peerVersion: string;
    isConnected: boolean;
    
    // Primary peer reference
    primaryPeer: {
        host: string;
        port: number;
        uuid: string;
    } | null;
    
    // WebSocket connection
    ws: WebSocket | null;
    
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

