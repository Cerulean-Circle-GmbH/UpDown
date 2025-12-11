/**
 * TypeM3 Enum - MOF M3/M2/M1 hierarchy classification
 * 
 * ✅ Web4 Principle 4: Enum Everywhere
 * ✅ Web4 Principle 19: One File One Type
 * 
 * Purpose: MOF meta-model level classification for units
 * 
 * @pdca 2025-12-07-UTC-1800.unit-integration-scenario-storage.pdca.md
 */

export enum TypeM3 {
  /** Components, classes, objects */
  CLASS = 'CLASS',
  /** Files, properties, data */
  ATTRIBUTE = 'ATTRIBUTE',
  /** LD Links, associations, connections */
  RELATIONSHIP = 'RELATIONSHIP'
}




