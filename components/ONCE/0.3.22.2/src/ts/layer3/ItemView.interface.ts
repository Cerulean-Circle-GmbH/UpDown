/**
 * ItemView.interface.ts - Interface for compact list/grid item views
 * 
 * Enforced Attributes (mapped via TypeScript getters/setters to component model):
 * - name: Display name
 * - description: Short description
 * - badge: Count indicator (e.g., children count)
 * - icon: Icon identifier (FontAwesome or Lit-compatible)
 * 
 * Note: Kept as interface (not JsInterface class) because Lit views
 * need to extend LitElement. TypeScript doesn't support multiple inheritance.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable badge
 * - P16: TypeScript accessors for attribute mapping
 * - P19: One File One Type
 * - P24: RelatedObjects (use concrete view classes for lookup)
 * - NO 'any' - use ItemViewModel
 * 
 * @ior ior:esm:/ONCE/{version}/ItemView
 * @pdca 2025-12-05-UTC-1800.a1-1-core-interfaces.pdca.md
 * @pdca 2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import type { View } from './View.interface.js';
import type { ItemViewModel } from './ItemViewModel.interface.js';
import type { Reference } from './Reference.interface.js';

/**
 * ItemView - Interface for compact item display
 * 
 * Web Component: <web4-{component}-item-view>
 * Attributes feed directly into component model via getters/setters.
 * 
 * Implementations: DefaultItemView (generic), OncePeerItemView (specific)
 * 
 * Note: TModel must extend ItemViewModel for proper typing.
 * Use concrete classes (DefaultItemView, OncePeerItemView) for RelatedObjects lookup.
 */
export interface ItemView<TModel extends ItemViewModel = ItemViewModel> extends View<TModel> {
  
  // ═══════════════════════════════════════════════════════════════
  // ENFORCED ATTRIBUTES (mapped to model via getters/setters)
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Display name - primary identifier
   * Mapped to model.name via getter/setter
   */
  get name(): string;
  set name(value: string);
  
  /**
   * Short description - secondary text
   * Mapped to model.description via getter/setter
   */
  get description(): string;
  set description(value: string);
  
  /**
   * Badge - count or status indicator
   * null if no badge should be displayed
   * Mapped to model.badge via getter/setter
   */
  get badge(): Reference<string | number>;
  set badge(value: Reference<string | number>);
  
  /**
   * Icon identifier - FontAwesome or Lit-compatible icon
   * Example: 'fa-server', 'fa-user', 'fa-folder'
   * Mapped to model.icon via getter/setter
   */
  get icon(): string;
  set icon(value: string);
  
  // ═══════════════════════════════════════════════════════════════
  // OPTIONAL ATTRIBUTES
  // ═══════════════════════════════════════════════════════════════
  
  /**
   * Touch/drag support enabled
   */
  touchEnabled: boolean;
  
  /**
   * View name for CSS/template paths
   */
  get viewName(): string;
}
