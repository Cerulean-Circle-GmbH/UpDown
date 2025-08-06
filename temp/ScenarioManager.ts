import * as fs from 'fs';
import * as path from 'path';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Scenario {
  name: string;
  uuid: string;
  description: string;
  created: string;
  version: string;
}

export interface NamingConvention {
  name: string;
  description: string;
  sprintDirectory: string;
  taskFilePattern: string;
  taskIdFormat: string;
  planningFile: string;
  active: boolean;
}

export interface InstanceState {
  currentSprint: string;
  currentTask: string;
  status: string;
  files: {
    taskMd: string;
    dailyMd: string;
    planningMd: string;
  };
  history: Array<{ timestamp: string; status: string; step?: string }>;
}

export interface RecoveryConfig {
  enabled: boolean;
  autoSave: boolean;
  lastRecovery: string;
}

export interface ScenarioFile {
  scenario: Scenario;
  naming: NamingConvention;
  instance: InstanceState;
  recovery: RecoveryConfig;
}

export class ScenarioManager {
  private scenariosDir: string;
  private currentScenario: ScenarioFile | null = null;

  constructor(scenariosDir?: string) {
    this.scenariosDir = scenariosDir || path.join(__dirname, '..');
  }

  public findScenarioFiles(): string[] {
    const pattern = '*.scenario.json';
    const matches = globSync(pattern, { cwd: this.scenariosDir, recursive: true });
    return matches.map(match => path.join(this.scenariosDir, match));
  }

  public loadScenario(scenarioPath: string): ScenarioFile {
    if (!fs.existsSync(scenarioPath)) {
      throw new Error(`Scenario file not found: ${scenarioPath}`);
    }
    
    const content = fs.readFileSync(scenarioPath, 'utf-8');
    const scenario = JSON.parse(content) as ScenarioFile;
    
    // Validate scenario structure
    if (!scenario.scenario || !scenario.naming || !scenario.instance) {
      throw new Error(`Invalid scenario file structure: ${scenarioPath}`);
    }
    
    this.currentScenario = scenario;
    return scenario;
  }

  public saveScenario(scenarioPath: string, scenario: ScenarioFile): void {
    // Update last recovery timestamp
    scenario.recovery.lastRecovery = new Date().toISOString();
    
    // Ensure directory exists
    const dir = path.dirname(scenarioPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(scenarioPath, JSON.stringify(scenario, null, 2));
  }

  public createScenario(
    name: string,
    naming: NamingConvention,
    instance: InstanceState
  ): ScenarioFile {
    const uuid = this.generateUUID();
    const now = new Date().toISOString();
    
    const scenario: ScenarioFile = {
      scenario: {
        name,
        uuid,
        description: `${name} scenario for ${naming.sprintDirectory}`,
        created: now,
        version: "1.0.0"
      },
      naming,
      instance,
      recovery: {
        enabled: true,
        autoSave: true,
        lastRecovery: now
      }
    };
    
    return scenario;
  }

  public getCurrentScenario(): ScenarioFile | null {
    return this.currentScenario;
  }

  public updateInstanceState(instance: Partial<InstanceState>): void {
    if (!this.currentScenario) {
      throw new Error('No current scenario loaded');
    }
    
    this.currentScenario.instance = { ...this.currentScenario.instance, ...instance };
  }

  public getNamingConvention(): NamingConvention | null {
    return this.currentScenario?.naming || null;
  }

  public getInstanceState(): InstanceState | null {
    return this.currentScenario?.instance || null;
  }

  public findScenarioByNamingConvention(conventionName: string): string | null {
    const scenarioFiles = this.findScenarioFiles();
    
    for (const scenarioPath of scenarioFiles) {
      try {
        const scenario = this.loadScenario(scenarioPath);
        if (scenario.naming.name.toLowerCase().includes(conventionName.toLowerCase())) {
          return scenarioPath;
        }
      } catch (e) {
        // Skip invalid scenario files
        continue;
      }
    }
    
    return null;
  }

  public listScenarios(): Array<{ path: string; scenario: ScenarioFile }> {
    const scenarioFiles = this.findScenarioFiles();
    const scenarios: Array<{ path: string; scenario: ScenarioFile }> = [];
    
    for (const scenarioPath of scenarioFiles) {
      try {
        const scenario = this.loadScenario(scenarioPath);
        scenarios.push({ path: scenarioPath, scenario });
      } catch (e) {
        // Skip invalid scenario files
        continue;
      }
    }
    
    return scenarios;
  }

  public recoverFromScenario(scenarioPath: string): ScenarioFile {
    const scenario = this.loadScenario(scenarioPath);
    
    // Update recovery timestamp
    scenario.recovery.lastRecovery = new Date().toISOString();
    this.saveScenario(scenarioPath, scenario);
    
    return scenario;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
} 