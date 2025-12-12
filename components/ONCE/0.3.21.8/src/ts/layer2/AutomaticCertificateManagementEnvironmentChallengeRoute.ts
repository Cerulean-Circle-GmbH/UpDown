/**
 * AutomaticCertificateManagementEnvironmentChallengeRoute.ts
 * 
 * Serves ACME HTTP-01 challenges at /.well-known/acme-challenge/{token}
 * 
 * Web4 Radical OOP:
 * - P4: No arrow functions
 * - P6: Empty constructor
 * - P4b: Extends Route (polymorphism)
 * 
 * @component ONCE
 * @layer 2
 * @pdca 2025-12-12-UTC-1700.iteration-08-letsencrypt-multi-domain.pdca.md
 */

import { IncomingMessage, ServerResponse } from 'http';
import { Route } from './Route.js';
import { HttpMethod } from '../layer3/HttpMethod.enum.js';
import type { LetsEncryptCertificateProvider } from './LetsEncryptCertificateProvider.js';

/**
 * AutomaticCertificateManagementEnvironmentChallengeRoute
 * 
 * Handles ACME HTTP-01 challenge requests.
 * Let's Encrypt validates domain ownership by requesting:
 * http://{domain}/.well-known/acme-challenge/{token}
 * 
 * Response must be: {token}.{thumbprint}
 */
export class AutomaticCertificateManagementEnvironmentChallengeRoute extends Route {
    private certificateProvider: LetsEncryptCertificateProvider | null;
    
    /**
     * Empty constructor - Web4 P6
     */
    constructor() {
        super();
        this.model.name = 'AutomaticCertificateManagementEnvironmentChallengeRoute';
        this.model.iorComponent = 'AutomaticCertificateManagementEnvironmentChallengeRoute';
        this.model.pattern = '/.well-known/acme-challenge/{token}';
        this.model.method = HttpMethod.GET;
        this.model.priority = 1;  // Highest priority - must handle before other routes
        this.certificateProvider = null;
    }
    
    /**
     * Set certificate provider
     * Web4 P16: certificateProviderSet
     */
    public certificateProviderSet(provider: LetsEncryptCertificateProvider): this {
        this.certificateProvider = provider;
        return this;
    }
    
    /**
     * Get icon for ACME challenge route
     * Web4 P4b: Polymorphism - Route.iconGet() override
     */
    public iconGet(): string {
        return '🔐';
    }
    
    /**
     * Get label for ACME challenge route
     */
    public labelGet(): string {
        return '🔐 ACME Challenges';
    }
    
    /**
     * Check if route matches ACME challenge path
     * Override to handle the pattern matching
     */
    public override matches(path: string, method: HttpMethod): boolean {
        if (method !== HttpMethod.GET) {
            return false;
        }
        return path.startsWith('/.well-known/acme-challenge/');
    }
    
    /**
     * Handle ACME challenge request
     * Web4 P4: Method, not arrow function
     */
    public handleRequest(
        request: IncomingMessage,
        response: ServerResponse
    ): Promise<void> {
        return new Promise(this.handleRequestExecutor.bind(this, request, response));
    }
    
    /**
     * Handle request executor
     * Web4 P4: Bound method for Promise executor
     */
    private handleRequestExecutor(
        request: IncomingMessage,
        response: ServerResponse,
        resolve: () => void
    ): void {
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = new Date().toISOString();
        
        const url = request.url || '';
        const token = this.tokenExtract(url);
        
        console.log(`[ACMEChallengeRoute] Challenge request for token: ${token}`);
        
        if (!this.certificateProvider) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = new Date().toISOString();
            this.errorResponseSend(response, 500, 'Certificate provider not configured');
            resolve();
            return;
        }
        
        const keyAuthorization = this.certificateProvider.challengeGet(token);
        
        if (keyAuthorization) {
            this.model.statistics.successCount++;
            this.successResponseSend(response, keyAuthorization);
            console.log(`[ACMEChallengeRoute] Challenge served: ${token}`);
        } else {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = new Date().toISOString();
            this.errorResponseSend(response, 404, 'Challenge not found');
            console.log(`[ACMEChallengeRoute] Challenge not found: ${token}`);
        }
        
        this.model.statistics.updatedAt = new Date().toISOString();
        resolve();
    }
    
    /**
     * Extract token from URL
     * Web4 P16: tokenExtract
     */
    private tokenExtract(url: string): string {
        // URL: /.well-known/acme-challenge/{token}
        const parts = url.split('/');
        return parts[parts.length - 1] || '';
    }
    
    /**
     * Send success response
     * Web4 P16: successResponseSend
     */
    private successResponseSend(response: ServerResponse, keyAuthorization: string): void {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end(keyAuthorization);
    }
    
    /**
     * Send error response
     * Web4 P16: errorResponseSend
     */
    private errorResponseSend(
        response: ServerResponse,
        statusCode: number,
        message: string
    ): void {
        response.writeHead(statusCode, { 'Content-Type': 'text/plain' });
        response.end(message);
    }
}



