/**
 * EnvironmentType - Enum for ONCE execution environments
 * 
 * Web4 Principle: Use enums instead of string literals
 * 
 * @layer3
 * @pattern Enum Type
 * @pdca session/2025-11-22-UTC-2200.iteration-01.8-unified-kernel-architecture.pdca.md
 */

export enum EnvironmentType {
    NODE = 'nodejs',
    BROWSER = 'browser',
    WORKER = 'worker',
    SERVICE_WORKER = 'service-worker',
    PWA = 'pwa',
    IFRAME = 'iframe'
}

