// OOSH.ts: Strict OOP CLI class for UpDown

export class OOSH {
  static help(): void {
    console.log(`UpDown CLI Help\n\nUsage:\n  oosh help                Show this help message\n  oosh create <Project>    Create a new project as submodule\n\nAll commands use positional arguments only. No Linux-style options.\nSee docs/first-principles.md and docs/5.2-cli-requirements.md for details.`);
  }

  static create(projectName: string): void {
    // Placeholder for project creation logic
    console.log(`Creating project: ${projectName}`);
  }
}
