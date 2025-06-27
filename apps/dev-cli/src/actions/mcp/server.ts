import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import type { McpServerArgs } from '../../types/mcp.ts';
import { getAllMcpTools } from './tools/index.ts';

/**
 * Start the MCP server
 *
 * This action starts an MCP server that exposes development tools
 * to AI assistants via the Model Context Protocol.
 */
export async function startMcpServer(args: McpServerArgs = {}): Promise<void> {
  const {
    name = '@beabee/dev-cli-mcp',
    version = '1.0.0',
    debug = false,
  } = args;

  // Get all available MCP tools
  const tools = getAllMcpTools();

  // Create MCP server instance
  const server = new Server(
    {
      name,
      version,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  if (debug) {
    console.error(`🔧 Registering ${tools.length} MCP tools...`);
  }

  // Register tools handler to list available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    if (debug) {
      console.error('📋 Listing tools requested');
    }

    return {
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Register tool execution handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const args = request.params.arguments || {};

    if (debug) {
      console.error(`🔧 Executing tool: ${toolName} with args:`, args);
    }

    const tool = tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    try {
      const result = await tool.handler(args);

      if (debug) {
        console.error(`✅ Tool ${toolName} executed successfully`);
      }

      // Return in the format expected by MCP SDK
      return {
        content: result.content,
        isError: result.isError,
      };
    } catch (error) {
      if (debug) {
        console.error(`❌ Tool ${toolName} failed:`, error);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Error executing ${toolName}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  });

  // Setup server transport (using stdio for AI assistant communication)
  const transport = new StdioServerTransport();

  try {
    // Connect and start the server
    await server.connect(transport);

    console.error('🚀 Beabee Dev CLI MCP Server started');
    console.error(`📋 Available tools: ${tools.map((t) => t.name).join(', ')}`);
    console.error(
      '💡 The server is now ready to receive requests from AI assistants'
    );

    // Keep the process running
    process.on('SIGINT', () => {
      console.error('🛑 MCP Server shutting down...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.error('🛑 MCP Server shutting down...');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start MCP server:', error);
    throw error;
  }
}
