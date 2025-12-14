/**
 * ItemView.ts - Re-exports for backward compatibility
 * 
 * @deprecated Use OncePeerItemView directly for ONCE peers
 * @deprecated Use DefaultItemView as base for custom item views
 * 
 * @ior ior:esm:/ONCE/{version}/ItemView
 * @pdca 2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md
 */

// Re-export for backward compatibility
export { OncePeerItemView as ItemView } from './OncePeerItemView.js';
export { OncePeerItemView } from './OncePeerItemView.js';
export { DefaultItemView } from './DefaultItemView.js';

