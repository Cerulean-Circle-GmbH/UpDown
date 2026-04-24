/**
 * LifecycleState.enum.ts - Universal lifecycle for UcpComponent
 * 
 * ✅ Web4: One enum per file
 * 
 * Two dimensions:
 * 1. CLASS level (static): UNLOADED → LOADED → STARTED → CLASS_STOPPED
 * 2. INSTANCE level: CREATED → INITIALIZED → READY → RUNNING → STOPPED
 * 
 * @version 0.3.22.2
 * @pdca session/2026-01-06-UTC-1600.web4-component-lifecycle.pdca.md
 */

export enum LifecycleState {
  // ═══════════════════════════════════════════════════════════════
  // CLASS LEVEL (static, once per class)
  // ═══════════════════════════════════════════════════════════════
  
  /** Class not loaded */
  UNLOADED = 'unloaded',
  
  /** Module import in progress */
  LOADING = 'loading',
  
  /** Module imported, .type.json loaded */
  LOADED = 'loaded',
  
  /** static start() in progress: TypeRegistry + Views + CSS */
  STARTING = 'starting',
  
  /** Class ready: TypeRegistry registered, Views loaded, CSS applied */
  STARTED = 'started',
  
  // ═══════════════════════════════════════════════════════════════
  // INSTANCE LEVEL (per instance)
  // ═══════════════════════════════════════════════════════════════
  
  /** new() called, instance is blackbox */
  CREATED = 'created',
  
  /** init() in progress */
  INITIALIZING = 'initializing',
  
  /** init() complete, model wired */
  INITIALIZED = 'initialized',
  
  /** Views bound, fully operational */
  READY = 'ready',
  
  /** Active, syncing with peers */
  RUNNING = 'running',
  
  /** Pause in progress */
  PAUSING = 'pausing',
  
  /** Paused */
  PAUSED = 'paused',
  
  /** Resume in progress */
  RESUMING = 'resuming',
  
  /** Instance shutdown in progress */
  STOPPING = 'stopping',
  
  /** Instance resources released */
  STOPPED = 'stopped',
  
  // ═══════════════════════════════════════════════════════════════
  // SHUTDOWN (instance or service teardown)
  // ═══════════════════════════════════════════════════════════════
  
  /** Shutdown in progress */
  SHUTTING_DOWN = 'shutting-down',
  
  /** Shutdown complete */
  SHUTDOWN = 'shutdown',
  
  // ═══════════════════════════════════════════════════════════════
  // CLASS LEVEL TEARDOWN
  // ═══════════════════════════════════════════════════════════════
  
  /** static stop() in progress */
  CLASS_STOPPING = 'class-stopping',
  
  /** Unregistered from TypeRegistry */
  CLASS_STOPPED = 'class-stopped',
  
  // ═══════════════════════════════════════════════════════════════
  // SERVER HIERARCHY STATES (ONCE kernel specific)
  // ═══════════════════════════════════════════════════════════════
  
  /** Registering with server hierarchy */
  REGISTERING = 'registering',
  
  /** Registered in server hierarchy */
  REGISTERED = 'registered',
  
  /** This instance is the primary server */
  PRIMARY_SERVER = 'primary-server',
  
  /** This instance is a client server */
  CLIENT_SERVER = 'client-server',
  
  // ═══════════════════════════════════════════════════════════════
  // ERROR
  // ═══════════════════════════════════════════════════════════════
  
  /** Error state */
  ERROR = 'error'
}

