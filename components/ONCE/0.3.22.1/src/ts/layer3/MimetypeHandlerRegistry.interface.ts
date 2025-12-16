/**
 * MimetypeHandlerRegistry.interface.ts - Interface for handler lookup
 * 
 * Web4 Principles:
 * - P4: Radical OOP - Components register themselves for mimetypes
 * - P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/MimetypeHandlerRegistry
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { MimetypeHandler } from './MimetypeHandler.interface.js';
import { Reference } from './Reference.interface.js';

/**
 * MimetypeHandlerRegistry - Interface for handler lookup
 */
export interface MimetypeHandlerRegistry {
  /**
   * Register a handler for a mimetype pattern
   */
  handlerRegister(handler: MimetypeHandler): void;
  
  /**
   * Unregister a handler
   */
  handlerUnregister(pattern: string): void;
  
  /**
   * Lookup handler for a specific mimetype
   * 
   * Returns the highest-priority matching handler, or null.
   * P5: Use Reference<T> for nullable return
   */
  handlerLookup(mimetype: string): Reference<MimetypeHandler>;
  
  /**
   * Get all registered handlers
   */
  handlersAll(): MimetypeHandler[];
}




