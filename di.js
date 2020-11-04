/**
 * Initializing DI container.
 */

let params = process.argv.slice(2),
  argv = {};

//init .env variables
require('dotenv').config();

// loading service config
let defaults    = require('./config.json');

for (let i = 0; i < params.length; i = i + 2) {
  if (params[i].substring(0, 2) === '--') {
    argv[params[i].substring(2)] = params[(i + 1)];
  }
}

// trying to apply environment variable onto default config
require('./includes/environment')(process.env, defaults);

// merging final config from default values and CLI arguments
const config = Object.assign(defaults, argv);

const di = new (require('simple-mdi'))(require('fs-extra'), require('./di.config.json'), argv.type || 'test', __dirname);

di.addDependency('config', config);

di.addDependency('dir', __dirname);

module.exports = di;
