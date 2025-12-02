#!/usr/bin/env node
/**
 * Scenario Migration Script
 * Converts functional factories to external scenario files
 * 
 * Radical OOP: Scenarios are THINGS (files), not functions!
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test files that still have functional factories
const testsToMigrate = [
  { num: '02', name: 'component-descriptor', factory: 'createTest12Scenario' },
  { num: '03', name: 'environment-detection', factory: 'createTest11Scenario' },
  { num: '04', name: 'cli-availability', factory: 'createTest13Scenario' },
  { num: '05', name: 'server-start', factory: 'createTest01Scenario' },
  // Add more as needed
];

async function migrateTest(testNum, scenarioName, factoryName) {
  const testFile = path.join(__dirname, `Test${testNum}_*.ts`);
  const scenarioFile = path.join(__dirname, 'scenarios', `test-${testNum}-${scenarioName}.scenario.json`);
  
  console.log(`\\n📝 Migrating Test${testNum}...`);
  
  // Read test file
  const testFiles = fs.readdirSync(__dirname).filter(f => f.startsWith(`Test${testNum}_`) && f.endsWith('.ts'));
  if (testFiles.length === 0) {
    console.log(`  ⚠️  No test file found for Test${testNum}`);
    return;
  }
  
  const testFilePath = path.join(__dirname, testFiles[0]);
  let content = fs.readFileSync(testFilePath, 'utf-8');
  
  // Extract factory function
  const factoryRegex = new RegExp(`export function ${factoryName}\\(\\)[^{]*{([^}]+return\\s*{[\\s\\S]+?};\\s*})`, 'm');
  const match = content.match(factoryRegex);
  
  if (!match) {
    console.log(`  ⚠️  Factory ${factoryName} not found`);
    return;
  }
  
  console.log(`  ✅ Found factory: ${factoryName}`);
  console.log(`  ✅ Would create: ${scenarioFile}`);
  console.log(`  ✅ Would update: ${testFiles[0]}`);
}

// Run migrations
console.log('🚀 Scenario Migration Script');
console.log('============================\\n');

for (const test of testsToMigrate) {
  await migrateTest(test.num, test.name, test.factory);
}

console.log('\\n✅ Migration analysis complete!');
console.log('\\nNote: This is a DRY RUN. Actual migration needs manual review.');

