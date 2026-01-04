/**
 * Lifecycle Event Interface
 * ✅ Web4: One interface per file
 * 
 * Represents a lifecycle event that occurs during component execution.
 * 
 * @version 0.3.21.2
 * @pdca 2025-12-17-UTC-1830.model-consolidation.pdca.md - MC.3
 */

import { LifecycleEventType } from './LifecycleEventType.enum.js';
import { Component } from './Component.interface.js';
import type { Scenario } from './Scenario.interface.js';
import type { ONCEPeerModel } from './ONCEPeerModel.interface.js';

export interface LifecycleEvent {
  /**
   * Type of lifecycle event
   */
  type: LifecycleEventType;
  
  /**
   * ISO 8601 timestamp when event occurred
   */
  timestamp: string;
  
  /**
   * Component that triggered the event (optional)
   */
  component?: Component;
  
  /**
   * Scenario involved in the event (optional)
   * MC.3: Now uses Scenario<ONCEPeerModel>
   */
  scenario?: Scenario<ONCEPeerModel>;
  
  /**
   * Additional event data (optional)
   */
  data?: any;
  
  /**
   * Error object if this is an error event (optional)
   */
  error?: Error;
}

