/**
 * ONCEKernelModel - Base model interface for all ONCE kernels
 * 
 * Extends Model (Web4 principle: all models extend base Model)
 * 
 * Shared state properties across all environments:
 * - Node.js (ONCEServerModel extends this)
 * - Browser (ONCEBrowserModel extends this)
 * - Worker (ONCEWorkerModel extends this)
 * - Service Worker (ONCESWModel extends this)
 * 
 * @layer3
 * @pattern Interface Contract
 * @pdca session/2025-11-22-UTC-2200.iteration-01.8-unified-kernel-architecture.pdca.md
 */

import type { Model } from './Model.interface.js';
import type { EnvironmentInfo } from './EnvironmentInfo.interface.js';
import type { Reference } from './Reference.interface.js';

export interface ONCEKernelModel extends Model {
    // Identity (uuid, name inherited from Model)
    version: string;
    
    // Environment
    environment: EnvironmentInfo;
    
    // P2P Network
    peers: any[]; // Connected peer kernels
    
    // Lifecycle
    connectionTime: Reference<Date>;
    startTime: Reference<Date>;
    
    // Statistics
    stats: {
        messagesSent: number;
        messagesReceived: number;
        errorsCount: number;
        [key: string]: number; // Allow additional stats
    };
    
    // Component management
    components?: Map<string, any>; // Registered components
    
    // Optional metadata
    metadata?: Record<string, any>;
}

