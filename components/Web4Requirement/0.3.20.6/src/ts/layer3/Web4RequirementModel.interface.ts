/**
 * Web4RequirementModel - Web4Requirement Component Model Interface
 * Web4 pattern: Component model following auto-discovery patterns
 * 
 * ✅ Supports acceptance criteria for Tootsie test validation
 */

import { Model } from './Model.interface.js';

/**
 * AcceptanceCriterion - Single acceptance criterion with validation state
 */
export interface AcceptanceCriterion {
  id: string;                     // Unique ID for this criterion (e.g., "AC-01")
  description: string;            // Human-readable description
  status: 'pending' | 'passed' | 'failed';
  validatedAt?: string;           // ISO timestamp when validated
  evidence?: any;                 // Evidence data supporting the validation
  errorMessage?: string;          // Error message if failed
}

/**
 * TraceabilityLink - Link to related objects (tests, components, etc.)
 */
export interface TraceabilityLink {
  sourceIOR: string;              // IOR of this requirement
  targetIOR: string;              // IOR of related object
  relationType: 'implements' | 'tests' | 'requires' | 'validates' | 'uses';
  createdAt: string;
}

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
  
  // Component metadata
  component?: string;             // Component name for CLI display
  version?: string;               // Component version for CLI display and test promotion
  
  // @pdca 2025-11-10-UTC-1010.pdca.md - Path Authority fields for delegation
  componentRoot?: string;         // THIS component's root directory
  projectRoot?: string;           // Project root directory (for delegation)
  targetDirectory?: string;       // Target directory for operations (Path Authority from CLI)
  targetComponentRoot?: string;   // Target component's root (for tree/links delegation)
  context?: any;                  // Context for "on" delegation mode (holds delegated component instance)
  isTestIsolation?: boolean;      // Test isolation mode flag (for DelegationProxy context)
}
