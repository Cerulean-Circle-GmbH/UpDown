/**
 * ScenarioMigrationHelper - Helpers for migrating between scenario formats
 * 
 * Bridges LegacyONCEScenario ↔ Scenario<ONCEPeerModel> during transition
 * 
 * @layer2
 * @pattern Migration Helper
 * @pdca session/2025-12-17-UTC-1830.model-consolidation.pdca.md - MC.3
 */

import type { LegacyONCEScenario } from '../layer3/LegacyONCEScenario.interface.js';
import type { Scenario } from '../layer3/Scenario.interface.js';
import type { ONCEPeerModel } from '../layer3/ONCEPeerModel.interface.js';
import { LifecycleState } from '../layer3/LifecycleState.enum.js';
import { DefaultEnvironmentInfo } from './DefaultEnvironmentInfo.js';

/**
 * Convert LegacyONCEScenario to Scenario<ONCEPeerModel>
 * 
 * @param legacy - The legacy scenario format
 * @returns Modern Scenario<ONCEPeerModel> format
 */
export function legacyToScenario(legacy: LegacyONCEScenario): Scenario<ONCEPeerModel> {
    // Extract state fields safely
    const state = legacy.state || {};
    
    // Build ONCEPeerModel from legacy state
    const peerModel: ONCEPeerModel = {
        // Identity (from Model)
        uuid: legacy.uuid || state.uuid || '',
        name: legacy.name || state.name || 'ONCE',
        
        // Version
        version: legacy.version || state.version || '0.0.0.0',
        
        // Environment
        environment: state.platform || state.environment || new DefaultEnvironmentInfo(),
        
        // Lifecycle
        state: state.state || LifecycleState.CREATED,
        startTime: state.startTime ? new Date(state.startTime) : new Date(),
        connectionTime: state.connectionTime ? new Date(state.connectionTime) : null,
        
        // Network
        host: legacy.metadata?.host || state.host || 'localhost',
        port: state.httpPort || extractPortFromCapabilities(state.capabilities) || 42777,
        isPrimary: state.isPrimaryServer ?? state.isPrimary ?? false,
        primaryPeerUuid: state.primaryServerIOR || state.primaryPeerUuid || null,
        
        // P2P
        peers: state.peers || [],
        
        // Optional fields
        domain: state.domain,
        hostname: state.hostname,
        ip: state.ip,
        pid: state.pid,
        capabilities: state.capabilities,
        components: state.components
    };
    
    return {
        ior: {
            uuid: legacy.uuid,
            component: legacy.objectType || 'ONCE',
            version: legacy.version
        },
        owner: legacy.metadata?.creator || 'system',
        model: peerModel
    };
}

/**
 * Convert Scenario<ONCEPeerModel> to LegacyONCEScenario
 * 
 * @param scenario - Modern scenario format
 * @returns Legacy scenario format for backwards compatibility
 */
export function scenarioToLegacy(scenario: Scenario<ONCEPeerModel>): LegacyONCEScenario {
    const model = scenario.model;
    
    return {
        // Model fields
        uuid: scenario.ior?.uuid || model.uuid,
        name: model.name,
        
        // Legacy structure
        objectType: scenario.ior?.component || 'ONCE',
        version: model.version,
        
        // State - flatten peer model into state object
        state: {
            uuid: model.uuid,
            name: model.name,
            version: model.version,
            platform: model.environment,
            state: model.state,
            host: model.host,
            httpPort: model.port,
            isPrimaryServer: model.isPrimary,
            primaryServerIOR: model.primaryPeerUuid,
            peers: model.peers,
            capabilities: model.capabilities,
            pid: model.pid,
            domain: model.domain,
            hostname: model.hostname,
            ip: model.ip
        },
        
        // Metadata
        metadata: {
            host: model.host,
            creator: scenario.owner || 'system',
            created: model.startTime?.toISOString?.() || new Date().toISOString(),
            modified: new Date().toISOString()
        }
    };
}

/**
 * Check if a value is a LegacyONCEScenario
 */
export function isLegacyScenario(value: any): value is LegacyONCEScenario {
    return value && 
           typeof value === 'object' && 
           'objectType' in value && 
           'metadata' in value &&
           !('ior' in value);
}

/**
 * Check if a value is a Scenario<ONCEPeerModel>
 */
export function isWeb4Scenario(value: any): value is Scenario<ONCEPeerModel> {
    return value && 
           typeof value === 'object' && 
           'ior' in value && 
           'model' in value;
}

/**
 * Normalize any scenario format to Scenario<ONCEPeerModel>
 * Works with both legacy and modern formats
 */
export function normalizeToWeb4(value: LegacyONCEScenario | Scenario<ONCEPeerModel> | Scenario<any>): Scenario<ONCEPeerModel> {
    if (isWeb4Scenario(value)) {
        // Already Web4 format - check if model needs conversion
        if (isLegacyScenario(value.model)) {
            // Model is actually legacy format nested in Web4 wrapper
            return legacyToScenario(value.model);
        }
        return value as Scenario<ONCEPeerModel>;
    }
    
    if (isLegacyScenario(value)) {
        return legacyToScenario(value);
    }
    
    // Unknown format - try to create minimal scenario
    const anyVal = value as any;
    return {
        ior: { uuid: anyVal.uuid || anyVal.ior?.uuid || '', component: 'ONCE', version: '0.0.0.0' },
        owner: 'system',
        model: anyVal.model || anyVal as unknown as ONCEPeerModel
    };
}

/**
 * Extract HTTP port from capabilities array
 */
function extractPortFromCapabilities(capabilities: any[]): number | null {
    if (!Array.isArray(capabilities)) return null;
    const httpCap = capabilities.find(c => c.capability === 'httpPort');
    return httpCap?.port || null;
}

