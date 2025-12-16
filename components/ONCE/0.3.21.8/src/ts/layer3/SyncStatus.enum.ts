/**
 * SyncStatus Enum - Synchronization state for unit references
 * 
 * ✅ Web4 Principle 4: Enum Everywhere
 * ✅ Web4 Principle 19: One File One Type
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
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
  TO_BE_CHECKED = 'TO_BE_CHECKED'
}












