/**
 * Performance metrics for ONCE kernel
 * 
 * @layer3
 * @pattern Interface Contract
 * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md
 */
export interface PerformanceMetrics {
    initializationTime: number;
    memoryUsage: number;
    componentsLoaded: number;
    peersConnected: number;
    scenariosExchanged: number;
    serversRegistered?: number;  // New in v0.2.0.0
}

