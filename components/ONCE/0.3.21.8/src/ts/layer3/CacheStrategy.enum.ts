/**
 * CacheStrategy.enum.ts
 * 
 * PWA caching strategies for Service Worker
 * 
 * @layer3
 * @pattern Web4 P19: One File Per Type
 * @pdca session/2025-12-12-UTC-1230.pwa-offline-unit-cache.pdca.md
 */

/**
 * Cache Strategy Enum
 * 
 * Defines how the Service Worker should handle fetch requests
 * Each strategy has different tradeoffs between speed and freshness
 */
export enum CacheStrategy {
  /**
   * Cache First (Offline-First)
   * Check cache first, fallback to network
   * Best for: Static assets, versioned resources
   */
  CACHE_FIRST = 'cache-first',
  
  /**
   * Network First (Online-First)
   * Try network first, fallback to cache
   * Best for: Dynamic content, API responses
   */
  NETWORK_FIRST = 'network-first',
  
  /**
   * Stale While Revalidate
   * Return cached immediately, update cache in background
   * Best for: Content that changes but stale is acceptable
   */
  STALE_WHILE_REVALIDATE = 'stale-while-revalidate',
  
  /**
   * Network Only
   * Always fetch from network, never cache
   * Best for: Real-time data, authentication
   */
  NETWORK_ONLY = 'network-only',
  
  /**
   * Cache Only
   * Only serve from cache, never network
   * Best for: Offline-first apps with precached content
   */
  CACHE_ONLY = 'cache-only'
}





