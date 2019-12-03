const ics = require('ics');
const log = require('../../libs/log').log;
const moment = require('moment');

const icsCreate = function (event) {

    const eventMerged = {
        start: moment(event.start).format('YYYY-M-D-H-m').split("-"),
        end: moment(event.end).format('YYYY-M-D-H-m').split("-"),
        status: event.status,
        organizer: {
            name: event.organizer.params.CN,
            email: event.organizer.val.replace('mailto:', '')
        },
        'X-ORGID': event.ORGID
    };

    let attendeens = [];
    for (let i = 0; i < event.attendee.length; i++) {
        attendeens.push(
            {...{email: event.attendee[i].val}, ...event.attendee[i].params}
        );
    }
    eventMerged.attendees = attendeens;

    ics.createEvent(eventMerged, (error, value) => {
        if (error) {
            log.info(error)
            return;
        }

        log.info(value)
    })
};

module.exports = icsCreate;
