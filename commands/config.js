const config = require('../lib/config');
const auth = require('../lib/auth');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = (program) => {
    const configCmd = program
        .command('config')
        .description('Manage NetPad CLI configuration');

    configCmd
        .command('show')
        .description('Show current configuration')
        .action(() => {
            console.log(chalk.blue('🔧 NetPad CLI Configuration\n'));
            
            const configFile = path.join(os.homedir(), '.netpadrc');
            const configExists = fs.existsSync(configFile);
            
            console.log(chalk.gray(`Config file: ${configFile}`));
            console.log(chalk.gray(`Config exists: ${configExists ? 'Yes' : 'No'}`));
            console.log('');
            
            // Show effective configuration
            console.log(chalk.yellow('📋 Current Settings:'));
            console.log(`Base URL: ${chalk.cyan(config.getBaseUrl())}`);
            console.log(`API Key: ${config.getApiKey() ? chalk.green(config.getApiKey().substring(0, 10) + '...') : chalk.red('Not set')}`);
            console.log(`Authenticated: ${auth.isAuthenticated() ? chalk.green('Yes') : chalk.red('No')}`);
            console.log('');
            
            // Show environment variables
            console.log(chalk.yellow('🌍 Environment Variables:'));
            console.log(`NETPAD_URL: ${process.env.NETPAD_URL || chalk.gray('Not set')}`);
            console.log(`NETPAD_BASE_URL: ${process.env.NETPAD_BASE_URL || chalk.gray('Not set')}`);
            console.log('');
            
            // Show precedence
            console.log(chalk.yellow('📊 Configuration Precedence:'));
            console.log(chalk.gray('1. Environment variables (NETPAD_URL, NETPAD_BASE_URL)'));
            console.log(chalk.gray('2. Config file (~/.netpadrc)'));
            console.log(chalk.gray('3. Default (https://netpad.io)'));
        });

    configCmd
        .command('set <key> <value>')
        .description('Set a configuration value')
        .action((key, value) => {
            console.log(chalk.blue('🔧 Setting Configuration\n'));
            
            if (key === 'baseUrl' || key === 'url') {
                try {
                    new URL(value); // Validate URL
                    config.setBaseUrl(value);
                    console.log(chalk.green(`✅ Base URL set to: ${value}`));
                } catch (error) {
                    console.log(chalk.red(`❌ Invalid URL: ${value}`));
                    process.exit(1);
                }
            } else if (key === 'apiKey') {
                config.setApiKey(value);
                console.log(chalk.green(`✅ API Key set`));
            } else {
                console.log(chalk.red(`❌ Unknown configuration key: ${key}`));
                console.log(chalk.yellow('Available keys: baseUrl, url, apiKey'));
                process.exit(1);
            }
        });

    configCmd
        .command('unset <key>')
        .description('Remove a configuration value')
        .action((key) => {
            console.log(chalk.blue('🔧 Removing Configuration\n'));
            
            if (key === 'baseUrl' || key === 'url') {
                config.set('baseUrl', null);
                console.log(chalk.green('✅ Base URL removed (will use default)'));
            } else if (key === 'apiKey') {
                config.set('apiKey', null);
                console.log(chalk.green('✅ API Key removed'));
            } else {
                console.log(chalk.red(`❌ Unknown configuration key: ${key}`));
                console.log(chalk.yellow('Available keys: baseUrl, url, apiKey'));
                process.exit(1);
            }
        });

    configCmd
        .command('reset')
        .description('Reset all configuration to defaults')
        .action(() => {
            console.log(chalk.blue('🔧 Resetting Configuration\n'));
            
            config.clear();
            console.log(chalk.green('✅ Configuration reset to defaults'));
            console.log(chalk.gray('You will need to login again with: netpad-cli login'));
        });

    configCmd
        .command('edit')
        .description('Open configuration file in default editor')
        .action(() => {
            const configFile = path.join(os.homedir(), '.netpadrc');
            const { spawn } = require('child_process');
            
            console.log(chalk.blue('📝 Opening configuration file\n'));
            console.log(chalk.gray(`File: ${configFile}`));
            
            // Try to open with default editor
            const editor = process.env.EDITOR || 'nano';
            const child = spawn(editor, [configFile], { stdio: 'inherit' });
            
            child.on('error', (error) => {
                console.log(chalk.red(`❌ Could not open editor: ${error.message}`));
                console.log(chalk.yellow(`💡 Try setting EDITOR environment variable or edit manually: ${configFile}`));
            });
        });
};