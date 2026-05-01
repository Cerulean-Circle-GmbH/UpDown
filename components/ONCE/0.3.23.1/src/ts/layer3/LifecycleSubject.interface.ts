/**
 * Lifecycle Subject Interface
 * ✅ Web4: TRUE Radical OOP - Observer Pattern
 * ✅ Replaces functional LifecycleHooks interface
 * 
 * Components that emit lifecycle events implement this interface.
 * Manages observer registration and event notification.
 * 
 * @version 0.3.21.2
 */

import { LifecycleObserver } from './LifecycleObserver.interface.js';
import { LifecycleEvent } from './LifecycleEvent.interface.js';

export interface LifecycleSubject {
  /**
   * Attach an observer to receive lifecycle events
   * @param observer The observer to attach
   */
  attach(observer: LifecycleObserver): void;
  
  /**
   * Detach an observer from receiving lifecycle events
   * @param observer The observer to detach
   */
  detach(observer: LifecycleObserver): void;
  
  /**
   * Notify all observers of a lifecycle event
   * ✅ Convention-over-configuration: Dynamically calls observer methods
   * ✅ Example: BEFORE_INIT event → calls observer.onBeforeInit()
   * 
   * @param event The lifecycle event to notify observers about
   */
  notify(event: LifecycleEvent): Promise<void>;
}

