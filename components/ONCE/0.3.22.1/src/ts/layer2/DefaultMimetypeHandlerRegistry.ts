/**
 * DefaultMimetypeHandlerRegistry.ts - Mimetype Handler Registry
 * 
 * Manages registration and lookup of mimetype handlers.
 * Components register themselves to handle specific file types.
 * 
 * Web4 Principles:
 * - P4: Radical OOP - Components register themselves
 * - P7: Layer 2 sync methods
 * 
 * @ior ior:esm:/ONCE/{version}/DefaultMimetypeHandlerRegistry
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { 
  MimetypeHandler, 
  MimetypeHandlerRegistry,
  ComponentConstructor 
} from '../layer3/MimetypeHandler.interface.js';

/**
 * DefaultMimetypeHandlerRegistry - Singleton registry for mimetype handlers
 * 
 * Usage:
 * ```typescript
 * // Register a handler
 * registry.handlerRegister({
 *   pattern: 'image/*',
 *   componentClass: DefaultImage,
 *   priority: 50,
 *   name: 'Image Handler'
 * });
 * 
 * // Lookup handler
 * const handler = registry.handlerLookup('image/png');
 * if (handler) {
 *   const component = new handler.componentClass();
 *   await component.init({ file });
 * }
 * ```
 */
export class DefaultMimetypeHandlerRegistry implements MimetypeHandlerRegistry {
  
  /** Singleton instance */
  private static _instance: DefaultMimetypeHandlerRegistry | null = null;
  
  /** Registered handlers (sorted by priority descending) */
  private handlers: MimetypeHandler[] = [];
  
  /**
   * Get singleton instance
   */
  static get instance(): DefaultMimetypeHandlerRegistry {
    if (!this._instance) {
      this._instance = new DefaultMimetypeHandlerRegistry();
    }
    return this._instance;
  }
  
  /**
   * Reset singleton (for testing)
   */
  static reset(): void {
    this._instance = null;
  }
  
  /**
   * Register a handler for a mimetype pattern
   */
  handlerRegister(handler: MimetypeHandler): void {
    // Check for duplicate pattern
    const existing = this.handlers.findIndex(h => h.pattern === handler.pattern);
    if (existing !== -1) {
      // Replace existing
      this.handlers[existing] = handler;
    } else {
      this.handlers.push(handler);
    }
    
    // Sort by priority descending (higher priority first)
    this.handlers.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Convenience method to register with minimal arguments
   */
  register(
    pattern: string,
    componentClass: ComponentConstructor,
    priority: number = 0,
    name?: string
  ): void {
    this.handlerRegister({
      pattern,
      componentClass,
      priority,
      name: name || componentClass.name
    });
  }
  
  /**
   * Unregister a handler by pattern
   */
  handlerUnregister(pattern: string): void {
    this.handlers = this.handlers.filter(h => h.pattern !== pattern);
  }
  
  /**
   * Lookup handler for a specific mimetype
   * 
   * Returns the highest-priority matching handler.
   * Checks patterns in priority order.
   */
  handlerLookup(mimetype: string): MimetypeHandler | null {
    for (const handler of this.handlers) {
      if (this.patternMatches(mimetype, handler.pattern)) {
        return handler;
      }
    }
    return null;
  }
  
  /**
   * Check if a mimetype matches a pattern
   */
  private patternMatches(mimetype: string, pattern: string): boolean {
    // Exact match
    if (pattern === mimetype) return true;
    
    // Wildcard all types
    if (pattern === '*/*') return true;
    
    // Subtype wildcard (e.g., "image/*")
    if (pattern.endsWith('/*')) {
      const typePrefix = pattern.slice(0, -1); // "image/"
      return mimetype.startsWith(typePrefix);
    }
    
    // Type wildcard (e.g., "*/xml")
    if (pattern.startsWith('*/')) {
      const subtype = pattern.slice(2); // "xml"
      return mimetype.endsWith('/' + subtype);
    }
    
    return false;
  }
  
  /**
   * Get all registered handlers
   */
  handlersAll(): MimetypeHandler[] {
    return [...this.handlers];
  }
  
  /**
   * Get handler count
   */
  get count(): number {
    return this.handlers.length;
  }
  
  /**
   * Check if a handler exists for a pattern
   */
  hasHandler(pattern: string): boolean {
    return this.handlers.some(h => h.pattern === pattern);
  }
  
  /**
   * Get all patterns
   */
  get patterns(): string[] {
    return this.handlers.map(h => h.pattern);
  }
}

/**
 * Convenience export for singleton access
 */
export const mimetypeRegistry = DefaultMimetypeHandlerRegistry.instance;
