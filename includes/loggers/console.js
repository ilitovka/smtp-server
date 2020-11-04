'use strict';

/**
 * Logger module which writes messages into stdout && stderr
 * @Constructor
 *
 * @param {Object} Console
 */
let Logger = function (Console) {
    this.connector = new (Console.Console)(process.stdout, process.stderr);
};

/**
 * Implementation of log function
 *
 * @param args
 * @void
 */
Logger.prototype.log = function (...args) {
    this.connector.log.apply(this.connector, args);
};

/**
 * Implementation of error function
 *
 * @param args
 * @void
 */
Logger.prototype.error = function (...args) {
    this.connector.error.apply(this.connector, args);
};

/**
 * Implementation of warn function
 *
 * @param args
 * @void
 */
Logger.prototype.warn = function (...args) {
    this.connector.warn.apply(this.connector, args);
};

module.exports = Logger;