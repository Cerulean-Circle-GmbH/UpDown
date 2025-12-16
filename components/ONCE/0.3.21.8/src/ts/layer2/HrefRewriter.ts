/**
 * HrefRewriter.ts - Rewrites URLs in HTML response bodies
 * 
 * Radical OOP: HrefRewriter knows how to rewrite hrefs.
 * Used by ReverseProxyRoute for rewriting internal URLs in HTML.
 * 
 * @component Router
 * @layer 2
 * @pdca 2025-12-12-UTC-1545.proxy-routes-radical-oop.pdca.md PX.3
 * Web4 P4: No arrow functions
 * Web4 P6: Empty constructor
 */

import { RewriteRule } from '../layer3/RewriteRule.interface.js';

/**
 * HrefRewriter - Rewrites URLs in HTML bodies
 * 
 * Rewrites href="...", src="...", and action="..." attributes
 * based on rewrite rules.
 */
export class HrefRewriter {
    
    constructor() {
        // Empty constructor - Web4 P6
    }
    
    /**
     * Rewrite URLs in HTML body
     * Web4 P4: Uses for...of loop
     * 
     * @param body - HTML body string
     * @param rules - Rewrite rules to apply
     * @returns Rewritten HTML body
     */
    public rewrite(body: string, rules: RewriteRule[]): string {
        let result = body;
        
        for (const rule of rules) {
            result = this.ruleApply(result, rule);
        }
        
        return result;
    }
    
    /**
     * Apply single href rewrite rule
     * 
     * Only 'replace' operation is supported for href rewriting:
     * - pattern: regex to match in href/src/action values
     * - value: replacement string
     */
    private ruleApply(body: string, rule: RewriteRule): string {
        if (rule.operation !== 'replace' || !rule.pattern || !rule.value) {
            return body;
        }
        
        // Replace in href="...", src="...", and action="..." attributes
        // Captures: $1 = attribute name, $2 = matched pattern, $3 = rest of URL
        const pattern = new RegExp(
            `(href|src|action)=["']${rule.pattern}([^"']*)["']`,
            'gi'
        );
        
        return body.replace(pattern, `$1="${rule.value}$2"`);
    }
    
    /**
     * Rewrite absolute URLs to relative
     * Utility method for common use case
     * 
     * @param body - HTML body
     * @param fromHost - Host to rewrite from (e.g., "http://backend:8080")
     * @param toPath - Path prefix to rewrite to (e.g., "/api")
     */
    public absoluteToRelativeRewrite(body: string, fromHost: string, toPath: string): string {
        const rule: RewriteRule = {
            operation: 'replace',
            target: 'href',  // Not used but required by interface
            pattern: fromHost.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),  // Escape regex special chars
            value: toPath
        };
        
        return this.ruleApply(body, rule);
    }
}





