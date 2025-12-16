/**
 * runLetsEncryptTests.ts
 * 
 * Runs all LetsEncrypt multi-domain tests.
 * 
 * @pdca 2025-12-12-UTC-2100.iteration-08-testing.pdca.md
 */

import { Test25_ServerNameIndicationManager } from './Test25_ServerNameIndicationManager.js';
import { Test26_DomainCertificateStore } from './Test26_DomainCertificateStore.js';
import { Test27_HTTPRouterDomainMatching } from './Test27_HTTPRouterDomainMatching.js';
import { Test28_ACMEChallengeRoute } from './Test28_ACMEChallengeRoute.js';
import { Test29_CertificateOrchestratorIntegration } from './Test29_CertificateOrchestratorIntegration.js';

async function main(): Promise<void> {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║     ITERATION 8: LetsEncrypt Multi-Domain Tests               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    
    const tests = [
        new Test25_ServerNameIndicationManager(),
        new Test26_DomainCertificateStore(),
        new Test27_HTTPRouterDomainMatching(),
        new Test28_ACMEChallengeRoute(),
        new Test29_CertificateOrchestratorIntegration()
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            await test.run();
            passed++;
        } catch (error: any) {
            console.error(`\n❌ FAILED: ${test.constructor.name}`);
            console.error(`   Error: ${error.message}\n`);
            failed++;
        }
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    if (failed > 0) {
        process.exit(1);
    }
}

main().catch(console.error);







