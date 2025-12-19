# **Improvement: PDCA Automation — Agent Self-Discipline**

**Date**: 2025-12-19  
**Author**: AI Assistant (Claude Opus 4.5) + TRON  
**Type**: Process Improvement / Retrospective  
**Root Cause**: Agent repeatedly failed to perform automatic PDCA hygiene tasks

---

## **🔴 THE PROBLEM**

Over 5 consecutive prompts, TRON had to manually trigger tasks that should have been performed **automatically** by the agent:

| Prompt | What TRON Had to Request Manually |
|--------|-----------------------------------|
| 1 | "Review the PDCA and ensure it's 100% complete" |
| 2 | "Review the other two PDCAs the same way" |
| 3 | "Pull out what was deferred to the backlog" |
| 4 | "Review I.13 for completion and update accordingly" |
| 5 | "Write this improvement document" |

**All of these are described in `howto.fractal.pdca.md` as tasks to be done lazily from prompt to prompt.**

---

## **📋 WHAT SHOULD HAPPEN AUTOMATICALLY**

Per [§/howto.fractal.pdca.md](../../../../../Web4Articles/scrum.pmo/roles/_shared/howto.fractal.pdca.md):

### **After EVERY Prompt That Makes Changes:**

1. **CHECK Phase Verification**
   - [ ] All task checkboxes updated (`[ ]` → `[x]`)
   - [ ] Success criteria verified
   - [ ] Tests run if applicable

2. **PDCA Stack Update**
   - [ ] Fractal stack reflects current state
   - [ ] Completed items marked `✅`
   - [ ] `🔵 CURRENT →` pointer moved to next item

3. **Backlog Extraction**
   - [ ] Deferred items extracted from completed PDCAs
   - [ ] Added to tracking PDCA backlog section
   - [ ] Linked back to source PDCA

4. **Git Protocol**
   - [ ] `git add .`
   - [ ] `git commit -m "PDCAfilename.pdca.md"`
   - [ ] `git push`
   - [ ] Verify clean state: `git status`

5. **Dual Links**
   - [ ] All PDCA references include GitHub + local links
   - [ ] Links are clickable (not inside code blocks)

---

## **🔍 ROOT CAUSE ANALYSIS**

### **Why This Keeps Happening:**

1. **Context Window Decay**: As conversation grows, earlier instructions fade
2. **Task Focus Tunnel Vision**: Agent focuses on the immediate request, forgetting hygiene tasks
3. **No Automatic Checklist Trigger**: Agent doesn't self-invoke the post-prompt checklist
4. **Assumption of Completion**: Agent assumes previous steps are complete without verifying

### **Pattern Observed:**

```
TRON: "Do X"
Agent: Does X
Agent: Asks "Ready for Y?"
       ↑ MISSING: CHECK, UPDATE STACK, GIT COMMIT, BACKLOG
TRON: "You forgot to do Z"
Agent: Does Z
TRON: "You also forgot W"
...repeat...
```

---

## **✅ PROPOSED SOLUTIONS**

### **Solution 1: End-of-Prompt Checklist (Agent Self-Discipline)**

**At the END of every response where changes were made, agent MUST:**

```markdown
---
### 🔄 Post-Prompt Checklist
- [ ] Checkboxes updated in affected PDCAs
- [ ] PDCA stack updated in tracking PDCA
- [ ] Deferred items extracted to backlog
- [ ] Git: add → commit → push → verify clean
- [ ] Dual links provided for all PDCAs mentioned
```

**If any item is incomplete, agent MUST complete it before asking "Ready for next?"**

---

### **Solution 2: Prompt Template Reminder**

TRON can add to the agent context or per-prompt:

```markdown
**Reminder**: After completing the task, perform the post-prompt checklist:
1. Update checkboxes in all affected PDCAs
2. Update PDCA stack in tracking PDCA
3. Extract deferred items to backlog
4. Git commit with PDCA filename
5. Provide dual links
```

---

### **Solution 3: Agent Context Addition**

Add to `agent-context.md`:

```markdown
## **🔄 MANDATORY: Post-Prompt Protocol**

After EVERY prompt that modifies files:

1. **UPDATE** all checkboxes in affected PDCAs
2. **UPDATE** fractal stack in tracking PDCA
3. **EXTRACT** deferred items to backlog (100% completion rule)
4. **COMMIT** with `git add . && git commit -m "PDCAfilename.pdca.md" && git push`
5. **VERIFY** git status shows clean state
6. **PROVIDE** dual links for all PDCAs touched

**DO NOT ask "Ready for next?" until all 6 steps are complete.**
```

---

### **Solution 4: Self-Check Before Response**

Before finalizing any response, agent asks itself:

> "Have I updated the checkboxes? Have I updated the stack? Have I committed? Have I provided dual links?"

If the answer to ANY is "no" → complete it before responding.

---

## **📊 SUCCESS METRICS**

| Metric | Current | Target |
|--------|---------|--------|
| Manual TRON reminders per session | 5+ | 0 |
| Checkboxes updated automatically | ~20% | 100% |
| Git commits performed without prompting | ~50% | 100% |
| Dual links provided | ~70% | 100% |

---

## **🎯 IMMEDIATE ACTION**

Starting from the NEXT prompt:

1. Agent will perform the post-prompt checklist automatically
2. Agent will NOT ask "Ready for next?" until checklist is complete
3. If agent forgets, TRON simply says: **"Checklist"**
4. Agent immediately performs all 6 steps

---

## **📝 LEARNING LOG ENTRY**

**L12: PDCA Hygiene is NOT Optional**

```
❌ WRONG: Complete task → Ask "Ready for next?"
✅ RIGHT: Complete task → UPDATE → EXTRACT → COMMIT → VERIFY → Then ask "Ready?"
```

**The 6-step post-prompt protocol is as mandatory as the task itself.**

---

## **🤝 Agreement**

By acknowledging this document, both parties agree:

- **Agent**: Will perform the 6-step post-prompt protocol automatically
- **TRON**: Will use "Checklist" as a one-word reminder if forgotten
- **Goal**: Zero manual reminders within 5 prompts

---

**"Discipline is the bridge between goals and accomplishment."** — Jim Rohn


