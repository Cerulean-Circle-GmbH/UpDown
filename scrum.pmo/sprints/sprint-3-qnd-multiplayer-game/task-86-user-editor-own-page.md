[Back to Sprint 3 Planning](./planning.md)

# Task 86: User Editor — Own Page + Device List + Friend Invite via 4-Digit Code

## Status
- [x] Planned
- [x] Architect Analysis
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Tron Requirements

### A. User Editor as Own Page (not overlay)
Current: profile editor is an overlay panel in lobby.
Required: Navigate to a dedicated user page (e.g. `/profile`). Back button returns to lobby.
- Full-page layout with user info, editable fields
- List of devices the user has used (from PlayerProfile.devices[])
- Each device shows: device name/type, UUID, last seen timestamp

### B. Secret 4-Digit Code per User
Each user gets a secret 4-digit code (generated on profile creation, stored in PlayerProfile).
- Displayed on the user's profile page
- Used for friend invite / user consolidation (see below)
- Code is persistent (saved in profiles.json)

### C. "Invite Friends" / Consolidate Users Button in Room
In a game room, add a button "Invite Friends" (or "Consolidate Users").
When pressed:
1. Prompt asks for the other user's 4-digit code
2. If code matches another user's profile:
   - The other user's devices are added to the current user's device list
   - Users are "consolidated" — same identity across devices
3. If code doesn't match: show error

### D. Identifiers
- Users identified via UUID (playerToken in localStorage)
- Devices identified via UUID (device fingerprint or generated ID)
- Both stored in PlayerProfile

## Architect Analysis (2026-05-14)

### 1. Data Model — PlayerProfile Extensions

Current PlayerProfile (server.ts:115-130) has 14 fields. Add 3 new fields:

```typescript
interface PlayerProfile {
  // Existing 14 fields unchanged...
  
  secretCode: string;        // 4-digit "7294", generated on creation, unique
  consolidatedFrom: string[]; // tokens of merged profiles (audit trail)
  redirectTo?: string;       // if set, this profile was merged into another
}
```

**secretCode generation** (on profile creation, server.ts:788):
```typescript
secretCode: generateUniqueCode()  // 1000-9999, retry on collision
```

**secretCode locations (CORRECTED per bug-report-20260515-001):**
- **User Editor (lobby edit panel):** secret code is EDITABLE here — input field to change code
- **/profile page:** secret code is DISPLAY ONLY (read-only, shown but not editable)
- **Auto-preinit:** preset with random 4-digit on profile creation (already works)
- Server: handle UPDATE_SECRET_CODE message → validate unique → save

**DeviceInfo needs UUID** — current matching by `userAgent + ip` (line 796) is fragile. Add `deviceId`:
```typescript
interface DeviceInfo {
  deviceId: string;   // NEW — UUID from client localStorage('updown-device-id')
  // ...existing fields unchanged
}
```
Client generates `crypto.randomUUID()` on first visit, stores in localStorage, sends on REGISTER_PROFILE. Server matches by `deviceId` first, falls back to UA+IP for legacy devices.

### 2. Consolidation Logic

**Flow:** User B enters User A's 4-digit code → User A's profile absorbed into User B.

**Requester = primary.** User B (who enters the code) keeps their profile. User A's data merges in.

**Stats merge rules:**

| Field | Rule |
|-------|------|
| gamesPlayed, wins, totalScore, totalDiamonds | A + B (additive) |
| bestScore, bestStreak | max(A, B) |
| bestRank | min(A, B) — lower rank = better |
| devices | concatenate, dedup by deviceId |
| name, avatar, secretCode | keep requester's (B) |
| lastPlayed | most recent of A, B |

**After merge:**
- User A's profile NOT deleted — set `redirectTo = B.token`
- When A connects with old token → server sends `TOKEN_REDIRECT { newToken }` → client updates localStorage
- This avoids "new profile created" bug when A reconnects

### 3. API — WebSocket Message (not HTTP)

Consistent with existing message pattern (no REST endpoints for game actions):

```typescript
// Client → Server
{ type: 'CONSOLIDATE', friendCode: '7294' }

// Server → Client (success)
{ type: 'CONSOLIDATE_OK', mergedDevices: number, mergedGames: number }

// Server → Client (error)  
{ type: 'CONSOLIDATE_FAILED', reason: 'Code not found' | 'Cannot consolidate with yourself' | 'Already consolidated' }

// Server → Client (on connect with merged token)
{ type: 'TOKEN_REDIRECT', newToken: 'uuid-of-primary-profile' }
```

**Server CONSOLIDATE handler (~40 lines):**
1. Find profile where `secretCode === msg.friendCode`
2. Validate: not self, not already redirected, friend not already consolidated
3. Merge stats (rules above)
4. Move friend's devices into requester's device list
5. Set friend's `redirectTo = requester.token`
6. Add friend's token to requester's `consolidatedFrom[]`
7. saveProfiles()

### 4. Device UUID Generation

**Client (WebSocketClient.ts):**
```typescript
const deviceId = localStorage.getItem('updown-device-id') || (() => {
  const id = crypto.randomUUID();
  localStorage.setItem('updown-device-id', id);
  return id;
})();
```
Sent on REGISTER_PROFILE message alongside existing userAgent/screenSize/platform.

**Server matching (server.ts:796):** Change from `d.userAgent === ua && d.ip === ip` to:
```typescript
const existing = profile.devices.find(d => d.deviceId === msg.deviceId)
  || profile.devices.find(d => d.userAgent === ua && d.ip === ip); // legacy fallback
```

### 5. Files to Modify

| File | Change | Lines |
|------|--------|-------|
| server.ts:115 | Add secretCode, consolidatedFrom, redirectTo to PlayerProfile | ~3 |
| server.ts:106 | Add deviceId to DeviceInfo | ~1 |
| server.ts:788 | Generate unique secretCode on creation | ~10 |
| server.ts:796 | Device matching by deviceId first | ~3 |
| server.ts (new) | CONSOLIDATE handler | ~40 |
| server.ts (new) | TOKEN_REDIRECT on connect with old token | ~10 |
| WebSocketClient.ts | Generate/send deviceId | ~5 |
| WebSocketClient.ts | Handle TOKEN_REDIRECT | ~5 |
| New: profile page | /profile route with device list + code display | ~80 |
| MultiplayerUI.ts | "Add Friend" button → code prompt → CONSOLIDATE | ~20 |
| MessageTypes.ts | Add 4 new message types | ~4 |
| **Total** | | **~180** |

### 6. Edge Cases

| Case | Handling |
|------|---------|
| Two users enter each other's code simultaneously | First to complete wins; second gets "Already consolidated" |
| Consolidate with a profile that was already merged | Follow `redirectTo` chain to find actual primary |
| 4-digit collision on creation | Regenerate until unique (9000 possible codes, fine for QnD scale) |
| User A reconnects after merge | TOKEN_REDIRECT sent, client updates localStorage |
| Leaderboard after merge | Only primary profile appears (redirected profiles filtered out) |

## Acceptance Criteria
- [ ] User editor is a full page at /profile, not an overlay
- [ ] Shows list of user's devices with UUID and last seen
- [ ] 4-digit secret code displayed on profile page
- [ ] "Invite Friends" button in game room
- [ ] Entering correct 4-digit code consolidates users (merges device lists)
- [ ] Entering wrong code shows error
- [ ] Consolidated data persists in profiles.json
- [ ] Back button returns to lobby
- [ ] Vitest passes
