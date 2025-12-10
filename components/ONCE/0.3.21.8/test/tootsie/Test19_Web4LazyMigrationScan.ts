/**
 * Test19_Web4LazyMigrationScan - Scan codebase for Web4 principle violations
 * 
 * ✅ Web4 Principle 25: Tootsie Tests Only
 * ✅ This test NEVER FAILS - it only logs a lazy refactoring checklist
 * ✅ Scans for deprecated patterns that should be migrated over time
 * 
 * Patterns scanned:
 * - P16: xyzGet() without parameters → should be `get xyz`
 * - P16: xyzSet(value) single param → should be `set xyz(value)`
 * - P16: getXyz() → should be `get xyz`
 * - P16: setXyz(value) → should be `set xyz(value)`
 * - P16: createXyz() → should be `xyzCreate()`
 * - P16: updateXyz() → should be `xyzUpdate()`
 * - P19: Multiple types in one file → split into separate files
 * - P19: Inline CSS with `static styles = css\`` → move to external .css file
 * - P19: Inline HTML with innerHTML → move to external template
 * - P4: Arrow functions in forEach/map/filter → should be method references
 * - P3: Underscore prefix properties → use descriptive suffix
 * - P26: Factory functions → should be `new Class().init(scenario)`
 * - P1: Separate Config objects → should be part of Scenario
 * 
 * @pdca session/2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
 */

import { ONCETestCase } from './ONCETestCase.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Violation found during scan
 */
interface Violation {
  file: string;
  line: number;
  pattern: string;
  code: string;
  suggestion: string;
  principle: string;
}

/**
 * Test model
 */
interface Test19Model {
  sourceDir: string;
  violations: Violation[];
  fileCount: number;
  scanPatterns: ScanPattern[];
}

/**
 * Pattern to scan for
 */
interface ScanPattern {
  name: string;
  principle: string;
  regex: RegExp;
  suggestion: string;
  exclude?: RegExp;
}

/**
 * Test19_Web4LazyMigrationScan
 * 
 * Scans codebase for Web4 violations and logs them as a checklist.
 * This test NEVER FAILS - violations are logged for lazy migration.
 */
export class Test19_Web4LazyMigrationScan extends ONCETestCase {
  
  testModel: Test19Model = {
    sourceDir: '',
    violations: [],
    fileCount: 0,
    scanPatterns: [],
  };
  
  /**
   * Initialize scan patterns
   */
  private initPatterns(): void {
    this.testModel.scanPatterns = [
      // ═══════════════════════════════════════════════════════════════
      // P16: Object-Action Method Naming + TypeScript Accessors
      // ═══════════════════════════════════════════════════════════════
      
      {
        name: 'xyzGet() without params',
        principle: 'P16',
        // Matches: methodNameGet(): or methodNameGet() { but NOT methodNameGet(param
        regex: /(\w+)Get\(\s*\)\s*[:{]/g,
        suggestion: 'Use TypeScript getter: `get $1()`',
        exclude: /static\s+get\s+/,  // Exclude already-correct getters
      },
      {
        name: 'getXyz() method',
        principle: 'P16',
        // Matches: getPropertyName( but NOT get propertyName
        regex: /\bget([A-Z]\w*)\s*\(/g,
        suggestion: 'Use TypeScript getter: `get $1()` (lowercase first letter)',
        exclude: /\bget\s+\w+\s*\(/,  // Exclude proper getters
      },
      {
        name: 'xyzSet(value) single param',
        principle: 'P16',
        // Matches: methodNameSet(value): or methodNameSet(value) {
        regex: /(\w+)Set\(\s*\w+\s*[,:)]/g,
        suggestion: 'Use TypeScript setter: `set $1(value)`',
      },
      {
        name: 'setXyz(value) method',
        principle: 'P16',
        // Matches: setPropertyName(
        regex: /\bset([A-Z]\w*)\s*\(/g,
        suggestion: 'Use TypeScript setter: `set $1(value)` (lowercase first letter)',
        exclude: /\bset\s+\w+\s*\(/,  // Exclude proper setters
      },
      {
        name: 'createXyz() method',
        principle: 'P16',
        regex: /\bcreate([A-Z]\w*)\s*\(/g,
        suggestion: 'Rename to: `$1Create()`',
      },
      {
        name: 'updateXyz() method',
        principle: 'P16',
        regex: /\bupdate([A-Z]\w*)\s*\(/g,
        suggestion: 'Rename to: `$1Update()`',
      },
      {
        name: 'buildXyz() method',
        principle: 'P16',
        regex: /\bbuild([A-Z]\w*)\s*\(/g,
        suggestion: 'Rename to: `$1Build()`',
      },
      {
        name: 'loadXyz() method',
        principle: 'P16',
        regex: /\bload([A-Z]\w*)\s*\(/g,
        suggestion: 'Rename to: `$1Load()`',
      },
      {
        name: 'saveXyz() method',
        principle: 'P16',
        regex: /\bsave([A-Z]\w*)\s*\(/g,
        suggestion: 'Rename to: `$1Save()`',
      },
      {
        name: 'deleteXyz() method',
        principle: 'P16',
        regex: /\bdelete([A-Z]\w*)\s*\(/g,
        suggestion: 'Rename to: `$1Delete()`',
      },
      
      // ═══════════════════════════════════════════════════════════════
      // P4: Radical OOP - No arrow functions
      // ═══════════════════════════════════════════════════════════════
      
      {
        name: 'Arrow function in forEach',
        principle: 'P4',
        regex: /\.forEach\s*\(\s*\([^)]*\)\s*=>/g,
        suggestion: 'Use method reference: `.forEach(this.methodName.bind(this))`',
      },
      {
        name: 'Arrow function in map',
        principle: 'P4',
        regex: /\.map\s*\(\s*\([^)]*\)\s*=>/g,
        suggestion: 'Use method reference: `.map(this.methodName.bind(this))`',
      },
      {
        name: 'Arrow function in filter',
        principle: 'P4',
        regex: /\.filter\s*\(\s*\([^)]*\)\s*=>/g,
        suggestion: 'Use method reference: `.filter(this.methodName.bind(this))`',
      },
      {
        name: 'Arrow function in find',
        principle: 'P4',
        regex: /\.find\s*\(\s*\([^)]*\)\s*=>/g,
        suggestion: 'Use method reference: `.find(this.methodName.bind(this))`',
      },
      {
        name: 'Arrow function in some/every',
        principle: 'P4',
        regex: /\.(some|every)\s*\(\s*\([^)]*\)\s*=>/g,
        suggestion: 'Use method reference: `.$1(this.methodName.bind(this))`',
      },
      {
        name: 'Inline function in forEach',
        principle: 'P4',
        regex: /\.forEach\s*\(\s*function\s*\(/g,
        suggestion: 'Use for loop or class method instead of inline function',
      },
      {
        name: 'Inline function in map',
        principle: 'P4',
        regex: /\.map\s*\(\s*function\s*\(/g,
        suggestion: 'Use for loop or class method instead of inline function',
      },
      {
        name: 'Inline function in filter',
        principle: 'P4',
        regex: /\.filter\s*\(\s*function\s*\(/g,
        suggestion: 'Use for loop or class method instead of inline function',
      },
      {
        name: 'Inline function in find',
        principle: 'P4',
        regex: /\.find\s*\(\s*function\s*\(/g,
        suggestion: 'Use for loop or class method instead of inline function',
      },
      {
        name: 'Inline function in some/every',
        principle: 'P4',
        regex: /\.(some|every)\s*\(\s*function\s*\(/g,
        suggestion: 'Use for loop or class method instead of inline function',
      },
      
      // ═══════════════════════════════════════════════════════════════
      // P26: No Factory Functions
      // ═══════════════════════════════════════════════════════════════
      
      {
        name: 'Factory function pattern',
        principle: 'P26',
        // Matches: export function createXyz or function xyzFactory
        regex: /export\s+function\s+create\w+|function\s+\w+Factory/g,
        suggestion: 'Use `new Class().init(scenario)` pattern instead',
      },
      
      // ═══════════════════════════════════════════════════════════════
      // P3: Web4 Naming - No underscores
      // ═══════════════════════════════════════════════════════════════
      
      {
        name: 'Underscore prefix property',
        principle: 'P3',
        // Matches: private _propertyName or this._property
        regex: /(?:private|protected|public)?\s*_\w+\s*[=:;]|this\._\w+/g,
        suggestion: 'Use descriptive suffix: `propertyField` instead of `_property`',
      },
      
      // ═══════════════════════════════════════════════════════════════
      // P1: Everything is a Scenario
      // ═══════════════════════════════════════════════════════════════
      
      {
        name: 'Separate config object',
        principle: 'P1',
        // Matches: interface XyzConfig or type XyzConfig
        regex: /(?:interface|type)\s+\w+Config\s*[{=]/g,
        suggestion: 'Configuration should be part of a Scenario, not separate Config type',
      },
      
      // ═══════════════════════════════════════════════════════════════
      // P19: Separation of Concerns - No inline CSS
      // ═══════════════════════════════════════════════════════════════
      
      {
        name: 'Inline CSS with static styles',
        principle: 'P19',
        // Matches: static styles = css` or static styles: CSSResultGroup = css`
        regex: /static\s+styles\s*[=:][^;]*css`/g,
        suggestion: 'Move CSS to external file: `ComponentName.css` and use adoptedStyleSheets',
      },
      {
        name: 'Inline HTML template',
        principle: 'P19',
        // Matches: innerHTML = ` or = `<div but NOT from template files
        regex: /\.innerHTML\s*=\s*`[^`]*<\w+/g,
        suggestion: 'Move HTML to external template file (use HTMLTemplateLoader)',
        exclude: /\.html$/,  // Exclude from HTML files themselves
      },
    ];
  }
  
  /**
   * Test execution
   */
  protected async executeTestLogic(): Promise<void> {
    this.testModel.sourceDir = path.join(this.componentRoot, 'src', 'ts');
    this.initPatterns();
    
    // Output dual link to Web4 principles reference
    this.logEvidence('step', '═══════════════════════════════════════════════════════════════');
    this.logEvidence('step', '📚 WEB4 PRINCIPLES REFERENCE');
    this.logEvidence('step', '═══════════════════════════════════════════════════════════════');
    this.logEvidence('evidence', 'GitHub: https://github.com/Cerulean-Circle-GmbH/UpDown/blob/dev/web4v0100/components/ONCE/0.3.21.8/session/web4-principles-checklist.md');
    this.logEvidence('evidence', 'Local:  §/components/ONCE/0.3.21.8/session/web4-principles-checklist.md');
    this.logEvidence('step', '═══════════════════════════════════════════════════════════════');
    this.logEvidence('step', '');
    
    this.logEvidence('step', 'SCAN-01: Initializing Web4 lazy migration scan');
    this.logEvidence('evidence', `Scanning directory: ${this.testModel.sourceDir}`);
    this.logEvidence('evidence', `Patterns to check: ${this.testModel.scanPatterns.length}`);
    
    // Scan all TypeScript files
    await this.scanDirectory(this.testModel.sourceDir);
    
    // Log results
    this.logResults();
  }
  
  /**
   * Recursively scan directory for TypeScript files
   */
  private async scanDirectory(dir: string): Promise<void> {
    if (!fs.existsSync(dir)) {
      this.logEvidence('status', `Directory not found: ${dir}`);
      return;
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, dist, etc.
        if (!['node_modules', 'dist', '.git', 'coverage'].includes(entry.name)) {
          await this.scanDirectory(fullPath);
        }
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        await this.scanFile(fullPath);
      }
    }
  }
  
  /**
   * Scan a single file for violations
   */
  private async scanFile(filePath: string): Promise<void> {
    this.testModel.fileCount++;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(this.componentRoot, filePath);
    
    // P19: Check for multiple types in one file
    this.checkOneFileOneType(content, relativePath);
    
    for (const pattern of this.testModel.scanPatterns) {
      // Reset regex state
      pattern.regex.lastIndex = 0;
      
      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        
        // Skip if excluded
        if (pattern.exclude && pattern.exclude.test(line)) {
          continue;
        }
        
        // Reset regex for this line
        pattern.regex.lastIndex = 0;
        const match = pattern.regex.exec(line);
        
        if (match) {
          // Generate suggestion with captured group
          let suggestion = pattern.suggestion;
          if (match[1]) {
            const lowerFirst = match[1].charAt(0).toLowerCase() + match[1].slice(1);
            suggestion = suggestion.replace(/\$1/g, lowerFirst);
          }
          
          this.testModel.violations.push({
            file: relativePath,
            line: lineNum + 1,
            pattern: pattern.name,
            code: line.trim().substring(0, 80),
            suggestion: suggestion,
            principle: pattern.principle,
          });
        }
      }
    }
  }
  
  /**
   * Check for P19 violation: One File One Type
   * Scans for multiple exported interfaces, types, classes, or enums in a single file
   */
  private checkOneFileOneType(content: string, relativePath: string): void {
    // Patterns to find exported type declarations
    const exportedInterfaceRegex = /^export\s+interface\s+(\w+)/gm;
    const exportedTypeRegex = /^export\s+type\s+(\w+)/gm;
    const exportedClassRegex = /^export\s+(?:abstract\s+)?class\s+(\w+)/gm;
    const exportedEnumRegex = /^export\s+(?:const\s+)?enum\s+(\w+)/gm;
    
    const interfaces: string[] = [];
    const types: string[] = [];
    const classes: string[] = [];
    const enums: string[] = [];
    
    let match;
    
    // Find all exported interfaces
    while ((match = exportedInterfaceRegex.exec(content)) !== null) {
      interfaces.push(match[1]);
    }
    
    // Find all exported types
    while ((match = exportedTypeRegex.exec(content)) !== null) {
      types.push(match[1]);
    }
    
    // Find all exported classes
    while ((match = exportedClassRegex.exec(content)) !== null) {
      classes.push(match[1]);
    }
    
    // Find all exported enums
    while ((match = exportedEnumRegex.exec(content)) !== null) {
      enums.push(match[1]);
    }
    
    // Count total exported types
    const totalTypes = interfaces.length + types.length + classes.length + enums.length;
    
    // P19 violation if more than one exported type in a file
    if (totalTypes > 1) {
      const allTypes: string[] = [];
      if (interfaces.length > 0) allTypes.push(`interfaces: ${interfaces.join(', ')}`);
      if (types.length > 0) allTypes.push(`types: ${types.join(', ')}`);
      if (classes.length > 0) allTypes.push(`classes: ${classes.join(', ')}`);
      if (enums.length > 0) allTypes.push(`enums: ${enums.join(', ')}`);
      
      this.testModel.violations.push({
        file: relativePath,
        line: 1,
        pattern: 'Multiple types in one file',
        code: `${totalTypes} exports: ${allTypes.join('; ')}`,
        suggestion: `Split into separate files: one file per interface/type/class/enum`,
        principle: 'P19',
      });
    }
  }
  
  /**
   * Log results as a lazy migration checklist
   */
  private logResults(): void {
    this.logEvidence('step', 'SCAN-02: Generating lazy migration checklist');
    this.logEvidence('evidence', `Files scanned: ${this.testModel.fileCount}`);
    this.logEvidence('evidence', `Total violations found: ${this.testModel.violations.length}`);
    
    if (this.testModel.violations.length === 0) {
      this.logEvidence('status', '🎉 No Web4 violations found! Codebase is compliant.');
      return;
    }
    
    // Group by principle
    const byPrinciple = new Map<string, Violation[]>();
    for (const v of this.testModel.violations) {
      if (!byPrinciple.has(v.principle)) {
        byPrinciple.set(v.principle, []);
      }
      byPrinciple.get(v.principle)!.push(v);
    }
    
    this.logEvidence('step', '═══════════════════════════════════════════════════════════════');
    this.logEvidence('step', '📋 LAZY MIGRATION CHECKLIST');
    this.logEvidence('step', '═══════════════════════════════════════════════════════════════');
    
    // Log by principle
    for (const [principle, violations] of byPrinciple) {
      this.logEvidence('step', '');
      this.logEvidence('requirement', `${principle}: ${violations.length} items`);
      
      // Group by pattern within principle
      const byPattern = new Map<string, Violation[]>();
      for (const v of violations) {
        if (!byPattern.has(v.pattern)) {
          byPattern.set(v.pattern, []);
        }
        byPattern.get(v.pattern)!.push(v);
      }
      
      for (const [pattern, patternViolations] of byPattern) {
        this.logEvidence('evidence', `  ${pattern}: ${patternViolations.length}`);
        
        // Log first 5 examples
        const examples = patternViolations.slice(0, 5);
        for (const v of examples) {
          this.logEvidence('evidence', `    - [ ] ${v.file}:${v.line}`);
          this.logEvidence('evidence', `          ${v.code}`);
          this.logEvidence('evidence', `          → ${v.suggestion}`);
        }
        
        if (patternViolations.length > 5) {
          this.logEvidence('evidence', `    ... and ${patternViolations.length - 5} more`);
        }
      }
    }
    
    this.logEvidence('step', '');
    this.logEvidence('step', '═══════════════════════════════════════════════════════════════');
    this.logEvidence('status', '✅ Scan complete - checklist logged for lazy migration');
    this.logEvidence('status', 'Note: This test NEVER FAILS. Fix violations incrementally.');
  }
}

