#!/usr/bin/env npx tsx
/**
 * AST-based DefaultUnit Insourcing Script
 * 
 * Migrates DefaultUnit.ts from Unit/0.3.0.5 to ONCE/0.3.22.1
 * with Web4 principle compliance fixes.
 * 
 * Web4 Principles Applied:
 * - P4a: No arrow functions → for-of loops or private methods
 * - P6: Empty constructor + init pattern
 * - P29: IDProvider pattern → this.uuidCreate() NOT crypto.randomUUID()
 * 
 * @pdca 2025-12-21-UTC-2100.defaultunit-inline-migration.pdca.md
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

const SOURCE_FILE = '/Users/Shared/Workspaces/2cuGitHub/UpDown/components/Unit/0.3.0.5/src/ts/layer2/DefaultUnit.ts';
const TARGET_FILE = '/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/src/ts/layer2/DefaultUnit.ts';
const UNITMODEL_SOURCE = '/Users/Shared/Workspaces/2cuGitHub/UpDown/components/Unit/0.3.0.5/src/ts/layer3/UnitModel.interface.ts';
const UNITMODEL_TARGET = '/Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.22.1/src/ts/layer3/UnitModel.interface.ts';

interface MethodInfo {
  name: string;
  startLine: number;
  endLine: number;
  isAsync: boolean;
  isPrivate: boolean;
  hasArrowFunctions: boolean;
  violations: string[];
}

/**
 * Analyze source file for methods and Web4 violations
 */
function analyzeSourceFile(filePath: string): MethodInfo[] {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );
  
  const methods: MethodInfo[] = [];
  
  function visit(node: ts.Node): void {
    if (ts.isMethodDeclaration(node) && node.name) {
      const methodName = node.name.getText(sourceFile);
      const startLine = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      const endLine = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
      const isAsync = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false;
      const isPrivate = node.modifiers?.some(m => m.kind === ts.SyntaxKind.PrivateKeyword) || false;
      
      // Check for Web4 violations within the method
      const violations: string[] = [];
      let hasArrowFunctions = false;
      
      function checkViolations(child: ts.Node): void {
        // P4a: Arrow functions
        if (ts.isArrowFunction(child)) {
          hasArrowFunctions = true;
          const line = sourceFile.getLineAndCharacterOfPosition(child.getStart()).line + 1;
          violations.push(`P4a: Arrow function at line ${line}`);
        }
        
        // P29: crypto.randomUUID()
        if (ts.isCallExpression(child)) {
          const callText = child.getText(sourceFile);
          if (callText.includes('crypto.randomUUID()')) {
            const line = sourceFile.getLineAndCharacterOfPosition(child.getStart()).line + 1;
            violations.push(`P29: crypto.randomUUID() at line ${line}`);
          }
        }
        
        // P4a: Standalone function declarations
        if (ts.isFunctionDeclaration(child) || ts.isFunctionExpression(child)) {
          const line = sourceFile.getLineAndCharacterOfPosition(child.getStart()).line + 1;
          violations.push(`P4a: Standalone function at line ${line}`);
        }
        
        ts.forEachChild(child, checkViolations);
      }
      
      ts.forEachChild(node, checkViolations);
      
      methods.push({
        name: methodName,
        startLine,
        endLine,
        isAsync,
        isPrivate,
        hasArrowFunctions,
        violations
      });
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return methods;
}

/**
 * Extract method text from source file
 */
function extractMethod(filePath: string, methodName: string): string | null {
  const methods = analyzeSourceFile(filePath);
  const method = methods.find(m => m.name === methodName);
  
  if (!method) {
    console.error(`Method ${methodName} not found`);
    return null;
  }
  
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  return lines.slice(method.startLine - 1, method.endLine).join('\n');
}

/**
 * Apply Web4 fixes to extracted method code
 */
function applyWeb4Fixes(code: string): string {
  let fixed = code;
  
  // P29: Replace crypto.randomUUID() with this.uuidCreate()
  fixed = fixed.replace(/crypto\.randomUUID\(\)/g, 'this.uuidCreate()');
  
  // P4a: Replace simple .forEach with for-of (basic cases)
  // Note: Complex cases need manual review
  fixed = fixed.replace(
    /\.forEach\(\((\w+)\)\s*=>\s*\{/g,
    (match, varName) => {
      console.warn(`⚠️  Manual review needed: .forEach at "${match.substring(0, 30)}..."`);
      return match; // Keep original, flag for manual review
    }
  );
  
  return fixed;
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('🔍 AST-based DefaultUnit Insourcing');
  console.log('====================================\n');
  
  // Step 1: Analyze source file
  console.log('📊 Step 1: Analyzing Unit/0.3.0.5 DefaultUnit.ts...');
  const methods = analyzeSourceFile(SOURCE_FILE);
  
  console.log(`   Found ${methods.length} methods\n`);
  
  // Step 2: Report violations
  console.log('⚠️  Step 2: Web4 Violations Found:');
  let totalViolations = 0;
  
  for (const method of methods) {
    if (method.violations.length > 0) {
      console.log(`\n   ${method.name}() [lines ${method.startLine}-${method.endLine}]:`);
      for (const violation of method.violations) {
        console.log(`     - ${violation}`);
        totalViolations++;
      }
    }
  }
  
  console.log(`\n   Total violations: ${totalViolations}\n`);
  
  // Step 3: List NOW priority methods
  const nowMethods = [
    'extractOriginName', 'validateModel', 'toScenario', 'saveAndLink',
    'extractUuidFromPath', 'calculateRelativePath', 'link', 'linkInto',
    'from', 'createFromWordInFile', 'createFromCompleteFile', 'generateSimpleIOR',
    'findProjectRoot', 'resolveLinkPath', 'isUUID', 'convertNameToFilename',
    'createFromFolder'
  ];
  
  console.log('📋 Step 3: NOW Priority Methods for UD.4:');
  for (const methodName of nowMethods) {
    const method = methods.find(m => m.name === methodName);
    if (method) {
      const status = method.violations.length > 0 ? '⚠️ ' : '✅';
      console.log(`   ${status} ${methodName}() [${method.startLine}-${method.endLine}] ${method.violations.length > 0 ? `(${method.violations.length} violations)` : ''}`);
    } else {
      console.log(`   ❌ ${methodName}() NOT FOUND`);
    }
  }
  
  // Step 4: Generate sed commands for extraction
  console.log('\n📝 Step 4: sed commands for NOW methods:');
  console.log('   (Copy these to extract methods)\n');
  
  for (const methodName of nowMethods) {
    const method = methods.find(m => m.name === methodName);
    if (method) {
      console.log(`# ${methodName}()`);
      console.log(`sed -n '${method.startLine},${method.endLine}p' "${SOURCE_FILE}"`);
      console.log('');
    }
  }
}

main().catch(console.error);

