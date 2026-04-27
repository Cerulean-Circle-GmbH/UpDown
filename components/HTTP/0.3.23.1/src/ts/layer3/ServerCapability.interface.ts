/**
 * Server Capability Definition
 * 
 * @layer3
 * @pattern Interface Contract
 * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md
 */
export interface ServerCapability {
    capability: string;  // 'httpPort', 'httpsPort', 'wsPort', 'p2pPort'
    port: number;
}

