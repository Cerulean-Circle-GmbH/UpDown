/**
 * ReferenceState - Enum for reference state tracking
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P32: Enums Over String Literals
 * - P34: IOR as Unified Entry Point
 * 
 * State Machine:
 * - NULL: No value, no IOR
 * - LOCAL: Value available immediately
 * - REMOTE: IOR set, needs resolution
 * - RESOLVING: Resolution in progress (async, non-blocking)
 * - RESOLVED: Resolution complete, value cached
 * 
 * @layer3
 * @pdca 2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md
 */

/**
 * ReferenceState - Possible states of a Reference/IOR
 */
export enum ReferenceState {
    /** No value, no IOR */
    NULL = 'NULL',
    /** Local value available immediately */
    LOCAL = 'LOCAL',
    /** Remote IOR set, needs resolution */
    REMOTE = 'REMOTE',
    /** Resolution in progress (async, non-blocking) */
    RESOLVING = 'RESOLVING',
    /** Resolution complete, value cached */
    RESOLVED = 'RESOLVED'
}

