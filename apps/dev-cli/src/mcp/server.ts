import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { CommandRegistry } from '../core/command-registry.ts';
import type { CommandDefinition, CommandParameter } from '../types/command.ts';

export class DevCliMcpServer {
  private server: Server;
  private registry: CommandRegistry;

  constructor(registry: CommandRegistry) {
    this.registry = registry;
    this.server = new Server(
      {
        name: '@beabee/dev-cli-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const definitions = this.registry.getDefinitions();

      return {
        tools: definitions.map((def) => ({
          name: def.name,
          description: def.description,
          inputSchema: this.createJsonSchema(def),
        })),
      };
    });

    // Execute tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!this.registry.hasCommand(name)) {
        throw new McpError(ErrorCode.InvalidRequest, `Unknown tool: ${name}`);
      }

      try {
        const result = await this.registry.execute(name, args || {});

        return {
          content: [
            {
              type: 'text',
              text: result.success
                ? this.formatSuccessResponse(result)
                : this.formatErrorResponse(result),
            },
          ],
        };
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  /**
   * Create JSON Schema from command definition for MCP
   */
  private createJsonSchema(definition: CommandDefinition) {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const param of definition.parameters) {
      properties[param.name] = {
        type: this.mapTypeToJsonSchema(param.type),
        description: param.description,
      };

      if (param.default !== undefined) {
        properties[param.name].default = param.default;
      }

      if (param.choices) {
        properties[param.name].enum = param.choices;
      }

      if (param.type === 'array') {
        properties[param.name].items = {
          type: 'string', // Assume string array for now
        };
      }

      if (param.required) {
        required.push(param.name);
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
      additionalProperties: false,
    };
  }

  /**
   * Map our parameter types to JSON Schema types
   */
  private mapTypeToJsonSchema(type: CommandParameter['type']): string {
    switch (type) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        return 'array';
      default:
        return 'string';
    }
  }

  /**
   * Format successful command result for MCP response
   */
  private formatSuccessResponse(result: any): string {
    let response = `✅ ${result.message || 'Command executed successfully'}`;

    if (result.data?.details && Array.isArray(result.data.details)) {
      response += '\n\nDetails:\n' + result.data.details.join('\n');
    }

    if (result.data && typeof result.data === 'object') {
      const metadata = Object.entries(result.data)
        .filter(([key]) => key !== 'details')
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(', ');

      if (metadata) {
        response += `\n\nMetadata: ${metadata}`;
      }
    }

    return response;
  }

  /**
   * Format error response for MCP
   */
  private formatErrorResponse(result: any): string {
    return `❌ ${result.error || 'Command failed'}`;
  }

  /**
   * Start the MCP server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('🚀 Beabee Dev CLI MCP Server started');
    console.error(
      `📋 Available tools: ${this.registry.getCommandNames().join(', ')}`
    );
  }
}
