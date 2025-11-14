# Git Commit Best Practices Workflow

Execute consistent, frequent, and meaningful git commits following conventional commit standards. This workflow analyzes recent commit history to maintain project-specific patterns and ensures atomic, review-friendly commits.

## Core Commit Practices

- **Commit Early and Often**: Make commits at logical breakpoints, not just at completion
- **Atomic Changes**: Each commit represents one logical change or feature addition
- **Conventional Format**: Use `<type>[scope]: <description>` format (feat, fix, docs, refactor, test, chore, etc.)
- **Developer Approval Required**: Always ask for explicit approval before making commits, unless specifically instructed to commit automatically

## Workflow Steps

### Step 1: Analyze Recent History

Use `execute_command` to check recent commit patterns:
```bash
git log --oneline -10 | cat
```

- Follow Project Style: Use the same commit types and scoping patterns already established
- Preserve Team Patterns: Adapt to any project-specific conventions visible in git history

### Step 2: Validate Code Quality ⚠️ MANDATORY

**CRITICAL**: Run validation before EVERY commit using `execute_command`:
```bash
yarn format && yarn check
# Both commands MUST exit with code 0
```

- Never commit code that fails linting or type checking
- For monorepo changes, run full workspace check: `yarn check`

### Step 3: Review Changes

Use `execute_command` to check staged changes:
```bash
git status
git diff --cached
```

### Step 4: Commit Authorization ⚠️ CRITICAL

Use `ask_followup_question` to get approval:
- **Show Changes First**: Present the planned commit message and changed files for review
- **Wait for Confirmation**: Do not proceed with commit until explicit "yes" or "commit" instruction
- **Exception**: Only commit automatically when the user explicitly requests it

### Step 5: Execute Commit

Use `execute_command` to commit:
```bash
git commit -m "<type>[scope]: <description>"
```

## Commit Message Standards

- Use imperative mood in subject lines
- Keep subject lines under 50 characters
- Include scope when applicable (component, module, file area)
- **File Operations**: Use `git mv` instead of manual move/delete/add for clean history tracking
- Ensure commits are review-friendly and self-contained

## Pre-Commit Checklist

✅ Code is formatted (`yarn format` passes)
✅ Type checking passes (`yarn check` passes)  
✅ All linting rules satisfied
✅ Commit message follows conventional format
✅ Changes are atomic and focused
✅ No debugging code or console.logs remain

Remember: Create a coherent development story through meaningful commits that make debugging and code review easier. Always respect the developer's decision-making authority over when and what to commit.
