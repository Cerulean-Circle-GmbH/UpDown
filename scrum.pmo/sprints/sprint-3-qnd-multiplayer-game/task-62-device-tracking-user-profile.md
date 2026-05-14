[Back to Sprint 3 Planning](./planning.md)

# Task 62: Device Tracking in User Profile

## Status
- [x] Planned
- [ ] Architect Spec
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Requirement (Tron)
Capture from WebSocket connections the devices a user uses to connect. Link them to the user profile. Build a device history per player identity.

## Architect Must Specify
1. What device info can we extract from WebSocket connection?
   - User-Agent string (browser, OS, device type)
   - IP address
   - Screen resolution (client-side, sent on connect)
   - Connection timestamp
   - Device fingerprint (optional — canvas/audio fingerprinting)

2. Data model: how to store device history per player token
   ```typescript
   interface DeviceInfo {
     userAgent: string;
     ip: string;
     screenSize?: string;
     firstSeen: string;
     lastSeen: string;
     connectionCount: number;
   }
   
   interface PlayerProfile {
     token: string;
     name: string;
     avatar: string;
     phone?: string;
     url?: string;
     devices: DeviceInfo[];
   }
   ```

3. Storage: in-memory map (lost on restart) vs JSON file persistence vs SQLite

4. Where to display: player profile popup shows device list?

## Subtasks
- [ ] 62.1: Architect — Spec device info extraction + data model + storage decision
- [ ] 62.2: Expert — Client: send device info (userAgent, screenSize) on connect
- [ ] 62.3: Expert — Server: capture device info, link to playerToken, store in profile
- [ ] 62.4: Expert — Server: persist profiles to JSON file (survives restart)
- [ ] 62.5: Expert — Client: show device list in player profile popup
- [ ] 62.6: Tester — Verify device captured from different browsers/devices

## Acceptance Criteria
- [ ] Each WebSocket connection captures device info (UA, IP, screen)
- [ ] Device info linked to player token in server-side profile
- [ ] Multiple devices per player tracked (e.g. phone + desktop)
- [ ] Device history visible in player profile popup
- [ ] Profile data persists across server restarts (JSON file)
- [ ] Rebuilt with esbuild + server restarted
