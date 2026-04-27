[Back to Sprint 1 Planning](./planning.md) | [Back to Task 8](./task-8-mdav4-ontology.md)

# Task 8.1: Architect — MDAv4/M3/CLASS/ Structure for All @web4x Classes
[subtask:uuid:d1e2f3a4-b5c6-7890-defa-800000000001]

## Status
- [x] Planned
- [x] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [Task 8: MDAv4 Ontology Structure](./task-8-mdav4-ontology.md)
    - [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000011](./requirements.md) (R11)
    - [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000012](./requirements.md) (R12)

## Complete M3 CLASS Unit Registry

Every layer2 class across all 13 components becomes an M3 CLASS unit. Key layer3 runtime classes (JsInterface, UcpModel, TypeDescriptor) and layer4 classes (IOR, FileLoader) are also included.

### Directory Structure

```
{projectRoot}/MDAv4/
├── M3/
│   ├── CLASS/
│   │   ├── °folder.unit
│   │   ├── (all class units listed below)
│   ├── RELATIONSHIP/
│   │   ├── °folder.unit
│   │   ├── extends.unit
│   │   ├── implements.unit
│   │   └── depends-on.unit
│   ├── FOLDER/
│   │   ├── °folder.unit
│   │   ├── UCP.unit
│   │   ├── Unit.unit
│   │   ├── Persistence.unit
│   │   ├── User.unit
│   │   ├── Filesystem.unit
│   │   ├── HTTP.unit
│   │   ├── TLS.unit
│   │   ├── Web4TSComponent.unit
│   │   ├── ONCE.unit
│   │   ├── Web4Test.unit
│   │   ├── Tootsie.unit
│   │   ├── PDCA.unit
│   │   └── IdealMinimalComponent.unit
│   └── °folder.unit
└── °folder.unit
```

### M3 CLASS Units — Full Registry

#### 1. @web4x/ucp (5 L2 + 3 L3 + 2 L4 + 1 L5 = 11 units)

| Class | Layer | MDAv4 Path | Source .ts.unit Path | PUML Reference |
|-------|-------|-----------|---------------------|----------------|
| UcpComponent | L2 | MDAv4/M3/CLASS/UcpComponent.unit | UCP/0.3.23.1/src/ts/layer2/UcpComponent.ts.unit | UCP-ClassDiagram.puml |
| UcpController | L2 | MDAv4/M3/CLASS/UcpController.unit | UCP/0.3.23.1/src/ts/layer2/UcpController.ts.unit | UCP-ClassDiagram.puml |
| TypeRegistry | L2 | MDAv4/M3/CLASS/TypeRegistry.unit | UCP/0.3.23.1/src/ts/layer2/TypeRegistry.ts.unit | UCP-ClassDiagram.puml |
| UUIDProvider | L2 | MDAv4/M3/CLASS/UUIDProvider.unit | UCP/0.3.23.1/src/ts/layer2/UUIDProvider.ts.unit | UCP-ClassDiagram.puml |
| SHA256Provider | L2 | MDAv4/M3/CLASS/SHA256Provider.unit | UCP/0.3.23.1/src/ts/layer2/SHA256Provider.ts.unit | UCP-ClassDiagram.puml |
| JsInterface | L3 | MDAv4/M3/CLASS/JsInterface.unit | UCP/0.3.23.1/src/ts/layer3/JsInterface.ts.unit | UCP-ClassDiagram.puml |
| UcpModel | L3 | MDAv4/M3/CLASS/UcpModel.unit | UCP/0.3.23.1/src/ts/layer3/UcpModel.ts.unit | UCP-ClassDiagram.puml |
| TypeDescriptor | L3 | MDAv4/M3/CLASS/TypeDescriptor.unit | UCP/0.3.23.1/src/ts/layer3/TypeDescriptor.ts.unit | UCP-ClassDiagram.puml |
| IOR | L4 | MDAv4/M3/CLASS/IOR.unit | UCP/0.3.23.1/src/ts/layer4/IOR.ts.unit | UCP-ClassDiagram.puml |
| FileLoader | L4 | MDAv4/M3/CLASS/FileLoader.unit | UCP/0.3.23.1/src/ts/layer4/FileLoader.ts.unit | UCP-ClassDiagram.puml |
| UcpCLI | L5 | MDAv4/M3/CLASS/UcpCLI.unit | UCP/0.3.23.1/src/ts/layer5/UcpCLI.ts.unit | UCP-ClassDiagram.puml |

#### 2. @web4x/unit (3 units)

| Class | Layer | MDAv4 Path | Source .ts.unit Path | PUML Reference |
|-------|-------|-----------|---------------------|----------------|
| DefaultUnit | L2 | MDAv4/M3/CLASS/DefaultUnit.unit | Unit/0.3.23.1/src/ts/layer2/DefaultUnit.ts.unit | Unit-ClassDiagram.puml |
| UnitDiscoveryService | L2 | MDAv4/M3/CLASS/UnitDiscoveryService.unit | Unit/0.3.23.1/src/ts/layer2/UnitDiscoveryService.ts.unit | Unit-ClassDiagram.puml |
| ScenarioService | L2 | MDAv4/M3/CLASS/ScenarioService.unit | Unit/0.3.23.1/src/ts/layer2/ScenarioService.ts.unit | Unit-ClassDiagram.puml |

#### 3. @web4x/persistence (2 units)

| Class | Layer | MDAv4 Path | Source .ts.unit Path | PUML Reference |
|-------|-------|-----------|---------------------|----------------|
| UcpStorage | L2 | MDAv4/M3/CLASS/UcpStorage.unit | Persistence/0.3.23.1/src/ts/layer2/UcpStorage.ts.unit | Persistence-ClassDiagram.puml |
| BrowserScenarioStorage | L2 | MDAv4/M3/CLASS/BrowserScenarioStorage.unit | Persistence/0.3.23.1/src/ts/layer2/BrowserScenarioStorage.ts.unit | Persistence-ClassDiagram.puml |

#### 4. @web4x/user (3 units)

| Class | Layer | MDAv4 Path | Source .ts.unit Path | PUML Reference |
|-------|-------|-----------|---------------------|----------------|
| DefaultUser | L2 | MDAv4/M3/CLASS/DefaultUser.unit | User/0.3.23.1/src/ts/layer2/DefaultUser.ts.unit | User-ClassDiagram.puml |
| NodeOSInfrastructure | L1 | MDAv4/M3/CLASS/NodeOSInfrastructure.unit | User/0.3.23.1/src/ts/layer1/NodeOSInfrastructure.ts.unit | User-ClassDiagram.puml |
| DefaultEnvironmentModel | L1 | MDAv4/M3/CLASS/DefaultEnvironmentModel.unit | User/0.3.23.1/src/ts/layer1/DefaultEnvironmentModel.ts.unit | User-ClassDiagram.puml |

#### 5. @web4x/filesystem (5 units)

| Class | Layer | MDAv4 Path | Source .ts.unit Path | PUML Reference |
|-------|-------|-----------|---------------------|----------------|
| DefaultFile | L2 | MDAv4/M3/CLASS/DefaultFile.unit | Filesystem/0.3.23.1/src/ts/layer2/DefaultFile.ts.unit | Filesystem-ClassDiagram.puml |
| DefaultFolder | L2 | MDAv4/M3/CLASS/DefaultFolder.unit | Filesystem/0.3.23.1/src/ts/layer2/DefaultFolder.ts.unit | Filesystem-ClassDiagram.puml |
| DefaultFileSystem | L2 | MDAv4/M3/CLASS/DefaultFileSystem.unit | Filesystem/0.3.23.1/src/ts/layer2/DefaultFileSystem.ts.unit | Filesystem-ClassDiagram.puml |
| DefaultImage | L2 | MDAv4/M3/CLASS/DefaultImage.unit | Filesystem/0.3.23.1/src/ts/layer2/DefaultImage.ts.unit | Filesystem-ClassDiagram.puml |
| DefaultMimetypeHandlerRegistry | L2 | MDAv4/M3/CLASS/DefaultMimetypeHandlerRegistry.unit | Filesystem/0.3.23.1/src/ts/layer2/DefaultMimetypeHandlerRegistry.ts.unit | Filesystem-ClassDiagram.puml |

#### 6. @web4x/http (6 L2 + 1 L4 = 7 units)

| Class | Layer | MDAv4 Path | Source .ts.unit Path | PUML Reference |
|-------|-------|-----------|---------------------|----------------|
| HTTPServer | L2 | MDAv4/M3/CLASS/HTTPServer.unit | HTTP/0.3.23.1/src/ts/layer2/HTTPServer.ts.unit | HTTP-ClassDiagram.puml |
| HTTPRouter | L2 | MDAv4/M3/CLASS/HTTPRouter.unit | HTTP/0.3.23.1/src/ts/layer2/HTTPRouter.ts.unit | HTTP-ClassDiagram.puml |
| Route | L2 | MDAv4/M3/CLASS/Route.unit | HTTP/0.3.23.1/src/ts/layer2/Route.ts.unit | HTTP-ClassDiagram.puml |
| ErrorRoute | L2 | MDAv4/M3/CLASS/ErrorRoute.unit | HTTP/0.3.23.1/src/ts/layer2/ErrorRoute.ts.unit | HTTP-ClassDiagram.puml |
| PortManager | L2 | MDAv4/M3/CLASS/PortManager.unit | HTTP/0.3.23.1/src/ts/layer2/PortManager.ts.unit | HTTP-ClassDiagram.puml |
| HTMLRoute | L2 | MDAv4/M3/CLASS/HTMLRoute.unit | HTTP/0.3.23.1/src/ts/layer2/HTMLRoute.ts.unit | HTTP-ClassDiagram.puml |
| IORMethodRouter | L4 | MDAv4/M3/CLASS/IORMethodRouter.unit | HTTP/0.3.23.1/src/ts/layer4/IORMethodRouter.ts.unit | HTTP-ClassDiagram.puml |

Note: IORRoute, ManifestRoute, ScenarioRoute, ServiceWorkerRoute, UnitsRoute are also in HTTP L2 but are Route subclasses with minimal logic — include if completeness desired (5 additional units).

#### 7. @web4x/tls (5 L2 + 1 L4 = 6 units)

| Class | Layer | MDAv4 Path | Source .ts.unit Path | PUML Reference |
|-------|-------|-----------|---------------------|----------------|
| TLSCertificateLoader | L2 | MDAv4/M3/CLASS/TLSCertificateLoader.unit | TLS/0.3.23.1/src/ts/layer2/TLSCertificateLoader.ts.unit | TLS-ClassDiagram.puml |
| ServerNameIndicationManager | L2 | MDAv4/M3/CLASS/ServerNameIndicationManager.unit | TLS/0.3.23.1/src/ts/layer2/ServerNameIndicationManager.ts.unit | TLS-ClassDiagram.puml |
| DomainCertificateStore | L2 | MDAv4/M3/CLASS/DomainCertificateStore.unit | TLS/0.3.23.1/src/ts/layer2/DomainCertificateStore.ts.unit | TLS-ClassDiagram.puml |
| LetsEncryptCertificateProvider | L2 | MDAv4/M3/CLASS/LetsEncryptCertificateProvider.unit | TLS/0.3.23.1/src/ts/layer2/LetsEncryptCertificateProvider.ts.unit | TLS-ClassDiagram.puml |
| CertificateRenewalScheduler | L2 | MDAv4/M3/CLASS/CertificateRenewalScheduler.unit | TLS/0.3.23.1/src/ts/layer2/CertificateRenewalScheduler.ts.unit | TLS-ClassDiagram.puml |
| CertificateOrchestrator | L4 | MDAv4/M3/CLASS/CertificateOrchestrator.unit | TLS/0.3.23.1/src/ts/layer4/CertificateOrchestrator.ts.unit | TLS-ClassDiagram.puml |

#### 8. @web4x/web4tscomponent (5 L2 + 1 L5 = 6 units)

| Class | Layer | MDAv4 Path | Source .ts.unit Path | PUML Reference |
|-------|-------|-----------|---------------------|----------------|
| DefaultWeb4TSComponent | L2 | MDAv4/M3/CLASS/DefaultWeb4TSComponent.unit | Web4TSComponent/0.3.23.1/src/ts/layer2/DefaultWeb4TSComponent.ts.unit | W4TSC-IMC-ClassDiagram.puml |
| DefaultCLI | L2 | MDAv4/M3/CLASS/DefaultCLI.unit | Web4TSComponent/0.3.23.1/src/ts/layer2/DefaultCLI.ts.unit | W4TSC-IMC-ClassDiagram.puml |
| SemanticVersion | L2 | MDAv4/M3/CLASS/SemanticVersion.unit | Web4TSComponent/0.3.23.1/src/ts/layer2/SemanticVersion.ts.unit | W4TSC-IMC-ClassDiagram.puml |
| DelegationProxy | L2 | MDAv4/M3/CLASS/DelegationProxy.unit | Web4TSComponent/0.3.23.1/src/ts/layer2/DelegationProxy.ts.unit | W4TSC-IMC-ClassDiagram.puml |
| TsAstExtractor | L2 | MDAv4/M3/CLASS/TsAstExtractor.unit | Web4TSComponent/0.3.23.1/src/ts/layer2/TsAstExtractor.ts.unit | W4TSC-IMC-ClassDiagram.puml |
| Web4TSComponentCLI | L5 | MDAv4/M3/CLASS/Web4TSComponentCLI.unit | Web4TSComponent/0.3.23.1/src/ts/layer5/Web4TSComponentCLI.ts.unit | W4TSC-IMC-ClassDiagram.puml |

#### 9. @web4x/once (key classes only — 8 units from 244 files)

| Class | Layer | MDAv4 Path | Source .ts.unit Path | PUML Reference |
|-------|-------|-----------|---------------------|----------------|
| DefaultOnceKernel | L2 | MDAv4/M3/CLASS/DefaultOnceKernel.unit | ONCE/0.3.23.1/src/ts/layer2/DefaultOnceKernel.ts.unit | Web4x-ComponentDependency.puml |
| NodeJsOnce | L2 | MDAv4/M3/CLASS/NodeJsOnce.unit | ONCE/0.3.23.1/src/ts/layer2/NodeJsOnce.ts.unit | Web4x-ComponentDependency.puml |
| BrowserOnce | L2 | MDAv4/M3/CLASS/BrowserOnce.unit | ONCE/0.3.23.1/src/ts/layer2/BrowserOnce.ts.unit | Web4x-ComponentDependency.puml |
| ServerHierarchyManager | L2 | MDAv4/M3/CLASS/ServerHierarchyManager.unit | ONCE/0.3.23.1/src/ts/layer2/ServerHierarchyManager.ts.unit | Web4x-ComponentDependency.puml |
| HTTPSServer | L2 | MDAv4/M3/CLASS/HTTPSServer.unit | ONCE/0.3.23.1/src/ts/layer2/HTTPSServer.ts.unit | Web4x-ComponentDependency.puml |
| DefaultWebSocket | L2 | MDAv4/M3/CLASS/DefaultWebSocket.unit | ONCE/0.3.23.1/src/ts/layer2/DefaultWebSocket.ts.unit | Web4x-ComponentDependency.puml |
| ScenarioManager | L2 | MDAv4/M3/CLASS/ScenarioManager.unit | ONCE/0.3.23.1/src/ts/layer2/ScenarioManager.ts.unit | Web4x-ComponentDependency.puml |
| ONCECLI | L5 | MDAv4/M3/CLASS/ONCECLI.unit | ONCE/0.3.23.1/src/ts/layer5/ONCECLI.ts.unit | Web4x-ComponentDependency.puml |

#### 10-13. Framework Components (template-generated — 2 unique classes each)

| Component | Class | Layer | MDAv4 Path | PUML Reference |
|-----------|-------|-------|-----------|----------------|
| @web4x/web4test | DefaultWeb4Test | L2 | MDAv4/M3/CLASS/DefaultWeb4Test.unit | W4TSC-FrameworkComponents.puml |
| @web4x/web4test | DefaultWeb4TestCase | L2 | MDAv4/M3/CLASS/DefaultWeb4TestCase.unit | W4TSC-FrameworkComponents.puml |
| @web4x/tootsie | DefaultTootsie | L2 | MDAv4/M3/CLASS/DefaultTootsie.unit | W4TSC-FrameworkComponents.puml |
| @web4x/tootsie | QualityOracle | L2 | MDAv4/M3/CLASS/QualityOracle.unit | W4TSC-FrameworkComponents.puml |
| @web4x/tootsie | TootsieTestRunner | L4 | MDAv4/M3/CLASS/TootsieTestRunner.unit | W4TSC-FrameworkComponents.puml |
| @web4x/pdca | DefaultPDCA | L2 | MDAv4/M3/CLASS/DefaultPDCA.unit | W4TSC-FrameworkComponents.puml |
| @web4x/idealminimal | DefaultIdealMinimalComponent | L2 | MDAv4/M3/CLASS/DefaultIdealMinimalComponent.unit | W4TSC-FrameworkComponents.puml |

## Summary Count

| Component | CLASS Units | Source |
|-----------|------------|--------|
| @web4x/ucp | 11 | UCP-ClassDiagram.puml |
| @web4x/unit | 3 | Unit-ClassDiagram.puml |
| @web4x/persistence | 2 | Persistence-ClassDiagram.puml |
| @web4x/user | 3 | User-ClassDiagram.puml |
| @web4x/filesystem | 5 | Filesystem-ClassDiagram.puml |
| @web4x/http | 7 | HTTP-ClassDiagram.puml |
| @web4x/tls | 6 | TLS-ClassDiagram.puml |
| @web4x/web4tscomponent | 6 | W4TSC-IMC-ClassDiagram.puml |
| @web4x/once | 8 | Web4x-ComponentDependency.puml |
| @web4x/web4test | 2 | W4TSC-FrameworkComponents.puml |
| @web4x/tootsie | 3 | W4TSC-FrameworkComponents.puml |
| @web4x/pdca | 1 | W4TSC-FrameworkComponents.puml |
| @web4x/idealminimal | 1 | W4TSC-FrameworkComponents.puml |
| **TOTAL** | **58** | **11 diagrams** |

## M3 RELATIONSHIP Units

Three relationship metaclasses needed:

### extends.unit
Tracks class inheritance (`--|>` in PUML).

| Source Class | Target Class | Component |
|-------------|-------------|-----------|
| UcpComponent | Component (L3 interface) | ucp |
| UcpController | Controller (L3 interface) | ucp |
| DefaultUnit | UcpComponent | unit |
| UcpStorage | Storage → PersistenceManager → JsInterface | persistence |
| DefaultFile | UcpComponent | filesystem |
| DefaultFolder | UcpComponent | filesystem |
| DefaultFileSystem | UcpComponent | filesystem |
| DefaultImage | UcpComponent | filesystem |
| DefaultFolder | DefaultFile (Folder IS-A File) | filesystem |
| ErrorRoute | Route | http |
| HTMLRoute | Route | http |
| IORRoute | Route | http |
| ScenarioRoute | Route | http |
| ManifestRoute | Route | http |
| ServiceWorkerRoute | Route | http |
| UnitsRoute | Route | http |
| Web4TSComponentCLI | DefaultCLI | web4tscomponent |
| IdealMinimalComponentCLI | DefaultCLI | idealminimal |
| PersistenceManager | JsInterface | ucp |
| Storage | PersistenceManager | ucp |

### implements.unit
Tracks interface implementation (`..|>` in PUML).

| Source Class | Target Interface | Component |
|-------------|-----------------|-----------|
| UcpController | RelatedObjects | ucp |
| UUIDProvider | IDProvider | ucp |
| SHA256Provider | ContentIDProvider | ucp |
| DefaultUser | User | user |
| DefaultFile | FileJs | filesystem |
| DefaultFolder | FolderJs, Container<FileJs> | filesystem |
| BrowserScenarioStorage | PersistenceManager | persistence |
| DefaultEnvironmentModel | EnvironmentModel | user |
| FileLoader | Loader | ucp |
| DelegationProxy | Component | web4tscomponent |

### depends-on.unit
Tracks component-level dependencies (`file:` refs in package.json).

| Source Component | Target Component |
|-----------------|-----------------|
| @web4x/unit | @web4x/ucp |
| @web4x/persistence | @web4x/ucp |
| @web4x/user | @web4x/ucp, @web4x/unit |
| @web4x/filesystem | @web4x/ucp, @web4x/unit |
| @web4x/http | @web4x/ucp |
| @web4x/tls | @web4x/ucp |
| @web4x/web4tscomponent | @web4x/ucp, @web4x/unit, @web4x/persistence |
| @web4x/once | ALL 7 above + ws |
| @web4x/web4test | standalone (glob, minimatch) |
| @web4x/tootsie | standalone (glob, minimatch) |
| @web4x/pdca | standalone (glob, minimatch) |
| @web4x/idealminimal | standalone (glob, minimatch) |

## M3 FOLDER Units

13 component folder units in `MDAv4/M3/FOLDER/`:

| Unit File | Origin | typeM3 |
|-----------|--------|--------|
| UCP.unit | ior:file://components/UCP/0.3.23.1/ | FOLDER |
| Unit.unit | ior:file://components/Unit/0.3.23.1/ | FOLDER |
| Persistence.unit | ior:file://components/Persistence/0.3.23.1/ | FOLDER |
| User.unit | ior:file://components/User/0.3.23.1/ | FOLDER |
| Filesystem.unit | ior:file://components/Filesystem/0.3.23.1/ | FOLDER |
| HTTP.unit | ior:file://components/HTTP/0.3.23.1/ | FOLDER |
| TLS.unit | ior:file://components/TLS/0.3.23.1/ | FOLDER |
| Web4TSComponent.unit | ior:file://components/Web4TSComponent/0.3.23.1/ | FOLDER |
| ONCE.unit | ior:file://components/ONCE/0.3.23.1/ | FOLDER |
| Web4Test.unit | ior:file://components/Web4Test/0.3.23.1/ | FOLDER |
| Tootsie.unit | ior:file://components/Tootsie/0.3.23.1/ | FOLDER |
| PDCA.unit | ior:file://components/PDCA/0.3.23.1/ | FOLDER |
| IdealMinimalComponent.unit | ior:file://components/IdealMinimalComponent/0.3.23.1/ | FOLDER |

## Grand Total

| Type | Count |
|------|-------|
| M3/CLASS/ units | 58 |
| M3/RELATIONSHIP/ units | 3 (extends, implements, depends-on) |
| M3/FOLDER/ units | 13 |
| °folder.unit files | 5 (root, M3, CLASS, RELATIONSHIP, FOLDER) |
| **.ts.unit tracking files** | **58** (one per CLASS unit, next to source) |
| **TOTAL** | **137 unit files** |

## Acceptance Criteria for Expert (Tasks 8.2-8.4)
- [ ] MDAv4/M3/CLASS/ contains 58 .unit files
- [ ] MDAv4/M3/RELATIONSHIP/ contains extends.unit, implements.unit, depends-on.unit
- [ ] MDAv4/M3/FOLDER/ contains 13 component folder units
- [ ] Every .unit has valid JSON with ior.uuid, model.typeM3, model.origin, model.references[]
- [ ] 58 .ts.unit files created next to source (one per CLASS unit)
- [ ] Bidirectional references: M3 unit ↔ .ts.unit verified
