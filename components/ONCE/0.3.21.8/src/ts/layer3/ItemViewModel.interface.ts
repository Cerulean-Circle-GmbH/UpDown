/**
 * ItemViewModel - Model interface for item views
 * 
 * Defines the required and optional attributes for items
 * displayed in list/grid views.
 * 
 * ✅ Web4 Principle 1: Everything is a Scenario
 * ✅ Web4 Principle 5: Reference<T> for nullable
 * ✅ Web4 Principle 19: One File One Type
 * 
 * @pdca 2025-12-09-UTC-1800.ucpview-framework-independence.pdca.md
 */

import type { Model } from './Model.interface.js';
import type { Reference } from './Reference.interface.js';

/**
 * ItemViewModel - Required attributes for ItemView display
 */
export interface ItemViewModel extends Model {
  // name and uuid inherited from Model (required)
  
  /** Short description */
  description?: string;
  
  /** Icon identifier (FontAwesome) */
  icon?: string;
  
  /** Badge - count or status indicator */
  badge?: Reference<string | number>;
}
