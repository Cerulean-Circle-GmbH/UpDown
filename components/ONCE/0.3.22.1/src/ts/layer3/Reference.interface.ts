/**
 * Reference<T> - Type-safe nullable reference wrapper
 * Web4 pattern: All references are nullable by default
 * 
 * This is the SIMPLE type alias for backwards compatibility.
 * For remote resolution, use IOR<T> from layer4/IOR.ts
 * 
 * Usage: Reference<DefaultWeb4TSComponent> = DefaultWeb4TSComponent | null
 * 
 * @layer3
 * @pdca 2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md
 */

/**
 * Simple nullable type alias (backwards compatible)
 * 
 * Use this for local references that don't need remote resolution.
 * For remote references, use IOR<T> from layer4/IOR.ts
 */
export type Reference<T> = T | null;

// Re-export ReferenceState for use with IOR
export { ReferenceState } from './ReferenceState.enum.js';

// IOR<T> is the unified Reference implementation (local + remote)
// Import from layer4/IOR.ts: import { IOR } from './layer4/IOR.js';
