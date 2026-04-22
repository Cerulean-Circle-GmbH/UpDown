/**
 * Hostname and domain parsing utilities
 * ✅ Web4 Principle 8: DRY - Don't Repeat Yourself
 * 
 * Provides dedicated methods for hostname/domain extraction to avoid
 * duplicating logic across ServerHierarchyManager, tests, and infrastructure.
 */
export class HostnameParser {
    /**
     * Extract short hostname from FQDN
     * @param fqdn - Full qualified domain name (e.g., "McDonges-3.fritz.box")
     * @returns Short hostname (e.g., "McDonges-3")
     * 
     * @example
     * ```typescript
     * HostnameParser.extractHostname("McDonges-3.fritz.box"); // "McDonges-3"
     * HostnameParser.extractHostname("localhost"); // "localhost"
     * ```
     */
    public static extractHostname(fqdn: string): string {
        if (!fqdn || !fqdn.includes('.')) {
            return fqdn || 'localhost';
        }
        return fqdn.split('.')[0];
    }

    /**
     * Extract domain from FQDN with hierarchical reversal
     * @param fqdn - Full qualified domain name (e.g., "McDonges-3.fritz.box")
     * @returns Reversed domain for hierarchical paths (e.g., "box.fritz")
     * 
     * **Why reversed?** For directory structure: `scenarios/box/fritz/McDonges-3/`
     * 
     * @example
     * ```typescript
     * HostnameParser.extractDomain("McDonges-3.fritz.box"); // "box.fritz"
     * HostnameParser.extractDomain("localhost"); // "local.once"
     * ```
     */
    public static extractDomain(fqdn: string): string {
        if (!fqdn || !fqdn.includes('.')) {
            return 'local.once'; // Fallback for non-FQDN
        }
        const parts = fqdn.split('.');
        // Reverse domain parts: "McDonges-3.fritz.box" → ["box", "fritz"] → "box.fritz"
        return parts.slice(1).reverse().join('.');
    }

    /**
     * Extract domain in original (non-reversed) order
     * @param fqdn - Full qualified domain name (e.g., "McDonges-3.fritz.box")
     * @returns Domain in original order (e.g., "fritz.box")
     * 
     * @example
     * ```typescript
     * HostnameParser.extractDomainOriginal("McDonges-3.fritz.box"); // "fritz.box"
     * ```
     */
    public static extractDomainOriginal(fqdn: string): string {
        if (!fqdn || !fqdn.includes('.')) {
            return 'local.once';
        }
        const parts = fqdn.split('.');
        return parts.slice(1).join('.');
    }

    /**
     * Parse FQDN into all components
     * @param fqdn - Full qualified domain name
     * @returns Parsed components { hostname, domain, domainReversed, fqdn }
     * 
     * @example
     * ```typescript
     * const parsed = HostnameParser.parseFQDN("McDonges-3.fritz.box");
     * // {
     * //   hostname: "McDonges-3",
     * //   domain: "fritz.box",         // Original order
     * //   domainReversed: "box.fritz", // Reversed for paths
     * //   fqdn: "McDonges-3.fritz.box"
     * // }
     * ```
     */
    public static parseFQDN(fqdn: string): {
        hostname: string;
        domain: string;
        domainReversed: string;
        fqdn: string;
    } {
        return {
            hostname: this.extractHostname(fqdn),
            domain: this.extractDomainOriginal(fqdn),
            domainReversed: this.extractDomain(fqdn),
            fqdn: fqdn || 'localhost'
        };
    }
}

