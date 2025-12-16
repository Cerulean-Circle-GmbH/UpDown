/**
 * RewriteRule.interface.ts - Rule for header/href rewriting
 * 
 * Used by ProxyRoute and ReverseProxyRoute for:
 * - Request header rewriting
 * - Response header rewriting
 * - HTML href rewriting
 * 
 * @component Router
 * @layer 3
 * @pdca 2025-12-12-UTC-1545.proxy-routes-radical-oop.pdca.md PX.1
 * Web4 P19: One file, one type
 */

/**
 * Rewrite operation type
 * - set: Set header to value (replaces existing)
 * - add: Add to header (appends to existing)
 * - remove: Remove header
 * - replace: Replace pattern in value
 */
export type RewriteOperation = 'set' | 'add' | 'remove' | 'replace';

/**
 * RewriteRule - Single rule for header/href rewriting
 */
export interface RewriteRule {
    /** Operation type */
    operation: RewriteOperation;
    
    /** Target (header name or URL pattern) */
    target: string;
    
    /** Value for set/add/replace (supports ${variables}) */
    value?: string;
    
    /** Pattern for replace operation (regex) */
    pattern?: string;
}









