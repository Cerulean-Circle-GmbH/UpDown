/**
 * Web4 Scenario Message - TRUE Radical OOP Message Format
 * MUST BE a Scenario (not just look like one)
 * 
 * @layer3
 * @pattern Interface Contract
 * @pdca session/2025-11-19-UTC-1805.iteration-01-layer3-split.pdca.md
 * @see 2025-11-11-UTC-2322.pdca.md - Automated multi-server demo
 */

import { LegacyONCEScenario } from './LegacyONCEScenario.interface.js';

export interface ONCEScenarioMessage extends LegacyONCEScenario {
  // Override objectType to be specific
  objectType: 'ONCEMessage';
  
  // Override uuid to be specific (add uuid field explicitly)
  uuid: string;
  
  // Message-specific state structure
  state: {
    type: 'broadcast' | 'relay' | 'p2p';
    from: { uuid: string; port: number };
    to: { uuid: string; port: number } | 'all';
    content: string;
    timestamp: string;
    sequence: number;
  };
}

