- on the front end side the same classes have to be loaded as on the backend. the state of these classes has to be synced in realtime on any change. the front end shall be programmed in a very declarative way. here an idea for a web component usage on the cliient index.html page:

    ```
    <web4-router>
    <web4-route page="Lobby" path="lobby">
    <web4-route page="Login" path="login">
    <web4-route page="Player" path="login/player">
    <web4-route page="Spectator" path="login/spectator">
    ...
    </web4-router>
    ```

    while  web4-router is a webComponent extending a serverside component and configuring the app in a declarative way. the attributes of the tags are the same as the model attributes in the corresponding classes and will also be reflected in the scenarios, that are then exchnaged for sync.

    Please check ho this spec influences the itteration2 and add it to the high level iteration2 file and see how the itteration 2 files will change. then go on as planned.

# User Quality Feedback (2025-07-21)

- The Scrum Master marked Iteration 2 tasks as complete, but the roles have not yet produced any implementation artifacts (e.g., code, diagrams, class/module files).
- Best practice is for each role to execute their assigned tasks and create the required artifacts as part of the same iteration, not to defer all implementation to a later iteration.
- The process should be updated: after each task is defined and detailed, the responsible role must immediately create the required artifacts before the task is marked as complete.
- The Scrum Master should review the current status and prompt the roles to begin producing the actual deliverables for Iteration 2 tasks, starting with the client components for Task 4.
- A very essential architectural constraint for the scenario sync is that constructors are never having parameters. An instance needs to be created without prior knowledge to the class and its constructor signature. The class will always create a valid default state for the instance, but can also always be brought into a synchronized state by injecting the decrypted scenario state JSON. This way components can "move" across peers in their state or be recreated somewhere in their state. If parameters are needed for the instance state, use init functions that initialize with a scenario. Scenarios are JSON strings but should be their own type, as they hold the unencrypted reference to the class they have to load to create an instance. Add this feedback to the user md and check which of the tasks have to be modified to reflect this user spec.

---

**Context:** Iteration 2, Task 1 ([po/iteration-2-task-1.md](../../po/iteration-2-task-1.md))
- The scenario sync architecture requires that all class constructors are parameterless. Instances must be created without prior knowledge of constructor signatures. Initialization with state should be done via an init function that takes a scenario. Scenarios are JSON strings (with a dedicated type) containing the class reference and state. This enables components to move or be recreated across peers in their state.

**Context:** Iteration 2, Task 2 ([po/iteration-2-task-2.md](../../po/iteration-2-task-2.md))
- All shared classes for scenario sync must have parameterless constructors and use an init function for state injection from a scenario. Scenarios are JSON strings (with a dedicated type) containing the class reference and state. This enables dynamic instantiation and state sync across peers.

**Context:** Iteration 2, General ([project.outline.md](../../project.outline.md))
- The Scrum Master marked Iteration 2 tasks as complete, but the roles have not yet produced any implementation artifacts (e.g., code, diagrams, class/module files).
- Best practice is for each role to execute their assigned tasks and create the required artifacts as part of the same iteration, not to defer all implementation to a later iteration.
- The process should be updated: after each task is defined and detailed, the responsible role must immediately create the required artifacts before the task is marked as complete.
- The Scrum Master should review the current status and prompt the roles to begin producing the actual deliverables for Iteration 2 tasks, starting with the client components for Task 4.

**Context:** Iteration 2, Task 1 & 2 ([po/iteration-2-task-1.md](../../po/iteration-2-task-1.md), [po/iteration-2-task-2.md](../../po/iteration-2-task-2.md))
- A very essential architectural constraint for the scenario sync is that constructors are never having parameters. An instance needs to be created without prior knowledge to the class and its constructor signature. The class will always create a valid default state for the instance, but can also always be brought into a synchronized state by injecting the decrypted scenario state JSON. This way components can "move" across peers in their state or be recreated somewhere in their state. If parameters are needed for the instance state, use init functions that initialize with a scenario. Scenarios are JSON strings but should be their own type, as they hold the unencrypted reference to the class they have to load to create an instance.

**Context:** Iteration 2, Task 1 & 2 ([po/iteration-2-task-1.md](../../po/iteration-2-task-1.md), [po/iteration-2-task-2.md](../../po/iteration-2-task-2.md))
- The current code is good, but the code structure will not be scalable. Each class should be in its own ts file and in a structure easy to find and easy to import in the later server and client. Additionally, there is a fundamental DO NOT REPEAT YOURSELF pattern, that prohibits the duplicate definition of Scenario, as it may lead to fatal inconsistencies. Also, strict typing is absolutely essential. Even if the Scenario state is a JSON it never should be of type Any. Make it e.g. of type Model.

**Context:** Iteration 2, Server/Client Bootstrapping ([future tasks])
- Server and client booting files will need to be created that load the new classes. The architect should design a viable structure of the filesystem for a Bun project, including the necessary package.json and other TypeScript meta files.

**Context:** Iteration 2, QA ([po/iteration-2-task-qa.md](../../po/iteration-2-task-qa.md))
- src/shared/Scenario.ts is not a valid TypeScript file; it contains markdown formatting. Needs to be fixed.
- Player, Lobby, and Card classes are all defined in src/shared/Player.ts. Each class should be in its own file for maintainability and DRY compliance. Needs refactoring.