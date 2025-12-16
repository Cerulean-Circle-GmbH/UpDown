/**
 * ContainerModel.interface.ts - Model interface for Container components
 * 
 * Extends base Model with container-specific properties.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable
 * - P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/ContainerModel
 * @pdca 2025-12-14-UTC-1800.filesystem-component-architecture.pdca.md
 */

import { Reference } from './Reference.interface.js';

/**
 * ContainerModel - Model interface for Container components
 * 
 * Extends base Model with container-specific properties.
 */
export interface ContainerModel {
  /** Unique identifier */
  uuid: string;
  
  /** Display name */
  name: string;
  
  /** Parent container UUID (null for root) */
  parentUuid: Reference<string>;
}


