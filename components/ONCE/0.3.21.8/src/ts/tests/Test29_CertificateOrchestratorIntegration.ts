/**
 * Test29_CertificateOrchestratorIntegration.ts
 * 
 * Integration tests for the complete certificate orchestration.
 * 
 * @pdca 2025-12-12-UTC-2100.iteration-08-testing.pdca.md
 */

import { CertificateOrchestrator } from '../layer4/CertificateOrchestrator.js';
import { CertificateSource } from '../layer3/CertificateSource.enum.js';
import { StatisticsModel } from '../layer3/StatisticsModel.interface.js';

export class Test29_CertificateOrchestratorIntegration {
    private testDir = '/tmp/once-test-orchestrator';
    
    public async run(): Promise<void> {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  Test29: CertificateOrchestrator Integration');
        console.log('═══════════════════════════════════════════════════════\n');
        
        await this.testOrchestratorInit();
        await this.testDomainAdd();
        await this.testDomainsGet();
        await this.testSNICallbackGet();
        
        console.log('\n✅ Test29: All CertificateOrchestrator tests passed!\n');
    }
    
    /**
     * DRY: Create fresh statistics model
     * Web4 P8: Reusable helper instead of inline object literals
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
    
    private async testOrchestratorInit(): Promise<void> {
        console.log('T2.1.1: Orchestrator initialization...');
        
        const orchestrator = new CertificateOrchestrator();
        await orchestrator.init({
            ior: { uuid: 'test-orch', component: 'CertificateOrchestrator', version: '' },
            owner: '',
            model: {
                uuid: 'test-orch',
                name: 'TestOrchestrator',
                domainConfigurations: [],
                scenariosRootPath: this.testDir,
                renewalCheckIntervalMs: 86400000,
                renewBeforeExpiryDays: 30,
                statistics: this.statisticsCreate()
            }
        });
        
        if (orchestrator.model.name !== 'TestOrchestrator') {
            throw new Error('Orchestrator not initialized');
        }
        
        console.log('  ✓ Orchestrator initializes correctly');
    }
    
    private async testDomainAdd(): Promise<void> {
        console.log('T2.1.2: domainAdd() (manual cert, no ACME)...');
        
        const orchestrator = new CertificateOrchestrator();
        await orchestrator.init();
        
        // Add domain with manual certificate source (won't trigger ACME)
        const config = {
            domain: 'manual.example.com',
            isWildcard: false,
            certificateSource: CertificateSource.Manual,
            autoRenewEnabled: false,
            renewBeforeExpiryDays: 30
        };
        
        await orchestrator.domainAdd(config);
        
        const domains = await orchestrator.domainsGet();
        if (!domains.find(d => d.domain === 'manual.example.com')) {
            throw new Error('Domain not added');
        }
        
        console.log('  ✓ domainAdd() works');
    }
    
    private async testDomainsGet(): Promise<void> {
        console.log('T2.1.3: domainsGet()...');
        
        const orchestrator = new CertificateOrchestrator();
        await orchestrator.init();
        
        const domains = await orchestrator.domainsGet();
        
        if (!Array.isArray(domains)) {
            throw new Error('domainsGet should return array');
        }
        
        console.log('  ✓ domainsGet() returns array');
    }
    
    private async testSNICallbackGet(): Promise<void> {
        console.log('T2.1.4: serverNameIndicationCallbackGet()...');
        
        const orchestrator = new CertificateOrchestrator();
        await orchestrator.init();
        
        const callback = orchestrator.serverNameIndicationCallbackGet();
        
        if (typeof callback !== 'function') {
            throw new Error('SNI callback should be function');
        }
        
        console.log('  ✓ serverNameIndicationCallbackGet() returns function');
    }
}









