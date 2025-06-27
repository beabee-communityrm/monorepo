export interface CommandDefinition {
  /** Unique command name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Command parameters/arguments */
  parameters: CommandParameter[];
  /** Usage examples */
  examples?: CommandExample[];
  /** Category for grouping commands */
  category?: string;
}

export interface CommandParameter {
  /** Parameter name */
  name: string;
  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'array';
  /** Parameter description */
  description: string;
  /** Whether parameter is required */
  required?: boolean;
  /** Default value */
  default?: any;
  /** Allowed values (for enum-like parameters) */
  choices?: string[];
  /** Alias for the parameter */
  alias?: string;
}

export interface CommandExample {
  /** Example command usage */
  command: string;
  /** Description of what the example does */
  description: string;
}

export interface CommandResult {
  /** Whether command executed successfully */
  success: boolean;
  /** Result data (for successful commands) */
  data?: any;
  /** Success/info message */
  message?: string;
  /** Error message (for failed commands) */
  error?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface CommandHandler<T = any> {
  /** Execute the command with given arguments */
  (args: T): Promise<CommandResult>;
}

export interface CommandContext {
  /** Base directory for command execution */
  baseDir: string;
  /** Whether to show verbose output */
  verbose?: boolean;
  /** Additional context data */
  metadata?: Record<string, any>;
}
