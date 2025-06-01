const chalk = require('chalk');

module.exports = (program) => {
    program
        .command('help')
        .description('Show help and usage info')
        .action(() => {
            console.log(chalk.blue('🚀 NetPad CLI Help\n'));
            
            console.log(chalk.yellow('📋 Available Commands:\n'));
            
            console.log(chalk.green('🔌 Plugin Management:'));
            console.log('  netpad-cli plugin create <name>       Create a new plugin');
            console.log('  netpad-cli plugin publish [path]      Publish plugin to NetPad');
            console.log('  netpad-cli plugin publish --dry-run   Validate plugin without publishing');
            console.log('  netpad-cli plugin publish --debug     Show detailed debug information');
            console.log('  netpad-cli plugin list                List available plugins');
            console.log('  netpad-cli plugin list --scope <type> Filter by scope (private/org/public)');
            
            console.log(chalk.green('\n🔐 Authentication:'));
            console.log('  netpad-cli login                      Interactive login');
            console.log('  netpad-cli login --google             Login with Google OAuth');
            console.log('  netpad-cli login --github             Login with GitHub OAuth');
            console.log('  netpad-cli logout                     Clear authentication');
            console.log('  netpad-cli whoami                     Show authentication status');
            
            console.log(chalk.green('\n🔧 Configuration:'));
            console.log('  netpad-cli config show                Show current configuration');
            console.log('  netpad-cli config set <key> <value>   Set configuration value');
            console.log('  netpad-cli config unset <key>         Remove configuration value');
            console.log('  netpad-cli config reset               Reset all configuration');
            console.log('  netpad-cli config edit                Edit configuration file');
            
            console.log(chalk.green('\n🔄 Workflow Management:'));
            console.log(chalk.gray('  netpad-cli workflow scaffold [type]   Scaffold workflow (coming soon)'));
            console.log(chalk.gray('  netpad-cli workflow export <id>       Export workflow (coming soon)'));
            console.log(chalk.gray('  netpad-cli workflow import <file>     Import workflow (coming soon)'));
            console.log(chalk.gray('  netpad-cli workflow validate <file>   Validate workflow (coming soon)'));
            
            console.log(chalk.green('\n🏪 Marketplace:'));
            console.log(chalk.gray('  netpad-cli marketplace search <query> Search plugins (coming soon)'));
            console.log(chalk.gray('  netpad-cli marketplace install <name> Install plugin (coming soon)'));
            
            console.log(chalk.green('\n🛠️ Development & Utilities:'));
            console.log(chalk.gray('  netpad-cli dev                        Local development (coming soon)'));
            console.log(chalk.gray('  netpad-cli status                     Show NetPad status (coming soon)'));
            console.log(chalk.gray('  netpad-cli logs                       Show logs/debug (coming soon)'));
            
            console.log(chalk.green('\n❓ Help & Information:'));
            console.log('  netpad-cli --version                  Show CLI version');
            console.log('  netpad-cli --help                     Show this help');
            console.log('  netpad-cli <command> --help           Show command-specific help');
            
            console.log(chalk.yellow('\n🌍 Environment Variables:'));
            console.log('  NETPAD_URL                            Override NetPad instance URL');
            console.log('  NETPAD_BASE_URL                       Alternative URL variable');
            console.log('  EDITOR                                Default editor for config edit');
            
            console.log(chalk.yellow('\n📁 Configuration:'));
            console.log('  Config file: ~/.netpadrc');
            console.log('  Default URL: https://netpad.io');
            
            console.log(chalk.blue('\n🔗 Links:'));
            console.log('  GitHub: https://github.com/mrlynn/netpad-cli');
            console.log('  npm: https://www.npmjs.com/package/netpad-cli');
            console.log('  NetPad: https://netpad.io');
        });
}; 