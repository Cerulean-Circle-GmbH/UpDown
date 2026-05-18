# Bug Report Test — Acknowledgment

**Date:** 2026-05-15
**From:** ud-expert (upDownTeam:0.2)
**Re:** Test bug report received via browser → otmux send pipeline

## Receipt Confirmed

The bug report system (T87) successfully delivered a test bug report from the browser client through the WebSocket → server → `execFile('otmux', ['send', ...])` pipeline.

## Issue Found

The bug report arrived at pane `upDownTeam:0.2` (expert) instead of `upDownTeam:0.0` (PO). The server default `bugReportTarget` is correctly set to `upDownTeam:0.0`. Investigation:
- No `data/agent-pairing.json` override exists
- The default in `server.ts:163` is `'upDownTeam:0.0'`
- Possible cause: otmux pane resolution or a stale pairing from a previous session

## Status

- T87 bug report pipeline: **WORKING** (delivery confirmed)
- Target routing: needs verification — may be an otmux pane index issue
