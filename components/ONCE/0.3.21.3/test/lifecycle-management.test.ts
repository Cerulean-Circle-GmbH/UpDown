/**
 * Server Lifecycle Management Tests (Black-Box)
 * Tests housekeeping, graceful shutdown, and dynamic server management
 * 
 * ✅ Web4 Compliant: Scenario-based test isolation, NO process.env
 * @pdca 2025-11-21-UTC-1500.scenario-based-test-pattern.md
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
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
 * Helper: Stop production primary server gracefully (if running)
 * Returns true if a primary was stopped, false otherwise
 */
async function stopProductionPrimary(): Promise<boolean> {
    const primaryPort = 42777;
    
    // Check if production primary is running
    if (!await checkServerHealth(primaryPort, 500)) {
        return false; // No primary running
    }
    
    try {
        console.log('🛑 Stopping production primary via /shutdown-all endpoint...');
        
        // Use the /shutdown-all endpoint (same as "End Gracefully" button)
        const response = await fetch(`http://localhost:${primaryPort}/shutdown-all`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            console.log('⚠️  Shutdown request returned:', response.status);
        }
        
        // Wait for it to actually stop (check health repeatedly)
        let stopped = false;
        for (let i = 0; i < 20; i++) {  // Increased to 10 seconds
            await sleep(0.5);
            if (!await checkServerHealth(primaryPort, 500)) {
                stopped = true;
                break;
            }
        }
        
        if (stopped) {
            console.log('✅ Production primary stopped successfully');
            return true;
        } else {
            console.log('⚠️  Production primary did not stop after 10s');
            return true; // Still consider it as "was running"
        }
    } catch (error: any) {
        console.log('⚠️  Could not stop production primary:', error.message);
        return false;
    }
}

/**
 * Helper: Restart production primary server
 */
async function restartProductionPrimary(wasRunning: boolean): Promise<void> {
    if (!wasRunning) {
        return; // Don't restart if it wasn't running before
    }
    
    try {
        console.log('🔄 Restarting production primary...');
        // Use spawn to start in background
        const { spawn } = await import('child_process');
        const componentRoot = path.resolve(__dirname, '..');
        
        spawn('./once', ['startServer', 'primary'], {
            cwd: componentRoot,
            detached: true,
            stdio: 'ignore'
        }).unref();
        
        // Wait for it to start
        await sleep(3);
        
        if (await checkServerHealth(42777, 1000)) {
            console.log('✅ Production primary restarted');
        } else {
            console.log('⚠️  Production primary may not have restarted properly');
        }
    } catch (error) {
        console.log('⚠️  Could not restart production primary:', error);
    }
}

/**
 * Helper: Get or discover scenario directory
 * Searches test/data/scenarios for where actual scenario files are created
 */
function getOrDiscoverScenarioDir(testDataDir: string, currentScenarioDir: string): string {
    // If already set and still valid, return it
    if (currentScenarioDir && fs.existsSync(currentScenarioDir)) {
        return currentScenarioDir;
    }
    
    // Otherwise, discover it by finding where scenario files are
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
    return findScenarioDir(scenariosBase) || '';
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
    let productionPrimaryWasRunning = false;
    
    beforeAll(async () => {
        // Stop production primary if running (for test isolation)
        productionPrimaryWasRunning = await stopProductionPrimary();
        
        if (productionPrimaryWasRunning) {
            console.log('🧪 Test isolation enabled: Production primary stopped');
        } else {
            console.log('🧪 No production primary detected');
        }
    }, 15000); // Longer timeout for stopping server
    
    afterAll(async () => {
        // Restart production primary if it was running before tests
        if (productionPrimaryWasRunning) {
            await restartProductionPrimary(true);
        }
    }, 10000); // Longer timeout for restarting
    
    beforeEach(async () => {
        // Setup: Use test/data directory (should be populated by baseline test)
        componentRoot = path.resolve(__dirname, '..');
        testDataDir = path.join(componentRoot, 'test/data');
        
        const scenariosBase = path.join(testDataDir, 'scenarios');
        
        // Clean scenarios from PREVIOUS test, but keep directory structure
        // This ensures each test starts fresh without affecting test/data components
        if (fs.existsSync(scenariosBase)) {
            // Only remove .scenario.json files, keep directories
            const removeScenarios = (dir: string) => {
                if (!fs.existsSync(dir)) return;
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        removeScenarios(fullPath); // Recurse
                    } else if (entry.name.endsWith('.scenario.json')) {
                        fs.unlinkSync(fullPath); // Clean old scenarios
                    }
                }
            };
            removeScenarios(scenariosBase);
        } else {
            fs.mkdirSync(scenariosBase, { recursive: true });
        }
        
        // scenarioDir persists across tests for discovery
        if (!scenarioDir) {
            scenarioDir = '';
        }
    });
    
    afterEach(async () => {
        // Only stop servers - scenarios remain for next test's beforeEach to clean
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
        
        // DON'T wipe test/data - just stopped servers, scenarios cleaned in next beforeEach
    });
    
    it('should delete shutdown server scenarios on primary startup', async () => {
        // ARRANGE: Start primary first to detect domain
        const testScenario = createTestScenario(testDataDir, componentRoot);
        primaryCLI = new ONCECLI();
        primaryCLI.init(testScenario);
        await primaryCLI.component.startServer();
        
        await waitForServer(42777, 5000);
        await sleep(1);
        
        // Discover scenario directory
        scenarioDir = getOrDiscoverScenarioDir(testDataDir, scenarioDir);
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
        // ARRANGE: Create a fake running client scenario file (simulate existing client)
        // First start any server to discover scenarioDir
        const tempScenario = createTestScenario(testDataDir, componentRoot);
        const tempCLI = new ONCECLI();
        tempCLI.init(tempScenario);
        await tempCLI.component.startServer();
        await waitForServer(42777, 5000);
        await sleep(1);
        
        scenarioDir = getOrDiscoverScenarioDir(testDataDir, scenarioDir);
        expect(scenarioDir).not.toBe('');
        
        await tempCLI.component.stopServer();
        await sleep(1);
        
        // Now create fake RUNNING client scenario
        const fakeClientUUID = uuidv4();
        const fakeClientScenario = {
            ior: { uuid: fakeClientUUID, component: 'ONCE', version: '0.3.21.2' },
            owner: 'test-owner',
            model: {
                state: { state: LifecycleState.RUNNING },
                metadata: { port: 8080, isPrimaryServer: false }
            }
        };
        fs.writeFileSync(
            path.join(scenarioDir, `${fakeClientUUID}.scenario.json`),
            JSON.stringify(fakeClientScenario, null, 2)
        );
        
        // Start a fake client server on 8080 to make health check pass
        const clientScenario = createTestScenario(testDataDir, componentRoot);
        const clientCLI = new ONCECLI();
        clientCLI.init(clientScenario);
        await clientCLI.component.startServer();
        clientCLIs.push(clientCLI);
        
        await waitForServer(8080, 5000);
        await sleep(2);
        
        // ACT: Start primary (should discover running client)
        const primaryScenario = createTestScenario(testDataDir, componentRoot);
        primaryCLI = new ONCECLI();
        primaryCLI.init(primaryScenario);
        await primaryCLI.component.startServer();
        
        await waitForServer(42777, 5000);
        await sleep(2); // Wait for discovery
        
        // ASSERT: Client scenario should still exist (not deleted)
        const clientScenarios = getScenarioFiles(scenarioDir).filter(f => {
            const port = readScenarioPort(f);
            return port === 8080;
        });
        expect(clientScenarios.length).toBeGreaterThanOrEqual(1);
        
        // ASSERT: Client should still be healthy
        const clientHealthy = await checkServerHealth(8080);
        expect(clientHealthy).toBe(true);
    }, 20000);
    
    it('should update scenario state to STOPPING then SHUTDOWN', async () => {
        // ARRANGE: Start server (will be primary since it's first)
        const testScenario = createTestScenario(testDataDir, componentRoot);
        const serverCLI = new ONCECLI();
        serverCLI.init(testScenario);
        await serverCLI.component.startServer();
        
        await waitForServer(42777, 5000); // First server becomes primary
        await sleep(2); // Wait for scenario file to be written
        
        // Discover scenario directory
        scenarioDir = getOrDiscoverScenarioDir(testDataDir, scenarioDir);
        
        // Get scenario file path
        const scenarioFiles = getScenarioFiles(scenarioDir).filter(f => {
            const port = readScenarioPort(f);
            return port === 42777; // Primary port
        });
        expect(scenarioFiles.length).toBe(1);
        const scenarioPath = scenarioFiles[0];
        
        // Verify initial state is RUNNING (primary server starts in RUNNING state)
        const initialState = readScenarioState(scenarioPath);
        expect([LifecycleState.RUNNING, LifecycleState.PRIMARY_SERVER].includes(initialState!)).toBe(true);
        
        // ACT: Graceful shutdown
        await serverCLI.component.stopServer();
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
        
        // Discover scenario directory
        scenarioDir = getOrDiscoverScenarioDir(testDataDir, scenarioDir);
        
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
        
        // Discover scenario directory
        scenarioDir = getOrDiscoverScenarioDir(testDataDir, scenarioDir);
        
        // Get client scenario path
        const clientScenarios = getScenarioFiles(scenarioDir).filter(f => {
            const port = readScenarioPort(f);
            return port === 8080;
        });
        expect(clientScenarios.length).toBe(1);
        const clientScenarioPath = clientScenarios[0];
        
        // ACT: Gracefully stop client
        await clientCLI.component.stopServer();
        await sleep(3); // Wait for scenario update and cleanup
        
        // Re-read scenario to ensure we get latest state
        const updatedScenarios = getScenarioFiles(scenarioDir).filter(f => {
            const port = readScenarioPort(f);
            return port === 8080;
        });
        
        // ASSERT: Client scenario should be marked as SHUTDOWN (or deleted by housekeeping)
        if (updatedScenarios.length > 0) {
            const state = readScenarioState(updatedScenarios[0]);
            expect(state).toBe(LifecycleState.SHUTDOWN);
        }
        // If scenario was deleted by housekeeping, that's also acceptable
        
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
        
        // Discover scenario directory
        scenarioDir = getOrDiscoverScenarioDir(testDataDir, scenarioDir);
        
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
        
        // ACT: Start new server (will be primary on 42777, same as first)
        const newScenario = createTestScenario(testDataDir, componentRoot);
        clientCLI = new ONCECLI();
        clientCLI.init(newScenario);
        await clientCLI.component.startServer();
        clientCLIs.push(clientCLI);
        
        await waitForServer(42777, 5000); // Primary port
        await sleep(2); // Wait for housekeeping to clean old scenario
        
        // ASSERT: Old shutdown scenario should be deleted by housekeeping
        expect(fs.existsSync(firstScenarioPath)).toBe(false);
        
        // ASSERT: New scenario should exist with different UUID
        const secondScenarios = getScenarioFiles(scenarioDir);
        expect(secondScenarios.length).toBe(1); // Only new (old cleaned by housekeeping)
        
        const newUUID = path.basename(secondScenarios[0], '.scenario.json');
        expect(newUUID).not.toBe(firstUUID); // Different UUID
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
        
        // Discover scenario directory
        scenarioDir = getOrDiscoverScenarioDir(testDataDir, scenarioDir);
        
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
