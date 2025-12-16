/**
 * LetsEncryptCertificateProviderModel.interface.ts
 * 
 * Model for LetsEncryptCertificateProvider.
 * 
 * @component ONCE
 * @layer 3
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 * Web4 P19: One file, one type
 * Web4 P8 (DRY): Extends CertificateProviderModel
 */

import { CertificateProviderModel } from './CertificateProviderModel.interface.js';

/**
 * LetsEncryptCertificateProviderModel - Extended model for Let's Encrypt ACME provider
 * 
 * Extends base CertificateProviderModel with ACME-specific fields.
 */
export interface LetsEncryptCertificateProviderModel extends CertificateProviderModel {
    /** ACME account URL (after registration) */
    automaticCertificateManagementEnvironmentAccountUrl: string;
    
    /** Account email */
    accountEmail: string;
    
    /** Use staging environment? */
    useStaging: boolean;
    
    /** Account private key (JWK format, stored encrypted) */
    accountPrivateKeyJwk: string;
    
    /** IOR component name for toScenario() */
    iorComponent?: string;
    
    /** IOR version - NEVER hardcode! Set by init() */
    iorVersion?: string;
}








