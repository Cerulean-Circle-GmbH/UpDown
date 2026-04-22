/**
 * UserModel Interface - Minimal User model for owner attribution
 * Extends Model (Web4 Principle 1a: All models extend base Model)
 */

import type { Model } from './Model.interface.js';

export interface UserModel extends Model {
  /**
   * OS username (used as 'name' from Model)
   */
  username: string;

  /**
   * Fully qualified hostname (FQDN)
   */
  hostname: string;
}
