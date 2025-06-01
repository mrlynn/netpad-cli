# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Run the CLI directly via node
- `npm test` - Run Jest tests (test framework available but limited test coverage)
- `node bin/netpad-cli.js [command]` - Execute CLI commands during development

## Authentication System

The CLI supports multiple authentication methods using NetPad's Device Code Flow:

- **Login Methods**: 
  - Email/Password: `netpad-cli login`
  - Google OAuth: `netpad-cli login --google` (device code flow)
  - GitHub OAuth: `netpad-cli login --github` (device code flow)
- **Device Code Flow**: CLI shows verification code, opens browser to `/cli-auth`, user enters code
- **API Keys**: Format `mcp_[32_hex_characters]` with scopes (`read`, `write`, `execute`)
- **Auth Commands**: `login`, `logout`, `whoami` for credential management
- **Config Storage**: Secure storage in `~/.netpadrc` with 600 permissions

## Architecture Overview

This is a Node.js CLI application for managing NetPad plugins and workflows. The architecture follows a modular command pattern:

- **Entry Point**: `bin/netpad-cli.js` → `commands/index.js` - Sets up Commander.js and registers all command modules
- **Command Structure**: Each command (plugin, workflow, marketplace, etc.) is a separate module in `commands/` that extends the main Commander program
- **Core Libraries**: Located in `lib/` directory:
  - `pluginScaffold.js` - Comprehensive plugin creation with interactive prompts and template processing
  - `auth.js`, `api.js`, `config.js`, `utils.js` - Service modules (mostly stubs currently)

## Plugin System

The CLI's primary functionality is scaffolding NetPad plugins:

- **Templates**: Multiple plugin templates available in `netpad-cli/templates/` (basic, api, database, transformer)
- **Plugin Structure**: Generated plugins include manifest.json, package.json, src/ directory with runner.js/shape.js/icon.svg, and optional tests
- **Scaffolding Process**: Interactive prompts collect plugin metadata (category, scope, author) and generate complete plugin structure
- **Template Processing**: Uses simple {{variable}} replacement for customizing template files

## Configuration

- User configuration stored in `~/.netpadrc`
- Plugin templates located in `netpad-cli/templates/` (note: there's also a duplicate `templates/` directory at root)

## Current State

Most commands beyond `plugin create` are stubs awaiting implementation. The codebase is in early development with core scaffolding functionality complete.