# Beabee Backend CLI

Command line interface for managing Beabee backend operations.

## Usage

The CLI runs inside the `api_app` container, which provides its environment:

```bash
docker compose exec api_app yarn backend-cli <command>
```

The CLI documents its own commands and options:

```bash
yarn backend-cli --help
yarn backend-cli <command> --help
yarn backend-cli <command> <subcommand> --help
```

An unknown or missing command exits with a non-zero code.

## Database dumps

`database export` writes a SQL dump in which each pair of lines is a SQL
statement followed by a JSON array of its parameters (or an empty line).
`database import` reads that format. Save dumps in `exports/` at the monorepo
root, which is git-ignored.

## License

This project is part of Beabee and follows its licensing terms.
