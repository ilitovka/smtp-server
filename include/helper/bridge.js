var calendar = require("../../handler/calendar");
const log = require('../../libs/log').log;

const Bridge = function() {};

/**
 * @param {string} attachment
 * @param {string} parsedICS
 *
 * @return {boolean}
 *
 * */
Bridge.prototype.send = function (attachment, parsedICS) {
    if (parsedICS.uid === undefined) {
        log.info('uid is undefined');
        return false;
    }
    if (parsedICS.ORGID === undefined) {
        parsedICS.ORGID = null;
        log.info('ORGID is undefined');
        //return false;
    }

    calendar.saveICS({
        UID:        parsedICS.uid,
        calendarId: parsedICS.ORGID,
        content:    attachment,
        parsed:     parsedICS,
    });

    log.info('Event ID:' + parsedICS.uid + ' parsed and saved to calendar ID:' + parsedICS.ORGID);

    return true;
};

module.exports = Bridge;
