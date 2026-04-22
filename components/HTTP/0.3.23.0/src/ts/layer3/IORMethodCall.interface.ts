/**
 * IORMethodCall.interface.ts
 * 
 * Parsed IOR Method Call
 * Extracted from URL path: /{component}/{version}/{uuid}/{method}
 * 
 * @layer3
 * @pattern Interface Contract
 * Web4 P19: One File One Type
 * @pdca session/2025-12-17-UTC-1613.web4-principles-review.pdca.md Fix 4
 */

/**
 * IORMethodCall
 * Represents a parsed Internet Object Reference method call
 */
export interface IORMethodCall {
    componentName: string;
    componentVersion: string;
    instanceUuid: string;
    methodName: string;
    params: Record<string, string>;
}

