const { program } = require('commander');
const { version } = require('../package.json');

program.version(version);

require('./plugin')(program);
require('./workflow')(program);
require('./marketplace')(program);
require('./dev')(program);
require('./login')(program);
require('./config')(program);
require('./status')(program);
require('./logs')(program);
require('./help')(program);

program.parse(process.argv); 