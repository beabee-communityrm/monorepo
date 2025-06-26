import {
  esbuildWithResult,
  generateIndexWithResult,
} from '../actions/index.ts';
import {
  esbuildDefinition,
  generateIndexDefinition,
} from '../commands/definitions/index.ts';
import { CommandRegistry } from '../core/command-registry.ts';

/**
 * Setup and register all available commands
 */
export function setupCommands(): CommandRegistry {
  const registry = new CommandRegistry();

  // Register generate-index command
  registry.register(generateIndexDefinition, generateIndexWithResult);

  // Register esbuild command
  registry.register(esbuildDefinition, esbuildWithResult);

  return registry;
}
