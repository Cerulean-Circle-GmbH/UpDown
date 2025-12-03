/**
 * Web4RequirementModel - Web4Requirement Component Model Interface
 * Web4 pattern: One file, one type (Principle 19)
 * Web4 pattern: Reference<T> for nullable references (Principle 5)
 * 
 * @pdca 2025-12-02-UTC-2145.fix-web4-principle-violations.pdca.md
 */

import { Model } from './Model.interface.js';
import { Reference } from './Reference.interface.js';
import { AcceptanceCriterion } from './AcceptanceCriterion.interface.js';
import { TraceabilityLink } from './TraceabilityLink.interface.js';

export interface Web4RequirementModel extends Model {
  uuid: string;
  name: string;
  description: string;            // Requirement description
  origin: string;                 // Where this requirement came from
  definition: string;             // Formal definition
  createdAt: string;
  updatedAt: string;
  
  // ✅ Acceptance Criteria (Radical OOP)
  acceptanceCriteria: AcceptanceCriterion[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  
  // Traceability
  testCaseIORs: string[];         // IORs of test cases that validate this requirement
  traceabilityChain: TraceabilityLink[];
  
  // Component metadata (Reference<T> for nullable - Principle 5)
  component: Reference<string>;             // Component name for CLI display
  version: Reference<string>;               // Component version for CLI display and test promotion
  
  // @pdca 2025-11-10-UTC-1010.pdca.md - Path Authority fields for delegation
  componentRoot: Reference<string>;         // THIS component's root directory
  projectRoot: Reference<string>;           // Project root directory (for delegation)
  targetDirectory: Reference<string>;       // Target directory for operations (Path Authority from CLI)
  targetComponentRoot: Reference<string>;   // Target component's root (for tree/links delegation)
  context: Reference<any>;                  // Context for "on" delegation mode (holds delegated component instance)
  isTestIsolation: Reference<boolean>;      // Test isolation mode flag (for DelegationProxy context)
}
