/**
 * Lifecycle Event Type Enum
 * ✅ Web4: One enum per file
 * 
 * Defines all possible lifecycle event types for ONCE components
 * including server hierarchy events.
 * 
 * @version 0.3.21.2
 */

export enum LifecycleEventType {
  // Component lifecycle events
  BEFORE_INIT = 'before-init',
  AFTER_INIT = 'after-init',
  BEFORE_START = 'before-start',
  AFTER_START = 'after-start',
  BEFORE_PAUSE = 'before-pause',
  AFTER_PAUSE = 'after-pause',
  BEFORE_RESUME = 'before-resume',
  AFTER_RESUME = 'after-resume',
  BEFORE_STOP = 'before-stop',
  AFTER_STOP = 'after-stop',
  BEFORE_SHUTDOWN = 'before-shutdown',
  AFTER_SHUTDOWN = 'after-shutdown',
  
  // Scenario lifecycle events
  BEFORE_SAVE = 'before-save',
  AFTER_SAVE = 'after-save',
  BEFORE_LOAD = 'before-load',
  AFTER_LOAD = 'after-load',
  
  // Server hierarchy events (v0.2.0.0+)
  SERVER_REGISTRATION = 'server-registration',
  SERVER_DISCOVERY = 'server-discovery',
  PORT_CONFLICT = 'port-conflict',
  PRIMARY_SERVER_ELECTION = 'primary-server-election',
  
  // Error events
  ERROR = 'error',
  WARNING = 'warning'
}

