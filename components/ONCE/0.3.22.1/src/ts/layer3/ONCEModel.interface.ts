/**
 * ONCEModel - ONCE Component Model Interface
 * Web4 pattern: Component model following auto-discovery patterns
 * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md - Split to one type per file
 */

import { Model } from './Model.interface.js';
import type { Scenario } from './Scenario.interface.js';
import type { ONCEPeerModel } from './ONCEPeerModel.interface.js';
import { LifecycleEventType } from './LifecycleEventType.enum.js';
import { LifecycleState } from './LifecycleState.enum.js';
import { LifecycleObserver } from './LifecycleObserver.interface.js';
import { ONCEServerModel } from './ONCEServerModel.interface.js';

// ⚠️ DEPRECATED: Keeping type definition for backward compatibility until Iteration 1.6.3
// @pdca 2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md - Iteration 1.6.2
// Type definition kept inline to avoid dependency on deleted interface file
type ONCEMessageTracker = {
  sent: any[];
  received: any[];
  acknowledged: string[];
  patterns: {
    broadcast: number;
    relay: number;
    p2p: number;
  };
};

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
  state?: LifecycleState;                              // ✅ Current lifecycle state
  initialized?: boolean;                           // ONCE kernel initialization flag
  initializationTime?: number;                     // Time taken for initialization (ms)
  scenario?: Scenario<ONCEPeerModel>;                        // Current ONCE scenario
  serverModel?: ONCEServerModel;                   // Server model for hierarchy
  eventHandlers?: Map<LifecycleEventType, LifecycleEventHandler[]>; // ⚠️ DEPRECATED: Use observers instead
  observers?: LifecycleObserver[];                 // ✅ TRUE Radical OOP: Observer pattern (replaces eventHandlers)
  
  // 🌐 Primary Server IOR with Failover Profiles
  // @pdca 2025-11-22-UTC-1430.iteration-01.6.4a-ior-failover.pdca.md
  /**
   * Primary Server IOR with failover profiles
   * Supports CORBA 2.3+ style failover: comma-separated host:port pairs
   * 
   * Examples:
   * - Single host: 'ior:https://localhost:42777/ONCE/0.3.21.6/primary-uuid'
   * - Multi-region: 'ior:https://primary.once.network:42777,europe:42778,asia:42779/ONCE/0.3.21.6/registry-uuid'
   * 
   * Resolution tries profiles in sequence until one succeeds
   */
  primaryServerIor?: string;
  
  // 📨 Message Exchange Properties - TRUE Radical OOP
  // ⚠️ DEPRECATED: Protocol-based messaging violates Web4 protocol-less communication
  // @pdca 2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md - Iteration 1.6.2
  // @deprecated Will be removed in Iteration 1.6.3 (P2P redesign with scenario replication)
  messageTracker?: ONCEMessageTracker;             // TEMPORARILY KEPT for backward compatibility with demoMessages
}
