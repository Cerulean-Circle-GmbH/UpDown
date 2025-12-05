/**
 * ItemViewModel.interface.ts - Model interface for ItemView
 * 
 * Defines the shape of models that ItemView can display.
 * All properties are optional to support partial models.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable badge
 * - P19: One File One Type
 * - NO 'any' types - proper typed interface
 * 
 * @ior ior:esm:/ONCE/{version}/ItemViewModel
 * @pdca 2025-12-05-UTC-1800.a1-1-core-interfaces.pdca.md
 */

import { Reference } from './Reference.interface.js';

/**
 * ItemViewModel - Model for compact item views
 * 
 * Used by ItemView to display items in lists or grids.
 * All properties are optional to allow partial models.
 */
export interface ItemViewModel {
  /** Display name - primary identifier */
  name?: string;
  
  /** Short description - secondary text */
  description?: string;
  
  /** Badge - count or status indicator (e.g., children count) */
  badge?: Reference<string | number>;
  
  /** Icon identifier - FontAwesome or Lit-compatible icon */
  icon?: string;
}


