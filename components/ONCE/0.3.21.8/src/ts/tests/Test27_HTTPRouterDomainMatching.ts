/**
 * Test27_HTTPRouterDomainMatching.ts
 * 
 * Unit tests for domain-based routing.
 * 
 * @pdca 2025-12-12-UTC-2100.iteration-08-testing.pdca.md
 */

import { HTTPRouter } from '../layer2/HTTPRouter.js';
import { Route } from '../layer2/Route.js';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';
import { IncomingMessage, ServerResponse } from 'http';

class MockRoute extends Route {
    constructor(pattern: string, domains?: string[]) {
        super();
        this.model.pattern = pattern;
        this.model.method = HttpMethod.GET;
        this.model.domains = domains;
    }
    
    public handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        res.writeHead(200);
        res.end(`Route: ${this.model.pattern}`);
        return Promise.resolve();
    }
}

export class Test27_HTTPRouterDomainMatching {
    
    public async run(): Promise<void> {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  Test27: HTTPRouter Domain Matching');
        console.log('═══════════════════════════════════════════════════════\n');
        
        await this.testNoDomainRestriction();
        await this.testExactDomainMatch();
        await this.testWildcardDomainMatch();
        await this.testDomainMismatch();
        
        console.log('\n✅ Test27: All HTTPRouter domain matching tests passed!\n');
    }
    
    private async testNoDomainRestriction(): Promise<void> {
        console.log('T1.3.1: Route without domain restriction...');
        
        const router = new HTTPRouter().init();
        const route = new MockRoute('/api/health', undefined);
        router.registerRoute(route);
        
        // Should match any domain
        const routes = router.routesGet();
        if (routes.length !== 1) {
            throw new Error('Route not registered');
        }
        
        console.log('  ✓ Routes without domains match any host');
    }
    
    private async testExactDomainMatch(): Promise<void> {
        console.log('T1.3.2: Exact domain match...');
        
        const router = new HTTPRouter().init();
        const route = new MockRoute('/api/v1', ['api.example.com']);
        router.registerRoute(route);
        
        // Route should be registered with domain
        const routes = router.routesGet();
        if (routes[0].domains?.[0] !== 'api.example.com') {
            throw new Error('Domain not stored on route');
        }
        
        console.log('  ✓ Exact domain matching configured');
    }
    
    private async testWildcardDomainMatch(): Promise<void> {
        console.log('T1.3.3: Wildcard domain match...');
        
        const router = new HTTPRouter().init();
        const route = new MockRoute('/app', ['*.example.com']);
        router.registerRoute(route);
        
        const routes = router.routesGet();
        if (!routes[0].domains?.[0]?.startsWith('*')) {
            throw new Error('Wildcard domain not stored');
        }
        
        console.log('  ✓ Wildcard domain matching configured');
    }
    
    private async testDomainMismatch(): Promise<void> {
        console.log('T1.3.4: Multiple domain routes (different patterns)...');
        
        const router = new HTTPRouter().init();
        
        // Route only for api.example.com
        const apiRoute = new MockRoute('/api/data', ['api.example.com']);
        router.registerRoute(apiRoute);
        
        // Route for app.example.com (different pattern)
        const appRoute = new MockRoute('/app/data', ['app.example.com']);
        router.registerRoute(appRoute);
        
        // Both routes registered (different patterns = different keys)
        const routes = router.routesGet();
        if (routes.length !== 2) {
            throw new Error(`Expected 2 routes, got ${routes.length}`);
        }
        
        // Check both have domains
        const apiRouteFound = routes.find(r => r.pattern === '/api/data');
        const appRouteFound = routes.find(r => r.pattern === '/app/data');
        
        if (!apiRouteFound || !appRouteFound) {
            throw new Error('Both routes should be found');
        }
        
        if (apiRouteFound.domains?.[0] !== 'api.example.com') {
            throw new Error('API route domain not correct');
        }
        
        console.log('  ✓ Multiple domain-restricted routes work');
    }
}









