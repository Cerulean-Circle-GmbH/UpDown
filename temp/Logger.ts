/**
 * Logger Class - Comprehensive logging with colored output and log levels
 * Follows DRY principle and radical OOP programming
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  LOG = 2,
  DEBUG = 3,
  TESTING = 4
}

export enum LogType {
  LOG = 'log',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
  STATUS = 'status',
  STEP = 'step',
  PROGRESSION = 'progression',
  TESTING = 'testing'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  type: LogType;
  message: string;
  context?: string;
}

export class Logger {
  private static instance: Logger;
  private currentLevel: LogLevel = LogLevel.LOG;
  private context: string = 'TaskStateMachine';
  private supportsColor: boolean;

  private constructor() {
    this.supportsColor = process.stdout.isTTY && process.env.TERM !== 'dumb';
  }

  /**
   * Singleton pattern for logger instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set the current log level
   */
  public setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Set the context for logging
   */
  public setContext(context: string): void {
    this.context = context;
  }

  /**
   * Get color code for log type
   */
  private getColorCode(type: LogType): string {
    if (!this.supportsColor) return '';
    
    const colorMap: Record<LogType, string> = {
      [LogType.LOG]: '\x1b[37m',      // white
      [LogType.WARN]: '\x1b[33m',     // yellow
      [LogType.ERROR]: '\x1b[31m',    // red
      [LogType.DEBUG]: '\x1b[34m',    // blue
      [LogType.STATUS]: '\x1b[32m',   // green
      [LogType.STEP]: '\x1b[34m',     // blue
      [LogType.PROGRESSION]: '\x1b[33m', // yellow
      [LogType.TESTING]: '\x1b[90m'   // gray
    };
    
    return colorMap[type] || '';
  }

  /**
   * Get reset color code
   */
  private getResetCode(): string {
    return this.supportsColor ? '\x1b[0m' : '';
  }

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(level: LogLevel, type: LogType, message: string): string {
    const timestamp = new Date().toISOString();
    const colorStart = this.getColorCode(type);
    const colorEnd = this.getResetCode();
    
    return `${colorStart}[${this.context}] ${timestamp} - ${message}${colorEnd}`;
  }

  /**
   * Core logging method following DRY principle
   */
  private logInternal(level: LogLevel, type: LogType, message: string): void {
    if (level <= this.currentLevel) {
      const formattedMessage = this.formatMessage(level, type, message);
      console.log(formattedMessage);
    }
  }

  /**
   * Standard logging methods
   */
  public log(message: string): void {
    this.logInternal(LogLevel.LOG, LogType.LOG, message);
  }

  public warn(message: string): void {
    this.logInternal(LogLevel.WARN, LogType.WARN, message);
  }

  public error(message: string): void {
    this.logInternal(LogLevel.ERROR, LogType.ERROR, message);
  }

  public debug(message: string): void {
    this.logInternal(LogLevel.DEBUG, LogType.DEBUG, message);
  }

  /**
   * Action logging for state machine (backward compatibility)
   */
  public logAction(action: string, type: 'status' | 'step' | 'error' | 'reset' | 'progression' | 'testing' | 'blue' | 'gray' = 'status'): void {
    const typeMap: Record<string, LogType> = {
      'status': LogType.STATUS,
      'step': LogType.STEP,
      'error': LogType.ERROR,
      'reset': LogType.DEBUG,
      'progression': LogType.PROGRESSION,
      'testing': LogType.TESTING,
      'blue': LogType.STEP, // Map blue to step (blue color)
      'gray': LogType.TESTING // Map gray to testing (gray color)
    };
    
    const logType = typeMap[type] || LogType.LOG;
    this.logInternal(LogLevel.LOG, logType, action);
  }

  /**
   * Get current log level
   */
  public getLevel(): LogLevel {
    return this.currentLevel;
  }

  /**
   * Check if a log level is enabled
   */
  public isLevelEnabled(level: LogLevel): boolean {
    return level <= this.currentLevel;
  }
}

// Export singleton instance
export const logger = Logger.getInstance(); 