/**
 * Test28_ACMEChallengeRoute.ts
 * 
 * Unit tests for ACME HTTP-01 challenge route.
 * 
 * @pdca 2025-12-12-UTC-2100.iteration-08-testing.pdca.md
 */

import { AutomaticCertificateManagementEnvironmentChallengeRoute } 
    from '../layer2/AutomaticCertificateManagementEnvironmentChallengeRoute.js';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';

export class Test28_ACMEChallengeRoute {
    
    public async run(): Promise<void> {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  Test28: ACME Challenge Route');
        console.log('═══════════════════════════════════════════════════════\n');
        
        await this.testRoutePattern();
        await this.testRoutePriority();
        await this.testRouteMatching();
        
        console.log('\n✅ Test28: All ACME Challenge Route tests passed!\n');
    }
    
    private async testRoutePattern(): Promise<void> {
        console.log('T1.4.1: Route pattern...');
        
        const route = new AutomaticCertificateManagementEnvironmentChallengeRoute();
        
        if (!route.model.pattern.includes('acme-challenge')) {
            throw new Error('Pattern should include acme-challenge');
        }
        
        console.log('  ✓ Route pattern is /.well-known/acme-challenge/{token}');
    }
    
    private async testRoutePriority(): Promise<void> {
        console.log('T1.4.2: Route priority...');
        
        const route = new AutomaticCertificateManagementEnvironmentChallengeRoute();
        
        if (route.model.priority !== 1) {
            throw new Error('ACME route should have highest priority (1)');
        }
        
        console.log('  ✓ Route has priority 1 (highest)');
    }
    
    private async testRouteMatching(): Promise<void> {
        console.log('T1.4.3: Route matching...');
        
        const route = new AutomaticCertificateManagementEnvironmentChallengeRoute();
        
        // Should match ACME challenge paths
        if (!route.matches('/.well-known/acme-challenge/abc123', HttpMethod.GET)) {
            throw new Error('Should match ACME challenge path');
        }
        
        // Should NOT match other paths
        if (route.matches('/api/health', HttpMethod.GET)) {
            throw new Error('Should not match non-ACME paths');
        }
        
        // Should NOT match POST
        if (route.matches('/.well-known/acme-challenge/abc123', HttpMethod.POST)) {
            throw new Error('Should only match GET');
        }
        
        console.log('  ✓ Route matching works correctly');
    }
}
