// TaskStateMachine.ts
// OOP implementation for Task 18 state management
// Substates for in-progress
const substateNames = ['refinement', 'creating test cases', 'implementing', 'testing'];

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { logger } from './Logger.js';

export type TaskStatus = 'planned' | 'in-progress' | 'qa-review' | 'done' | 'blocked';
export type StepStatus = 'open' | 'in-progress' | 'done';

interface TaskStep {
  name: string;
  status: StepStatus;
}

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  steps: TaskStep[];
  files: {
    taskMd: string;
    dailyJson: string;
    dailyMd: string;
    planningMd: string;
  };
}

interface DailyJson {
  currentSprint: string;
  currentTask: string;
  status: TaskStatus;
  files: {
    taskMd: string;
    dailyMd: string;
    planningMd: string;
  };
  history: Array<{ timestamp: string; status: TaskStatus; step?: string }>;
}

export class TaskStateMachine {
  // Static utility to load steps and status from a markdown task file
  static parseTaskFile(taskMdPath: string): Task {
    const md = fs.readFileSync(taskMdPath, 'utf-8');
    const titleMatch = md.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Task';
    const statusMatch = md.match(/## Status([\s\S]*?)##/);
    const stepsMatch = md.match(/## Steps([\s\S]*?)(?=##|$)/);
    let status: TaskStatus = 'planned';
    let steps: TaskStep[] = [];
    // Parse substates from Status section
    if (statusMatch) {
      const lines = statusMatch[1].split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        if (line.startsWith('- [x] Planned')) status = 'planned';
        if (line.startsWith('- [x] In Progress')) status = 'in-progress';
        if (line.startsWith('- [x] QA Review')) status = 'qa-review';
        if (line.startsWith('- [x] Done')) status = 'done';
        if (line.startsWith('- [x] Blocked')) status = 'blocked';
      }
      const checkedStatuses = lines.filter(l => l.match(/^- \[x\] (Planned|In Progress|QA Review|Done|Blocked)$/));
      if (checkedStatuses.length > 0) {
        const lastChecked = checkedStatuses[checkedStatuses.length - 1];
        if (lastChecked.includes('Planned')) status = 'planned';
        if (lastChecked.includes('In Progress')) status = 'in-progress';
        if (lastChecked.includes('QA Review')) status = 'qa-review';
        if (lastChecked.includes('Done')) status = 'done';
        if (lastChecked.includes('Blocked')) status = 'blocked';
      }
      // Add substates as steps
      for (const line of lines) {
        const stepMatch = line.match(/^[-\s]+\[( |x)\] (refinement|creating test cases|implementing|testing)$/);
        if (stepMatch) {
          const stepName = stepMatch[2];
          const stepStatus: StepStatus = stepMatch[1] === 'x' ? 'done' : 'open';
          steps.push({ name: stepName, status: stepStatus });
        }
      }
    }
    // Parse Steps section from Intention
    if (stepsMatch) {
      const lines = stepsMatch[1].split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const stepMatch = line.match(/^- \[( |x)\] (.+)$/);
        if (stepMatch) {
          const stepName = stepMatch[2].trim();
          // Avoid duplicates (substates already added)
          if (!steps.some(s => s.name === stepName)) {
            const stepStatus: StepStatus = stepMatch[1] === 'x' ? 'done' : 'open';
            steps.push({ name: stepName, status: stepStatus });
          }
        }
      }
    }
    return {
      id: path.basename(taskMdPath, '.md'),
      title,
      status,
      steps,
      files: {
        taskMd: taskMdPath,
        dailyJson: path.join(tempDir, 'daily.json'),
        dailyMd: path.join(tempDir, 'daily.md'),
        // Try new directory structure first, fallback to old
        planningMd: path.join(tempDir, '../sprints/sprint-3/planning.md'),
      },
    };
  }

  // Progress only one state or step per run
  public progressOne(): string | null {
    // 1. Progress Steps section first (Intention)
    if (this.status === 'planned') {
      // Only progress to 'In Progress' from 'Planned'
      this.logAction('Transitioning status: planned -> in-progress', 'status');
      this.transitionStatus('in-progress');
      this.saveState();
      return 'Status progressed to In Progress.';
    }
    if (this.status === 'in-progress') {
      // Progress substates in order: refinement, creating test cases, implementing
      for (const sub of substateNames) {
        if (sub === 'testing') break; // Do not tick 'testing' yet
        const subObj = this._task.steps.find(s => s.name === sub);
        if (subObj && subObj.status === 'open') {
          this.logAction(`Ticking off substate: ${sub}`, 'step');
          subObj.status = 'done';
          this.updateTaskMd();
          this.saveState();
          return `Substate ticked off: ${sub}`;
        }
      }
      
      // After all substates up to 'implementing' are done, progress steps
      const stepsToProcess = this._task.steps.filter(s => 
        !substateNames.includes(s.name) && s.status === 'open'
      );
      
      if (stepsToProcess.length > 0) {
        const nextStep = stepsToProcess[0];
        this.logAction(`Ticking off step: ${nextStep.name}`, 'step');
        nextStep.status = 'done';
        this.updateTaskMd();
        this.saveState();
        return `Step ticked off: ${nextStep.name}`;
      }
      
      // After all steps are done, tick 'testing' substate
      const testingSub = this._task.steps.find(s => s.name === 'testing');
      if (testingSub && testingSub.status === 'open') {
        this.logAction('Ticking off substate: testing', 'step');
        testingSub.status = 'done';
        this.updateTaskMd();
        this.saveState();
        return 'Substate ticked off: testing';
      }
      
      // After testing is done, progress to QA Review
      this.logAction('Transitioning status: in-progress -> qa-review', 'status');
      this.transitionStatus('qa-review');
      this.saveState();
      return 'Status progressed to QA Review.';
    }
    if (this.status === 'qa-review') {
      // Progress to Done
      this.logAction('Transitioning status: qa-review -> done', 'status');
      this.transitionStatus('done');
      this.saveState();
      return 'Status progressed to Done.';
    }
    if (this.status === 'done') {
      return null; // No more progression possible
    }
    
    return null;
  }
  // Public method to persist state
  public saveState() {
    this.saveDailyJson(this.dailyJson);
  }
  private _task: Task;
  private dailyJsonPath: string;
  private dailyJson: DailyJson;

  constructor(task: Task) {
    this._task = task;
    this.dailyJsonPath = task.files.dailyJson;
    // Always load daily.json at the start for persistent state
    this.dailyJson = this.loadDailyJson();
    // Restore status and steps from daily.json if present
    if (this.dailyJson.status) {
      this._task.status = this.dailyJson.status;
    }
    if (Array.isArray(this.dailyJson.history) && this.dailyJson.history.length > 0) {
      // Restore steps from history (last status for each step)
      const stepStatusMap: Record<string, StepStatus> = {};
      for (const entry of this.dailyJson.history) {
        if (entry.step) {
          stepStatusMap[entry.step] = 'done';
        }
      }
      for (const step of this._task.steps) {
        if (stepStatusMap[step.name]) {
          step.status = stepStatusMap[step.name];
        } else {
          step.status = 'open';
        }
      }
    }
  }

  public get status(): TaskStatus {
    return this._task.status;
  }
  public get steps(): TaskStep[] {
    return this._task.steps;
  }

  private loadDailyJson(): DailyJson {
    if (fs.existsSync(this.dailyJsonPath)) {
      try {
        const content = fs.readFileSync(this.dailyJsonPath, 'utf-8');
        if (!content.trim()) throw new Error('Empty daily.json');
        return JSON.parse(content);
      } catch (e) {
        // If file is empty or corrupted, re-initialize
        const initial: DailyJson = {
          currentSprint: 'Sprint 3',
          currentTask: this._task.id,
          status: this._task.status,
          files: {
            taskMd: this._task.files.taskMd,
            dailyMd: this._task.files.dailyMd,
            planningMd: this._task.files.planningMd,
          },
          history: [],
        };
        this.saveDailyJson(initial);
        return initial;
      }
    }
    // Create initial daily.json if not exists
    const initial: DailyJson = {
      currentSprint: 'Sprint 3',
      currentTask: this._task.id,
      status: this._task.status,
      files: {
        taskMd: this._task.files.taskMd,
        dailyMd: this._task.files.dailyMd,
        planningMd: this._task.files.planningMd,
      },
      history: [],
    };
    this.saveDailyJson(initial);
    return initial;
  }

  private saveDailyJson(data: DailyJson) {
    fs.writeFileSync(this.dailyJsonPath, JSON.stringify(data, null, 2));
  }

  public transitionStatus(newStatus: TaskStatus) {
    this._task.status = newStatus;
    this.dailyJson.status = newStatus;
    this.dailyJson.history.push({
      timestamp: new Date().toISOString(),
      status: newStatus,
    });
    this.saveDailyJson(this.dailyJson);
    this.updateTaskMd();
    this.updateDailyMd();
    this.updatePlanningMd();
  }

  public progressStep(stepName: string, newStatus: StepStatus) {
    const step = this._task.steps.find(s => s.name === stepName);
    if (step) {
      step.status = newStatus;
      this.dailyJson.history.push({
        timestamp: new Date().toISOString(),
        status: this._task.status,
        step: stepName,
      });
      this.saveDailyJson(this.dailyJson);
      // Update the markdown and log the ticked line in blue
      let md = fs.readFileSync(this._task.files.taskMd, 'utf-8');
      let updatedLine = '';
      // Update substates in Status section
      md = md.replace(/(## Status[\s\S]*?)(?=##|$)/, (match) => {
        let lines = match.split('\n');
        lines = lines.map(line => {
          // Match indented substate lines
          const substateMatch = line.match(/^\s*- \[.\] (refinement|creating test cases|implementing|testing)$/);
          if (substateMatch) {
            const name = substateMatch[1];
            if (name === stepName && newStatus === 'done') {
              const indent = line.match(/^\s*/)?.[0] || '';
              updatedLine = `${indent}- [x] ${name}`;
              return updatedLine;
            }
          }
          return line;
        });
        return lines.join('\n');
      });
      // Update Steps section (Intention) for non-substate steps
      md = md.replace(/(## Steps[\s\S]*?)(?=\n##|$)/, (match) => {
        let lines = match.split('\n');
        lines = lines.map(line => {
          const stepMatch = line.match(/^- \[.\] (.+)$/);
          if (stepMatch) {
            const name = stepMatch[1].trim();
            if (name === stepName && newStatus === 'done') {
              updatedLine = `- [x] ${name}`;
              return updatedLine;
            }
          }
          return line;
        });
        return lines.join('\n');
      });
      fs.writeFileSync(this._task.files.taskMd, md);
      if (updatedLine) {
        // Log the ticked line in blue
        logger.log(`[Ticked Line] ${updatedLine}`);
      }
      this.updateDailyMd();
      this.updatePlanningMd();
    }
  }

  private updateTaskMd() {
    // Update both Status section and Steps section
    let md = fs.readFileSync(this._task.files.taskMd, 'utf-8');
    // Update Status section
    md = md.replace(/(## Status[\s\S]*?)(?=\n\n|$)/, (match) => {
      let lines = match.split('\n');
      let statusOrder = ['Planned', 'In Progress', 'QA Review', 'Done', 'Blocked'];
      let checkedIdx = statusOrder.findIndex(s => s.replace(/\s+/g, '').toLowerCase() === this._task.status.replace(/[-\s]+/g, '').toLowerCase());
      lines = lines.map(line => {
        // Tick off all statuses up to and including the current status
        for (let i = 0; i < statusOrder.length; i++) {
          const status = statusOrder[i];
          if (line.trim().startsWith('- [') && line.trim().includes(status)) {
            return i <= checkedIdx ? `- [x] ${status}` : `- [ ] ${status}`;
          }
        }
        return line;
      });
      // Progress in-progress substates (indented)
      lines = lines.map(line => {
        const stepMatch = line.match(/^- \[.\] (refinement|creating test cases|implementing|testing)$/);
        if (stepMatch) {
          const stepName = stepMatch[1];
          const stepObj = this.steps.find(s => s.name === stepName);
          const done = stepObj && stepObj.status === 'done';
          const indent = line.match(/^\s*/)?.[0] || '';
          return `${indent}- [${done ? 'x' : ' '}] ${stepName}`;
        }
        return line;
      });
      return lines.join('\n');
    });
    // Update Steps section in Intention
    md = md.replace(/(## Steps[\s\S]*?)(?=\n##|$)/, (match) => {
      let lines = match.split('\n');
      lines = lines.map(line => {
        const stepMatch = line.match(/^- \[.\] (.+)$/);
        if (stepMatch) {
          const stepName = stepMatch[1].trim();
          const stepObj = this.steps.find(s => s.name === stepName);
          const done = stepObj && stepObj.status === 'done';
          return `- [${done ? 'x' : ' '}] ${stepName}`;
        }
        return line;
      });
      return lines.join('\n');
    });
    fs.writeFileSync(this._task.files.taskMd, md);
  }
  // Logging utility
  public logAction(action: string, type: 'status' | 'step' | 'error' | 'reset' | 'blue' | 'gray' = 'status') {
    const timestamp = new Date().toISOString();
    let colorStart = '';
    let colorEnd = '';
    
    // Check if colors are supported
    const supportsColor = process.stdout.isTTY && process.env.TERM !== 'dumb';
    
    if (supportsColor) {
      colorEnd = '\x1b[0m';
      if (type === 'status') colorStart = '\x1b[33m'; // yellow
      if (type === 'step') colorStart = '\x1b[34m'; // blue
      if (type === 'error') colorStart = '\x1b[31m'; // red
      if (type === 'reset') colorStart = '\x1b[36m'; // cyan
      if (type === 'blue') colorStart = '\x1b[34m'; // blue
      if (type === 'gray') colorStart = '\x1b[90m'; // gray
    }
    
    logger.logAction(action, type);
  }

  private updateDailyMd() {
    // Regenerate daily.md from daily.json
    let content = `# Daily Status\n\nSprint: ${this.dailyJson.currentSprint}\nTask: ${this.dailyJson.currentTask}\nStatus: ${this.dailyJson.status}\n\nHistory:\n`;
    for (const entry of this.dailyJson.history) {
      content += `- ${entry.timestamp}: ${entry.status}${entry.step ? ` (${entry.step})` : ''}\n`;
    }
    fs.writeFileSync(this._task.files.dailyMd, content);
  }

  private updatePlanningMd() {
    // Read the existing planning.md file
    let content = fs.readFileSync(this._task.files.planningMd, 'utf-8');
    
    // Extract task number from the task title or ID
    const taskMatch = this._task.title.match(/Task (\d+):/);
    if (!taskMatch) {
      this.logAction('Could not extract task number from title', 'error');
      return;
    }
    const taskNumber = taskMatch[1];
    
    // Find the specific task line and update its status
    const lines = content.split('\n');
    const updatedLines = lines.map(line => {
      // Look for the specific task line (e.g., "- [ ] [Task 18: ...")
      const taskLineMatch = line.match(new RegExp(`^- \\[ \\] \\[Task ${taskNumber}:`));
      if (taskLineMatch) {
        // Update the checkbox based on status
        const checkbox = this._task.status === 'done' ? '- [x]' : '- [ ]';
        return line.replace(/^- \[ \]/, checkbox);
      }
      return line;
    });
    
    // Write back the updated content
    fs.writeFileSync(this._task.files.planningMd, updatedLines.join('\n'));
  }

  public resetToPlanned() {
    this._task.status = 'planned';
    for (const step of this._task.steps) {
      step.status = 'open';
    }
    // Clear dailyJson history and set status to planned
    this.dailyJson.status = 'planned';
    this.dailyJson.history = [];
    this.saveDailyJson(this.dailyJson);

    // Reset the markdown file to all unchecked status and steps, with correct spacing
    let md = fs.readFileSync(this._task.files.taskMd, 'utf-8');
    md = md.replace(/(## Status[\s\S]*?)(?=##|$)/, (match) => {
      return [
        '## Status',
        '- [ ] Planned',
        '- [ ] In Progress',
        '  - [ ] refinement',
        '  - [ ] creating test cases',
        '  - [ ] implementing',
        '  - [ ] testing',
        '- [ ] QA Review',
        '- [ ] Done',
        '',
        '',
      ].join('\n');
    });
    // Also reset all steps in the Steps section in Intention
    md = md.replace(/(## Steps[\s\S]*?)(?=\n##|$)/, (match) => {
      let lines = match.split('\n');
      lines = lines.map(line => {
        const stepMatch = line.match(/^- \[.\] (.+)$/);
        if (stepMatch) {
          const stepName = stepMatch[1].trim();
          return `- [ ] ${stepName}`;
        }
        return line;
      });
      return lines.join('\n');
    });
    fs.writeFileSync(this._task.files.taskMd, md);

    this.updateDailyMd();
    this.updatePlanningMd();
    this.logAction('State machine reset to Planned and daily history cleared. Markdown file and all steps reset to initial state.');
  }

  public reset(): string {
    // Reset status to planned
    this._task.status = 'planned';
    
    // Reset all substates
    for (const sub of substateNames) {
      const subObj = this._task.steps.find(s => s.name === sub);
      if (subObj) {
        subObj.status = 'open';
      }
    }
    
    // Reset all steps (find and uncheck all step checkboxes)
    let md = fs.readFileSync(this._task.files.taskMd, 'utf-8');
    md = md.replace(/(## Status[\s\S]*?)(?=##|$)/, (match) => {
      let lines = match.split('\n');
      lines = lines.map(line => {
        // Uncheck step checkboxes (lines starting with - [x] that are not substates)
        if (line.trim().match(/^- \[x\] .+/) && 
            !line.includes('refinement') && 
            !line.includes('creating test cases') && 
            !line.includes('implementing') && 
            !line.includes('testing')) {
          return line.replace('- [x]', '- [ ]');
        }
        // Uncheck status checkboxes
        if (line.trim().match(/^- \[x\] (Planned|In Progress|QA Review|Done)/)) {
          return line.replace('- [x]', '- [ ]');
        }
        // Uncheck substate checkboxes
        if (line.trim().match(/^- \[x\] (refinement|creating test cases|implementing|testing)/)) {
          return line.replace('- [x]', '- [ ]');
        }
        return line;
      });
      return lines.join('\n');
    });
    md = md.replace(/(## Steps[\s\S]*?)(?=\n##|$)/, (match) => {
      let lines = match.split('\n');
      lines = lines.map(line => {
        const stepMatch = line.match(/^- \[.\] (.+)$/);
        if (stepMatch) {
          const stepName = stepMatch[1].trim();
          return `- [ ] ${stepName}`;
        }
        return line;
      });
      return lines.join('\n');
    });
    fs.writeFileSync(this._task.files.taskMd, md);
    
    // Clear daily history
    if (fs.existsSync(this.dailyJsonPath)) {
      const dailyData = JSON.parse(fs.readFileSync(this.dailyJsonPath, 'utf-8'));
      if (dailyData.currentTask === this._task.id) {
        dailyData.status = 'planned';
        dailyData.history = [];
        fs.writeFileSync(this.dailyJsonPath, JSON.stringify(dailyData, null, 2));
      }
    }
    
    this.logAction('Task reset to Planned state. All steps and substates cleared.', 'reset');
    return 'Task reset to Planned state.';
  }
}


// --- Strict OOP Progression Example ---
import { fileURLToPath } from 'url';
const tempDir = path.dirname(fileURLToPath(import.meta.url));





class TaskStateMachineCLI {
  private args: string[];
  private doReset = false;
  private taskNum?: string;
  private sm?: TaskStateMachine;
  private taskObj?: Task;
  private taskFilePath?: string;
  private dailyJsonPath: string;

  constructor(args: string[]) {
    this.args = args;
    this.dailyJsonPath = path.join(tempDir, 'daily.json');
    this.run();
  }

  // Find the task file for a given task number using glob
  private findTaskFile(taskNum: string): string | undefined {
    // Try new directory structure first
    let sprintDir = path.join(tempDir, '../sprints/sprint-3');
    let pattern = `task-${taskNum}-*.md`;
    let matches = globSync(pattern, { cwd: sprintDir });
    
    if (matches.length === 0) {
      // Fallback to old directory structure
      sprintDir = path.join(tempDir, '../sprints/iteration-3');
      pattern = `iteration-3-task-${taskNum}-*.md`;
      matches = globSync(pattern, { cwd: sprintDir });
    }
    
    if (matches.length > 0) {
      return path.join(sprintDir, matches[0]);
    }
    return undefined;
  }

  private run() {
    if (this.args.length === 3 && this.args[0] === 'testing' && this.args[1] === 'task') {
      this.taskNum = this.args[2];
      if (!this.taskNum) {
        console.error(`\x1b[31mError: Task number is undefined.\x1b[0m`);
        process.exit(1);
      }
      this.taskFilePath = this.findTaskFile(this.taskNum);
      if (!this.taskFilePath) {
        console.error(`\x1b[31mError: Could not find task file for task ${this.taskNum}.\x1b[0m`);
        process.exit(1);
      }
      this.taskObj = TaskStateMachine.parseTaskFile(this.taskFilePath);
      this.sm = new TaskStateMachine(this.taskObj);
      if (typeof this.sm.resetToPlanned === 'function') {
        this.sm.resetToPlanned();
        this.sm.logAction(`Testing mode: Reset task ${this.taskNum} to Planned`, 'gray');
      }
      let result;
      if (!this.sm) {
        console.error('Error: TaskStateMachine not initialized.');
        process.exit(1);
      }
      // Loop guard: exit if already done
      if (this.sm.status === ('done' as TaskStatus)) {
        this.sm.logAction('Task is already done. Exiting test loop.', 'blue');
        return;
      }
      // Substate progression
      for (const sub of substateNames) {
        if (this.sm.steps.find(s => s.name === sub)?.status !== 'done') {
          result = this.sm.progressOne();
          this.sm.logAction(`Testing mode: ${result}`, 'gray');
        }
      }
      // Steps progression with max iteration limit
      let stepIterations = 0;
      const MAX_STEP_ITER = 50;
      while (true) {
        if (this.sm.status === ('done' as TaskStatus)) {
          this.sm.logAction('Task is done. Exiting step loop.', 'status');
          break;
        }
        if (++stepIterations > MAX_STEP_ITER) {
          this.sm.logAction('Max step iterations reached. Exiting to prevent infinite loop.', 'error');
          break;
        }
        const implementingDone = this.sm.steps.find(s => s.name === 'implementing')?.status === 'done';
        if (!implementingDone) break;
        const nextStepIdx = this.sm.steps.findIndex(s => s.status !== 'done' && !substateNames.includes(s.name));
        if (nextStepIdx !== -1) {
          result = this.sm.progressOne();
          this.sm.logAction(`Testing mode: ${result}`, 'gray');
        } else {
          break;
        }
      }
      // Testing substate progression
      if (this.sm.status !== ('done' as TaskStatus) && this.sm.steps.find(s => s.name === 'testing')?.status !== 'done') {
        result = this.sm.progressOne();
        this.sm.logAction(`Testing mode: ${result}`, 'gray');
      }
      // Final status progression with max iteration limit
      let statusIterations = 0;
      const MAX_STATUS_ITER = 10;
      for (let i = 0; i < MAX_STATUS_ITER; i++) {
        if (this.sm.status === ('done' as TaskStatus)) {
          this.sm.logAction('Task is done. Exiting status loop.', 'status');
          break;
        }
        const allSubstatesDone = substateNames.every(sub => {
          const subObj = this.sm!.steps.find(s => s.name === sub);
          return subObj && subObj.status === 'done';
        });
        if (allSubstatesDone && this.sm.steps.find(s => s.name === 'testing')?.status === 'done') {
          result = this.sm.progressOne();
          this.sm.logAction(`Testing mode: ${result}`, 'gray');
        }
      }
      this.sm.saveState();
      this.sm.logAction('Testing mode: Full progression complete.', 'gray');
    } else if (this.args.length >= 3 && this.args[0] === 'task' && this.args[2] === 'reset') {
      this.taskNum = this.args[1];
      if (!this.taskNum) {
        console.error(`\x1b[31mError: Task number is undefined.\x1b[0m`);
        process.exit(1);
      }
      this.taskFilePath = this.findTaskFile(this.taskNum);
      if (!this.taskFilePath) {
        console.error(`\x1b[31mError: Could not find task file for task ${this.taskNum}.\x1b[0m`);
        process.exit(1);
      }
      this.taskObj = TaskStateMachine.parseTaskFile(this.taskFilePath);
      this.sm = new TaskStateMachine(this.taskObj);
      this.doReset = true;
    } else if (this.args.length === 3 && this.args[0] === 'reset' && this.args[1] === 'task') {
      const taskNumber = this.args[2];
      const taskFilePath = this.findTaskFile(taskNumber);
      
      if (!taskFilePath) {
        console.error(`\x1b[31mError: Task file for task ${taskNumber} not found.\x1b[0m`);
        process.exit(1);
      }
      
      const taskObj = TaskStateMachine.parseTaskFile(taskFilePath);
      this.sm = new TaskStateMachine(taskObj);
      
      if (!this.sm) {
        console.error('\x1b[31mError: TaskStateMachine not initialized.\x1b[0m');
        process.exit(1);
      }
      
      const result = this.sm.reset();
      console.log(`\x1b[36mResult: ${result}\x1b[0m`);
      return;
    }
    else if (fs.existsSync(this.dailyJsonPath)) {
      const dailyJson = JSON.parse(fs.readFileSync(this.dailyJsonPath, 'utf-8'));
      this.taskNum = dailyJson.currentTask.replace('iteration-3-task-', '').replace(/-.+$/, '');
      if (!this.taskNum) {
        console.error(`\x1b[31mError: Task number is undefined.\x1b[0m`);
        process.exit(1);
      }
      this.taskFilePath = this.findTaskFile(this.taskNum);
      if (!this.taskFilePath) {
        console.error(`\x1b[31mError: Could not find task file for task ${this.taskNum}.\x1b[0m`);
        process.exit(1);
      }
      this.taskObj = TaskStateMachine.parseTaskFile(this.taskFilePath);
      this.sm = new TaskStateMachine(this.taskObj);
    } else {
      console.error('\x1b[31mError: No daily.json found. Please run with a task number (e.g., "task 18" or "task 18 reset").\x1b[0m');
      process.exit(1);
    }

    if (this.sm) {
      if (this.doReset) {
        if (typeof this.sm.resetToPlanned === 'function') {
          this.sm.resetToPlanned();
          console.log(`\x1b[36mTask ${this.taskNum} has been reset to planned.\x1b[0m`);
        } else {
          this.sm.logAction('resetToPlanned method not found on TaskStateMachine', 'error');
        }
      } else if (this.args.length !== 3 || this.args[0] !== 'testing') {
        const result = this.sm.progressOne();
        if (result) {
          console.log('Result:', result);
        }
      }
    }
  }
}

new TaskStateMachineCLI(process.argv.slice(2));
