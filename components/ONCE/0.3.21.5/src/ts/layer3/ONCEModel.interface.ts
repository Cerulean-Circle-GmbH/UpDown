/**
 * ONCEModel - ONCE Component Model Interface
 * Web4 pattern: Component model following auto-discovery patterns
 * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md - Split to one type per file
 */

import { Model } from './Model.interface.js';
import { LegacyONCEScenario } from './LegacyONCEScenario.interface.js';
import { LifecycleEventType } from './LifecycleEventType.enum.js';
import { LifecycleObserver } from './LifecycleObserver.interface.js';
import { ONCEServerModel } from './ONCEServerModel.interface.js';
import { ONCEMessageTracker } from './ONCEMessageTracker.interface.js';

// ⚠️ DEPRECATED: Functional event handlers (will be removed in future version)
// Use LifecycleObserver instead
type LifecycleEventHandler = (event: any) => void | Promise<void>;

export interface ONCEModel extends Model {
  uuid: string;
  name: string;
  origin: string;
  definition: string;
  createdAt: string;
  updatedAt: string;
  component?: string;             // Component name for CLI display
  version?: string;               // Component version for CLI display and test promotion
  // @pdca 2025-11-10-UTC-1010.pdca.md - Path Authority fields for delegation
  componentRoot?: string;         // THIS component's root directory
  projectRoot?: string;           // Project root directory (for delegation)
  targetDirectory?: string;       // Target directory for operations (Path Authority from CLI)
  targetComponentRoot?: string;   // Target component's root (for tree/links delegation)
  context?: any;                  // Context for "on" delegation mode (holds delegated component instance)
  
  // 🎯 Radical OOP Properties - Store ONCE, Never Recalculate
  // @pdca 2025-11-10-UTC-1400.eliminate-functional-helpers-make-model-driven.pdca.md
  isTestIsolation?: boolean;      // Flag for test isolation mode
  testDataDirectory?: string;     // Test data directory path (when isTestIsolation = true)
  displayName?: string;           // Component name to show (this OR context)
  displayVersion?: string;        // Version to show (this OR context)
  isDelegation?: boolean;         // true if this.model.context exists
  delegationInfo?: string;        // e.g., "via Web4TSComponent v0.3.19.0"
  testIsolationContext?: string;  // e.g., "Web4TSComponent v0.3.19.0" or null
  componentsDirectory?: string;   // Pre-calculated components directory

  // 🔌 ONCE Domain Properties - Store ONCE Server State
  // @pdca 2025-11-10-UTC-1830.migrate-once-to-0.3.20.0.pdca.md
  initialized?: boolean;                           // ONCE kernel initialization flag
  initializationTime?: number;                     // Time taken for initialization (ms)
  scenario?: LegacyONCEScenario;                             // Current ONCE scenario
  serverModel?: ONCEServerModel;                   // Server model for hierarchy
  eventHandlers?: Map<LifecycleEventType, LifecycleEventHandler[]>; // ⚠️ DEPRECATED: Use observers instead
  observers?: LifecycleObserver[];                 // ✅ TRUE Radical OOP: Observer pattern (replaces eventHandlers)
  
  // 📨 Message Exchange Properties - TRUE Radical OOP
  // @pdca 2025-11-11-UTC-2322.pdca.md - Model-driven message tracking
  messageTracker?: ONCEMessageTracker;             // All message tracking in model
}
