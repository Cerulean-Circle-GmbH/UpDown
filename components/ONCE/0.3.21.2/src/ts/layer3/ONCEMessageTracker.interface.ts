/**
 * Message Tracker - Model-driven message tracking (TRUE Radical OOP)
 * No private state, all in model
 * 
 * @layer3
 * @pattern Interface Contract
 * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md
 * @see 2025-11-11-UTC-2322.pdca.md - Model-driven message tracking
 */

import { ONCEScenarioMessage } from './ONCEScenarioMessage.interface.js';

export interface ONCEMessageTracker {
  sent: ONCEScenarioMessage[];
  received: ONCEScenarioMessage[];
  acknowledged: string[]; // UUIDs of acknowledged messages
  patterns: {
    broadcast: number;
    relay: number;
    p2p: number;
  };
}

