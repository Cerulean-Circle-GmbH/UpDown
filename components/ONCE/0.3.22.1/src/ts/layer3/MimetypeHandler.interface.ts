/**
 * MimetypeHandler.interface.ts - Mimetype to Component Mapping
 * 
 * Defines how mimetypes are mapped to UcpComponent classes.
 * Used by FileSystem to create components from dropped files.
 * 
 * Web4 Principles:
 * - P4: Radical OOP - Components register themselves for mimetypes
 * - P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/MimetypeHandler
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { ComponentConstructor } from './ComponentConstructor.type.js';

// Re-export for backwards compatibility
export type { ComponentConstructor };

/**
 * MimetypeHandler - Maps mimetype patterns to component classes
 * 
 * Usage:
 * - Components register themselves via MimetypeHandlerRegistry
 * - FileSystem looks up handler when file is dropped
 * - Handler creates component instance for the file
 */
export interface MimetypeHandler {
  /**
   * Mimetype pattern (supports wildcards)
   * 
   * Examples:
   * - "image/png" - exact match
   * - "image/*" - all image types
   * - "text/*" - all text types
   * - "*\/*" - any type (fallback)
   */
  pattern: string;
  
  /**
   * Component class constructor
   * 
   * Called with `new componentClass()` then `.init({ file })`.
   */
  componentClass: ComponentConstructor;
  
  /**
   * Priority for handler resolution (higher = checked first)
   * 
   * Default: 0
   * Specific patterns should have higher priority than wildcards.
   * 
   * Examples:
   * - "image/png" → priority 100
   * - "image/*" → priority 50
   * - "*\/*" → priority 0
   */
  priority: number;
  
  /**
   * Human-readable name for the handler
   */
  name: string;
  
  /**
   * Description of what this handler does
   */
  description?: string;
}





