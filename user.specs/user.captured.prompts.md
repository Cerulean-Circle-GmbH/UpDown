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

**Context:** Iteration 2, DevOps ([devops/iteration-2.md](../../devops/iteration-2.md))
- The DevOps role must not only install required dependencies, but also update the package.json and run an npm update and build, so that node_modules are downloaded and the environment is ready for development. The Product Owner should be aware of these details and ensure they are included in the work breakdown and acceptance criteria.

**Context:** Iteration 2, DevOps/PO ([devops/iteration-2.md](../../devops/iteration-2.md), [po/iteration-1-task-2.md](../../po/iteration-1-task-2.md))
- The project needs a working Docker dev container that includes Bun and all required dependencies. The dev container should be built and deployed, and VS Code should be connected to the container, ensuring Bun is present and available for development. This is essential for a consistent development environment on macOS and other platforms.

**Context:** Restart.md
- Copilot: Based on the project description and outline, I am currently in the Scrum Master role. My responsibility is to coordinate the workflow, assign tasks to the appropriate roles, and ensure the process follows the work breakdown structure.

    The next step, according to the project outline, is to proceed with:

    Iteration 2 Task 4: Frontend Developer/Architect—Identify the main components/modules for the client.
    I will now switch to the Frontend Developer/Architect role and begin working on identifying the main client-side components and modules. If you have any feedback or specific requirements for the frontend architecture, please let me know before I proceed.
- User: nearly perfect, we where at task building the dev container here in po/iteration-2-task-devcontainer.md. The Devops screwed the context and you are now setting up again as a scrum master. well understood. please create arestart.md that you can read as a summay, so that next time it happens, you can bootstrap yourself into the context. then continue with the devops task and go on with the scrum master orchestration afterwards. so the overnext task is the one you found, but you missed the point where it broke in the devops task. also read the /Users/Shared/Workspaces/2cuGitHub/UpDown/user specs/user.captured.prompts.md on recover and add this user prompt to the file. then go on.

---

**User Feedback (2025-07-22):**

**Context:** Iteration 2, Scrum Master Process ([scrum-master/process.md](../../scrum-master/process.md), [project.outline.md](../../project.outline.md))
- When recovering from a process interruption, always start as Scrum Master, orchestrate all roles, and update the project outline with the last successful role and task.
- The PO must update the task files (e.g., add new tasks) to reflect new plans and requirements before implementation.
- Every completed task must result in a concrete artifact (specification, code, or documentation) in the workspace.
- The npm start script for Docker must be smart: it should build if needed, start the container in detached mode, and not block the terminal or Copilot.
- User feedback must be incorporated before executing new tasks, especially after planning with the PO.
- The API and modeling approach must follow a radical OOP, protocol-less design: all actions should be methods on model classes, not protocol-style function calls.
- The new section "# backup and QA user annotations" in docs/api-and-model-spec.md is authoritative and must be considered in all future planning and documentation.
- The Scrum Master must always prompt the user for feedback before executing new or changed tasks, and document all new user feedback and process changes.
- The Scrum Master must ensure that the PO and all roles are aware of and act on QA/user annotations.

**Context:** Iteration 2, DevOps/Developer/Process ([project.outline.md](../../project.outline.md), [devops/iteration-2.md](../../devops/iteration-2.md), [scrum-master/process.md](../../scrum-master/process.md))
- The project outline must be updated after each role shift or major task completion to reflect the current status and next steps.
- The error with Bun not being found occurred because commands were run outside the dev container. All Bun-related commands must be run inside the dev container.
- The DevOps role must ensure onboarding and process docs clearly instruct developers to start and use the dev container for all Bun-related development.
- The Scrum Master must guarantee these requirements are documented and enforced in the process and onboarding docs.

**Context:** Iteration 2/3 Transition, Scrum Master Process ([project.outline.md](../../project.outline.md), [scrum-master/process.md](../../scrum-master/process.md))
- As Scrum Master, always update user.captured.prompts.md and project.outline.md after every major process, role shift, or user feedback.
- Lessons learned and process improvements must be documented in scrum-master/process.md.
- Iteration 2's approach to container and server workflow was incomplete; a new iteration (Iteration 3) is being started to address this, and Iteration 4 will address any remaining Iteration 2 tasks after Iteration 3 is complete.

## 2025-07-24
- Verified and deleted README_NEW.md and README_OLD.md, leaving only README.md in the contracts folder.
- Confirmed successful cleanup and test-driven workflow.
- Reminder: Always log user comments and actions here for reproducibility and recovery.
- let us test this. my current prompt i am sending to you now is to be added into the file '''contracts/user.specs/user.captured.prompts.md'''. it needs to be an exact copy. Perform this action always everytime you receive a prompt from me. do this now and search afterwards, if it is in there and confirm

## 2025-07-24 15:37 UTC
very good. i want to have the user comments log like a history. add the timestamp to the date always each time you are receiving a prompt. 

extrapolate the intention and create the process description for process.md now

---

- All references to 'UpDown' have been updated to 'contracts' as part of the project renaming process.

## 2025-07-24 15:41 UTC
add the users prompt from before AND also this to the user prompts.
Then the Feedback:

── tasks/
│   ├── iteration-1-task-1.md
│   ├── iteration-1-task-2.md
│   └── ...

i want tasks > iteration-1 > iteration-1-task-1.md....
Create the template structure.
Ensure that tasks like task-1 can have a task-1.1

## 2025-07-24 16:00 UTC
next is to reflect upon the Roles in ''' contracts/src/roles '''
i copied this from another project.

1. ensure this prompt is in the user prompt as discussed.
2. reflect upon the roles onboarding documents. are the valid - would you update the documents based on your understanding? if so: do it and i will provide feedback. this is the retro and it is possible in this phase.
3. Verify that the links are all valid or if not replace them
4. create a onboarding description for the devops
## 2025-07-24 16:10 UTC
very good. did you see that the process.md file location moved? update it into files that are referencing to this location.
## 2025-07-24 16:40 UTC
add to the npm start script if another container is running before the current container is started. this can happen in the context switches and the addition will support this scenario. 
document the promt in the md file
restart the npm start script then
## 2025-07-25
you added your text into the user caputred prompts md. that is wrong. you are not the user, you are the scrum master orchastrating the team

1. in the contracts/user.specs/user.captured.prompts.md only my queries (the user) are to be added with utc timestamp. Change that, remove the scrum master prompts and add the users
2. in contracts/tasks/sprints/iteration-1/tasks/iteration-1/iteration-1-task-0.md you removed user feedback. that is not allowed. user feedback always need to stay and you add on top of it (concatination). use also timestamp with utc. 
3. the prompts of the scrum master or comments from your team (po, devops, architect, qa) need to be documented in the "next steps" section om tje tasks or subtasks as in contracts/tasks/sprints/iteration-1/tasks/iteration-1/iteration-1-task-0.md
also with timestamp
4. now we have a special case: 
you need to decide what of the user prompts is general that goes into contracts/user.specs/user.captured.prompts.md and what is task specific that goes in the user feedback section of the corresponding task.

for this prompt it goes into contracts/user.specs/user.captured.prompts.md
then you need to extrapolate the intention and document the process
then you need to change the contracts/tasks/sprints/iteration-1/tasks/iteration-1/iteration-1-task-0.md task to apply the logic
and then you can contiue with orchastrating the task with feedback from qa
## 2025-07-24 10:42 UTC
stop. let us review the loop you are in.

i am the user.
you are the scrum master
then you are activating the PO and are prompting "PO, please review iteration-1-task-0.1.md and provide the integration test subtask details referencing test-plan.md. Once you provide the details, I will document them and continue this process for each subsequent task, ensuring all PO input is captured for traceability." and then you wait for input.
the only input that now can be provided is by me the user.
reflect upon this loop and find out why you will not be able to provide a result with this behavior. learn from it and define a new process that we then will integrate
Reflection:

The current loop expects the PO to provide integration test subtask details, but in this setup, the PO role is also orchestrated by the Scrum Master (me), and the only real input comes from you, the user.
Waiting for PO input is ineffective, as no actual PO exists to respond; only the user can provide feedback or direction.
This causes a deadlock: the Scrum Master prompts the PO, but no PO responds unless the user acts as PO, which is not the intended process.
Lesson:

In an AI-orchestrated team, the Scrum Master should not wait for simulated PO input. Instead, the Scrum Master should proactively generate PO responses based on available requirements, documentation, and user feedback.
The Scrum Master should document the PO's actions and decisions, then present them to the user for review and approval, ensuring traceability and user control.
New Process Proposal:

User provides requirements, feedback, or prompts.
Scrum Master reviews all context, requirements, and documentation.
Scrum Master simulates PO actions: reviews tasks, generates integration test subtasks, and documents them.
Scrum Master presents the results to the user for review, feedback, and approval.
User feedback is incorporated, and the process continues for each task.
This process ensures continuous progress, traceability, and user control, without waiting for simulated team member input.

## 2025-07-24 15:09 UTC
 verify that the process handling done by the scrum master is done correctly. i see at least one task in status planned AND in progress. small thing but essential to be dilligant

## Reflection: Task Status and Context Management
- When working on a subtask (e.g., 1.1 or 1.2), always check and document the current status and context of the parent task (e.g., 1) and all related subtasks.
- Context and findings should be placed in the correct task files to ensure traceability and clarity.
- This pattern is essential for process diligence and should be followed for all future sprint/task work.
- Example: If Task 1.1 is in progress, document the status and findings in both Task 1 and Task 1.1 files, and update Task 1.2 as needed.
````
reflect now if the 1, 1.1, 1.2 is correct in the status planned. as we just completed it you lost track of this.
it is a loop. when the status changed from done you thought it needs to go to planned. but in fact you need to understand the context and then understand if the task is already complete. not follow a protocol - you need to be aware of the content and verify based on the existing results. add this prompt to the user prompts and and reflect, learn and document in the process.md
then read the process.md again before we continue



# User Quality Feedback (2025-07-29)

our current context is you are scrum master and continue to follow the process for the user promps, but we do a short qa audit outside of the sprint. so read the correct files and roles tasks, help to document the userfeedback but be relaxed with the sprint methodology until the next restart.

i switched to a diffrent branch and need to teach you as a scrum master the cases... switching branches, merging branches and restablish consistency. the merging process should in future be guided and executed by the PO. he collects all branches and work and decides what comes into the main git branch. then he checks quality with the tester of all the deliverables of the other roles. this is a daily business whenever a task has become done and is existing as a feature branch and needs to be merges into the main branch. this process is also called release process. add a fromal documentation md file to specify what i already revealed about the scrum sprint process as new and add it to the relevant files like process,...