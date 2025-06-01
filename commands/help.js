module.exports = (program) => {
    program
        .command('help')
        .description('Show help and usage info')
        .action(() => {
            console.log('NetPad CLI Help\n\nCommands:\n  plugin create <name>\n  plugin publish [path]\n  plugin list\n  login\n  status\n  workflow ... (coming soon)\n  marketplace ... (coming soon)\n  dev ... (coming soon)\n  logs ... (coming soon)\n');
        });
}; 