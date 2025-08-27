import type { CommandModule } from 'yargs';

import { startMcpServer } from '../actions/mcp/index.ts';
import type { McpServerArgs } from '../types/mcp.ts';

/**
 * MCP Server CLI command
 *
 * Starts an MCP server that exposes development tools to AI assistants.
 */
export const mcpCommand: CommandModule = {
  command: 'mcp',
  describe: 'Start MCP server for AI assistant integration',
  builder: (yargs) => {
    return yargs
      .option('debug', {
        alias: 'd',
        type: 'boolean',
        describe: 'Enable debug logging',
        default: false,
      })
      .option('name', {
        alias: 'n',
        type: 'string',
        describe: 'Server name',
        default: '@beabee/dev-cli-mcp',
      })
      .example('yarn dev-cli mcp', 'Start the MCP server')
      .example('yarn dev-cli mcp --debug', 'Start with debug logging')
      .epilog(
        'The MCP server will expose development tools to AI assistants via the Model Context Protocol.'
      );
  },
  handler: (argv: any) => {
    // Cast to ensure proper types
    const args: McpServerArgs = {
      debug: argv.debug as boolean,
      name: argv.name as string,
      version: argv.serverVersion as string,
    };

    return startMcpServer(args);
  },
};
