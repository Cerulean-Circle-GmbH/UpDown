# Solution Architect Log - Iteration 2 Task 2

**Date:** 2025-07-21

## Task 2: Outline the Main Architectural Layers

- Create a high-level description of the main architectural layers:
  - Client (browser/mobile PWA)
  - Server (game logic, lobby management, API)
  - Communication (WebSocket, P2P, REST for setup)
- Include a simple diagram or text-based outline of the architecture
- Briefly describe the responsibilities of each layer
- Note: The core API will be extremely simple. Each class can serialize itself into a "scenario"—a JSON file containing a reference to the class and an encrypted state JSON with the serialized model attributes. By loading a class, creating a default instance, and injecting its decrypted state as the model, state can be transferred between peers in the P2P system. This scenario-based API is the only required API, sending scenarios over WebSockets or HTTPS between peers.

### High-Level Architecture Outline (Draft)

- **Client Layer:**
  - Runs in browser/mobile as a PWA
  - Handles UI, user input, local state, and offline support
  - Communicates with server and peers via WebSocket/P2P
- **Server Layer:**
  - Manages game logic, lobby, player state, and anti-cheat
  - Hosts API endpoints for scenario exchange and lobby management
  - Can act as a relay for P2P connections if needed
- **Communication Layer:**
  - Uses WebSocket for real-time updates and P2P for direct peer communication
  - All state is transferred as encrypted scenario JSONs

```
[Client] <--WebSocket/P2P--> [Server/Other Clients]
```

## Next Step
- Backend Developer/Architect to identify the main components/modules for the server
