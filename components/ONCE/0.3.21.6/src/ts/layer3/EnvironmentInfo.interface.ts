/**
 * Environment information for platform detection
 * 
 * Supports all ONCE kernel environments:
 * - Node.js (npm server)
 * - Browser (window context)
 * - Web Worker (dedicated worker)
 * - Service Worker (PWA/offline)
 * - PWA (progressive web app)
 * - iframe (embedded context)
 * 
 * @layer3
 * @pattern Interface Contract
 * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md
 */

// Type aliases (not enums - Web4 principle)
type EnvironmentType = 'nodejs' | 'browser' | 'worker' | 'service-worker' | 'pwa' | 'iframe';

export interface EnvironmentInfo {
    // Environment type
    type: EnvironmentType;
    
    // Boolean flags for easy checks
    isNode: boolean;
    isBrowser: boolean;
    isWorker: boolean;
    isServiceWorker: boolean;
    isPWA: boolean;
    isIframe: boolean;
    
    // Version and capabilities
    version: string;
    capabilities: string[];
    
    // Network state
    isOnline: boolean;
    
    // Optional network info (Node.js only)
    hostname?: string;
    ip?: string;
}


