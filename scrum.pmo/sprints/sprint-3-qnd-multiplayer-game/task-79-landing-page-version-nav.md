[Back to Sprint 3 Planning](./planning.md)

# Task 79: Version Display + Project Navigation on All Pages

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Description

### Version Display (on ALL 4 pages)
Version+branch shown on index.html, index-js.html, index-ts.html, multiplayer.html.

### Version Click → Project Nav (EXACTLY these 4 links)
Clicking the version opens a panel/page with exactly these 4 items:
1. **📋 Spec** → renders `qnd/docs/spec.md` as HTML (or README.md if no spec exists)
2. **📖 Docs** → renders `qnd/docs/` index (game-rules.md, special-cards.md, multiplayer.md)
3. **🗂 Sprint Planning** → renders `scrum.pmo/sprints/sprint-3-qnd-multiplayer-game/planning.md` as HTML
4. **🐛 Bug Report** → placeholder "not yet implemented"

**NO other links under version click.** No game mode links here.

### Markdown Rendering
Server route `/docs/*` renders any .md file under the project as HTML using `marked` library. Relative links within .md files must work for navigation (planning.md → task files).

### What to REMOVE
- ❌ The 4-link game-mode footer bar in the lobby — this was a misunderstanding, REMOVE IT

### Button Layout (header)
- 🏠 home button → navigates to /
- ⛶ fullscreen button
- Both must have distinct tap targets, no overlap (min 36x36px each, gap between them)

## Acceptance Criteria
- [ ] Version+branch visible on ALL 4 pages
- [ ] Version CLICKABLE → shows EXACTLY: Spec, Docs, Sprint Planning, Bug Report
- [ ] Spec/Docs/Sprint links render .md as HTML via marked
- [ ] Bug Report shows "not yet implemented" placeholder
- [ ] 4-link footer bar REMOVED from lobby
- [ ] 🏠 and ⛶ buttons have distinct tap targets, no overlap
- [ ] Relative links in rendered markdown work (planning → task files)
