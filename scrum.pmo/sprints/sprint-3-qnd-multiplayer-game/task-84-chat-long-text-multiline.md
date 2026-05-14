[Back to Sprint 3 Planning](./planning.md)

# Task 84: Chat Long Text Test — Use Lorem Ipsum with Multiline Breaks

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Description
The chat test for long text currently uses a short test string. Replace with a proper lorem ipsum text that includes multiline line breaks to verify:
- Long text wrapping in chat bubbles
- Line break preservation
- Scroll behavior with large messages
- No UI overflow or clipping

## Acceptance Criteria
- [ ] Chat test uses multi-paragraph lorem ipsum (at least 3 lines with line breaks)
- [ ] Line breaks render correctly in chat bubbles
- [ ] Long text wraps properly without overflow
- [ ] Chat scrolls to show full message
- [ ] Vitest passes
