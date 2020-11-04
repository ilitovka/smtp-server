'use strict'

var callbacks = {
    log: false,
    error: false,
    warn: false
};

module.exports.setCallbacks = function (cbs) {
    callbacks = cbs;
};

module.exports.log = function (...args) {
    if (callbacks.log) callbacks.log.apply(null, args);
};

module.exports.error = function (...args) {
    if (callbacks.error) callbacks.error.apply(null, args);
};

module.exports.warn = function (...args) {
    if (callbacks.warn) callbacks.warn.apply(null, args);
};

module.exports.Console = function () {
    this.log = function (...args) {
        if (callbacks.log) callbacks.log.apply(null, args);
    };

    this.error = function (...args) {
        if (callbacks.error) callbacks.error.apply(null, args);
    };

    this.warn = function (...args) {
        if (callbacks.warn) callbacks.warn.apply(null, args);
    };
};