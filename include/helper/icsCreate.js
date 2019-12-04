const ics = require('ics');
const log = require('../../libs/log').log;
const moment = require('moment');

const icsCreate = function (event) {
    try {
        const eventMerged = {
            start: moment(event.start).format('YYYY-M-D-H-m').split("-"),
            end: moment(event.end).format('YYYY-M-D-H-m').split("-"),
            status: event.status,
            organizer: {
                name: event.organizer.params.CN,
                email: event.organizer.val.replace('mailto:', '')
            }
        };

        let attendees = [];
        for (let i = 0; i < event.attendee.length; i++) {
            let attendee = event.attendee[i];
            attendees.push(
                {
                    email:      attendee.val.replace('mailto:', ''),
                    rsvp:       attendee.params.PARTSTAT,
                    partstat:   attendee.params.PARTSTAT,
                    role:       attendee.params.ROLE
                }
            );
        }
        eventMerged.attendees = attendees;

        return ics.createEvent(eventMerged).value;
    } catch (e) {
        return '';
    }
};

module.exports = icsCreate;
