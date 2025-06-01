const open = require('open');
const chalk = require('chalk');

class DeviceCodeAuth {
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    }

    async authenticate(provider = null) {
        try {
            console.log(chalk.yellow('🔐 Starting device code authentication...'));

            // Step 1: Request device code
            const deviceResponse = await fetch(`${this.baseUrl}/api/cli/auth/device-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: 'netpad-cli',
                    scope: 'read write execute',
                    provider: provider // 'google', 'github', or null for any
                })
            });

            if (!deviceResponse.ok) {
                const error = await deviceResponse.json().catch(() => ({}));
        
                // Log more details for debugging
                console.log(chalk.red('\nDevice code request failed:'));
                console.log(chalk.gray(`URL: ${this.baseUrl}/api/cli/auth/device-code`));
                console.log(chalk.gray(`Status: ${deviceResponse.status} ${deviceResponse.statusText}`));
                console.log(chalk.gray(`Response: ${JSON.stringify(error, null, 2)}`));
        
                if (deviceResponse.status === 405) {
                    throw new Error('Device code endpoint not available (405 Method Not Allowed). The NetPad instance may not have device code flow implemented yet.');
                }
        
                if (deviceResponse.status === 404) {
                    throw new Error('Device code endpoint not found (404). Please verify the NetPad instance supports CLI authentication.');
                }
        
                throw new Error(error.message || `Device code request failed: ${deviceResponse.status}`);
            }

            const deviceData = await deviceResponse.json();

            // Step 2: Show user the code and open browser
            console.log(chalk.blue('\n📱 Device Code Authentication'));
            console.log(chalk.yellow(`Please visit: ${deviceData.verification_uri}`));
            console.log(chalk.yellow(`And enter this code: ${chalk.bold(deviceData.user_code)}`));
            console.log(chalk.gray(`Code expires in ${Math.floor(deviceData.expires_in / 60)} minutes\n`));

            // Open browser automatically to the complete URL
            try {
                console.log(chalk.gray('Opening browser...'));
                await open(deviceData.verification_uri_complete);
            } catch (error) {
                console.log(chalk.yellow('⚠️ Could not open browser automatically'));
                console.log(chalk.gray(`Please manually visit: ${deviceData.verification_uri_complete}`));
            }

            // Step 3: Poll for authorization
            console.log(chalk.gray('Waiting for authorization'));
            process.stdout.write(chalk.gray('Checking'));

            const startTime = Date.now();
            const timeoutMs = deviceData.expires_in * 1000;
            const pollInterval = (deviceData.interval || 5) * 1000;

            while (Date.now() - startTime < timeoutMs) {
                await new Promise(resolve => setTimeout(resolve, pollInterval));

                const tokenResponse = await fetch(`${this.baseUrl}/api/cli/auth/token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        device_code: deviceData.device_code,
                        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
                    })
                });

                const tokenData = await tokenResponse.json().catch(() => ({}));

                if (tokenResponse.ok && tokenData.access_token) {
                    // Success! 
                    process.stdout.write('\n');
                    console.log(chalk.green('✅ Authentication successful!'));
                    return {
                        apiKey: tokenData.access_token,
                        scope: tokenData.scope,
                        tokenType: tokenData.token_type || 'Bearer'
                    };
                }

                if (tokenData.error === 'authorization_pending') {
                    process.stdout.write(chalk.gray('.'));
                    continue;
                }

                if (tokenData.error === 'slow_down') {
                    // Increase polling interval
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }

                // Other errors (denied, expired, etc.)
                process.stdout.write('\n');
                throw new Error(`Authentication failed: ${tokenData.error_description || tokenData.error}`);
            }

            process.stdout.write('\n');
            throw new Error('Authentication timed out. Please try again.');

        } catch (error) {
            throw new Error(`Device code authentication failed: ${error.message}`);
        }
    }
}

module.exports = DeviceCodeAuth;