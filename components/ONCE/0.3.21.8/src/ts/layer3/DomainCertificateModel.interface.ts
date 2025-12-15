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

import { Model } from './Model.interface.js';

/**
 * DomainCertificateModel - Certificate for a domain
 * 
 * Extends Model for Scenario compatibility.
 * Stored as scenario in: scenarios/domain/.../ONCE/{version}/certificates/
 */
export interface DomainCertificateModel extends Model {
    /** Primary domain (CN) - also serves as uuid */
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




