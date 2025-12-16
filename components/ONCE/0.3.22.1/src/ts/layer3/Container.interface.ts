/**
 * Container.interface.ts - Navigable Tree Container
 * 
 * A Container is a Tree that can be displayed in an OverView.
 * Used for animated panel navigation, breadcrumbs, and mobile UX.
 * 
 * Web4 Principles:
 * - P4: Radical OOP - Container IS a Tree
 * - P5: Reference<T> for nullable
 * - P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/Container
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { Tree } from './Tree.interface.js';
import { Reference } from './Reference.interface.js';

/**
 * Container<T> - Tree node for OverView navigation
 * 
 * Containers are Trees that support:
 * - Breadcrumb path computation
 * - Animated panel transitions
 * - Mobile swipe gestures
 * 
 * Usage:
 * - Folder implements Container (for FolderOverView)
 * - Any navigable hierarchy can implement Container
 * - OverViews work with Container interface generically
 * 
 * @typeParam T - Type of children
 */
export interface Container<T> extends Tree<T> {
  
  /**
   * Display name for breadcrumb/UI
   */
  readonly displayName: string;
  
  /**
   * Unique identifier
   */
  readonly uuid: string;
  
  /**
   * Get path from root to this container (for breadcrumb)
   * 
   * Returns array from root to this node (inclusive).
   * Computed by walking up parent chain.
   * 
   * @returns Array of ancestors from root to this
   */
  pathFromRoot(): Container<T>[];
  
  /**
   * Navigate to a child container
   * 
   * For OverViews: triggers animated transition.
   * 
   * @param child Container to navigate to
   * @returns true if navigation succeeded
   */
  navigateTo(child: T): boolean;
}






