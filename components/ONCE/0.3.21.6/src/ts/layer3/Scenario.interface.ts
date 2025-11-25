/**
 * Scenario - Web4 Scenario Interface with Complete IOR
 * Web4 pattern: Scenario support for component state management
 * 
 * Generic type T must extend Model (Web4 principle: strong typing)
 * 
 * @pdca session/2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md
 */

import type { Model } from './Model.interface.js';

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
}
