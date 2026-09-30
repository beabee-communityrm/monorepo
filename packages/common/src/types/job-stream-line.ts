/** Log levels a Job can emit, matching the backend's syslog levels */
export type JobLogLevel = 'info' | 'warning' | 'error';

export interface JobLogLine {
  type: 'log';
  level: JobLogLevel;
  message: string;
}

export type JobResultLine =
  | { type: 'result'; status: 'ok' }
  | { type: 'result'; status: 'error'; message: string };

/** One NDJSON line of a running Job's response: log lines, then one result */
export type JobStreamLine = JobLogLine | JobResultLine;
