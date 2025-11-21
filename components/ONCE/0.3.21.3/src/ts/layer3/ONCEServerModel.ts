/**
 * ONCE Server Model v0.2.0.0 - Enhanced server state model
 * Implements requirement 471d2d0a-4914-4900-9aed-74b69e032679
 * 
 * ⚠️ DEPRECATED: This file now serves as a re-export hub for backward compatibility.
 * New code should import directly from the specific files.
 * 
 * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md
 */

// Re-exports for backward compatibility
export type { ONCEServerModel } from './ONCEServerModel.interface.js';
export type { ServerCapability } from './ServerCapability.interface.js';

// Import for deprecated function
import type { ONCEServerModel } from './ONCEServerModel.interface.js';
import { LifecycleState } from './LifecycleState.enum.js';

// Re-export necessary dependencies for backward compatibility
export { LifecycleState } from './LifecycleState.enum.js';

/**
 * ⚠️ DEPRECATED: Configuration as constants violates Web4 "Everything is a Scenario" principle
 * These values should be set in init() methods as scenario defaults, not as separate config
 * @deprecated Use scenario-based initialization in component init() methods
 * @see session/2025-11-19-UTC-1745.component-refactor-final.pdca.md - Web4 Principles
 */
export const ONCE_DEFAULT_CONFIG = {
    /** Default primary server port */
    PRIMARY_PORT: 42777,
    
    /** Default fallback port range start */
    FALLBACK_PORT_START: 8080,
    
    /** Default reverse domain */
    DEFAULT_DOMAIN: 'local.once',
    
    /** Default IP fallback */
    DEFAULT_IP: '127.0.0.1',
    
    /** Maximum port scan range */
    MAX_PORT_SCAN: 100
} as const;

/**
 * ⚠️ DEPRECATED: Functional factory function violates TRUE Radical OOP
 * Use class constructors and init() methods following Web4 empty constructor pattern
 * @deprecated Use `new ServerHierarchyManager().init(scenario)` pattern instead
 * @see session/2025-11-19-UTC-1745.component-refactor-final.pdca.md - Web4 Patterns
 */
export function createDefaultServerModel(): Partial<ONCEServerModel> {
    return {
        pid: process.pid,
        state: LifecycleState.CREATED,
        domain: ONCE_DEFAULT_CONFIG.DEFAULT_DOMAIN,
        host: 'localhost', // Will be detected at runtime
        ip: ONCE_DEFAULT_CONFIG.DEFAULT_IP,
        capabilities: [],
        isPrimaryServer: false
    };
}

