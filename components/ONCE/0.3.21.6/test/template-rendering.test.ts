import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { NodeJsOnce } from '../src/ts/layer2/NodeJsOnce.js';
import { fileURLToPath } from 'url';
import * as path from 'path';

const execAsync = promisify(exec);

// ✅ Dynamically discover component root from test file location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const componentRoot = path.resolve(__dirname, '..');

describe('HTML Template Rendering', () => {
    it('should render server-status.html with model values (not template placeholders)', async () => {
        // Start server in background, fetch HTML, check content, kill server
        const testScript = `
cd ${componentRoot} && \
./once testInput s > /dev/null 2>&1 & \
ONCE_PID=$! && \
sleep 3 && \
HTML=$(curl -s http://localhost:8080/) && \
kill $ONCE_PID 2>/dev/null && \
echo "$HTML"
        `;
        
        const { stdout } = await execAsync(testScript);
        const html = stdout;
        
        // FAIL if template placeholders are still present (means templates not rendered)
        expect(html).not.toContain('${this.');
        expect(html).not.toContain('${this.serverModel');
        expect(html).not.toContain('${this.httpPort}');
        
        // PASS if actual content is rendered
        expect(html).toContain('ONCE Server');
        expect(html).toContain('Server Status: Running');
        expect(html).toMatch(/[0-9a-f-]{36}/); // UUID pattern
        // Check for domain (could be local.once, fritz.box, etc.)
        expect(html).toMatch(/(local\.once|fritz\.box|localhost)/);
    }, 30000); // Increased timeout to 30s

    it('should render once-client.html without placeholders', async () => {
        const testScript = `
cd ${componentRoot} && \
./once testInput s > /dev/null 2>&1 & \
ONCE_PID=$! && \
sleep 3 && \
HTML=$(curl -s http://localhost:8080/once) && \
kill $ONCE_PID 2>/dev/null && \
echo "$HTML"
        `;
        
        const { stdout} = await execAsync(testScript);
        const html = stdout;
        
        // Check that HTML is rendered and contains ONCE Kernel content (new minimal page)
        expect(html).toContain('ONCE Kernel');
        expect(html).toContain('Initializing');
        expect(html).toContain('ONCE.start');
    }, 15000);
});

