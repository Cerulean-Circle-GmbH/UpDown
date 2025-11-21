import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DefaultONCE } from '../src/ts/layer2/DefaultONCE.js';

const execAsync = promisify(exec);

// Dynamically get component version
const componentVersion = '0.3.21.2';

describe('HTML Template Rendering', () => {
    it('should render server-status.html with model values (not template placeholders)', async () => {
        // Start server in background, fetch HTML, check content, kill server
        const testScript = `
cd /Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/${componentVersion} && \
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
    }, 15000);

    it('should render once-client.html without placeholders', async () => {
        const testScript = `
cd /Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/${componentVersion} && \
./once testInput s > /dev/null 2>&1 & \
ONCE_PID=$! && \
sleep 3 && \
HTML=$(curl -s http://localhost:8080/once) && \
kill $ONCE_PID 2>/dev/null && \
echo "$HTML"
        `;
        
        const { stdout} = await execAsync(testScript);
        const html = stdout;
        
        // Check that HTML is rendered and contains browser client content
        expect(html).toContain('ONCE Browser Client');
        expect(html).toContain('Interactive Demo');
    }, 15000);
});

