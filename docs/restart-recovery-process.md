# Restart & Recovery Process Documentation

## Overview
This document uniquely defines the restart and recovery process for all roles, following CMM Level 3+ principles with no ambiguities.

## Recovery Steps (2025-08-01)
All restart and recovery steps must:
- Reference the latest QA feedback and user prompts from the current active task file (not user.captured.prompts.md).
- Always start recovery by reading README.md, scrum-master/process.md, the current sprint's planning.md, sprints/iteration-3/daily.md, and relevant role/task files.
- When switching roles, always read the corresponding role's process.md file to refresh on role-specific practices and requirements before executing any tasks.
- Update planning.md and sprints/iteration-3/daily.md with the last successful role and task after a failure or restart.
- Prompt the user for feedback before executing new tasks, especially after planning with the PO.
- Document all new QA feedback and process changes in the current active task file under the section `## QA Audit & User Feedback`.
- Only execute tasks after user feedback is incorporated and the PO's plan is up to date.

## Cross-References
These steps must be cross-referenced in restart.md and all relevant process files for traceability and compliance.

## References
- `restart.md` - Main recovery guide
- `scrum-master/process.md` - Authoritative process for recovery and orchestration
- `sprints/iteration-3/planning.md` - Current sprint status
- `sprints/iteration-3/daily.md` - Daily status and next steps 