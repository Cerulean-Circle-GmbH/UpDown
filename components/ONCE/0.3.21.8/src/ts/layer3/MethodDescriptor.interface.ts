/**
 * MethodDescriptor.interface.ts - Descriptor for class methods
 * 
 * Web4 Principle P28: DRY + Code-First
 * Web4 Principle P19: One File One Type
 * 
 * @ior ior:esm:/ONCE/{version}/MethodDescriptor.interface
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import type { FeatureDescriptor } from './FeatureDescriptor.interface.js';
import type { ParameterDescriptor } from './ParameterDescriptor.interface.js';
import type { Reference } from './Reference.interface.js';

/**
 * ActionMetadata - Metadata for methods marked with @action TSDoc
 * 
 * Actions are methods that can be invoked from the UI.
 */
export interface ActionMetadata {
  /**
   * Display label from @action TSDoc
   */
  label: string;
  
  /**
   * Icon from @actionIcon TSDoc (FontAwesome)
   */
  icon: string;
  
  /**
   * Style from @actionStyle TSDoc (PRIMARY, DANGER, etc.)
   */
  style: string;
  
  /**
   * Keyboard shortcut from @actionShortcut TSDoc
   */
  shortcut: Reference<string>;
  
  /**
   * Confirmation message from @actionConfirm TSDoc
   */
  confirmMessage: Reference<string>;
}

/**
 * MethodDescriptor - Describes class methods
 * 
 * Includes full signature and optional action metadata for UI-invokable methods.
 */
export interface MethodDescriptor extends FeatureDescriptor {
  /**
   * Name of the method
   */
  name: string;
  
  /**
   * Method parameters
   */
  parameters: ParameterDescriptor[];
  
  /**
   * Return type as string
   */
  returnType: string;
  
  /**
   * Whether method is async
   */
  isAsync: boolean;
  
  /**
   * Whether method has @action TSDoc tag
   */
  isAction: boolean;
  
  /**
   * Action metadata if isAction is true
   */
  actionMetadata: Reference<ActionMetadata>;
}

