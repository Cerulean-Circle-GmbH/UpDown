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

import { MimetypeHandler, ComponentConstructor } from '../layer3/MimetypeHandler.interface.js';
import { MimetypeHandlerRegistry } from '../layer3/MimetypeHandlerRegistry.interface.js';

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
  private static singletonInstance: DefaultMimetypeHandlerRegistry | null = null;
  
  /** Registered handlers (sorted by priority descending) */
  private handlers: MimetypeHandler[] = [];
  
  /**
   * Get singleton instance
   */
  static get instance(): DefaultMimetypeHandlerRegistry {
    if (!this.singletonInstance) {
      this.singletonInstance = new DefaultMimetypeHandlerRegistry();
    }
    return this.singletonInstance;
  }
  
  /**
   * Reset singleton (for testing)
   */
  static reset(): void {
    this.singletonInstance = null;
  }
  
  /**
   * Register a handler for a mimetype pattern
   */
  handlerRegister(handler: MimetypeHandler): void {
    // P4a: Use function predicates instead of arrows
    const pattern = handler.pattern;
    function matchesPattern(h: MimetypeHandler): boolean {
      return h.pattern === pattern;
    }
    function comparePriority(a: MimetypeHandler, b: MimetypeHandler): number {
      return b.priority - a.priority;
    }
    
    // Check for duplicate pattern
    const existing = this.handlers.findIndex(matchesPattern);
    if (existing !== -1) {
      // Replace existing
      this.handlers[existing] = handler;
    } else {
      this.handlers.push(handler);
    }
    
    // Sort by priority descending (higher priority first)
    this.handlers.sort(comparePriority);
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
    // P4a: Use function predicate instead of arrow
    function notMatchesPattern(h: MimetypeHandler): boolean {
      return h.pattern !== pattern;
    }
    this.handlers = this.handlers.filter(notMatchesPattern);
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
    // P4a: Use function predicate instead of arrow
    function matchesPattern(h: MimetypeHandler): boolean {
      return h.pattern === pattern;
    }
    return this.handlers.some(matchesPattern);
  }
  
  /**
   * Get all patterns
   */
  get patterns(): string[] {
    // P4a: Use for...of instead of map with arrow
    const result: string[] = [];
    for (const h of this.handlers) {
      result.push(h.pattern);
    }
    return result;
  }
}

/**
 * Convenience export for singleton access
 */
export const mimetypeRegistry = DefaultMimetypeHandlerRegistry.instance;



