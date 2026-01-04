/**
 * SyncStatus Enum - Synchronization state for unit references
 * 
 * ✅ Web4 Principle 4: Enum Everywhere
 * ✅ Web4 Principle 19: One File One Type
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 * @pdca 2025-12-20-UTC-2100.unit-based-pwa-caching.pdca.md (I.9.1)
 */

export enum SyncStatus {
  /** Reference is synchronized with source */
  SYNCED = 'SYNCED',
  /** Reference is outdated compared to source */
  OUTDATED = 'OUTDATED',
  /** Reference is broken (target missing) */
  BROKEN = 'BROKEN',
  /** Sync status unknown */
  UNKNOWN = 'UNKNOWN',
  /** Reference has local modifications */
  MODIFIED = 'MODIFIED',
  /** Reference needs sync check */
  TO_BE_CHECKED = 'TO_BE_CHECKED',
  /** 
   * Runtime-only reference (e.g., blob: URLs)
   * Not persisted, exists only during browser session
   * @pdca I.9.1 - BlobUrls are UnitReferences with RUNTIME status
   */
  RUNTIME = 'RUNTIME'
}





