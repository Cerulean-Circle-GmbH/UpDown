/**
 * HeaderRewriter.ts - Rewrites HTTP headers based on rules
 * 
 * Radical OOP: HeaderRewriter knows how to rewrite headers.
 * Used by ProxyRoute and ReverseProxyRoute.
 * 
 * @component Router
 * @layer 2
 * @pdca 2025-12-12-UTC-1545.proxy-routes-radical-oop.pdca.md PX.2
 * Web4 P4: No arrow functions
 * Web4 P6: Empty constructor + init()
 */

import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { RewriteRule } from '../layer3/RewriteRule.interface.js';

/**
 * Context for variable substitution in rewrite rules
 */
export interface RewriteContext {
    /** Client IP address */
    clientIp?: string;
    
    /** Original Host header */
    originalHost?: string;
    
    /** Original request URL */
    originalUrl?: string;
    
    /** Protocol (http or https) */
    protocol?: 'http' | 'https';
}

/**
 * HeaderRewriter - Rewrites HTTP headers
 * 
 * Radical OOP: HeaderRewriter is responsible for header rewriting logic.
 */
export class HeaderRewriter {
    
    constructor() {
        // Empty constructor - Web4 P6
    }
    
    /**
     * Rewrite headers based on rules
     * Web4 P4: Uses for...of loop, not forEach with arrow
     * 
     * @param headers - Original headers
     * @param rules - Rewrite rules to apply
     * @param context - Context for variable substitution
     * @returns New headers object with rules applied
     */
    public rewrite(
        headers: IncomingHttpHeaders | OutgoingHttpHeaders,
        rules: RewriteRule[],
        context: RewriteContext
    ): OutgoingHttpHeaders {
        const result = { ...headers } as OutgoingHttpHeaders;
        
        for (const rule of rules) {
            this.ruleApply(result, rule, context);
        }
        
        return result;
    }
    
    /**
     * Apply single rewrite rule
     * Web4 P4: Method, not arrow function
     */
    private ruleApply(
        headers: OutgoingHttpHeaders,
        rule: RewriteRule,
        context: RewriteContext
    ): void {
        const targetLower = rule.target.toLowerCase();
        const value = rule.value ? this.variableSubstitute(rule.value, context) : undefined;
        
        switch (rule.operation) {
            case 'set':
                headers[targetLower] = value;
                break;
                
            case 'add':
                const existing = headers[targetLower];
                if (existing) {
                    headers[targetLower] = `${existing}, ${value}`;
                } else {
                    headers[targetLower] = value;
                }
                break;
                
            case 'remove':
                delete headers[targetLower];
                break;
                
            case 'replace':
                if (rule.pattern && value) {
                    const current = headers[targetLower];
                    if (typeof current === 'string') {
                        headers[targetLower] = current.replace(
                            new RegExp(rule.pattern, 'g'),
                            value
                        );
                    }
                }
                break;
        }
    }
    
    /**
     * Substitute ${variables} in value
     * 
     * Supported variables:
     * - ${client.ip} - Client IP address
     * - ${original.host} - Original Host header
     * - ${original.url} - Original request URL
     * - ${protocol} - Protocol (http/https)
     */
    private variableSubstitute(value: string, context: RewriteContext): string {
        return value
            .replace(/\$\{client\.ip\}/g, context.clientIp || '')
            .replace(/\$\{original\.host\}/g, context.originalHost || '')
            .replace(/\$\{original\.url\}/g, context.originalUrl || '')
            .replace(/\$\{protocol\}/g, context.protocol || 'http');
    }
}




