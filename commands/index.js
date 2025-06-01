const { program } = require('commander');

require('./plugin')(program);
require('./workflow')(program);
require('./marketplace')(program);
require('./dev')(program);
require('./login')(program);
require('./status')(program);
require('./logs')(program);
require('./help')(program);

program.parse(process.argv); 