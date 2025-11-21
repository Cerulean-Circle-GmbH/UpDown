/**
 * Lifecycle Event Interface
 * ✅ Web4: One interface per file
 * 
 * Represents a lifecycle event that occurs during component execution.
 * 
 * @version 0.3.21.2
 */

import { LifecycleEventType } from './LifecycleEventType.enum.js';
import { Component } from './Component.js';
import { LegacyONCEScenario } from './LegacyONCEScenario.interface.js';

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
   */
  scenario?: LegacyONCEScenario;
  
  /**
   * Additional event data (optional)
   */
  data?: any;
  
  /**
   * Error object if this is an error event (optional)
   */
  error?: Error;
}

