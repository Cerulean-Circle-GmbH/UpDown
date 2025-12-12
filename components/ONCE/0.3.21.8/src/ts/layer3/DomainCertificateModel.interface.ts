/**
 * DomainCertificateModel.interface.ts
 * 
 * Model for a domain's TLS certificate.
 * 
 * @component ONCE
 * @layer 3
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 * Web4 P19: One file, one type
 */

/**
 * DomainCertificateModel - Certificate for a domain
 * 
 * Stored as scenario in: scenarios/domain/.../ONCE/0.3.21.8/certificates/
 */
export interface DomainCertificateModel {
    /** Primary domain (CN) */
    domain: string;
    
    /** Subject Alternative Names (SAN) */
    alternativeNames: string[];
    
    /** Certificate in PEM format */
    certificatePem: string;
    
    /** Private key in PEM format */
    privateKeyPem: string;
    
    /** CA chain in PEM format */
    certificateAuthorityChainPem: string;
    
    /** Certificate expiry date (ISO 8601) */
    expiresAt: string;
    
    /** Certificate issued date (ISO 8601) */
    issuedAt: string;
    
    /** Issuer (e.g., "Let's Encrypt Authority X3") */
    issuer: string;
    
    /** Is self-signed? */
    isSelfSigned: boolean;
    
    /** Certificate fingerprint (SHA-256) */
    fingerprintSha256: string;
    
    /** Certificate serial number */
    serialNumber: string;
}
