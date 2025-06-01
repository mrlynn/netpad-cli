# **NetPad CLI — User Stories**

---

### 1\. **As a NetPad developer, I want to scaffold a new plugin project using the CLI, so I can start building custom nodes and runners quickly.**

**Acceptance Criteria:**

- I can run `netpad-cli plugin create <name>`.
    
- The CLI generates a new plugin folder with manifest, runner, and README templates.
    
- I see clear next steps and usage instructions in the terminal.
    

---

### 2\. **As a NetPad developer, I want to publish my plugin to the NetPad platform from the CLI, so I can make it available to myself, my org, or other users.**

**Acceptance Criteria:**

- I can run `netpad-cli plugin publish [path]`.
    
- The CLI validates my plugin and uploads it to my NetPad instance.
    
- I receive confirmation and see the plugin in my palette after publish.
    

---

### 3\. **As a NetPad user, I want to authenticate with my NetPad instance from the CLI, so all CLI actions are securely associated with my account.**

**Acceptance Criteria:**

- I can run `netpad-cli login`.
    
- I am prompted for my NetPad credentials or receive a device code.
    
- My login status is persisted in a local config and used for future commands.
    

---

### 4\. **As a plugin author, I want to list all plugins available to me (private, org, public) from the CLI, so I can manage and audit my installed capabilities.**

**Acceptance Criteria:**

- I can run `netpad-cli plugin list`.
    
- The CLI shows a table or list of available plugins with name, scope, and version.
    

---

### 5\. **As a developer, I want to see a list of planned CLI commands (even if not yet implemented), so I understand what’s possible and what’s coming soon.**

**Acceptance Criteria:**

- I can run `netpad-cli help` or an unimplemented command.
    
- The CLI shows usage instructions and “Coming soon!” for stubbed features.
    

---

### 6\. **As a workflow author, I want to scaffold a new workflow or export/import an existing one using the CLI, so I can manage templates and automation from the command line.**

_(Stubbed for MVP)_

**Acceptance Criteria:**

- I can run `netpad-cli workflow scaffold`, `export`, or `import` (stub).
    
- The CLI informs me these features are “coming soon” and shows expected usage.
    

---

### 7\. **As a developer, I want to check the health and version of my NetPad instance from the CLI, so I can quickly diagnose connectivity or compatibility issues.**

**Acceptance Criteria:**

- I can run `netpad-cli status`.
    
- The CLI displays version, health, and connection info.
    

---

### 8\. **As a user, I want to see clear, helpful error messages for failed CLI commands, so I can quickly correct mistakes or report issues.**

**Acceptance Criteria:**

- All commands provide actionable feedback on errors.
    
- The CLI suggests possible next steps or help topics.
    

---

### 9\. **As a user, I want my authentication and config stored securely and read automatically by the CLI, so I don’t have to re-authenticate for every action.**

**Acceptance Criteria:**

- Auth tokens/config are saved in `~/.netpadrc` (or equivalent).
    
- Subsequent CLI actions use saved credentials if valid.
    

---

### 10\. **As a NetPad user, I want the CLI to be easy to update and extend, so new features appear as the platform evolves.**

**Acceptance Criteria:**

- The CLI checks its own version and alerts me if an update is available.
    
- Stubs for new features are added with “coming soon” banners.
    

---

## **(Advanced/Future) User Stories for Marketplace & DevOps**

---

### 11\. **As a user, I want to browse the NetPad plugin marketplace from the CLI, so I can search and install new plugins or templates.**

_(Stubbed for MVP)_

### 12\. **As a DevOps engineer, I want to use the CLI in scripts or CI pipelines to deploy, export, or migrate workflows automatically.**

_(Stubbed for MVP)_