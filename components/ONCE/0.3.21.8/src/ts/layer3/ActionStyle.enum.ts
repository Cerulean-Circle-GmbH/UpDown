/**
 * ActionStyle.enum.ts - Visual styles for action buttons
 * 
 * Web4 Principle: NO STRING LITERALS, always enums!
 * 
 * @ior ior:esm:/ONCE/{version}/ActionStyle
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 */

/**
 * ActionStyle - Visual style for action buttons
 * 
 * Used by Action interface to style buttons consistently.
 * Maps to CSS classes in ItemView.css, DefaultView.css.
 */
export enum ActionStyle {
  /** Primary action - green, prominent */
  PRIMARY = 'primary',
  
  /** Secondary action - cyan, less prominent */
  SECONDARY = 'secondary',
  
  /** Danger action - red, destructive */
  DANGER = 'danger',
  
  /** Warning action - yellow, caution */
  WARNING = 'warning'
}













