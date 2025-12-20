/**
 * Reference<T> - Type-safe nullable reference wrapper
 * Web4 pattern: All references are nullable by default
 * 
 * BACKWARDS COMPATIBLE TYPE ALIAS
 * For new code, consider using DefaultReference<T> which supports:
 * - Local values (immediate access)
 * - Remote IOR references (async resolution)
 * 
 * Usage (legacy): Reference<DefaultWeb4TSComponent> = DefaultWeb4TSComponent | null
 * Usage (new): DefaultReference<T>.initLocal(value) or .initRemote(iorString)
 * 
 * Why: Makes nullable references explicit and type-safe
 * Eliminates `any` type usage for component references
 * 
 * @pdca 2025-10-31-UTC-1727.pdca.md - Planned (never implemented)
 * @pdca 2025-11-05-UTC-1158.pdca.md - Implemented
 * @pdca 2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md - Extended with DefaultReference class
 * @see DefaultReference - Full class implementation in layer2/DefaultReference.ts
 */
export type Reference<T> = T | null;

// Re-export DefaultReference for convenience
// Usage: import { Reference, DefaultReference } from '../layer3/Reference.interface.js';
export { DefaultReference, ReferenceState } from '../layer2/DefaultReference.js';

