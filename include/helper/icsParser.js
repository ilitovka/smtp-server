const iCal = require('node-ical');

const icsParse = function () {};

/**
 * @param {string} text
 *
 * @return {array}
 *
 * */
icsParse.prototype.parse = function(text) {
    const directEvents = iCal.sync.parseICS(text);
    return directEvents;
};

module.exports = icsParse;
