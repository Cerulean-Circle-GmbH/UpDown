# Context Quality Gate

## Intention
This module provides a formalized process quality gate for the Scrum Master (SM) and all roles in the UpDown project. It enables explicit context management, verification, and alignment before handing over to QA User or moving to the next process step.

## Description
The Context Quality Gate is a set of classes and tests that:
- Represent the current process context as a structured bean (ContextBean).
- Allow the SM to populate all relevant fields (role, task, dependencies, user feedback, process rules, etc.).
- Provide a test class (ContextQualityGateTest) that verifies all required fields and rules are satisfied (definition of done for the context).
- Can be called at any point in the workflow to check alignment, completeness, and readiness for QA handover.
- Enable hot recovery and continuous reminders of process rules, reducing reliance on implicit context and manual reminders.
- Are easily extensible for future process improvements (CMM4).

## Architecture Overview
- `ContextBean.java`: Holds all context fields relevant to the current process state.
- `ContextQualityGateTest.java`: Receives a ContextBean, runs checks, and returns pass/fail and feedback.
- Usage: The SM instantiates ContextBean, populates it, and calls ContextQualityGateTest before returning to QA or moving to the next step.

## Example Workflow
1. SM starts a process loop, instantiates ContextBean, and populates fields.
2. Before returning to QA, SM calls ContextQualityGateTest with the bean.
3. Test runs, verifies all required fields, and provides feedback.
4. If all checks pass, SM proceeds. If not, SM iterates and updates context.

## Next Steps
- See `ContextBean.java` and `ContextQualityGateTest.java` for implementation details and usage.
