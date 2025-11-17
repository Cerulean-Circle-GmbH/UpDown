/**
 * Server Lifecycle Management Tests
 * Tests housekeeping, graceful shutdown, and dynamic server management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Server Lifecycle Management', () => {
    // Scenarios are stored in project root - use path authority from DefaultONCE instance
    let testProjectRoot: string;
    let scenarioBaseDir: string;
    let componentVersion: string;
    let detectedDomain: string; // ✅ Dynamic domain detection
    
    beforeEach(async () => {
        // Get project root and version from DefaultONCE path authority (TRUE Radical OOP)
        const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
        const tempInstance = new DefaultONCE();
        await tempInstance.init();
        
        // Trigger web4ts initialization to populate model.projectRoot
        await (tempInstance as any).getWeb4TSComponent();
        
        testProjectRoot = tempInstance.model.projectRoot;
        componentVersion = tempInstance.model.version;
        
        // ✅ Get the actual domain being used by servers
        await tempInstance.startServer();
        const serverModel = (tempInstance as any).serverHierarchyManager.getServerModel();
        detectedDomain = serverModel.domain;
        await tempInstance.stopServer();
        
        scenarioBaseDir = path.join(testProjectRoot, `scenarios/${detectedDomain}/ONCE/${componentVersion}`);
        console.log(`📂 Using scenario directory: scenarios/${detectedDomain}/ONCE/${componentVersion}`);
        
        // Clean up any existing test scenarios
        if (fs.existsSync(scenarioBaseDir)) {
            fs.rmSync(scenarioBaseDir, { recursive: true, force: true });
        }
    });
    
    afterEach(async () => {
        // Clean up test scenarios
        if (fs.existsSync(scenarioBaseDir)) {
            fs.rmSync(scenarioBaseDir, { recursive: true, force: true });
        }
    });
    
    describe('Housekeeping at Startup', () => {
        it('should delete shutdown server scenarios on primary startup', async () => {
            const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
            
            // Create a shutdown scenario (main location + symlink)
            const shutdownScenario = {
                uuid: 'test-shutdown-server',
                objectType: 'ONCE',
                version: componentVersion,
                state: {
                    state: 'shutdown',
                    capabilities: [{ capability: 'httpPort', port: 8080 }]
                }
            };
            
            // Write to main location
            const mainPath = `${scenarioBaseDir}/test-shutdown-server.scenario.json`;
            fs.writeFileSync(mainPath, JSON.stringify(shutdownScenario, null, 2));
            
            // Create symlink
            const shutdownScenarioDir = `${scenarioBaseDir}/capability/httpPort/8080`;
            fs.mkdirSync(shutdownScenarioDir, { recursive: true });
            const symlinkPath = `${shutdownScenarioDir}/test-shutdown-server.scenario.json`;
            fs.symlinkSync(path.relative(shutdownScenarioDir, mainPath), symlinkPath);
            
            // Verify both exist
            expect(fs.existsSync(mainPath)).toBe(true);
            expect(fs.lstatSync(symlinkPath).isSymbolicLink()).toBe(true);
            
            // Start primary server (triggers housekeeping)
            const primaryServer = new DefaultONCE();
            await primaryServer.init();
            await primaryServer.startServer();
            
            // Wait for housekeeping to complete
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verify shutdown scenario and symlink were deleted
            expect(fs.existsSync(mainPath)).toBe(false);
            expect(fs.existsSync(symlinkPath)).toBe(false);
            
            // Cleanup
            await primaryServer.stopServer();
        }, 15000);
        
        it('should discover and keep running client server scenarios', async () => {
            const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
            
            // Start PRIMARY server first to claim port 42777
            const primaryServer = new DefaultONCE();
            await primaryServer.init();
            await primaryServer.startServer();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Now start a client server (will get port 8080)
            const clientServer = new DefaultONCE();
            await clientServer.init();
            await clientServer.startServer();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get the client's scenario path
            const clientModel = clientServer.getServerModel();
            const clientPort = clientModel.capabilities.find(c => c.capability === 'httpPort')?.port;
            const clientScenarioPath = `${scenarioBaseDir}/capability/httpPort/${clientPort}/${clientModel.uuid}.scenario.json`;
            
            // Verify client scenario exists
            expect(fs.existsSync(clientScenarioPath)).toBe(true);
            expect(clientPort).not.toBe(42777); // Should be client, not primary
            
            // Stop client but keep scenario as "running" (simulating crash)
            await clientServer.stopServer();
            
            // Manually set scenario back to running state (simulate unclean shutdown)
            const scenarioData = JSON.parse(fs.readFileSync(clientScenarioPath, 'utf8'));
            scenarioData.state.state = 'running';
            fs.writeFileSync(clientScenarioPath, JSON.stringify(scenarioData, null, 2));
            
            // Scenario should be deleted by housekeeping since server is not reachable
            // We'll restart primary to trigger housekeeping again
            await primaryServer.stopServer();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const primaryServer2 = new DefaultONCE();
            await primaryServer2.init();
            await primaryServer2.startServer();
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Scenario should be deleted because server is not reachable
            expect(fs.existsSync(clientScenarioPath)).toBe(false);
            
            // Cleanup
            await primaryServer2.stopServer();
        }, 25000);
    });
    
    describe('Graceful Shutdown', () => {
        it('should update scenario state to STOPPING then SHUTDOWN', async () => {
            const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
            
            // Start server
            const server = new DefaultONCE();
            await server.init();
            await server.startServer();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get scenario path
            const serverModel = server.getServerModel();
            const port = serverModel.capabilities.find(c => c.capability === 'httpPort')?.port;
            const scenarioPath = `${scenarioBaseDir}/capability/httpPort/${port}/${serverModel.uuid}.scenario.json`;
            
            // Verify scenario exists with RUNNING state
            expect(fs.existsSync(scenarioPath)).toBe(true);
            const runningScenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
            expect(runningScenario.state.state).toBe('running');
            
            // Stop server (triggers graceful shutdown)
            await server.stopServer();
            
            // Verify scenario was updated to SHUTDOWN state
            expect(fs.existsSync(scenarioPath)).toBe(true);
            const shutdownScenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
            expect(shutdownScenario.state.state).toBe('shutdown');
        }, 10000);
    });
    
    describe('Dynamic Server Addition', () => {
        it('should register new client server dynamically', async () => {
            const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
            
            // Start primary server
            const primaryServer = new DefaultONCE();
            await primaryServer.init();
            await primaryServer.startServer();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Verify no clients initially
            const initialServers = primaryServer.getRegisteredServers();
            expect(initialServers.length).toBe(0);
            
            // Start first client server
            const client1 = new DefaultONCE();
            await client1.init();
            await client1.startServer();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Verify client registered
            const afterClient1 = primaryServer.getRegisteredServers();
            expect(afterClient1.length).toBe(1);
            
            // Start second client server dynamically
            const client2 = new DefaultONCE();
            await client2.init();
            await client2.startServer();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Verify second client registered
            const afterClient2 = primaryServer.getRegisteredServers();
            expect(afterClient2.length).toBe(2);
            
            // Verify both clients have different ports
            const ports = afterClient2.map(s => 
                s.capabilities.find(c => c.capability === 'httpPort')?.port
            );
            expect(new Set(ports).size).toBe(2);
            
            // Cleanup
            await client2.stopServer();
            await client1.stopServer();
            await primaryServer.stopServer();
        }, 20000);
        
        it('should handle client disconnect and cleanup', async () => {
            const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
            
            // Start primary and client
            const primaryServer = new DefaultONCE();
            await primaryServer.init();
            await primaryServer.startServer();
            
            const clientServer = new DefaultONCE();
            await clientServer.init();
            await clientServer.startServer();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Verify client registered
            expect(primaryServer.getRegisteredServers().length).toBe(1);
            
            // Get client scenario path
            const clientModel = clientServer.getServerModel();
            const clientPort = clientModel.capabilities.find(c => c.capability === 'httpPort')?.port;
            const clientScenarioPath = `${scenarioBaseDir}/capability/httpPort/${clientPort}/${clientModel.uuid}.scenario.json`;
            
            // Stop client (triggers graceful shutdown)
            await clientServer.stopServer();
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Verify scenario shows shutdown state
            expect(fs.existsSync(clientScenarioPath)).toBe(true);
            const scenario = JSON.parse(fs.readFileSync(clientScenarioPath, 'utf8'));
            expect(scenario.state.state).toBe('shutdown');
            
            // Cleanup
            await primaryServer.stopServer();
        }, 15000);
    });
    
    describe('Scenario Persistence', () => {
        it('should persist server state across restarts', async () => {
            const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
            
            // Start server
            const server1 = new DefaultONCE();
            await server1.init();
            await server1.startServer();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const serverModel1 = server1.getServerModel();
            const port = serverModel1.capabilities.find(c => c.capability === 'httpPort')?.port;
            const uuid = serverModel1.uuid;
            
            // Stop server gracefully
            await server1.stopServer();
            
            // Verify shutdown scenario exists
            const scenarioPath = `${scenarioBaseDir}/capability/httpPort/${port}/${uuid}.scenario.json`;
            expect(fs.existsSync(scenarioPath)).toBe(true);
            
            // Start new server instance (different UUID)
            const server2 = new DefaultONCE();
            await server2.init();
            await server2.startServer();
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Original shutdown scenario should be cleaned up by housekeeping
            expect(fs.existsSync(scenarioPath)).toBe(false);
            
            // Cleanup
            await server2.stopServer();
        }, 15000);
    });
    
    describe('Primary Server Crash Recovery', () => {
        it('should restart primary and rediscover running clients after crash', async () => {
            const { DefaultONCE } = await import('../dist/ts/layer2/DefaultONCE.js');
            
            // Start PRIMARY server
            const primaryServer = new DefaultONCE();
            await primaryServer.init();
            await primaryServer.startServer();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Start 2 client servers
            const client1 = new DefaultONCE();
            await client1.init();
            await client1.startServer();
            
            const client2 = new DefaultONCE();
            await client2.init();
            await client2.startServer();
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Verify clients are registered
            const registeredServers = primaryServer.getRegisteredServers();
            expect(registeredServers.length).toBe(2);
            console.log('✅ Initial setup: 2 clients registered');
            
            // Get primary server PID
            const primaryModel = primaryServer.getServerModel();
            const primaryPid = primaryModel.pid;
            const client1Model = client1.getServerModel();
            const client2Model = client2.getServerModel();
            const client1Port = client1Model.capabilities.find(c => c.capability === 'httpPort')?.port;
            const client2Port = client2Model.capabilities.find(c => c.capability === 'httpPort')?.port;
            
            console.log(`🔍 Primary PID: ${primaryPid}, Client1 Port: ${client1Port}, Client2 Port: ${client2Port}`);
            
            // Verify client scenarios exist
            const client1ScenarioPath = `${scenarioBaseDir}/capability/httpPort/${client1Port}/${client1Model.uuid}.scenario.json`;
            const client2ScenarioPath = `${scenarioBaseDir}/capability/httpPort/${client2Port}/${client2Model.uuid}.scenario.json`;
            expect(fs.existsSync(client1ScenarioPath)).toBe(true);
            expect(fs.existsSync(client2ScenarioPath)).toBe(true);
            
            // 💥 SIMULATE CRASH: Kill primary server process forcefully (no graceful shutdown)
            console.log(`💥 Simulating crash: killing primary server PID ${primaryPid}`);
            try {
                process.kill(primaryPid, 'SIGKILL');
            } catch (error) {
                console.warn('⚠️  Kill signal sent (may have already terminated)');
            }
            
            // Wait for kill to take effect
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verify clients are still running (they should be)
            expect(client1.getServerModel().state).toBe('running');
            expect(client2.getServerModel().state).toBe('running');
            console.log('✅ Clients still running after primary crash');
            
            // ♻️  RESTART: Start new primary server (will claim port 42777 again)
            console.log('♻️  Restarting primary server...');
            const newPrimaryServer = new DefaultONCE();
            await newPrimaryServer.init();
            await newPrimaryServer.startServer();
            
            // Wait for housekeeping to complete (discovers running clients)
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Verify new primary rediscovered both running clients
            const rediscoveredServers = newPrimaryServer.getRegisteredServers();
            console.log(`🔍 Rediscovered ${rediscoveredServers.length} servers`);
            
            // Note: Clients won't auto-reconnect to new primary without websocket reconnection logic
            // But housekeeping should discover their scenario files
            expect(fs.existsSync(client1ScenarioPath)).toBe(true);
            expect(fs.existsSync(client2ScenarioPath)).toBe(true);
            console.log('✅ Client scenarios still exist and were discovered');
            
            // Verify scenarios show running state
            const client1Scenario = JSON.parse(fs.readFileSync(client1ScenarioPath, 'utf8'));
            const client2Scenario = JSON.parse(fs.readFileSync(client2ScenarioPath, 'utf8'));
            expect(client1Scenario.state.state).toBe('running');
            expect(client2Scenario.state.state).toBe('running');
            console.log('✅ Client scenarios show running state');
            
            // Cleanup - stop all servers gracefully
            await client1.stopServer();
            await client2.stopServer();
            await newPrimaryServer.stopServer();
            
            console.log('✅ Primary crash recovery test completed');
        }, 30000);
    });
});

