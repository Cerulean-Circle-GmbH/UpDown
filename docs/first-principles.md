# UpDown CLI First Principles

## 1. Strict OOP CLI Design
- All CLI commands must map to TypeScript classes and methods.
- No Linux-style options (e.g., --help, -v). Use positional arguments only.
- Example: `oosh help` calls the `help()` method of the `OOSH` class.
- All CLI entry points must be pure loaders, delegating to static class methods (e.g., `static start()`).

## 2. Root-Relative Pathing
- All scripts and CLI logic must resolve paths from the git project root.
- Environment variables (e.g., GIT_ROOT) must be set and used for all path calculations.

## 3. Robust Shell Integration
- Shell wrappers must invoke TypeScript entry points using `ts-node` with ESM and correct project root.
- No direct Node.js or compiled JS entry points; always use TypeScript sources for development.

## 4. Completion and Automation
- Tab completion and automation must be code-driven, not static.
- All completions must be visible in the shell and reflect the current codebase.

## 5. Documentation and QA
- All process, design, and QA learnings must be documented for Architect, Developer, DevOps, and Tester roles.
- Manual and automated QA must validate CLI, completion, and shell integration.

## 6. Example Usage
- `oosh help` → Calls `OOSH.help()` and prints help to the console.
- `oosh create ProjectName` → Calls `OOSH.create('ProjectName')`.

---

# Section 5.2: CLI Command Requirements

- All CLI commands must use positional arguments only.
- No Linux-style options (e.g., `--help`).
- The first argument is always the class or command (e.g., `help`, `create`).
- The second and subsequent arguments are method parameters.
- The CLI must parse these arguments and invoke the corresponding class method.
- Example: `oosh help` → `OOSH.help()`
- Example: `oosh create ProjectName` → `OOSH.create('ProjectName')`
- All help and documentation must be accessible via class methods, not options.
