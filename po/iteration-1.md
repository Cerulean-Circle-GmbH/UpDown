# Product Owner Log - Iteration 1

**Date:** 2025-07-21

## Coarse-Grained Work Breakdown Structure (WBS): Docker Dev Container Setup

1. Define requirements for the Docker development container (base image, language, tools, etc.).
2. Create a Dockerfile with the specified environment (TypeScript, Bun, Ubuntu, etc.).
3. Add configuration for VS Code devcontainer (devcontainer.json).
4. Test the container build and ensure it runs the development environment as expected.
5. Document usage instructions for the team.

## Next Step
- Generate role-based prompts for each WBS task.

# Role-Based Prompts for WBS Tasks - Iteration 1

**Date:** 2025-07-21

## 1. Define requirements for the Docker development container
**Role:** DevOps/Lead Developer
- Prompt: Specify the base image, programming language(s), package manager, and essential tools required for the development environment.

## 2. Create a Dockerfile with the specified environment
**Role:** DevOps
- Prompt: Write a Dockerfile that sets up the environment as defined in the requirements, ensuring all dependencies are installed.

## 3. Add configuration for VS Code devcontainer (devcontainer.json)
**Role:** DevOps/Developer
- Prompt: Create a devcontainer.json file to configure VS Code integration, including extensions, settings, and post-create commands.

## 4. Test the container build and ensure it runs the development environment as expected
**Role:** Developer/QA
- Prompt: Build and run the Docker container, verifying that the development environment is functional and all tools work as intended.

## 5. Document usage instructions for the team
**Role:** Technical Writer/Developer
- Prompt: Write clear instructions on how to build, run, and use the dev container for all team members.
