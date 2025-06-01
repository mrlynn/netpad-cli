module.exports = (program) => {
    program
        .command('logs')
        .description('Show logs/debug info (coming soon)')
        .action(() => {
            console.log('Logs command coming soon!');
        });
}; 