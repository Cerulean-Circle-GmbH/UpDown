/**
 * DefaultOnceKernel - Base class for all ONCE kernel implementations
 * 
 * Extends UcpComponent for Web4 compliance:
 * - View management via UcpController
 * - RelatedObjects registry
 * - Scenario serialization
 * 
 * Provides common functionality for:
 * - Node.js (NodeJsOnce)
 * - Browser (BrowserOnce)
 * - Web Worker (WorkerOnce)
 * - Service Worker (ServiceWorkerOnce)
 * 
 * Radical OOP Pattern:
 * - Empty constructor
 * - State in this.model
 * - Methods operate on model
 * - No arrow functions, no callbacks
 * - Observer Pattern for lifecycle events
 * 
 * Note: Does NOT implement full OnceKernel interface - that's environment-specific
 * Only provides shared helper methods and lifecycle management
 * 
 * @layer2
 * @pattern Abstract Base Class + Observer Pattern + UcpComponent
 * @pdca session/2025-11-26-UTC-0000.iteration-01.13-lifecycle-events-radical-oop.pdca.md
 * @pdca session/2025-12-05-UTC-1500.spa-architecture-cleanup.pdca.md - B.6
 */

import type { Reference } from '../layer3/Reference.interface.js';
import type { Model } from '../layer3/Model.interface.js';
import type { Scenario } from '../layer3/Scenario.interface.js';
import type { LifecycleObserver } from '../layer3/LifecycleObserver.interface.js';
import type { LifecycleManager } from '../layer3/LifecycleManager.interface.js';
import { LifecycleEventType } from '../layer3/LifecycleEventType.enum.js';
import { LifecycleState } from '../layer3/LifecycleState.enum.js';
import { UcpComponent } from './UcpComponent.js';

/**
 * OnceKernelModel - Extended model for ONCE kernels
 * Includes lifecycle state for observer pattern
 */
export interface OnceKernelModel extends Model {
    state?: LifecycleState;
}

export abstract class DefaultOnceKernel<TModel extends OnceKernelModel = OnceKernelModel> extends UcpComponent<TModel> implements LifecycleManager {
    // model is inherited from UcpComponent with generic type TModel
    
    /**
     * Lifecycle observers (Observer Pattern)
     * NO callbacks, just objects implementing LifecycleObserver
     */
    private observers: LifecycleObserver[] = [];
    
    /**
     * Current lifecycle state
     * Stored here for quick access, also reflected in model.state when model exists
     */
    private lifecycleState: LifecycleState = LifecycleState.CREATED;
    
    /**
     * Empty constructor (Radical OOP)
     * All initialization happens in init()
     * @pdca B.6 - Now extends UcpComponent
     */
    constructor() {
        super();  // ✅ Initialize UcpComponent (controller, model = null)
        // State initialized to CREATED
    }
    
    // modelDefault() REMOVED — @pdca 2026-01-06-UTC-1200.modeldefault-elimination.pdca.md MDE.2
    // Subclasses assign scenario.model inline in their init() method
    
    /**
     * Initialize kernel with scenario
     * 
     * Subclasses MUST override and assign scenario.model before calling super.init()
     * 
     * @param scenario - Initialization scenario (Scenario<TModel>)
     * @returns this - Fluent API (SYNC ONLY)
     * @pdca 2026-01-06-UTC-1200.modeldefault-elimination.pdca.md MDE.2
     */
    init(scenario?: Scenario<TModel>): this {
        // Subclass must have already assigned scenario.model before calling here
        super.init(scenario);
        return this;
    }
    
    /**
     * Get kernel health status
     * Subclasses should implement this
     * 
     * @returns Promise<any> - Health status object
     */
    abstract getHealth(): Promise<any>;
    
    // ========================================
    // LIFECYCLE MANAGEMENT (Observer Pattern)
    // ========================================
    
    /**
     * Attach lifecycle observer
     * 
     * @param observer - Observer to attach
     */
    public attachObserver(observer: LifecycleObserver): void {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
        }
    }
    
    /**
     * Detach lifecycle observer
     * 
     * @param observer - Observer to detach
     */
    public detachObserver(observer: LifecycleObserver): void {
        const index = this.observers.indexOf(observer);
        if (index !== -1) {
            this.observers.splice(index, 1);
        }
    }
    
    /**
     * Notify all observers of lifecycle event
     * 
     * Uses convention-over-configuration to call appropriate observer method.
     * Converts event type to method name: BEFORE_START → onBeforeStart
     * 
     * @param eventType - Type of lifecycle event
     * @param data - Optional event data
     */
    public notifyObservers(eventType: LifecycleEventType, data?: any): void {
        // Convert event type to method name (e.g., BEFORE_START → onBeforeStart)
        const methodName = this.eventTypeToMethodName(eventType);
        
        for (const observer of this.observers) {
            const method = (observer as any)[methodName];
            if (typeof method === 'function') {
                try {
                    method.call(observer, this, data);
                } catch (error) {
                    console.error(`[DefaultOnceKernel] Observer method ${methodName} error:`, error);
                }
            }
        }
    }
    
    /**
     * Get current lifecycle state
     * 
     * @returns Current lifecycle state
     */
    public getLifecycleState(): LifecycleState {
        return this.lifecycleState;
    }
    
    /**
     * Validate state transition
     * 
     * @param targetState - Target state to transition to
     * @returns true if transition is valid
     */
    public canTransitionTo(targetState: LifecycleState): boolean {
        const currentState = this.lifecycleState;
        
        // ERROR state can be reached from any state
        if (targetState === LifecycleState.ERROR) {
            return true;
        }
        
        // Define valid transitions
        const validTransitions: Record<LifecycleState, LifecycleState[]> = {
            // Class-level states (static lifecycle)
            [LifecycleState.UNLOADED]: [LifecycleState.LOADING],
            [LifecycleState.LOADING]: [LifecycleState.LOADED, LifecycleState.ERROR],
            [LifecycleState.LOADED]: [LifecycleState.STARTING],
            [LifecycleState.STARTED]: [LifecycleState.CLASS_STOPPING],
            [LifecycleState.CLASS_STOPPING]: [LifecycleState.CLASS_STOPPED, LifecycleState.ERROR],
            [LifecycleState.CLASS_STOPPED]: [], // Terminal for class
            
            // Instance-level states
            // CREATED can go to INITIALIZING (component) or STARTING (server - legacy)
            [LifecycleState.CREATED]: [LifecycleState.INITIALIZING, LifecycleState.STARTING],
            [LifecycleState.INITIALIZING]: [LifecycleState.INITIALIZED, LifecycleState.ERROR],
            [LifecycleState.INITIALIZED]: [LifecycleState.READY, LifecycleState.STARTING],
            [LifecycleState.READY]: [LifecycleState.RUNNING, LifecycleState.STOPPING],
            [LifecycleState.STARTING]: [LifecycleState.RUNNING, LifecycleState.STARTED, LifecycleState.ERROR],
            [LifecycleState.RUNNING]: [LifecycleState.PAUSING, LifecycleState.STOPPING],
            [LifecycleState.PAUSING]: [LifecycleState.PAUSED, LifecycleState.ERROR],
            [LifecycleState.PAUSED]: [LifecycleState.RESUMING],
            [LifecycleState.RESUMING]: [LifecycleState.RUNNING, LifecycleState.ERROR],
            [LifecycleState.STOPPING]: [LifecycleState.STOPPED, LifecycleState.ERROR],
            [LifecycleState.STOPPED]: [LifecycleState.SHUTTING_DOWN],
            [LifecycleState.SHUTTING_DOWN]: [LifecycleState.SHUTDOWN, LifecycleState.ERROR],
            [LifecycleState.SHUTDOWN]: [], // Terminal state
            [LifecycleState.ERROR]: [LifecycleState.STOPPED], // Can recover to STOPPED
            
            // Server hierarchy states (special cases)
            [LifecycleState.REGISTERING]: [LifecycleState.REGISTERED, LifecycleState.ERROR],
            [LifecycleState.REGISTERED]: [LifecycleState.RUNNING, LifecycleState.ERROR],
            [LifecycleState.PRIMARY_SERVER]: [LifecycleState.RUNNING, LifecycleState.STOPPING],
            [LifecycleState.CLIENT_SERVER]: [LifecycleState.RUNNING, LifecycleState.STOPPING]
        };
        
        const allowedTargets = validTransitions[currentState] || [];
        return allowedTargets.includes(targetState);
    }
    
    /**
     * Transition to new state
     * 
     * Validates transition, updates state, updates model if exists, notifies observers.
     * 
     * @param targetState - Target state to transition to
     * @param eventType - Lifecycle event type (for observer notification)
     * @param data - Optional event data
     * 
     * @throws Error if transition is invalid
     */
    public transitionTo(targetState: LifecycleState, eventType: LifecycleEventType, data?: any): void {
        // Validate transition
        if (!this.canTransitionTo(targetState)) {
            throw new Error(
                `[DefaultOnceKernel] Invalid state transition: ${this.lifecycleState} → ${targetState}`
            );
        }
        
        // Update state
        this.lifecycleState = targetState;
        
        // Update model if it exists (after init)
        if (this.model && 'state' in this.model) {
            (this.model as OnceKernelModel).state = targetState;
        }
        
        // Notify observers
        this.notifyObservers(eventType, data);
    }
    
    /**
     * Convert lifecycle event type to observer method name
     * 
     * Convention: BEFORE_START → onBeforeStart
     * 
     * @param eventType - Lifecycle event type
     * @returns Method name
     */
    private eventTypeToMethodName(eventType: LifecycleEventType): string {
        // Convert kebab-case to camelCase and prefix with 'on'
        // Example: 'before-start' → 'onBeforeStart'
        const parts = eventType.split('-');
        const camelCase = parts.map((part, index) => {
            return index === 0 
                ? part.charAt(0).toUpperCase() + part.slice(1)
                : part.charAt(0).toUpperCase() + part.slice(1);
        }).join('');
        
        return 'on' + camelCase;
    }
    
    // ========================================
    // SHARED HELPER METHODS
    // ========================================
    
    /**
     * Generate UUID v4
     * 
     * @returns string - UUID
     */
    protected generateUUID(): string {
        // RFC 4122 version 4 UUID
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * Format timestamp for logs
     * 
     * @param date - Optional date (defaults to now)
     * @returns string - Formatted timestamp
     */
    protected formatTimestamp(date?: Date): string {
        const d = date || new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
               `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    
    /**
     * Format duration in milliseconds to human-readable string
     * 
     * @param ms - Duration in milliseconds
     * @returns string - Formatted duration
     */
    protected formatDuration(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    /**
     * Deep clone object (simple implementation)
     * 
     * @param obj - Object to clone
     * @returns any - Cloned object
     */
    protected deepClone(obj: any): any {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }
        
        const cloned: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = this.deepClone(obj[key]);
            }
        }
        return cloned;
    }
    
    /**
     * Sleep/delay helper
     * 
     * @param ms - Milliseconds to sleep
     * @returns Promise<void>
     */
    protected sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Safe JSON stringify with error handling
     * 
     * @param obj - Object to stringify
     * @param pretty - Pretty print (default: false)
     * @returns string - JSON string or error message
     */
    protected safeStringify(obj: any, pretty: boolean = false): string {
        try {
            return JSON.stringify(obj, null, pretty ? 2 : 0);
        } catch (error) {
            return `[JSON stringify error: ${(error as Error).message}]`;
        }
    }
    
    /**
     * Safe JSON parse with error handling
     * 
     * @param json - JSON string
     * @returns any - Parsed object or null
     */
    protected safeParse(json: string): any {
        try {
            return JSON.parse(json);
        } catch (error) {
            console.error(`[AbstractONCEKernel] JSON parse error: ${(error as Error).message}`);
            return null;
        }
    }
    
    /**
     * Get model (accessor for subclasses)
     * 
     * @returns any - Current model
     */
    protected getModel(): any {
        return this.model;
    }
    
    // isInitialized() REMOVED — now a getter in UcpComponent
    // @pdca 2026-01-06-UTC-1400.initialization-guard.pdca.md IG.1
}

