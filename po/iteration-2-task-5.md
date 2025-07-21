# Full Stack Developer / API Designer Log - Iteration 2 Task 5

**Date:** 2025-07-21

## Task 5: Specify Initial Data Models and Interfaces for Client-Server Communication

- **Player:** Unique ID, name, score, streak, hand, status, etc.
- **Game State:** Current round, cards in play, player list, lobby state, etc.
- **Lobby:** Lobby ID, host, player list, settings, status.
- **Card:** Suit, value, type (up/down/even/special), owner.
- **Message/Event Types:** Scenario JSONs for state sync, join/leave, play card, chat, error, etc.
- **API Interfaces:**
  - Client-to-server: Send scenario (join, play, chat)
  - Server-to-client: Broadcast scenario (state update, error, lobby update)
  - P2P: Scenario sync between clients
- **Protocols:** WebSocket for real-time, HTTPS for initial setup or fallback

## Next Step
- Tech Lead/Architect to document the technology stack and libraries for each layer/component
