# NetPad CLI 🚀

A professional CLI tool for managing NetPad plugins, workflows, and more.

[![npm version](https://badge.fury.io/js/netpad-cli.svg)](https://badge.fury.io/js/netpad-cli)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔌 **Plugin Management** - Create, publish, and list NetPad plugins
- 🔐 **Authentication** - OAuth2 device code flow with Google/GitHub
- 📦 **Scaffolding** - Multiple plugin templates (basic, API, database, transformer)
- ✅ **Validation** - Comprehensive plugin validation and testing
- 🌐 **Multi-Instance** - Support for SaaS and self-hosted NetPad instances

## Installation

```bash
# Install globally via npm
npm install -g netpad-cli

# Verify installation
netpad-cli --version
```

## Quick Start

```bash
# Authenticate with NetPad
netpad-cli login --google

# Create a new plugin
netpad-cli plugin create my-awesome-plugin

# Validate plugin (dry run)
netpad-cli plugin publish --dry-run

# Publish to NetPad
netpad-cli plugin publish

# List available plugins
netpad-cli plugin list
```

## Commands

### Plugin Management
```bash
netpad-cli plugin create <name>         # Scaffold a new plugin
netpad-cli plugin publish [path]        # Publish a plugin
netpad-cli plugin publish --dry-run     # Validate without publishing
netpad-cli plugin list                  # List available plugins
netpad-cli plugin list --scope public   # Filter by scope
```

### Authentication
```bash
netpad-cli login                         # Interactive login
netpad-cli login --google               # Google OAuth
netpad-cli login --github               # GitHub OAuth
netpad-cli logout                       # Clear credentials
netpad-cli whoami                       # Show auth status
```

### Other Commands
```bash
netpad-cli status                       # NetPad instance status
netpad-cli help                         # Show all commands
```

## Authentication

NetPad CLI uses OAuth2 Device Code Flow for secure authentication:

1. **Run login command**: `netpad-cli login --google`
2. **Visit verification URL**: CLI opens browser automatically
3. **Enter device code**: Complete OAuth in browser
4. **CLI receives token**: Stored securely in `~/.netpadrc`

Supports Google OAuth, GitHub OAuth, and email/password authentication.

## Plugin Development

### Create Plugin
```bash
# Interactive creation
netpad-cli plugin create my-plugin

# Choose from templates:
# - Basic: Simple data processing
# - API: External API integration  
# - Database: Database connectivity
# - Transformer: Data transformation
```

### Plugin Structure
```
my-plugin/
├── manifest.json          # Plugin metadata
├── package.json          # Node.js dependencies
├── src/
│   ├── runner.js         # Plugin execution logic
│   ├── shape.js          # UI component definition
│   └── icon.svg          # Plugin icon
├── tests/
│   └── runner.test.js    # Unit tests
└── README.md             # Documentation
```

### Publishing
```bash
# Validate plugin
netpad-cli plugin publish --dry-run

# Publish to NetPad
netpad-cli plugin publish

# Check status
netpad-cli plugin list --scope private
```

## Configuration

The CLI stores configuration in `~/.netpadrc`:

```json
{
  "apiKey": "mcp_your_api_key_here",
  "baseUrl": "https://netpad.io"
}
```

## Requirements

- **Node.js**: >=16.0.0
- **NetPad Instance**: Compatible with NetPad v2.0+
- **Authentication**: Valid NetPad account

## Examples

### Example 1: Create and Publish Plugin
```bash
# Create plugin
netpad-cli plugin create url-shortener

# Edit plugin files
cd url-shortener
# ... implement your logic ...

# Test and publish
netpad-cli plugin publish --dry-run
netpad-cli plugin publish
```

### Example 2: Different NetPad Instance
```bash
# Login to custom instance
netpad-cli login --url https://my-netpad.company.com

# Create and publish
netpad-cli plugin create company-plugin
netpad-cli plugin publish
```

## Troubleshooting

### Common Issues

**Authentication Failed**
```bash
# Check auth status
netpad-cli whoami

# Re-authenticate
netpad-cli login --google
```

**Plugin Validation Errors**
```bash
# Check detailed validation
netpad-cli plugin publish --dry-run

# Common fixes:
# - Ensure manifest.json is valid
# - Check all required files exist
# - Verify plugin name format
```

**Connection Issues**
```bash
# Check NetPad status
netpad-cli status

# Verify URL and connectivity
netpad-cli login --url https://your-netpad-instance.com
```

## Development

### Local Development
```bash
# Clone repository
git clone https://github.com/mrlynn/netpad-cli.git
cd netpad-cli

# Install dependencies
npm install

# Run locally
node bin/netpad-cli.js --help

# Run tests
npm test
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `npm test`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Links

- **GitHub**: [https://github.com/mrlynn/netpad-cli](https://github.com/mrlynn/netpad-cli)
- **npm Package**: [https://www.npmjs.com/package/netpad-cli](https://www.npmjs.com/package/netpad-cli)
- **NetPad**: [https://netpad.io](https://netpad.io)
- **Issues**: [Report bugs and request features](https://github.com/mrlynn/netpad-cli/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

**NetPad Team** - [team@netpad.io](mailto:team@netpad.io)

---

🚀 **Build amazing NetPad plugins with ease!** 