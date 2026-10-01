/** Log levels a Job can emit, matching the backend's syslog levels */
export type JobLogLevel = 'info' | 'warning' | 'error';

export interface JobLogLine {
  type: 'log';
  level: JobLogLevel;
  message: string;
}

/** Sent while the job is silent so idle timeouts do not cut the stream */
export interface JobPingLine {
  type: 'ping';
}

export type JobResultLine =
  | { type: 'result'; status: 'ok' }
  | { type: 'result'; status: 'error'; message: string };

/** One NDJSON line of a running Job's response: log and ping lines, then one result */
export type JobStreamLine = JobLogLine | JobPingLine | JobResultLine;
