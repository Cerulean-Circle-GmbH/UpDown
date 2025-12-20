/**
 * ReferenceState - Enum for reference state tracking
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * - P32: Enums Over String Literals
 * 
 * @layer3
 * @pdca 2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md
 */

/**
 * ReferenceState - Possible states of a Reference
 */
export enum ReferenceState {
    /** No value set */
    NULL = 'NULL',
    /** Local value set */
    LOCAL = 'LOCAL',
    /** Remote IOR set */
    REMOTE = 'REMOTE'
}

