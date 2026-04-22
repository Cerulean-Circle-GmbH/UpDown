/**
 * FileLoader.ts
 * 
 * Web4 File Loader - Node.js filesystem access
 * Handles file:// protocol for local filesystem operations
 * 
 * Protocol: 'file'
 * Purpose: Local filesystem read/write
 * Chain: IOR → ScenarioLoader → FileLoader → Filesystem
 * 
 * NOTE: This loader only works in Node.js environment.
 * Browser environments should use HTTPSLoader or ServiceWorker cache.
 * 
 * Web4 Principles:
 * - P6: Empty Constructor + init()
 * - P7: Async Only in Layer 4
 * - P4a: No arrow functions
 * 
 * @layer4
 * @pdca 2025-12-20-UTC-1315.ior-infrastructure-universal-access.pdca.md
 */

import type { Loader } from '../layer3/Loader.interface.js';
import type { LoaderModel } from '../layer3/LoaderModel.interface.js';
import type { Scenario } from '../layer3/Scenario.interface.js';

/**
 * FileLoader
 * 
 * Provides filesystem access for IOR resolution.
 * Uses Node.js fs/promises for async file operations.
 */
export class FileLoader implements Loader {
    public protocol = 'file';
    public model: LoaderModel;
    
    /**
     * Empty constructor (P6 compliance)
     */
    constructor() {
        const now = new Date().toISOString();
        this.model = {
            uuid: '',
            name: 'FileLoader',
            protocol: 'file',
            iorComponent: 'FileLoader',
            iorVersion: '',
            statistics: {
                totalOperations: 0,
                successCount: 0,
                errorCount: 0,
                lastOperationAt: '',
                lastErrorAt: '',
                createdAt: now,
                updatedAt: now
            }
        };
    }
    
    /**
     * Initialize loader
     * @param scenario Optional scenario to restore state
     * @returns this for chaining
     */
    public init(scenario?: Scenario<LoaderModel>): this {
        if (scenario?.model) {
            this.model = { ...this.model, ...scenario.model };
        }
        return this;
    }
    
    /**
     * Load file from filesystem
     * 
     * @param ior File path (file:///path/to/file or /path/to/file)
     * @param options Optional loader options (encoding, etc.)
     * @returns File contents as string
     */
    public async load(ior: string, options?: any): Promise<string> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            // Check for Node.js environment
            if (typeof process === 'undefined' || !process.versions?.node) {
                throw new Error('FileLoader: Only available in Node.js environment');
            }
            
            // Extract path from file:// URL
            const filePath = this.extractPath(ior);
            
            // Dynamic import for Node.js fs/promises
            const fs = await import('fs/promises');
            
            const encoding = options?.encoding || 'utf-8';
            const content = await fs.readFile(filePath, { encoding: encoding as BufferEncoding });
            
            this.model.statistics.successCount++;
            console.log(`📁 FileLoader: Loaded ${filePath}`);
            
            return content;
            
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            console.error(`❌ FileLoader: Failed to load ${ior}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Save data to filesystem
     * 
     * @param data Data to write (string or object - will be JSON.stringify'd)
     * @param ior File path
     * @param options Optional loader options (encoding, etc.)
     */
    public async save(data: any, ior: string, options?: any): Promise<void> {
        const now = new Date().toISOString();
        this.model.statistics.totalOperations++;
        this.model.statistics.lastOperationAt = now;
        this.model.statistics.updatedAt = now;
        
        try {
            // Check for Node.js environment
            if (typeof process === 'undefined' || !process.versions?.node) {
                throw new Error('FileLoader: Only available in Node.js environment');
            }
            
            const filePath = this.extractPath(ior);
            
            // Dynamic import for Node.js fs/promises
            const fs = await import('fs/promises');
            const path = await import('path');
            
            // Ensure directory exists
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });
            
            // Convert data to string if needed
            const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            
            const encoding = options?.encoding || 'utf-8';
            await fs.writeFile(filePath, content, { encoding: encoding as BufferEncoding });
            
            this.model.statistics.successCount++;
            console.log(`💾 FileLoader: Saved to ${filePath}`);
            
        } catch (error: any) {
            this.model.statistics.errorCount++;
            this.model.statistics.lastErrorAt = now;
            console.error(`❌ FileLoader: Failed to save ${ior}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Extract filesystem path from file:// URL or path string
     * 
     * @param ior File URL or path
     * @returns Filesystem path
     */
    private extractPath(ior: string): string {
        // Handle file:// protocol
        if (ior.startsWith('file://')) {
            // file:///path/to/file -> /path/to/file
            // file://localhost/path -> /path
            return ior.replace(/^file:\/\/(localhost)?/, '');
        }
        
        // Already a path
        return ior;
    }
    
    /**
     * Check if file exists
     * 
     * @param filePath Path to check
     * @returns true if file exists
     */
    public async exists(filePath: string): Promise<boolean> {
        try {
            const fs = await import('fs/promises');
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Convert loader state to scenario (Web4 pattern)
     */
    public async toScenario(): Promise<Scenario<LoaderModel>> {
        return {
            ior: {
                uuid: this.model.uuid,
                component: this.model.iorComponent,
                version: this.model.iorVersion,
                // CPA.5: Use iorString instead of protocol/host/port
                iorString: `ior:${this.model.protocol}://localhost/${this.model.iorComponent}/${this.model.iorVersion}/${this.model.uuid}`
            },
            model: this.model,
            owner: ''
        };
    }
}

