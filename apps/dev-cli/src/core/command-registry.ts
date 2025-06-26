import type {
  CommandContext,
  CommandDefinition,
  CommandHandler,
  CommandResult,
} from '../types/command.ts';

export class CommandRegistry {
  private commands = new Map<
    string,
    {
      definition: CommandDefinition;
      handler: CommandHandler;
    }
  >();

  /**
   * Register a new command with its definition and handler
   */
  register(definition: CommandDefinition, handler: CommandHandler): void {
    if (this.commands.has(definition.name)) {
      throw new Error(`Command '${definition.name}' is already registered`);
    }

    this.commands.set(definition.name, { definition, handler });
    console.log(`✓ Registered command: ${definition.name}`);
  }

  /**
   * Execute a command by name with given arguments
   */
  async execute(
    commandName: string,
    args: any,
    context?: CommandContext
  ): Promise<CommandResult> {
    const command = this.commands.get(commandName);

    if (!command) {
      return {
        success: false,
        error: `Command '${commandName}' not found. Available commands: ${this.getCommandNames().join(', ')}`,
      };
    }

    try {
      // Validate arguments against command definition
      const validationResult = this.validateArguments(command.definition, args);
      if (!validationResult.success) {
        return validationResult;
      }

      // Execute the command
      const result = await command.handler(args);

      return {
        ...result,
        metadata: {
          ...result.metadata,
          commandName,
          executedAt: new Date().toISOString(),
          context,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Command execution failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Get all registered command definitions
   */
  getDefinitions(): CommandDefinition[] {
    return Array.from(this.commands.values()).map((cmd) => cmd.definition);
  }

  /**
   * Get all registered command names
   */
  getCommandNames(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Get a specific command definition by name
   */
  getDefinition(commandName: string): CommandDefinition | undefined {
    return this.commands.get(commandName)?.definition;
  }

  /**
   * Check if a command is registered
   */
  hasCommand(commandName: string): boolean {
    return this.commands.has(commandName);
  }

  /**
   * Validate command arguments against definition
   */
  private validateArguments(
    definition: CommandDefinition,
    args: any
  ): CommandResult {
    const errors: string[] = [];

    // Check required parameters
    for (const param of definition.parameters) {
      if (
        param.required &&
        (args[param.name] === undefined || args[param.name] === null)
      ) {
        errors.push(`Required parameter '${param.name}' is missing`);
      }

      // Type validation
      if (args[param.name] !== undefined) {
        const value = args[param.name];
        const actualType = Array.isArray(value) ? 'array' : typeof value;

        if (actualType !== param.type) {
          errors.push(
            `Parameter '${param.name}' should be of type '${param.type}', got '${actualType}'`
          );
        }

        // Choice validation
        if (param.choices && !param.choices.includes(value)) {
          errors.push(
            `Parameter '${param.name}' must be one of: ${param.choices.join(', ')}`
          );
        }
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: `Validation failed: ${errors.join('; ')}`,
      };
    }

    return { success: true };
  }
}
