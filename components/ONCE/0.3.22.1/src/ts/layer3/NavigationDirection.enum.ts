/**
 * NavigationDirection.enum.ts - Direction for animated navigation
 * 
 * Used by FolderOverView and Container navigation for animation direction.
 * 
 * Web4 Principles:
 * - P2: Convention over Configuration (enum → method name mapping)
 * - P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/NavigationDirection
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

/**
 * NavigationDirection - Direction of navigation animation
 */
export enum NavigationDirection {
  /** Moving deeper into hierarchy (slide left) */
  Forward = 'forward',
  
  /** Moving up in hierarchy (slide right) */
  Back = 'back',
  
  /** No animation (initial state) */
  None = 'none'
}
