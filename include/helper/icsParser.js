const iCal = require('node-ical');

const icsParse = function () {};

icsParse.prototype.parse = function(text) {
    const directEvents = ical.sync.parseICS(text);
    return directEvents;
};

module.exports = icsParse;
