/**
 * IOR Utility Functions - Helper functions for IOR manipulation
 * Supports IOR profiles (CORBA 2.3+ pattern) for failover
 * 
 * @layer3
 * @pdca session/2025-11-21-UTC-1900.iteration-01.6-once-architecture-consolidation.pdca.md
 */

import { Scenario } from './Scenario.interface.js';

/**
 * Compute full IOR string from IOR attributes
 * Format: ior:protocol://host:port,failover:port/component/version/uuid
 * 
 * @param ior IOR object from scenario
 * @returns Complete IOR string with all profiles
 */
export function computeIorString(ior: Scenario<any>['ior']): string {
  // ✅ Return cached if available
  if (ior.iorString) return ior.iorString;
  
  // ✅ Use defaults if network attributes missing
  const protocol = ior.protocol || 'https';
  const host = ior.host || 'localhost';
  const port = ior.port || (protocol.includes('https') ? 443 : 80);
  const path = ior.path || `/${ior.component}/${ior.version}/${ior.uuid}`;
  
  // ✅ Build profiles string (host:port,host:port,...)
  let profilesStr = `${host}:${port}`;
  if (ior.profiles && ior.profiles.length > 0) {
    const failoverProfiles = ior.profiles
      .map(p => `${p.host}:${p.port}`)
      .join(',');
    profilesStr = `${profilesStr},${failoverProfiles}`;
  }
  
  return `ior:${protocol}://${profilesStr}${path}`;
}

/**
 * Parse IOR string into IOR attributes
 * Extracts all profiles for failover support
 * 
 * @param iorString Complete IOR string
 * @returns Partial IOR object with all attributes
 */
export function parseIorString(iorString: string): Partial<Scenario<any>['ior']> {
  // Remove 'ior:' prefix
  const withoutPrefix = iorString.replace(/^ior:/, '');
  
  // Extract protocol (everything before ://)
  const protocolMatch = withoutPrefix.match(/^([^:]+):\/\//);
  const protocol = protocolMatch ? protocolMatch[1] : 'https';
  
  // Remove protocol://
  const withoutProtocol = withoutPrefix.replace(/^[^:]+:\/\//, '');
  
  // Split by first / to separate hosts from path
  const firstSlash = withoutProtocol.indexOf('/');
  const hostsStr = firstSlash > 0 ? withoutProtocol.substring(0, firstSlash) : withoutProtocol;
  const path = firstSlash > 0 ? withoutProtocol.substring(firstSlash) : '';
  
  // Parse multiple profiles (host1:port1,host2:port2,...)
  const hostParts = hostsStr.split(',');
  const primaryHost = hostParts[0].split(':');
  const failoverProfiles = hostParts.slice(1).map(hp => {
    const [host, portStr] = hp.split(':');
    return { host, port: parseInt(portStr) || 443 };
  });
  
  // Parse path (component/version/uuid/method)
  const pathParts = path.split('/').filter(p => p);
  
  return {
    protocol,
    host: primaryHost[0],
    port: parseInt(primaryHost[1]) || 443,
    path,
    component: pathParts[0] || '',
    version: pathParts[1] || '',
    uuid: pathParts[2] || '',
    profiles: failoverProfiles.length > 0 ? failoverProfiles : undefined,
    iorString: iorString
  };
}

/**
 * Update IOR with network location from current context
 * Call this when creating scenarios in server environment
 * 
 * @param ior Existing IOR object
 * @param location Network location (host, port, protocol)
 * @returns Updated IOR with network location
 */
export function enrichIorWithLocation(
  ior: Scenario<any>['ior'], 
  location: { host: string; port: number; protocol?: string }
): Scenario<any>['ior'] {
  return {
    ...ior,
    protocol: location.protocol || ior.protocol || 'https',
    host: location.host,
    port: location.port,
    path: `/${ior.component}/${ior.version}/${ior.uuid}`,
    iorString: undefined  // Will be recomputed
  };
}

/**
 * Parse IOR profiles from IOR string
 * Extracts all host:port pairs for failover resolution
 * 
 * @param iorString Complete IOR string
 * @returns Array of profile objects {host, port}
 */
export function parseIorProfiles(iorString: string): Array<{host: string; port: number}> {
  const parsed = parseIorString(iorString);
  const profiles: Array<{host: string; port: number}> = [];
  
  // Add primary profile
  if (parsed.host && parsed.port) {
    profiles.push({ host: parsed.host, port: parsed.port });
  }
  
  // Add failover profiles
  if (parsed.profiles) {
    profiles.push(...parsed.profiles);
  }
  
  return profiles;
}

