module.exports = (program) => {
    program
        .command('status')
        .description('Show NetPad status (coming soon)')
        .action(() => {
            console.log('Status command coming soon!');
        });
}; 