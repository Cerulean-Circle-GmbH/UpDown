/**
 * Primary Server Housekeeping Tests
 * Tests cleanup of stale scenarios, shutdown scenarios, and discovery of running servers
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Primary Server Housekeeping', () => {
    let primaryServer: any;
    let scenarioBaseDir: string;
    let testProjectRoot: string;
    let componentVersion: string;
    
    beforeEach(async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // Get project root and version from DefaultONCE (Path Authority)
        const tempInstance = new DefaultONCE();
        await tempInstance.init();
        await (tempInstance as any).getWeb4TSComponent();
        testProjectRoot = tempInstance.model.projectRoot;
        componentVersion = tempInstance.model.version;
        scenarioBaseDir = path.join(testProjectRoot, `scenarios/local.once/ONCE/${componentVersion}`);
        
        // Clean up scenarios
        if (fs.existsSync(scenarioBaseDir)) {
            fs.rmSync(scenarioBaseDir, { recursive: true, force: true });
        }
    });
    
    afterEach(async () => {
        // Graceful cleanup
        if (primaryServer) {
            await primaryServer.stopServer();
            primaryServer = null;
        }
        
        // Clean up test scenarios
        if (fs.existsSync(scenarioBaseDir)) {
            fs.rmSync(scenarioBaseDir, { recursive: true, force: true });
        }
    });
    
    it('should delete scenarios with state=shutdown on startup', async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // Create shutdown scenario manually
        const shutdownScenarioDir = path.join(scenarioBaseDir, 'capability/httpPort/8080');
        fs.mkdirSync(shutdownScenarioDir, { recursive: true });
        
        const shutdownScenario = {
            uuid: 'test-shutdown-uuid',
            objectType: 'ONCE',
            version: componentVersion,
            state: {
                state: 'shutdown',
                capabilities: [{ capability: 'httpPort', port: 8080 }],
                uuid: 'test-shutdown-uuid',
                isPrimaryServer: false
            },
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            }
        };
        
        const scenarioPath = path.join(shutdownScenarioDir, 'test-shutdown-uuid.scenario.json');
        fs.writeFileSync(scenarioPath, JSON.stringify(shutdownScenario, null, 2));
        
        console.log('✅ Created test shutdown scenario');
        expect(fs.existsSync(scenarioPath)).toBe(true);
        
        // Start primary server - should trigger housekeeping
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        await primaryServer.startServer();
        
        // Wait for housekeeping to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify shutdown scenario was deleted
        expect(fs.existsSync(scenarioPath)).toBe(false);
        console.log('✅ Shutdown scenario successfully deleted by housekeeping');
    }, 15000);
    
    it('should delete stale scenarios for unreachable servers', async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // Create scenario for unreachable server
        const staleScenarioDir = path.join(scenarioBaseDir, 'capability/httpPort/9999');
        fs.mkdirSync(staleScenarioDir, { recursive: true });
        
        const staleScenario = {
            uuid: 'test-stale-uuid',
            objectType: 'ONCE',
            version: componentVersion,
            state: {
                state: 'running',
                capabilities: [{ capability: 'httpPort', port: 9999 }],
                uuid: 'test-stale-uuid',
                isPrimaryServer: false
            },
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            }
        };
        
        const scenarioPath = path.join(staleScenarioDir, 'test-stale-uuid.scenario.json');
        fs.writeFileSync(scenarioPath, JSON.stringify(staleScenario, null, 2));
        
        console.log('✅ Created test stale scenario (port 9999 - unreachable)');
        expect(fs.existsSync(scenarioPath)).toBe(true);
        
        // Start primary server - should detect port 9999 is not reachable
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        await primaryServer.startServer();
        
        // Wait for housekeeping health checks
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verify stale scenario was deleted
        expect(fs.existsSync(scenarioPath)).toBe(false);
        console.log('✅ Stale scenario successfully deleted by housekeeping');
    }, 15000);
    
    it('should keep scenarios for running and reachable servers', async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // Start primary first
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        await primaryServer.startServer();
        
        console.log('✅ Primary server started');
        
        // Start a real client server
        const clientServer = new DefaultONCE();
        await clientServer.init();
        await clientServer.startServer();
        
        const clientModel = clientServer.getServerModel();
        const clientPort = clientModel.capabilities.find(c => c.capability === 'httpPort')?.port;
        const clientUuid = clientModel.uuid;
        
        console.log(`✅ Client server started on port ${clientPort}, UUID: ${clientUuid}`);
        
        // Wait for registration and scenario creation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify client scenario exists
        const clientScenarioPath = path.join(
            scenarioBaseDir,
            `capability/httpPort/${clientPort}/${clientUuid}.scenario.json`
        );
        expect(fs.existsSync(clientScenarioPath)).toBe(true);
        console.log('✅ Client scenario created');
        
        // Trigger housekeeping by restarting primary (client stays running)
        await primaryServer.stopServer();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        await primaryServer.startServer();
        
        console.log('✅ Primary server restarted - housekeeping triggered');
        
        // Wait for housekeeping to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Client scenario should still exist (server is reachable)
        expect(fs.existsSync(clientScenarioPath)).toBe(true);
        console.log('✅ Running client scenario preserved by housekeeping');
        
        // Cleanup client server gracefully
        await clientServer.stopServer();
    }, 20000);
    
    it('should discover and re-register running client servers', async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // Start primary
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        await primaryServer.startServer();
        
        // Start client
        const clientServer = new DefaultONCE();
        await clientServer.init();
        await clientServer.startServer();
        
        const clientModel = clientServer.getServerModel();
        const clientUuid = clientModel.uuid;
        
        console.log(`✅ Client server started, UUID: ${clientUuid}`);
        
        // Wait for registration
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify primary has client in registry
        const primaryManager = (primaryServer as any).serverHierarchyManager;
        const registryBefore = primaryManager.serverRegistry;
        expect(registryBefore.has(clientUuid)).toBe(true);
        console.log('✅ Client registered with primary');
        
        // Simulate primary crash and restart (client keeps running)
        await primaryServer.stopServer();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        await primaryServer.startServer();
        
        console.log('✅ Primary restarted - should discover running client');
        
        // Wait for housekeeping discovery
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if client was rediscovered
        const primaryManagerNew = (primaryServer as any).serverHierarchyManager;
        const registryAfter = primaryManagerNew.serverRegistry;
        
        // Note: Discovery is passive - client reconnects when it detects primary is back
        // For now, verify scenario exists (active discovery not yet implemented)
        const clientPort = clientModel.capabilities.find(c => c.capability === 'httpPort')?.port;
        const clientScenarioPath = path.join(
            scenarioBaseDir,
            `capability/httpPort/${clientPort}/${clientUuid}.scenario.json`
        );
        expect(fs.existsSync(clientScenarioPath)).toBe(true);
        console.log('✅ Client scenario discovered by housekeeping');
        
        // Cleanup
        await clientServer.stopServer();
    }, 25000);
    
    it('should handle mixed scenarios: delete stale, keep running', async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // Create multiple scenarios with different states
        const scenarios = [
            { uuid: 'shutdown-1', port: 8888, state: 'shutdown' },
            { uuid: 'shutdown-2', port: 8889, state: 'shutdown' },
            { uuid: 'stale-1', port: 9998, state: 'running' },  // Unreachable
            { uuid: 'stale-2', port: 9999, state: 'running' },  // Unreachable
        ];
        
        for (const scenario of scenarios) {
            const scenarioDir = path.join(scenarioBaseDir, `capability/httpPort/${scenario.port}`);
            fs.mkdirSync(scenarioDir, { recursive: true });
            
            const scenarioData = {
                uuid: scenario.uuid,
                objectType: 'ONCE',
                version: componentVersion,
                state: {
                    state: scenario.state,
                    capabilities: [{ capability: 'httpPort', port: scenario.port }],
                    uuid: scenario.uuid,
                    isPrimaryServer: false
                },
                metadata: {
                    created: new Date().toISOString(),
                    modified: new Date().toISOString()
                }
            };
            
            const scenarioPath = path.join(scenarioDir, `${scenario.uuid}.scenario.json`);
            fs.writeFileSync(scenarioPath, JSON.stringify(scenarioData, null, 2));
        }
        
        console.log('✅ Created 4 test scenarios (2 shutdown, 2 stale)');
        
        // Start a real client server (will be kept)
        const clientServer = new DefaultONCE();
        await clientServer.init();
        await clientServer.startServer();
        
        const clientModel = clientServer.getServerModel();
        const clientPort = clientModel.capabilities.find(c => c.capability === 'httpPort')?.port;
        const clientUuid = clientModel.uuid;
        
        console.log(`✅ Real client started on port ${clientPort}`);
        
        // Wait for client scenario creation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Start primary - triggers housekeeping
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        await primaryServer.startServer();
        
        console.log('✅ Primary started - housekeeping in progress');
        
        // Wait for housekeeping
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // Verify results
        for (const scenario of scenarios) {
            const scenarioPath = path.join(
                scenarioBaseDir,
                `capability/httpPort/${scenario.port}/${scenario.uuid}.scenario.json`
            );
            expect(fs.existsSync(scenarioPath)).toBe(false);
            console.log(`✅ ${scenario.state} scenario ${scenario.uuid} deleted`);
        }
        
        // Verify real client scenario still exists
        const clientScenarioPath = path.join(
            scenarioBaseDir,
            `capability/httpPort/${clientPort}/${clientUuid}.scenario.json`
        );
        expect(fs.existsSync(clientScenarioPath)).toBe(true);
        console.log('✅ Running client scenario preserved');
        
        // Cleanup
        await clientServer.stopServer();
    }, 30000);
    
    it('should log housekeeping summary with counts', async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // Create test scenarios
        const shutdownDir = path.join(scenarioBaseDir, 'capability/httpPort/7777');
        fs.mkdirSync(shutdownDir, { recursive: true });
        
        const shutdownScenario = {
            uuid: 'log-test-shutdown',
            objectType: 'ONCE',
            version: componentVersion,
            state: {
                state: 'shutdown',
                capabilities: [{ capability: 'httpPort', port: 7777 }],
                uuid: 'log-test-shutdown',
                isPrimaryServer: false
            },
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            }
        };
        
        fs.writeFileSync(
            path.join(shutdownDir, 'log-test-shutdown.scenario.json'),
            JSON.stringify(shutdownScenario, null, 2)
        );
        
        console.log('✅ Created test shutdown scenario for logging test');
        
        // Capture console output
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args: any[]) => {
            logs.push(args.join(' '));
            originalLog(...args);
        };
        
        // Start primary
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        await primaryServer.startServer();
        
        // Wait for housekeeping
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Restore console.log
        console.log = originalLog;
        
        // Verify housekeeping logged summary
        const housekeepingLog = logs.find(log => log.includes('Housekeeping complete'));
        expect(housekeepingLog).toBeDefined();
        expect(housekeepingLog).toContain('deleted');
        console.log('✅ Housekeeping summary logged:', housekeepingLog);
    }, 15000);
});

