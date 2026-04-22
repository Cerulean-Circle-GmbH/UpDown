[Back to Sprint 1 Planning](./planning.md) | [Back to Task 6](./task-6-plantuml-class-diagrams.md)

# Task 6.0b: Architect — Use Case Diagram: Web4TSComponent + IdealMinimalComponent
[subtask:uuid:d1e2f3a4-b5c6-7890-defa-600000000002]

## Status
- [ ] Planned
- [ ] In Progress
- [ ] QA Review
- [ ] Done

## Traceability
  - up
    - [Task 6: PlantUML Class Diagrams](./task-6-plantuml-class-diagrams.md)
    - [requirement:uuid:a1b2c3d4-e5f6-7890-abcd-100000000008](./requirements.md) (R8)

## Task Description
Create a PlantUML use case diagram for Web4TSComponent and IdealMinimalComponent. Use cases follow the **Object.verb** naming pattern (matching the CLI command names). Sub-usecases show the internal method call chain.

## Use Case Naming Convention: Object.verb
Every CLI command is a use case named `Component.method`:
- `web4tscomponent.links` → UC: shows/manages semantic version links
- `web4tscomponent.info` → UC: displays component info
- `web4tscomponent.build` → UC: compiles TypeScript
- `idealMinimalComponent.info` → UC: displays component info (via delegation)

## Sub-Use Case Pattern (<<include>>)
Top-level CLI methods call internal methods. Each internal method is a sub-usecase linked via `<<include>>`:

```
Example:
  UC: web4tscomponent.info
    <<include>> UC: DefaultWeb4TSComponent.init()
    <<include>> UC: DefaultCLI.componentInfoDisplay()
    <<include>> UC: SemanticVersion.fromString()
    
  UC: web4tscomponent.links
    <<include>> UC: DefaultWeb4TSComponent.linksGet()
    <<include>> UC: DefaultWeb4TSComponent.linkCreate()
    <<include>> UC: SemanticVersion.linkResolve()

  UC: idealMinimalComponent.info
    <<include>> UC: DelegationProxy.delegate()
    <<include>> UC: web4tscomponent.info  ← delegates to W4TSC
```

## Source Code to Read
- `components/Web4TSComponent/prod/src/ts/layer5/` — CLI entry points (top-level use cases)
- `components/Web4TSComponent/prod/src/ts/layer2/DefaultWeb4TSComponent.ts` — method implementations
- `components/Web4TSComponent/prod/src/ts/layer2/DefaultCLI.ts` — CLI method dispatch
- `components/IdealMinimalComponent/prod/src/ts/layer5/` — CLI (delegates via DelegationProxy)
- `components/IdealMinimalComponent/prod/src/ts/layer2/DelegationProxy.ts` — delegation pattern

## Diagram Requirements
1. **Actor:** User (triggers CLI commands)
2. **System boundary:** Web4TSComponent (rectangle with all its use cases)
3. **System boundary:** IdealMinimalComponent (rectangle with its use cases)
4. **Top-level use cases:** Each CLI command = one use case, named `Object.verb`
5. **Sub-use cases:** Internal methods called by top-level, linked with `<<include>>`
6. **Delegation arrow:** IdealMinimalComponent use cases `<<include>>` Web4TSComponent use cases via DelegationProxy
7. **Numbering:** UC1, UC1a, UC1b... for traceability

## Output
- File: `components/Web4TSComponent/0.3.23.1/src/puml/W4TSC-IMC-UseCaseDiagram.puml`
- Render: `plantuml -tsvg` → `.svg` in same directory
- Verify: no warnings, no errors

## Acceptance Criteria
- [ ] Every CLI command from `web4tscomponent` and `idealMinimalComponent` is a use case
- [ ] Use cases named Object.verb (e.g., `web4tscomponent.links`)
- [ ] Sub-use cases show `<<include>>` for internal method calls
- [ ] DelegationProxy pattern visible (IMC delegates to W4TSC)
- [ ] UC numbering: UC1 → UC1a, UC1b...
- [ ] Renders to SVG without errors
- [ ] PO confirms shared understanding of component behavior
