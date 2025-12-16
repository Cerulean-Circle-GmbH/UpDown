/**
 * CachedUnitModel.interface.ts
 * 
 * Model for a cached Unit in Service Worker
 * Represents a cacheable asset with IOR-based identity
 * 
 * @layer3
 * @pattern Web4 P19: One File Per Type
 * @pattern Web4 P1: Everything is a Scenario
 * @pdca session/2025-12-12-UTC-1230.pwa-offline-unit-cache.pdca.md
 */

import type { Model } from './Model.interface.js';
import type { UnitType } from './UnitType.enum.js';
import type { CacheStrategy } from './CacheStrategy.enum.js';

/**
 * Cached Unit Model
 * 
 * Extends base Model with cache-specific properties
 * Each Unit is a cacheable asset identified by its IOR
 * 
 * Key Concept: Unit = Cacheable Asset with IOR
 */
export interface CachedUnitModel extends Model {
  // Inherited from Model: uuid, name, iorComponent?, iorVersion?
  
  /**
   * IOR path to this unit
   * Example: /EAMD.ucp/components/ONCE/0.3.21.8/dist/ts/layer2/HTTPServer.js
   */
  ior: string;
  
  /**
   * Type of unit (determines cache strategy)
   */
  unitType: UnitType;
  
  /**
   * Cache strategy for this unit
   */
  cacheStrategy: CacheStrategy;
  
  /**
   * Semantic version string
   * Used for cache invalidation
   */
  version: string;
  
  /**
   * Content hash (SHA-256)
   * Used for cache validation and deduplication
   */
  hash: string;
  
  /**
   * Size in bytes
   */
  size: number;
  
  /**
   * MIME type (e.g., 'application/javascript')
   */
  mimeType: string;
  
  /**
   * Dependencies: other Unit IORs this depends on
   * Used for prefetching and cache warming
   */
  dependencies: string[];
  
  /**
   * ISO timestamp when cached
   */
  cachedAt: string;
  
  /**
   * ISO timestamp of last access
   */
  lastAccessedAt: string;
  
  /**
   * Number of times accessed from cache
   */
  accessCount: number;
}









