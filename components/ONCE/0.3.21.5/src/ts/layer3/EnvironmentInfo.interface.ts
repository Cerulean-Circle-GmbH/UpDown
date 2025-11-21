/**
 * Environment information for platform detection
 * 
 * @layer3
 * @pattern Interface Contract
 * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md
 */
export interface EnvironmentInfo {
    platform: 'browser' | 'node' | 'worker' | 'service-worker' | 'pwa' | 'iframe';
    version: string;
    capabilities: string[];
    isOnline: boolean;
    hostname?: string;  // New in v0.2.0.0
    ip?: string;       // New in v0.2.0.0
}

