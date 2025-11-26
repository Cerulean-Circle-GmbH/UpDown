/**
 * LifecycleManager Interface
 * ✅ Web4: One interface per file
 * 
 * Manages lifecycle events and observers using TRUE Radical OOP pattern.
 * NO callbacks, NO arrow functions - just Observer Pattern with proper OOP methods.
 * 
 * Lifecycle Flow:
 * CREATED → INITIALIZING → INITIALIZED → STARTING → RUNNING → 
 * STOPPING → STOPPED → SHUTTING_DOWN → SHUTDOWN
 * 
 * Optional: PAUSING → PAUSED → RESUMING → RUNNING
 * Error: Any state → ERROR
 * 
 * @pattern Observer Pattern
 * @layer Layer 3 (Interface)
 * @version 0.3.21.6
 * @pdca session/2025-11-26-UTC-0000.iteration-01.13-lifecycle-events-radical-oop.pdca.md
 */

import type { LifecycleObserver } from './LifecycleObserver.interface.js';
import type { LifecycleEventType } from './LifecycleEventType.enum.js';
import type { LifecycleState } from './LifecycleState.enum.js';

export interface LifecycleManager {
    /**
     * Attach lifecycle observer
     * 
     * Observer must implement LifecycleObserver interface with methods like:
     * - onBeforeInit(kernel)
     * - onAfterInit(kernel)
     * - onBeforeStart(kernel)
     * - onAfterStart(kernel)
     * etc.
     * 
     * @param observer - Observer to attach
     * 
     * @example
     * ```typescript
     * class MyObserver implements LifecycleObserver {
     *   onBeforeStart(kernel: OnceKernel): void {
     *     console.log('Kernel is starting...');
     *   }
     * }
     * 
     * kernel.attachObserver(new MyObserver());
     * ```
     */
    attachObserver(observer: LifecycleObserver): void;
    
    /**
     * Detach lifecycle observer
     * 
     * Removes observer from notification list.
     * 
     * @param observer - Observer to detach
     */
    detachObserver(observer: LifecycleObserver): void;
    
    /**
     * Notify all observers of lifecycle event
     * 
     * Uses convention-over-configuration to call appropriate observer method:
     * - BEFORE_INIT → observer.onBeforeInit(this, data)
     * - AFTER_INIT → observer.onAfterInit(this, data)
     * - BEFORE_START → observer.onBeforeStart(this, data)
     * - AFTER_START → observer.onAfterStart(this, data)
     * - ERROR → observer.onError(this, data)
     * 
     * If observer doesn't implement specific method, silently skips.
     * 
     * @param eventType - Type of lifecycle event
     * @param data - Optional event data
     */
    notifyObservers(eventType: LifecycleEventType, data?: any): void;
    
    /**
     * Get current lifecycle state
     * 
     * Returns the current state from the kernel's model.
     * 
     * @returns Current lifecycle state
     */
    getLifecycleState(): LifecycleState;
    
    /**
     * Validate state transition
     * 
     * Checks if transition from current state to target state is valid.
     * 
     * Valid transitions:
     * - CREATED → INITIALIZING
     * - INITIALIZING → INITIALIZED | ERROR
     * - INITIALIZED → STARTING
     * - STARTING → RUNNING | ERROR
     * - RUNNING → PAUSING | STOPPING
     * - PAUSING → PAUSED | ERROR
     * - PAUSED → RESUMING
     * - RESUMING → RUNNING | ERROR
     * - STOPPING → STOPPED | ERROR
     * - STOPPED → SHUTTING_DOWN
     * - SHUTTING_DOWN → SHUTDOWN | ERROR
     * - Any state → ERROR (always valid)
     * 
     * @param targetState - Target state to transition to
     * @returns true if transition is valid, false otherwise
     */
    canTransitionTo(targetState: LifecycleState): boolean;
    
    /**
     * Transition to new state
     * 
     * Validates transition, updates model.state, notifies observers.
     * 
     * Process:
     * 1. Validate transition (throw if invalid)
     * 2. Update model.state to target state
     * 3. Notify observers with BEFORE_* event
     * 4. (Caller performs actual work)
     * 5. Notify observers with AFTER_* event
     * 
     * @param targetState - Target state to transition to
     * @param eventType - Lifecycle event type (BEFORE_* or AFTER_*)
     * @param data - Optional event data
     * 
     * @throws Error if transition is invalid
     * 
     * @example
     * ```typescript
     * // In init() method:
     * this.transitionTo(LifecycleState.INITIALIZING, LifecycleEventType.BEFORE_INIT);
     * // ... do initialization work ...
     * this.transitionTo(LifecycleState.INITIALIZED, LifecycleEventType.AFTER_INIT);
     * ```
     */
    transitionTo(targetState: LifecycleState, eventType: LifecycleEventType, data?: any): void;
}

