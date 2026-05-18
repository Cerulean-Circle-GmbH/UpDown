[Back to Sprint 3 Planning](./planning.md)

# Task 88: Device Connection Status Indicator on /profile

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [x] Done

## Description
Devices listed on /profile page should show connection status — same color coding as game chat:
- 🟢 Green — currently connected (active WebSocket)
- 🟠 Orange — recently seen (disconnected within last few minutes)
- 🔴 Red — offline (not connected)

## Implementation
- Every device MUST have a UUID (deviceId in DeviceInfo). Client generates `crypto.randomUUID()` on first visit, stores in `localStorage('updown-device-id')`, sends on every connection. If any device in the profile is missing a deviceId, backfill with a generated one.
- Server knows which devices are connected via active WebSocket connections
- Match connected client deviceIds against profile's device list
- When rendering /profile HTML, annotate each device with status dot + show deviceId
- Status determined at render time (server-side)

## Device UUID Prerequisite
- [ ] Verify ALL devices in profiles.json have a deviceId UUID
- [ ] Backfill any missing deviceIds on loadProfiles() (like secretCode backfill)
- [ ] Client always sends deviceId on connect/REGISTER_PROFILE
- [ ] /profile shows deviceId per device

## Acceptance Criteria
- [ ] Each device on /profile shows green/orange/red status dot
- [ ] Green = active WebSocket connection from that device
- [ ] Red = no active connection
- [ ] Orange = recently disconnected (optional — if too complex, just green/red)
- [ ] Vitest passes
