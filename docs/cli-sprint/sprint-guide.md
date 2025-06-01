# 📦 **NetPad CLI: Directory & Command Structure**

**Recommended structure using [`commander`](https://www.npmjs.com/package/commander)**  
(_If you want to use [oclif](https://oclif.io/), the structure is similar, just say so._)

python

CopyEdit

`netpad-cli/ ├── bin/ │   └── netpad-cli.js             # Entry point (with #!/usr/bin/env node) ├── commands/ │   ├── plugin.js                 # plugin subcommands │   ├── workflow.js               # workflow subcommands │   ├── marketplace.js            # marketplace subcommands │   ├── dev.js                    # local dev/start (stub) │   ├── login.js                  # authentication/login (core) │   ├── status.js                 # status check (core) │   ├── logs.js                   # logs/debug (stub) │   └── help.js                   # help (auto/commander) ├── lib/ │   ├── api.js                    # NetPad API interactions │   ├── config.js                 # .netpadrc/config handler │   ├── auth.js                   # Auth token mgmt, login helpers │   └── utils.js                  # Misc utilities (output, prompts) ├── templates/ │   └── plugin/                   # Files to scaffold new plugins │       └── ...                   # E.g. manifest, runner, README ├── package.json ├── README.md ├── .gitignore └── .npmignore`

**Entry point (`bin/netpad-cli.js`):**

- Just requires `../commands/index.js` (where all commands are wired up via commander).
    

---

## **Command Structure & Placeholder Example**

bash

CopyEdit

`# Plugin management netpad-cli plugin create <name>      # Scaffold new plugin (implemented) netpad-cli plugin publish [path]     # Publish plugin (implemented) netpad-cli plugin list               # List plugins (implemented) netpad-cli plugin validate [path]    # Validate plugin locally (stub for now)  # Workflow netpad-cli workflow scaffold [type]  # Scaffold new workflow (stub) netpad-cli workflow export <id>      # Export workflow (stub) netpad-cli workflow import <file>    # Import workflow (stub) netpad-cli workflow validate <file>  # Validate workflow (stub) netpad-cli workflow migrate          # Batch migrate (stub)  # Marketplace netpad-cli marketplace search <query>   # Search plugins/templates (stub) netpad-cli marketplace install <name>   # Install plugin/template (stub) netpad-cli marketplace publish <name>   # Publish to store (stub)  # Developer/DevOps netpad-cli dev                        # Local dev/start (stub) netpad-cli status                     # Show NetPad status (implemented) netpad-cli login                      # Authenticate user (implemented) netpad-cli logs                       # Show logs/debug info (stub)  # Help netpad-cli help                       # Show help (auto)`

---

# 🏃‍♂️ **Sprint Plan: NetPad CLI MVP**

## **Sprint Goal**

Deliver the foundational NetPad CLI as a standalone npm package, supporting plugin management (scaffold, publish, list), user login/auth, config file, and stubs for all planned major features.

---

## **Deliverables**

- CLI entry point (`bin/netpad-cli.js`) and root `package.json`
    
- Modular command routing using `commander`
    
- Working plugin subcommands: create, publish, list
    
- User authentication: `login` and auth token storage
    
- Config file handling (`.netpadrc` in user home)
    
- Scaffold for all other commands (with "Coming soon!" output)
    
- Basic API client (`lib/api.js`)
    
- CLI templates for plugin scaffold (`templates/plugin/`)
    
- README with install/use instructions
    

---

## **Key Stories/Tasks**

| Task | Owner | Estimate | Status | Notes |
| --- | --- | --- | --- | --- |
| CLI entry point and command loader | Dev | 1d | ✅ DONE | Commander.js with modular commands |
| Implement `plugin create` (scaffold) | Dev | 1d | ✅ DONE | Templates, validation, interactive prompts |
| Stubs for all other planned commands | Dev | 1d | ✅ DONE | "Coming soon!" + help structure |
| Implement `login` (NetPad auth, save token) | Dev | 1d | ✅ DONE | Device code flow with OAuth |
| Implement config file handler | Dev | 0.5d | ✅ DONE | `.netpadrc` secure storage |
| Implement `plugin publish` (API call) | Dev | 1d | ✅ DONE | Validation, packaging, API upload |
| Implement `plugin list` (API or local) | Dev | 0.5d | ✅ DONE | Table/JSON output with filtering |
| Code quality, lint, and cross-platform test | Dev | 1d | 🔲 TODO | Mac/Linux/Windows |
| Write README/docs & npm publish prep | Dev | 0.5d | 🔲 TODO |  |

---

## **Acceptance Criteria**

- ✅ CLI installs via `npm install -g .` or from npm.
    
- ✅ User can authenticate to NetPad instance (`login` command).
    
- ✅ User can scaffold a plugin with `plugin create`.
    
- ✅ User can publish a plugin with `plugin publish`.
    
- ✅ User can list plugins with `plugin list`.
    
- ✅ All other commands show a "Coming soon!" message with usage info.
    
- ✅ Config file is created/updated on first run (`~/.netpadrc`).
    
- 🔲 README documents all commands (including stubs/roadmap).
    

---

## **Out of Scope (for this sprint)**

- Full implementation of workflow, marketplace, or devops commands.
    
- Advanced error handling, autocomplete, or CLI UI themes.
    
- Multi-language (i18n), plugin dependency mgmt, or plugin analytics.
    

---

## **Best Practices**

- Modular, easy-to-extend command structure
    
- Clear, colorized CLI output
    
- Secure storage of tokens/config (never plaintext passwords)
    
- Proper error handling and helpful messages for all commands
    

---

## **Current Sprint Progress** 

### ✅ Completed (7/9 tasks) - 78% Complete! 🎯
- CLI entry point and command structure using Commander.js
- Plugin scaffolding with templates, validation, and interactive prompts  
- Command stubs for all planned features
- **Authentication system** - Device code flow with Google/GitHub OAuth
- **Config file handling** - Secure `~/.netpadrc` storage
- **Plugin publish** - Validation, packaging, and API upload
- **Plugin list** - Table/JSON output with filtering options

### 🔲 Remaining for MVP (2/9 tasks)
1. **Code quality** (linting, testing, cross-platform)
2. **Documentation** (README, npm publish prep)

---

## **Next Sprint Priorities**

### High Priority
1. **Authentication & Config** - Foundation for all API operations
2. **Plugin Publish** - Core functionality per user stories
3. **Plugin List** - Complete the plugin management trio

### Medium Priority  
4. **Code Quality** - Linting, testing, cross-platform validation
5. **Documentation** - README and publish preparation

---

## **Post-Sprint: Future Features**

- Implement workflow and marketplace command logic
    
- Add auto-update notification and version checks
    
- Enhance plugin validation and linting
    
- Integrate with CI/CD pipelines
    
- Community feedback and roadmap update
    

---

## **Next Steps**

- Approve structure and sprint scope
    
- Kick off development (scaffold repo, wire up commands)
    
- Internal/external testing and first npm publish