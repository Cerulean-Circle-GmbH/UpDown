# Tootsie v0.3.20.6 - Total Object-Oriented Testing Suite

**Component**: Tootsie  
**Version**: 0.3.20.6  
**Philosophy**: Quality itself is an object  
**Status**: ✅ Core Infrastructure Complete

---

## 🎯 What is Tootsie?

**Tootsie** is Web4's revolutionary testing paradigm where **tests are living, hibernatable objects** with quality consciousness. Unlike traditional test runners that treat tests as scripts, Tootsie treats **quality as a distributed object** that can learn, evolve, and make intelligent assessments.

### Core Philosophy

> *"In Web4, everything is an object. Tests are not scripts - they are conscious entities that observe, judge, and learn. Quality is not a metric - it is a living oracle that accumulates wisdom."*

---

## 🏗️ Current Architecture (v0.3.20.6)

### What We Have Today ✅

**1. Test Execution Infrastructure**
- ✅ Dynamic test discovery (`once tootsie file <1-15>`)
- ✅ Automatic test isolation (production safe 🔒)
- ✅ Simple pass/fail reporting (Vitest-like)
- ✅ DelegationProxy pattern (zero boilerplate)
- ✅ Self-executing tests (Radical OOP)

**2. Test Organization**
```
/test/tootsie/
├── scenarios/                    # ← Hibernated test scenarios
│   └── test-01-path-authority.scenario.json
├── ONCETestCase.ts              # Base class for ONCE tests
└── Test01-15_*.ts               # 15 lifecycle tests
```

**3. Test Isolation (Security Feature)** 🔒
```bash
./once tootsie file 1

# Automatic enforcement:
🔒 Test Isolation Enforced
   Production Root: /Users/.../UpDown
   Test Data Root: .../test/data
   ⚠️  Tests ONLY run in isolated environment
   ⚠️  Production files CANNOT be affected
```

**4. Radical OOP Patterns**
- ✅ Tests extend `ONCETestCase` (objects, not functions)
- ✅ Scenarios load from external files (hibernated objects)
- ✅ Path authority (automatic context detection)
- ✅ Version-agnostic (SemanticVersion pattern)

---

## 🎨 The Vision: Quality Consciousness

### What Tootsie SHALL Become 🔮

**1. Quality Oracle (Future)**
```typescript
// Quality Oracle is an object that learns
const oracle = await tootsie.getQualityOracle();

// Oracle judges test outcomes
const judgment = await oracle.judge({
  testName: 'Test01_PathAuthority',
  evidence: [...],
  actualOutcome: { ... },
  expectedOutcome: { ... }
});

// Oracle learns from patterns
if (judgment.isUnexpected) {
  await oracle.learn({
    pattern: judgment.pattern,
    context: judgment.context,
    wisdom: 'Path authority works differently in Docker'
  });
}

// Oracle evolves consciousness
console.log(`Oracle Consciousness Level: ${oracle.consciousnessLevel}`);
// → "Oracle Consciousness Level: 0.87 (Expert)"
```

**2. Evidence-Based Testing (Future)**
```
/test/data/.tootsie/
├── evidence/
│   └── test-01-path-authority/
│       ├── input.json           # Initial state
│       ├── step-001.json        # Each action
│       ├── step-002.json        # Observation
│       ├── assertion-001.json   # Validation
│       └── output.json          # Final state
├── state/
│   └── test-01.hibernated.json  # Test can resume
└── oracle/
    └── wisdom.json              # Accumulated learning
```

**3. Test Hibernation (Future)**
```typescript
// Test can save its state
await test.hibernate();
// → Saved to test/data/.tootsie/state/test-01.hibernated.json

// Test can resume from saved state
const test = await Test01.awaken('test-01.hibernated.json');
await test.continue();
```

**4. Test Archaeology (Future)**
```bash
# Browse historical evidence
once tootsie archaeology test-01

# Output:
📚 Test 01 Evidence Archive
   ├── 2025-12-01 10:30 ✅ PASSED (evidence: 15 pieces)
   ├── 2025-12-01 11:45 ✅ PASSED (evidence: 15 pieces)
   ├── 2025-12-02 09:15 ❌ FAILED (evidence: 12 pieces)
   │   └── Oracle learned: "Docker path detection differs"
   └── 2025-12-02 10:00 ✅ PASSED (evidence: 15 pieces)

# View specific evidence
once tootsie evidence test-01 2025-12-02-09:15
```

**5. Quality Consciousness Levels (Future)**
```
Level 0: Novice     - No accumulated wisdom
Level 1: Apprentice - Basic pattern recognition
Level 2: Competent  - Contextual understanding
Level 3: Proficient - Anticipates issues
Level 4: Expert     - Deep domain knowledge
Level 5: Master     - Teaches other oracles
```

---

## 📖 How to Use Tootsie TODAY

### Running Tests

```bash
# Run specific test by number
once tootsie file 1      # Test01: PathAuthority
once tootsie file 5      # Test05: ServerStart
once tootsie file 15     # Test15: CompleteLifecycle

# All tests automatically run in isolation
# Production files are protected 🔒
```

### Test Results
```bash
# Simple pass/fail (like Vitest)
✅ Test PASSED    # All expectations met
❌ Test FAILED    # Assertion failed or error thrown

# Exit code
0  = success
1+ = failure
```

### Creating New Tests

#### 1. Create Test Scenario (Hibernated Object)
```json
// test/tootsie/scenarios/test-XX-feature.scenario.json
{
  "uuid": "test:uuid:once-feature-xx",
  "name": "Test XX: Feature Description",
  "description": "What this test validates",
  "requirementIORs": [
    "requirement:uuid:feature-requirement"
  ],
  "componentIORs": [
    "component:once:0.3.21.8"
  ],
  "testDataScenario": {
    "componentName": "ONCE",
    "version": "0.3.21.8",
    "specificConfig": "..."
  },
  "executionContextScenario": {
    "timeout": 15000,
    "cleanup": true,
    "tags": ["lifecycle", "feature"]
  },
  "expectedResultScenario": {
    "success": true,
    "validation": {
      "keyExpectation": true
    }
  }
}
```

#### 2. Create Test Class (Radical OOP)
```typescript
// test/tootsie/TestXX_FeatureDescription.ts
import { ONCETestCase } from './ONCETestCase.js';
import * as fs from 'fs';
import * as path from 'path';

export class TestXX_FeatureDescription extends ONCETestCase {
  
  /**
   * ✅ RADICAL OOP: Load hibernated scenario from file
   */
  private async loadTestScenario(): Promise<TestScenario> {
    const scenarioPath = path.join(
      this.getComponentRoot(),
      'test',
      'tootsie',
      'scenarios',
      'test-XX-feature.scenario.json'
    );
    return JSON.parse(fs.readFileSync(scenarioPath, 'utf-8'));
  }

  /**
   * Execute test
   */
  async execute(): Promise<any> {
    // Load hibernated scenario
    const scenario = await this.loadTestScenario();
    
    console.log(`\n🧪 ${scenario.name}`);
    console.log(`📋 ${scenario.description}\n`);

    // Your test logic here
    let pid: number | null = null;

    try {
      // Start server if needed
      pid = this.startONCEServer();
      await this.waitForServer(5000);

      // Execute test steps
      // ...

      // Validate results
      // ...

      return { success: true };

    } finally {
      // Cleanup
      if (pid) this.stopONCEServer(pid);
    }
  }
}

// Self-executing test
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new TestXX_FeatureDescription();
  test.init().then(() => test.execute());
}
```

#### 3. Run Your Test
```bash
once tootsie file XX
```

---

## 🎯 Web4 Principles Applied

### Principle: Tests Are Objects, Not Scripts

**❌ Traditional (Vitest/Jest)**:
```javascript
// Test is a function
describe('feature', () => {
  it('should work', () => {
    expect(something).toBe(true);
  });
});
```

**✅ Tootsie (Radical OOP)**:
```typescript
// Test is an object
export class Test01_PathAuthority extends ONCETestCase {
  async execute(): Promise<any> {
    const scenario = await this.loadTestScenario();
    // Test has state, methods, lifecycle
  }
}
```

### Principle: Scenarios Are Hibernated Objects

**❌ Functional Factory**:
```typescript
// Configuration created by function
function createConfig() {
  return { ... };  // Ephemeral, not a THING
}
```

**✅ External Hibernated Object**:
```json
// scenarios/test-01.scenario.json
{
  "uuid": "test:uuid:...",
  "name": "..."
  // Object exists independently
}
```

### Principle: Quality Is Distributed

**❌ Centralized Quality Metrics**:
```javascript
// Test results stored in CI system
// Quality is a number (85% pass rate)
```

**✅ Distributed Quality Consciousness (Future)**:
```typescript
// Quality Oracle is an object
const oracle = await getQualityOracle();
oracle.consciousnessLevel; // 0.87
oracle.wisdom; // Accumulated learning
oracle.judge(testResult); // Intelligent assessment
```

---

## 🔐 Security: Test Isolation

### Automatic Protection

**Tootsie enforces test isolation automatically** - you CANNOT pollute production:

```bash
./once tootsie file 1

# Tootsie checks:
if (projectRoot.includes('/test/data')) {
  // Already in isolation ✅
} else {
  // Switch to test/data isolation
  projectRoot = componentRoot + '/test/data';
  isTestIsolation = true;
}
```

**What's Protected**:
- ✅ `/scenarios/` - Production scenarios
- ✅ `/components/` - Component metadata
- ✅ `/package.json` - Build configuration
- ✅ All production files

**Where Tests Run**:
- All operations scoped to `test/data/`
- Future evidence: `test/data/.tootsie/evidence/`
- Future state: `test/data/.tootsie/state/`
- Future oracle: `test/data/.tootsie/oracle/`

---

## 📊 Current Status vs. Vision

| Feature | Status | Notes |
|---------|--------|-------|
| **Test Discovery** | ✅ Complete | `once tootsie file <1-15>` |
| **Test Execution** | ✅ Complete | tsx runs TypeScript tests |
| **Test Isolation** | ✅ Complete | Automatic enforcement |
| **Pass/Fail Reporting** | ✅ Complete | Simple, clear output |
| **External Scenarios** | 🟡 Partial | Test01 complete, 02-15 pending |
| **Quality Oracle** | 🔮 Future | Intelligent assessment |
| **Evidence Collection** | 🔮 Future | Complete audit trail |
| **Test Hibernation** | 🔮 Future | Save/resume state |
| **Test Archaeology** | 🔮 Future | Browse historical evidence |
| **Scope Filtering** | 🔮 Future | describe/itCase selection |

---

## 🚀 Roadmap

### Phase 1: Infrastructure ✅ COMPLETE
- [x] Test discovery and execution
- [x] Test isolation enforcement
- [x] DelegationProxy pattern
- [x] Base test classes (ONCETestCase)
- [x] External scenario pattern

### Phase 2: Scenario Migration (In Progress)
- [x] Test01: External scenario ✅
- [ ] Test02-15: Convert to external scenarios
- [ ] Documentation and examples

### Phase 3: Quality Oracle (Future)
- [ ] Oracle base class
- [ ] Pattern recognition
- [ ] Learning algorithms
- [ ] Consciousness levels
- [ ] Wisdom accumulation

### Phase 4: Evidence System (Future)
- [ ] Evidence collection during execution
- [ ] Evidence storage structure
- [ ] Evidence archaeology tools
- [ ] Evidence comparison
- [ ] Historical analysis

### Phase 5: Test Hibernation (Future)
- [ ] State serialization
- [ ] State restoration
- [ ] Long-running test support
- [ ] Distributed testing

### Phase 6: Advanced Features (Future)
- [ ] Scope filtering (describe/itCase)
- [ ] Test archaeology UI
- [ ] Oracle teaching (master → apprentice)
- [ ] Distributed quality consciousness

---

## 🎓 Learning from Traditional Testing

### What Tootsie Keeps from Traditional
- ✅ Simple pass/fail (familiar)
- ✅ Exit codes (CI/CD compatible)
- ✅ Fast execution
- ✅ Clear output

### What Tootsie Improves
- ✅ Tests as objects (not functions)
- ✅ Scenarios as hibernated objects (not factories)
- ✅ Automatic test isolation (not manual mocking)
- 🔮 Quality consciousness (not just metrics)
- 🔮 Evidence trails (not just stack traces)
- 🔮 Learning capability (not static)

---

## 📚 Related Documentation

- **Main PDCA**: [Iteration 10: Tootsie Test Suite](./2025-12-02-UTC-1026.iteration-10-tootsie-test-suite-restore-0.3.21.5-capabilities.pdca.md)
- **Radical OOP Pattern**: [RADICAL-OOP-TEST-SCENARIOS.md](./RADICAL-OOP-TEST-SCENARIOS.md)
- **Iteration Complete**: [ITERATION-10-COMPLETE.md](./ITERATION-10-COMPLETE.md)
- **ONCE README**: [../README.md](../README.md)

---

## 🎯 Quick Start

```bash
# Navigate to component
cd components/ONCE/0.3.21.8

# Run a test
./once tootsie file 1

# See all tests
ls -1 test/tootsie/Test*.ts

# Run any test (1-15)
./once tootsie file 5
./once tootsie file 15
```

---

## 💡 Philosophy

> **"Testing is not about finding bugs - it's about building quality consciousness. Tests are not scripts that execute - they are objects that observe, learn, and evolve. Quality is not a metric - it's a living oracle that accumulates wisdom across time."**

In Web4, Tootsie represents the evolution from **testing as validation** to **testing as consciousness**. Every test run doesn't just produce a pass/fail - it contributes to a growing body of quality wisdom that makes future assessments more intelligent.

---

**Version**: 0.3.20.6  
**Status**: Core infrastructure complete, Vision documented  
**Ready**: For production testing TODAY  
**Future**: Quality consciousness when needed 🔮

