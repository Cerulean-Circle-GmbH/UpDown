/**
 * TreeNode.type.ts - Intersection type for Tree nodes
 * 
 * Combines a type T with Tree<T> capabilities.
 * 
 * Web4 Principles:
 * - P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/TreeNode
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { Tree } from './Tree.interface.js';

/**
 * TreeNode<T> - A type that is both T and implements Tree<T>
 * 
 * Useful for typing nodes that have both domain properties
 * and tree navigation capabilities.
 * 
 * @typeParam T - The domain type
 */
export type TreeNode<T> = T & Tree<T>;






