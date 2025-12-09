/**
 * Test19_Web4LazyMigrationScan - Scan for Web4 principle violations needing lazy migration
 * 
 * ✅ Web4 Principle 25: Tootsie Tests Only
 * ✅ This test NEVER FAILS - it logs a checklist of items needing lazy migration
 * ✅ Tracks progress over time as violations are fixed
 * 
 * Scans for:
 * - P3: Snake_case variables, underscores in names
 * - P4: Arrow function callbacks (should use .bind(this))
 * - P6: Constructors with parameters (should be empty)
 * - P16: xyzGet() without params (should be get xyz)
 * - P16: getXxx() (should be get xxx)
 * - P16: setXxx() (should be set xxx)
 * - P16: createXxx() (should be xxxCreate())
 * - P16: updateXxx() (should be xxxUpdate())
 * - P26: Factory functions (should use new Class().init())
 * 
 * @pdca 2025-12-08-UTC-1100.jsinterface-type-descriptors.pdca.md
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
  principle: string;
  pattern: string;
  match: string;
  suggestion: string;
}

/**
 * Test model
 */
interface Test19Model {
  componentRoot: string;
  srcDir: string;
  violations: Violation[];
  scannedFiles: number;
}

/**
 * Test19_Web4LazyMigrationScan
 * 
 * Scans source files for Web4 principle violations that need lazy migration.
 * Never fails - just produces a checklist for incremental refactoring.
 */
export class Test19_Web4LazyMigrationScan extends ONCETestCase {
  
  testModel: Test19Model = {
    componentRoot: '',
    srcDir: '',
    violations: [],
    scannedFiles: 0,
  };
  
  /**
   * Patterns to scan for - each maps to a Web4 principle
   */
  private readonly SCAN_PATTERNS: Array<{
    principle: string;
    pattern: RegExp;
    suggestion: string;
    exclude?: RegExp;
  }> = [
    // P16: xyzGet() without parameters -> should be get xyz
    {
      principle: 'P16',
      pattern: /(\w+)Get\s*\(\s*\)\s*[:{]/g,
      suggestion: 'Use TypeScript getter: get $1()',
      exclude: /static\s+get\s+|get\s+\w+\s*\(/  // Exclude existing getters
    },
    // P16: getXxx() without parameters -> should be get xxx  
    {
      principle: 'P16',
      pattern: /\bget([A-Z]\w*)\s*\(\s*\)\s*[:{]/g,
      suggestion: 'Use TypeScript getter: get $1()',
      exclude: /static\s+get\s+|get\s+\w+\s*\(/
    },
    // P16: setXxx(value) -> should be set xxx
    {
      principle: 'P16',
      pattern: /\bset([A-Z]\w*)\s*\([^)]+\)\s*[:{]/g,
      suggestion: 'Use TypeScript setter: set $1(value)',
      exclude: /static\s+set\s+|set\s+\w+\s*\(/
    },
    // P16: xyzSet(value) -> should be set xyz
    {
      principle: 'P16',
      pattern: /(\w+)Set\s*\([^)]+\)\s*[:{]/g,
      suggestion: 'Use TypeScript setter: set $1(value)',
    },
    // P16: createXxx() -> should be xxxCreate()
    {
      principle: 'P16',
      pattern: /\bcreate([A-Z]\w*)\s*\(/g,
      suggestion: 'Use object-action naming: $1Create()',
    },
    // P16: updateXxx() -> should be xxxUpdate()
    {
      principle: 'P16',
      pattern: /\bupdate([A-Z]\w*)\s*\(/g,
      suggestion: 'Use object-action naming: $1Update()',
    },
    // P16: buildXxx() -> should be xxxBuild()
    {
      principle: 'P16',
      pattern: /\bbuild([A-Z]\w*)\s*\(/g,
      suggestion: 'Use object-action naming: $1Build()',
    },
    // P16: loadXxx() -> should be xxxLoad()
    {
      principle: 'P16',
      pattern: /\bload([A-Z]\w*)\s*\(/g,
      suggestion: 'Use object-action naming: $1Load()',
    },
    // P16: saveXxx() -> should be xxxSave()
    {
      principle: 'P16',
      pattern: /\bsave([A-Z]\w*)\s*\(/g,
      suggestion: 'Use object-action naming: $1Save()',
    },
    // P16: deleteXxx() -> should be xxxDelete()
    {
      principle: 'P16',
      pattern: /\bdelete([A-Z]\w*)\s*\(/g,
      suggestion: 'Use object-action naming: $1Delete()',
    },
    // P3: snake_case variables (excluding special keywords)
    {
      principle: 'P3',
      pattern: /\b(let|const|var)\s+(\w+_\w+)\s*[=:]/g,
      suggestion: 'Use camelCase: convert snake_case to camelCase',
      exclude: /__dirname|__filename|NODE_ENV|HTTP_|HTTPS_/
    },
    // P3: private _property pattern (should use Field suffix)
    {
      principle: 'P3',
      pattern: /private\s+_(\w+)\s*[=:]/g,
      suggestion: 'Use xxxField instead of _xxx: private $1Field',
    },
    // P4: Arrow function in forEach/map/filter callbacks
    {
      principle: 'P4',
      pattern: /\.(forEach|map|filter|find|some|every|reduce)\s*\(\s*\([^)]*\)\s*=>/g,
      suggestion: 'Use .bind(this) instead of arrow: .forEach(this.methodName.bind(this))',
    },
    // P4: Arrow function with single param in callbacks
    {
      principle: 'P4',
      pattern: /\.(forEach|map|filter|find|some|every|reduce)\s*\(\s*\w+\s*=>/g,
      suggestion: 'Use .bind(this) instead of arrow: .forEach(this.methodName.bind(this))',
    },
    // P6: Constructor with parameters
    {
      principle: 'P6',
      pattern: /constructor\s*\([^)]+\)\s*\{/g,
      suggestion: 'Empty constructor + init(scenario) pattern',
      exclude: /private\s+constructor|protected\s+constructor/  // Allow singleton private constructor
    },
    // P26: Factory function pattern (function that returns new)
    {
      principle: 'P26',
      pattern: /export\s+function\s+\w+Create\s*\(/g,
      suggestion: 'Use new Class().init() instead of factory function',
    },
    // P26: Factory function pattern (xxxFactory)
    {
      principle: 'P26',
      pattern: /\w+Factory\s*[=:]/g,
      suggestion: 'Factories obsolete - use new Class().init()',
    },
  ];
  
  /**
   * Test execution
   */
  protected async executeTestLogic(): Promise<void> {
    // Initialize paths
    this.testModel.componentRoot = this.componentRoot;
    this.testModel.srcDir = path.join(this.componentRoot, 'src', 'ts');
    
    this.logEvidence('step', 'SCAN-01: Scanning source files for Web4 violations');
    this.logEvidence('evidence', `Source directory: ${this.testModel.srcDir}`);
    
    // Scan all TypeScript files
    await this.scanDirectory(this.testModel.srcDir);
    
    this.logEvidence('evidence', `Scanned ${this.testModel.scannedFiles} files`);
    this.logEvidence('evidence', `Found ${this.testModel.violations.length} potential violations`);
    
    // Log the lazy migration checklist
    this.logLazyMigrationChecklist();
    
    // This test NEVER fails - it's just a progress tracker
    this.logEvidence('status', 'PASS: Lazy migration scan complete (informational only)');
  }
  
  /**
   * Scan a directory recursively for TypeScript files
   */
  private async scanDirectory(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      return;
    }
    
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, dist, etc.
        if (!['node_modules', 'dist', '.git', 'coverage'].includes(entry.name)) {
          await this.scanDirectory(fullPath);
        }
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        await this.scanFile(fullPath);
      }
    }
  }
  
  /**
   * Scan a single TypeScript file for violations
   */
  private async scanFile(filePath: string): Promise<void> {
    this.testModel.scannedFiles++;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = path.relative(this.testModel.componentRoot, filePath);
    
    for (const scanPattern of this.SCAN_PATTERNS) {
      // Check each line
      for (let lineNum = 0; lineNum < lines.length; lineNum++) {
        const line = lines[lineNum];
        
        // Skip if excluded
        if (scanPattern.exclude && scanPattern.exclude.test(line)) {
          continue;
        }
        
        // Reset regex state
        scanPattern.pattern.lastIndex = 0;
        
        let match;
        while ((match = scanPattern.pattern.exec(line)) !== null) {
          // Additional check - skip if already a getter/setter definition
          if (line.includes('get ') && line.includes('():') && 
              (scanPattern.suggestion.includes('getter') || scanPattern.suggestion.includes('setter'))) {
            continue;
          }
          
          this.testModel.violations.push({
            file: relativePath,
            line: lineNum + 1,
            principle: scanPattern.principle,
            pattern: scanPattern.pattern.source,
            match: match[0].trim(),
            suggestion: scanPattern.suggestion,
          });
        }
      }
    }
  }
  
  /**
   * Log the lazy migration checklist grouped by principle
   */
  private logLazyMigrationChecklist(): void {
    this.logEvidence('step', 'CHECKLIST: Web4 Lazy Migration Items');
    
    // Group by principle
    const byPrinciple = new Map<string, Violation[]>();
    
    for (const violation of this.testModel.violations) {
      if (!byPrinciple.has(violation.principle)) {
        byPrinciple.set(violation.principle, []);
      }
      byPrinciple.get(violation.principle)!.push(violation);
    }
    
    // Log each principle's violations
    const principleNames: Record<string, string> = {
      'P3': 'Web4 Naming Conventions',
      'P4': 'Radical OOP (no arrow callbacks)',
      'P6': 'Empty Constructor Pattern',
      'P16': 'Object-Action + TypeScript Accessors',
      'P26': 'No Factory Functions',
    };
    
    for (const [principle, violations] of byPrinciple.entries()) {
      this.logEvidence('requirement', `\n═══ ${principle}: ${principleNames[principle] || principle} (${violations.length} items) ═══`);
      
      // Group by file
      const byFile = new Map<string, Violation[]>();
      for (const v of violations) {
        if (!byFile.has(v.file)) {
          byFile.set(v.file, []);
        }
        byFile.get(v.file)!.push(v);
      }
      
      for (const [file, fileViolations] of byFile.entries()) {
        this.logEvidence('evidence', `\n📄 ${file}:`);
        for (const v of fileViolations) {
          this.logEvidence('evidence', `  [ ] Line ${v.line}: ${v.match}`);
          this.logEvidence('evidence', `      → ${v.suggestion}`);
        }
      }
    }
    
    // Summary
    this.logEvidence('step', '\n═══ SUMMARY ═══');
    for (const [principle, violations] of byPrinciple.entries()) {
      this.logEvidence('evidence', `${principle} (${principleNames[principle] || principle}): ${violations.length} items`);
    }
    this.logEvidence('evidence', `TOTAL: ${this.testModel.violations.length} items for lazy migration`);
  }
}

