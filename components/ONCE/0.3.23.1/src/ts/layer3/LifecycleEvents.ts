/**
 * Lifecycle Events v0.3.21.2 - DEPRECATED
 * ✅ Web4: One type per file compliance
 * 
 * This file is DEPRECATED and kept only for backward compatibility.
 * Import from individual files instead:
 * 
 * - LifecycleState → ./LifecycleState.enum.js
 * - LifecycleEventType → ./LifecycleEventType.enum.js
 * - LifecycleEvent → ./LifecycleEvent.interface.js
 * - LifecycycleObserver → ./LifecycleObserver.interface.js (replaces LifecycleEventHandler)
 * - LifecycleSubject → ./LifecycleSubject.interface.js (replaces LifecycleHooks)
 * 
 * @deprecated Use individual imports instead
 * @version 0.3.21.2
 */

// ✅ Re-export from new files for backward compatibility
export { LifecycleState } from './LifecycleState.enum.js';
export { LifecycleEventType } from './LifecycleEventType.enum.js';
export type { LifecycleEvent } from './LifecycleEvent.interface.js';
export type { LifecycleObserver } from './LifecycleObserver.interface.js';
export type { LifecycleSubject } from './LifecycleSubject.interface.js';

/**
 * @deprecated Use LifecycleObserver interface instead
 * This functional type will be removed in v0.3.22.0
 */
import type { LifecycleEvent } from './LifecycleEvent.interface.js';
export type LifecycleEventHandler = (event: LifecycleEvent) => void | Promise<void>;

/**
 * @deprecated Use LifecycleSubject and LifecycleObserver interfaces instead
 * This functional interface will be removed in v0.3.22.0
 */
export interface LifecycleHooks {
  beforeInit?: LifecycleEventHandler;
  afterInit?: LifecycleEventHandler;
  beforeStart?: LifecycleEventHandler;
  afterStart?: LifecycleEventHandler;
  beforePause?: LifecycleEventHandler;
  afterPause?: LifecycleEventHandler;
  beforeResume?: LifecycleEventHandler;
  afterResume?: LifecycleEventHandler;
  beforeStop?: LifecycleEventHandler;
  afterStop?: LifecycleEventHandler;
  beforeShutdown?: LifecycleEventHandler;
  afterShutdown?: LifecycleEventHandler;
  beforeSave?: LifecycleEventHandler;
  afterSave?: LifecycleEventHandler;
  beforeLoad?: LifecycleEventHandler;
  afterLoad?: LifecycleEventHandler;
  onServerRegistration?: LifecycleEventHandler;
  onServerDiscovery?: LifecycleEventHandler;
  onPortConflict?: LifecycleEventHandler;
  onPrimaryServerElection?: LifecycleEventHandler;
  onError?: LifecycleEventHandler;
  onWarning?: LifecycleEventHandler;
}
