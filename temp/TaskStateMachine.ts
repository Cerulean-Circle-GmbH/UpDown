// TaskStateMachine.ts
// OOP implementation for Task 18 state management

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
      return JSON.parse(fs.readFileSync(this.dailyJsonPath, 'utf-8'));
    }
    // Create initial daily.json
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
    // Only update the status and in-progress substates checkboxes, preserve all other content
    let md = fs.readFileSync(this._task.files.taskMd, 'utf-8');
    // Update main status checkboxes and in-progress substates only
    md = md.replace(/(## Status[\s\S]*?)(?=##|$)/, (match) => {
      let lines = match.split('\n');
      let statusOrder: TaskStatus[] = ['planned', 'in-progress', 'qa-review', 'done', 'blocked'];
      // Only one status can be checked at a time: the most advanced
      let checkedIdx = statusOrder.indexOf(this._task.status);
      lines = lines.map(line => {
        for (let i = 0; i < statusOrder.length; i++) {
          const status = statusOrder[i];
          if (line.match(new RegExp(`^- \[.\] ${status.replace('-', ' ')}$`, 'i'))) {
            return `- [${i === checkedIdx ? 'x' : ' '}] ${status.replace('-', ' ')}`;
          }
        }
        return line;
      });
      // Progress in-progress substates (indented)
      lines = lines.map(line => {
        const stepMatch = line.match(/^- \[.\] (refinement|creating test cases|implementing|testing)$/);
        if (stepMatch) {
          const stepName = stepMatch[1];
          const stepObj = this._task.steps.find(s => s.name === stepName);
          const done = stepObj && stepObj.status === 'done';
          // Preserve indentation
          const indent = line.match(/^\s*/)?.[0] || '';
          return `${indent}- [${done ? 'x' : ' '}] ${stepName}`;
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
    this.updateTaskMd();
    this.updateDailyMd();
    this.updatePlanningMd();
    this.logAction('State machine reset to Planned and daily history cleared.');
  }
}


// --- Strict OOP Progression Example ---
import { fileURLToPath } from 'url';
const tempDir = path.dirname(fileURLToPath(import.meta.url));

// Utility to load steps and status from a markdown task file
function parseTaskFile(taskMdPath: string): Task {
  const md = fs.readFileSync(taskMdPath, 'utf-8');
  const titleMatch = md.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled Task';
  const statusMatch = md.match(/## Status([\s\S]*?)##/);
  let status: TaskStatus = 'planned';
  let steps: TaskStep[] = [];
  if (statusMatch) {
    const lines = statusMatch[1].split('\n').map(l => l.trim()).filter(Boolean);
    // Find which main status is checked
    for (const line of lines) {
      if (line.startsWith('- [x] Planned')) status = 'planned';
      if (line.startsWith('- [x] In Progress')) status = 'in-progress';
      if (line.startsWith('- [x] QA Review')) status = 'qa-review';
      if (line.startsWith('- [x] Done')) status = 'done';
      if (line.startsWith('- [x] Blocked')) status = 'blocked';
    }
    // If multiple are checked, pick the last one (most advanced)
    const checkedStatuses = lines.filter(l => l.match(/^- \[x\] (Planned|In Progress|QA Review|Done|Blocked)$/));
    if (checkedStatuses.length > 0) {
      const lastChecked = checkedStatuses[checkedStatuses.length - 1];
      if (lastChecked.includes('Planned')) status = 'planned';
      if (lastChecked.includes('In Progress')) status = 'in-progress';
      if (lastChecked.includes('QA Review')) status = 'qa-review';
      if (lastChecked.includes('Done')) status = 'done';
      if (lastChecked.includes('Blocked')) status = 'blocked';
    }
    // Match indented step checkboxes
    for (const line of lines) {
      const stepMatch = line.match(/^[-\s]+\[( |x)\] (refinement|creating test cases|implementing|testing)$/);
      if (stepMatch) {
        const stepName = stepMatch[2];
        const stepStatus: StepStatus = stepMatch[1] === 'x' ? 'done' : 'open';
        steps.push({ name: stepName, status: stepStatus });
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
function progressOne(sm: TaskStateMachine): string | null {
  if (sm.status === 'planned') {
    // Only transition to in-progress if all steps are open
    const allStepsOpen = sm.steps.every(s => s.status === 'open');
    if (allStepsOpen) {
      sm.logAction('Transitioning status: planned -> in-progress', 'status');
      sm.transitionStatus('in-progress');
      // Immediately progress the first unticked step
      for (const step of sm.steps) {
        if (step.status !== 'done') {
          sm.logAction(`Progressing substate: ${step.name} -> done`, 'step');
          sm.progressStep(step.name, 'done');
          // Persist state to daily.json
          sm.saveState();
          const nextStep = sm.steps.find(s => s.status !== 'done');
          return nextStep
            ? `Status progressed to In Progress. Substate progressed: ${step.name}. Next step: ${nextStep.name}`
            : `Status progressed to In Progress. Substate progressed: ${step.name}. All steps done.`;
        }
      }
      // Persist state to daily.json
      sm.saveState();
      return 'Status progressed to In Progress.';
    } else {
      // If any step is done, treat as in-progress
      sm.transitionStatus('in-progress');
      sm.saveState();
    }
  }
  if (sm.status === 'in-progress') {
    // Progress only one step per run
    for (const step of sm.steps) {
      if (step.status !== 'done') {
        sm.logAction(`Progressing substate: ${step.name} -> done`, 'step');
        // Use progressStep to update status and tick markdown
        sm.progressStep(step.name, 'done');
        sm.saveState();
        const nextStep = sm.steps.find(s => s.status !== 'done');
        return nextStep
          ? `Substate progressed: ${step.name}. Next step: ${nextStep.name}`
          : `Substate progressed: ${step.name}. All steps done.`;
      }
    }
    // If all steps are done, progress to QA Review
    sm.logAction('Transitioning status: in-progress -> qa-review', 'status');
    sm.transitionStatus('qa-review');
    sm.saveState();
    return 'Status progressed to QA Review.';
  }
  if (sm.status === 'qa-review') {
    sm.logAction('Transitioning status: qa-review -> done', 'status');
    sm.transitionStatus('done');
    sm.saveState();
    return 'Status progressed to Done.';
  }
  sm.logAction('No valid progression found. Possible error.', 'error');
  sm.saveState();
  return null;
}

// Usage: works for any task file, currently using Task 18
// Command line interface
const args = process.argv.slice(2);
let taskNum = '18';
let doReset = false;
if (args.length >= 3 && args[0] === 'task' && args[2] === 'reset') {
  taskNum = args[1];
  doReset = true;
}
const taskFilePath = path.join(tempDir, `../sprints/iteration-3/iteration-3-task-${taskNum}-implement-task-state-machine.md`);
const taskObj = parseTaskFile(taskFilePath);
const sm = new TaskStateMachine(taskObj);

if (doReset) {
  if (typeof sm.resetToPlanned === 'function') {
    sm.resetToPlanned();
    console.log(`\x1b[36mTask ${taskNum} has been reset to planned.\x1b[0m`);
  } else {
    sm.logAction('resetToPlanned method not found on TaskStateMachine', 'error');
  }
} else {
  const result = progressOne(sm);
  if (result) {
    console.log('Result:', result);
  }
}
