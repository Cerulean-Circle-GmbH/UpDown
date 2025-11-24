/**
 * Primary Server Housekeeping Tests
 * Tests cleanup of stale scenarios, shutdown scenarios, and discovery of running servers
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

describe('Primary Server Housekeeping', () => {
    let primaryServer: any;
    let scenarioBaseDir: string;
    let testProjectRoot: string;
    let componentVersion: string;
    let detectedDomain: string;
    let detectedHostname: string;
    let domainPath: string[];
    const serverInstances: any[] = []; // Track all server instances for cleanup
    let domainDetected = false; // Cache domain detection across tests
    
    beforeEach(async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // ✅ Dynamically discover component root from test file location
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const componentRoot = path.resolve(__dirname, '..');
        
        // ✅ TEST ISOLATION: Use test/data as project root (not production!)
        testProjectRoot = path.join(componentRoot, 'test/data');
        
        // Create test/data directory if it doesn't exist
        if (!fs.existsSync(testProjectRoot)) {
            fs.mkdirSync(testProjectRoot, { recursive: true });
        }
        
        // Get version from DefaultONCE
        const tempInstance = new DefaultONCE();
        await tempInstance.init();
        await (tempInstance as any).getWeb4TSComponent();
        componentVersion = tempInstance.model.version;
        
        // Override project root for test isolation
        tempInstance.model.projectRoot = testProjectRoot;
        
        // Detect domain/hostname only once (first test run)
        if (!domainDetected) {
            await tempInstance.startServer();
            const serverModel = (tempInstance as any).serverHierarchyManager.getServerModel();
            detectedDomain = serverModel.domain;
            detectedHostname = serverModel.hostname;
            
            // Parse domain into path components
            const fqdn = serverModel.host;
            if (fqdn === 'localhost') {
                domainPath = ['local', 'once'];
            } else if (fqdn.includes('.')) {
                const parts = fqdn.split('.');
                const domain = parts.slice(1);
                domainPath = domain.reverse();
            } else {
                domainPath = ['local', fqdn];
            }
            
            await tempInstance.stopServer();
            domainDetected = true;
        }
        
        scenarioBaseDir = path.join(testProjectRoot, 'scenarios', ...domainPath, detectedHostname, 'ONCE', componentVersion);
        
        // Ensure scenario directory exists for tests
        if (!fs.existsSync(scenarioBaseDir)) {
            fs.mkdirSync(scenarioBaseDir, { recursive: true });
        }
        
        // Check if primary server (port 42777) is already running
        // If so, trigger graceful shutdown to clean slate for test
        try {
            const http = await import('http');
            
            // Try to connect to port 42777
            await new Promise<void>((resolve, reject) => {
                const checkRequest = http.request({
                    hostname: 'localhost',
                    port: 42777,
                    path: '/health',
                    method: 'GET',
                    timeout: 500
                }, (res) => {
                    // Server is running - trigger shutdown
                    console.log('⚠️  Existing primary server detected on port 42777, triggering shutdown...');
                    
                    const shutdownRequest = http.request({
                        hostname: 'localhost',
                        port: 42777,
                        path: '/shutdown-primary',
                        method: 'POST',
                        timeout: 2000
                    }, () => {
                        console.log('✅ Shutdown request sent');
                        resolve();
                    });
                    
                    shutdownRequest.on('error', (error) => {
                        console.log('❌ Shutdown request failed:', error.message);
                        reject(error);
                    });
                    
                    shutdownRequest.end();
                });
                
                checkRequest.on('error', () => {
                    // Port not occupied - good to go
                    console.log('✅ Port 42777 available, no cleanup needed');
                    resolve();
                });
                
                checkRequest.on('timeout', () => {
                    checkRequest.destroy();
                    console.log('✅ Port 42777 timeout (likely available)');
                    resolve();
                });
                
                checkRequest.end();
            });
            
            // Wait for shutdown to complete
            await new Promise(resolve => setTimeout(resolve, 4000));
            
        } catch (error) {
            // Port check failed - continue
            console.log('ℹ️  Port check error (continuing):', error);
        }
        
        // Clean up scenarios (but keep directory)
        if (fs.existsSync(scenarioBaseDir)) {
            const files = fs.readdirSync(scenarioBaseDir).filter(f => f.endsWith('.scenario.json'));
            for (const file of files) {
                const filePath = path.join(scenarioBaseDir, file);
                if (fs.lstatSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                }
            }
            
            // Clean up capability symlinks (tests will recreate them)
            const capabilityDir = path.join(scenarioBaseDir, 'capability');
            if (fs.existsSync(capabilityDir)) {
                const httpPortDir = path.join(capabilityDir, 'httpPort');
                if (fs.existsSync(httpPortDir)) {
                    const ports = fs.readdirSync(httpPortDir);
                    for (const port of ports) {
                        const portDir = path.join(httpPortDir, port);
                        if (fs.existsSync(portDir) && fs.lstatSync(portDir).isDirectory()) {
                            const symlinks = fs.readdirSync(portDir);
                            for (const symlink of symlinks) {
                                fs.unlinkSync(path.join(portDir, symlink));
                            }
                            // Remove empty port directory
                            if (fs.readdirSync(portDir).length === 0) {
                                fs.rmdirSync(portDir);
                            }
                        }
                    }
                }
            }
        }
    });
    
    afterEach(async () => {
        // Stop all tracked servers
        for (const server of serverInstances) {
            try {
                await server.stopServer();
            } catch (error) {
                console.error('Error stopping server:', error);
            }
        }
        serverInstances.length = 0; // Clear array
        
        // Graceful cleanup of primary
        if (primaryServer) {
            try {
                await primaryServer.stopServer();
            } catch (error) {
                console.error('Error stopping primary:', error);
            }
            primaryServer = null;
        }
        
        // Clean up test scenarios (ONLY delete files, NOT directories!)
        // CRITICAL: Never delete scenario directories - other components may store data there
        if (fs.existsSync(scenarioBaseDir)) {
            // Delete all .scenario.json files in main directory
            const files = fs.readdirSync(scenarioBaseDir).filter(f => f.endsWith('.scenario.json'));
            for (const file of files) {
                const filePath = path.join(scenarioBaseDir, file);
                if (fs.lstatSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                }
            }
            
            // Clean up capability symlinks
            const capabilityDir = path.join(scenarioBaseDir, 'capability');
            if (fs.existsSync(capabilityDir)) {
                const httpPortDir = path.join(capabilityDir, 'httpPort');
                if (fs.existsSync(httpPortDir)) {
                    const ports = fs.readdirSync(httpPortDir);
                    for (const port of ports) {
                        const portDir = path.join(httpPortDir, port);
                        if (fs.existsSync(portDir) && fs.lstatSync(portDir).isDirectory()) {
                            const symlinks = fs.readdirSync(portDir);
                            for (const symlink of symlinks) {
                                fs.unlinkSync(path.join(portDir, symlink));
                            }
                            // Remove empty port directory
                            if (fs.readdirSync(portDir).length === 0) {
                                fs.rmdirSync(portDir);
                            }
                        }
                    }
                }
            }
        }
    });
    
    it('should delete scenarios with state=shutdown on startup', async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // ✅ FIX: Create shutdown scenario BEFORE starting primary server
        // This way housekeeping (which runs on startup) will find and delete it
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
        
        // Write to main location
        const mainScenarioPath = path.join(scenarioBaseDir, 'test-shutdown-uuid.scenario.json');
        fs.writeFileSync(mainScenarioPath, JSON.stringify(shutdownScenario, null, 2));
        
        // Create symlink in capability dir (mimicking production behavior)
        const capabilityDir = path.join(scenarioBaseDir, 'capability/httpPort/8080');
        fs.mkdirSync(capabilityDir, { recursive: true });
        const symlinkPath = path.join(capabilityDir, 'test-shutdown-uuid.scenario.json');
        fs.symlinkSync(path.relative(capabilityDir, mainScenarioPath), symlinkPath);
        
        console.log('✅ Created test shutdown scenario with symlink');
        expect(fs.existsSync(mainScenarioPath)).toBe(true);
        expect(fs.lstatSync(symlinkPath).isSymbolicLink()).toBe(true);
        
        // NOW start primary server - housekeeping runs automatically and should delete shutdown scenario
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        // Override projectRoot for test isolation
        primaryServer.model.projectRoot = testProjectRoot;
        await primaryServer.startServer();
        
        // Housekeeping runs during startServer(), so scenario should already be deleted
        // Give it a moment to complete filesystem operations
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify shutdown scenario and symlink were deleted by housekeeping
        expect(fs.existsSync(mainScenarioPath)).toBe(false);
        expect(fs.existsSync(symlinkPath)).toBe(false);
        console.log('✅ Shutdown scenario and symlink successfully deleted by housekeeping');
    }, 15000);
    
    it('should delete stale scenarios for unreachable servers', async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // ✅ FIX: Create stale scenario BEFORE starting primary server
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
        
        // Write to main location
        const mainScenarioPath = path.join(scenarioBaseDir, 'test-stale-uuid.scenario.json');
        fs.writeFileSync(mainScenarioPath, JSON.stringify(staleScenario, null, 2));
        
        // Create symlink in capability dir
        const capabilityDir = path.join(scenarioBaseDir, 'capability/httpPort/9999');
        fs.mkdirSync(capabilityDir, { recursive: true });
        const symlinkPath = path.join(capabilityDir, 'test-stale-uuid.scenario.json');
        fs.symlinkSync(path.relative(capabilityDir, mainScenarioPath), symlinkPath);
        
        console.log('✅ Created test stale scenario (port 9999 - unreachable) with symlink');
        expect(fs.existsSync(mainScenarioPath)).toBe(true);
        
        // NOW start primary server - housekeeping should try to reach port 9999, fail, and delete
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        // Override projectRoot for test isolation
        primaryServer.model.projectRoot = testProjectRoot;
        await primaryServer.startServer();
        
        // Housekeeping runs during startServer() - it tries to connect to port 9999
        // Give it a moment to try connecting and clean up
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Verify stale scenario and symlink were deleted
        expect(fs.existsSync(mainScenarioPath)).toBe(false);
        expect(fs.existsSync(symlinkPath)).toBe(false);
        console.log('✅ Stale scenario and symlink successfully deleted by housekeeping');
    }, 15000);
    
    it('should keep scenarios for running and reachable servers', async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // Start primary first
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        primaryServer.model.projectRoot = testProjectRoot;  // ✅ Test isolation
        await primaryServer.startServer();
        
        console.log('✅ Primary server started');
        
        // Start a real client server
        const clientServer = new DefaultONCE();
        await clientServer.init();
        clientServer.model.projectRoot = testProjectRoot;  // ✅ Test isolation
        await clientServer.startServer();
        serverInstances.push(clientServer); // Track for cleanup
        
        const clientModel = clientServer.getServerModel();
        const clientPort = clientModel.capabilities.find(c => c.capability === 'httpPort')?.port;
        const clientUuid = clientModel.uuid;
        
        console.log(`✅ Client server started on port ${clientPort}, UUID: ${clientUuid}`);
        
        // Wait for client to save its scenario
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify client scenario exists (main location, not symlink)
        const clientMainScenarioPath = path.join(
            scenarioBaseDir,
            `${clientUuid}.scenario.json`
        );
        expect(fs.existsSync(clientMainScenarioPath)).toBe(true);
        console.log('✅ Client scenario created');
        
        // ✅ FIX: Explicitly trigger housekeeping (don't rely on restart)
        const housekeepingResult = await (primaryServer as any).serverHierarchyManager.performHousekeeping();
        console.log(`✅ Housekeeping complete: ${housekeepingResult.deleted} deleted, ${housekeepingResult.discovered} discovered`);
        
        // Client scenario should still exist (server is reachable)
        expect(fs.existsSync(clientMainScenarioPath)).toBe(true);
        console.log('✅ Running client scenario preserved by housekeeping');
        
        // ✅ NEW: Verify client was discovered and registered
        const registeredServers = (primaryServer as any).serverHierarchyManager.getRegisteredServers();
        expect(registeredServers.length).toBeGreaterThan(0);
        console.log(`✅ Discovered ${registeredServers.length} running server(s)`);
        
        // Cleanup client server gracefully
        await clientServer.stopServer();
    }, 40000);
    
    it('should discover and re-register running client servers', async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // Start primary
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        primaryServer.model.projectRoot = testProjectRoot;  // ✅ Test isolation
        await primaryServer.startServer();
        
        // Start client
        const clientServer = new DefaultONCE();
        await clientServer.init();
        clientServer.model.projectRoot = testProjectRoot;  // ✅ Test isolation
        await clientServer.startServer();
        serverInstances.push(clientServer); // Track for cleanup
        
        const clientModel = clientServer.getServerModel();
        const clientUuid = clientModel.uuid;
        
        console.log(`✅ Client server started, UUID: ${clientUuid}`);
        
        // Wait for client to save its scenario
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // ✅ FIX: Explicitly trigger filesystem discovery via housekeeping
        const result = await (primaryServer as any).serverHierarchyManager.performHousekeeping();
        console.log(`✅ Housekeeping: ${result.discovered} discovered, ${result.deleted} deleted`);
        
        // ✅ NEW: Verify discovery worked
        expect(result.discovered).toBeGreaterThan(0);
        
        // ✅ NEW: Verify client is in registry (as scenario)
        const registeredServers = (primaryServer as any).serverHierarchyManager.getRegisteredServers();
        expect(registeredServers.length).toBeGreaterThan(0);
        
        // ✅ NEW: Verify scenario format (not model format)
        const clientScenario = registeredServers.find((s: any) => s.model?.uuid === clientUuid);
        expect(clientScenario).toBeDefined();
        expect(clientScenario.model).toBeDefined();  // Scenario has model
        expect(clientScenario.ior).toBeDefined();     // Scenario has ior
        console.log('✅ Client discovered and registered via filesystem scenario discovery');
        
        // Cleanup
        await clientServer.stopServer();
    }, 25000);
    
    it('should handle mixed scenarios: delete stale, keep running', async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // ✅ FIX: Create test scenarios BEFORE starting primary
        const scenarios = [
            { uuid: 'shutdown-1', port: 8888, state: 'shutdown' },
            { uuid: 'shutdown-2', port: 8889, state: 'shutdown' },
            { uuid: 'stale-1', port: 9998, state: 'running' },  // Unreachable
            { uuid: 'stale-2', port: 9999, state: 'running' },  // Unreachable
        ];
        
        for (const scenario of scenarios) {
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
            
            // Write to main location
            const mainPath = path.join(scenarioBaseDir, `${scenario.uuid}.scenario.json`);
            fs.writeFileSync(mainPath, JSON.stringify(scenarioData, null, 2));
            
            // Create symlink in capability dir
            const capabilityDir = path.join(scenarioBaseDir, `capability/httpPort/${scenario.port}`);
            fs.mkdirSync(capabilityDir, { recursive: true });
            const symlinkPath = path.join(capabilityDir, `${scenario.uuid}.scenario.json`);
            fs.symlinkSync(path.relative(capabilityDir, mainPath), symlinkPath);
        }
        
        console.log('✅ Created 4 test scenarios with symlinks (2 shutdown, 2 stale)');
        
        // Start a real client server (will be kept)
        const clientServer = new DefaultONCE();
        await clientServer.init();
        clientServer.model.projectRoot = testProjectRoot;  // ✅ Test isolation
        await clientServer.startServer();
        serverInstances.push(clientServer); // Track for cleanup
        
        const clientModel = clientServer.getServerModel();
        const clientPort = clientModel.capabilities.find(c => c.capability === 'httpPort')?.port;
        const clientUuid = clientModel.uuid;
        
        console.log(`✅ Real client started on port ${clientPort}`);
        
        // Wait for client scenario creation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // NOW start primary - triggers housekeeping which should clean up stale/shutdown scenarios
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        primaryServer.model.projectRoot = testProjectRoot;  // ✅ Test isolation
        await primaryServer.startServer();
        
        console.log('✅ Primary started - housekeeping runs automatically');
        
        // Housekeeping runs during startServer() - give it time to check ports and clean up
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify results - shutdown and stale scenarios should be deleted
        for (const scenario of scenarios) {
            const mainPath = path.join(scenarioBaseDir, `${scenario.uuid}.scenario.json`);
            const symlinkPath = path.join(
                scenarioBaseDir,
                `capability/httpPort/${scenario.port}/${scenario.uuid}.scenario.json`
            );
            expect(fs.existsSync(mainPath)).toBe(false);
            expect(fs.existsSync(symlinkPath)).toBe(false);
            console.log(`✅ ${scenario.state} scenario ${scenario.uuid} deleted`);
        }
        
        // Verify real client scenario still exists
        const clientMainPath = path.join(scenarioBaseDir, `${clientUuid}.scenario.json`);
        const clientSymlinkPath = path.join(
            scenarioBaseDir,
            `capability/httpPort/${clientPort}/${clientUuid}.scenario.json`
        );
        expect(fs.existsSync(clientMainPath)).toBe(true);
        expect(fs.existsSync(clientSymlinkPath)).toBe(true);
        console.log('✅ Running client scenario (main + symlink) preserved');
        
        // Cleanup
        await clientServer.stopServer();
    }, 30000);
    
    it('should log housekeeping summary with counts', async () => {
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // Create test scenarios (main location + symlinks)
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
        
        // Write to main location
        const mainPath = path.join(scenarioBaseDir, 'log-test-shutdown.scenario.json');
        fs.writeFileSync(mainPath, JSON.stringify(shutdownScenario, null, 2));
        
        // Create symlink
        const shutdownDir = path.join(scenarioBaseDir, 'capability/httpPort/7777');
        fs.mkdirSync(shutdownDir, { recursive: true });
        const symlinkPath = path.join(shutdownDir, 'log-test-shutdown.scenario.json');
        fs.symlinkSync(path.relative(shutdownDir, mainPath), symlinkPath);
        
        console.log('✅ Created test shutdown scenario for logging test');
        
        // Capture console output
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args: any[]) => {
            logs.push(args.join(' '));
            originalLog(...args);
        };
        
        // Start primary - housekeeping runs and should log summary
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        primaryServer.model.projectRoot = testProjectRoot;  // ✅ Test isolation
        await primaryServer.startServer();
        
        // Housekeeping runs during startServer()
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Restore console.log
        console.log = originalLog;
        
        // Verify housekeeping logged summary
        const housekeepingLog = logs.find(log => log.includes('Housekeeping complete'));
        expect(housekeepingLog).toBeDefined();
        expect(housekeepingLog).toContain('deleted');
        console.log('✅ Housekeeping summary logged:', housekeepingLog);
    }, 15000);

    it('should clean up broken symlinks and empty directories', async () => {
        // This test verifies Fix Finding 9 - Orphaned symlinks cleanup
        // @pdca 2025-11-20-UTC-1600.iteration-01.5-test-stabilization.pdca.md
        
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        
        // Get the ONCE base directory (parent of version directories)
        const onceBaseDir = path.dirname(scenarioBaseDir);
        const testVersionDir = path.join(onceBaseDir, 'test-cleanup-version');
        const capabilityDir = path.join(testVersionDir, 'capability', 'httpPort');
        const port9000Dir = path.join(capabilityDir, '9000');
        const port9001Dir = path.join(capabilityDir, '9001');
        
        fs.mkdirSync(port9000Dir, { recursive: true });
        fs.mkdirSync(port9001Dir, { recursive: true });
        
        // Create broken symlinks (pointing to non-existent files)
        const symlinkPath1 = path.join(port9000Dir, 'broken1.scenario.json');
        const symlinkPath2 = path.join(port9001Dir, 'broken2.scenario.json');
        
        fs.symlinkSync('../../../non-existent-file.json', symlinkPath1);
        fs.symlinkSync('../../../non-existent-file.json', symlinkPath2);
        
        // Verify broken symlinks exist before housekeeping
        expect(fs.lstatSync(symlinkPath1).isSymbolicLink()).toBe(true);
        expect(fs.lstatSync(symlinkPath2).isSymbolicLink()).toBe(true);
        expect(fs.existsSync(symlinkPath1)).toBe(false); // Target doesn't exist
        expect(fs.existsSync(symlinkPath2)).toBe(false); // Target doesn't exist
        console.log(`✅ Created broken symlinks in ${testVersionDir}`);
        
        // Start primary server (triggers housekeeping)
        primaryServer = new DefaultONCE();
        await primaryServer.init();
        primaryServer.model.projectRoot = testProjectRoot;  // ✅ Test isolation
        await primaryServer.startServer();
        serverInstances.push(primaryServer);
        
        // Housekeeping runs during startServer() - give it time to clean up
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify broken symlinks were deleted
        expect(fs.existsSync(symlinkPath1)).toBe(false);
        expect(fs.existsSync(symlinkPath2)).toBe(false);
        console.log('✅ Broken symlinks deleted');
        
        // Verify empty port directories were removed
        expect(fs.existsSync(port9000Dir)).toBe(false);
        expect(fs.existsSync(port9001Dir)).toBe(false);
        console.log('✅ Empty port directories removed');
        
        // Verify capability directory was removed (should be empty after port dirs deleted)
        expect(fs.existsSync(capabilityDir)).toBe(false);
        console.log('✅ Empty capability directory removed');
        
        // Cleanup
        await primaryServer.stopServer();
        
        // Clean up test version directory if it still exists
        if (fs.existsSync(testVersionDir)) {
            fs.rmSync(testVersionDir, { recursive: true, force: true });
        }
    }, 15000);
});

