/**
 * AcceptanceCriterion - Single acceptance criterion with validation state
 * Web4 pattern: One file, one type (Principle 19)
 * 
 * @pdca 2025-12-02-UTC-2145.fix-web4-principle-violations.pdca.md
 */

import { Reference } from './Reference.interface.js';

export interface AcceptanceCriterion {
  id: string;                                    // Unique ID for this criterion (e.g., "AC-01")
  description: string;                           // Human-readable description
  status: 'pending' | 'passed' | 'failed';
  validatedAt: Reference<string>;                // ISO timestamp when validated
  evidence: Reference<any>;                      // Evidence data supporting the validation
  errorMessage: Reference<string>;               // Error message if failed
}

