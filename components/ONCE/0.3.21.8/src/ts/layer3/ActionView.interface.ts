/**
 * ActionView.interface.ts - Interface for clickable/touchable action views
 * 
 * Any view that can trigger an action implements this.
 * Buttons, icons, list items can all be ActionViews.
 * 
 * Uses ActionMetadata (discovered) not static constants.
 * 
 * Web4 Principles:
 * - P5: Reference<T> for nullable action and actionTarget
 * - P16: TypeScript accessors (set action(), get action())
 * - P19: One File One Type
 * - NO 'any' - uses ActionTarget interface
 * 
 * @ior ior:esm:/ONCE/{version}/ActionView
 * @pdca 2025-12-05-UTC-1800.a1-1-core-interfaces.pdca.md
 */

import { View } from './View.interface.js';
import { ActionMetadata } from './ActionMetadata.interface.js';
import { ActionTarget } from './ActionTarget.interface.js';
import { Reference } from './Reference.interface.js';

/**
 * ActionView - View that can trigger an action
 * 
 * Generic TModel for view's model - must extend object, not 'any'.
 * 
 * Usage in Lit templates:
 * ```html
 * <web4-action-button
 *   .action=${startAction}
 *   .actionTarget=${this.kernel}
 * ></web4-action-button>
 * ```
 */
export interface ActionView<TModel extends object = object> extends View<TModel> {
  
  /**
   * Set the action this view triggers
   * 
   * Action is discovered ActionMetadata, not a static constant.
   * Lit: .action=${startAction}
   */
  set action(metadata: ActionMetadata);
  
  /**
   * Get the bound action
   * 
   * Returns null if no action is bound.
   */
  get action(): Reference<ActionMetadata>;
  
  /**
   * Set target for the action
   * 
   * The component instance to invoke the action on.
   * Typed as ActionTarget, not 'any'.
   * Lit: .actionTarget=${this.kernel}
   */
  set actionTarget(target: ActionTarget);
  
  /**
   * Get the action target
   * 
   * Returns null if no target is set.
   */
  get actionTarget(): Reference<ActionTarget>;
  
  /**
   * Execute the bound action
   * 
   * Called on click/touch. Invokes action.method on actionTarget.
   * May show confirmation dialog if action.confirmRequired is true.
   */
  actionExecute(): Promise<void>;
}





