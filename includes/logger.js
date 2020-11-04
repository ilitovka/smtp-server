'use strict';

/**
 * @author Vladyslav Litovka vlitovka@corevalue.net
 * Logger layer, implements log, warn && error methods as it does Console.
 * @Constructor
 */
let Logger = function (di) {
    this.di             = di;
    this.connectors     = [];
    this.config         = this.di.get('config');

    if (this.config === undefined || this.config.log === undefined || this.config.log.connectors === undefined || !Array.isArray(this.config.log.connectors)) {
        throw new Error('Unable to initialize logger');
    }

    // getting all configured loggers
    this.config.log.connectors.forEach(dependency => this.connectors.push(this.di.get(dependency)));
};

/**
 * Implementation of log function
 *
 * @param mixed args
 * @void
 */
Logger.prototype.log = function (...args) {
    this.connectors.forEach(logger => logger.log.apply(logger, args));
};

/**
 * Implementation of error function
 *
 * @param mixed args
 * @void
 */
Logger.prototype.error = function (...args) {
    this.connectors.forEach(logger => logger.error.apply(logger, args));
};

/**
 * Implementation of warn function
 *
 * @param mixed args
 * @void
 */
Logger.prototype.warn = function (...args) {
    this.connectors.forEach(logger => logger.warn.apply(logger, args));
};

module.exports = Logger;