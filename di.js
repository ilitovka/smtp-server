let Di = function () {
  // loading basic dependencies
  this.Fs = require('fs-extra');

  // merging final config from default values and CLI arguments
  this.config = require('./config.js').config;

  /**
   * Initializing DI container.
   */
  this.di = new (require('simple-mdi'))(this.Fs, require('./di.config.json'), this.config.type, __dirname);

  // adding config so it will be retrievable using DI as well and we will need to pass only instance of DI container everywhere
  this.di.addDependency('config', this.config);
  this.di.addDependency('dir', __dirname);
};

module.exports = new Di();
