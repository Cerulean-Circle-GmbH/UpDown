#!/usr/bin/env npx ts-node
/**
 * AST-based Migration Analyzer for DefaultWeb4TSComponent
 * Uses TypeScript compiler API to extract methods and dependencies
 * 
 * @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

interface MethodInfo {
  name: string;
  startLine: number;
  endLine: number;
  isPublic: boolean;
  isPrivate: boolean;
  isProtected: boolean;
  isAsync: boolean;
  dependencies: string[];  // Other methods this method calls
  parameters: string[];
  returnType: string;
  jsdoc: string;
}

const SRC_FILE = '/Users/Shared/Workspaces/2cuGitHub/UpDown/components/Web4TSComponent/latest/src/ts/layer2/DefaultWeb4TSComponent.ts';
const NOW_METHODS = [
  'start', 'componentDescriptorUpdate', 'componentDescriptorRead', 'componentStart',
  'set', 'get', 'from', 'find', 'upgrade', 'tootsie', 'testCompletion', 'testShell',
  'releaseTest', 'completion', 'removeVersion', 'removeComponent', 'compare',
  'info', 'setCICDVersion', 'targetVersionParameterCompletion', 'getContext'
];

function analyze() {
  const sourceCode = fs.readFileSync(SRC_FILE, 'utf-8');
  const sourceFile = ts.createSourceFile(
    'DefaultWeb4TSComponent.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const methods: Map<string, MethodInfo> = new Map();
  const lines = sourceCode.split('\n');

  function getLineNumber(pos: number): number {
    return sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
  }

  function extractDependencies(node: ts.Node): string[] {
    const deps: string[] = [];
    
    function visit(n: ts.Node) {
      // Look for this.methodName() calls
      if (ts.isCallExpression(n)) {
        const expr = n.expression;
        if (ts.isPropertyAccessExpression(expr)) {
          if (expr.expression.kind === ts.SyntaxKind.ThisKeyword) {
            deps.push(expr.name.text);
          }
        }
      }
      ts.forEachChild(n, visit);
    }
    
    visit(node);
    return [...new Set(deps)]; // Deduplicate
  }

  function getJSDoc(node: ts.Node): string {
    const jsDocNodes = (node as any).jsDoc;
    if (jsDocNodes && jsDocNodes.length > 0) {
      return jsDocNodes.map((jd: ts.JSDoc) => jd.getText(sourceFile)).join('\n');
    }
    return '';
  }

  function visitNode(node: ts.Node) {
    if (ts.isMethodDeclaration(node) && node.name) {
      const name = node.name.getText(sourceFile);
      const modifiers = ts.getModifiers(node) || [];
      
      const isPublic = !modifiers.some(m => 
        m.kind === ts.SyntaxKind.PrivateKeyword || 
        m.kind === ts.SyntaxKind.ProtectedKeyword
      );
      const isPrivate = modifiers.some(m => m.kind === ts.SyntaxKind.PrivateKeyword);
      const isProtected = modifiers.some(m => m.kind === ts.SyntaxKind.ProtectedKeyword);
      const isAsync = modifiers.some(m => m.kind === ts.SyntaxKind.AsyncKeyword);
      
      const params = node.parameters.map(p => p.getText(sourceFile));
      const returnType = node.type ? node.type.getText(sourceFile) : 'void';
      
      const startLine = getLineNumber(node.getStart(sourceFile));
      const endLine = getLineNumber(node.getEnd());
      
      // Get JSDoc - look at the full start which includes leading trivia
      const fullStart = node.getFullStart();
      const fullStartLine = getLineNumber(fullStart);
      
      const methodInfo: MethodInfo = {
        name,
        startLine: fullStartLine,
        endLine,
        isPublic,
        isPrivate,
        isProtected,
        isAsync,
        dependencies: extractDependencies(node),
        parameters: params,
        returnType,
        jsdoc: getJSDoc(node)
      };
      
      methods.set(name, methodInfo);
    }
    
    ts.forEachChild(node, visitNode);
  }

  // Find the class declaration and visit its members
  function findClass(node: ts.Node) {
    if (ts.isClassDeclaration(node) && node.name?.text === 'DefaultWeb4TSComponent') {
      ts.forEachChild(node, visitNode);
    } else {
      ts.forEachChild(node, findClass);
    }
  }

  findClass(sourceFile);

  // Analyze dependencies
  console.log('='.repeat(70));
  console.log('METHOD MIGRATION ANALYSIS');
  console.log('='.repeat(70));
  console.log(`\nTotal methods found: ${methods.size}`);
  console.log(`Public: ${[...methods.values()].filter(m => m.isPublic).length}`);
  console.log(`Private: ${[...methods.values()].filter(m => m.isPrivate).length}`);
  console.log(`Protected: ${[...methods.values()].filter(m => m.isProtected).length}`);

  // Find NOW methods that exist
  console.log('\n' + '='.repeat(70));
  console.log('NOW METHODS ANALYSIS');
  console.log('='.repeat(70));
  
  const standalone: MethodInfo[] = [];
  const hasDeps: { method: MethodInfo; missingDeps: string[] }[] = [];

  for (const methodName of NOW_METHODS) {
    const method = methods.get(methodName);
    if (!method) {
      console.log(`❌ ${methodName}: NOT FOUND`);
      continue;
    }

    // Check if dependencies are other methods that need migration
    const missingDeps = method.dependencies.filter(dep => {
      const depMethod = methods.get(dep);
      // It's "missing" if it's a method that doesn't exist in ONCE yet
      // and is not a built-in (model, console, etc.)
      return depMethod && (depMethod.isPrivate || depMethod.isProtected);
    });

    if (missingDeps.length === 0) {
      standalone.push(method);
      console.log(`✅ ${methodName}: STANDALONE (${method.startLine}-${method.endLine})`);
    } else {
      hasDeps.push({ method, missingDeps });
      console.log(`⚠️  ${methodName}: needs ${missingDeps.join(', ')}`);
    }
  }

  // Generate sed script for standalone methods
  console.log('\n' + '='.repeat(70));
  console.log('GENERATED SED MIGRATION SCRIPT');
  console.log('='.repeat(70));
  console.log('\n# Standalone methods - can migrate directly:');
  
  for (const method of standalone) {
    console.log(`# ${method.name}: lines ${method.startLine}-${method.endLine}`);
    console.log(`sed -n '${method.startLine},${method.endLine}p' "$SRC" >> /tmp/migrate_methods.ts`);
  }

  // Output dependency graph for complex methods
  console.log('\n' + '='.repeat(70));
  console.log('DEPENDENCY GRAPH FOR COMPLEX METHODS');
  console.log('='.repeat(70));
  
  for (const { method, missingDeps } of hasDeps) {
    console.log(`\n${method.name}:`);
    for (const dep of missingDeps) {
      const depMethod = methods.get(dep);
      if (depMethod) {
        console.log(`  └── ${dep} (${depMethod.startLine}-${depMethod.endLine})`);
        // Show sub-dependencies
        const subDeps = depMethod.dependencies.filter(sd => {
          const sdm = methods.get(sd);
          return sdm && (sdm.isPrivate || sdm.isProtected);
        });
        for (const sd of subDeps) {
          const sdm = methods.get(sd);
          if (sdm) {
            console.log(`      └── ${sd} (${sdm.startLine}-${sdm.endLine})`);
          }
        }
      }
    }
  }

  // Generate full migration order (topological sort)
  console.log('\n' + '='.repeat(70));
  console.log('FULL MIGRATION SCRIPT (with dependencies)');
  console.log('='.repeat(70));
  
  const migrated = new Set<string>();
  const migrationOrder: MethodInfo[] = [];

  function canMigrate(method: MethodInfo): boolean {
    const requiredDeps = method.dependencies.filter(dep => {
      const dm = methods.get(dep);
      return dm && (dm.isPrivate || dm.isProtected) && !migrated.has(dep);
    });
    return requiredDeps.length === 0;
  }

  // First add all standalone
  for (const m of standalone) {
    migrated.add(m.name);
    migrationOrder.push(m);
  }

  // Then iteratively add methods whose deps are satisfied
  let changed = true;
  while (changed) {
    changed = false;
    for (const { method } of hasDeps) {
      if (!migrated.has(method.name) && canMigrate(method)) {
        // First add its private dependencies
        for (const dep of method.dependencies) {
          const dm = methods.get(dep);
          if (dm && (dm.isPrivate || dm.isProtected) && !migrated.has(dep)) {
            migrated.add(dep);
            migrationOrder.push(dm);
          }
        }
        migrated.add(method.name);
        migrationOrder.push(method);
        changed = true;
      }
    }
  }

  console.log('\n# Migration order with all dependencies:');
  console.log('cat > /tmp/full_migration.ts << \'HEADER\'');
  console.log('  // Auto-generated migration from AST analysis');
  console.log('  // @pdca 2025-12-21-UTC-0300.web4tscomponent-inline-migration.pdca.md');
  console.log('HEADER');
  console.log('');
  
  for (const m of migrationOrder) {
    console.log(`# ${m.isPrivate ? 'private' : m.isProtected ? 'protected' : 'public'} ${m.name}()`);
    console.log(`sed -n '${m.startLine},${m.endLine}p' "$SRC" >> /tmp/full_migration.ts`);
    console.log(`echo "" >> /tmp/full_migration.ts`);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`Standalone (no deps): ${standalone.length}`);
  console.log(`With dependencies: ${hasDeps.length}`);
  console.log(`Total in migration order: ${migrationOrder.length}`);
  console.log(`Not migratable (circular/deep deps): ${NOW_METHODS.filter(n => !migrated.has(n)).length}`);
  
  const notMigrated = NOW_METHODS.filter(n => !migrated.has(n));
  if (notMigrated.length > 0) {
    console.log(`\n❌ Cannot migrate automatically: ${notMigrated.join(', ')}`);
  }
}

analyze();

