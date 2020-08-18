/**
 * Initializing DI container.
 */
const di = new (require('simple-mdi'))(require('fs-extra'), require('./di.config.json'), process.env.type || 'test', __dirname);

di.addDependency('dir', __dirname);

module.exports = di;
