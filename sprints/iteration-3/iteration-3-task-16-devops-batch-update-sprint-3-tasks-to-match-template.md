[← Back to Sprint 3 Planning](./planning.md)

# Iteration-3-Task-16-DevOps-Batch-Update-Sprint-3-Tasks-To-Match-Template.md

## Intention
- Ensure all sprint 3 task and subtask markdown files are updated to match the latest template improvements for headlines, backlinks, QA audit, and process compliance.
- For every batch-updated task, compare all headlines and sections with the template (see `iteration-n-task-1-analyze-devcontainer-requirements-and-tech-stack.md`).
- All headlines from the template must be present and filled with relevant content in each task file (e.g., Intention, Steps, Tech Stack Rationale, Status, Context, Next Steps, User Feedback, Subtasks, QA Audit & Traceability).
- Any missing headlines or sections must be added and completed with appropriate information.

## Steps
1. Compare each sprint 3 task and subtask file headline and section to the corresponding template headline and section in `iteration-n-task-1-analyze-devcontainer-requirements-and-tech-stack.md`.
2. For each file, update:
   - Headline format and naming convention (use: Iteration-3-Task-[number]-[role]-[short-description].md).
   - Ensure all template headlines and sections (Intention, Steps, Tech Stack Rationale, Status, Context, Next Steps, User Feedback, Subtasks, QA Audit & Traceability) are present and filled with relevant content.
   - Backlink placement (top and bottom as in template).
   - QA Audit & Traceability section.
   - Subtask/parent task references.
   - Any new process or compliance instructions from the template.
3. Batch process all files:
   - Use shell commands and markdown edits for renaming, moving, and updating content.
   - Remove duplicates and verify file existence before renaming.
   - Update all links in planning.md and between tasks/subtasks.
   - Document every change in the QA audit file for sprint 3.
4. After batch update, review all files for consistency and traceability.
5. Cross-reference all changes in planning.md, QA audit, and process documentation.

## Acceptance Criteria
- All sprint 3 task and subtask files match the template structure and content for headlines, backlinks, QA audit, and references.
- All filenames follow the pattern: Iteration-3-Task-[number]-[role]-[short-description].md
- No content loss or broken links.
- All changes are documented in the QA audit and planning.md.
- Process improvements are reflected in the master process.md and role-specific process files.

## Next Steps
- Assign to Scrum Master and QA for batch update and review.
- Document results and lessons learned in the QA audit and process.md.

## QA Audit & User Feedback
2025-07-31 UTC: Status Update: Phase is planning and iterating on Task 16. Tasks 1 and 6 have been fixed manually by the QA user. Tasks 2 and 3 are pending restoration with correct Intention and Task Description. Batch update will continue with Task 4 after 2 and 3 are restored. This status is reflected in daily.md and planning.md.
2025-07-31 UTC: QA Feedback: Agent failed to apply the correct patch for Task 6. The user manually restored headline order, status, intention, and steps to match the template. Lesson learned: Always verify patch results and compare with user edits before continuing batch updates. If technical errors prevent automated fixes, notify QA and provide the correct structure for manual review.
2025-07-31 UTC: QA Feedback: Status and Steps were previously mixed up, and Intention was lost in Task 6. The correct template order is: Task Description, Status, Context, Intention, Steps. Always restore this order and content. If technical errors prevent automated fixes, notify QA and provide the correct structure for manual review.
2025-07-31 UTC: QA Feedback: Previous edits to Task 6 wrongly deleted the Steps section and duplicated the Task Description headline. Always follow the template headline order: Task Description, Status, Context, Intention, Steps. Only make minimal changes and never delete major content without QA approval. Notify QA before any large deletion or replacement. Fixes applied: Steps restored, duplicate headline removed, headline order corrected.
2025-07-31 UTC: General Note: Before deleting or replacing large sections of content, always ask the QA user for approval. This prevents accidental loss of important information and ensures traceability.

- Task Description section was missing and has now been restored to all batch-updated tasks. PO provides the description, context is for the role, intention is double-checked by PO. This pattern is now required for all future batch updates.

---

[← Back to Sprint 3 Planning](./planning.md)
