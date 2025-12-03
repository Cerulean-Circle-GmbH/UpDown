/**
 * Action.interface.ts - Web4 Action Interface
 * 
 * Actions are methods with NO REQUIRED PARAMETERS
 * that can be mapped directly to buttons.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (methods as actions)
 * - P5: Reference<T> for optional properties
 * - P19: One file, one type
 * 
 * @ior ior:esm:/ONCE/{version}/Action
 * @pdca 2025-12-03-UTC-1200.mvc-lit3-views.pdca.md
 */

import { ActionStyle } from './ActionStyle.enum.js';
import { Reference } from './Reference.interface.js';

/**
 * Web4 Action - Method exposed as UI action
 * 
 * Actions are methods with NO REQUIRED PARAMETERS
 * that can be mapped directly to buttons.
 * 
 * Views discover actions via reflection and render them as buttons.
 */
export interface Action {
  /** Method name to invoke via IOR */
  method: string;
  
  /** Human-readable label */
  label: string;
  
  /** Emoji or icon */
  icon: string;
  
  /** Visual style - ENUM not string literal! */
  style: ActionStyle;
  
  /** Keyboard shortcut (optional) */
  shortcut: Reference<string>;
  
  /** Confirmation required before invoke */
  confirmRequired: Reference<boolean>;
  
  /** Confirmation message */
  confirmMessage: Reference<string>;
}

