var calendar = require("../../handler/calendar");

const Bridge = function() {};

//TODO::merge existing ICS with new.
/**
 * @param {string} attachment
 * @param {string} parsedICS
 *
 * @return {boolean}
 *
 * */
Bridge.prototype.send = function (attachment, parsedICS) {
    if (parsedICS.UID === undefined) {
        return false;
    }

    calendar.saveICS({
        UID:        parsedICS.UID,
        calendarId: null,
        content:    attachment
    });

    return true;
};

module.exports = Bridge;
