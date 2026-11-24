---
name: prompt-compression
description: Format rules for agent context files. Use when writing or editing AGENTS.md, CLAUDE.md or a SKILL.md.
---

# Prompt compression

- Pipe-delimited format for indexes/structured refs
- Single-line directives, not multi-paragraph explanations
- Strip explanatory prose — keep only actionable content
- Abbreviated keys: req|opt|str|int|bool|len|min|max|def
- Flatten nested hierarchies with brace expansion + path prefixes
- Target 70-80% token reduction preserving all actionable info
- Keep non-obvious code examples | Never compress error messages or edge case docs
