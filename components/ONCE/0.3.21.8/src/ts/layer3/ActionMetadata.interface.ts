/**
 * ActionMetadata.interface.ts - Metadata for a discovered action
 * 
 * Actions are discovered from methods with @action TSDoc annotations
 * and registered as RelatedObjects. This interface holds the metadata.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable shortcut and confirmMessage
 * - P19: One File One Type
 * - NO 'any' types
 * 
 * @ior ior:esm:/ONCE/{version}/ActionMetadata
 * @pdca 2025-12-05-UTC-1800.a1-1-core-interfaces.pdca.md
 */

import { ActionStyle } from './ActionStyle.enum.js';
import { Reference } from './Reference.interface.js';

/**
 * ActionMetadata - Metadata for a discovered action
 * 
 * Discovered from TSDoc annotations:
 * - @action 'Start Server' → label
 * - @actionIcon 'fa-play' → icon
 * - @actionStyle PRIMARY → style
 * - @actionShortcut 'Ctrl+S' → shortcut
 * - @actionConfirm 'Stop this server?' → confirmMessage
 */
export interface ActionMetadata {
  /** Component name (e.g., 'ONCE') */
  component: string;
  
  /** Action identifier (e.g., 'PEER_START') - derived from method name */
  action: string;
  
  /** Method name to invoke (e.g., 'peerStart') */
  method: string;
  
  /** Display label (from @action TSDoc) */
  label: string;
  
  /** FontAwesome icon (from @actionIcon TSDoc) */
  icon: string;
  
  /** Visual style (from @actionStyle TSDoc) */
  style: ActionStyle;
  
  /** Keyboard shortcut (from @actionShortcut TSDoc), null if none */
  shortcut: Reference<string>;
  
  /** Whether confirmation is required before execution */
  confirmRequired: boolean;
  
  /** Confirmation message (from @actionConfirm TSDoc), null if none */
  confirmMessage: Reference<string>;
}














