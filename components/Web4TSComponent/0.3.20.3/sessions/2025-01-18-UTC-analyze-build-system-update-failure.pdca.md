# PDCA: Analyze Build System Update Failure - Seamless Start Requirement

**📎 Previous PDCA:** [2025-01-XX-UTC-optimize-shell-scripts-eliminate-dry.pdca.md](./2025-01-XX-UTC-optimize-shell-scripts-eliminate-dry.pdca.md)

**📅 Created:** 2025-01-18 UTC  
**🔧 Component:** Web4TSComponent v0.3.20.3  
**📂 Session:** components/Web4TSComponent/0.3.20.3/sessions/

---

## **📋 PLAN**

### **Objective**
Analyze why `updateBuildSystem()` did not work for ONCE component, identify root cause, and implement solution for seamless component start without missing dependency errors (ERR_MODULE_NOT_FOUND: Cannot find package 'ws').

### **Problem Statement**
1. **Symptom:** ONCE component fails to start with `ERR_MODULE_NOT_FOUND: Cannot find package 'ws'`
2. **Expected:** Component should automatically verify and install dependencies before execution
3. **Actual:** Component uses old-style `start.sh` with hardcoded paths, no dependency verification
4. **Impact:** Components cannot start seamlessly - manual intervention required

### **Root Cause Analysis**
**Investigation Findings:**
- ✅ `updateBuildSystem()` method exists and is correctly implemented
- ✅ Shared libraries (`lib-component-start.sh`, `verify-deps.sh`) exist in templates
- ❌ ONCE 0.3.20.5 was **never updated** with `updateBuildSystem()`
- ❌ `start.sh` still contains old hardcoded paths (`../../..`)
- ❌ Missing shared libraries in component (`lib-component-start.sh`, `verify-deps.sh`)
- ❌ No dependency verification before execution

**Root Cause:**
- `updateBuildSystem()` requires explicit invocation: `web4tscomponent on <component> <version> updateBuildSystem`
- **CRITICAL:** Old-style `start.sh` does NOT call `lib-component-start.sh` - it contains hardcoded logic
- When old `start.sh` runs, it never reaches the shared library (doesn't exist, not called)
- No automatic detection or update mechanism in `start.sh` itself
- Manual process required - not seamless
- **Specific Issue:** ONCE 0.3.20.5 `start.sh` line 12: `[ ! -d "../../.." ]` (hardcoded path, no shared library)

### **Solution Design**

**CMM3 Checklist 1f Compliance:**
- ✅ **Plan:** Document problem, root cause, solution
- ⏳ **Do:** Implement automatic update detection and seamless start
- ⏳ **Check:** Verify components start without errors
- ⏳ **Act:** Commit and push after verification

**Solution Approach:**
1. **Auto-Update Detection in start.sh:** Add detection logic at the BEGINNING of `start.sh` to check if it's old-style
2. **Self-Healing start.sh:** If old-style detected, automatically call `updateBuildSystem()` via Web4TSComponent CLI
3. **Dependency Verification:** Ensure `verify-deps.sh` runs before execution (already in lib-component-start.sh)
4. **Seamless Start:** Component auto-updates itself on first start, then uses optimized scripts

**Implementation Strategy:**
- Add detection logic at top of `start.sh` template (before any execution)
- Check for old-style patterns: hardcoded `../../..`, missing `lib-component-start.sh` reference
- If old-style detected: Call `web4tscomponent on <component> <version> updateBuildSystem` automatically
- Re-execute `start.sh` after update to use new optimized scripts
- Provide clear feedback about auto-update actions

---

## **🔨 DO (Implementation)**

### **Step 1: Analyze Current State**
- [x] Verify ONCE 0.3.20.5 has old-style `start.sh`
- [x] Confirm missing shared libraries
- [x] Document root cause

### **Step 2: Design Auto-Update Mechanism**
- [ ] Add detection logic for old-style `start.sh`
- [ ] Implement auto-update in `lib-component-start.sh`
- [ ] Ensure backward compatibility

### **Step 3: Enhance Dependency Verification**
- [ ] Ensure `verify-deps.sh` runs before execution
- [ ] Add automatic `npm install` if dependencies missing
- [ ] Provide clear feedback

### **Step 4: Test Seamless Start**
- [ ] Test with old component (ONCE 0.3.20.5)
- [ ] Verify auto-update works
- [ ] Confirm component starts without errors

---

## **✅ CHECK**

### **CMM3 Verification Criteria**

**Objective:**
- [ ] Old components automatically detected and updated
- [ ] Components start seamlessly without missing dependency errors
- [ ] No manual intervention required
- [ ] Clear feedback provided during auto-update

**Reproducible:**
- [ ] Automated test: Old component auto-updates on start
- [ ] Automated test: Component starts without ERR_MODULE_NOT_FOUND
- [ ] Automated test: Dependency verification works correctly
- [ ] Manual test: `once start` works without errors

**Verifiable:**
- [ ] Test script runs and passes
- [ ] ONCE component starts successfully: `once start` → no errors
- [ ] Old component auto-updated: Check `start.sh` uses shared library
- [ ] Dependencies verified: `verify-deps.sh` runs before execution

---

## **🎯 ACT**

### **Actions Taken**
- [ ] Implemented auto-update detection
- [ ] Enhanced `lib-component-start.sh` with auto-update logic
- [ ] Tested with ONCE component
- [ ] Verified seamless start works

### **Lessons Learned**
- **Issue:** Manual `updateBuildSystem()` invocation required - not seamless
- **Solution:** Auto-detect and update old components on start
- **Prevention:** Future components use optimized scripts from creation

### **Next Steps**
- [ ] Update PDCA with implementation details
- [ ] Commit and push changes (CMM3 checklist 1f)
- [ ] Verify all old components can be updated seamlessly

---

## **📊 Status**

**Current Phase:** PLAN → DO  
**Next Action:** Implement auto-update detection in `lib-component-start.sh`

---

_Never 2 1 (TO ONE). Always 4 2 (FOR TWO)._

