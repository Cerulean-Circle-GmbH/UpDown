/**
 * UserModel Interface - Minimal User model for owner attribution
 * Web4 EAM Layer 3 - Data contract
 * 
 * Extends Model (Web4 Principle 1a: All models extend base Model)
 * 
 * @pdca 2025-11-19-UTC-1100.user-migration-layer1.pdca.md
 */

import type { Model } from './Model.interface.js';

export interface UserModel extends Model {
  /**
   * User UUID (inherited from Model)
   * User name (inherited from Model, maps to username for display)
   */
  
  /**
   * OS username (used as 'name' from Model)
   */
  username: string;
  
  /**
   * Fully qualified hostname (FQDN)
   */
  hostname: string;
}

