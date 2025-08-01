// TaskStateMachine.ts
// OOP implementation for Task 18 state management
// Substates for in-progress
const substateNames = ['refinement', 'creating test cases', 'implementing', 'testing'];

import fs from 'fs';
import path from 'path';

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
        planningMd: path.join(tempDir, 'planning.md'),
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
      // Progress substates in order: refinement, creating test cases, implementing, testing
      for (const sub of substateNames) {
        const subObj = this.steps.find(s => s.name === sub);
        if (subObj && subObj.status !== 'done') {
          if (sub === 'implementing') {
            // If 'implementing' is not done, tick it off
            this.progressStep('implementing', 'done');
            this.logAction(`Substate ticked off: implementing`, 'step');
            return `Substate ticked off: implementing`;
          } else {
            // For other substates, just tick them off
            this.progressStep(sub, 'done');
            this.logAction(`Substate ticked off: ${sub}`, 'step');
            return `Substate ticked off: ${sub}`;
          }
        }
      }
      // After 'implementing' is done, iterate Steps section (one per run)
      const implementingDone = this.steps.find(s => s.name === 'implementing')?.status === 'done';
      if (implementingDone) {
        // Only tick off 'testing' after all steps are done
        const allStepsDone = this.steps.filter(s => !substateNames.includes(s.name)).every(s => s.status === 'done');
        const testingObj = this.steps.find(s => s.name === 'testing');
        if (!allStepsDone) {
          const nextStepIdx = this.steps.findIndex(s => s.status !== 'done' && !substateNames.includes(s.name));
          if (nextStepIdx !== -1) {
            const step = this.steps[nextStepIdx];
            this.progressStep(step.name, 'done');
            this.logAction(`Step ticked off: ${step.name}`, 'step');
            return `Step ticked off: ${step.name}`;
          }
        } else if (testingObj && testingObj.status !== 'done') {
          this.progressStep('testing', 'done');
          this.logAction(`Substate ticked off: testing`, 'step');
          return `Substate ticked off: testing`;
        }
      }
      // If all substates and testing are done, progress main status
      const allSubstatesDone = substateNames.every(sub => {
        const subObj = this.steps.find(s => s.name === sub);
        return subObj && subObj.status === 'done';
      });
      if (allSubstatesDone && this.steps.find(s => s.name === 'testing')?.status === 'done') {
        this.logAction('Transitioning status: in-progress -> qa-review', 'status');
        this.transitionStatus('qa-review');
        this.saveState();
        return 'Status progressed to QA Review.';
      }
      this.saveState();
      return null;
    }

    // 2. If status is qa-review, tick it off and move to done
    if (this.status === 'qa-review') {
      this.logAction('Transitioning status: qa-review -> done', 'status');
      this.transitionStatus('done');
      this.saveState();
      return 'Status progressed to Done.';
    }

    // 3. If status is done, nothing to do
    if (this.status === 'done') {
      this.logAction('Task is already done. No further progression.', 'status');
      this.saveState();
      return 'Task is already done.';
    }

    this.logAction('No valid progression found. Possible error.', 'error');
    this.saveState();
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
      md = md.replace(/(## Status[\s\S]*?)(?=##|$)/, (match) => {
        let lines = match.split('\n');
        lines = lines.map(line => {
          // Match indented step lines
          const stepMatch = line.match(/^\s*- \[.\] (refinement|creating test cases|implementing|testing)$/);
          if (stepMatch) {
            const name = stepMatch[1];
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
      fs.writeFileSync(this._task.files.taskMd, md);
      if (updatedLine) {
        // Log the ticked line in blue
        console.log(`\x1b[34m[Ticked Line] ${updatedLine}\x1b[0m`);
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
  public logAction(action: string, type: 'status' | 'step' | 'error' = 'status') {
    const timestamp = new Date().toISOString();
    let colorStart = '';
    let colorEnd = '\x1b[0m';
    if (type === 'status') colorStart = '\x1b[33m'; // yellow
    if (type === 'step') colorStart = '\x1b[32m'; // green
    if (type === 'error') colorStart = '\x1b[31m'; // red
    console.log(`${colorStart}[TaskStateMachine] ${timestamp} - ${action}${colorEnd}`);
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
    // Simple planning update
    let content = `# Planning\n\nTask: ${this._task.title}\nStatus: ${this._task.status}\n`;
    fs.writeFileSync(this._task.files.planningMd, content);
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
}


// --- Strict OOP Progression Example ---
import { fileURLToPath } from 'url';
const tempDir = path.dirname(fileURLToPath(import.meta.url));




// CLI orchestration: only instantiate and call class methods
const args = process.argv.slice(2);
let doReset = false;
let taskNum: string | undefined = undefined;
let sm: TaskStateMachine | undefined = undefined;
let taskObj: Task | undefined = undefined;
let taskFilePath: string | undefined = undefined;

const dailyJsonPath = path.join(tempDir, 'daily.json');

if (args.length === 3 && args[0] === 'testing' && args[1] === 'task') {
  // Full test run: reset and progress through all states in one go
  taskNum = args[2];
  taskFilePath = path.join(tempDir, `../sprints/iteration-3/iteration-3-task-${taskNum}-implement-task-state-machine.md`);
  taskObj = TaskStateMachine.parseTaskFile(taskFilePath);
  sm = new TaskStateMachine(taskObj);
  if (typeof sm.resetToPlanned === 'function') {
    sm.resetToPlanned();
    sm.logAction(`Testing mode: Reset task ${taskNum} to Planned`, 'status');
  }
  // Progress substates
  let result;
  if (!sm) {
    console.error('Error: TaskStateMachine not initialized.');
    process.exit(1);
  }
  for (const sub of substateNames) {
    if (sm.steps.find(s => s.name === sub)?.status !== 'done') {
      result = sm.progressOne();
      sm.logAction(`Testing mode: ${result}`, 'step');
    }
  }
  // Progress steps after 'implementing' is done
  while (true) {
    const implementingDone = sm.steps.find(s => s.name === 'implementing')?.status === 'done';
    if (!implementingDone) break;
    const nextStepIdx = sm.steps.findIndex(s => s.status !== 'done' && !substateNames.includes(s.name));
    if (nextStepIdx !== -1) {
      result = sm.progressOne();
      sm.logAction(`Testing mode: ${result}`, 'step');
    } else {
      break;
    }
  }
  // Tick off 'testing' after all steps
  if (sm.steps.find(s => s.name === 'testing')?.status !== 'done') {
    result = sm.progressOne();
    sm.logAction(`Testing mode: ${result}`, 'step');
  }
  // Progress main status to QA Review and Done
  for (let i = 0; i < 2; i++) {
    const allSubstatesDone = substateNames.every(sub => {
      const subObj = sm.steps.find(s => s.name === sub);
      return subObj && subObj.status === 'done';
    });
    if (allSubstatesDone && sm.steps.find(s => s.name === 'testing')?.status === 'done') {
      result = sm.progressOne();
      sm.logAction(`Testing mode: ${result}`, 'status');
    }
  }
  sm.saveState();
  sm.logAction('Testing mode: Full progression complete.', 'status');
}

if (args.length >= 3 && args[0] === 'task' && args[2] === 'reset') {
  // Explicit reset: require 'task <num> reset'
  taskNum = args[1];
  taskFilePath = path.join(tempDir, `../sprints/iteration-3/iteration-3-task-${taskNum}-implement-task-state-machine.md`);
  taskObj = TaskStateMachine.parseTaskFile(taskFilePath);
  sm = new TaskStateMachine(taskObj);
  doReset = true;
} else if (fs.existsSync(dailyJsonPath)) {
  // Autonomous progression: no parameter needed
  const dailyJson = JSON.parse(fs.readFileSync(dailyJsonPath, 'utf-8'));
  taskNum = dailyJson.currentTask.replace('iteration-3-task-', '').replace('-implement-task-state-machine', '');
  taskFilePath = path.join(tempDir, `../sprints/iteration-3/iteration-3-task-${taskNum}-implement-task-state-machine.md`);
  taskObj = TaskStateMachine.parseTaskFile(taskFilePath);
  sm = new TaskStateMachine(taskObj);
} else {
  // Require task number parameter if no daily.json
  console.error('\x1b[31mError: No daily.json found. Please run with a task number (e.g., "task 18" or "task 18 reset").\x1b[0m');
  process.exit(1);
}

if (sm) {
  if (doReset) {
    if (typeof sm.resetToPlanned === 'function') {
      sm.resetToPlanned();
      console.log(`\x1b[36mTask ${taskNum} has been reset to planned.\x1b[0m`);
    } else {
      sm.logAction('resetToPlanned method not found on TaskStateMachine', 'error');
    }
  } else {
    const result = sm.progressOne();
    if (result) {
      console.log('Result:', result);
    }
  }
}
