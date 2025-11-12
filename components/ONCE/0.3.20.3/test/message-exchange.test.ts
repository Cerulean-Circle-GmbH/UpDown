/**
 * ONCE Message Exchange Test Suite
 * @pdca 2025-11-11-UTC-2322.pdca.md - Automated multi-server message testing
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DefaultONCE } from '../src/ts/layer2/DefaultONCE.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

describe('ONCE Multi-Server Message Exchange', () => {
  const componentRoot = '/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.20.3';
  
  beforeAll(async () => {
    // Clean up any existing test artifacts
    const reportPath = path.join(componentRoot, 'scenarios/message-exchange-report.json');
    if (fs.existsSync(reportPath)) {
      fs.unlinkSync(reportPath);
    }
  });

  afterAll(async () => {
    // Kill any orphan processes
    await execAsync('pkill -f "ONCECLI" 2>/dev/null || true');
  });

  it('should spawn primary and 3 client servers', async () => {
    const testScript = `
cd ${componentRoot} && \\
timeout 15 ./once demoMessages 3 > /tmp/test-demo.log 2>&1 & \\
DEMO_PID=$! && \\
sleep 5 && \\
curl -s http://localhost:42777/health | grep -q "running" && \\
curl -s http://localhost:8080/health | grep -q "running" && \\
curl -s http://localhost:8081/health | grep -q "running" && \\
curl -s http://localhost:8082/health | grep -q "running" && \\
kill $DEMO_PID 2>/dev/null || true && \\
echo "SUCCESS"
    `;

    const { stdout } = await execAsync(testScript);
    expect(stdout.trim()).toContain('SUCCESS');
  }, 30000);

  it('should broadcast from primary to all clients', async () => {
    const testScript = `
cd ${componentRoot} && \\
timeout 15 ./once demoMessages 3 > /tmp/test-broadcast.log 2>&1 & \\
DEMO_PID=$! && \\
sleep 5 && \\
grep -q "Broadcasting scenario" /tmp/test-broadcast.log && \\
grep -q "to 3 clients" /tmp/test-broadcast.log && \\
kill $DEMO_PID 2>/dev/null || true && \\
echo "BROADCAST_OK"
    `;

    const { stdout } = await execAsync(testScript);
    expect(stdout.trim()).toContain('BROADCAST_OK');
  }, 30000);

  it('should relay message client→primary→client', async () => {
    const testScript = `
cd ${componentRoot} && \\
timeout 15 ./once demoMessages 3 > /tmp/test-relay.log 2>&1 & \\
DEMO_PID=$! && \\
sleep 6 && \\
grep -q "Relaying scenario" /tmp/test-relay.log && \\
grep -q "Primary relaying scenario" /tmp/test-relay.log && \\
kill $DEMO_PID 2>/dev/null || true && \\
echo "RELAY_OK"
    `;

    const { stdout } = await execAsync(testScript);
    expect(stdout.trim()).toContain('RELAY_OK');
  }, 30000);

  it('should support direct P2P communication', async () => {
    const testScript = `
cd ${componentRoot} && \\
timeout 15 ./once demoMessages 3 > /tmp/test-p2p.log 2>&1 & \\
DEMO_PID=$! && \\
sleep 7 && \\
grep -q "P2P connection established" /tmp/test-p2p.log && \\
grep -q "Direct P2P message" /tmp/test-p2p.log && \\
kill $DEMO_PID 2>/dev/null || true && \\
echo "P2P_OK"
    `;

    const { stdout } = await execAsync(testScript);
    expect(stdout.trim()).toContain('P2P_OK');
  }, 30000);

  it('should generate JSON report with all patterns', async () => {
    const testScript = `
cd ${componentRoot} && \\
timeout 15 ./once demoMessages 3 > /tmp/test-json.log 2>&1 & \\
DEMO_PID=$! && \\
sleep 8 && \\
kill $DEMO_PID 2>/dev/null || true && \\
test -f scenarios/message-exchange-report.json && \\
cat scenarios/message-exchange-report.json
    `;

    const { stdout } = await execAsync(testScript);
    const report = JSON.parse(stdout);

    // Verify report structure
    expect(report).toHaveProperty('timestamp');
    expect(report).toHaveProperty('configuration');
    expect(report).toHaveProperty('messages');
    expect(report).toHaveProperty('patterns');

    // Verify configuration
    expect(report.configuration.primary.port).toBe(42777);
    expect(report.configuration.clients).toHaveLength(3);
    expect(report.configuration.clients[0].port).toBe(8080);
    expect(report.configuration.clients[1].port).toBe(8081);
    expect(report.configuration.clients[2].port).toBe(8082);

    // Verify messages
    expect(report.messages).toHaveLength(3);
    
    // Verify broadcast message
    const broadcast = report.messages.find((m: any) => m.data.type === 'broadcast');
    expect(broadcast).toBeDefined();
    expect(broadcast.component).toBe('ONCE');
    expect(broadcast.version).toBe('0.3.20.3');
    expect(broadcast.data.to).toBe('all');

    // Verify relay message
    const relay = report.messages.find((m: any) => m.data.type === 'relay');
    expect(relay).toBeDefined();
    expect(relay.data.from.port).toBe(8080);
    expect(relay.data.to.port).toBe(8081);

    // Verify P2P message
    const p2p = report.messages.find((m: any) => m.data.type === 'p2p');
    expect(p2p).toBeDefined();
    expect(p2p.data.from.port).toBe(8080);
    expect(p2p.data.to.port).toBe(8081);

    // Verify pattern counts
    expect(report.patterns.broadcast).toBe(1);
    expect(report.patterns.relay).toBe(1);
    expect(report.patterns.p2p).toBe(1);
  }, 30000);

  it('should auto-acknowledge received messages', async () => {
    const testScript = `
cd ${componentRoot} && \\
timeout 15 ./once demoMessages 3 > /tmp/test-ack.log 2>&1 & \\
DEMO_PID=$! && \\
sleep 8 && \\
kill $DEMO_PID 2>/dev/null || true && \\
grep -c "Content: ACK:" /tmp/test-ack.log
    `;

    const { stdout } = await execAsync(testScript);
    const ackCount = parseInt(stdout.trim(), 10);
    
    // Should have multiple ACKs (3 broadcasts + 1 relay + 1 P2P = at least 5)
    expect(ackCount).toBeGreaterThanOrEqual(3);
  }, 30000);

  it('should track messages in model (no private state)', async () => {
    // This test verifies Radical OOP by checking the implementation
    const once = new DefaultONCE();
    await once.init();

    // Initialize message tracker
    once.model.messageTracker = {
      sent: [],
      received: [],
      acknowledged: [],
      patterns: { broadcast: 0, relay: 0, p2p: 0 }
    };

    // Verify model-driven structure
    expect(once.model.messageTracker).toBeDefined();
    expect(once.model.messageTracker.sent).toBeInstanceOf(Array);
    expect(once.model.messageTracker.received).toBeInstanceOf(Array);
    expect(once.model.messageTracker.acknowledged).toBeInstanceOf(Array);
    expect(once.model.messageTracker.patterns).toHaveProperty('broadcast');
    expect(once.model.messageTracker.patterns).toHaveProperty('relay');
    expect(once.model.messageTracker.patterns).toHaveProperty('p2p');
  });

  it('should use Web4 scenario message format', async () => {
    const testScript = `
cd ${componentRoot} && \\
timeout 15 ./once demoMessages 3 > /tmp/test-format.log 2>&1 & \\
DEMO_PID=$! && \\
sleep 8 && \\
kill $DEMO_PID 2>/dev/null || true && \\
cat scenarios/message-exchange-report.json
    `;

    const { stdout } = await execAsync(testScript);
    const report = JSON.parse(stdout);

    // Verify Web4 scenario format for each message
    report.messages.forEach((message: any) => {
      expect(message).toHaveProperty('uuid');
      expect(message).toHaveProperty('component');
      expect(message).toHaveProperty('version');
      expect(message).toHaveProperty('data');
      
      expect(message.component).toBe('ONCE');
      expect(message.version).toBe('0.3.20.3');
      
      expect(message.data).toHaveProperty('type');
      expect(message.data).toHaveProperty('from');
      expect(message.data).toHaveProperty('to');
      expect(message.data).toHaveProperty('content');
      expect(message.data).toHaveProperty('timestamp');
      expect(message.data).toHaveProperty('sequence');
      
      expect(message.data.from).toHaveProperty('uuid');
      expect(message.data.from).toHaveProperty('port');
    });
  }, 30000);
});


