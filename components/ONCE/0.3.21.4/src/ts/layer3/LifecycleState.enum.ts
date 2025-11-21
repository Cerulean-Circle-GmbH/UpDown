/**
 * Lifecycle State Enum
 * ✅ Web4: One enum per file
 * 
 * Defines all possible lifecycle states for ONCE components
 * including server hierarchy states.
 * 
 * @version 0.3.21.2
 */

export enum LifecycleState {
  // Component lifecycle states
  CREATED = 'created',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  STARTING = 'starting',
  RUNNING = 'running',
  PAUSING = 'pausing',
  PAUSED = 'paused',
  RESUMING = 'resuming',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  SHUTTING_DOWN = 'shutting-down',
  SHUTDOWN = 'shutdown',
  
  // Server hierarchy states (v0.2.0.0+)
  REGISTERING = 'registering',
  REGISTERED = 'registered',
  PRIMARY_SERVER = 'primary-server',
  CLIENT_SERVER = 'client-server',
  
  // Error state
  ERROR = 'error'
}

