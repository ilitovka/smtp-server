let Di = function () {
  /**
   * Initializing DI container.
   */
  this.di = new (require('simple-mdi'))(require('fs-extra'), require('./di.config.json'), process.env.type || 'test', __dirname);

  this.di.addDependency('dir', __dirname);
};

module.exports = new Di();
