/**
 * Tree.interface.ts - Generic Tree Structure
 * 
 * Provides parent/children relationships for hierarchical data.
 * Used by Folder (files), OverViews (navigation), and Containers.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable parent
 * - P19: One File One Type
 * - P22: Collection<T> for children
 * 
 * @ior ior:esm:/ONCE/{version}/Tree
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { Reference } from './Reference.interface.js';
import { Collection } from './Collection.interface.js';

/**
 * Tree<T> - Generic tree node interface
 * 
 * Every node has:
 * - parent: Reference to parent node (null for root)
 * - children: Collection of child nodes
 * 
 * Usage:
 * - Folder implements Tree<File | Folder>
 * - Container implements Tree<Container> for OverViews
 * - Breadcrumb navigates Tree via parent chain
 * - AnimatedPanels work on any Tree implementation
 * 
 * @typeParam T - Type of children (usually same as implementing type)
 */
export interface Tree<T> {
  
  /**
   * Parent node (null for root)
   * 
   * Used for breadcrumb navigation (walk up to root).
   */
  readonly parent: Reference<Tree<T>>;
  
  /**
   * Child nodes
   * 
   * Collection<T> allows arrays and custom collections.
   */
  readonly children: Collection<T>;
  
  /**
   * Add a child node
   * 
   * Sets child's parent to this node.
   * 
   * @param child Child to add
   */
  childAdd(child: T): void;
  
  /**
   * Remove a child node
   * 
   * @param child Child to remove
   * @returns true if removed, false if not found
   */
  childRemove(child: T): boolean;
  
  /**
   * Check if node has any children
   */
  readonly hasChildren: boolean;
  
  /**
   * Get number of children
   */
  readonly childCount: number;
}

