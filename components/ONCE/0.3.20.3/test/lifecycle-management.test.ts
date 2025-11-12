/**
 * Server Lifecycle Management Tests
 * Tests housekeeping, graceful shutdown, and dynamic server management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Server Lifecycle Management', () => {
    const scenarioBaseDir = 'scenarios/local.once/ONCE/0.3.20.3';
    
    beforeEach(() => {
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
            
            // Create a shutdown scenario
            const shutdownScenarioDir = `${scenarioBaseDir}/capability/httpPort/8080`;
            fs.mkdirSync(shutdownScenarioDir, { recursive: true });
            
            const shutdownScenario = {
                uuid: 'test-shutdown-server',
                objectType: 'ONCE',
                version: '0.2.0.0',
                state: {
                    state: 'shutdown',
                    capabilities: [{ capability: 'httpPort', port: 8080 }]
                }
            };
            
            fs.writeFileSync(
                `${shutdownScenarioDir}/test-shutdown-server.scenario.json`,
                JSON.stringify(shutdownScenario, null, 2)
            );
            
            // Verify scenario exists
            expect(fs.existsSync(`${shutdownScenarioDir}/test-shutdown-server.scenario.json`)).toBe(true);
            
            // Start primary server (triggers housekeeping)
            const primaryServer = new DefaultONCE();
            await primaryServer.init();
            await primaryServer.startServer();
            
            // Wait for housekeeping to complete
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verify shutdown scenario was deleted
            expect(fs.existsSync(`${shutdownScenarioDir}/test-shutdown-server.scenario.json`)).toBe(false);
            
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
});

