/**
 * CertificateSource.enum.ts
 * 
 * Enum for certificate source.
 * 
 * @component ONCE
 * @layer 3
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 * Web4 P19: One file, one type
 */

/**
 * CertificateSource - Where certificate comes from
 */
export enum CertificateSource {
    LetsEncrypt = 'letsencrypt',
    Manual = 'manual',
    SelfSigned = 'self-signed'
}
