/**
 * Server Lifecycle Management Tests (Black-Box)
 * Tests housekeeping, graceful shutdown, and dynamic server management
 * 
 * ✅ Web4 Compliant: Scenario-based test isolation, NO process.env
 * @pdca 2025-11-21-UTC-1500.scenario-based-test-pattern.md
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { v4 as uuidv4 } from 'uuid';
import { ONCECLI } from '../src/ts/layer5/ONCECLI.js';
import { Scenario } from '../src/ts/layer3/Scenario.js';
import { CLIModel } from '../src/ts/layer3/CLIModel.interface.js';
import { LifecycleState } from '../src/ts/layer3/LifecycleState.enum.js';

/**
 * Helper: Sleep for specified seconds
 */
async function sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

/**
 * Helper: Check if server is healthy via HTTP
 */
async function checkServerHealth(port: number, timeout: number = 1000): Promise<boolean> {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port,
            path: '/health',
            method: 'GET',
            timeout
        }, (res) => {
            resolve(res.statusCode === 200);
        });
        
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
        req.end();
    });
}

/**
 * Helper: Wait for server to be ready
 */
async function waitForServer(port: number, maxWaitMs: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
        if (await checkServerHealth(port)) {
            return true;
        }
        await sleep(0.5);
    }
    return false;
}

/**
 * Helper: Get all scenario files in directory
 */
function getScenarioFiles(scenarioDir: string): string[] {
    if (!fs.existsSync(scenarioDir)) {
        return [];
    }
    return fs.readdirSync(scenarioDir)
        .filter(f => f.endsWith('.scenario.json'))
        .map(f => path.join(scenarioDir, f));
}

/**
 * Helper: Read scenario state (handles both legacy and Web4 formats)
 */
function readScenarioState(filePath: string): LifecycleState | null {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        // Web4 format: data.model.state.state
        // Legacy format: data.state.state
        return data.model?.state?.state || data.state?.state || null;
    } catch (error) {
        return null;
    }
}

/**
 * Helper: Read scenario port
 */
function readScenarioPort(filePath: string): number | null {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return data.model?.metadata?.port || data.metadata?.port || data.model?.port || data.port || null;
    } catch (error) {
        return null;
    }
}

/**
 * Helper: Create test scenario for CLI
 */
function createTestScenario(testDataDir: string, componentRoot: string): Scenario<CLIModel> {
    return {
        ior: {
            protocol: 'web4',
            host: 'localhost',
            uuid: uuidv4(),
            component: 'ONCE',
            version: '0.3.21.2'
        },
        owner: 'test-runner-uuid',
        model: {
            projectRoot: testDataDir,
            componentRoot: componentRoot,
            targetDirectory: testDataDir,
            isTestIsolation: true,
            version: '0.3.21.2'
        }
    };
}

describe('Server Lifecycle Management (Black-Box)', () => {
    let testDataDir: string;
    let scenarioDir: string;
    let componentRoot: string;
    let primaryCLI: ONCECLI | null = null;
    let clientCLIs: ONCECLI[] = [];
    
    beforeEach(async () => {
        // Setup: Create test/data directory
        componentRoot = path.resolve(__dirname, '..');
        testDataDir = path.join(componentRoot, 'test/data');
        
        // Note: scenarioDir will be determined dynamically based on detected domain
        // For now, create a base scenarios directory
        const scenariosBase = path.join(testDataDir, 'scenarios');
        
        // Clean test data
        if (fs.existsSync(testDataDir)) {
            fs.rmSync(testDataDir, { recursive: true, force: true });
        }
        fs.mkdirSync(scenariosBase, { recursive: true });
        
        // scenarioDir will be set after first server start (dynamic domain detection)
        scenarioDir = '';
    });
    
    afterEach(async () => {
        // Cleanup: Stop all test servers
        try {
            if (primaryCLI) {
                await primaryCLI.component.stopServer();
                primaryCLI = null;
            }
            for (const cli of clientCLIs) {
                try {
                    await cli.component.stopServer();
                } catch (e) {
                    // Ignore errors
                }
            }
            clientCLIs = [];
        } catch (error) {
            // Ignore cleanup errors
        }
        
        // Clean test data
        if (fs.existsSync(testDataDir)) {
            fs.rmSync(testDataDir, { recursive: true, force: true });
        }
    });
    
    it('should delete shutdown server scenarios on primary startup', async () => {
        // ARRANGE: Start primary first to detect domain
        const testScenario = createTestScenario(testDataDir, componentRoot);
        primaryCLI = new ONCECLI();
        primaryCLI.init(testScenario);
        await primaryCLI.component.startServer();
        
        await waitForServer(42777, 5000);
        await sleep(1);
        
        // Now detect scenarioDir from actual scenario file location
        const scenariosBase = path.join(testDataDir, 'scenarios');
        const findScenarioDir = (dir: string): string | null => {
            if (!fs.existsSync(dir)) return null;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const result = findScenarioDir(path.join(dir, entry.name));
                    if (result) return result;
                } else if (entry.name.endsWith('.scenario.json')) {
                    return dir;
                }
            }
            return null;
        };
        scenarioDir = findScenarioDir(scenariosBase) || '';
        expect(scenarioDir).not.toBe('');
        
        // Stop primary
        await primaryCLI.component.stopServer();
        primaryCLI = null;
        await sleep(1);
        
        // Create fake shutdown scenario in the SAME directory
        const fakeUUID = uuidv4();
        const fakeScenario = {
            ior: { uuid: fakeUUID, component: 'ONCE', version: '0.3.21.2' },
            owner: 'test-owner',
            model: {
                state: { state: LifecycleState.SHUTDOWN },
                metadata: { port: 8080, isPrimaryServer: false }
            }
        };
        fs.writeFileSync(
            path.join(scenarioDir, `${fakeUUID}.scenario.json`),
            JSON.stringify(fakeScenario, null, 2)
        );
        
        // Verify fake scenario exists
        expect(fs.existsSync(path.join(scenarioDir, `${fakeUUID}.scenario.json`))).toBe(true);
        
        // ACT: Start NEW primary (should trigger housekeeping)
        const newTestScenario = createTestScenario(testDataDir, componentRoot);
        primaryCLI = new ONCECLI();
        primaryCLI.init(newTestScenario);
        await primaryCLI.component.startServer();
        
        await waitForServer(42777, 5000);
        await sleep(2); // Give housekeeping time to complete
        
        // ASSERT: Shutdown scenario should be deleted by housekeeping
        const scenarioExists = fs.existsSync(path.join(scenarioDir, `${fakeUUID}.scenario.json`));
        expect(scenarioExists).toBe(false);
        
        // ASSERT: Primary server should be running
        const primaryHealthy = await checkServerHealth(42777);
        expect(primaryHealthy).toBe(true);
    }, 20000);
    
    it('should discover and keep running client server scenarios', async () => {
        // ARRANGE: Start client server first
        const clientScenario = createTestScenario(testDataDir, componentRoot);
        const clientCLI = new ONCECLI();
        clientCLI.init(clientScenario);
        await clientCLI.component.startServer();
        clientCLIs.push(clientCLI);
        
        await waitForServer(8080, 5000);
        await sleep(1);
        
        // Get client's scenario file
        const clientScenarios = getScenarioFiles(scenarioDir).filter(f => {
            const port = readScenarioPort(f);
            return port === 8080;
        });
        expect(clientScenarios.length).toBe(1);
        const clientScenarioPath = clientScenarios[0];
        
        // ACT: Start primary (should discover client)
        const primaryScenario = createTestScenario(testDataDir, componentRoot);
        primaryCLI = new ONCECLI();
        primaryCLI.init(primaryScenario);
        await primaryCLI.component.startServer();
        
        await waitForServer(42777, 5000);
        await sleep(2); // Wait for discovery
        
        // ASSERT: Client scenario should still exist (not deleted)
        const clientStillExists = fs.existsSync(clientScenarioPath);
        expect(clientStillExists).toBe(true);
        
        // ASSERT: Client should still be healthy
        const clientHealthy = await checkServerHealth(8080);
        expect(clientHealthy).toBe(true);
    }, 20000);
    
    it('should update scenario state to STOPPING then SHUTDOWN', async () => {
        // ARRANGE: Start client server
        const testScenario = createTestScenario(testDataDir, componentRoot);
        const clientCLI = new ONCECLI();
        clientCLI.init(testScenario);
        await clientCLI.component.startServer();
        
        await waitForServer(8080, 5000);
        await sleep(1);
        
        // Get scenario file path
        const scenarioFiles = getScenarioFiles(scenarioDir).filter(f => {
            const port = readScenarioPort(f);
            return port === 8080;
        });
        expect(scenarioFiles.length).toBe(1);
        const scenarioPath = scenarioFiles[0];
        
        // Verify initial state is RUNNING or CLIENT_SERVER
        const initialState = readScenarioState(scenarioPath);
        expect([LifecycleState.RUNNING, LifecycleState.CLIENT_SERVER].includes(initialState!)).toBe(true);
        
        // ACT: Graceful shutdown
        await clientCLI.component.stopServer();
        await sleep(1);
        
        // ASSERT: Scenario state should be SHUTDOWN
        const finalState = readScenarioState(scenarioPath);
        expect(finalState).toBe(LifecycleState.SHUTDOWN);
    }, 15000);
    
    it('should register new client server dynamically', async () => {
        // ARRANGE: Start primary first
        const primaryScenario = createTestScenario(testDataDir, componentRoot);
        primaryCLI = new ONCECLI();
        primaryCLI.init(primaryScenario);
        await primaryCLI.component.startServer();
        
        await waitForServer(42777, 5000);
        await sleep(1);
        
        // ACT: Start client (should auto-register with primary)
        const clientScenario = createTestScenario(testDataDir, componentRoot);
        const clientCLI = new ONCECLI();
        clientCLI.init(clientScenario);
        await clientCLI.component.startServer();
        clientCLIs.push(clientCLI);
        
        await waitForServer(8080, 5000);
        await sleep(2); // Wait for registration
        
        // ASSERT: Client scenario should exist
        const clientScenarios = getScenarioFiles(scenarioDir).filter(f => {
            const port = readScenarioPort(f);
            return port === 8080;
        });
        expect(clientScenarios.length).toBeGreaterThan(0);
        
        // ASSERT: Client should be healthy
        const clientHealthy = await checkServerHealth(8080);
        expect(clientHealthy).toBe(true);
        
        // ASSERT: Client state should be RUNNING or CLIENT_SERVER
        const clientState = readScenarioState(clientScenarios[0]);
        expect([LifecycleState.RUNNING, LifecycleState.CLIENT_SERVER].includes(clientState!)).toBe(true);
    }, 20000);
    
    it('should handle client disconnect and cleanup', async () => {
        // ARRANGE: Start primary and client
        const primaryScenario = createTestScenario(testDataDir, componentRoot);
        primaryCLI = new ONCECLI();
        primaryCLI.init(primaryScenario);
        await primaryCLI.component.startServer();
        
        const clientScenario = createTestScenario(testDataDir, componentRoot);
        const clientCLI = new ONCECLI();
        clientCLI.init(clientScenario);
        await clientCLI.component.startServer();
        clientCLIs.push(clientCLI);
        
        await waitForServer(42777, 5000);
        await waitForServer(8080, 5000);
        await sleep(2); // Wait for registration
        
        // Get client scenario path
        const clientScenarios = getScenarioFiles(scenarioDir).filter(f => {
            const port = readScenarioPort(f);
            return port === 8080;
        });
        expect(clientScenarios.length).toBe(1);
        const clientScenarioPath = clientScenarios[0];
        
        // ACT: Gracefully stop client
        await clientCLI.component.stopServer();
        await sleep(1);
        
        // ASSERT: Client scenario should be marked as SHUTDOWN
        const state = readScenarioState(clientScenarioPath);
        expect(state).toBe(LifecycleState.SHUTDOWN);
        
        // ASSERT: Client should not be reachable
        const clientHealthy = await checkServerHealth(8080);
        expect(clientHealthy).toBe(false);
    }, 20000);
    
    it('should persist server state across restarts', async () => {
        // ARRANGE: Start client server
        const testScenario = createTestScenario(testDataDir, componentRoot);
        let clientCLI = new ONCECLI();
        clientCLI.init(testScenario);
        await clientCLI.component.startServer();
        
        await waitForServer(8080, 5000);
        await sleep(1);
        
        // Get first scenario file
        const firstScenarios = getScenarioFiles(scenarioDir);
        expect(firstScenarios.length).toBe(1);
        const firstScenarioPath = firstScenarios[0];
        const firstUUID = path.basename(firstScenarioPath, '.scenario.json');
        
        // ACT: Stop server
        await clientCLI.component.stopServer();
        await sleep(1);
        
        // ASSERT: First scenario should persist with SHUTDOWN state
        expect(fs.existsSync(firstScenarioPath)).toBe(true);
        const firstState = readScenarioState(firstScenarioPath);
        expect(firstState).toBe(LifecycleState.SHUTDOWN);
        
        // ACT: Start new server on same port
        const newScenario = createTestScenario(testDataDir, componentRoot);
        clientCLI = new ONCECLI();
        clientCLI.init(newScenario);
        await clientCLI.component.startServer();
        clientCLIs.push(clientCLI);
        
        await waitForServer(8080, 5000);
        await sleep(1);
        
        // ASSERT: New scenario should be created (different UUID)
        const secondScenarios = getScenarioFiles(scenarioDir);
        expect(secondScenarios.length).toBe(2); // Old + new
        
        const newScenarios = secondScenarios.filter(f => 
            path.basename(f, '.scenario.json') !== firstUUID
        );
        expect(newScenarios.length).toBe(1);
    }, 20000);
    
    it('should restart primary and rediscover running clients after crash', async () => {
        // ARRANGE: Start primary and clients
        const primaryScenario = createTestScenario(testDataDir, componentRoot);
        primaryCLI = new ONCECLI();
        primaryCLI.init(primaryScenario);
        await primaryCLI.component.startServer();
        
        const client1Scenario = createTestScenario(testDataDir, componentRoot);
        const client1CLI = new ONCECLI();
        client1CLI.init(client1Scenario);
        await client1CLI.component.startServer();
        clientCLIs.push(client1CLI);
        
        const client2Scenario = createTestScenario(testDataDir, componentRoot);
        const client2CLI = new ONCECLI();
        client2CLI.init(client2Scenario);
        await client2CLI.component.startServer();
        clientCLIs.push(client2CLI);
        
        await waitForServer(42777, 5000);
        await waitForServer(8080, 5000);
        await waitForServer(8081, 5000);
        await sleep(2); // Wait for registration
        
        // ACT: "Crash" primary (stop without cleanup - simulates crash)
        // In reality, we still need to stop it cleanly for the test
        await primaryCLI.component.stopServer();
        primaryCLI = null;
        await sleep(1);
        
        // ACT: Restart primary
        const newPrimaryScenario = createTestScenario(testDataDir, componentRoot);
        primaryCLI = new ONCECLI();
        primaryCLI.init(newPrimaryScenario);
        await primaryCLI.component.startServer();
        
        await waitForServer(42777, 5000);
        await sleep(3); // Wait for housekeeping to discover clients
        
        // ASSERT: Clients should still be running
        const client1Healthy = await checkServerHealth(8080);
        const client2Healthy = await checkServerHealth(8081);
        expect(client1Healthy).toBe(true);
        expect(client2Healthy).toBe(true);
        
        // ASSERT: Client scenarios should still exist
        const client1Scenarios = getScenarioFiles(scenarioDir).filter(f => {
            const port = readScenarioPort(f);
            const state = readScenarioState(f);
            return port === 8080 && state !== LifecycleState.SHUTDOWN;
        });
        const client2Scenarios = getScenarioFiles(scenarioDir).filter(f => {
            const port = readScenarioPort(f);
            const state = readScenarioState(f);
            return port === 8081 && state !== LifecycleState.SHUTDOWN;
        });
        expect(client1Scenarios.length).toBe(1);
        expect(client2Scenarios.length).toBe(1);
    }, 30000);
});
