import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface NamingConvention {
  name: string;
  description: string;
  sprintDirectory: string;
  taskFilePattern: string;
  taskIdFormat: string;
  planningFile: string;
  active: boolean;
}

export interface NamingConfig {
  conventions: {
    new: NamingConvention;
    old: NamingConvention;
  };
  current: string;
  fallbackEnabled: boolean;
  autoMigrate: boolean;
}

export class NamingConventionManager {
  private configPath: string;
  private config: NamingConfig;

  constructor(configPath: string = path.join(__dirname, 'naming-conventions.json')) {
    this.configPath = configPath;
    this.config = this.loadConfig();
  }

  private loadConfig(): NamingConfig {
    if (fs.existsSync(this.configPath)) {
      try {
        const content = fs.readFileSync(this.configPath, 'utf-8');
        return JSON.parse(content);
      } catch (e) {
        console.error('Error loading naming convention config:', e);
      }
    }
    
    // Default config if file doesn't exist
    return {
      conventions: {
        new: {
          name: "New Naming Convention",
          description: "Optimized naming with sprint-3 directory and task-{number}-{description}.md format",
          sprintDirectory: "sprints/sprint-3",
          taskFilePattern: "task-{number}-*.md",
          taskIdFormat: "task-{number}",
          planningFile: "sprints/sprint-3/planning.md",
          active: true
        },
        old: {
          name: "Legacy Naming Convention",
          description: "Original naming with iteration-3 directory and iteration-3-task-{number}-{description}.md format",
          sprintDirectory: "sprints/iteration-3",
          taskFilePattern: "iteration-3-task-{number}-*.md",
          taskIdFormat: "iteration-3-task-{number}",
          planningFile: "sprints/iteration-3/planning.md",
          active: false
        }
      },
      current: "new",
      fallbackEnabled: true,
      autoMigrate: true
    };
  }

  public saveConfig(): void {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  public getCurrentConvention(): NamingConvention {
    return this.config.conventions[this.config.current as keyof typeof this.config.conventions];
  }

  public getConvention(name: string): NamingConvention | null {
    return this.config.conventions[name as keyof typeof this.config.conventions] || null;
  }

  public switchConvention(conventionName: string): boolean {
    if (!this.config.conventions[conventionName as keyof typeof this.config.conventions]) {
      return false;
    }
    
    this.config.current = conventionName;
    this.saveConfig();
    return true;
  }

  public getTaskId(taskNumber: string): string {
    const convention = this.getCurrentConvention();
    return convention.taskIdFormat.replace('{number}', taskNumber);
  }

  public getSprintDirectory(): string {
    const convention = this.getCurrentConvention();
    return path.join(__dirname, '..', convention.sprintDirectory);
  }

  public getPlanningFile(): string {
    const convention = this.getCurrentConvention();
    return path.join(__dirname, '..', convention.planningFile);
  }

  public getTaskFilePattern(taskNumber: string): string {
    const convention = this.getCurrentConvention();
    return convention.taskFilePattern.replace('{number}', taskNumber);
  }

  public findTaskFile(taskNumber: string): string | undefined {
    const convention = this.getCurrentConvention();
    const sprintDir = path.join(__dirname, '..', convention.sprintDirectory);
    const pattern = this.getTaskFilePattern(taskNumber);
    
    try {
      const matches = globSync(pattern, { cwd: sprintDir });
      if (matches.length > 0) {
        return path.join(sprintDir, matches[0]);
      }
    } catch (e) {
      // Directory might not exist
    }

    // Fallback to other convention if enabled
    if (this.config.fallbackEnabled) {
      const fallbackConvention = this.config.current === 'new' ? 'old' : 'new';
      const fallbackConfig = this.getConvention(fallbackConvention);
      if (fallbackConfig) {
        const fallbackDir = path.join(__dirname, '..', fallbackConfig.sprintDirectory);
        const fallbackPattern = fallbackConfig.taskFilePattern.replace('{number}', taskNumber);
        
        try {
          const matches = globSync(fallbackPattern, { cwd: fallbackDir });
          if (matches.length > 0) {
            return path.join(fallbackDir, matches[0]);
          }
        } catch (e) {
          // Directory might not exist
        }
      }
    }

    return undefined;
  }

  public getAllConventions(): Record<string, NamingConvention> {
    return this.config.conventions;
  }

  public isFallbackEnabled(): boolean {
    return this.config.fallbackEnabled;
  }

  public setFallbackEnabled(enabled: boolean): void {
    this.config.fallbackEnabled = enabled;
    this.saveConfig();
  }

  public getConfig(): NamingConfig {
    return { ...this.config };
  }
} 