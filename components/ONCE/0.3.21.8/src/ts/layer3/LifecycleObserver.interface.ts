/**
 * Lifecycle Observer Interface
 * ✅ Web4: TRUE Radical OOP - Observer Pattern
 * ✅ Replaces functional LifecycleEventHandler type
 * 
 * Components implement this interface to observe lifecycle events.
 * Convention-over-configuration: Event type maps to method name.
 * Example: BEFORE_INIT → onBeforeInit()
 * 
 * @version 0.3.21.2
 */

import { LifecycleEvent } from './LifecycleEvent.interface.js';

export interface LifecycleObserver {
  /**
   * Called before component initialization
   */
  onBeforeInit?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called after component initialization
   */
  onAfterInit?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called before component start
   */
  onBeforeStart?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called after component start
   */
  onAfterStart?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called before component pause
   */
  onBeforePause?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called after component pause
   */
  onAfterPause?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called before component resume
   */
  onBeforeResume?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called after component resume
   */
  onAfterResume?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called before component stop
   */
  onBeforeStop?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called after component stop
   */
  onAfterStop?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called before component shutdown
   */
  onBeforeShutdown?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called after component shutdown
   */
  onAfterShutdown?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called before scenario save
   */
  onBeforeSave?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called after scenario save
   */
  onAfterSave?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called before scenario load
   */
  onBeforeLoad?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called after scenario load
   */
  onAfterLoad?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called on server registration (server hierarchy)
   */
  onServerRegistration?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called on server discovery (server hierarchy)
   */
  onServerDiscovery?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called on port conflict (server hierarchy)
   */
  onPortConflict?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called on primary server election (server hierarchy)
   */
  onPrimaryServerElection?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called on error
   */
  onError?(event: LifecycleEvent): void | Promise<void>;
  
  /**
   * Called on warning
   */
  onWarning?(event: LifecycleEvent): void | Promise<void>;
}

