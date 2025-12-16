/**
 * Test26_DomainCertificateStore.ts
 * 
 * Unit tests for certificate persistence.
 * 
 * @pdca 2025-12-12-UTC-2100.iteration-08-testing.pdca.md
 */

import * as fs from 'fs';
import { DomainCertificateStore } from '../layer2/DomainCertificateStore.js';
import { DomainCertificateModel } from '../layer3/DomainCertificateModel.interface.js';
import { StatisticsModel } from '../layer3/StatisticsModel.interface.js';

export class Test26_DomainCertificateStore {
    private testDir = '/tmp/once-test-certs';
    
    public async run(): Promise<void> {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  Test26: DomainCertificateStore');
        console.log('═══════════════════════════════════════════════════════\n');
        
        this.cleanup();
        
        await this.testCertificateSaveLoad();
        await this.testDomainsListGet();
        await this.testExpiringCertificatesGet();
        await this.testCertificateDelete();
        
        this.cleanup();
        
        console.log('\n✅ Test26: All DomainCertificateStore tests passed!\n');
    }
    
    private cleanup(): void {
        if (fs.existsSync(this.testDir)) {
            fs.rmSync(this.testDir, { recursive: true });
        }
    }
    
    private async testCertificateSaveLoad(): Promise<void> {
        console.log('T1.2.1: certificateSave() and certificateLoad()...');
        
        const store = new DomainCertificateStore().init();
        store.scenariosRootPathSet(this.testDir);
        store.model.providerVersion = '0.3.21.8';
        
        const cert = this.mockCertificateCreate('test.example.com');
        store.certificateSave(cert);
        
        const loaded = store.certificateLoad('test.example.com');
        
        if (!loaded) {
            throw new Error('Certificate not loaded');
        }
        
        if (loaded.domain !== cert.domain) {
            throw new Error('Domain mismatch');
        }
        
        console.log('  ✓ Save/load works');
    }
    
    private async testDomainsListGet(): Promise<void> {
        console.log('T1.2.2: domainsListGet()...');
        
        const store = new DomainCertificateStore().init();
        store.scenariosRootPathSet(this.testDir);
        store.model.providerVersion = '0.3.21.8';
        
        store.certificateSave(this.mockCertificateCreate('a.example.com'));
        store.certificateSave(this.mockCertificateCreate('b.example.com'));
        
        const domains = store.domainsListGet();
        
        if (domains.length < 2) {
            throw new Error(`Expected at least 2 domains, got ${domains.length}`);
        }
        
        console.log('  ✓ domainsListGet() works');
    }
    
    private async testExpiringCertificatesGet(): Promise<void> {
        console.log('T1.2.3: expiringCertificatesGet()...');
        
        const store = new DomainCertificateStore().init();
        store.scenariosRootPathSet(this.testDir);
        store.model.providerVersion = '0.3.21.8';
        
        // Create cert expiring in 10 days
        const expiringCert = this.mockCertificateCreate('expiring.example.com', 10);
        store.certificateSave(expiringCert);
        
        // Create cert expiring in 60 days  
        const validCert = this.mockCertificateCreate('valid.example.com', 60);
        store.certificateSave(validCert);
        
        const expiring = store.expiringCertificatesGet(30);
        
        const hasExpiring = expiring.some(c => c.domain === 'expiring.example.com');
        if (!hasExpiring) {
            throw new Error('Expiring cert not found');
        }
        
        console.log('  ✓ expiringCertificatesGet() works');
    }
    
    private async testCertificateDelete(): Promise<void> {
        console.log('T1.2.4: certificateDelete()...');
        
        const store = new DomainCertificateStore().init();
        store.scenariosRootPathSet(this.testDir);
        store.model.providerVersion = '0.3.21.8';
        
        store.certificateSave(this.mockCertificateCreate('delete-me.example.com'));
        
        if (!store.certificateHas('delete-me.example.com')) {
            throw new Error('Cert should exist before delete');
        }
        
        store.certificateDelete('delete-me.example.com');
        
        if (store.certificateHas('delete-me.example.com')) {
            throw new Error('Cert should not exist after delete');
        }
        
        console.log('  ✓ certificateDelete() works');
    }
    
    /**
     * DRY: Create fresh statistics model
     */
    private statisticsCreate(): StatisticsModel {
        const now = new Date().toISOString();
        return {
            totalOperations: 0,
            successCount: 0,
            errorCount: 0,
            lastOperationAt: '',
            lastErrorAt: '',
            createdAt: now,
            updatedAt: now
        };
    }
    
    private mockCertificateCreate(domain: string, daysValid: number = 90): DomainCertificateModel {
        const now = new Date();
        const expires = new Date(now);
        expires.setDate(expires.getDate() + daysValid);
        
        return {
            uuid: domain,
            name: `Certificate: ${domain}`,
            domain,
            alternativeNames: [],
            certificatePem: `-----BEGIN CERTIFICATE-----\nMOCK\n-----END CERTIFICATE-----`,
            privateKeyPem: `-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----`,
            certificateAuthorityChainPem: '',
            expiresAt: expires.toISOString(),
            issuedAt: now.toISOString(),
            issuer: 'Mock CA',
            isSelfSigned: true,
            fingerprintSha256: 'mock',
            serialNumber: 'mock'
        };
    }
}






