/**
 * Action.interface.ts - Web4 Action Interface
 * 
 * @deprecated Use ActionMetadata.interface.ts instead
 * This file is kept for backwards compatibility.
 * 
 * ActionMetadata includes component and action fields for full identification.
 * 
 * @ior ior:esm:/ONCE/{version}/Action
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 */

// Re-export ActionMetadata as Action for backwards compatibility
export type { ActionMetadata as Action } from './ActionMetadata.interface.js';

