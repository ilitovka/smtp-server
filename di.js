/**
 * Initializing DI container.
 */

let params = process.argv.slice(2),
  argv = {};
for (let i = 0; i < params.length; i = i + 2) {
  if (params[i].substring(0, 2) === '--') {
    argv[params[i].substring(2)] = params[(i + 1)];
  }
}

const di = new (require('simple-mdi'))(require('fs-extra'), require('./di.config.json'), argv.type || 'test', __dirname);

di.addDependency('dir', __dirname);

module.exports = di;
