[Back to Sprint 3 Planning](./planning.md)

# Task 50: BUG — Header Lost Rounded Corners on iPhone

## Status
- [x] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Problem
Header has rounded corners on Mac Chrome desktop but lost them on iPhone. Likely a Safari/WebKit-specific CSS issue — possibly overflow:hidden on #app not clipping the header on iOS, or border-radius not applying in standalone/PWA mode.

## Debug
1. Check if #app overflow:hidden works on iOS Safari (may need -webkit-overflow-scrolling)
2. Check if .game-header border-radius: 20px 20px 0 0 is applied on iOS
3. Check if PWA standalone mode overrides border-radius
4. Check safe-area-inset interaction with border-radius
5. May need explicit border-radius on .game-header for iOS instead of relying on parent overflow clip

## Acceptance Criteria
- [ ] Header has rounded top corners on iPhone Safari
- [ ] Header has rounded top corners in iPhone PWA mode
- [ ] Desktop Chrome still has rounded corners (no regression)
- [ ] Rebuilt with esbuild
