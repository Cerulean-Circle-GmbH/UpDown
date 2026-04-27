/**
 * AutomaticCertificateManagementEnvironmentChallengeType.enum.ts
 * 
 * Enum for ACME challenge type.
 * 
 * @component ONCE
 * @layer 3
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 * Web4 P19: One file, one type
 */

/**
 * AutomaticCertificateManagementEnvironmentChallengeType - ACME challenge type
 */
export enum AutomaticCertificateManagementEnvironmentChallengeType {
    Http01 = 'http-01',
    Dns01 = 'dns-01'
}
