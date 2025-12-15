/**
 * UnitType.enum.ts
 * 
 * Types of cacheable Units in PWA
 * 
 * @layer3
 * @pattern Web4 P19: One File Per Type
 * @pdca session/2025-12-12-UTC-1230.pwa-offline-unit-cache.pdca.md
 */

/**
 * Unit Type Enum
 * 
 * Classifies cacheable assets by their content type
 * Used for applying appropriate cache strategies
 */
export enum UnitType {
  /**
   * JavaScript files (.js, .mjs)
   */
  JAVASCRIPT = 'javascript',
  
  /**
   * CSS stylesheets (.css)
   */
  CSS = 'css',
  
  /**
   * HTML documents (.html)
   */
  HTML = 'html',
  
  /**
   * JSON data (.json)
   */
  JSON = 'json',
  
  /**
   * Scenario files (component state)
   */
  SCENARIO = 'scenario',
  
  /**
   * Image files (.png, .jpg, .svg, .webp)
   */
  IMAGE = 'image',
  
  /**
   * Font files (.woff, .woff2, .ttf)
   */
  FONT = 'font',
  
  /**
   * Unknown or other asset types
   */
  OTHER = 'other'
}




