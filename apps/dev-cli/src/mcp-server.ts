#!/usr/bin/env -S node --experimental-specifier-resolution=node --experimental-strip-types --no-warnings
import { DevCliMcpServer } from './mcp/server.ts';
import { setupCommands } from './setup/commands.ts';

async function main() {
  try {
    // Setup command registry with all available commands
    const registry = setupCommands();

    // Create and start MCP server
    const mcpServer = new DevCliMcpServer(registry);
    await mcpServer.start();

    // Keep the process running
    process.on('SIGINT', () => {
      console.error('🛑 MCP Server shutting down...');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start MCP server:', error);
    process.exit(1);
  }
}

main();
