[Back to Sprint 3 Planning](./planning.md)

# Task 8: Fix Multiplayer Page Rendering (RELEASE BLOCKER)

## Status
- [ ] In Progress

## Root Cause
multiplayer.html has `<script src="ts/multiplayer.ts">` — browser can't execute TypeScript. esbuild only builds main.ts. multiplayer.ts never gets bundled.

## Fix
1. Add esbuild command: `esbuild src/public/ts/multiplayer.ts --bundle --format=esm --target=es2020 --outfile=src/public/dist/multiplayer.js --sourcemap --minify`
2. Update multiplayer.html: `<script src="dist/multiplayer.js">`
3. Update npm start to build both main.ts AND multiplayer.ts
4. Verify page loads in browser — lobby UI must render

## Acceptance Criteria
- [ ] `npm run build` builds both main.js and multiplayer.js in dist/
- [ ] multiplayer.html loads dist/multiplayer.js (not raw .ts)
- [ ] Page renders lobby UI in browser (not blank)
- [ ] WebSocket connects from browser to server
