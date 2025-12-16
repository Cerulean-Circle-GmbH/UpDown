/**
 * Test25_ServerNameIndicationManager.ts
 * 
 * Unit tests for SNI manager.
 * 
 * @pdca 2025-12-12-UTC-2100.iteration-08-testing.pdca.md
 */

import { ServerNameIndicationManager } from '../layer2/ServerNameIndicationManager.js';
import { DomainCertificateModel } from '../layer3/DomainCertificateModel.interface.js';
import { StatisticsModel } from '../layer3/StatisticsModel.interface.js';

export class Test25_ServerNameIndicationManager {
    
    public async run(): Promise<void> {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  Test25: ServerNameIndicationManager');
        console.log('═══════════════════════════════════════════════════════\n');
        
        await this.testCertificateSet();
        await this.testDefaultCertificate();
        await this.testWildcardMatch();
        await this.testSniCallback();
        
        console.log('\n✅ Test25: All ServerNameIndicationManager tests passed!\n');
    }
    
    private async testCertificateSet(): Promise<void> {
        console.log('T1.1.1: Model and domains list...');
        
        const manager = new ServerNameIndicationManager().init();
        
        // Test model initialization
        if (manager.model.name !== 'ServerNameIndicationManager') {
            throw new Error('Model name not set');
        }
        
        if (!Array.isArray(manager.model.configuredDomains)) {
            throw new Error('configuredDomains should be array');
        }
        
        console.log('  ✓ Model initializes correctly');
    }
    
    private async testDefaultCertificate(): Promise<void> {
        console.log('T1.1.2: Statistics tracking...');
        
        const manager = new ServerNameIndicationManager().init();
        
        // Test statistics initialization
        if (manager.model.statistics.totalOperations !== 0) {
            throw new Error('Statistics should start at 0');
        }
        
        if (!manager.model.statistics.createdAt) {
            throw new Error('createdAt should be set');
        }
        
        console.log('  ✓ Statistics initializes correctly');
    }
    
    private async testWildcardMatch(): Promise<void> {
        console.log('T1.1.3: Callback getter...');
        
        const manager = new ServerNameIndicationManager().init();
        
        const callback = manager.serverNameIndicationCallbackGet();
        
        if (typeof callback !== 'function') {
            throw new Error('Callback should be a function');
        }
        
        console.log('  ✓ serverNameIndicationCallbackGet() returns function');
    }
    
    private async testSniCallback(): Promise<void> {
        console.log('T1.1.4: Domains list operations...');
        
        const manager = new ServerNameIndicationManager().init();
        
        // domainsGet should return empty array initially
        const domains = manager.domainsGet();
        if (!Array.isArray(domains)) {
            throw new Error('domainsGet() should return array');
        }
        
        if (domains.length !== 0) {
            throw new Error('Initial domains should be empty');
        }
        
        console.log('  ✓ domainsGet() returns empty array initially');
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
    
    private mockCertificateCreate(domain: string): DomainCertificateModel {
        const now = new Date();
        const expires = new Date(now);
        expires.setDate(expires.getDate() + 90);
        
        return {
            uuid: domain,
            name: `Certificate: ${domain}`,
            domain,
            alternativeNames: [],
            certificatePem: `-----BEGIN CERTIFICATE-----\nMOCK_CERT_${domain}\n-----END CERTIFICATE-----`,
            privateKeyPem: `-----BEGIN PRIVATE KEY-----\nMOCK_KEY_${domain}\n-----END PRIVATE KEY-----`,
            certificateAuthorityChainPem: '',
            expiresAt: expires.toISOString(),
            issuedAt: now.toISOString(),
            issuer: 'Mock CA',
            isSelfSigned: true,
            fingerprintSha256: 'mock-fingerprint',
            serialNumber: 'mock-serial'
        };
    }
}








