/**
 * UnitCacheManagerModel.interface.ts
 * 
 * Model for the Unit Cache Manager component
 * 
 * @layer3
 * @pattern Web4 P19: One File Per Type
 * @pdca session/2025-12-12-UTC-1230.pwa-offline-unit-cache.pdca.md
 */

import type { Model } from './Model.interface.js';
import type { StatisticsModel } from './StatisticsModel.interface.js';

/**
 * Unit Cache Manager Model
 * 
 * Manages the mapping between IORs and cached responses
 */
export interface UnitCacheManagerModel extends Model {
  // Inherited from Model: uuid, name, iorComponent?, iorVersion?
  
  /**
   * Cache name used in Cache API
   */
  cacheName: string;
  
  /**
   * Version of the cache (for invalidation)
   */
  cacheVersion: string;
  
  /**
   * Number of units currently cached
   */
  unitCount: number;
  
  /**
   * Total size of cached units in bytes
   */
  totalSizeBytes: number;
  
  /**
   * Maximum size limit in bytes
   */
  maxSizeBytes: number;
  
  /**
   * IORs of currently cached units
   */
  cachedIors: string[];
  
  /**
   * Statistics for cache operations
   */
  statistics: StatisticsModel;
}







