/**
 * TraceabilityLink - Link to related objects (tests, components, etc.)
 * Web4 pattern: One file, one type (Principle 19)
 * 
 * @pdca 2025-12-02-UTC-2145.fix-web4-principle-violations.pdca.md
 */

export interface TraceabilityLink {
  sourceIOR: string;              // IOR of this requirement
  targetIOR: string;              // IOR of related object
  relationType: 'implements' | 'tests' | 'requires' | 'validates' | 'uses';
  createdAt: string;
}

