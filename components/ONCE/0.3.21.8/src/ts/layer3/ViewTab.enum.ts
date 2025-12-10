/**
 * ViewTab.enum.ts - Tabs for DetailsView
 * 
 * Web4 Principle: NO STRING LITERALS, always enums!
 * 
 * @ior ior:esm:/ONCE/{version}/ViewTab
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 */

/**
 * ViewTab - Tabs for DetailsView programmer introspection
 * 
 * Used by DetailsView to show different aspects of a component.
 */
export enum ViewTab {
  /** Model attributes (direct properties) */
  ATTRIBUTES = 'attributes',
  
  /** Computed/derived properties */
  PROPERTIES = 'properties',
  
  /** IOR links to other scenarios */
  RELATIONSHIPS = 'relationships',
  
  /** Arrays of child scenarios */
  COLLECTIONS = 'collections',
  
  /** Callable methods with signatures */
  METHODS = 'methods'
}



