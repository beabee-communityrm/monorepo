# New Package Vanilla Workflow

Scaffold a new TypeScript vanilla package within our monorepo workspace.

## Prerequisites
1. Identify target package information using `ask_followup_question` if not specified:
   - Package name (e.g., `@beabee/package-name`)
   - Package purpose and description
   - Main exports and functionality

2. Verify package type compatibility:
   - If the package is intended for the backend or requires CommonJS support, this template is not suitable
   - Use a different package that uses CommonJS as a template instead

## Implementation Steps

1. Use `read_file` to examine the `packages/template-vanilla` package structure:
   - Read `packages/template-vanilla/README.md` for detailed instructions
   - Read `packages/template-vanilla/package.json` for package configuration
   - Read `packages/template-vanilla/tsconfig.json` for TypeScript setup

2. Use `write_to_file` to create the new package directory structure following the template conventions:
   - Create `packages/[package-name]/package.json`
   - Create `packages/[package-name]/tsconfig.json`
   - Create `packages/[package-name]/README.md`
   - Create `packages/[package-name]/src/index.ts`

3. Follow the template conventions for:
   - Package naming (`@beabee/[package-name]`)
   - TypeScript configuration (extends from `@beabee/tsconfig`)
   - Build scripts and tooling
   - Documentation structure

4. Run validation using `execute_command`:
   ```bash
   yarn install && yarn format && yarn build && yarn check
   ```

5. Use `ask_followup_question` to get approval for commit message
