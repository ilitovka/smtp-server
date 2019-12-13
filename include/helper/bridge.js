const calendar = require("../../handler/calendar");
const log = require('../../libs/log').log;
const sfApi = require('../../include/sf-api');

const Bridge = function() {
    this.sfApi = new sfApi();
};

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

    //Save to caldav
    calendar.saveICS({
        UID:        parsedICS.uid,
        calendarId: parsedICS.ORGID,
        content:    attachment,
        parsed:     parsedICS,
    }).then(result => {
        log.info(result);
        if (parsedICS.ORGID !== undefined) {
            //send to SalesForce
            this.sfApi.sendAttendeeStatuses(parsedICS).then(result => {
                log.debug(result);
            }).catch(err => {
                log.debug(err);
            });
        }
        log.info('Event ID:' + parsedICS.uid + ' parsed and saved to calendar ID:' + parsedICS.ORGID);
    }).catch(err => {
        log.debug(err);
    });

    return true;
};

module.exports = Bridge;
