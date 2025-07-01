/**
 * Arguments for starting the MCP server
 */
export interface McpServerArgs {
  /** Port to run the server on (if using TCP transport) */
  port?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Server name */
  name?: string;
  /** Server version */
  version?: string;
}

/**
 * MCP Tool definition interface
 */
export interface McpToolDefinition {
  /** Tool name */
  name: string;
  /** Tool description */
  description: string;
  /** JSON Schema for input parameters */
  inputSchema: object;
  /** Tool handler function */
  handler: (args: any) => Promise<McpToolResult>;
}

/**
 * Result from an MCP tool execution
 */
export interface McpToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}
