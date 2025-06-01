const auth = require('./auth');
const chalk = require('chalk');

class ApiError extends Error {
    constructor(message, status, code) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

class NetPadAPI {
    constructor() {
        this.auth = auth;
    }

    async request(endpoint, options = {}) {
        const apiKey = this.auth.getApiKey();
        const baseUrl = this.auth.getBaseUrl();
    
        if (!apiKey) {
            throw new ApiError('Authentication required. Run "netpad-cli login" first.', 401, 'UNAUTHENTICATED');
        }

        const url = `${baseUrl}${endpoint}`;
    
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new ApiError(
                    data.error?.message || data.message || `HTTP ${response.status}`,
                    response.status,
                    data.error?.code || 'API_ERROR'
                );
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
      
            // Handle network errors
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                throw new ApiError(
                    `Cannot connect to NetPad instance at ${baseUrl}`,
                    0,
                    'CONNECTION_ERROR'
                );
            }
      
            throw new ApiError(
                `Request failed: ${error.message}`,
                0,
                'NETWORK_ERROR'
            );
        }
    }

    // Plugin management endpoints (using MCP tools as base)
    async getPlugins() {
    // List available tools which may include plugins
        return this.request('/api/mcp/tools');
    }

    async publishPlugin(pluginData) {
    // This might need to be a different endpoint or use tools
    // For now, we'll try user preferences or a custom endpoint
        const endpoint = '/api/user/plugins';
        console.log(chalk.gray(`🔗 API: POST ${this.auth.getBaseUrl()}${endpoint}`));
        
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(pluginData)
        });
    }

    async getPlugin(pluginId) {
        return this.request(`/api/mcp/tools/${pluginId}`);
    }

    // MCP API endpoints
    async getTools() {
        return this.request('/api/mcp/tools');
    }

    async getTool(toolId) {
        return this.request(`/api/mcp/tools/${toolId}`);
    }

    async executeCommand(command) {
        return this.request('/api/mcp/command', {
            method: 'POST',
            body: JSON.stringify({ command })
        });
    }

    async runWorkflow(workflow, context = {}) {
        return this.request('/api/mcp/workflow/run', {
            method: 'POST',
            body: JSON.stringify({ workflow, context })
        });
    }

    // User management
    async getUserPreferences() {
        return this.request('/api/user/preferences');
    }

    async getApiKeys() {
        return this.request('/api/user/preferences/apikeys');
    }

    async createApiKey(keyData) {
        return this.request('/api/user/preferences/apikeys', {
            method: 'POST',
            body: JSON.stringify(keyData)
        });
    }

    async deleteApiKey(keyId) {
        return this.request(`/api/user/preferences/apikeys/${keyId}`, {
            method: 'DELETE'
        });
    }
}

module.exports = new NetPadAPI(); 