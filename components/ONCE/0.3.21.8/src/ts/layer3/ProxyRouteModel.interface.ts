/**
 * ProxyRouteModel.interface.ts - Model for proxy routes
 * 
 * Extends RouteModel with proxy-specific configuration.
 * Used by ProxyRoute (forward) and ReverseProxyRoute.
 * 
 * @component Router
 * @layer 3
 * @pdca 2025-12-12-UTC-1545.proxy-routes-radical-oop.pdca.md PX.1
 * Web4 P19: One file, one type
 */

import { RouteModel } from './RouteModel.interface.js';
import { RewriteRule } from './RewriteRule.interface.js';

/**
 * Load balancing strategy for multiple upstreams
 */
export type LoadBalancingStrategy = 'round-robin' | 'least-connections' | 'random';

/**
 * ProxyRouteModel - Configuration for proxy routes
 */
export interface ProxyRouteModel extends RouteModel {
    /** Primary upstream server URL */
    upstream: string;
    
    /** Multiple upstream servers for load balancing */
    upstreams?: string[];
    
    /** Load balancing strategy (default: round-robin) */
    loadBalancing?: LoadBalancingStrategy;
    
    /** Request header rewrite rules (before forwarding) */
    requestHeaderRules?: RewriteRule[];
    
    /** Response header rewrite rules (before returning) */
    responseHeaderRules?: RewriteRule[];
    
    /** Response body href rewrite rules (for HTML) */
    hrefRules?: RewriteRule[];
    
    /** Timeout in milliseconds (default: 30000) */
    timeout?: number;
    
    /** Preserve original Host header? (default: false) */
    preserveHost?: boolean;
    
    /** Follow HTTP redirects? (default: false) */
    followRedirects?: boolean;
    
    /** Strip path prefix before forwarding */
    stripPrefix?: string;
    
    /** Add path prefix before forwarding */
    addPrefix?: string;
    
    /** Enable WebSocket proxying? (default: false) */
    websocket?: boolean;
}




















