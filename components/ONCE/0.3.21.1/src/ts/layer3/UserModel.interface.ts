/**
 * UserModel Interface - Minimal User model for owner attribution
 * Web4 EAM Layer 3 - Data contract
 * 
 * @pdca 2025-11-19-UTC-1100.user-migration-layer1.pdca.md
 */

export interface UserModel {
  /**
   * User UUID (deterministic from username)
   */
  uuid: string;
  
  /**
   * OS username
   */
  username: string;
  
  /**
   * Fully qualified hostname (FQDN)
   */
  hostname: string;
}

