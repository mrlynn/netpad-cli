const config = require('./config');
const chalk = require('chalk');
const DeviceCodeAuth = require('./deviceCodeAuth');

class AuthError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'AuthError';
        this.code = code;
    }
}

class Auth {
    constructor() {
        this.config = config;
    }

    async authenticate(baseUrl, email, password) {
        try {
            console.log(chalk.yellow('🔐 Authenticating with NetPad...'));
      
            // Step 1: Login to get session
            const loginResponse = await fetch(`${baseUrl}/api/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!loginResponse.ok) {
                const error = await loginResponse.json().catch(() => ({}));
                throw new AuthError(
                    error.message || 'Invalid credentials',
                    'INVALID_CREDENTIALS'
                );
            }

            // Extract session token from cookies
            const cookies = loginResponse.headers.get('set-cookie');
            const sessionToken = this.extractSessionToken(cookies);
      
            if (!sessionToken) {
                throw new AuthError('Failed to obtain session token', 'SESSION_ERROR');
            }

            console.log(chalk.yellow('🔑 Creating API key...'));

            // Step 2: Create API key using session
            const apiKeyResponse = await fetch(`${baseUrl}/api/user/preferences/apikeys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': sessionToken,
                },
                body: JSON.stringify({
                    name: 'NetPad CLI',
                    description: 'API key for NetPad CLI tool',
                    scopes: ['READ_ONLY', 'EXECUTE'],
                }),
            });

            if (!apiKeyResponse.ok) {
                const error = await apiKeyResponse.json().catch(() => ({}));
                throw new AuthError(
                    error.message || 'Failed to create API key',
                    'API_KEY_ERROR'
                );
            }

            const apiKeyData = await apiKeyResponse.json();
            const apiKey = apiKeyData.key;

            if (!apiKey) {
                throw new AuthError('API key not returned', 'API_KEY_ERROR');
            }

            // Step 3: Store credentials
            this.config.setBaseUrl(baseUrl);
            this.config.setApiKey(apiKey);

            console.log(chalk.green('✅ Authentication successful!'));
            console.log(chalk.gray(`Config saved to: ${require('os').homedir()}/.netpadrc`));

            return { apiKey, baseUrl };
        } catch (error) {
            if (error instanceof AuthError) {
                throw error;
            }
      
            // Handle network errors
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                throw new AuthError(
                    `Cannot connect to ${baseUrl}. Please check the URL and try again.`,
                    'CONNECTION_ERROR'
                );
            }
      
            throw new AuthError(
                `Authentication failed: ${error.message}`,
                'UNKNOWN_ERROR'
            );
        }
    }

    extractSessionToken(cookies) {
        if (!cookies) return null;
    
        // Look for next-auth session token
        const sessionMatch = cookies.match(/next-auth\.session-token=([^;]+)/);
        if (sessionMatch) {
            return `next-auth.session-token=${sessionMatch[1]}`;
        }
    
        return null;
    }

    logout() {
        this.config.clear();
        console.log(chalk.green('✅ Logged out successfully'));
    }

    isAuthenticated() {
        return this.config.isAuthenticated();
    }

    getApiKey() {
        return this.config.getApiKey();
    }

    getBaseUrl() {
        return this.config.getBaseUrl();
    }

    async authenticateWithDeviceCode(baseUrl, provider = null) {
        try {
            const deviceAuth = new DeviceCodeAuth(baseUrl);
            const authResult = await deviceAuth.authenticate(provider);

            // Store credentials
            this.config.setBaseUrl(baseUrl);
            this.config.setApiKey(authResult.apiKey);

            console.log(chalk.gray(`Config saved to: ${require('os').homedir()}/.netpadrc`));
            console.log(chalk.gray(`Scope: ${authResult.scope}`));

            return { 
                apiKey: authResult.apiKey, 
                baseUrl,
                scope: authResult.scope 
            };
        } catch (error) {
            if (error instanceof AuthError) {
                throw error;
            }
      
            // Handle network errors
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                throw new AuthError(
                    `Cannot connect to ${baseUrl}. Please check the URL and try again.`,
                    'CONNECTION_ERROR'
                );
            }
      
            throw new AuthError(
                `Device code authentication failed: ${error.message}`,
                'DEVICE_CODE_ERROR'
            );
        }
    }

    async validateApiKey() {
        const apiKey = this.getApiKey();
        const baseUrl = this.getBaseUrl();
    
        if (!apiKey) {
            return false;
        }

        try {
            // Test the API key with a simple request
            const response = await fetch(`${baseUrl}/api/mcp/tools`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new Auth(); 