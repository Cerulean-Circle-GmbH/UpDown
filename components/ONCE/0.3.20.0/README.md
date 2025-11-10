# ONCE v0.3.20.0

**Object Network Communication Engine**

A sophisticated Web4 component for P2P communication, server hierarchy management, and scenario-based configuration with TRUE Radical OOP architecture.

## 🎯 Overview

ONCE (Object Network Communication Engine) is an enhanced Web4 component that provides:

- **Server Hierarchy** - Automatic primary (port 42777) and client (8080+) server management
- **Scenario-Based Configuration** - Zero environment variables, pure scenario-driven setup
- **Lifecycle Events** - Complete event-driven component lifecycle management
- **P2P Communication** - WebSocket-based server-to-server communication
- **TRUE Radical OOP** - Model-driven state, method chaining, auto-discovered CLI

## 📦 Installation

ONCE is a Web4TSComponent that follows the standard component architecture:

```bash
# Component is already installed at:
# components/ONCE/0.3.20.0/

# Access via symlink:
once --help

# Or via full path:
./components/ONCE/0.3.20.0/once --help
```

## 🚀 Quick Start

### Interactive Demo

Launch the full interactive demo with browser auto-opening:

```bash
once demo
```

This will:
- Start the ONCE server (primary on port 42777 or client on 8080+)
- Open your browser to http://localhost:42777
- Show all available endpoints
- Wait for Ctrl+C to stop

### Headless Server

Run the server without browser interaction:

```bash
once demo headless
```

### Automated Testing

Run automated test sequences (non-interactive):

```bash
# Simple test: start, wait 2s, show metrics, quit
once testInput "s2mq"

# With client server: start, wait, launch client, discover, quit
once testInput "s1c1dq"

# Complex: start, wait, browser, client, wait, quit
once testInput "s3bc2q"
```

## 📖 Core Concepts

### Server Hierarchy

ONCE implements a sophisticated server hierarchy:

- **Primary Server (Port 42777)**: Acts as name server/registry
  - First instance to start becomes primary
  - Maintains registry of all client servers
  - Provides `/servers` endpoint to list all instances

- **Client Servers (Port 8080+)**: Automatically register with primary
  - Subsequent instances become clients
  - Automatic port conflict resolution (8080, 8081, 8082...)
  - WebSocket connection to primary for registration

```bash
# Terminal 1: Start primary server
once startServer
# 🟢 Started as PRIMARY SERVER on port 42777

# Terminal 2: Start client server
once startServer
# 🔵 Started as CLIENT SERVER on port 8080
# ✅ Registration confirmed with primary server
```

### Scenario-Based Configuration

ONCE uses scenarios for configuration (no environment variables):

```bash
# Start with scenario file
once startServer production.scenario.json

# Scenario format:
{
  "uuid": "unique-id",
  "objectType": "ONCE",
  "version": "0.2.0.0",
  "state": { /* server configuration */ },
  "metadata": {
    "domain": "local.once",
    "host": "localhost",
    "isPrimaryServer": true
  }
}
```

Scenarios are automatically saved to organized directories:
```
scenarios/
  local.once/
    ONCE/
      0.2.0.0/
        capability/
          httpPort/
            42777/
              {uuid}.scenario.json
```

### Lifecycle Events

Subscribe to server lifecycle events:

```typescript
import { DefaultONCE } from './components/ONCE/0.3.20.0/dist/ts/layer2/DefaultONCE.js';
import { LifecycleEventType } from './components/ONCE/0.3.20.0/dist/ts/layer3/LifecycleEvents.js';

const once = new DefaultONCE();
await once.init();

// Register event handlers
once.on(LifecycleEventType.AFTER_START, (event) => {
  console.log('Server started:', event.data);
});

once.on(LifecycleEventType.SERVER_REGISTRATION, (event) => {
  console.log('Client registered:', event.data);
});

await once.startServer();
```

## 🎮 Commands

### Server Management

```bash
# Start server (automatic port management)
once startServer

# Stop server gracefully
once stopServer

# Check if primary server
once isPrimaryServer

# Get all registered servers (primary only)
once getRegisteredServers

# Get current server model
once getServerModel
```

### Demo & Testing

```bash
# Interactive demo (opens browser)
once demo

# Headless mode (server only)
once demo headless

# Browser-only mode
once demo browser-only

# Automated test sequences
once testInput "s2mq"          # Start, wait, metrics, quit
once testInput "s1c1dq"        # Start, client, discover, quit
once testInput "s3bc2q"        # Start, browser, client, quit
once testInput "s1bc1k1q"      # Full: start, browser, client, discover, kill, quit
```

#### Test Sequence Commands

| Key | Action | Description |
|-----|--------|-------------|
| `s` | Start Server | Starts primary/client server |
| `b` | Open Browser | Opens browser to server URL |
| `c` | Launch Client | Starts a client server instance |
| `d` | Discover Peers | Lists registered servers (primary only) |
| `e` | Exchange Scenarios | Scenario exchange (placeholder) |
| `m` | Show Metrics | Displays server metrics |
| `k` | Kill Processes | Stops all client servers |
| `q` | Quit | Stops all servers and exits |
| `0-9` | Wait | Waits N seconds |

### Infrastructure (Delegated to Web4TSComponent)

```bash
# Component information
once info

# Run tests
once test

# Build component
once build

# Show directory structure
once tree

# Show version symlinks
once links
```

## 🌐 Available Endpoints

When the server is running, these HTTP endpoints are available:

| Endpoint | Description |
|----------|-------------|
| `http://localhost:42777/` | Server status page (beautiful UI) |
| `http://localhost:42777/health` | JSON health check |
| `http://localhost:42777/once` | Simple ONCE browser client |
| `http://localhost:42777/servers` | List all servers (primary only) |
| `ws://localhost:42777/` | WebSocket endpoint for P2P |

## 🏗️ Architecture

### TRUE Radical OOP Pattern

ONCE follows TRUE Radical OOP principles from Web4TSComponent 0.3.20.0:

```typescript
// ✅ Empty constructor (no initialization)
constructor() {
  this.model = { uuid: crypto.randomUUID(), ... };
  this.serverHierarchyManager = new ServerHierarchyManager();
  this.scenarioManager = new ScenarioManager();
  this.discoverMethods(); // For CLI auto-discovery
}

// ✅ Model-driven state (no private state variables)
async startServer(): Promise<this> {
  await this.serverHierarchyManager.startServer();
  this.model.serverModel = this.serverHierarchyManager.getServerModel();
  return this; // Method chaining
}

// ✅ Auto-discovered CLI methods
async demo(mode: string = 'interactive'): Promise<this> {
  // Automatically becomes: once demo [mode]
  return this;
}
```

### Component Delegation

ONCE delegates CLI infrastructure to Web4TSComponent:

```typescript
// Infrastructure methods delegated (DRY principle)
async info(topic: string = 'model'): Promise<this> {
  return this.delegateToWeb4TS('info', topic);
}

async test(scope: string = 'all', ...references: string[]): Promise<this> {
  return this.delegateToWeb4TS('test', scope, ...references);
}
```

### Layer Architecture

```
layer5/  - CLI (ONCECLI.ts)
layer4/  - Utilities (Colors, Completion, TestFileParser)
layer3/  - Interfaces (ONCE, ONCEServerModel, Scenario, LifecycleEvents, IOR)
layer2/  - Implementation (DefaultONCE, ServerHierarchyManager, ScenarioManager, PortManager)
```

## 🔧 Configuration

### Dependencies

ONCE requires these packages (installed at project root for DRY):

```json
{
  "dependencies": {
    "uuid": "^11.1.0",
    "ws": "^8.14.2",
    "@types/uuid": "^10.0.0",
    "@types/ws": "^8.5.8"
  }
}
```

### Server Configuration

Default configuration (no environment variables required):

```typescript
const ONCE_DEFAULT_CONFIG = {
  PRIMARY_PORT: 42777,           // Primary server port
  FALLBACK_PORT_START: 8080,     // Client server port start
  DEFAULT_DOMAIN: 'local.once',  // Reverse domain
  DEFAULT_IP: '127.0.0.1',       // Fallback IP
  MAX_PORT_SCAN: 100             // Max ports to scan
};
```

## 📊 Server Model

The `ONCEServerModel` contains all server state:

```typescript
interface ONCEServerModel {
  pid: number;                          // Process ID
  state: LifecycleState;                // Current lifecycle state
  platform: EnvironmentInfo;            // Platform/environment info
  domain: string;                       // Reverse domain (e.g., "local.once")
  host: string;                         // Hostname
  ip: string;                           // IP address
  capabilities: ServerCapability[];     // Server capabilities with ports
  uuid: string;                         // Unique server ID
  isPrimaryServer: boolean;             // Primary vs client flag
  primaryServerIOR?: string;            // Primary server reference (clients only)
}
```

## 🧪 Testing

### Regression Tests

Run the component test suite:

```bash
# Run all tests
once test

# Run specific test file
once test file 1

# Run specific describe block
once test describe 1a

# Run specific test case
once test itCase 1a1
```

### Test Scenarios

The `testInput` command provides comprehensive integration testing:

```bash
# Test server startup and metrics
once testInput "s2mq"

# Test client server registration
once testInput "s1c1dq"

# Test browser opening
once testInput "s3bq"

# Stress test with multiple clients
once testInput "s1ccc1d1k1q"
```

## 🎯 Use Cases

### 1. Development Server

Start a development server with automatic browser opening:

```bash
once demo
```

### 2. Production Server

Run headless server for production:

```bash
once demo headless
```

### 3. Distributed System

Create a server hierarchy with multiple instances:

```bash
# Terminal 1: Primary server
once startServer

# Terminal 2-N: Client servers (auto-register)
once startServer
once startServer
once startServer

# Check registered servers on primary
once getRegisteredServers
```

### 4. Automated Testing

Use test sequences for CI/CD pipelines:

```bash
# Quick smoke test
once testInput "s1mq"

# Full integration test
once testInput "s1c1d1k1q"
```

### 5. P2P Communication

Connect multiple ONCE instances for scenario exchange:

```bash
# Instance 1
once startServer

# Instance 2
once startServer  # Auto-registers with primary

# Exchange scenarios (via WebSocket)
once testInput "s1c1e1q"
```

## 📚 API Reference

### ONCE Interface

```typescript
interface ONCE {
  // Initialization
  init(scenario?: Scenario): Promise<ONCE>;
  
  // Server Management
  startServer(scenario?: Scenario): Promise<void>;
  stopServer(): Promise<void>;
  isPrimaryServer(): boolean;
  getServerModel(): ONCEServerModel;
  getRegisteredServers(): ONCEServerModel[];
  
  // Lifecycle Events
  on(eventType: LifecycleEventType, handler: LifecycleEventHandler): void;
  off(eventType: LifecycleEventType, handler: LifecycleEventHandler): void;
  
  // Component Management
  startComponent(componentIOR: IOR, scenario?: Scenario): Promise<Component>;
  stopComponent(component: Component): Promise<void>;
  pauseComponent(component: Component): Promise<void>;
  resumeComponent(component: Component): Promise<void>;
  
  // Scenario Management
  toScenario(): Scenario;
  loadScenario(scenario: Scenario): Promise<Component>;
  saveAsScenario(component: Component): Promise<Scenario>;
  
  // Environment & Metrics
  getEnvironment(): EnvironmentInfo;
  getMetrics(): PerformanceMetrics;
  getVersion(): string;
  isInitialized(): boolean;
  
  // Demo Commands (CLI-specific)
  demo(mode?: string): Promise<this>;
  testInput(sequence: string): Promise<this>;
}
```

## 🔄 Migration from 0.2.0.0

ONCE 0.3.20.0 maintains 100% feature parity with 0.2.0.0 while adding TRUE Radical OOP:

### What's Preserved

✅ All server hierarchy logic (primary/client, port management)  
✅ All scenario management functionality  
✅ All lifecycle events and hooks  
✅ WebSocket communication  
✅ Server registry and discovery  

### What's Enhanced

✨ TRUE Radical OOP architecture (model-driven state)  
✨ CLI auto-discovery (methods become commands automatically)  
✨ `demo` command (interactive/headless modes)  
✨ `testInput` command (automated test sequences)  
✨ Parameter completion methods  
✨ Cross-platform browser opening  
✨ Delegated infrastructure methods (info, test, build, tree, links)  

### Breaking Changes

**None!** 0.3.20.0 is a drop-in replacement for 0.2.0.0.

## 🤝 Contributing

ONCE follows Web4 component development practices:

1. All changes should maintain TRUE Radical OOP principles
2. New methods are automatically discovered as CLI commands
3. Use PDCA documents for tracking changes
4. Follow CMM3 commit protocols (commit after each change)
5. Update README for new features

## 📝 Version History

### 0.3.20.0 (2025-11-10)

- ✅ Migrated to TRUE Radical OOP from Web4TSComponent 0.3.20.0
- ✅ Added `demo()` command with interactive/headless modes
- ✅ Added `testInput()` command for automated test sequences
- ✅ Added parameter completion methods
- ✅ Preserved all 0.2.0.0 domain logic
- ✅ Delegated CLI infrastructure to Web4TSComponent

### 0.2.0.0 (Previous)

- Server hierarchy (primary/client architecture)
- Scenario-based configuration
- Lifecycle events
- WebSocket communication
- Port conflict resolution

## 🔗 Related Components

- **Web4TSComponent** - Base component infrastructure (CLI, testing, building)
- **User** - User service for scenario owner data
- **Message** - P2P messaging (future integration)

## 📄 License

MIT

## 🏢 Organization

**Cerulean Circle GmbH**

For more information, visit: https://github.com/Cerulean-Circle-GmbH/Web4Articles

---

**ONCE v0.3.20.0** - Object Network Communication Engine  
*TRUE Radical OOP • Auto-Discovered CLI • Server Hierarchy • Zero Configuration*

