/**
 * Action.ts - Static utilities for action management
 * 
 * Actions are discovered from @action TSDoc annotations and registered
 * as RelatedObjects. This class provides static lookup/invoke utilities.
 * 
 * Web4 Principles:
 * - P4: Radical OOP (methods, not arrow functions)
 * - P5: Reference<T> for nullable returns
 * - P24: Uses RelatedObjects registry (no separate ActionRegistry)
 * - P25: Tootsie tests only
 * 
 * @ior ior:esm:/ONCE/{version}/Action
 * @pdca 2025-12-05-UTC-1600.phase-a1-oncepeeritemview-relatedobjects.pdca.md
 */

import { ActionMetadata } from '../layer3/ActionMetadata.interface.js';
import { ActionTarget } from '../layer3/ActionTarget.interface.js';
import { ActionStyle } from '../layer3/ActionStyle.enum.js';
import { RelatedObjects } from '../layer3/RelatedObjects.interface.js';
import { Reference } from '../layer3/Reference.interface.js';
import { Collection } from '../layer3/Collection.interface.js';

/**
 * ActionMetadataImpl - Concrete implementation of ActionMetadata
 * 
 * Used as the class type for RelatedObjects registration.
 * Implements the interface to allow instanceof checks.
 */
export class ActionMetadataImpl implements ActionMetadata {
  component: string = '';
  action: string = '';
  method: string = '';
  label: string = '';
  icon: string = 'fa-cog';
  style: ActionStyle = ActionStyle.SECONDARY;
  shortcut: Reference<string> = null;
  confirmRequired: boolean = false;
  confirmMessage: Reference<string> = null;
  
  constructor() {
    // Empty - Web4 Principle 6
  }
  
  /**
   * Initialize from parsed TSDoc data
   */
  init(data: Partial<ActionMetadata>): this {
    if (data.component !== undefined) this.component = data.component;
    if (data.action !== undefined) this.action = data.action;
    if (data.method !== undefined) this.method = data.method;
    if (data.label !== undefined) this.label = data.label;
    if (data.icon !== undefined) this.icon = data.icon;
    if (data.style !== undefined) this.style = data.style;
    if (data.shortcut !== undefined) this.shortcut = data.shortcut;
    if (data.confirmRequired !== undefined) this.confirmRequired = data.confirmRequired;
    if (data.confirmMessage !== undefined) this.confirmMessage = data.confirmMessage;
    return this;
  }
}

/**
 * Action - Static utilities for action discovery and invocation
 * 
 * Usage:
 * ```typescript
 * // Lookup action by method name
 * const action = Action.lookup(controller, 'peerStart');
 * 
 * // Get all registered actions
 * const actions = Action.all(controller);
 * 
 * // Execute an action on a target
 * await Action.do(action, target);
 * ```
 */
export class Action {
  
  /**
   * Lookup action by method name
   * 
   * @param registry RelatedObjects registry (controller or component)
   * @param methodName Method name to find (e.g., 'peerStart')
   * @returns ActionMetadata or null if not found
   */
  static lookup(registry: RelatedObjects, methodName: string): Reference<ActionMetadata> {
    const actions = registry.relatedObjectLookup(ActionMetadataImpl);
    
    for (const action of actions) {
      if (action.method === methodName) {
        return action;
      }
    }
    
    return null;
  }
  
  /**
   * Get all registered actions
   * 
   * @param registry RelatedObjects registry
   * @returns Collection of all ActionMetadata (empty if none)
   */
  static all(registry: RelatedObjects): Collection<ActionMetadata> {
    return registry.relatedObjectLookup(ActionMetadataImpl);
  }
  
  /**
   * Execute an action on a target
   * 
   * Checks if target has the method, then invokes it.
   * 
   * @param metadata Action to execute
   * @param target Object to invoke method on
   * @param args Optional arguments to pass
   * @throws Error if target doesn't have the method
   */
  static async do(metadata: ActionMetadata, target: ActionTarget, ...args: unknown[]): Promise<unknown> {
    if (!target.hasMethod(metadata.method)) {
      throw new Error(`Action target does not have method: ${metadata.method}`);
    }
    
    return await target.methodInvoke(metadata.method, ...args);
  }
  
  /**
   * Register an action in the registry
   * 
   * @param registry RelatedObjects registry
   * @param metadata Action metadata to register
   */
  static register(registry: RelatedObjects, metadata: ActionMetadataImpl): void {
    registry.relatedObjectRegister(ActionMetadataImpl, metadata);
  }
  
  /**
   * Create ActionMetadata from method name with default values
   * 
   * Derives action identifier from method name:
   * - 'peerStart' → 'PEER_START'
   * - 'peerStopAll' → 'PEER_STOP_ALL'
   * 
   * @param componentName Component name (e.g., 'ONCE')
   * @param methodName Method name (e.g., 'peerStart')
   * @param label Display label (e.g., 'Start Server')
   * @returns New ActionMetadataImpl instance
   */
  static create(componentName: string, methodName: string, label: string): ActionMetadataImpl {
    const action = new ActionMetadataImpl();
    action.component = componentName;
    action.method = methodName;
    action.action = Action.methodNameToActionId(methodName);
    action.label = label;
    return action;
  }
  
  /**
   * Convert camelCase method name to SCREAMING_SNAKE_CASE action ID
   * 
   * 'peerStart' → 'PEER_START'
   * 'peerStopAll' → 'PEER_STOP_ALL'
   */
  static methodNameToActionId(methodName: string): string {
    return methodName
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '');
  }
  
  /**
   * Parse action metadata from TSDoc comment
   * 
   * Parses annotations:
   * - @action 'Label Here'
   * - @actionIcon 'fa-play'
   * - @actionStyle PRIMARY
   * - @actionShortcut 'Ctrl+S'
   * - @actionConfirm 'Are you sure?'
   * 
   * @param componentName Component name
   * @param methodName Method name
   * @param tsdoc TSDoc comment string
   * @returns ActionMetadataImpl or null if no @action annotation
   */
  static parseFromTSDoc(componentName: string, methodName: string, tsdoc: string): Reference<ActionMetadataImpl> {
    // Check for @action annotation
    const actionMatch = tsdoc.match(/@action\s+['"]?([^'"\n]+)['"]?/);
    if (!actionMatch) {
      return null;
    }
    
    const action = Action.create(componentName, methodName, actionMatch[1].trim());
    
    // Parse @actionIcon
    const iconMatch = tsdoc.match(/@actionIcon\s+['"]?([^'"\n\s]+)['"]?/);
    if (iconMatch) {
      action.icon = iconMatch[1].trim();
    }
    
    // Parse @actionStyle
    const styleMatch = tsdoc.match(/@actionStyle\s+(\w+)/);
    if (styleMatch) {
      const styleName = styleMatch[1].toUpperCase();
      if (styleName in ActionStyle) {
        action.style = ActionStyle[styleName as keyof typeof ActionStyle];
      }
    }
    
    // Parse @actionShortcut
    const shortcutMatch = tsdoc.match(/@actionShortcut\s+['"]?([^'"\n]+)['"]?/);
    if (shortcutMatch) {
      action.shortcut = shortcutMatch[1].trim();
    }
    
    // Parse @actionConfirm
    const confirmMatch = tsdoc.match(/@actionConfirm\s+['"]?([^'"\n]+)['"]?/);
    if (confirmMatch) {
      action.confirmRequired = true;
      action.confirmMessage = confirmMatch[1].trim();
    }
    
    return action;
  }
}

