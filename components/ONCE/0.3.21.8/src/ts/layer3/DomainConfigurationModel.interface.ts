/**
 * DomainConfigurationModel.interface.ts
 * 
 * Configuration for a domain's certificate management.
 * 
 * @component ONCE
 * @layer 3
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 * Web4 P19: One file, one type
 */

import { CertificateSource } from './CertificateSource.enum.js';
import { AutomaticCertificateManagementEnvironmentChallengeType } from './AutomaticCertificateManagementEnvironmentChallengeType.enum.js';

/**
 * DomainConfigurationModel - Domain configuration
 */
export interface DomainConfigurationModel {
    /** Domain name (e.g., "example.com") */
    domain: string;
    
    /** Is wildcard certificate? (e.g., "*.example.com") */
    isWildcard: boolean;
    
    /** Certificate source */
    certificateSource: CertificateSource;
    
    /** ACME challenge type (for LetsEncrypt) */
    automaticCertificateManagementEnvironmentChallengeType?: AutomaticCertificateManagementEnvironmentChallengeType;
    
    /** ACME account email (for LetsEncrypt) */
    automaticCertificateManagementEnvironmentEmail?: string;
    
    /** Use LetsEncrypt staging environment? */
    automaticCertificateManagementEnvironmentUseStaging?: boolean;
    
    /** Manual certificate paths (for manual source) */
    manualCertificatePaths?: {
        certificatePath: string;
        privateKeyPath: string;
        certificateAuthorityPath?: string;
    };
    
    /** DNS provider name for DNS-01 challenges */
    dnsProviderName?: string;
    
    /** IOR to DNS provider credentials scenario */
    dnsCredentialsInternetObjectReference?: string;
    
    /** Auto-renewal enabled? */
    autoRenewEnabled: boolean;
    
    /** Days before expiry to renew (default: 30) */
    renewBeforeExpiryDays: number;
}









