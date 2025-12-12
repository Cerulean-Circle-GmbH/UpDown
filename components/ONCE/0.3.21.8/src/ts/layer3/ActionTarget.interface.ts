/**
 * ActionTarget.interface.ts - Interface for objects that can receive actions
 * 
 * Components implement this to be action targets.
 * Provides type-safe method invocation without 'any'.
 * 
 * Web4 Principles:
 * - P16: Object-Action naming (hasMethod, methodInvoke)
 * - P19: One File One Type
 * - NO 'any' types - uses 'unknown'
 * 
 * @ior ior:esm:/ONCE/{version}/ActionTarget
 * @pdca 2025-12-05-UTC-1800.a1-1-core-interfaces.pdca.md
 */

/**
 * ActionTarget - Interface for invokable action targets
 * 
 * Any component that can receive actions implements this.
 * Used by Action.do() to safely invoke methods.
 */
export interface ActionTarget {
  
  /**
   * Check if target has a method by name
   * 
   * @param name Method name to check
   * @returns true if method exists and is callable
   */
  hasMethod(name: string): boolean;
  
  /**
   * Invoke a method by name
   * 
   * @param name Method name to invoke
   * @param args Arguments to pass (typed as unknown[])
   * @returns Promise resolving to method result (typed as unknown)
   */
  methodInvoke(name: string, ...args: unknown[]): Promise<unknown>;
}






