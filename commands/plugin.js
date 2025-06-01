const path = require('path');
const { createPlugin } = require('../lib/pluginScaffold');
const pluginPublisher = require('../lib/pluginPublisher');
const auth = require('../lib/auth');
const chalk = require('chalk');

module.exports = (program) => {
    const pluginCmd = program
        .command('plugin')
        .description('Plugin management commands');

    pluginCmd
        .command('create <name>')
        .description('Scaffold a new plugin')
        .action((name) => {
            // Use the templates directory as specified in sprint docs
            const templatesDir = path.resolve(__dirname, '../templates/plugin');
            createPlugin(name, templatesDir);
        });

    pluginCmd
        .command('publish [path]')
        .description('Publish a plugin to NetPad')
        .option('--dry-run', 'Validate plugin without publishing')
        .action(async (pluginPath, options) => {
            try {
                const targetPath = path.resolve(pluginPath || '.');
        
                console.log(chalk.blue('📤 NetPad Plugin Publisher\n'));
                console.log(chalk.gray(`Plugin path: ${targetPath}`));

                // Check authentication
                if (!auth.isAuthenticated()) {
                    console.log(chalk.red('❌ Authentication required'));
                    console.log(chalk.yellow('Please run "netpad-cli login" first'));
                    process.exit(1);
                }

                if (options.dryRun) {
                    console.log(chalk.yellow('🧪 Dry run mode - validation only\n'));
          
                    const validation = await pluginPublisher.validatePlugin(targetPath);
          
                    if (validation.isValid) {
                        console.log(chalk.green('\n✅ Plugin is valid and ready to publish!'));
                        console.log(chalk.gray(`Plugin: ${validation.manifest.displayName}`));
                        console.log(chalk.gray(`Version: ${validation.manifest.version}`));
                        console.log(chalk.gray(`Size: ${Math.round(validation.pluginSize / 1024)}KB`));
                    } else {
                        console.log(chalk.red('\n❌ Plugin validation failed:'));
                        validation.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
                        process.exit(1);
                    }
                } else {
                    // Full publish
                    await pluginPublisher.publishFromPath(targetPath);
          
                    console.log(chalk.green('\n🎉 Plugin published successfully!'));
                    console.log(chalk.yellow('\n💡 Next steps:'));
                    console.log(chalk.gray('• Test your plugin in NetPad'));
                    console.log(chalk.gray('• Share the plugin with your team'));
                    console.log(chalk.gray('• Check plugin analytics in NetPad dashboard'));
                }

            } catch (error) {
                console.error(chalk.red('\n❌ Plugin publish failed:'), error.message);
        
                if (error.code === 'UNAUTHENTICATED') {
                    console.log(chalk.yellow('\n💡 Please run "netpad-cli login" to authenticate'));
                } else if (error.code === 'CONNECTION_ERROR') {
                    console.log(chalk.yellow('\n💡 Check your internet connection and NetPad instance URL'));
                } else if (error.message.includes('validation')) {
                    console.log(chalk.yellow('\n💡 Fix validation errors and try again'));
                    console.log(chalk.gray('Run with --dry-run to see detailed validation results'));
                }
        
                process.exit(1);
            }
        });

    pluginCmd
        .command('list')
        .description('List available plugins')
        .option('--scope <scope>', 'Filter by scope (private, organization, public)')
        .option('--category <category>', 'Filter by category')
        .option('--format <format>', 'Output format (table, json)', 'table')
        .action(async (options) => {
            try {
                console.log(chalk.blue('📋 NetPad Plugins\n'));

                // Check authentication
                if (!auth.isAuthenticated()) {
                    console.log(chalk.red('❌ Authentication required'));
                    console.log(chalk.yellow('Please run "netpad-cli login" first'));
                    process.exit(1);
                }

                console.log(chalk.yellow('🔍 Fetching plugins...'));

                // Get plugins (this will use MCP tools for now)
                const pluginsResponse = await pluginPublisher.api.getPlugins();
                let plugins = Array.isArray(pluginsResponse) ? pluginsResponse : pluginsResponse.tools || [];

                // Filter plugins
                if (options.scope) {
                    plugins = plugins.filter(plugin => plugin.scope === options.scope);
                }

                if (options.category) {
                    plugins = plugins.filter(plugin => plugin.category === options.category);
                }

                if (plugins.length === 0) {
                    console.log(chalk.yellow('No plugins found matching your criteria.'));
                    console.log(chalk.gray('Try creating a plugin with: netpad-cli plugin create <name>'));
                    return;
                }

                // Display plugins
                if (options.format === 'json') {
                    console.log(JSON.stringify(plugins, null, 2));
                } else {
                    // Table format
                    console.log(chalk.green(`\n✅ Found ${plugins.length} plugin(s)\n`));
          
                    // Simple table-like output
                    const maxNameLength = Math.max(...plugins.map(p => (p.name || p.id || 'Unknown').length), 'NAME'.length);
                    const maxVersionLength = Math.max(...plugins.map(p => (p.version || '1.0.0').length), 'VERSION'.length);
          
                    // Header
                    console.log(chalk.bold(
                        'NAME'.padEnd(maxNameLength + 2) +
            'VERSION'.padEnd(maxVersionLength + 2) +
            'SCOPE'.padEnd(12) +
            'CATEGORY'.padEnd(12) +
            'DESCRIPTION'
                    ));
          
                    console.log('-'.repeat(maxNameLength + maxVersionLength + 40));
          
                    // Rows
                    plugins.forEach(plugin => {
                        const name = (plugin.name || plugin.id || 'Unknown').padEnd(maxNameLength + 2);
                        const version = (plugin.version || '1.0.0').padEnd(maxVersionLength + 2);
                        const scope = (plugin.scope || 'unknown').padEnd(12);
                        const category = (plugin.category || 'unknown').padEnd(12);
                        const description = plugin.description || 'No description';
            
                        console.log(chalk.gray(name + version + scope + category) + description);
                    });
          
                    console.log(chalk.gray(`\nTotal: ${plugins.length} plugins`));
                }

                // Show available commands
                console.log(chalk.yellow('\n💡 Available commands:'));
                console.log(chalk.gray('• netpad-cli plugin create <name>    - Create a new plugin'));
                console.log(chalk.gray('• netpad-cli plugin publish [path]   - Publish a plugin'));
                console.log(chalk.gray('• netpad-cli plugin list --help      - See more list options'));

            } catch (error) {
                console.error(chalk.red('\n❌ Failed to list plugins:'), error.message);
        
                if (error.code === 'UNAUTHENTICATED') {
                    console.log(chalk.yellow('\n💡 Please run "netpad-cli login" to authenticate'));
                } else if (error.code === 'CONNECTION_ERROR') {
                    console.log(chalk.yellow('\n💡 Check your internet connection and NetPad instance URL'));
                }
        
                process.exit(1);
            }
        });
}; 