const iCal = require('node-ical');
const log = require('../libs/log').log;

const icsParse = function () {};

/**
 * @param {string} text
 *
 * @return {array}
 *
 * */
icsParse.prototype.parse = function(text) {
    return iCal.sync.parseICS(text);
};

icsParse.prototype.parseFirst = function(text) {
    let events = this.parse(text);
    if (Object.keys(events).length > 0) {
        for (let k in events) {
            if (events.hasOwnProperty(k)) {
                const event = events[k];
                if (event.type === 'VEVENT') {
                    log.info('Attachment parsed successfully');

                    return event;
                }
            } else {
                log.info('Couldn\'t parse attachment object');
            }
        }
    } else {
        log.info('Couldn\'t parse attachment');
    }

    return false;
};

module.exports = icsParse;
