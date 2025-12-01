/**
 * CLI Path Authority Test
 * Verifies that paths are calculated correctly in test vs production
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import * as path from 'path';

describe('CLI Path Authority', () => {
    it('should compare once info from test vs production call', async () => {
        console.log('\n🔍 TEST CONTEXT:');
        console.log(`   CWD: ${process.cwd()}`);
        console.log(`   __dirname: ${__dirname}`);
        console.log(`   __filename: ${__filename}`);
        
        // Method 1: Import CLI directly (like tests do)
        const { DefaultCLI } = await import('../dist/ts/layer2/DefaultCLI.js');
        const cli = new DefaultCLI();
        cli.init();
        
        console.log('\n📦 METHOD 1: Direct CLI import (test pattern):');
        console.log(`   projectRoot: ${cli.model.projectRoot}`);
        console.log(`   componentRoot: ${cli.model.componentRoot}`);
        console.log(`   version: ${cli.model.version}`);
        
        // Method 2: Call 'once info' as production does
        try {
            const componentRoot = path.resolve(__dirname, '..');
            const infoOutput = execSync('cd ' + componentRoot + ' && ./once info', {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            console.log('\n📦 METHOD 2: Production CLI call (once info):');
            console.log(infoOutput);
            
            // Parse the output to extract paths
            const projectRootMatch = infoOutput.match(/Project Root:\s*(.+)/);
            const componentRootMatch = infoOutput.match(/Component Root:\s*(.+)/);
            const versionMatch = infoOutput.match(/Version:\s*(.+)/);
            
            const productionProjectRoot = projectRootMatch?.[1]?.trim();
            const productionComponentRoot = componentRootMatch?.[1]?.trim();
            const productionVersion = versionMatch?.[1]?.trim();
            
            console.log('\n🔍 COMPARISON:');
            console.log(`   Test projectRoot:       ${cli.model.projectRoot}`);
            console.log(`   Production projectRoot: ${productionProjectRoot}`);
            console.log(`   Match: ${cli.model.projectRoot === productionProjectRoot ? '✅' : '❌'}`);
            
            console.log(`\n   Test componentRoot:       ${cli.model.componentRoot}`);
            console.log(`   Production componentRoot: ${productionComponentRoot}`);
            console.log(`   Match: ${cli.model.componentRoot === productionComponentRoot ? '✅' : '❌'}`);
            
            console.log(`\n   Test version:       ${cli.model.version || 'undefined'}`);
            console.log(`   Production version: ${productionVersion}`);
            console.log(`   Match: ${cli.model.version === productionVersion ? '✅' : '❌'}`);
            
            // Assertions
            expect(cli.model.projectRoot).toBe(productionProjectRoot);
            expect(cli.model.componentRoot).toBe(productionComponentRoot);
            
        } catch (error: any) {
            console.error('\n❌ Failed to run "once info":', error.message);
            console.error('   This suggests the CLI wrapper is not available in test context');
            throw error;
        }
    }, 30000);
    
    it('should use correct projectRoot for scenario paths', async () => {
        const { DefaultCLI } = await import('../dist/ts/layer2/DefaultCLI.js');
        const cli = new DefaultCLI();
        cli.init();
        
        // Expected scenario path structure
        const expectedScenariosDir = path.join(cli.model.projectRoot, 'scenarios');
        
        console.log('\n📂 SCENARIO PATHS:');
        console.log(`   projectRoot: ${cli.model.projectRoot}`);
        console.log(`   scenariosDir: ${expectedScenariosDir}`);
        
        // Verify the path doesn't contain /test/data (unless explicitly in test isolation)
        const isTestIsolation = cli.model.projectRoot.includes('/test/data');
        console.log(`   Test isolation: ${isTestIsolation ? '✅ Yes' : '❌ No'}`);
        
        // In production, scenarios should be at repo root
        expect(cli.model.projectRoot).toContain('UpDown');
        expect(cli.model.projectRoot).not.toContain('/components/ONCE/');
    });
});

