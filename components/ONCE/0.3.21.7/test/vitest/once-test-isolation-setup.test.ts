/**
 * ONCE Test Isolation Setup Test
 * 
 * Tests that ONCE can be properly set up in test/data for test isolation.
 * Copies both Web4TSComponent AND ONCE into test/data so the test shell can find 'once' command.
 * 
 * @pdca 2025-11-21-UTC-1600.version-discovery-symlink-resolution.pdca.md
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { readFile, rm, mkdir, symlink } from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

describe('🧪 ONCE Test Isolation Setup', () => {
  const currentFileUrl = new URL(import.meta.url);
  const currentDir = path.dirname(fileURLToPath(currentFileUrl));
  const componentRoot = path.join(currentDir, '../..');
  const testDataDir = path.join(componentRoot, 'test/data');
  
  // Extract version from componentRoot path: .../ONCE/0.3.21.2
  const versionMatch = componentRoot.match(/(\d+\.\d+\.\d+\.\d+)$/);
  const testVersion = versionMatch ? versionMatch[1] : '0.0.0.0';
  
  const projectRoot = path.dirname(path.dirname(path.dirname(componentRoot)));

  /**
   * Evidence-Based Testing Pattern:
   * - beforeAll: Setup Web4TSComponent AND ONCE in test/data
   * - Tests run: Verify components are accessible
   * - afterAll: DO NOTHING (keep evidence for inspection)
   */
  beforeAll(async () => {
    console.log(`   🧹 Setting up test isolation for ONCE ${testVersion}...`);
    
    // Clean old test data
    if (existsSync(testDataDir)) {
      await rm(testDataDir, { recursive: true, force: true });
      console.log(`   🧹 Cleaned old test/data`);
    }
    
    // ✅ SYSTEMATIC: Use initProject to setup test/data (DRY principle)
    const web4tsSourceDir = path.join(projectRoot, 'components/Web4TSComponent/latest');
    const componentPath = path.join(web4tsSourceDir, 'dist/ts/layer2/DefaultWeb4TSComponent.js');
    const { DefaultWeb4TSComponent } = await import(componentPath);
    const component = new DefaultWeb4TSComponent().init({ 
      model: {
        projectRoot: componentRoot,
        targetDirectory: testDataDir
      }
    });
    await component.initProject(testDataDir);
    console.log(`   ✅ Test isolation environment initialized via initProject`);
    
    // ✅ CRITICAL: Copy Web4TSComponent into test/data for delegation
    const web4tsTestDataDir = path.join(testDataDir, 'components/Web4TSComponent');
    const web4tsTestVersionDir = path.join(web4tsTestDataDir, testVersion);
    
    await mkdir(web4tsTestDataDir, { recursive: true });
    execSync(`rsync -a --exclude='test/data' "${web4tsSourceDir}/" "${web4tsTestVersionDir}/"`, {
      stdio: 'pipe'
    });
    console.log(`   📦 Copied Web4TSComponent ${testVersion} to test/data`);
    
    // Create Web4TSComponent symlinks
    const symlinkTargets = ['latest', 'dev', 'test'];
    for (const linkName of symlinkTargets) {
      const linkPath = path.join(web4tsTestDataDir, linkName);
      if (existsSync(linkPath)) {
        await rm(linkPath, { force: true });
      }
      await symlink(testVersion, linkPath, 'dir');
      console.log(`   🔗 Created symlink: Web4TSComponent/${linkName} → ${testVersion}`);
    }
    
    // ✅ CRITICAL: Copy ONCE into test/data so 'once' command is available
    const onceSourceDir = componentRoot;
    const onceTestDataDir = path.join(testDataDir, 'components/ONCE');
    const onceTestVersionDir = path.join(onceTestDataDir, testVersion);
    
    await mkdir(onceTestDataDir, { recursive: true });
    execSync(`rsync -a --exclude='test/data' "${onceSourceDir}/" "${onceTestVersionDir}/"`, {
      stdio: 'pipe'
    });
    console.log(`   📦 Copied ONCE ${testVersion} to test/data`);
    
    // Create ONCE symlinks
    for (const linkName of symlinkTargets) {
      const linkPath = path.join(onceTestDataDir, linkName);
      if (existsSync(linkPath)) {
        await rm(linkPath, { force: true });
      }
      await symlink(testVersion, linkPath, 'dir');
      console.log(`   🔗 Created symlink: ONCE/${linkName} → ${testVersion}`);
    }
    
    // ✅ CRITICAL: Create CLI symlinks in test/data/scripts
    const scriptsDir = path.join(testDataDir, 'scripts');
    
    const web4tsComponentCLILink = path.join(scriptsDir, 'web4tscomponent');
    if (existsSync(web4tsComponentCLILink)) {
      await rm(web4tsComponentCLILink, { force: true });
    }
    await symlink('../components/Web4TSComponent/latest/web4tscomponent', web4tsComponentCLILink);
    console.log(`   🔗 Created CLI symlink: scripts/web4tscomponent → Web4TSComponent/latest/web4tscomponent`);
    
    const onceCLILink = path.join(scriptsDir, 'once');
    if (existsSync(onceCLILink)) {
      await rm(onceCLILink, { force: true });
    }
    await symlink('../components/ONCE/latest/once', onceCLILink);
    console.log(`   🔗 Created CLI symlink: scripts/once → ONCE/latest/once`);
  });

  it('should have Web4TSComponent in test/data', () => {
    const web4tsPath = path.join(testDataDir, 'components/Web4TSComponent', testVersion);
    expect(existsSync(web4tsPath)).toBe(true);
    expect(existsSync(path.join(web4tsPath, 'web4tscomponent'))).toBe(true);
    console.log(`   ✅ Web4TSComponent available in test/data`);
  });

  it('should have ONCE in test/data', () => {
    const oncePath = path.join(testDataDir, 'components/ONCE', testVersion);
    expect(existsSync(oncePath)).toBe(true);
    expect(existsSync(path.join(oncePath, 'once'))).toBe(true);
    console.log(`   ✅ ONCE available in test/data`);
  });

  it('should have web4tscomponent CLI symlink in scripts/', () => {
    const cliLink = path.join(testDataDir, 'scripts/web4tscomponent');
    expect(existsSync(cliLink)).toBe(true);
    console.log(`   ✅ web4tscomponent CLI accessible via scripts/`);
  });

  it('should have once CLI symlink in scripts/', () => {
    const cliLink = path.join(testDataDir, 'scripts/once');
    expect(existsSync(cliLink)).toBe(true);
    console.log(`   ✅ once CLI accessible via scripts/`);
  });

  it('should have component symlinks (latest, dev, test)', () => {
    const web4tsLatest = path.join(testDataDir, 'components/Web4TSComponent/latest');
    const onceLatest = path.join(testDataDir, 'components/ONCE/latest');
    
    expect(existsSync(web4tsLatest)).toBe(true);
    expect(existsSync(onceLatest)).toBe(true);
    
    console.log(`   ✅ Component symlinks created`);
  });

  it('should populate test/data when running baseline test', async () => {
    // This test verifies that the test setup creates a proper test environment
    // that can be used by 'once test shell'
    
    const componentsDir = path.join(testDataDir, 'components');
    expect(existsSync(componentsDir)).toBe(true);
    
    const scriptsDir = path.join(testDataDir, 'scripts');
    expect(existsSync(scriptsDir)).toBe(true);
    
    console.log(`   ✅ Test/data structure ready for test shell`);
  });
});

