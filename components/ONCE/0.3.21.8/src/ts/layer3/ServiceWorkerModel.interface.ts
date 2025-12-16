/**
 * ServiceWorkerModel.interface.ts
 * 
 * Model for the ONCE Service Worker component
 * 
 * @layer3
 * @pattern Web4 P19: One File Per Type
 * @pattern Web4 P1: Everything is a Scenario
 * @pdca session/2025-12-12-UTC-1230.pwa-offline-unit-cache.pdca.md
 */

import type { Model } from './Model.interface.js';
import type { StatisticsModel } from './StatisticsModel.interface.js';
import type { CacheStrategy } from './CacheStrategy.enum.js';

/**
 * Service Worker Model
 * 
 * Configuration and state for the ONCE Service Worker
 * The SW boots a ONCE kernel in self.global.ONCE
 */
export interface ServiceWorkerModel extends Model {
  // Inherited from Model: uuid, name, iorComponent?, iorVersion?
  
  /**
   * Service Worker version
   * Used for cache versioning and update detection
   */
  version: string;
  
  /**
   * Cache name prefix
   * Full cache name: {cacheNamePrefix}-v{version}
   */
  cacheNamePrefix: string;
  
  /**
   * Default cache strategy for unclassified requests
   */
  defaultCacheStrategy: CacheStrategy;
  
  /**
   * Patterns to always cache (precache on install)
   * Glob patterns like '*.js', '*.css'
   */
  precachePatterns: string[];
  
  /**
   * Patterns to never cache (skip cache entirely)
   * Glob patterns like '/api/*', '/ws/*'
   */
  noCachePatterns: string[];
  
  /**
   * Maximum cache size in bytes
   * Oldest entries evicted when exceeded
   */
  maxCacheSizeBytes: number;
  
  /**
   * Maximum number of cached units
   * Oldest entries evicted when exceeded
   */
  maxCachedUnits: number;
  
  /**
   * Whether the SW is currently active
   */
  isActive: boolean;
  
  /**
   * Whether the SW is waiting to activate (update pending)
   */
  isWaiting: boolean;
  
  /**
   * Number of currently cached units
   */
  cachedUnitsCount: number;
  
  /**
   * Total size of cached units in bytes
   */
  cachedSizeBytes: number;
  
  /**
   * Statistics for SW operations
   */
  statistics: StatisticsModel;
}







