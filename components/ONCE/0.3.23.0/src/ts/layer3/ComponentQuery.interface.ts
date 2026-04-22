/**
 * Component discovery query parameters
 * 
 * @layer3
 * @pattern Interface Contract
 * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md
 */
export interface ComponentQuery {
    name?: string;
    version?: string;
    type?: string;
    capabilities?: string[];
    domain?: string;    // New in v0.2.0.0
}

