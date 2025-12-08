/**
 * Scenario - Web4 Scenario Interface with Complete IOR
 * Web4 pattern: Scenario support for component state management
 * 
 * Generic type T must extend Model (Web4 Principle 1a: All models extend Model)
 * 
 * Scenario is an aggregation of:
 * 1. IOR (Internet Object Reference) - identity & network location
 * 2. owner (UserModel) - ownership attribution
 * 3. model (T extends Model) - component-specific state
 * 4. unit (ScenarioUnit) - OPTIONAL reference tracking & schema versioning
 * 
 * @pdca session/2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md
 * @pdca session/2025-12-08-UTC-1000.scenario-unit-unification.pdca.md
 */

import type { Model } from './Model.interface.js';
import type { ScenarioUnit } from './ScenarioUnit.interface.js';

export interface Scenario<T extends Model = Model> {
  ior: {
    // ✅ Core identity (REQUIRED)
    uuid: string;              // Object instance UUID
    component: string;         // Component name (ONCE, User, HTTPSServer)
    version: string;           // Component version (0.3.21.2)
    
    // ✅ Network location (OPTIONAL - for distributed objects)
    protocol?: string;         // 'ior:https', 'ior:https:ssl:udp', etc.
    host?: string;             // 'mcdonges-3.fritz.box', 'localhost'
    port?: number;             // 42777, 8080, etc.
    path?: string;             // '/ONCE/0.3.21.2/uuid-here/method'
    
    // ✅ IOR Profiles (OPTIONAL - CORBA 2.3+ pattern for failover)
    profiles?: Array<{
      host: string;            // Failover host
      port: number;            // Failover port
      protocol?: string;       // Optional protocol override
      priority?: number;       // Optional priority (lower = higher priority)
    }>;
    
    // ✅ Precomputed IOR string (CACHED - computed on first access)
    iorString?: string;        // 'ior:https://host:port,failover:port/component/version/uuid'
  };
  owner: string;
  model: T;
  
  /**
   * Unit extension - reference tracking & schema versioning
   * OPTIONAL for backward compatibility with existing scenarios
   * @since schema version 1.1.0
   */
  unit?: ScenarioUnit;
}
