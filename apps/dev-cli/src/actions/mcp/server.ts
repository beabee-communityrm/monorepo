import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

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

  // Create MCP server instance
  const server = new McpServer({
    name,
    version,
  });

  // Register all available MCP tools
  const tools = getAllMcpTools();

  if (debug) {
    console.error(`🔧 Registering ${tools.length} MCP tools...`);
  }

  // Note: For now we don't register any tools since the registry is empty
  // This will be extended when we add specific MCP tools
  for (const tool of tools) {
    // TODO: Register tools when we implement them
    // server.tool(tool.name, tool.description, tool.inputSchema, tool.handler);

    if (debug) {
      console.error(`  ✓ Ready to register tool: ${tool.name}`);
    }
  }

  // Setup server transport (using stdio for AI assistant communication)
  const transport = new StdioServerTransport();

  try {
    // Connect and start the server
    await server.connect(transport);

    console.error('🚀 Beabee Dev CLI MCP Server started');
    console.error(
      `📋 Available tools: ${tools.map((t) => t.name).join(', ') || 'none (ready for implementation)'}`
    );
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
